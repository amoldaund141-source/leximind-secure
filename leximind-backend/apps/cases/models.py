import re
from django.db import models
from django.conf import settings


class CaseClassification(models.TextChoices):
    RESTRICTED = "RESTRICTED", "Restricted"
    CONFIDENTIAL = "CONFIDENTIAL", "Confidential"
    SECRET = "SECRET", "Secret"


class CaseStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    UNDER_REVIEW = "UNDER REVIEW", "Under Review"
    CLOSED = "CLOSED", "Closed"


class Case(models.Model):
    case_id = models.CharField(max_length=20, unique=True, db_index=True)
    title = models.CharField(max_length=400)
    description = models.TextField(blank=True)
    classification = models.CharField(max_length=15, choices=CaseClassification.choices)
    status = models.CharField(max_length=15, choices=CaseStatus.choices, default=CaseStatus.ACTIVE)
    category = models.CharField(max_length=100, blank=True)
    created_date = models.DateField()
    assigned_officers = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name="assigned_cases",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cases_case"
        ordering = ["-created_date"]
        verbose_name = "Case"

    def __str__(self):
        return f"{self.case_id} — {self.title}"

    @classmethod
    def generate_case_id(cls) -> str:
        """Generate next CASE-YYYY-NNNN id."""
        from django.utils import timezone
        year = timezone.now().year
        prefix = f"CASE-{year}-"
        last = (
            cls.objects.filter(case_id__startswith=prefix)
            .order_by("-case_id")
            .values_list("case_id", flat=True)
            .first()
        )
        if last:
            match = re.search(r"(\d{4})$", last)
            num = int(match.group(1)) + 1 if match else 1
        else:
            num = 1
        return f"{prefix}{num:04d}"
