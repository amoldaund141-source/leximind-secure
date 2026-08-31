from django.db import models
from django.conf import settings


class BlockchainRecord(models.Model):
    document = models.ForeignKey(
        "documents.Document", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="blockchain_records"
    )
    evidence = models.ForeignKey(
        "evidence.Evidence", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="blockchain_records"
    )
    document_hash = models.CharField(max_length=128)
    blockchain_hash = models.CharField(max_length=128)
    action = models.CharField(max_length=50, default="Registration")
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="blockchain_records"
    )
    tx_id = models.CharField(max_length=200, unique=True, db_index=True)
    prev_tx_id = models.CharField(max_length=200, blank=True, default="GENESIS")
    timestamp = models.DateTimeField(auto_now_add=True)
    version = models.CharField(max_length=10, default="1.0")

    class Meta:
        db_table = "blockchain_record"
        ordering = ["-timestamp"]
        verbose_name = "Blockchain Record"

    def __str__(self):
        return f"[{self.action}] {self.tx_id[:16]}..."
