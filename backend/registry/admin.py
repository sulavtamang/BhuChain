from django.contrib import admin
from .models import UserProfile, RegistrationApplication, AdminActionLog

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'role', 'citizenship_no', 'is_verified')
    search_fields = ('full_name', 'citizenship_no', 'wallet_address')
    list_filter = ('role', 'is_verified')
    
@admin.register(RegistrationApplication)
class RegistrationApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'created_at', 'parcel_id')
    list_filter = ('status',)

@admin.register(AdminActionLog)
class AdminActionLogAdmin(admin.ModelAdmin):
    list_display = ('action_type', 'admin', 'timestamp')
    list_filter = ('action_type',)
    