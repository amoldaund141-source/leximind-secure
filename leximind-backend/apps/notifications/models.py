from django.db import models
from django.conf import settings


class NotificationType(models.TextChoices):
    ALERT = "alert", "Alert"
    CUSTODY = "custody", "Custody"
    AI = "ai", "AI"
    BLOCKCHAIN = "blockchain", "Blockchain"


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.CASCADE, related_name="notifications"
    )
    role = models.CharField(max_length=2, blank=True)  # broadcast to role
    type = models.CharField(max_length=20, choices=NotificationType.choices)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        db_table = "notifications_notification"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.type}] {self.title}"
