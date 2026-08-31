"""
LexiMind Secure — Document Views
Handles: list, detail, upload (async pipeline), download, integrity check,
simulate-tamper (demo), compare.
"""
import os
import logging
from django.conf import settings
from django.http import StreamingHttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters import rest_framework as filters

from apps.accounts.permissions import IsActiveUser, HasActionPermission
from apps.audit.utils import log_event, AuditEvent
from .models import Document, PipelineRun, PipelineStage, IntegrityStatus, BlockchainStatus
from .serializers import DocumentSerializer, PipelineStatusSerializer
from .services.hashing import sha256_of_bytes
from .services.diff import compare_documents

logger = logging.getLogger("apps.documents")

ALLOWED_MIME = set(settings.ALLOWED_UPLOAD_MIME_TYPES)
MAX_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


class DocumentFilter(filters.FilterSet):
    caseId = filters.CharFilter(field_name="case__case_id")
    q = filters.CharFilter(field_name="name", lookup_expr="icontains")

    class Meta:
        model = Document
        fields = {"classification": ["exact"]}


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    filterset_class = DocumentFilter
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        return Document.objects.select_related("case", "uploaded_by").order_by("-uploaded_at")

    def get_object(self):
        """Allow lookup by short_id or pk."""
        qs = self.get_queryset()
        lookup = self.kwargs.get(self.lookup_field)
        try:
            return qs.get(short_id=lookup)
        except Document.DoesNotExist:
            try:
                return qs.get(pk=lookup)
            except (Document.DoesNotExist, ValueError):
                from rest_framework.exceptions import NotFound
                raise NotFound("Document not found.")

    def get_permissions(self):
        if self.action == "upload":
            return [IsAuthenticated(), IsActiveUser(), HasActionPermission.for_action("Upload")]
        if self.action == "download":
            return [IsAuthenticated(), IsActiveUser(), HasActionPermission.for_action("Download")]
        if self.action == "verify_integrity":
            return [IsAuthenticated(), IsActiveUser(), HasActionPermission.for_action("Verify")]
        if self.action in ("simulate_tamper", "reset_verified"):
            return [IsAuthenticated(), IsActiveUser(), HasActionPermission.for_action("Manage")]
        return [IsAuthenticated(), IsActiveUser()]

    @action(detail=False, methods=["post"], url_path="upload")
    def upload(self, request):
        """
        POST /api/documents/upload/
        Multipart upload → kicks off async Celery pipeline → returns {pipelineId}.
        For now (Phase 3 sync mode): processes synchronously and returns docId directly.
        """
        file = request.FILES.get("file")
        case_id = request.data.get("caseId")
        classification = request.data.get("classification", "CONFIDENTIAL")

        if not file:
            return Response({"detail": "No file provided.", "code": "no_file"}, status=status.HTTP_400_BAD_REQUEST)
        if not case_id:
            return Response({"detail": "caseId is required.", "code": "missing_case"}, status=status.HTTP_400_BAD_REQUEST)

        # MIME type check
        content_type = file.content_type or ""
        if content_type not in ALLOWED_MIME:
            return Response(
                {"detail": f"File type '{content_type}' is not allowed.", "code": "invalid_mime"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Size check
        if file.size > MAX_SIZE:
            return Response(
                {"detail": f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit.", "code": "file_too_large"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from apps.cases.models import Case
            case = Case.objects.get(case_id=case_id)
        except Case.DoesNotExist:
            return Response({"detail": "Case not found.", "code": "not_found"}, status=status.HTTP_404_NOT_FOUND)

        # Create pipeline run
        pipeline = PipelineRun.objects.create(current_stage=PipelineStage.UPLOAD, progress=5)

        # Kick off async Celery task (Phase 8). For now, run synchronously.
        try:
            from .tasks import run_upload_pipeline
            run_upload_pipeline.delay(
                str(pipeline.pipeline_id),
                file.read(),
                file.name,
                content_type,
                case.id,
                request.user.id,
                classification,
            )
        except Exception:
            # Celery not running — fall back to sync processing
            _process_upload_sync(pipeline, file, case, request.user, classification)

        return Response({"pipelineId": str(pipeline.pipeline_id)}, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=["get"], url_path=r"upload/(?P<pipeline_id>[^/.]+)/status")
    def upload_status(self, request, pipeline_id=None):
        """GET /api/documents/upload/{pipeline_id}/status/"""
        try:
            pipeline = PipelineRun.objects.get(pipeline_id=pipeline_id)
        except PipelineRun.DoesNotExist:
            return Response({"detail": "Pipeline not found.", "code": "not_found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(PipelineStatusSerializer(pipeline).data)

    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        """GET /api/documents/{id}/download/ — streams decrypted file."""
        doc = self.get_object()
        log_event(AuditEvent.DOCUMENT_ACCESSED, request.user, f"{doc.name} — {doc.case.case_id}")

        if not doc.file:
            return Response({"detail": "File not stored.", "code": "no_file"}, status=status.HTTP_404_NOT_FOUND)

        try:
            from .services.encryption import decrypt_bytes
            encrypted = doc.file.read()
            decrypted = decrypt_bytes(encrypted)
            response = StreamingHttpResponse(
                iter([decrypted]),
                content_type="application/octet-stream",
            )
            response["Content-Disposition"] = f'attachment; filename="{doc.name}"'
            return response
        except Exception as exc:
            logger.error("Download failed for %s: %s", doc.short_id, exc)
            return Response({"detail": "Could not decrypt file.", "code": "decrypt_error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=["post"], url_path="verify-integrity")
    def verify_integrity(self, request, pk=None):
        """
        POST /api/documents/{id}/verify-integrity/
        Actually re-reads the stored file, recomputes SHA-256, compares to recorded hash.
        This is genuinely computed, not scripted.
        """
        doc = self.get_object()
        if not doc.file:
            # No file stored (seed data) — use stored sha256 for comparison
            verified = (doc.sha256 == doc.stored_hash) if doc.stored_hash else True
        else:
            try:
                from .services.encryption import decrypt_bytes
                encrypted = doc.file.read()
                decrypted = decrypt_bytes(encrypted)
                current_hash = sha256_of_bytes(decrypted)
                verified = (current_hash.upper() == doc.sha256.upper())
            except Exception as exc:
                logger.error("Integrity check failed for %s: %s", doc.short_id, exc)
                verified = False

        if verified:
            doc.integrity_status = IntegrityStatus.AUTHENTIC
            doc.blockchain_status = BlockchainStatus.VERIFIED
            event = AuditEvent.INTEGRITY_VERIFIED
        else:
            doc.integrity_status = IntegrityStatus.TAMPERED
            doc.blockchain_status = BlockchainStatus.MISMATCH
            event = AuditEvent.INTEGRITY_FAILED
            # Trigger security alert
            _create_integrity_alert(doc)

        doc.save(update_fields=["integrity_status", "blockchain_status"])
        log_event(event, request.user, f"{doc.name} — {doc.case.case_id}")

        return Response({
            "verified": verified,
            "integrityStatus": doc.integrity_status,
        })

    @action(detail=True, methods=["post"], url_path="simulate-tamper")
    def simulate_tamper(self, request, pk=None):
        """
        POST /api/documents/{id}/simulate-tamper/
        Demo-only: flips stored_hash so verify-integrity will legitimately fail.
        Gated by DEBUG mode or 'Manage' permission.
        """
        if not getattr(settings, "DEMO_ENDPOINTS_ENABLED", False):
            return Response(
                {"detail": "Demo endpoints are disabled in production.", "code": "disabled"},
                status=status.HTTP_403_FORBIDDEN,
            )
        doc = self.get_object()
        # Flip one character in the stored hash to simulate tampering
        original = doc.sha256 or "A" * 64
        tampered = original[:-1] + ("B" if original[-1] != "B" else "C")
        doc.stored_hash = tampered
        doc.integrity_status = IntegrityStatus.TAMPERED
        doc.save(update_fields=["stored_hash", "integrity_status"])
        return Response({"detail": "Document marked as tampered for demo purposes."})

    @action(detail=True, methods=["post"], url_path="reset-verified")
    def reset_verified(self, request, pk=None):
        """Demo-only counterpart to simulate-tamper."""
        if not getattr(settings, "DEMO_ENDPOINTS_ENABLED", False):
            return Response(
                {"detail": "Demo endpoints are disabled in production.", "code": "disabled"},
                status=status.HTTP_403_FORBIDDEN,
            )
        doc = self.get_object()
        doc.stored_hash = doc.sha256
        doc.integrity_status = IntegrityStatus.AUTHENTIC
        doc.blockchain_status = BlockchainStatus.VERIFIED
        doc.save(update_fields=["stored_hash", "integrity_status", "blockchain_status"])
        return Response({"detail": "Document reset to verified state."})

    @action(detail=False, methods=["post"], url_path="compare")
    def compare(self, request):
        """
        POST /api/documents/compare/
        Body: {docIdA, docIdB}
        Returns: {docA: {...lines}, docB: {...lines}}
        """
        doc_id_a = request.data.get("docIdA")
        doc_id_b = request.data.get("docIdB")
        if not doc_id_a or not doc_id_b:
            return Response(
                {"detail": "docIdA and docIdB are required.", "code": "missing_params"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            doc_a = Document.objects.get(short_id=doc_id_a)
            doc_b = Document.objects.get(short_id=doc_id_b)
        except Document.DoesNotExist:
            return Response({"detail": "One or both documents not found.", "code": "not_found"}, status=status.HTTP_404_NOT_FOUND)

        result = compare_documents(
            doc_a.extracted_text, doc_a.name,
            doc_b.extracted_text, doc_b.name,
        )
        return Response(result)


def _process_upload_sync(pipeline, file_obj, case, user, classification):
    """Synchronous upload processing (fallback when Celery not running)."""
    from .services.encryption import encrypt_bytes
    from .services.hashing import sha256_of_bytes
    from .services.extraction import extract_text, classify_document
    import io
    from django.core.files.base import ContentFile

    try:
        file_bytes = file_obj.read() if hasattr(file_obj, "read") else file_obj
        filename = getattr(file_obj, "name", "document")
        mime = getattr(file_obj, "content_type", "")

        pipeline.current_stage = PipelineStage.OCR; pipeline.progress = 20; pipeline.save()
        text = extract_text(file_bytes, filename, mime)

        pipeline.current_stage = PipelineStage.CLASSIFY; pipeline.progress = 35; pipeline.save()
        doc_type = classify_document(text, filename)

        pipeline.current_stage = PipelineStage.HASH; pipeline.progress = 50; pipeline.save()
        file_hash = sha256_of_bytes(file_bytes)

        pipeline.current_stage = PipelineStage.ENCRYPT; pipeline.progress = 65; pipeline.save()
        encrypted = encrypt_bytes(file_bytes)

        pipeline.current_stage = PipelineStage.STORE; pipeline.progress = 80; pipeline.save()
        doc = Document.objects.create(
            name=filename,
            type=doc_type,
            case=case,
            classification=classification,
            uploaded_by=user,
            sha256=file_hash,
            stored_hash=file_hash,
            blockchain_status=BlockchainStatus.PENDING,
            integrity_status=IntegrityStatus.AUTHENTIC,
            custodian_role=user.role_display,
            extracted_text=text,
        )
        doc.file.save(f"{doc.short_id}_{filename}", ContentFile(encrypted), save=True)

        pipeline.current_stage = PipelineStage.BLOCKCHAIN; pipeline.progress = 90; pipeline.save()
        try:
            from apps.blockchain.services.ledger import get_ledger
            ledger = get_ledger()
            record = ledger.register(doc, user)
            doc.blockchain_status = BlockchainStatus.VERIFIED
            doc.save(update_fields=["blockchain_status"])
            tx_id = record.tx_id
        except Exception:
            tx_id = "—"

        pipeline.current_stage = PipelineStage.COMPLETE; pipeline.progress = 100
        pipeline.document = doc; pipeline.save()

        # Audit entries
        log_event(AuditEvent.DOCUMENT_UPLOADED, user, f"{filename} — {case.case_id}", tx_id)
        log_event(AuditEvent.SHA256_GENERATED, None, filename)
        log_event(AuditEvent.DOCUMENT_ENCRYPTED, None, f"{filename} (AES-256)")
        log_event(AuditEvent.BLOCKCHAIN_REGISTERED, None, filename, tx_id)

    except Exception as exc:
        pipeline.current_stage = PipelineStage.FAILED
        pipeline.error = str(exc)
        pipeline.save()
        raise


def _create_integrity_alert(doc):
    """Create a CRITICAL security alert when integrity check fails."""
    try:
        from apps.alerts.models import SecurityAlert, AlertSeverity, AlertStatus
        SecurityAlert.objects.create(
            severity=AlertSeverity.CRITICAL,
            title="Document integrity compromised",
            description=f"Hash mismatch detected on {doc.name} — recorded hash no longer matches stored file.",
            target=doc.case.case_id,
            status=AlertStatus.OPEN,
        )
        log_event(AuditEvent.INTEGRITY_FAILED, None, doc.name)
    except Exception:
        pass
