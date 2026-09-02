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
        import urllib.request, json
        
        case_id = validated_data.pop("caseId")
        case = Case.objects.get(case_id=case_id)
        evidence_id = Evidence.generate_evidence_id()
        
        # 1. Save to standard database
        evidence = Evidence.objects.create(
            case=case,
            evidence_id=evidence_id,
            date_added=timezone.now().date(),
            blockchain_status="PENDING",
            integrity_status="AUTHENTIC",
            **validated_data,
        )

        # 2. Register on Hyperledger Fabric Simulated Node
        try:
            import os
            base_url = os.environ.get("FABRIC_NODE_URL", "http://localhost:4000")
            payload = json.dumps({
                "id": evidence_id,
                "caseId": case_id,
                "type": validated_data.get("type"),
                "description": validated_data.get("description"),
                "role": validated_data.get("custodian_role", "Forensic Analyst")
            }).encode('utf-8')
            
            req = urllib.request.Request(f'{base_url}/api/fabric/evidence/register', data=payload, headers={'Content-Type': 'application/json'})
            res = urllib.request.urlopen(req, timeout=3)
            
            if res.status in [200, 201]:
                evidence.blockchain_status = "VERIFIED"
                evidence.save(update_fields=["blockchain_status"])
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Fabric integration failed: {e}")

        return evidence
