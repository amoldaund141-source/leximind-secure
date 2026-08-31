from django.db import models
from django.conf import settings


class SystemSettings(models.Model):
    """Singleton row for system-wide settings."""
    retention_period = models.CharField(max_length=50, default="10 years")
    blockchain_provider_label = models.CharField(
        max_length=200, default="Permissioned — Hyperledger Fabric (demo)"
    )
    two_factor_required = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "settings_system"
        verbose_name = "System Settings"

    @classmethod
    def get_instance(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class UserPreference(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="preference"
    )
    language = models.CharField(max_length=20, default="English")
    notification_prefs = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "settings_user_preference"
