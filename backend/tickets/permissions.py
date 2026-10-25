from rest_framework.permissions import BasePermission


class CanAccessTicket(BasePermission):
    """
    Agents and Admins can access all tickets.
    Customers can only view and reply to their own submitted tickets.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in ("agent", "admin"):
            return True
        return obj.customer_id == user.id