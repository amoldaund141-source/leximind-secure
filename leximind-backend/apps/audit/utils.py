"""
LexiMind Secure — Audit Logging Utilities

SINGLE source of truth for all audit events. Call log_event() from:
  - views / serializers
  - Celery tasks
  - Django signals

AuditEvent strings match EXACTLY the strings in mockData.js AUDIT_LOG array
so that downstream search/filter returns consistent results.
"""
import logging
from django.db import transaction

logger = logging.getLogger("apps.audit")


class AuditEvent:
    """
    Canonical event string constants. These MUST match mockData.js AUDIT_LOG exactly.
    """
    DOCUMENT_UPLOADED = "Document Uploaded"
    SHA256_GENERATED = "SHA-256 Generated"
    DOCUMENT_ENCRYPTED = "Document Encrypted"
    BLOCKCHAIN_REGISTERED = "Blockchain Registered"
    CUSTODY_TRANSFERRED = "Custody Transferred"
    INTEGRITY_VERIFIED = "Integrity Verified"
    INTEGRITY_FAILED = "Integrity Verification Failed"
    UNAUTHORIZED_ACCESS = "Unauthorized Access Attempt"
    PERMISSION_CHANGED = "Permission Changed"
    DOCUMENT_ACCESSED = "Document Accessed"
    EVIDENCE_UPLOADED = "Evidence Uploaded"
    EVIDENCE_ACCESSED = "Evidence Accessed"
    FORENSIC_SUBMITTED = "Forensic Analysis Submitted"
    CASE_CREATED = "Case Created"
    USER_SUSPENDED = "User Suspended"
    USER_ACTIVATED = "User Activated"
    LOGIN_FAILED = "Login Failed"
    AI_ANALYSIS_COMPLETE = "AI Analysis Complete"


def log_event(event: str, actor, target: str = "", tx_id: str = "—"):
    """
    Write one AuditLogEntry row.

    Args:
        event:  One of AuditEvent.* constants.
        actor:  User instance or None (System events).
        target: Human-readable description, e.g. "FIR_2026_0142.pdf — CASE-2026-0142".
        tx_id:  Blockchain transaction ID if applicable, else "—".
    """
    from .models import AuditLogEntry
    from apps.accounts.models import ROLE_DISPLAY

    try:
        role_snapshot = "System"
        if actor is not None:
            role_snapshot = ROLE_DISPLAY.get(actor.role, actor.role)

        with transaction.atomic():
            entry = AuditLogEntry.objects.create(
                event=event,
                actor=actor,
                actor_role_snapshot=role_snapshot,
                target=target,
                tx_id=tx_id or "—",
            )
            logger.info(
                "Audit event recorded",
                extra={"event": event, "actor": getattr(actor, "username", "system"), "target": target},
            )
            return entry
    except Exception as exc:
        # Never let audit logging failures break the main request
        logger.error("Failed to write audit log entry: %s", exc)
        return None
