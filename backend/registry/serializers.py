from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, RegistrationApplication, AdminActionLog, 
    OTPVerification, AuthorizedOfficer, KYCUpdateRequest,
    PropertyRecord, TransferLog, ContactMessage
)



# Contact & Support
class ContactMessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ['is_responded']

# User Profiles
class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile
        fields = '__all__'

# Properties & Registry
class PropertyRecordSerializer(serializers.ModelSerializer):

    owner_details = UserProfileSerializer(source='current_owner', read_only=True)
    document_path = serializers.ImageField(source='original_application.document_path', read_only=True)
    transaction_hash = serializers.CharField(source='original_application.transaction_hash', read_only=True)

    class Meta:
        model = PropertyRecord
        fields = [
            'id', 'parcel_id', 'current_owner', 'location', 'area', 
            'land_image', 'original_application', 'is_active', 
            'created_at', 'updated_at', 'owner_details', 'document_path',
            'transaction_hash'
        ]

class TransferLogSerializer(serializers.ModelSerializer):

    from_user_details = UserProfileSerializer(source='from_user', read_only=True)
    to_user_details = UserProfileSerializer(source='to_user', read_only=True)
    class Meta:
        model = TransferLog
        fields = '__all__'

class RegistrationApplicationSerializer(serializers.ModelSerializer):

    user_details = UserProfileSerializer(source='user', read_only=True)
    class Meta:
        model = RegistrationApplication
        fields = '__all__'
        read_only_fields = ['user']

    def validate_area(self, value):
        if value <= 0:
            raise serializers.ValidationError("Area must be a positive number.")
        return value

    def validate_location(self, value):
        if not value or value.strip() == "":
            raise serializers.ValidationError("Location is required.")
        return value


# KYC & Officers
class KYCUpdateRequestSerializer(serializers.ModelSerializer):

    user_details = UserProfileSerializer(source='user', read_only=True)
    class Meta:
        model = KYCUpdateRequest
        fields = '__all__'
        read_only_fields = ['user', 'status', 'rejection_reason']

class AuthorizedOfficerSerializer(serializers.ModelSerializer):

    class Meta:
        model = AuthorizedOfficer
        fields = '__all__'
        read_only_fields = ['is_active', 'added_by', 'activated_at']

class AuthorizedOfficerWhitelistSerializer(serializers.ModelSerializer):

    class Meta:
        model = AuthorizedOfficer
        fields = ['wallet_address', 'full_name', 'email', 'employee_id', 'is_active', 'created_at', 'activated_at']


# AUTHENTICATION & REGISTRATION LOGIC
class UserRegistrationSerializer(serializers.Serializer):
    """
    Complex serializer for multi-step citizen registration.
    Handles base user creation, profile attachment, and OTP verification validation.
    """

    full_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    citizenship_no = serializers.CharField(max_length=20)
    wallet_address = serializers.CharField(max_length=42)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, default='Citizen')
    
    # New KYC Fields
    phone_number = serializers.CharField(max_length=15, required=True)
    dob = serializers.DateField(required=True)
    citizenship_issue_district = serializers.CharField(max_length=100, required=True)
    
    profile_picture = serializers.ImageField(required=True)
    citizenship_front = serializers.ImageField(required=True)
    citizenship_back = serializers.ImageField(required=True)

    def validate_wallet_address(self, value):
        # 1. Check if a UserProfile already exists
        try:
            profile = UserProfile.objects.get(wallet_address__iexact=value)
            # If they are already approved, they shouldn't be here
            if profile.kyc_status == 'Approved':
                raise serializers.ValidationError("This wallet is already verified. Please log in.")
            # If they are Rejected, we ALLOW them to proceed to re-submit
        except UserProfile.DoesNotExist:
            pass
        
        return value

    def validate_citizenship_no(self, value):
        wallet_address = self.initial_data.get('wallet_address')
        # Only error if this ID belongs to ANOTHER wallet
        existing = UserProfile.objects.filter(citizenship_no=value).exclude(wallet_address__iexact=wallet_address)
        if existing.exists():
            raise serializers.ValidationError("A user with this citizenship number already exists.")
        return value

    def validate_email(self, value):
        wallet_address = self.initial_data.get('wallet_address')
        # Only error if this email belongs to ANOTHER wallet
        existing = UserProfile.objects.filter(email__iexact=value).exclude(wallet_address__iexact=wallet_address)
        if existing.exists():
            raise serializers.ValidationError("A user with this email already exists.")
            
        # VERY IMPORTANT: Verify OTP was successful
        otp_verified = OTPVerification.objects.filter(email__iexact=value, is_verified=True).exists()
        if not otp_verified:
            raise serializers.ValidationError("Email address has not been verified via OTP.")
            
        return value

    def create(self, validated_data):
        try:
            # 1. Get or Create the base Django User
            user, created = User.objects.get_or_create(
                username=validated_data['wallet_address'],
                defaults={
                    'email': validated_data['email'],
                    'first_name': validated_data['full_name'].split(' ')[0],
                }
            )
            
            if not created:
                user.email = validated_data['email']
                user.first_name = validated_data['full_name'].split(' ')[0]
                user.save()

            # 2. Update or Create the UserProfile
            # We use update_or_create to handle re-submissions seamlessly
            profile, p_created = UserProfile.objects.update_or_create(
                user=user,
                defaults={
                    'full_name': validated_data['full_name'],
                    'email': validated_data['email'],
                    'citizenship_no': validated_data['citizenship_no'],
                    'wallet_address': validated_data['wallet_address'],
                    'role': validated_data['role'],
                    'phone_number': validated_data['phone_number'],
                    'dob': validated_data['dob'],
                    'citizenship_issue_district': validated_data['citizenship_issue_district'],
                    'profile_picture': validated_data.get('profile_picture'),
                    'citizenship_front': validated_data.get('citizenship_front'),
                    'citizenship_back': validated_data.get('citizenship_back'),
                    'kyc_status': 'Pending', # Reset to pending for re-review
                    'kyc_rejection_reason': None # Clear old reason
                }
            )
            return profile
        except Exception as e:
            # If User was created but Profile failed, cleanup
            if 'user' in locals():
                user.delete()
            raise e

