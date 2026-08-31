"""
LexiMind Secure — Auth Views
POST /api/auth/login/  → JWT + user fields matching AuthContext.jsx expectations
POST /api/auth/logout/ → blacklist refresh token
GET  /api/auth/me/     → current user + allowed pages + permissions
"""
import logging
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User, LoginAttempt, UserStatus, ROLE_DISPLAY
from .serializers import (
    LoginSerializer, UserPublicSerializer, MeSerializer,
    ChangePasswordSerializer, UserAdminSerializer, RegisterSerializer,
)
from .permissions import IsActiveUser

logger = logging.getLogger("apps.accounts")


class LoginRateThrottle(AnonRateThrottle):
    rate = "10/minute"
    scope = "login"


def _get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def _check_failed_logins(username: str) -> int:
    """Return count of failed logins in the throttle window."""
    from datetime import timedelta
    window = timezone.now() - timedelta(seconds=settings.LOGIN_FAILURE_WINDOW_SECONDS)
    return LoginAttempt.objects.filter(
        username=username.lower(),
        attempted_at__gte=window,
        success=False,
    ).count()


def _maybe_create_brute_force_alert(username: str):
    """After threshold failures, create a SecurityAlert + AuditLogEntry."""
    try:
        from apps.alerts.models import SecurityAlert, AlertSeverity, AlertStatus
        from apps.audit.utils import log_event, AuditEvent
        SecurityAlert.objects.get_or_create(
            title="Multiple failed login attempts",
            status=AlertStatus.UNDER_REVIEW,
            defaults={
                "severity": AlertSeverity.WARNING,
                "description": f"{settings.LOGIN_FAILURE_THRESHOLD} consecutive failed login attempts "
                               f"for account {username} within 2 minutes.",
                "target": f"User: {username}",
            },
        )
        log_event(
            event=AuditEvent.UNAUTHORIZED_ACCESS,
            actor=None,
            target=f"Login brute-force detected: {username}",
        )
    except Exception as exc:
        logger.error("Failed to create brute-force alert: %s", exc)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login_view(request):
    """
    POST /api/auth/login/
    Returns: {username, name, role, department, badge, access, refresh}
    """
    serializer = LoginSerializer(data=request.data)
    ip = _get_client_ip(request)
    username_raw = request.data.get("username", "").strip().lower()

    if not serializer.is_valid():
        # Log failed attempt
        LoginAttempt.objects.create(username=username_raw, success=False, ip_address=ip)
        failures = _check_failed_logins(username_raw)
        if failures >= settings.LOGIN_FAILURE_THRESHOLD:
            _maybe_create_brute_force_alert(username_raw)
        return Response(
            {"detail": "Invalid username or password.", "code": "invalid_credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user: User = serializer.validated_data["user"]

    # Check account status
    if user.status == UserStatus.SUSPENDED:
        LoginAttempt.objects.create(username=username_raw, success=False, ip_address=ip)
        return Response(
            {"detail": "Your account has been suspended.", "code": "account_suspended"},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Record success, update last_active
    LoginAttempt.objects.create(username=username_raw, success=True, ip_address=ip)
    user.last_active_at = timezone.now()
    user.save(update_fields=["last_active_at"])

    # Generate tokens
    refresh = RefreshToken.for_user(user)
    user_data = UserPublicSerializer(user).data

    logger.info("User logged in", extra={"username": user.username, "role": user.role})

    return Response({
        **user_data,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """POST /api/auth/logout/ — blacklist the refresh token."""
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except TokenError:
        pass  # Already blacklisted or invalid — that's fine
    return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsActiveUser])
def me_view(request):
    """GET /api/auth/me/ — current user + allowed pages + permissions."""
    request.user.last_active_at = timezone.now()
    request.user.save(update_fields=["last_active_at"])
    return Response(MeSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsActiveUser])
def change_password_view(request):
    """POST /api/auth/change-password/ — direct password change."""
    serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    request.user.set_password(serializer.validated_data["new_password"])
    request.user.save(update_fields=["password"])
    return Response({"detail": "Password changed successfully."})

@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """
    POST /api/auth/register/
    Returns: {username, name, role, department, badge, access, refresh}
    """
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()
    
    # Generate tokens immediately so user is logged in
    refresh = RefreshToken.for_user(user)
    user_data = UserPublicSerializer(user).data

    logger.info("New user registered", extra={"username": user.username, "role": user.role})

    return Response({
        **user_data,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }, status=status.HTTP_201_CREATED)
