from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthenticationAndRBACTests(APITestCase):
    def setUp(self):
        self.register_url = reverse("auth-register")
        self.login_url = reverse("auth-login")
        self.me_url = reverse("auth-me")
        self.user_list_url = reverse("admin-user-list")

    def test_customer_registration_prevents_role_escalation(self):
        payload = {
            "username": "jdoe",
            "email": "jdoe@example.com",
            "password": "StrongPassword123!",
            "password_confirm": "StrongPassword123!",
            "role": "admin",  # Attempt privilege escalation
        }
        response = self.client.post(self.register_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="jdoe")
        self.assertEqual(user.role, User.Role.CUSTOMER)

    def test_jwt_login_and_current_user_retrieval(self):
        User.objects.create_user(
            username="agent1",
            email="agent1@example.com",
            password="StrongPassword123!",
            role=User.Role.AGENT,
        )
        login_res = self.client.post(
            self.login_url, {"username": "agent1", "password": "StrongPassword123!"}
        )
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        access_token = login_res.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        me_res = self.client.get(self.me_url)
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertEqual(me_res.data["role"], "agent")

    def test_admin_endpoint_blocks_non_admin(self):
        User.objects.create_user(
            username="cust1",
            email="cust1@example.com",
            password="StrongPassword123!",
            role=User.Role.CUSTOMER,
        )
        login_res = self.client.post(
            self.login_url, {"username": "cust1", "password": "StrongPassword123!"}
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_res.data['access']}")
        res = self.client.get(self.user_list_url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)