from rest_framework import viewsets, mixins, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters import rest_framework as filters
from .models import SecurityAlert
from .serializers import SecurityAlertSerializer
from apps.accounts.permissions import IsActiveUser, HasActionPermission


class AlertFilter(filters.FilterSet):
    class Meta:
        model = SecurityAlert
        fields = {"severity": ["exact"], "status": ["exact"]}


class SecurityAlertViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = SecurityAlert.objects.all().order_by("-timestamp")
    serializer_class = SecurityAlertSerializer
    filterset_class = AlertFilter

    def get_permissions(self):
        perms = [IsAuthenticated(), IsActiveUser()]
        if self.action == "partial_update":
            perms.append(HasActionPermission.for_action("Approve"))
        return perms

    def partial_update(self, request, *args, **kwargs):
        """PATCH /api/alerts/{id}/ — change status (Under Review → Resolved)."""
        kwargs["partial"] = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
