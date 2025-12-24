# Astrology API Permissions
# Custom permissions for astrology API endpoints

from rest_framework.permissions import BasePermission
from api.models import Patient


class IsTherapist(BasePermission):
    """
    Permission that checks if user is a therapist
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.user_type == 'therapist'
        )


class CanAccessPatient(BasePermission):
    """
    Permission that checks if therapist can access the patient
    """
    def has_object_permission(self, request, view, obj):
        # obj should be a Patient instance
        if not isinstance(obj, Patient):
            return False

        # Check if user is the therapist for this patient
        return obj.therapist == request.user