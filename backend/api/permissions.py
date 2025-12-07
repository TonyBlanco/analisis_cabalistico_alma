from rest_framework import permissions


class IsTherapist(permissions.BasePermission):
    """Permiso personalizado para verificar que el usuario es terapeuta"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and
            request.user.profile.user_type == 'therapist'
        )


class IsPersonalUser(permissions.BasePermission):
    """Permiso personalizado para verificar que el usuario es personal"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and
            request.user.profile.user_type == 'personal'
        )


class HasActiveSubscription(permissions.BasePermission):
    """Permiso para verificar que el usuario tiene suscripción activa"""
    
    message = "Tu suscripción ha expirado. Por favor, renueva tu plan."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        return request.user.profile.has_active_subscription()


class CanCreateFicha(permissions.BasePermission):
    """Permiso para verificar que el usuario puede crear más fichas"""
    
    message = "Has alcanzado el límite de fichas para este mes."
    
    def has_permission(self, request, view):
        if request.method not in ['POST', 'PUT', 'PATCH']:
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        return request.user.profile.can_create_ficha()
