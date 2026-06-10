from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import UserProfile, Ficha
from .test_models import TestModule, TestResult, UserTestAccess
from .admin_permissions import user_is_platform_admin


def _admin_forbidden():
    return Response(
        {'error': 'No tienes permisos de administrador'},
        status=status.HTTP_403_FORBIDDEN,
    )


class AdminCheckView(APIView):
    """Verifica si el usuario es administrador"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not user_is_platform_admin(request.user):
            return _admin_forbidden()
        return Response({'is_admin': True})


class EnhancedAdminStatsView(APIView):
    """Estadísticas mejoradas para admin"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not user_is_platform_admin(request.user):
            return _admin_forbidden()
        
        # Usuarios
        total_users = User.objects.count()
        active_memberships = UserProfile.objects.filter(membership_active=True).count()
        
        # Tests
        # Enforce global manager for stats too, to reflect available catalog
        total_tests = TestModule.objects.assignable().filter(is_active=True).count()
        total_test_results = TestResult.objects.count()
        
        # Nuevos usuarios esta semana
        week_ago = datetime.now() - timedelta(days=7)
        new_users_this_week = User.objects.filter(date_joined__gte=week_ago).count()
        
        # Ingresos estimados (pendiente de implementar sistema real)
        revenue_this_month = 0
        pending_payments = 0  # Implementar con sistema de pagos
        
        stats = {
            'total_users': total_users,
            'active_memberships': active_memberships,
            'pending_payments': pending_payments,
            'total_tests': total_tests,
            'total_test_results': total_test_results,
            'revenue_this_month': revenue_this_month,
            'new_users_this_week': new_users_this_week,
            'therapists': UserProfile.objects.filter(user_type='therapist').count(),
            'personal_users': UserProfile.objects.filter(user_type='personal').count(),
            'total_fichas': Ficha.objects.count(),
        }
        
        return Response(stats)


class EnhancedAdminUsersView(APIView):
    """Lista mejorada de usuarios para admin"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not user_is_platform_admin(request.user):
            return _admin_forbidden()
        
        users = User.objects.select_related('profile').all()
        
        users_data = []
        for user in users:
            try:
                profile = user.profile
            except UserProfile.DoesNotExist:
                continue

            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined,
                'profile': {
                    'full_name': profile.full_name,
                    'user_type': profile.user_type,
                    'is_admin': profile.is_admin,
                    'membership_active': profile.membership_active,
                    'membership_expires': profile.membership_expires,
                    'subscription_plan': profile.subscription_plan,
                    'subscription_status': profile.subscription_status,
                    'clinical_mode_requested': profile.clinical_mode_requested,
                    'clinical_mode_enabled': profile.clinical_mode_enabled,
                }
            })
        
        return Response(users_data)


class AdminUserManagementView(APIView):
    """Gestión individual de usuarios"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        """Obtener detalle de un usuario"""
        if not user_is_platform_admin(request.user):
            return _admin_forbidden()
        
        try:
            user = User.objects.select_related('profile').get(id=user_id)
            
            # Estadísticas del usuario
            fichas_count = Ficha.objects.filter(usuario=user).count()
            test_results_count = TestResult.objects.filter(user=user).count()
            test_accesses = UserTestAccess.objects.filter(
                user=user,
                uses_count__gt=0
            ).select_related('test_module')
            
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'date_joined': user.date_joined,
                'profile': {
                    'full_name': user.profile.full_name,
                    'user_type': user.profile.user_type,
                    'membership_active': user.profile.membership_active,
                    'membership_expires': user.profile.membership_expires,
                    'subscription_plan': user.profile.subscription_plan,
                    'subscription_status': user.profile.subscription_status,
                    'phone': user.profile.phone,
                    'birth_date': user.profile.birth_date,
                    'clinical_mode_requested': user.profile.clinical_mode_requested,
                    'clinical_mode_enabled': user.profile.clinical_mode_enabled,
                    'clinical_credential_verified_at': user.profile.clinical_credential_verified_at,
                },
                'stats': {
                    'fichas_count': fichas_count,
                    'test_results_count': test_results_count,
                    'tests_used': [{
                        'test_name': access.test_module.name,
                        'uses_count': access.uses_count,
                        'last_used': access.last_used,
                    } for access in test_accesses]
                }
            }
            
            return Response(user_data)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def patch(self, request, user_id):
        """Actualizar usuario"""
        if not user_is_platform_admin(request.user):
            return _admin_forbidden()
        
        try:
            user = User.objects.select_related('profile').get(id=user_id)
            profile = user.profile
            profile_dirty = False
            
            # Actualizar campos del usuario
            if 'email' in request.data:
                user.email = request.data['email']
            if 'is_active' in request.data:
                user.is_active = request.data['is_active']
            user.save()
            
            profile_payload = request.data.get('profile')
            if isinstance(profile_payload, dict):
                if 'user_type' in profile_payload:
                    profile.user_type = profile_payload['user_type']
                    profile_dirty = True
                if 'membership_active' in profile_payload:
                    profile.membership_active = profile_payload['membership_active']
                    profile_dirty = True
                if 'subscription_plan' in profile_payload:
                    profile.subscription_plan = profile_payload['subscription_plan']
                    profile_dirty = True
                if 'subscription_status' in profile_payload:
                    profile.subscription_status = profile_payload['subscription_status']
                    profile_dirty = True
                if 'is_admin' in profile_payload:
                    profile.is_admin = bool(profile_payload['is_admin'])
                    profile_dirty = True
            
            # Campos planos (compatibilidad con el panel Next.js)
            if 'user_type' in request.data:
                profile.user_type = request.data['user_type']
                profile_dirty = True
            if 'membership_active' in request.data:
                profile.membership_active = request.data['membership_active']
                profile_dirty = True
            if 'subscription_plan' in request.data:
                profile.subscription_plan = request.data['subscription_plan']
                profile_dirty = True
            if 'subscription_status' in request.data:
                profile.subscription_status = request.data['subscription_status']
                profile_dirty = True
            
            if profile_dirty:
                profile.save()
            
            return Response({
                'success': True,
                'message': 'Usuario actualizado correctamente',
                'id': user.id,
                'email': user.email,
                'is_active': user.is_active,
                'profile': {
                    'full_name': profile.full_name,
                    'user_type': profile.user_type,
                    'membership_active': profile.membership_active,
                    'membership_expires': profile.membership_expires,
                    'subscription_plan': profile.subscription_plan,
                    'subscription_status': profile.subscription_status,
                    'is_admin': profile.is_admin,
                },
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request, user_id):
        """Eliminar usuario"""
        if not user_is_platform_admin(request.user):
            return _admin_forbidden()
        
        try:
            user = User.objects.get(id=user_id)
            
            # No permitir eliminar al propio admin
            if user.id == request.user.id:
                return Response(
                    {'error': 'No puedes eliminarte a ti mismo'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.delete()
            
            return Response({
                'success': True,
                'message': 'Usuario eliminado correctamente'
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )


class ClinicalCredentialVerificationView(APIView):
    """Verificación admin de credencial clínica para terapeutas médicos/psiquiatras.

    Activa el modo clínico (clinical_mode_enabled) SOLO tras verificación humana
    de la credencial profesional. El cliente NUNCA puede auto-otorgarse este modo:
    clinical_mode_requested es únicamente una solicitud hecha en el alta.
    El rail anti-fraude permanece SIEMPRE activo, con o sin modo clínico.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        """Verificar credencial y habilitar el vocabulario clínico completo."""
        if not user_is_platform_admin(request.user):
            return _admin_forbidden()

        try:
            user = User.objects.select_related('profile').get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile = user.profile

        if profile.user_type != 'therapist':
            return Response(
                {'error': 'Solo los perfiles de terapeuta pueden acceder al modo clínico.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.clinical_mode_enabled = True
        profile.clinical_mode_requested = True
        profile.clinical_credential_verified_at = timezone.now()
        profile.clinical_credential_verified_by = request.user
        profile.save(update_fields=[
            'clinical_mode_enabled',
            'clinical_mode_requested',
            'clinical_credential_verified_at',
            'clinical_credential_verified_by',
        ])

        return Response({
            'success': True,
            'message': 'Credencial clínica verificada. Vocabulario clínico habilitado.',
            'user_id': user.id,
            'clinical_mode_enabled': profile.clinical_mode_enabled,
            'clinical_mode_requested': profile.clinical_mode_requested,
            'clinical_credential_verified_at': profile.clinical_credential_verified_at,
            'clinical_credential_verified_by': request.user.id,
            'can_use_clinical_lexicon': profile.can_use_clinical_lexicon(),
        })

    def delete(self, request, user_id):
        """Revocar el modo clínico (el rail anti-fraude sigue activo siempre)."""
        if not user_is_platform_admin(request.user):
            return _admin_forbidden()

        try:
            user = User.objects.select_related('profile').get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile = user.profile
        profile.clinical_mode_enabled = False
        profile.clinical_credential_verified_at = None
        profile.clinical_credential_verified_by = None
        profile.save(update_fields=[
            'clinical_mode_enabled',
            'clinical_credential_verified_at',
            'clinical_credential_verified_by',
        ])

        return Response({
            'success': True,
            'message': 'Modo clínico revocado.',
            'user_id': user.id,
            'clinical_mode_enabled': profile.clinical_mode_enabled,
            'can_use_clinical_lexicon': profile.can_use_clinical_lexicon(),
        })
