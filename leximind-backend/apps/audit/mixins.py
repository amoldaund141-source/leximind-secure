"""
AuditedModelViewSet — base ViewSet that automatically logs mutations.
Inherit from this instead of ModelViewSet to get audit entries for free.
"""
from rest_framework import viewsets
from .utils import log_event, AuditEvent


class AuditedModelViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet. Subclasses set:
        audit_event_create = AuditEvent.DOCUMENT_UPLOADED
        audit_event_update = AuditEvent.PERMISSION_CHANGED
        audit_target_field = "name"  # field on the model for target string
    """
    audit_event_create = None
    audit_event_update = None
    audit_target_field = None

    def _get_audit_target(self, instance) -> str:
        if self.audit_target_field:
            return str(getattr(instance, self.audit_target_field, instance))
        return str(instance)

    def perform_create(self, serializer):
        instance = serializer.save()
        if self.audit_event_create:
            log_event(
                event=self.audit_event_create,
                actor=self.request.user,
                target=self._get_audit_target(instance),
            )
        return instance

    def perform_update(self, serializer):
        instance = serializer.save()
        if self.audit_event_update:
            log_event(
                event=self.audit_event_update,
                actor=self.request.user,
                target=self._get_audit_target(instance),
            )
        return instance
