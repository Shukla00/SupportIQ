from rest_framework import serializers
from .models import Ticket, TicketMessage


class TicketMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    sender_role = serializers.CharField(source="sender.role", read_only=True)

    class Meta:
        model = TicketMessage
        fields = (
            "id",
            "ticket",
            "sender",
            "sender_username",
            "sender_role",
            "body",
            "is_internal_note",
            "created_at",
        )
        read_only_fields = ("id", "ticket", "sender", "sender_username", "sender_role", "created_at")


class TicketListSerializer(serializers.ModelSerializer):
    customer_username = serializers.CharField(source="customer.username", read_only=True)
    assigned_agent_username = serializers.CharField(
        source="assigned_agent.username", read_only=True, default=None
    )
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = Ticket
        fields = (
            "id",
            "subject",
            "customer",
            "customer_username",
            "assigned_agent",
            "assigned_agent_username",
            "category",
            "category_display",
            "priority",
            "status",
            "ml_confidence",
            "created_at",
            "updated_at",
            "resolved_at",
        )
        read_only_fields = ("id", "customer", "ml_confidence", "created_at", "updated_at", "resolved_at")


class TicketDetailSerializer(TicketListSerializer):
    messages = serializers.SerializerMethodField()

    class Meta(TicketListSerializer.Meta):
        fields = TicketListSerializer.Meta.fields + (
            "description",
            "ai_suggested_reply",
            "messages",
        )

    def get_messages(self, obj):
        request = self.context.get("request")
        qs = obj.messages.select_related("sender").all()
        if request and request.user.role == "customer":
            qs = qs.filter(is_internal_note=False)
        return TicketMessageSerializer(qs, many=True).data


class TicketCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = (
            "id",
            "subject",
            "description",
            "category",
            "priority",
            "status",
            "assigned_agent",
        )
        read_only_fields = ("id",)

    def validate(self, attrs):
        request = self.context.get("request")
        # Customers cannot manually set status, priority, or assigned_agent
        if request and request.user.role == "customer":
            for restricted_field in ("status", "priority", "assigned_agent", "category"):
                attrs.pop(restricted_field, None)
        return attrs