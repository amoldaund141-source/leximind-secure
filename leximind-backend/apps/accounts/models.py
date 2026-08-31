"""
LexiMind Secure — Accounts Models
User extends AbstractUser; separate lookup tables for page access and permissions.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class RoleCode(models.TextChoices):
    IO = "IO", "Investigation Officer"
    FA = "FA", "Forensic Analyst"
    LO = "LO", "Legal Officer"
    SO = "SO", "Supervisory Officer"
    SA = "SA", "System Administrator"


ROLE_DISPLAY = {
    RoleCode.IO: "Investigation Officer",
    RoleCode.FA: "Forensic Analyst",
    RoleCode.LO: "Legal Officer",
    RoleCode.SO: "Supervisory Officer",
    RoleCode.SA: "System Administrator",
}

ROLE_CODE_REVERSE = {v: k for k, v in ROLE_DISPLAY.items()}


class UserStatus(models.TextChoices):
    ACTIVE = "Active", "Active"
    SUSPENDED = "Suspended", "Suspended"


class User(AbstractUser):
    """
    Custom user model. Auth key is username (inherited from AbstractUser).
    full_name stores the display name; first_name/last_name are inherited but unused.
    """
    full_name = models.CharField(max_length=200, blank=True)
    role = models.CharField(max_length=2, choices=RoleCode.choices, default=RoleCode.IO)
    department = models.CharField(max_length=200, blank=True)
    badge_number = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=10, choices=UserStatus.choices, default=UserStatus.ACTIVE)
    last_active_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "accounts_user"
        verbose_name = "User"

    def __str__(self):
        return f"{self.full_name} ({self.username}) [{self.role}]"

    @property
    def role_display(self):
        return ROLE_DISPLAY.get(self.role, self.role)

    @property
    def is_active_user(self):
        return self.status == UserStatus.ACTIVE


class RolePageAccess(models.Model):
    """
    Lookup table: which page_ids each role may open.
    Seeded from ROLE_PAGE_ACCESS in mockData.js.
    """
    role = models.CharField(max_length=2, choices=RoleCode.choices)
    page_id = models.CharField(max_length=100)

    class Meta:
        db_table = "accounts_role_page_access"
        unique_together = ("role", "page_id")
        verbose_name = "Role Page Access"

    def __str__(self):
        return f"{self.role} → {self.page_id}"


class ActionCode(models.TextChoices):
    UPLOAD = "Upload", "Upload"
    DOWNLOAD = "Download", "Download"
    VERIFY = "Verify", "Verify"
    CUSTODY_TRANSFER = "Custody Transfer", "Custody Transfer"
    APPROVE = "Approve", "Approve"
    MANAGE = "Manage", "Manage"


class PermissionMatrixEntry(models.Model):
    """
    Action-level permissions per role. Mirrors PERMISSION_MATRIX from mockData.js.
    Checked by HasActionPermission DRF permission class.
    """
    role = models.CharField(max_length=2, choices=RoleCode.choices)
    action = models.CharField(max_length=20, choices=ActionCode.choices)
    allowed = models.BooleanField(default=False)

    class Meta:
        db_table = "accounts_permission_matrix"
        unique_together = ("role", "action")
        verbose_name = "Permission Matrix Entry"

    def __str__(self):
        flag = "✅" if self.allowed else "❌"
        return f"{self.role} — {self.action}: {flag}"


class LoginAttempt(models.Model):
    """
    Tracks consecutive failed login attempts for throttle/alert logic.
    Cleaned up automatically after LOGIN_FAILURE_WINDOW_SECONDS.
    """
    username = models.CharField(max_length=150, db_index=True)
    attempted_at = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        db_table = "accounts_login_attempt"
        verbose_name = "Login Attempt"
        ordering = ["-attempted_at"]
