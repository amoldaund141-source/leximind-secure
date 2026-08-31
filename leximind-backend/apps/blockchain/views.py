from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import BlockchainRecord
from .serializers import BlockchainRecordSerializer
from .services.ledger import get_ledger
from apps.accounts.permissions import IsActiveUser
from apps.audit.utils import log_event, AuditEvent


class BlockchainRecordViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlockchainRecord.objects.select_related("document", "evidence", "actor")
    serializer_class = BlockchainRecordSerializer
    permission_classes = [IsAuthenticated, IsActiveUser]


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsActiveUser])
def verify_hash(request):
    """
    POST /api/blockchain/verify/
    Body: {documentId}
    Returns: {verified, reason?, record}
    Matches verifyHash() in api.js exactly.
    """
    document_id = request.data.get("documentId")
    if not document_id:
        return Response({"detail": "documentId is required.", "code": "missing_param"}, status=status.HTTP_400_BAD_REQUEST)

    ledger = get_ledger()
    result = ledger.verify(document_id)

    serialized_record = None
    if result["record"]:
        serialized_record = BlockchainRecordSerializer(result["record"]).data

    log_event(
        AuditEvent.INTEGRITY_VERIFIED if result["verified"] else AuditEvent.INTEGRITY_FAILED,
        request.user,
        f"Blockchain verify: {document_id}",
    )

    return Response({
        "verified": result["verified"],
        "reason": result.get("reason"),
        "record": serialized_record,
    })
