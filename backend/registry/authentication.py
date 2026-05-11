from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone
from datetime import timedelta
from django.conf import settings

class ExpiringTokenAuthentication(TokenAuthentication):
    """
    Custom Token Authentication that expires tokens after a set duration.
    Default: 2 hours.
    """
    def authenticate_credentials(self, key):
        model = self.get_model()
        try:
            token = model.objects.select_related('user').get(key=key)
        except model.DoesNotExist:
            raise AuthenticationFailed('Invalid token.')

        if not token.user.is_active:
            raise AuthenticationFailed('User inactive or deleted.')

        # Check for token expiration
        expiry_duration = timedelta(hours=2)
        
        if token.created < timezone.now() - expiry_duration:
            # Token has expired, delete it and force a relogin
            token.delete()
            raise AuthenticationFailed('Token has expired. Please log in again.')
            
        return (token.user, token)

def get_or_refresh_token(user):
    """
    DRY Utility: Retrieves an existing token for a user or creates a new one.
    If the token has expired (based on 2-hour logic), it refreshes it.
    """
    from rest_framework.authtoken.models import Token
    
    token = Token.objects.filter(user=user).first()
    expiry_duration = timedelta(hours=2)

    if token:
        if token.created < timezone.now() - expiry_duration:
            token.delete()
            token = Token.objects.create(user=user)
    else:
        token = Token.objects.create(user=user)
        
    return token.key
