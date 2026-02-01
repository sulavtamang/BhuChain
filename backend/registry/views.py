from rest_framework import viewsets
from .models import UserProfile, RegistrationApplication, AdminActionLog
from .serializers import UserProfileSerializer, RegistrationApplicationSerializer
from rest_framework.permissions import IsAuthenticated

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Security Logic:
        # 1. If Officer -> Show All
        # 2. If Citizen -> Show Only Self
        user = self.request.user
        if user.is_staff:
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=user)

class RegistrationApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = RegistrationApplicationSerializer
    permission_class = [IsAuthenticated]

    def get_queryset(self):
        # Security Logic:
        # Officers see all apps; Citizens see only their own apps
        user = self.request.user
        if user.is_staff:
            return RegistrationApplication.objects.all()
        # We look up applications where the 'user' (UserProfile) matches the logged-in user
        return RegistrationApplication.objects.filter(user=user)