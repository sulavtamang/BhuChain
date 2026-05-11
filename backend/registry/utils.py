def flatten_errors(serializer_errors):
    """
    DRY Utility: Converts Django Rest Framework's complex error dictionary
    into a single human-readable string for frontend toast notifications.
    Example: {'email': ['Enter a valid email']} -> "Email: Enter a valid email"
    """
    error_msg = ""
    for field, errors in serializer_errors.items():
        # Handle non-field errors
        field_name = "Error" if field == 'non_field_errors' else field.replace('_', ' ').title()
        error_msg += f"{field_name}: {errors[0]} "
    
    return error_msg.strip()

def log_admin_action(officer_user, action_type, application=None, remarks=None):
    """
    Core Audit Utility: Records an administrative action performed by an officer.
    This ensures system accountability and a tamper-evident audit trail for 
    all land-related decisions (Approvals, Rejections, KYC Verification).
    """
    from .models import AdminActionLog, UserProfile
    
    try:
        profile = officer_user.profile
        AdminActionLog.objects.create(
            admin=profile,
            application=application,
            action_type=action_type,
            remarks=remarks
        )
    except Exception as e:
        # Don't crash the main request if logging fails, but log it to console
        print(f"CRITICAL: Failed to log admin action: {e}")
