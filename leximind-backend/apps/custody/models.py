"""
LexiMind Secure — Custody Chain Models
GenericForeignKey approach for targeting both documents and evidence.
Transfer workflow: PENDING_APPROVAL → APPROVED | REJECTED
"""
from django.db import models
from django.conf import settings


class TransferStatus(models.TextChoices):
    PENDING = "PENDING_APPROVAL", "Pending Approval"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"


class CustodyEvent(models.Model):
    # GenericForeignKey: "document" or "evidence"
    content_type_label = models.CharField(max_length=20, default="document")  # "document" | "evidence"
    object_id = models.PositiveIntegerField(null=True, blank=True)
    case = models.ForeignKey("cases.Case", on_delete=models.CASCADE, related_name="custody_events")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="custody_events"
    )
    action = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    from_custodian_role = models.CharField(max_length=100, default="—")
    to_custodian_role = models.CharField(max_length=100, default="—")
    verification_status = models.CharField(max_length=20, default="VERIFIED")
    transfer_status = models.CharField(
        max_length=20, choices=TransferStatus.choices, null=True, blank=True
    )

    class Meta:
        db_table = "custody_event"
        ordering = ["-timestamp"]
        verbose_name = "Custody Event"

    def __str__(self):
        user_name = self.user.full_name if self.user else "System"
        return f"{self.action} by {user_name} [{self.case.case_id}]"

    @property
    def target_id(self):
        """Returns the human-facing ID (doc1, EVID-3301 etc.)"""
        if self.content_type_label == "document":
            try:
                from apps.documents.models import Document
                return Document.objects.get(pk=self.object_id).short_id
            except Exception:
                return str(self.object_id)
        elif self.content_type_label == "evidence":
            try:
                from apps.evidence.models import Evidence
                return Evidence.objects.get(pk=self.object_id).evidence_id
            except Exception:
                return str(self.object_id)
        return str(self.object_id)

    @property
    def target_name(self):
        if self.content_type_label == "document":
            try:
                from apps.documents.models import Document
                return Document.objects.get(pk=self.object_id).name
            except Exception:
                return "Unknown"
        elif self.content_type_label == "evidence":
            try:
                from apps.evidence.models import Evidence
                ev = Evidence.objects.get(pk=self.object_id)
                return f"{ev.evidence_id} — {ev.description[:40]}"
            except Exception:
                return "Unknown"
        return "Unknown"
