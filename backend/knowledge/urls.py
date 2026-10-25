# backend/knowledge/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KnowledgeArticleViewSet

router = DefaultRouter()
router.register(r"", KnowledgeArticleViewSet, basename="knowledge-article")

urlpatterns = [
    path("", include(router.urls)),
]