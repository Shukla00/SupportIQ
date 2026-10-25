# backend/config/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/tickets/", include("tickets.urls")),
    path("api/kb/", include("knowledge.urls")),
]