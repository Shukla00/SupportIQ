# backend/knowledge/views.py
from django.db.models import Q
from rest_framework import viewsets, permissions
from accounts.permissions import IsAgentOrAdmin
from .models import KnowledgeArticle
from .serializers import KnowledgeArticleSerializer


class KnowledgeArticleViewSet(viewsets.ModelViewSet):
    serializer_class = KnowledgeArticleSerializer

    def get_queryset(self):
        queryset = KnowledgeArticle.objects.select_related("author")
        if self.request.user.role == "customer":
            queryset = queryset.filter(is_published=True)

        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")

        if category:
            queryset = queryset.filter(category=category)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(content__icontains=search)
                | Q(tags__icontains=search)
            )
        return queryset

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticated()]
        return [IsAgentOrAdmin()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)