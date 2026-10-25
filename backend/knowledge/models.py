from django.db import models
from django.conf import settings


class KnowledgeArticle(models.Model):
    class Category(models.TextChoices):
        BILLING = "billing", "Billing"
        TECHNICAL_ISSUE = "technical_issue", "Technical Issue"
        ACCOUNT_ACCESS = "account_access", "Account Access"
        GENERAL_INQUIRY = "general_inquiry", "General Inquiry"

    title = models.CharField(max_length=255, db_index=True)
    category = models.CharField(
        max_length=32,
        choices=Category.choices,
        default=Category.GENERAL_INQUIRY,
        db_index=True,
    )
    content = models.TextField()
    tags = models.CharField(
        max_length=255,
        blank=True,
        help_text="Comma-separated keywords for retrieval",
    )
    is_published = models.BooleanField(default=True, db_index=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="kb_articles",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"[{self.get_category_display()}] {self.title}"