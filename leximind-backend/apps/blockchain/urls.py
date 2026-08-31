from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlockchainRecordViewSet, verify_hash

router = DefaultRouter()
router.register("records", BlockchainRecordViewSet, basename="blockchain-records")

urlpatterns = [
    path("", include(router.urls)),
    path("verify/", verify_hash, name="blockchain-verify"),
]
