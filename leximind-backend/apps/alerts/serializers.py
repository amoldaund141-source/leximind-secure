from rest_framework import serializers
from django.utils import timezone
from .models import SecurityAlert


class SecurityAlertSerializer(serializers.ModelSerializer):
    """
    Response shape matching mockData.js SECURITY_ALERTS:
    {id, severity, title, description, target, timestamp, status}
    """
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = SecurityAlert
        fields = ["id", "severity", "title", "description", "target", "timestamp", "status"]

    def get_timestamp(self, obj):
        local_ts = timezone.localtime(obj.timestamp)
        return local_ts.strftime("%d %b %Y, %H:%M")
