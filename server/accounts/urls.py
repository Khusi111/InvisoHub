from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    ClientViewSet,
    CompanyViewSet,
    InvoiceViewSet,
    InvoiceItemViewSet,
    PaymentViewSet,
    BankDetailViewSet,
    ActivityLogViewSet,
)

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'invoice-items', InvoiceItemViewSet, basename='invoiceitem')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'bank-details', BankDetailViewSet, basename='bankdetail')
router.register(r'activity-logs', ActivityLogViewSet, basename='activitylog')

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),

    # JWT token endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API ViewSets URLs
    path("", include(router.urls)),
]
