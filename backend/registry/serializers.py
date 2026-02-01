from rest_framework import serializers
from .models import UserProfile, RegistrationApplication, AdminActionLog

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
    
class RegistrationApplicationSerializer(serializers.ModelSerializer):
    # This ensures we get the User's details, not just their ID
    user_details = UserProfileSerializer(source='user', read_only=True)
    class Meta:
        model = RegistrationApplication
        fields = '__all__'

