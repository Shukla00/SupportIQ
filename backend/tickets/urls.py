# backend/tickets/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, TicketAnalyticsSummaryView

router = DefaultRouter()
router.register(r"", TicketViewSet, basename="ticket")

urlpatterns = [
    path("analytics/summary/", TicketAnalyticsSummaryView.as_view(), name="ticket-analytics-summary"),
    path("", include(router.urls)),
]