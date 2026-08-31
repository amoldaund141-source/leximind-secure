from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters import rest_framework as filters

from apps.accounts.models import User, PermissionMatrixEntry, ROLE_DISPLAY
from apps.accounts.permissions import IsActiveUser, HasActionPermission
from apps.audit.utils import log_event, AuditEvent
from .models import SystemSettings, UserPreference
from .serializers import (
    SystemSettingsSerializer, UserPreferenceSerializer,
    PermissionMatrixSerializer,
)
from apps.accounts.serializers import UserAdminSerializer


class UserAdminViewSet(viewsets.ModelViewSet):
    """GET/POST/PATCH /api/admin/users/ — System Admin only (Manage permission)."""
    serializer_class = UserAdminSerializer
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        qs = User.objects.all().order_by("full_name")
        q = self.request.query_params.get("q")
        if q:
            from django.db.models import Q
            qs = qs.filter(Q(full_name__icontains=q) | Q(username__icontains=q))
        return qs

    def get_permissions(self):
        return [IsAuthenticated(), IsActiveUser(), HasActionPermission.for_action("Manage")]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # role_code from payload ("IO", "FA" etc.)
        role_code = data.get("role_code") or data.get("role", "IO")
        # If display name passed, convert to code
        reverse = {v: k for k, v in ROLE_DISPLAY.items()}
        if role_code in reverse:
            role_code = reverse[role_code]
        data["role_code"] = role_code
        serializer = UserAdminSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        password = data.get("password", "secure123")
        user = User(
            username=data["username"],
            full_name=data.get("name", data.get("full_name", "")),
            role=role_code,
            department=data.get("department", ""),
            badge_number=data.get("badge", ""),
            status=data.get("status", "Active"),
        )
        user.set_password(password)
        user.save()
        log_event(AuditEvent.PERMISSION_CHANGED, request.user, f"New user created: {user.username}")
        return Response(UserAdminSerializer(user).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        user = self.get_object()
        old_status = user.status
        for field, value in request.data.items():
            if field == "status":
                user.status = value
            elif field == "role":
                reverse = {v: k for k, v in ROLE_DISPLAY.items()}
                user.role = reverse.get(value, value)
            elif field == "department":
                user.department = value
        user.save()
        if old_status != user.status:
            event = AuditEvent.USER_SUSPENDED if user.status == "Suspended" else AuditEvent.USER_ACTIVATED
            log_event(event, request.user, f"User: {user.username} → {user.status}")
        return Response(UserAdminSerializer(user).data)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated, IsActiveUser])
def permission_matrix_view(request):
    if request.method == "GET":
        data = PermissionMatrixSerializer().to_representation(None)
        return Response(data)
    # PATCH — update a cell
    if not HasActionPermission.for_action("Manage").has_permission(request, None):
        return Response({"detail": "Manage permission required.", "code": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
    role_display = request.data.get("role")
    action_name = request.data.get("action")
    allowed = request.data.get("allowed")
    reverse = {v: k for k, v in ROLE_DISPLAY.items()}
    role_code = reverse.get(role_display)
    if not role_code:
        return Response({"detail": "Invalid role.", "code": "invalid_role"}, status=status.HTTP_400_BAD_REQUEST)
    PermissionMatrixEntry.objects.update_or_create(
        role=role_code, action=action_name,
        defaults={"allowed": allowed},
    )
    log_event(AuditEvent.PERMISSION_CHANGED, request.user, f"{role_display} — {action_name}: {allowed}")
    return Response(PermissionMatrixSerializer().to_representation(None))


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated, IsActiveUser])
def system_settings_view(request):
    if request.method == "GET":
        return Response(SystemSettingsSerializer(SystemSettings.get_instance()).data)
    if not HasActionPermission.for_action("Manage").has_permission(request, None):
        return Response({"detail": "Manage permission required.", "code": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
    settings_obj = SystemSettings.get_instance()
    serializer = SystemSettingsSerializer(settings_obj, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated, IsActiveUser])
def user_preferences_view(request):
    pref, _ = UserPreference.objects.get_or_create(user=request.user)
    if request.method == "GET":
        return Response(UserPreferenceSerializer(pref).data)
    serializer = UserPreferenceSerializer(pref, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)
