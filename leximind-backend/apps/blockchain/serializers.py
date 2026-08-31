from rest_framework import serializers
from django.utils import timezone
from .models import BlockchainRecord


class BlockchainRecordSerializer(serializers.ModelSerializer):
    """
    Shape matching BLOCKCHAIN_RECORDS[] in mockData.js:
    {id, documentId, documentName, documentHash, blockchainHash,
     timestamp, version, action, actor, txId}
    """
    documentId = serializers.SerializerMethodField()
    documentName = serializers.SerializerMethodField()
    documentHash = serializers.CharField(source="document_hash")
    blockchainHash = serializers.CharField(source="blockchain_hash")
    timestamp = serializers.SerializerMethodField()
    actor = serializers.SerializerMethodField()
    txId = serializers.CharField(source="tx_id")

    class Meta:
        model = BlockchainRecord
        fields = ["id", "documentId", "documentName", "documentHash", "blockchainHash",
                  "timestamp", "version", "action", "actor", "txId"]

    def get_documentId(self, obj):
        return obj.document.short_id if obj.document else (
            obj.evidence.evidence_id if obj.evidence else None
        )

    def get_documentName(self, obj):
        return obj.document.name if obj.document else (
            obj.evidence.description[:60] if obj.evidence else "Unknown"
        )

    def get_timestamp(self, obj):
        local_ts = timezone.localtime(obj.timestamp)
        return local_ts.strftime("%d %b %Y, %H:%M")

    def get_actor(self, obj):
        return obj.actor.full_name if obj.actor else "System"
