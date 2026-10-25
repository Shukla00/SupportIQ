from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, CurrentUserView, UserListAdminView, UserRoleUpdateAdminView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", TokenObtainPairView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("me/", CurrentUserView.as_view(), name="auth-me"),
    path("users/", UserListAdminView.as_view(), name="admin-user-list"),
    path("users/<int:pk>/role/", UserRoleUpdateAdminView.as_view(), name="admin-user-role"),
]