"""
LexiMind Secure — DRF Permission Classes
All server-side RBAC enforcement lives here. Never trust client-sent role.
"""
from rest_framework.permissions import BasePermission
from .models import PermissionMatrixEntry, RolePageAccess, UserStatus


class IsActiveUser(BasePermission):
    """Reject suspended accounts even if they have a valid JWT."""
    message = "Your account has been suspended. Contact your administrator."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.status == UserStatus.ACTIVE
        )


class HasActionPermission(BasePermission):
    """
    Usage: permission_classes = [IsAuthenticated, IsActiveUser, HasActionPermission]
    Set action_required on the ViewSet or override get_action_required() per action.

    Example:
        class DocumentViewSet(AuditedModelViewSet):
            action_required = "Upload"

    Or per-action in get_permissions():
        if self.action == "upload":
            return [HasActionPermission.for_action("Upload")]
    """
    message = "You do not have permission to perform this action."
    action_required = None  # Override in subclass or use for_action()

    @classmethod
    def for_action(cls, action_name: str):
        """Factory: returns a permission class instance requiring a specific action."""
        instance = cls()
        instance.action_required = action_name
        return instance

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        action = getattr(view, "action_required", None) or self.action_required
        if not action:
            return True  # No specific action required — let through
        try:
            entry = PermissionMatrixEntry.objects.get(role=request.user.role, action=action)
            return entry.allowed
        except PermissionMatrixEntry.DoesNotExist:
            return False


class IsRoleAllowed(BasePermission):
    """
    Usage: permission_classes = [IsAuthenticated, IsRoleAllowed.for_roles("SA")]
    """
    message = "Your role does not have access to this resource."
    allowed_roles = ()

    @classmethod
    def for_roles(cls, *roles):
        instance = cls()
        instance.allowed_roles = roles
        return instance

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        allowed = getattr(view, "allowed_roles", None) or self.allowed_roles
        return request.user.role in allowed


class HasPageAccess(BasePermission):
    """
    Checks RolePageAccess table. Used by the /api/auth/me/nav endpoint
    and as a guard on page-scoped ViewSets.
    """
    message = "Your role does not have access to this page."
    page_id = None

    @classmethod
    def for_page(cls, page_id: str):
        instance = cls()
        instance.page_id = page_id
        return instance

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        pid = getattr(view, "page_id", None) or self.page_id
        if not pid:
            return True
        return RolePageAccess.objects.filter(role=request.user.role, page_id=pid).exists()
