"""
LexiMind Secure — Document Serializers
Response shape must match mockData.js DOCUMENTS[] exactly.
Key mapping: custodian_role → custodian, uploaded_at → formatted string.
"""
from rest_framework import serializers
from django.utils import timezone
from .models import Document, PipelineRun


class DocumentSerializer(serializers.ModelSerializer):
    """
    Matches DOCUMENTS[] shape from mockData.js field-for-field:
    {id, name, type, caseId, classification, uploadedBy, uploadedAt,
     version, encryption, sha256, blockchainStatus, integrityStatus,
     custodian, sizePages}
    """
    id = serializers.CharField(source="short_id")
    caseId = serializers.CharField(source="case.case_id")
    uploadedBy = serializers.SerializerMethodField()
    uploadedAt = serializers.SerializerMethodField()
    blockchainStatus = serializers.CharField(source="blockchain_status")
    integrityStatus = serializers.CharField(source="integrity_status")
    custodian = serializers.CharField(source="custodian_role")  # KEY MAPPING
    sizePages = serializers.IntegerField(source="size_pages")

    class Meta:
        model = Document
        fields = [
            "id", "name", "type", "caseId", "classification",
            "uploadedBy", "uploadedAt", "version", "encryption",
            "sha256", "blockchainStatus", "integrityStatus",
            "custodian", "sizePages",
        ]

    def get_uploadedBy(self, obj):
        return obj.uploaded_by.full_name if obj.uploaded_by else "System"

    def get_uploadedAt(self, obj):
        # Format matching mock: "10 Aug 2026, 09:14"
        local_ts = timezone.localtime(obj.uploaded_at)
        return local_ts.strftime("%d %b %Y, %H:%M")


class PipelineStatusSerializer(serializers.ModelSerializer):
    """Polling endpoint shape for the Upload page's stepper UI."""
    docId = serializers.SerializerMethodField()

    class Meta:
        model = PipelineRun
        fields = ["stage", "progress", "docId", "error"]
        extra_kwargs = {"stage": {"source": "current_stage"}}

    def get_docId(self, obj):
        return obj.document.short_id if obj.document else None
