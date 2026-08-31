"""
LexiMind Secure — Audit Log Model
Append-only. No update/delete endpoints are exposed.
Every mutating action system-wide writes one entry via log_event().
"""
from django.db import models
from django.conf import settings


class AuditLogEntry(models.Model):
    """
    Immutable audit log. Actor is nullable for System-generated events.
    actor_role_snapshot stores the role at time of action for historical accuracy.
    """
    event = models.CharField(max_length=100, db_index=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_entries",
    )
    actor_role_snapshot = models.CharField(max_length=50, blank=True, default="System")
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    target = models.CharField(max_length=500, blank=True)
    tx_id = models.CharField(max_length=200, blank=True, default="—")

    class Meta:
        db_table = "audit_log"
        verbose_name = "Audit Log Entry"
        ordering = ["-timestamp"]
        # Append-only: never expose update/delete in any ViewSet

    def __str__(self):
        actor_name = self.actor.full_name if self.actor else "System"
        return f"[{self.timestamp}] {self.event} by {actor_name} — {self.target}"
