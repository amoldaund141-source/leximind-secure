from rest_framework import serializers
from .models import AuditLogEntry
from django.utils.formats import date_format


class AuditLogSerializer(serializers.ModelSerializer):
    """
    Response shape matches mockData.js AUDIT_LOG exactly:
    {id, event, actor, role, timestamp, target, txId}
    """
    actor = serializers.SerializerMethodField()
    role = serializers.CharField(source="actor_role_snapshot")
    timestamp = serializers.SerializerMethodField()
    txId = serializers.CharField(source="tx_id")

    class Meta:
        model = AuditLogEntry
        fields = ["id", "event", "actor", "role", "timestamp", "target", "txId"]

    def get_actor(self, obj):
        if obj.actor:
            return obj.actor.full_name
        return "System"

    def get_timestamp(self, obj):
        # Format matching the mock: "10 Aug 2026, 09:14"
        from django.utils import timezone
        local_ts = timezone.localtime(obj.timestamp)
        return local_ts.strftime("%d %b %Y, %H:%M")
