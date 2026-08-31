from django.db import models
from django.conf import settings


class EvidenceType(models.TextChoices):
    DIGITAL = "Digital", "Digital"
    DOCUMENT = "Document", "Document"
    TESTIMONIAL = "Testimonial", "Testimonial"


class Evidence(models.Model):
    evidence_id = models.CharField(max_length=20, unique=True, db_index=True)
    case = models.ForeignKey("cases.Case", on_delete=models.CASCADE, related_name="evidence_set")
    type = models.CharField(max_length=20, choices=EvidenceType.choices)
    description = models.TextField()
    source = models.CharField(max_length=300)
    custodian_role = models.CharField(max_length=100)
    date_added = models.DateField()
    integrity_status = models.CharField(max_length=20, default="AUTHENTIC")
    blockchain_status = models.CharField(max_length=10, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "evidence_evidence"
        ordering = ["-date_added"]
        verbose_name = "Evidence"

    def __str__(self):
        return f"{self.evidence_id} — {self.description[:60]}"

    @classmethod
    def generate_evidence_id(cls) -> str:
        last = cls.objects.order_by("-id").values_list("id", flat=True).first()
        next_n = (last or 3300) + 1
        return f"EVID-{next_n}"
