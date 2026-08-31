from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from apps.accounts.permissions import IsActiveUser


class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get_queryset(self):
        user = self.request.user
        # Direct notifications + role broadcasts
        from django.db.models import Q
        return Notification.objects.filter(
            Q(user=user) | Q(role=user.role, user__isnull=True)
        ).order_by("-created_at")

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.read = True
        instance.save(update_fields=["read"])
        return Response(NotificationSerializer(instance).data)

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        self.get_queryset().update(read=True)
        return Response({"detail": "All notifications marked as read."})
