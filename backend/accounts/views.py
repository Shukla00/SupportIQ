from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from .serializers import RegisterSerializer, UserSerializer, AdminRoleUpdateSerializer
from .permissions import IsAdminRole

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class UserListAdminView(generics.ListAPIView):
    queryset = User.objects.all().order_by("-created_at")
    serializer_class = UserSerializer
    permission_classes = (IsAdminRole,)


class UserRoleUpdateAdminView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminRoleUpdateSerializer
    permission_classes = (IsAdminRole,)