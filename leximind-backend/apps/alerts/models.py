from django.db import models


class AlertSeverity(models.TextChoices):
    CRITICAL = "CRITICAL", "Critical"
    WARNING = "WARNING", "Warning"
    INFO = "INFO", "Info"
    RESOLVED = "RESOLVED", "Resolved"


class AlertStatus(models.TextChoices):
    OPEN = "OPEN", "Open"
    UNDER_REVIEW = "UNDER REVIEW", "Under Review"
    RESOLVED = "RESOLVED", "Resolved"


class SecurityAlert(models.Model):
    severity = models.CharField(max_length=10, choices=AlertSeverity.choices, default=AlertSeverity.INFO)
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    target = models.CharField(max_length=300, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=AlertStatus.choices, default=AlertStatus.OPEN)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "alerts_security_alert"
        ordering = ["-timestamp"]
        verbose_name = "Security Alert"

    def __str__(self):
        return f"[{self.severity}] {self.title}"
