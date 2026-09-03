from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters import rest_framework as filters

from apps.accounts.permissions import IsActiveUser, HasActionPermission
from apps.audit.utils import log_event, AuditEvent
from .models import CustodyEvent, TransferStatus
from .serializers import CustodyEventSerializer


class CustodyFilter(filters.FilterSet):
    caseId = filters.CharFilter(field_name="case__case_id")

    class Meta:
        model = CustodyEvent
        fields = ["caseId"]


class CustodyEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CustodyEvent.objects.select_related("case", "user").order_by("-timestamp")
    serializer_class = CustodyEventSerializer
    filterset_class = CustodyFilter

    def get_permissions(self):
        return [IsAuthenticated(), IsActiveUser()]


class CustodyTransferViewSet(viewsets.ViewSet):
    """POST /api/custody/transfers/ + approve/reject actions."""

    def get_permissions(self):
        return [IsAuthenticated(), IsActiveUser()]

    def create(self, request):
        """
        POST /api/custody/transfers/
        Requires Custody Transfer permission.
        Creates PENDING_APPROVAL event + notifies Supervisory Officers/Admins.
        """
        if not HasActionPermission.for_action("Custody Transfer").has_permission(request, self):
            return Response(
                {"detail": "You don't have Custody Transfer permission.", "code": "forbidden"},
                status=status.HTTP_403_FORBIDDEN,
            )

        target_type = request.data.get("targetType", "document")  # "document" | "evidence"
        target_id = request.data.get("targetId")
        case_id = request.data.get("caseId")
        to_role = request.data.get("toCustodianRole", "")

        try:
            from apps.cases.models import Case
            case = Case.objects.get(case_id=case_id)
        except Case.DoesNotExist:
            return Response({"detail": "Case not found.", "code": "not_found"}, status=status.HTTP_404_NOT_FOUND)

        # Resolve object_id
        object_id = None
        from_role = ""
        if target_type == "document":
            try:
                from apps.documents.models import Document
                doc = Document.objects.get(short_id=target_id)
                object_id = doc.id
                from_role = doc.custodian_role
            except Document.DoesNotExist:
                return Response({"detail": "Document not found.", "code": "not_found"}, status=status.HTTP_404_NOT_FOUND)
        elif target_type == "evidence":
            try:
                from apps.evidence.models import Evidence
                ev = Evidence.objects.get(evidence_id=target_id)
                object_id = ev.id
                from_role = ev.custodian_role
            except Evidence.DoesNotExist:
                return Response({"detail": "Evidence not found.", "code": "not_found"}, status=status.HTTP_404_NOT_FOUND)

        event = CustodyEvent.objects.create(
            content_type_label=target_type,
            object_id=object_id,
            case=case,
            user=request.user,
            action="Custody Transferred",
            from_custodian_role=from_role,
            to_custodian_role=to_role,
            verification_status="PENDING",
            transfer_status=TransferStatus.PENDING,
        )

        # Notify Supervisory Officers and Admins
        _notify_supervisors(event, target_id)
        log_event(AuditEvent.CUSTODY_TRANSFERRED, request.user,
                  f"{target_id} → {to_role} (pending approval)")

        return Response(CustodyEventSerializer(event).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        if not HasActionPermission.for_action("Approve").has_permission(request, self):
            return Response({"detail": "Approve permission required.", "code": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        try:
            event = CustodyEvent.objects.get(pk=pk)
        except CustodyEvent.DoesNotExist:
            return Response({"detail": "Transfer not found.", "code": "not_found"}, status=status.HTTP_404_NOT_FOUND)
            
        target_id_str = ""
        if event.content_type_label == "document":
            from apps.documents.models import Document
            doc = Document.objects.get(id=event.object_id)
            doc.custodian_role = event.to_custodian_role
            doc.save(update_fields=["custodian_role"])
            target_id_str = doc.short_id
        elif event.content_type_label == "evidence":
            from apps.evidence.models import Evidence
            ev = Evidence.objects.get(id=event.object_id)
            ev.custodian_role = event.to_custodian_role
            ev.save(update_fields=["custodian_role"])
            target_id_str = ev.evidence_id
            
        # Call Fabric Node API for blockchain custody transfer
        try:
            import urllib.request, json, os
            base_url = os.environ.get("FABRIC_NODE_URL", "http://localhost:4000")
            payload = json.dumps({
                "id": target_id_str,
                "fromRole": event.from_custodian_role,
                "toRole": event.to_custodian_role
            }).encode('utf-8')
            req = urllib.request.Request(f'{base_url}/api/fabric/evidence/transfer', data=payload, headers={'Content-Type': 'application/json'})
            urllib.request.urlopen(req, timeout=60)
        except Exception:
            pass

        event.transfer_status = TransferStatus.APPROVED
        event.verification_status = "VERIFIED"
        event.save(update_fields=["transfer_status", "verification_status"])
        log_event(AuditEvent.CUSTODY_TRANSFERRED, request.user, f"Transfer {pk} approved")
        return Response({"detail": "Transfer approved.", "status": "APPROVED"})

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        if not HasActionPermission.for_action("Approve").has_permission(request, self):
            return Response({"detail": "Approve permission required.", "code": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        try:
            event = CustodyEvent.objects.get(pk=pk)
        except CustodyEvent.DoesNotExist:
            return Response({"detail": "Transfer not found.", "code": "not_found"}, status=status.HTTP_404_NOT_FOUND)
        event.transfer_status = TransferStatus.REJECTED
        event.save(update_fields=["transfer_status"])
        return Response({"detail": "Transfer rejected.", "status": "REJECTED"})


def _notify_supervisors(event, target_id):
    """Create notifications for Supervisory Officers and Admins."""
    try:
        from apps.accounts.models import User, RoleCode
        from apps.notifications.models import Notification, NotificationType
        supervisors = User.objects.filter(role__in=[RoleCode.SO, RoleCode.SA], status="Active")
        for sup in supervisors:
            Notification.objects.create(
                user=sup,
                type=NotificationType.CUSTODY,
                title="Custody Transfer Pending Approval",
                description=f"{target_id} transfer awaits supervisory approval.",
            )
    except Exception:
        pass
