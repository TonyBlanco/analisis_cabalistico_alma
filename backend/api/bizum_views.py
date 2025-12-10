from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.core.mail import send_mail
from datetime import datetime, timedelta
from .models import UserProfile
from django.contrib.auth.models import User


class BizumPaymentNotificationView(APIView):
    """Registrar intento de pago con Bizum"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        profile = user.profile
        plan_type = request.data.get('plan_type', 'personal')
        amount = request.data.get('amount')
        
        # Enviar email a admin para verificación manual
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'membresia@tonyblanco.es')
        
        try:
            send_mail(
                subject=f'[Bizum] Pago pendiente - {user.username}',
                message=f"""
                Nuevo pago Bizum pendiente de verificación:
                
                Usuario: {user.username} ({user.email})
                Nombre: {profile.full_name}
                Plan: {plan_type}
                Monto: €{amount}
                Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M')}
                
                Verificar transferencia en la cuenta Bizum y activar manualmente.
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],
                fail_silently=False,
            )
            
            # También enviar confirmación al usuario
            send_mail(
                subject='Pago Bizum Recibido - En Verificación',
                message=f"""
                Hola {profile.full_name},
                
                Hemos recibido tu notificación de pago via Bizum por €{amount}.
                
                Estamos verificando el pago y activaremos tu cuenta en las próximas 2-4 horas.
                Te enviaremos un email cuando tu membresía esté activa.
                
                Gracias por tu paciencia.
                
                Equipo Tony Blanco
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'Notificación recibida. Verificaremos tu pago pronto.',
                'status': 'pending'
            })
            
        except Exception as e:
            print(f"Error enviando email: {e}")
            return Response({
                'message': 'Notificación registrada (email deshabilitado en desarrollo)',
                'status': 'pending'
            })


class ActivateMembershipView(APIView):
    """Activar membresía manualmente (solo admin)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Verificar que sea admin
        if not request.user.is_staff:
            return Response({
                'error': 'No autorizado'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user_id = request.data.get('user_id')
        plan_type = request.data.get('plan_type', 'personal')
        duration_days = request.data.get('duration_days', 365)  # Default 1 año
        
        try:
            user = User.objects.get(id=user_id)
            profile = user.profile
            
            # Activar membresía
            profile.membership_active = True
            profile.last_payment_date = datetime.now()
            profile.membership_expires = datetime.now() + timedelta(days=duration_days)
            profile.subscription_plan = plan_type
            
            if plan_type != 'personal':
                # Suscripción mensual para terapeutas
                profile.next_billing_date = datetime.now() + timedelta(days=30)
            
            profile.save()
            
            # Enviar email de confirmación
            try:
                send_mail(
                    subject='¡Membresía Activada!',
                    message=f"""
                    Hola {profile.full_name},
                    
                    ¡Tu membresía ha sido activada exitosamente!
                    
                    Plan: {plan_type}
                    Válida hasta: {profile.membership_expires.strftime('%Y-%m-%d')}
                    
                    Ya puedes acceder a tu dashboard:
                    https://app.tonyblanco.es/dashboard
                    
                    ¡Bienvenido!
                    
                    Equipo Tony Blanco
                    """,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except:
                pass
            
            return Response({
                'message': f'Membresía activada para {user.username}',
                'expires': profile.membership_expires,
                'plan': plan_type
            })
            
        except User.DoesNotExist:
            return Response({
                'error': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
