"""
LexiMind Secure — Document Models
Encrypted file storage, SHA-256 hash chain, pipeline tracking.
"""
import uuid
from django.db import models
from django.conf import settings


class DocClassification(models.TextChoices):
    RESTRICTED = "RESTRICTED", "Restricted"
    CONFIDENTIAL = "CONFIDENTIAL", "Confidential"
    SECRET = "SECRET", "Secret"


class BlockchainStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    VERIFIED = "VERIFIED", "Verified"
    MISMATCH = "MISMATCH", "Mismatch"


class IntegrityStatus(models.TextChoices):
    AUTHENTIC = "AUTHENTIC", "Authentic"
    TAMPERED = "TAMPERED", "Tampered"
    UNVERIFIED = "UNVERIFIED", "Unverified"


class PipelineStage(models.TextChoices):
    UPLOAD = "upload", "Upload"
    OCR = "ocr", "OCR"
    CLASSIFY = "classify", "Classify"
    HASH = "hash", "SHA-256 Hash"
    ENCRYPT = "encrypt", "AES-256 Encrypt"
    STORE = "store", "Secure Storage"
    BLOCKCHAIN = "blockchain", "Blockchain Register"
    COMPLETE = "complete", "Complete"
    FAILED = "failed", "Failed"


PIPELINE_STAGES_ORDERED = [
    PipelineStage.UPLOAD, PipelineStage.OCR, PipelineStage.CLASSIFY,
    PipelineStage.HASH, PipelineStage.ENCRYPT, PipelineStage.STORE,
    PipelineStage.BLOCKCHAIN, PipelineStage.COMPLETE,
]


class Document(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    # "doc1"-style short ID for frontend compatibility; auto-set on save
    short_id = models.CharField(max_length=20, unique=True, blank=True, db_index=True)
    name = models.CharField(max_length=300)
    type = models.CharField(max_length=100)
    case = models.ForeignKey("cases.Case", on_delete=models.CASCADE, related_name="document_set")
    classification = models.CharField(max_length=15, choices=DocClassification.choices)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="uploaded_documents"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    version = models.CharField(max_length=10, default="1.0")
    encryption = models.CharField(max_length=20, default="AES-256")
    sha256 = models.CharField(max_length=128, blank=True)  # of original file bytes
    stored_hash = models.CharField(max_length=128, blank=True)  # recomputed for tamper detection
    blockchain_status = models.CharField(
        max_length=10, choices=BlockchainStatus.choices, default=BlockchainStatus.PENDING
    )
    integrity_status = models.CharField(
        max_length=15, choices=IntegrityStatus.choices, default=IntegrityStatus.UNVERIFIED
    )
    custodian_role = models.CharField(max_length=100, blank=True)
    size_pages = models.IntegerField(default=1)
    file = models.FileField(upload_to="encrypted_docs/", blank=True)
    extracted_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "documents_document"
        ordering = ["-uploaded_at"]
        verbose_name = "Document"

    def __str__(self):
        return f"{self.short_id} — {self.name}"

    def save(self, *args, **kwargs):
        if not self.short_id:
            # Auto-assign sequential "doc{n}" id
            last = Document.objects.order_by("-id").values_list("id", flat=True).first()
            next_n = (last or 0) + 1
            self.short_id = f"doc{next_n}"
        super().save(*args, **kwargs)


class PipelineRun(models.Model):
    """Tracks async upload pipeline progress for polling endpoint."""
    pipeline_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    document = models.OneToOneField(
        Document, null=True, blank=True, on_delete=models.SET_NULL, related_name="pipeline"
    )
    current_stage = models.CharField(max_length=20, choices=PipelineStage.choices, default=PipelineStage.UPLOAD)
    progress = models.IntegerField(default=0)  # 0-100
    error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "documents_pipeline_run"

    def __str__(self):
        return f"Pipeline {self.pipeline_id} [{self.current_stage}]"
