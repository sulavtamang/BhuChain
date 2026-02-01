from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet, RegistrationApplicationViewSet

router = DefaultRouter()
router.register(r'users', UserProfileViewSet)
router.register(r'applications', RegistrationApplicationViewSet)

urlpatterns = [
    path('', include(router.urls))
]