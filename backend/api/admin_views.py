from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.db.models import Count, Q
from datetime import datetime, timedelta
from .models import UserProfile, Ficha
from .test_models import TestModule, TestResult, UserTestAccess


class AdminCheckView(APIView):
    """Verifica si el usuario es administrador"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not (request.user.is_staff or request.user.profile.is_admin):
            return Response(
                {'error': 'No tienes permisos de administrador'},
                status=status.HTTP_403_FORBIDDEN
            )
        return Response({'is_admin': True})


class EnhancedAdminStatsView(APIView):
    """Estadísticas mejoradas para admin"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not (request.user.is_staff or request.user.profile.is_admin):
            return Response(
                {'error': 'No autorizado'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Usuarios
        total_users = User.objects.count()
        active_memberships = UserProfile.objects.filter(membership_active=True).count()
        
        # Tests
        total_tests = TestModule.objects.filter(is_active=True).count()
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
        if not (request.user.is_staff or request.user.profile.is_admin):
            return Response(
                {'error': 'No autorizado'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        users = User.objects.select_related('profile').all()
        
        users_data = []
        for user in users:
            users_data.append({
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
                }
            })
        
        return Response(users_data)


class AdminUserManagementView(APIView):
    """Gestión individual de usuarios"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        """Obtener detalle de un usuario"""
        if not (request.user.is_staff or request.user.profile.is_admin):
            return Response(
                {'error': 'No autorizado'},
                status=status.HTTP_403_FORBIDDEN
            )
        
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
        if not (request.user.is_staff or request.user.profile.is_admin):
            return Response(
                {'error': 'No autorizado'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            user = User.objects.get(id=user_id)
            profile = user.profile
            
            # Actualizar campos del usuario
            if 'email' in request.data:
                user.email = request.data['email']
            if 'is_active' in request.data:
                user.is_active = request.data['is_active']
            user.save()
            
            # Actualizar campos del perfil
            if 'membership_active' in request.data:
                profile.membership_active = request.data['membership_active']
            if 'subscription_plan' in request.data:
                profile.subscription_plan = request.data['subscription_plan']
            if 'subscription_status' in request.data:
                profile.subscription_status = request.data['subscription_status']
            
            profile.save()
            
            return Response({
                'success': True,
                'message': 'Usuario actualizado correctamente'
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request, user_id):
        """Eliminar usuario"""
        if not (request.user.is_staff or request.user.profile.is_admin):
            return Response(
                {'error': 'No autorizado'},
                status=status.HTTP_403_FORBIDDEN
            )
        
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
