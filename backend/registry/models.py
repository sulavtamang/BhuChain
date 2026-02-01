from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator

# ==========================================
# Table 3.1: User Profile Table
# ==========================================
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
        help_text="Government Citizenship ID", 
        validators=[RegexValidator(r'^[0-9]{10}$', 'Invalid Citizenship Number')]
    )

    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, null=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='Citizen')
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.full_name} ({self.role})"

# ==========================================
# Table 3.2: Registration Application Table
# ==========================================
class RegistrationApplication(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    
    # Link to the applicant
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)

    # This might be NULL if the parcel has not been minted yet
    parcel_id = models.IntegerField(null=True, blank=True, help_text="Linked Blockchain Parcel ID")

    # Evidence (Deed Image)
    document_path = models.ImageField(upload_to='deeds/', help_text="Scanned copy of the land deed")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Application #{self.id} - {self.user.full_name} - {self.status}"

# ==========================================
# Admin Action Log (Internal Audit)
# ==========================================
class AdminActionLog(models.Model):
    # Who performed the action (Must be an Officer)
    admin = models.ForeignKey(UserProfile, on_delete=models.CASCADE)

    # Which application was acted upon
    application = models.ForeignKey(RegistrationApplication, on_delete=models.CASCADE)
    
    action_type = models.CharField(max_length=50)
    remarks = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.action_type} - {self.admin.full_name}"
