from rest_framework import serializers
from .models import KnowledgeArticle


class KnowledgeArticleSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    author_username = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = KnowledgeArticle
        fields = (
            "id",
            "title",
            "category",
            "category_display",
            "content",
            "tags",
            "is_published",
            "author",
            "author_username",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "author", "created_at", "updated_at")