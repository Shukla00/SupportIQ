from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Ticket

User = get_user_model()


class TicketWorkflowAndRBACTests(APITestCase):
    def setUp(self):
        self.customer1 = User.objects.create_user(
            username="cust1", email="c1@test.com", password="Password123!", role="customer"
        )
        self.customer2 = User.objects.create_user(
            username="cust2", email="c2@test.com", password="Password123!", role="customer"
        )
        self.agent = User.objects.create_user(
            username="agent1", email="a1@test.com", password="Password123!", role="agent"
        )
        self.ticket_list_url = reverse("ticket-list")
        self.analytics_url = reverse("ticket-analytics-summary")

    def test_customer_isolation_and_privilege_protection(self):
        self.client.force_authenticate(user=self.customer1)
        res = self.client.post(
            self.ticket_list_url,
            {
                "subject": "Cannot reset 2FA",
                "description": "Locked out of portal.",
                "priority": "high",  # Should be ignored for customer
                "status": "resolved",  # Should be ignored for customer
            },
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        ticket_id = res.data["id"]
        ticket = Ticket.objects.get(id=ticket_id)
        self.assertEqual(ticket.priority, Ticket.Priority.LOW)
        self.assertEqual(ticket.status, Ticket.Status.OPEN)

        # Customer 2 cannot access Customer 1's ticket
        self.client.force_authenticate(user=self.customer2)
        detail_url = reverse("ticket-detail", args=[ticket_id])
        self.assertEqual(self.client.get(detail_url).status_code, status.HTTP_404_NOT_FOUND)

    def test_agent_reply_transitions_status_and_tracks_resolution_analytics(self):
        ticket = Ticket.objects.create(
            subject="Invoice discrepancy",
            description="Charged twice on Pro plan",
            customer=self.customer1,
            category=Ticket.Category.BILLING,
        )
        self.client.force_authenticate(user=self.agent)
        msg_url = reverse("ticket-add-message", args=[ticket.id])
        msg_res = self.client.post(msg_url, {"body": "Checking your Stripe ledger now."})
        self.assertEqual(msg_res.status_code, status.HTTP_201_CREATED)

        ticket.refresh_from_db()
        self.assertEqual(ticket.status, Ticket.Status.IN_PROGRESS)
        self.assertEqual(ticket.assigned_agent, self.agent)

        # Resolve ticket and verify resolved_at + analytics
        detail_url = reverse("ticket-detail", args=[ticket.id])
        self.client.patch(detail_url, {"status": "resolved"})
        ticket.refresh_from_db()
        self.assertIsNotNone(ticket.resolved_at)

        analytics_res = self.client.get(self.analytics_url)
        self.assertEqual(analytics_res.status_code, status.HTTP_200_OK)
        self.assertEqual(analytics_res.data["resolved_tickets"], 1)