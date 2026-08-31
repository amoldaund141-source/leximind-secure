"""
LexiMind Secure — Upload Pipeline Celery Tasks
7 stages mirroring the Upload.jsx stepper UI:
  Upload → OCR → Classification → SHA-256 Hash → AES-256 Encrypt → Secure Storage → Blockchain
"""
import logging
from celery import shared_task
from django.core.files.base import ContentFile

from .models import Document, PipelineRun, PipelineStage, IntegrityStatus, BlockchainStatus
from .services.encryption import encrypt_bytes
from .services.hashing import sha256_of_bytes
from .services.extraction import extract_text, classify_document
from apps.audit.utils import log_event, AuditEvent

logger = logging.getLogger("apps.documents.tasks")


@shared_task(bind=True, max_retries=3)
def run_upload_pipeline(
    self,
    pipeline_id: str,
    file_bytes: bytes,
    filename: str,
    mime_type: str,
    case_pk: int,
    user_pk: int,
    classification: str,
):
    """
    Full 7-stage async pipeline. Updates PipelineRun.current_stage at each step
    so the polling endpoint (/api/documents/upload/{id}/status/) reflects real progress.
    """
    try:
        pipeline = PipelineRun.objects.get(pipeline_id=pipeline_id)
        from apps.cases.models import Case
        from apps.accounts.models import User
        case = Case.objects.get(pk=case_pk)
        user = User.objects.get(pk=user_pk)

        # Stage 1: Upload (already done — just mark progress)
        _set_stage(pipeline, PipelineStage.UPLOAD, 10)

        # Stage 2: OCR / Text Extraction
        _set_stage(pipeline, PipelineStage.OCR, 25)
        text = extract_text(file_bytes, filename, mime_type)

        # Stage 3: Classification
        _set_stage(pipeline, PipelineStage.CLASSIFY, 40)
        doc_type = classify_document(text, filename)

        # Stage 4: SHA-256 Hash
        _set_stage(pipeline, PipelineStage.HASH, 55)
        file_hash = sha256_of_bytes(file_bytes)

        # Stage 5: AES-256 Encryption
        _set_stage(pipeline, PipelineStage.ENCRYPT, 70)
        encrypted = encrypt_bytes(file_bytes)

        # Stage 6: Secure Storage
        _set_stage(pipeline, PipelineStage.STORE, 82)
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

        # Stage 7: Blockchain Registration
        _set_stage(pipeline, PipelineStage.BLOCKCHAIN, 92)
        tx_id = "—"
        try:
            from apps.blockchain.services.ledger import get_ledger
            ledger = get_ledger()
            record = ledger.register(doc, user)
            doc.blockchain_status = BlockchainStatus.VERIFIED
            doc.save(update_fields=["blockchain_status"])
            tx_id = record.tx_id
        except Exception as exc:
            logger.warning("Blockchain registration failed: %s", exc)

        # Complete
        pipeline.current_stage = PipelineStage.COMPLETE
        pipeline.progress = 100
        pipeline.document = doc
        pipeline.save()

        # Audit log entries (matching seed a1-a4 exactly)
        log_event(AuditEvent.DOCUMENT_UPLOADED, user, f"{filename} — {case.case_id}", tx_id)
        log_event(AuditEvent.SHA256_GENERATED, None, filename)
        log_event(AuditEvent.DOCUMENT_ENCRYPTED, None, f"{filename} (AES-256)")
        log_event(AuditEvent.BLOCKCHAIN_REGISTERED, None, filename, tx_id)

        # Custody event
        from apps.custody.models import CustodyEvent
        CustodyEvent.objects.create(
            content_type_label="document",
            object_id=doc.id,
            case=case,
            user=user,
            action="Evidence Uploaded",
            from_custodian_role="—",
            to_custodian_role=user.role_display,
            verification_status="VERIFIED",
        )

        # Trigger AI analysis asynchronously
        trigger_ai_analysis.delay(doc.id)

        logger.info("Upload pipeline complete: %s (doc=%s, tx=%s)", pipeline_id, doc.short_id, tx_id[:20] if tx_id != "—" else "—")

    except Exception as exc:
        logger.error("Upload pipeline failed: %s", exc)
        try:
            pipeline = PipelineRun.objects.get(pipeline_id=pipeline_id)
            pipeline.current_stage = PipelineStage.FAILED
            pipeline.error = str(exc)
            pipeline.save()
        except Exception:
            pass
        raise self.retry(exc=exc, countdown=5)


@shared_task
def trigger_ai_analysis(doc_pk: int):
    """Async AI insight generation triggered after upload completes."""
    try:
        doc = Document.objects.get(pk=doc_pk)
        from apps.ai.services.engine import get_engine
        from apps.ai.models import DocumentInsight
        engine = get_engine()
        data = engine.summarize_document(doc)
        DocumentInsight.objects.update_or_create(
            document=doc,
            defaults={
                "summary": data.get("summary", ""),
                "entities": data.get("entities", {}),
                "important_dates": data.get("importantDates", []),
                "findings": data.get("findings", []),
                "related_doc_names": data.get("relatedDocs", []),
            },
        )
        logger.info("AI analysis complete for doc %s", doc.short_id)
    except Exception as exc:
        logger.warning("AI analysis failed for doc %s: %s", doc_pk, exc)


def _set_stage(pipeline: PipelineRun, stage: str, progress: int):
    pipeline.current_stage = stage
    pipeline.progress = progress
    pipeline.save(update_fields=["current_stage", "progress", "updated_at"])
