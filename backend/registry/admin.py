from django.contrib import admin
from .models import (
    UserProfile, RegistrationApplication, AdminActionLog, 
    AuthorizedOfficer, KYCUpdateRequest, PropertyRecord, 
    TransferLog, OTPVerification, ContactMessage
)

@admin.register(AuthorizedOfficer)
class AuthorizedOfficerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'employee_id', 'designation', 'office_branch', 'is_active', 'created_at')
    search_fields = ('full_name', 'wallet_address', 'email', 'employee_id')
    list_filter = ('designation', 'department', 'is_active', 'created_at')
    readonly_fields = ('activated_at',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'role', 'citizenship_no', 'wallet_address', 'is_verified')
    search_fields = ('full_name', 'citizenship_no', 'wallet_address')
    list_filter = ('role', 'is_verified')
        
@admin.register(RegistrationApplication)
class RegistrationApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'location', 'parcel_id', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('location', 'user__full_name')

@admin.register(PropertyRecord)
class PropertyRecordAdmin(admin.ModelAdmin):
    list_display = ('parcel_id', 'current_owner', 'location', 'area', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('parcel_id', 'location', 'current_owner__full_name')

@admin.register(TransferLog)
class TransferLogAdmin(admin.ModelAdmin):
    list_display = ('property_record', 'from_user', 'to_user', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('property_record__parcel_id', 'transaction_hash')

@admin.register(AdminActionLog)
class AdminActionLogAdmin(admin.ModelAdmin):
    list_display = ('action_type', 'admin', 'timestamp')
    list_filter = ('action_type',)

@admin.register(KYCUpdateRequest)
class KYCUpdateRequestAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('full_name', 'citizenship_no')

@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ('email', 'otp_code', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'created_at')
    search_fields = ('email', 'otp_code')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at', 'is_responded')
    list_filter = ('is_responded', 'created_at')
    search_fields = ('name', 'email', 'subject')
    readonly_fields = ('created_at',)

    