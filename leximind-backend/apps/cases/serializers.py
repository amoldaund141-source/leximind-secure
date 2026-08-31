from rest_framework import serializers
from django.db.models import Count
from .models import Case
from apps.accounts.models import ROLE_DISPLAY


class CaseSerializer(serializers.ModelSerializer):
    """
    Response shape exactly matches mockData.js CASES[]:
    {id, title, description, classification, status, assignedOfficers[], createdDate,
     evidenceCount, documentCount, category}
    """
    id = serializers.CharField(source="case_id")
    assignedOfficers = serializers.SerializerMethodField()
    createdDate = serializers.DateField(source="created_date", format="%Y-%m-%d")
    evidenceCount = serializers.SerializerMethodField()
    documentCount = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            "id", "title", "description", "classification", "status",
            "assignedOfficers", "createdDate", "evidenceCount", "documentCount", "category",
        ]

    def get_assignedOfficers(self, obj):
        return [u.full_name for u in obj.assigned_officers.all()]

    def get_evidenceCount(self, obj):
        return getattr(obj, "evidence_count", obj.evidence_set.count() if hasattr(obj, "evidence_set") else 0)

    def get_documentCount(self, obj):
        return getattr(obj, "document_count", obj.document_set.count() if hasattr(obj, "document_set") else 0)


class CaseCreateSerializer(serializers.ModelSerializer):
    assignedOfficerIds = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False, default=[]
    )

    class Meta:
        model = Case
        fields = ["title", "description", "classification", "category", "assignedOfficerIds"]

    def create(self, validated_data):
        officer_ids = validated_data.pop("assignedOfficerIds", [])
        from django.utils import timezone
        validated_data["case_id"] = Case.generate_case_id()
        validated_data["created_date"] = timezone.now().date()
        case = Case.objects.create(**validated_data)
        if officer_ids:
            from apps.accounts.models import User
            case.assigned_officers.set(User.objects.filter(id__in=officer_ids))
        return case
