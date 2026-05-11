from django.db import transaction, models
from django.core.mail import send_mail
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta
import random

from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser

from eth_account import Account
from eth_account.messages import encode_defunct

from django.conf import settings
from .models import (
    UserProfile, RegistrationApplication, AdminActionLog, 
    OTPVerification, AuthorizedOfficer, KYCUpdateRequest,
    PropertyRecord, TransferLog, ContactMessage
)
from .serializers import (
    UserProfileSerializer, 
    RegistrationApplicationSerializer, 
    UserRegistrationSerializer,
    AuthorizedOfficerSerializer,
    KYCUpdateRequestSerializer,
    PropertyRecordSerializer,
    TransferLogSerializer,
    ContactMessageSerializer
)
from .blockchain_service import blockchain
from .authentication import get_or_refresh_token
from .utils import flatten_errors, log_admin_action

# System Analytics & Stats
class SystemStatisticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        total_parcels = PropertyRecord.objects.count()
        
        # Count unique districts from both verified properties and pending applications
        verified_districts = set(PropertyRecord.objects.values_list('location', flat=True).distinct())
        applied_districts = set(RegistrationApplication.objects.values_list('location', flat=True).distinct())
        total_districts = len(verified_districts.union(applied_districts))

        total_transfers = TransferLog.objects.count()
        total_citizens = UserProfile.objects.filter(role='Citizen').count()
        
        # Breakdown of top locations for the dashboard
        top_districts = list(PropertyRecord.objects.values('location')
                            .annotate(count=models.Count('id'))
                            .order_by('-count')[:5])
        
        # Rename 'location' key to 'district' in the list to maintain frontend compatibility
        for item in top_districts:
            item['district'] = item.pop('location')

        return Response({
            'total_parcels': total_parcels,
            'total_districts': total_districts,
            'total_transfers': total_transfers,
            'total_citizens': total_citizens,
            'top_districts': top_districts,
            'status': 'Synchronized'
        })

# Contact/Support Messages
class ContactView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            contact_msg = serializer.save()
            
            # Send Email Notification to Admin
            try:
                subject = f"BhuChain Support: {contact_msg.subject}"
                body = (
                    f"You have received a new contact request via the BhuChain platform.\n\n"
                    f"Name: {contact_msg.name}\n"
                    f"Email: {contact_msg.email}\n"
                    f"Subject: {contact_msg.subject}\n"
                    f"Message:\n{contact_msg.message}\n\n"
                    f"Sent At: {contact_msg.created_at}"
                )
                send_mail(
                    subject,
                    body,
                    settings.DEFAULT_FROM_EMAIL,
                    [settings.DEFAULT_FROM_EMAIL], # Send to self (the admin)
                    fail_silently=False,
                )
            except Exception as e:
                # Log but don't fail the request if email fails (message is already in DB)
                print(f"Failed to send contact email: {e}")
            
            return Response({
                "message": "Thank you for reaching out! Our team will get back to you shortly."
            }, status=status.HTTP_201_CREATED)
            
        return Response({'error': flatten_errors(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)


# KYC Updates & Identity Management
class KYCUpdateRequestViewSet(viewsets.ModelViewSet):
    serializer_class = KYCUpdateRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Officers see everything; Citizens see only their own requests
        if hasattr(user, 'profile') and user.profile.role == 'Officer':
            return KYCUpdateRequest.objects.all()
        return KYCUpdateRequest.objects.filter(user=user.profile)

    def perform_create(self, serializer):
        # Ensure only one pending request per user
        pending = KYCUpdateRequest.objects.filter(user=self.request.user.profile, status='Pending').exists()
        if pending:
            raise serializers.ValidationError("You already have a pending update request. Please wait for approval.")
        serializer.save(user=self.request.user.profile)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.profile.role != 'Officer':
            return Response({'error': 'Only officers can approve KYC updates.'}, status=status.HTTP_403_FORBIDDEN)
        
        instance = self.get_object()
        if instance.status != 'Pending':
            return Response({'error': 'Can only approve pending requests.'}, status=status.HTTP_400_BAD_REQUEST)

        # Sync data to UserProfile
        profile = instance.user
        profile.full_name = instance.full_name
        profile.email = instance.email
        profile.citizenship_no = instance.citizenship_no
        profile.phone_number = instance.phone_number
        profile.dob = instance.dob
        profile.citizenship_issue_district = instance.citizenship_issue_district
        
        if instance.profile_picture:
            profile.profile_picture = instance.profile_picture
        if instance.citizenship_front:
            profile.citizenship_front = instance.citizenship_front
        if instance.citizenship_back:
            profile.citizenship_back = instance.citizenship_back
        
        profile.save()

        # Update request status
        instance.status = 'Approved'
        instance.save()

        # Log action (DRY)
        log_admin_action(
            request.user, 
            'Approve KYC Update', 
            remarks=f"Approved profile update for {profile.full_name}"
        )

        return Response({'message': 'Profile updated successfully.'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.profile.role != 'Officer':
            return Response({'error': 'Only officers can reject KYC updates.'}, status=status.HTTP_403_FORBIDDEN)
        
        reason = request.data.get('reason')
        if not reason:
            return Response({'error': 'Rejection reason is required.'}, status=status.HTTP_400_BAD_REQUEST)

        instance = self.get_object()
        instance.status = 'Rejected'
        instance.rejection_reason = reason
        instance.save()

        # Log action
        log_admin_action(
            request.user, 
            'Reject KYC Update', 
            remarks=f"Rejected profile update for {instance.user.full_name}. Reason: {reason}"
        )

        return Response({'message': 'Request rejected.'})


class AuthorizedOfficerViewSet(viewsets.ModelViewSet):
    queryset = AuthorizedOfficer.objects.all()
    serializer_class = AuthorizedOfficerSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)

class CheckOfficerStatusView(APIView):
    """
    Check if a wallet address is pre-authorized to become an officer.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        wallet_address = request.query_params.get('wallet_address')
        if not wallet_address:
            return Response({'error': 'wallet_address is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            auth_record = AuthorizedOfficer.objects.get(wallet_address__iexact=wallet_address)
            
            # If they are whitelisted but don't have a profile yet, they are authorized to onboard
            profile_exists = UserProfile.objects.filter(wallet_address__iexact=wallet_address).exists()
            
            if not profile_exists:
                return Response({
                    'is_authorized': True,
                    'full_name': auth_record.full_name,
                    'email': auth_record.email,
                    'employee_id': auth_record.employee_id
                }, status=status.HTTP_200_OK)
            
            # If they HAVE a profile, they aren't "authorized to onboard" (they should just log in)
            return Response({'is_authorized': False}, status=status.HTTP_200_OK)
        except AuthorizedOfficer.DoesNotExist:
            return Response({'is_authorized': False}, status=status.HTTP_200_OK)

class ActivateOfficerRoleView(APIView):
    """
    Finalize officer onboarding using a cryptographic signature.
    """
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        wallet_address = request.data.get('wallet_address')
        signature = request.data.get('signature')
        message = request.data.get('message')

        if not wallet_address or not signature or not message:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Verify Signature
            encoded_msg = encode_defunct(text=message)
            recovered_address = Account.recover_message(encoded_msg, signature=signature)

            if recovered_address.lower() != wallet_address.lower():
                return Response({'error': 'Invalid signature'}, status=status.HTTP_401_UNAUTHORIZED)

            # 2. Check Authorization Whitelist
            auth_record = AuthorizedOfficer.objects.get(wallet_address__iexact=wallet_address, is_active=False)

            # 2.5 PRE-CHECK: Is this email already taken by ANOTHER wallet?
            # We must do this because get_or_create will fail on the email unique constraint 
            # if the user doesn't exist but the email does.
            existing_email_profile = UserProfile.objects.filter(email__iexact=auth_record.email).exclude(wallet_address__iexact=wallet_address).first()
            if existing_email_profile:
                return Response({
                    'error': f"The email '{auth_record.email}' is already associated with another wallet address ({existing_email_profile.wallet_address[:6]}...). Please use a unique official email for this officer."
                }, status=status.HTTP_400_BAD_REQUEST)

            # 3. Create or Update User/Profile
            user, created = User.objects.get_or_create(
                username=wallet_address,
                defaults={
                    'email': auth_record.email,
                    'first_name': auth_record.full_name.split(' ')[0],
                }
            )
            user.set_unusable_password()
            user.save()

            profile, p_created = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'wallet_address': wallet_address,
                    'full_name': auth_record.full_name,
                    'email': auth_record.email,
                    'role': 'Officer',
                    'citizenship_no': f"OFFICER-{auth_record.employee_id}" if auth_record.employee_id else f"OFFICER-{wallet_address[:8].upper()}",
                    'is_verified': True,
                    'kyc_status': 'Approved'
                }
            )

            # If profile existed (e.g. they registered as a citizen first), promote them
            if not p_created:
                profile.role = 'Officer'
                profile.is_verified = True
                profile.kyc_status = 'Approved'
                profile.save()

            # 4. Mark Whitelist as Active
            auth_record.is_active = True
            auth_record.activated_at = timezone.now()
            auth_record.save()

            # 5. Generate/Refresh Token (DRY)
            token_key = get_or_refresh_token(user)

            return Response({
                'message': 'Officer credentials activated successfully.',
                'token': token_key,
                'role': 'Officer'
            }, status=status.HTTP_200_OK)

        except AuthorizedOfficer.DoesNotExist:
            return Response({'error': 'Wallet not authorized for officer role or already activated.'}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# WALLET AUTHENTICATION & REGISTRATION
class WalletLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        wallet_address = request.data.get('wallet_address')
        signature = request.data.get('signature')
        message = request.data.get('message')

        if not wallet_address or not signature or not message:
            return Response({'error': 'wallet_address, signature, and message are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # 1. Cryptographic Signature Verification
            # Prepare the message for recovery
            encoded_msg = encode_defunct(text=message)
            # Recover the address that signed exactly this message
            recovered_address = Account.recover_message(encoded_msg, signature=signature)

            # 2. Compare with provided address
            if recovered_address.lower() != wallet_address.lower():
                return Response({'error': 'Invalid cryptographic signature. Ownership of wallet could not be verified.'}, status=status.HTTP_401_UNAUTHORIZED)

            # 3. Check if this wallet exists in our UserProfile registry
            profile = UserProfile.objects.get(wallet_address__iexact=wallet_address)
            
            # 4. Retrieve or generate the auth token (DRY)
            token_key = get_or_refresh_token(profile.user)
            
            return Response({
                'token': token_key,
                'user_id': profile.id,
                'role': profile.role,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
            
        except UserProfile.DoesNotExist:
            return Response({
                'error': 'Wallet address not found in registry. Please register.',
                'code': 'USER_NOT_FOUND'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Signature verification error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

class CheckRegistrationView(APIView):
    """
    Public endpoint to check if a wallet address is already registered.
    Used for UI flow control (Register vs Login).
    """
    permission_classes = [AllowAny]

    def get(self, request):
        wallet_address = request.query_params.get('wallet_address')
        if not wallet_address:
            return Response({'error': 'wallet_address is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # We return true if a complete UserProfile exists.
        # However, we also return the kyc_status so the frontend can handle re-submissions.
        try:
            profile = UserProfile.objects.get(wallet_address__iexact=wallet_address)
            return Response({
                'is_registered': True,
                'kyc_status': profile.kyc_status
            }, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({
                'is_registered': False,
                'kyc_status': None
            }, status=status.HTTP_200_OK)

class RequestOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        wallet_address = request.data.get('wallet_address')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email is used by ANOTHER wallet address
        # If wallet_address is provided, we exclude it from the search (allowing re-submission)
        existing_users = UserProfile.objects.filter(email__iexact=email)
        if wallet_address:
            existing_users = existing_users.exclude(wallet_address__iexact=wallet_address)
            
        if existing_users.exists():
            return Response({'error': 'A user with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        
        # Save or update OTP
        OTPVerification.objects.update_or_create(
            email=email,
            defaults={'otp_code': otp_code, 'is_verified': False, 'created_at': timezone.now()}
        )
        
        # Send Email
        send_mail(
            subject='BhuChain: Your Verification Code',
            message=f'Your BhuChain registration verification code is: {otp_code}\n\nThis code will expire in 10 minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        
        return Response({'message': 'OTP sent successfully.'}, status=status.HTTP_200_OK)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        
        if not email or not otp_code:
            return Response({'error': 'Email and OTP code are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            otp_record = OTPVerification.objects.get(email=email)
            
            # Check expiration (10 minutes)
            if timezone.now() > otp_record.created_at + timedelta(minutes=10):
                return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
                
            if otp_record.otp_code == otp_code:
                otp_record.is_verified = True
                otp_record.save()
                return Response({'message': 'Email verified successfully.'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid OTP code.'}, status=status.HTTP_400_BAD_REQUEST)
        except OTPVerification.DoesNotExist:
            return Response({'error': 'No OTP request found for this email.'}, status=status.HTTP_404_NOT_FOUND)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    @transaction.atomic
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': flatten_errors(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = serializer.save()
            
            # Generate token immediately (DRY)
            token_key = get_or_refresh_token(profile.user)
            
            return Response({
                'token': token_key,
                'user_id': profile.id,
                'role': profile.role,
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Catch database integrity errors or other crashes
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# USER PROFILE & SEARCH
class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['role', 'is_verified', 'citizenship_no']
    
    def get_queryset(self):
        # Security Logic:
        # 1. If Officer or Admin -> Show All
        # 2. If Citizen -> Show Only Self
        user = self.request.user
        if user.is_staff or (hasattr(user, 'profile') and user.profile.role == 'Officer'):
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def lookup(self, request):
        """
        Secure endpoint to lookup a citizen by their Citizenship Number.
        Returns ONLY public/safe data necessary for land transfer verification.
        """
        citizenship_no = request.query_params.get('citizenship_no')
        if not citizenship_no:
            return Response({'error': 'Citizenship number is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            profile = UserProfile.objects.get(citizenship_no=citizenship_no)
            
            # Prevent users from transferring land to themselves
            if profile.user == request.user:
                return Response({'error': 'You cannot transfer land to your own account.'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'full_name': profile.full_name,
                'wallet_address': profile.wallet_address,
                'citizenship_no': profile.citizenship_no,
                'profile_picture': profile.profile_picture.url if profile.profile_picture else None,
            }, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({'error': 'No registered citizen found with this citizenship number.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def approve_kyc(self, request, pk=None):
        """
        Officer endpoint to approve a citizen's KYC.
        """
        if request.user.profile.role != 'Officer':
            return Response({'error': 'Only officers can approve KYC.'}, status=status.HTTP_403_FORBIDDEN)
        
        profile = self.get_object()
        profile.kyc_status = 'Approved'
        profile.is_verified = True
        profile.save()
        
        # Log action
        log_admin_action(
            request.user, 
            'Approve Citizen KYC', 
            remarks=f"Verified citizen identity for {profile.full_name} ({profile.citizenship_no})"
        )
        
        return Response({'message': 'KYC Approved successfully.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reject_kyc(self, request, pk=None):
        """
        Officer endpoint to reject a citizen's KYC.
        """
        if request.user.profile.role != 'Officer':
            return Response({'error': 'Only officers can reject KYC.'}, status=status.HTTP_403_FORBIDDEN)
        
        reason = request.data.get('reason')
        if not reason:
            return Response({'error': 'Rejection reason is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        profile = self.get_object()
        profile.kyc_status = 'Rejected'
        profile.kyc_rejection_reason = reason
        profile.is_verified = False
        profile.save()

        # Log action (DRY)
        log_admin_action(
            request.user, 
            'Reject Citizen KYC', 
            remarks=f"Rejected KYC for {profile.full_name} ({profile.citizenship_no}). Reason: {reason}"
        )
        
        return Response({'message': 'KYC Rejected successfully.'})


# LAND REGISTRATION APPLICATIONS
class RegistrationApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = RegistrationApplicationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'parcel_id']


    def get_queryset(self):
        # Security Logic:
        # Officers see all applications; Citizens see only their own applications
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'Officer':
            return RegistrationApplication.objects.all()
        # Filter applications by the profile belonging to the current user
        return RegistrationApplication.objects.filter(user__user=user)

    def perform_create(self, serializer):
        # 1. Strict Input Validation (Production-Grade)
        area = self.request.data.get('area')
        if area is not None:
            try:
                if float(area) <= 0:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError({'area': 'Land area must be a positive number.'})
            except (ValueError, TypeError):
                pass
        
        # 2. Automatically link the application to the current user's profile
        serializer.save(user=self.request.user.profile)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """
        Custom update logic to enforce security and trigger property creation:
        1. Only officers can change status to Approved/Rejected.
        2. On Approval + parcel_id assignment, create a PropertyRecord.
        3. Citizens can only edit if status is Rejected or Pending.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        user_profile = request.user.profile
        
        # Data being sent in this request
        new_status = request.data.get('status')
        parcel_id = request.data.get('parcel_id')
        
        # 1. STATUS CHANGE PROTECTION
        if new_status and new_status != instance.status:
            if user_profile.role != 'Officer':
                return Response(
                    {"error": "Only authorized officers can change application status."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # 2. CITIZEN EDIT PROTECTION
        if user_profile.role == 'Citizen':
            if instance.status not in ['Rejected', 'Pending']:
                return Response(
                    {"error": f"Cannot modify application in '{instance.status}' state."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if instance.status == 'Rejected':
                if hasattr(request.data, '_mutable'):
                    request.data._mutable = True
                request.data['status'] = 'Pending'
                request.data['rejection_reason'] = None

        # 3. BLOCKCHAIN VERIFICATION (The "Truth Checker")
        # If the officer is approving, we MUST verify the parcel exists on the blockchain
        if new_status == 'Approved' and parcel_id:
            on_chain_data = blockchain.get_parcel_details(int(parcel_id))
            
            if not on_chain_data:
                return Response(
                    {"error": f"BLOCKCHAIN VERIFICATION FAILED: Parcel ID {parcel_id} not found on the smart contract."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify Owner (Case-insensitive comparison for Ethereum addresses)
            if on_chain_data['owner'].lower() != instance.user.wallet_address.lower():
                return Response(
                    {"error": f"SECURITY BREACH: On-chain owner ({on_chain_data['owner'][:10]}...) does not match applicant wallet ({instance.user.wallet_address[:10]}...)."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify Location matches
            if on_chain_data['location'] != instance.location:
                return Response(
                    {"error": f"DATA MISMATCH: On-chain location '{on_chain_data['location']}' does not match application '{instance.location}'."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        updated_instance = serializer.save()

        # 3. PRODUCTION-GRADE STATE DECOUPLING
        # If the application was just approved and has a parcel_id, create the live PropertyRecord
        if updated_instance.status == 'Approved' and updated_instance.parcel_id:
            prop, created = PropertyRecord.objects.get_or_create(
                parcel_id=updated_instance.parcel_id,
                defaults={
                    'current_owner': updated_instance.user,
                    'location': updated_instance.location,
                    'area': updated_instance.area,
                    'land_image': updated_instance.land_image,
                    'original_application': updated_instance
                }
            )

            # 4. Create Genesis Transfer Log (Official Registration)
            if created:
                TransferLog.objects.create(
                    property_record=prop,
                    from_user=None, # Genesis: From Government/Registry
                    to_user=updated_instance.user,
                    transaction_hash=
                    updated_instance.transaction_hash or "GENESIS-REGISTRATION", 
                    sale_price=None, # Initial registration has no sale price
                )

        # 5. Record Officer Action Log (Audit Trail)
        # Only log if an actual status change was made by an Officer
        if user_profile.role == 'Officer' and new_status:
            log_admin_action(
                request.user,
                f"{updated_instance.status} Land Application",
                application=updated_instance,
                remarks=updated_instance.rejection_reason or f"Application {updated_instance.status.lower()}."
            )

        return Response(serializer.data)


# PROPERTY REGISTRY & OWNERSHIP SYNC
class PropertyRecordViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Production-Grade Property Registry.
    Shows current ownership and allows owners to sync blockchain transfers to the DB.
    """
    queryset = PropertyRecord.objects.all()
    serializer_class = PropertyRecordSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['parcel_id']

    def get_queryset(self):
        user = self.request.user
        # Officers see all; Citizens see what they currently own
        if hasattr(user, 'profile') and user.profile.role == 'Officer':
            return PropertyRecord.objects.all()
        return PropertyRecord.objects.filter(current_owner__user=user)

    @action(detail=False, methods=['post'], url_path='sync-transfer')
    @transaction.atomic
    def sync_transfer(self, request):
        """
        Global sync endpoint for property transfers.
        Updates the PropertyRecord owner and logs the history.
        """
        parcel_id = request.data.get('parcel_id')
        new_wallet = request.data.get('new_wallet_address')
        tx_hash = request.data.get('tx_hash', 'Sync-External')
        sale_price = request.data.get('sale_price', None)
        
        if not parcel_id or not new_wallet:
            return Response({"error": "parcel_id and new_wallet_address are required"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Verify Property Exists
        try:
            prop = PropertyRecord.objects.get(parcel_id=parcel_id)
        except PropertyRecord.DoesNotExist:
            return Response({"error": "Property record not found in database."}, status=status.HTTP_404_NOT_FOUND)

        # 2. Verify Recipient
        try:
            target_profile = UserProfile.objects.get(wallet_address__iexact=new_wallet)
        except UserProfile.DoesNotExist:
            return Response({"error": "Recipient is not registered on BhuChain."}, status=status.HTTP_404_NOT_FOUND)

        # 3. Security: The sender must be the current DB owner OR an Officer
        if prop.current_owner != request.user.profile and request.user.profile.role != 'Officer':
            return Response({"error": "Unauthorized to sync this transfer."}, status=status.HTTP_403_FORBIDDEN)

        # 4. Execute Handover
        old_owner = prop.current_owner
        prop.current_owner = target_profile
        prop.save()

        # 5. Log History
        TransferLog.objects.create(
            property_record=prop,
            from_user=old_owner,
            to_user=target_profile,
            transaction_hash=tx_hash,
            sale_price=sale_price
        )

        return Response({
            "message": "Property ownership synchronized successfully.",
            "parcel_id": parcel_id,
            "new_owner": target_profile.full_name
        })

    @action(detail=False, methods=['get'], url_path='transfer-history', permission_classes=[AllowAny])
    def transfer_history(self, request):
        """
        Public endpoint to view the transfer history of a specific parcel.
        """
        parcel_id = request.query_params.get('parcel_id')
        if not parcel_id:
            return Response({"error": "parcel_id query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            prop = PropertyRecord.objects.get(parcel_id=parcel_id)
        except PropertyRecord.DoesNotExist:
            return Response({"error": "Property record not found in database."}, status=status.HTTP_404_NOT_FOUND)
            
        logs = TransferLog.objects.filter(property_record=prop).order_by('-timestamp')
        serializer = TransferLogSerializer(logs, many=True)
        return Response(serializer.data)


# TRANSACTION HISTORY
class TransferLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TransferLog.objects.all()
    serializer_class = TransferLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'Officer':
            return TransferLog.objects.all()
        # Citizens see logs where they are either the sender or receiver
        return TransferLog.objects.filter(
            models.Q(from_user__user=user) | models.Q(to_user__user=user)
        )


# NOTIFICATIONS / DASHBOARD COUNTS
class PendingCountsAPIView(APIView):
    """
    Returns counts of pending items requiring Officer action.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'Officer':
            return Response({'error': 'Only officers can view pending counts.'}, status=status.HTTP_403_FORBIDDEN)
            
        pending_apps = RegistrationApplication.objects.filter(status='Pending').count()
        pending_kyc = KYCUpdateRequest.objects.filter(status='Pending').count()
        
        return Response({
            "pending_applications": pending_apps,
            "pending_kyc": pending_kyc
        })
