from rest_framework import serializers
from .models import Evidence


class EvidenceSerializer(serializers.ModelSerializer):
    """
    Shape matches EVIDENCE[] from mockData.js:
    {id, caseId, type, description, source, custodian, dateAdded,
     integrityStatus, blockchainStatus}
    """
    id = serializers.CharField(source="evidence_id")
    caseId = serializers.CharField(source="case.case_id")
    custodian = serializers.CharField(source="custodian_role")
    dateAdded = serializers.DateField(source="date_added", format="%d %b %Y")
    integrityStatus = serializers.CharField(source="integrity_status")
    blockchainStatus = serializers.CharField(source="blockchain_status")

    class Meta:
        model = Evidence
        fields = ["id", "caseId", "type", "description", "source", "custodian",
                  "dateAdded", "integrityStatus", "blockchainStatus"]


class EvidenceCreateSerializer(serializers.ModelSerializer):
    caseId = serializers.CharField(write_only=True)

    class Meta:
        model = Evidence
        fields = ["caseId", "type", "description", "source", "custodian_role"]

    def create(self, validated_data):
        from apps.cases.models import Case
        from django.utils import timezone
        case_id = validated_data.pop("caseId")
        case = Case.objects.get(case_id=case_id)
        evidence = Evidence.objects.create(
            case=case,
            evidence_id=Evidence.generate_evidence_id(),
            date_added=timezone.now().date(),
            blockchain_status="PENDING",
            integrity_status="AUTHENTIC",
            **validated_data,
        )
        return evidence
