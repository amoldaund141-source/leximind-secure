"""
LexiMind Secure — Document Encryption Service
AES-256 via Fernet (symmetric encryption).
Key management: env var for now, KMS-ready interface.
"""
import base64
import hashlib
from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings
import logging

logger = logging.getLogger("apps.documents.encryption")


def _get_fernet() -> Fernet:
    raw_key = settings.AES_ENCRYPTION_KEY
    if not raw_key:
        logger.warning("AES_ENCRYPTION_KEY not set — using insecure dev key. NEVER in production.")
        raw_key = "dev-leximind-insecure-key-please-set-env"
    try:
        key = base64.urlsafe_b64decode(raw_key.encode() + b"==")
        if len(key) == 32:
            key = base64.urlsafe_b64encode(key)
        else:
            raise ValueError("bad length")
        return Fernet(key)
    except Exception:
        digest = hashlib.sha256(raw_key.encode()).digest()
        key = base64.urlsafe_b64encode(digest)
        return Fernet(key)


def encrypt_bytes(data: bytes) -> bytes:
    return _get_fernet().encrypt(data)


def decrypt_bytes(data: bytes) -> bytes:
    try:
        return _get_fernet().decrypt(data)
    except InvalidToken as exc:
        logger.error("Decryption failed: %s", exc)
        raise
