"""
LexiMind Secure — Auth Serializers
Login response shape must match exactly: {username, name, role, department, badge}
(plus access/refresh tokens added by the view).
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, RoleCode, UserStatus, RolePageAccess, PermissionMatrixEntry, ROLE_DISPLAY


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username", "").strip().lower()
        password = attrs.get("password", "")
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError(
                "Invalid username or password.",
                code="invalid_credentials",
            )
        if not user.is_active:
            raise serializers.ValidationError(
                "Account is deactivated.",
                code="account_deactivated",
            )
        attrs["user"] = user
        return attrs


class UserPublicSerializer(serializers.ModelSerializer):
    """
    The shape stored in sessionStorage by AuthContext.jsx:
    {username, name, role, department, badge}
    role is the DISPLAY string ("Investigation Officer"), NOT the code ("IO").
    """
    name = serializers.CharField(source="full_name")
    role = serializers.SerializerMethodField()
    badge = serializers.CharField(source="badge_number")
    department = serializers.CharField()

    class Meta:
        model = User
        fields = ["username", "name", "role", "department", "badge"]

    def get_role(self, obj):
        return ROLE_DISPLAY.get(obj.role, obj.role)


class MeSerializer(serializers.ModelSerializer):
    """
    Full /api/auth/me/ response including allowed pages and permissions.
    """
    name = serializers.CharField(source="full_name")
    role = serializers.SerializerMethodField()
    badge = serializers.CharField(source="badge_number")
    allowedPages = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "name", "role", "department", "badge", "status", "allowedPages", "permissions"]

    def get_role(self, obj):
        return ROLE_DISPLAY.get(obj.role, obj.role)

    def get_allowedPages(self, obj):
        return list(
            RolePageAccess.objects.filter(role=obj.role).values_list("page_id", flat=True)
        )

    def get_permissions(self, obj):
        entries = PermissionMatrixEntry.objects.filter(role=obj.role)
        return {e.action: e.allowed for e in entries}


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.", code="wrong_password")
        return value


class UserAdminSerializer(serializers.ModelSerializer):
    """
    Admin user list/create/update shape matching USERS[] in mockData.js:
    {id, name, username, role, department, status, lastActive}
    """
    name = serializers.CharField(source="full_name")
    role = serializers.SerializerMethodField()
    role_code = serializers.CharField(source="role", write_only=True)
    lastActive = serializers.SerializerMethodField()
    badge = serializers.CharField(source="badge_number", required=False)

    class Meta:
        model = User
        fields = ["id", "name", "username", "role", "role_code", "department", "badge", "status", "lastActive"]

    def get_role(self, obj):
        return ROLE_DISPLAY.get(obj.role, obj.role)

    def get_lastActive(self, obj):
        if not obj.last_active_at:
            return "Never"
        from django.utils import timezone
        from django.utils.timesince import timesince
        return timesince(obj.last_active_at, timezone.now()) + " ago"

    def create(self, validated_data):
        password = validated_data.pop("password", "secure123")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "password", "full_name", "department", "badge_number"]

    def validate_username(self, value):
        v = value.strip().lower()
        if User.objects.filter(username=v).exists():
            raise serializers.ValidationError("Username already exists.", code="username_exists")
        return v

    def create(self, validated_data):
        password = validated_data.pop("password")
        # Hardcode IO role and PENDING_APPROVAL status to prevent privilege escalation
        user = User(**validated_data, role=RoleCode.IO, status=UserStatus.PENDING_APPROVAL)
        user.set_password(password)
        user.save()
        return user
