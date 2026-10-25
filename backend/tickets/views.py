from django.db.models import Count, Avg, F, ExpressionWrapper, fields
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAgentOrAdmin
from knowledge.models import KnowledgeArticle
from .models import Ticket
from .permissions import CanAccessTicket
from .serializers import (
    TicketListSerializer,
    TicketDetailSerializer,
    TicketCreateUpdateSerializer,
    TicketMessageSerializer,
)


class TicketViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, CanAccessTicket]

    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.select_related("customer", "assigned_agent")
        if user.role == "customer":
            queryset = queryset.filter(customer=user)

        status_param = self.request.query_params.get("status")
        category_param = self.request.query_params.get("category")
        priority_param = self.request.query_params.get("priority")

        if status_param:
            queryset = queryset.filter(status=status_param)
        if category_param:
            queryset = queryset.filter(category=category_param)
        if priority_param:
            queryset = queryset.filter(priority=priority_param)

        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return TicketListSerializer
        if self.action == "retrieve":
            return TicketDetailSerializer
        return TicketCreateUpdateSerializer

    def perform_create(self, serializer):
        # Phase 4 ML Classifier hook will automatically enrich category & priority here
        serializer.save(customer=self.request.user)

    @action(detail=True, methods=["post"], url_path="messages")
    def add_message(self, request, pk=None):
        ticket = self.get_object()
        serializer = TicketMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        is_internal = serializer.validated_data.get("is_internal_note", False)
        if request.user.role == "customer" and is_internal:
            is_internal = False

        message = serializer.save(
            ticket=ticket,
            sender=request.user,
            is_internal_note=is_internal,
        )

        # Automatically move ticket to 'in_progress' when an agent replies to an open ticket
        if request.user.role in ("agent", "admin") and ticket.status == Ticket.Status.OPEN:
            ticket.status = Ticket.Status.IN_PROGRESS
            if not ticket.assigned_agent:
                ticket.assigned_agent = request.user
            ticket.save(update_fields=["status", "assigned_agent", "updated_at"])

        return Response(TicketMessageSerializer(message).data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["post"],
        url_path="generate-ai-reply",
        permission_classes=[IsAgentOrAdmin],
    )
    def generate_ai_reply(self, request, pk=None):
        """
        Retrieves matching Knowledge Base articles and drafts a response.
        In Phase 5, this connects to the configurable Ollama Qwen 2.5 7B service.
        """
        ticket = self.get_object()
        matching_articles = KnowledgeArticle.objects.filter(
            category=ticket.category, is_published=True
        )[:3]

        articles_payload = [
            {"id": art.id, "title": art.title, "category": art.category}
            for art in matching_articles
        ]

        kb_context = (
            f"Based on our '{ticket.get_category_display()}' documentation "
            f"({', '.join(a['title'] for a in articles_payload)})"
            if articles_payload
            else f"Regarding your {ticket.get_category_display()} request"
        )

        draft = (
            f"Hello {ticket.customer.username},\n\n"
            f"Thank you for contacting SupportIQ regarding \"{ticket.subject}\". "
            f"{kb_context}, our team is reviewing the details of your {ticket.priority}-priority ticket. "
            f"Please let us know if you have any additional logs or screenshots to share.\n\n"
            f"Best regards,\nSupportIQ Operations"
        )

        ticket.ai_suggested_reply = draft
        ticket.save(update_fields=["ai_suggested_reply", "updated_at"])

        return Response(
            {
                "ticket_id": ticket.id,
                "suggested_reply": draft,
                "articles": articles_payload,
                "requires_human_approval": True,
            },
            status=status.HTTP_200_OK,
        )


class TicketAnalyticsSummaryView(APIView):
    permission_classes = [ permissions.IsAuthenticated ]

    def get(self, request):
        queryset = Ticket.objects.all()
        if request.user.role == "customer":
            queryset = queryset.filter(customer=request.user)

        total_tickets = queryset.count()
        open_tickets = queryset.filter(
            status__in=[Ticket.Status.OPEN, Ticket.Status.IN_PROGRESS]
        ).count()
        resolved_tickets = queryset.filter(status=Ticket.Status.RESOLVED).count()

        # Calculate real average resolution time in hours using PostgreSQL interval math
        duration_expr = ExpressionWrapper(
            F("resolved_at") - F("created_at"),
            output_field=fields.DurationField(),
        )
        resolved_qs = queryset.filter(
            status=Ticket.Status.RESOLVED, resolved_at__isnull=False
        ).annotate(resolution_duration=duration_expr)

        avg_duration = resolved_qs.aggregate(avg_time=Avg("resolution_duration"))["avg_time"]
        avg_resolution_hours = (
            round(avg_duration.total_seconds() / 3600, 1) if avg_duration else 0.0
        )

        by_category = list(
            queryset.values("category").annotate(count=Count("id")).order_by("-count")
        )
        by_priority = list(
            queryset.values("priority").annotate(count=Count("id")).order_by("-count")
        )

        return Response(
            {
                "total_tickets": total_tickets,
                "open_tickets": open_tickets,
                "resolved_tickets": resolved_tickets,
                "avg_resolution_hours": avg_resolution_hours,
                "by_category": by_category,
                "by_priority": by_priority,
            }
        )