"""
LexiMind Secure — Root URL configuration.
All API endpoints live under /api/.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Simple health-check endpoint — no auth required."""
    return Response({"status": "ok", "version": "1.0.0"})


urlpatterns = [
    # Health check
    path("api/health/", health_check, name="health-check"),

    # Django admin (not the app's admin — this is the Django meta-admin)
    path("django-admin/", admin.site.urls),

    # API schema + docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    # Auth
    path("api/auth/", include("apps.accounts.urls")),

    # Cases
    path("api/cases/", include("apps.cases.urls")),

    # Documents / Vault
    path("api/documents/", include("apps.documents.urls")),

    # Evidence
    path("api/evidence/", include("apps.evidence.urls")),

    # Chain of custody
    path("api/custody/", include("apps.custody.urls")),

    # Blockchain
    path("api/blockchain/", include("apps.blockchain.urls")),

    # Security alerts
    path("api/alerts/", include("apps.alerts.urls")),

    # Audit ledger
    path("api/audit/", include("apps.audit.urls")),

    # AI intelligence
    path("api/ai/", include("apps.ai.urls")),

    # Notifications
    path("api/notifications/", include("apps.notifications.urls")),

    # Personal settings
    path("api/me/", include("apps.settings_app.me_urls")),

    # Admin (system + users + access control)
    path("api/admin/", include("apps.settings_app.admin_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
