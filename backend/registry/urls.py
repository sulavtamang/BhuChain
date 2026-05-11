from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserProfileViewSet, 
    RegistrationApplicationViewSet, 
    WalletLoginView, 
    RegisterView,
    CheckRegistrationView,
    RequestOTPView,
    VerifyOTPView,
    AuthorizedOfficerViewSet,
    CheckOfficerStatusView,
    ActivateOfficerRoleView,
    KYCUpdateRequestViewSet,
    PropertyRecordViewSet,
    TransferLogViewSet,
    PendingCountsAPIView,
    SystemStatisticsView,
    ContactView
)

router = DefaultRouter()
router.register(r'users', UserProfileViewSet, basename='userprofile')
router.register(r'applications', RegistrationApplicationViewSet, basename='registration-application')
router.register(r'officers/whitelist', AuthorizedOfficerViewSet, basename='authorized-officer')
router.register(r'kyc-updates', KYCUpdateRequestViewSet, basename='kyc-update')
router.register(r'properties', PropertyRecordViewSet, basename='property-record')
router.register(r'transfer-logs', TransferLogViewSet, basename='transfer-log')

urlpatterns = [
    path('auth/wallet/', WalletLoginView.as_view(), name='wallet_login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/check/', CheckRegistrationView.as_view(), name='check_registration'),
    path('auth/otp/request/', RequestOTPView.as_view(), name='otp_request'),
    path('auth/otp/verify/', VerifyOTPView.as_view(), name='otp_verify'),
    path('auth/officer/status/', CheckOfficerStatusView.as_view(), name='officer_status'),
    path('auth/officer/activate/', ActivateOfficerRoleView.as_view(), name='officer_activate'),
    path('notifications/pending-counts/', PendingCountsAPIView.as_view(), name='pending_counts'),
    path('stats/', SystemStatisticsView.as_view(), name='system_stats'),
    path('contact/', ContactView.as_view(), name='contact'),
    path('', include(router.urls))
]