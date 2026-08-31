from django.db.models import Count
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters import rest_framework as filters
from apps.accounts.permissions import IsActiveUser, IsRoleAllowed
from apps.audit.mixins import AuditedModelViewSet
from apps.audit.utils import AuditEvent
from .models import Case
from .serializers import CaseSerializer, CaseCreateSerializer


class CaseFilter(filters.FilterSet):
    class Meta:
        model = Case
        fields = {"status": ["exact"], "classification": ["exact"]}


class CaseViewSet(AuditedModelViewSet):
    serializer_class = CaseSerializer
    filterset_class = CaseFilter
    audit_event_create = AuditEvent.CASE_CREATED
    audit_target_field = "case_id"

    def get_queryset(self):
        qs = Case.objects.annotate(
            evidence_count=Count("evidence_set", distinct=True),
            document_count=Count("document_set", distinct=True),
        ).prefetch_related("assigned_officers")
        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return CaseCreateSerializer
        return CaseSerializer

    def get_permissions(self):
        perms = [IsAuthenticated(), IsActiveUser()]
        if self.action == "create":
            perms.append(IsRoleAllowed.for_roles("IO", "SO", "SA"))
        if self.action in ("update", "partial_update"):
            from apps.accounts.permissions import HasActionPermission
            perms.append(HasActionPermission.for_action("Approve"))
        return perms

    def retrieve(self, request, *args, **kwargs):
        """GET /api/cases/{case_id}/ — lookup by case_id string, not pk."""
        try:
            instance = self.get_queryset().get(case_id=kwargs["pk"])
        except Case.DoesNotExist:
            return Response({"detail": "Case not found.", "code": "not_found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(CaseSerializer(instance).data)

    def create(self, request, *args, **kwargs):
        serializer = CaseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        case = serializer.save()
        from apps.audit.utils import log_event
        log_event(AuditEvent.CASE_CREATED, request.user, case.case_id)
        return Response(CaseSerializer(case).data, status=status.HTTP_201_CREATED)
