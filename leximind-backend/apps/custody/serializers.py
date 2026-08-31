from rest_framework import serializers
from django.utils import timezone
from .models import CustodyEvent


class CustodyEventSerializer(serializers.ModelSerializer):
    """
    Shape matches CUSTODY_EVENTS[] in mockData.js:
    {id, targetId, targetName, caseId, user, role, action, timestamp,
     fromCustodian, toCustodian, verificationStatus}
    """
    targetId = serializers.SerializerMethodField()
    targetName = serializers.SerializerMethodField()
    caseId = serializers.CharField(source="case.case_id")
    user = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()
    fromCustodian = serializers.CharField(source="from_custodian_role")
    toCustodian = serializers.CharField(source="to_custodian_role")
    verificationStatus = serializers.CharField(source="verification_status")

    class Meta:
        model = CustodyEvent
        fields = ["id", "targetId", "targetName", "caseId", "user", "role",
                  "action", "timestamp", "fromCustodian", "toCustodian", "verificationStatus"]

    def get_targetId(self, obj):
        return obj.target_id

    def get_targetName(self, obj):
        return obj.target_name

    def get_user(self, obj):
        if obj.user:
            return obj.user.full_name
        return "System"

    def get_role(self, obj):
        if obj.user:
            from apps.accounts.models import ROLE_DISPLAY
            return ROLE_DISPLAY.get(obj.user.role, obj.user.role)
        return "System"

    def get_timestamp(self, obj):
        local_ts = timezone.localtime(obj.timestamp)
        return local_ts.strftime("%d %b %Y, %H:%M")
