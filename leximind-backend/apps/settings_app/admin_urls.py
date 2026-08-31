from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("users", views.UserAdminViewSet, basename="admin-users")

urlpatterns = [
    path("", include(router.urls)),
    path("access-control/matrix/", views.permission_matrix_view, name="access-control-matrix"),
    path("system-settings/", views.system_settings_view, name="system-settings"),
]
