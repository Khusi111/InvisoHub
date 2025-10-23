from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Account, Client, Company, Invoice, InvoiceItem, Payment, BankDetail, ActivityLog
from .serializers import (
    AccountSerializer,
    ClientSerializer,
    CompanySerializer,
    InvoiceSerializer,
    InvoiceItemSerializer,
    PaymentSerializer,
    BankDetailSerializer,
    ActivityLogSerializer,
)

# -------------------------
# Auth Views
# -------------------------

class RegisterView(APIView):
    def post(self, request):
        email = request.data.get("email")
        name = request.data.get("name") or request.data.get("username")
        password = request.data.get("password")

        if not email or not name or not password:
            return Response({"error": "All fields (email, name/username, password) are required"},
                            status=status.HTTP_400_BAD_REQUEST)

        if Account.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = Account.objects.create_user(email=email, name=name, password=password)
        return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, email=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# -------------------------
# ModelViewSets for core models
# -------------------------

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    # Optional: filter clients per user (requires Client.user FK to Account)
    # def get_queryset(self):
    #     return Client.objects.filter(user=self.request.user)

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

class InvoiceItemViewSet(viewsets.ModelViewSet):
    queryset = InvoiceItem.objects.all()
    serializer_class = InvoiceItemSerializer
    permission_classes = [IsAuthenticated]

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

class BankDetailViewSet(viewsets.ModelViewSet):
    queryset = BankDetail.objects.all()
    serializer_class = BankDetailSerializer
    permission_classes = [IsAuthenticated]

class ActivityLogViewSet(viewsets.ModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
