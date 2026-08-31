from django.urls import path
from . import views

urlpatterns = [
    path("preferences/", views.user_preferences_view, name="me-preferences"),
]
