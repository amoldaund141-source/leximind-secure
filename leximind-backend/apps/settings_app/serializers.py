from rest_framework import serializers
from .models import SystemSettings, UserPreference
from apps.accounts.serializers import UserAdminSerializer
from apps.accounts.models import User, PermissionMatrixEntry, RoleCode, ROLE_DISPLAY


class SystemSettingsSerializer(serializers.ModelSerializer):
    retentionPeriod = serializers.CharField(source="retention_period")
    blockchainProviderLabel = serializers.CharField(source="blockchain_provider_label")
    twoFactorRequired = serializers.BooleanField(source="two_factor_required")

    class Meta:
        model = SystemSettings
        fields = ["retentionPeriod", "blockchainProviderLabel", "twoFactorRequired"]


class UserPreferenceSerializer(serializers.ModelSerializer):
    notificationPrefs = serializers.JSONField(source="notification_prefs")

    class Meta:
        model = UserPreference
        fields = ["language", "notificationPrefs"]


class PermissionMatrixSerializer(serializers.Serializer):
    """Returns PERMISSION_MATRIX shape from mockData.js."""
    actions = serializers.ListField(child=serializers.CharField(), read_only=True)
    rows = serializers.ListField(read_only=True)

    def to_representation(self, instance):
        actions = ["Upload", "Download", "Verify", "Custody Transfer", "Approve", "Manage"]
        rows = []
        for code, display in ROLE_DISPLAY.items():
            perms = []
            for action in actions:
                try:
                    entry = PermissionMatrixEntry.objects.get(role=code, action=action)
                    perms.append(entry.allowed)
                except PermissionMatrixEntry.DoesNotExist:
                    perms.append(False)
            rows.append({"role": display, "perms": perms})
        return {"actions": actions, "rows": rows}
