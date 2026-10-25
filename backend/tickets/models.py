from django.db import models
from django.conf import settings
from django.utils import timezone


class Ticket(models.Model):
    class Category(models.TextChoices):
        BILLING = "billing", "Billing"
        TECHNICAL_ISSUE = "technical_issue", "Technical Issue"
        ACCOUNT_ACCESS = "account_access", "Account Access"
        GENERAL_INQUIRY = "general_inquiry", "General Inquiry"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In Progress"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"

    subject = models.CharField(max_length=255)
    description = models.TextField()
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="submitted_tickets",
    )
    assigned_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tickets",
    )
    category = models.CharField(
        max_length=32,
        choices=Category.choices,
        default=Category.GENERAL_INQUIRY,
        db_index=True,
    )
    priority = models.CharField(
        max_length=16,
        choices=Priority.choices,
        default=Priority.LOW,
        db_index=True,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
        db_index=True,
    )
    ml_confidence = models.FloatField(null=True, blank=True)
    ai_suggested_reply = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if self.status == self.Status.RESOLVED and not self.resolved_at:
            self.resolved_at = timezone.now()
        elif self.status in (self.Status.OPEN, self.Status.IN_PROGRESS):
            self.resolved_at = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"#{self.id} {self.subject} ({self.status})"


class TicketMessage(models.Model):
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ticket_messages",
    )
    body = models.TextField()
    is_internal_note = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message by {self.sender.username} on Ticket #{self.ticket_id}"