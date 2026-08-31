from rest_framework import serializers
from django.utils import timezone
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Shape matches NOTIFICATIONS_SEED[] from mockData.js:
    {id, type, title, desc, time, read}
    Note: "desc" (not "description"), "time" (relative string).
    """
    desc = serializers.CharField(source="description")
    time = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Notification
        fields = ["id", "type", "title", "desc", "time", "read", "createdAt"]

    def get_time(self, obj):
        from django.utils.timesince import timesince
        return timesince(obj.created_at, timezone.now()) + " ago"
