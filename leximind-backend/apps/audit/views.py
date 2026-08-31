from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters import rest_framework as filters
from .models import AuditLogEntry
from .serializers import AuditLogSerializer
from apps.accounts.permissions import IsActiveUser


class AuditLogFilter(filters.FilterSet):
    q = filters.CharFilter(method="search_all", label="Search")
    actor = filters.CharFilter(field_name="actor__full_name", lookup_expr="icontains")
    event = filters.CharFilter(field_name="event", lookup_expr="icontains")

    class Meta:
        model = AuditLogEntry
        fields = ["actor", "event"]

    def search_all(self, queryset, name, value):
        from django.db.models import Q
        return queryset.filter(
            Q(event__icontains=value)
            | Q(actor__full_name__icontains=value)
            | Q(target__icontains=value)
        )


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/audit/log/ — append-only, no write endpoints exposed.
    """
    queryset = AuditLogEntry.objects.select_related("actor").order_by("-timestamp")
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsActiveUser]
    filterset_class = AuditLogFilter
