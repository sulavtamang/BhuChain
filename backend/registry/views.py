from rest_framework import viewsets
from .models import UserProfile, RegistrationApplication, AdminActionLog
from .serializers import UserProfileSerializer, RegistrationApplicationSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    # In a real app, we would add permission classes here to restrict access
    # e.g., permission_classes = [IsAuthenticated]

class RegistrationApplicationViewSet(viewsets.ModelViewSet):
    queryset = RegistrationApplication.objects.all()
    serializer_class = RegistrationApplicationSerializer