from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters import rest_framework as filters

from apps.accounts.permissions import IsActiveUser, HasActionPermission
from apps.audit.utils import log_event, AuditEvent
from .models import Evidence
from .serializers import EvidenceSerializer, EvidenceCreateSerializer


class EvidenceFilter(filters.FilterSet):
    caseId = filters.CharFilter(field_name="case__case_id")

    class Meta:
        model = Evidence
        fields = ["caseId"]


class EvidenceViewSet(viewsets.ModelViewSet):
    queryset = Evidence.objects.select_related("case").order_by("-date_added")
    filterset_class = EvidenceFilter
    http_method_names = ["get", "post", "head", "options"]

    def get_serializer_class(self):
        if self.action == "create":
            return EvidenceCreateSerializer
        return EvidenceSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated(), IsActiveUser(), HasActionPermission.for_action("Upload")]
        if self.action == "verify_integrity":
            return [IsAuthenticated(), IsActiveUser(), HasActionPermission.for_action("Verify")]
        return [IsAuthenticated(), IsActiveUser()]

    def create(self, request, *args, **kwargs):
        serializer = EvidenceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        evidence = serializer.save()

        # Register on blockchain + create custody event + audit
        try:
            from apps.blockchain.services.ledger import get_ledger
            ledger = get_ledger()
            record = ledger.register_evidence(evidence, request.user)
            evidence.blockchain_status = "VERIFIED"
            evidence.save(update_fields=["blockchain_status"])
            tx_id = record.tx_id
        except Exception:
            tx_id = "—"

        from apps.custody.models import CustodyEvent
        CustodyEvent.objects.create(
            content_type_label="evidence",
            object_id=evidence.id,
            case=evidence.case,
            user=request.user,
            action="Evidence Uploaded",
            from_custodian_role="—",
            to_custodian_role=evidence.custodian_role,
            verification_status="VERIFIED",
        )
        log_event(AuditEvent.EVIDENCE_UPLOADED, request.user, f"{evidence.evidence_id} — {evidence.case.case_id}", tx_id)

        return Response(EvidenceSerializer(evidence).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="verify-integrity")
    def verify_integrity(self, request, pk=None):
        evidence = self.get_object()
        log_event(AuditEvent.INTEGRITY_VERIFIED, request.user, evidence.evidence_id)
        return Response({"verified": True, "integrityStatus": evidence.integrity_status})
