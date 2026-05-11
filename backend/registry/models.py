from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator, MinValueValidator


# Table 3.1: User Profile Table
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('Citizen', 'Citizen'),
        ('Officer', 'Officer'),
    ]

    # Link to the standard Django Auth User
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    # 0x.... Ethereum Address
    wallet_address = models.CharField(
        max_length=42,
        unique=True, 
        help_text="Ethereum Wallet Address", 
        validators=[RegexValidator(r'^0x[a-fA-F0-9]{40}$', 'Invalid Ethereum Address')]
    )

    #Critical KYC Field
    citizenship_no = models.CharField(
        max_length=20, 
        unique=True, 
        help_text="Government Citizenship ID"
    )

    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, null=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='Citizen')
    is_verified = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    dob = models.DateField(null=True, blank=True, help_text="Date of Birth")
    citizenship_issue_district = models.CharField(max_length=100, null=True, blank=True)
    
    # Document Uploads
    profile_picture = models.ImageField(upload_to='kyc/profiles/', null=True, blank=True)
    citizenship_front = models.ImageField(upload_to='kyc/citizenship_front/', null=True, blank=True)
    citizenship_back = models.ImageField(upload_to='kyc/citizenship_back/', null=True, blank=True)
    
    # Verification Status Tracking
    KYC_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected')
    ]
    kyc_status = models.CharField(max_length=20, choices=KYC_STATUS_CHOICES, default='Pending')
    kyc_rejection_reason = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.full_name} ({self.role} - {self.kyc_status})"


# OTP Verification Table
class OTPVerification(models.Model):
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.email} - {self.otp_code} (Verified: {self.is_verified})"


# Table 3.2: Registration Application Table
class RegistrationApplication(models.Model):
    """
    Historical record of a land registration request.
    This model represents the 'Process' and remains assigned to the original
    applicant even after the property is transferred to another user.
    """
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, help_text="The citizen who originally applied for registration")
    parcel_id = models.IntegerField(null=True, blank=True, help_text="Linked Blockchain Parcel ID (assigned upon approval)")
    location = models.CharField(max_length=255, null=True, blank=True, help_text="Physical location/address of the land")
    area = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text="Total area in square meters",
        validators=[MinValueValidator(0.01, message="Area must be greater than zero.")])
    land_image = models.ImageField(upload_to='land_pictures/', null=True, blank=True, help_text="Photograph of the land parcel")
    document_path = models.ImageField(upload_to='deeds/', help_text="Scanned copy of the original handwritten land deed (Lalpurja)")


    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    rejection_reason = models.TextField(null=True, blank=True, help_text="Reason for rejection, if applicable")
    transaction_hash = models.CharField(max_length=66, null=True, blank=True, help_text="Ethereum Transaction Hash (Minting Event)")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Application #{self.id} - {self.user.full_name} - {self.status}"


# Administrative audit trail for officer decisions
class AdminActionLog(models.Model):
    # Who performed the action (Must be an Officer)
    admin = models.ForeignKey(UserProfile, on_delete=models.CASCADE)

    # Which application was acted upon (optional for KYC actions)
    application = models.ForeignKey(RegistrationApplication, on_delete=models.CASCADE, null=True, blank=True)
    
    action_type = models.CharField(max_length=50, help_text="e.g., Approve Land Application, Reject KYC")
    remarks = models.TextField(null=True, blank=True, help_text="Officer's justification for the action")
    timestamp = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.action_type} - {self.admin.full_name} ({self.timestamp.strftime('%Y-%m-%d')})"


# Staging for identity profile updates
class KYCUpdateRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected')
    ]

    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='kyc_updates')
    
    # Proposed Changes (Mirrors UserProfile fields)
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    citizenship_no = models.CharField(max_length=20)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    citizenship_issue_district = models.CharField(max_length=100, null=True, blank=True)
    
    # Proposed Documents
    profile_picture = models.ImageField(upload_to='kyc_updates/profiles/', null=True, blank=True)
    citizenship_front = models.ImageField(upload_to='kyc_updates/citizenship_front/', null=True, blank=True)
    citizenship_back = models.ImageField(upload_to='kyc_updates/citizenship_back/', null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    rejection_reason = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Update Request: {self.user.full_name} ({self.status})"


# Table 3.3: Property Record (Current State)

class PropertyRecord(models.Model):
    """
    Represents the 'Live' state of a land parcel in the database.
    Unlike RegistrationApplication (which is historical), this 
    record is updated whenever a blockchain transfer occurs.
    """
    parcel_id = models.IntegerField(unique=True, help_text="Blockchain Parcel ID")
    current_owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='owned_properties')
    location = models.CharField(max_length=255)
    area = models.DecimalField(max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0.01, message="Area must be greater than zero.")])
    land_image = models.ImageField(upload_to='land_pictures/', null=True, blank=True)
    
    # Traceability
    original_application = models.OneToOneField(
        'RegistrationApplication', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='property_record'
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Parcel #{self.parcel_id} - Owner: {self.current_owner.full_name}"


# Table 3.4: Ownership Transfer Log

class TransferLog(models.Model):
    """
    Audit trail of all ownership transfers synchronized from the blockchain.
    """
    property_record = models.ForeignKey(PropertyRecord, on_delete=models.CASCADE, related_name='transfer_history')
    from_user = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, related_name='transfers_out')
    to_user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='transfers_in')
    
    transaction_hash = models.CharField(max_length=66, help_text="Ethereum Transaction Hash")
    sale_price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, help_text="Simulated sale price in NPR")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transfer: Parcel #{self.property_record.parcel_id} to {self.to_user.full_name}"


# Table 3.5: Contact Message Table

class ContactMessage(models.Model):
    """
    Feedback and support requests from the public.
    """
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    
    is_responded = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} - {self.subject}"


# Authorized Officer Whitelist
class AuthorizedOfficer(models.Model):
    """
    Whitelisted wallet addresses permitted to become Officers.
    Only a Superuser (Master Admin) can create these records.
    """
    wallet_address = models.CharField(
        max_length=42,
        unique=True,
        validators=[RegexValidator(r'^0x[a-fA-F0-9]{40}$', 'Invalid Ethereum Address')]
    )
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100)
    employee_id = models.CharField(max_length=50, unique=True)
    
    DESIGNATION_CHOICES = [
        ('District Registrar', 'District Registrar'),
        ('Land Revenue Officer', 'Land Revenue Officer'),
        ('Assistant Officer', 'Assistant Officer'),
        ('Verification Specialist', 'Verification Specialist'),
    ]

    DEPARTMENT_CHOICES = [
        ('Land Revenue', 'Land Revenue'),
        ('Survey & Mapping', 'Survey & Mapping'),
        ('Digital Registry', 'Digital Registry'),
    ]

    designation = models.CharField(max_length=50, choices=DESIGNATION_CHOICES, default='Land Revenue Officer')
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, default='Land Revenue')
    office_branch = models.CharField(max_length=100, help_text="Physical branch location (e.g. Dilli Bazar)", default='Kathmandu LRO')
    
    is_active = models.BooleanField(default=False, help_text="Set to True once the officer   completes onboarding")
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='authorized_officers')
    
    created_at = models.DateTimeField(auto_now_add=True)
    activated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Authorized: {self.full_name} ({self.wallet_address})"


# SIGNALS (Auto-Sync Logic)
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def sync_user_to_profile(sender, instance, **kwargs):
    """
    If User.username changes, update UserProfile.wallet_address
    """
    try:
        profile = instance.profile
        if profile.wallet_address != instance.username:
            profile.wallet_address = instance.username
            profile.save()
    except UserProfile.DoesNotExist:
        pass

@receiver(post_save, sender=UserProfile)
def sync_profile_to_user(sender, instance, **kwargs):
    """
    If UserProfile.wallet_address changes, update User.username
    """
    user = instance.user
    if user.username != instance.wallet_address:
        user.username = instance.wallet_address
        user.save()
