from rest_framework import viewsets
from .models import UserProfile, RegistrationApplication, AdminActionLog
from .serializers import UserProfileSerializer, RegistrationApplicationSerializer
from rest_framework.permissions import IsAuthenticated

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['role', 'is_verified', 'citizenship_no']
    
    def get_queryset(self):
        # Security Logic:
        # 1. If Officer -> Show All
        # 2. If Citizen -> Show Only Self
        user = self.request.user
        if user.is_staff:
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user__user=user)

class RegistrationApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = RegistrationApplicationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'parcel_id']


    def get_queryset(self):
        # Security Logic:
        # Officers see all applications; Citizens see only their own applications
        user = self.request.user
        if user.is_staff:
            return RegistrationApplication.objects.all()
        # We look up applications where the 'user' (UserProfile) matches the logged-in user
        return RegistrationApplication.objects.filter(user__user=user)