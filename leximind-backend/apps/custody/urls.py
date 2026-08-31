from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustodyEventViewSet, CustodyTransferViewSet

router = DefaultRouter()
router.register("events", CustodyEventViewSet, basename="custody-events")
router.register("transfers", CustodyTransferViewSet, basename="custody-transfers")
urlpatterns = [path("", include(router.urls))]
