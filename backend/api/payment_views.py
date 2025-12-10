"""
Vista para integración con Stripe para pagos y suscripciones.
Configuración necesaria:
1. Instalar: pip install stripe
2. Configurar en settings.py: STRIPE_SECRET_KEY y STRIPE_PUBLISHABLE_KEY
3. Crear productos y precios en Stripe Dashboard
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from django.core.mail import send_mail
from datetime import datetime, timedelta
from .models import UserProfile
from django.contrib.auth.models import User

# import stripe  # Descomentar cuando instales stripe
# stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')


class CreateCheckoutSessionView(APIView):
    """Crear sesión de checkout de Stripe"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            user_profile = user.profile
            plan_type = request.data.get('plan_type')  # 'personal' o 'therapist'
            
            # Precios de ejemplo (deberás configurar estos en Stripe Dashboard)
            price_ids = {
                'personal_monthly': 'price_xxxxx',  # Reemplazar con ID real de Stripe
                'personal_yearly': 'price_xxxxx',
                'therapist_monthly': 'price_xxxxx',
                'therapist_yearly': 'price_xxxxx',
            }
            
            price_id = price_ids.get(f"{user_profile.user_type}_{plan_type}")
            
            if not price_id:
                return Response({
                    'error': 'Plan inválido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # TODO: Descomentar cuando tengas Stripe configurado
            """
            # Crear o recuperar customer de Stripe
            if not user_profile.stripe_customer_id:
                customer = stripe.Customer.create(
                    email=user.email,
                    name=user_profile.full_name,
                    metadata={
                        'user_id': user.id,
                        'user_type': user_profile.user_type
                    }
                )
                user_profile.stripe_customer_id = customer.id
                user_profile.save()
            
            # Crear sesión de checkout
            checkout_session = stripe.checkout.Session.create(
                customer=user_profile.stripe_customer_id,
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=settings.FRONTEND_URL + '/dashboard?payment=success',
                cancel_url=settings.FRONTEND_URL + '/dashboard?payment=canceled',
                metadata={
                    'user_id': user.id,
                    'plan_type': plan_type
                }
            )
            
            return Response({
                'sessionId': checkout_session.id,
                'url': checkout_session.url
            })
            """
            
            # Respuesta temporal mientras configuras Stripe
            return Response({
                'message': 'Stripe no está configurado aún',
                'plan_type': plan_type,
                'user_type': user_profile.user_type,
                'note': 'Configura STRIPE_SECRET_KEY en settings.py y descomenta el código'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StripeWebhookView(APIView):
    """Webhook para recibir eventos de Stripe"""
    permission_classes = []  # Los webhooks no requieren autenticación de usuario
    
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        # TODO: Descomentar cuando tengas Stripe configurado
        """
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError:
            return Response({'error': 'Invalid payload'}, status=400)
        except stripe.error.SignatureVerificationError:
            return Response({'error': 'Invalid signature'}, status=400)
        
        # Manejar diferentes tipos de eventos
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            self.handle_checkout_completed(session)
        
        elif event['type'] == 'customer.subscription.updated':
            subscription = event['data']['object']
            self.handle_subscription_updated(subscription)
        
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            self.handle_subscription_canceled(subscription)
        
        elif event['type'] == 'invoice.payment_failed':
            invoice = event['data']['object']
            self.handle_payment_failed(invoice)
        """
        
        return Response({'status': 'success'})
    
    def handle_checkout_completed(self, session):
        """Manejar cuando se completa un pago exitoso"""
        from .models import UserProfile
        from django.contrib.auth.models import User
        
        user_id = session['metadata']['user_id']
        customer_id = session['customer']
        subscription_id = session['subscription']
        
        try:
            user = User.objects.get(id=user_id)
            profile = user.profile
            
            profile.stripe_customer_id = customer_id
            profile.stripe_subscription_id = subscription_id
            profile.subscription_status = 'active'
            profile.subscription_start_date = datetime.now()
            
            # Establecer fecha de fin según el plan (ejemplo: 30 días)
            profile.subscription_end_date = datetime.now() + timedelta(days=30)
            
            profile.save()
            
            print(f"✅ Suscripción activada para usuario {user.username}")
        
        except User.DoesNotExist:
            print(f"⚠️ Usuario no encontrado: {user_id}")
    
    def handle_subscription_updated(self, subscription):
        """Manejar actualización de suscripción"""
        from .models import UserProfile
        
        customer_id = subscription['customer']
        
        try:
            profile = UserProfile.objects.get(stripe_customer_id=customer_id)
            
            # Actualizar estado según el status de Stripe
            stripe_status = subscription['status']
            if stripe_status == 'active':
                profile.subscription_status = 'active'
            elif stripe_status == 'canceled':
                profile.subscription_status = 'canceled'
            elif stripe_status in ['past_due', 'unpaid']:
                profile.subscription_status = 'expired'
            
            profile.save()
            
            print(f"✅ Suscripción actualizada para {profile.full_name}")
        
        except UserProfile.DoesNotExist:
            print(f"⚠️ Perfil no encontrado para customer: {customer_id}")
    
    def handle_subscription_canceled(self, subscription):
        """Manejar cancelación de suscripción"""
        from .models import UserProfile
        
        customer_id = subscription['customer']
        
        try:
            profile = UserProfile.objects.get(stripe_customer_id=customer_id)
            profile.subscription_status = 'canceled'
            profile.save()
            
            print(f"✅ Suscripción cancelada para {profile.full_name}")
        
        except UserProfile.DoesNotExist:
            print(f"⚠️ Perfil no encontrado para customer: {customer_id}")
    
    def handle_payment_failed(self, invoice):
        """Manejar fallo de pago"""
        from .models import UserProfile
        
        customer_id = invoice['customer']
        
        try:
            profile = UserProfile.objects.get(stripe_customer_id=customer_id)
            
            # Aquí podrías enviar un email al usuario notificando el problema
            print(f"⚠️ Pago fallido para {profile.full_name}")
        
        except UserProfile.DoesNotExist:
            print(f"⚠️ Perfil no encontrado para customer: {customer_id}")


class CancelSubscriptionView(APIView):
    """Cancelar suscripción del usuario"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            profile = user.profile
            
            if not profile.stripe_subscription_id:
                return Response({
                    'error': 'No tienes una suscripción activa'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # TODO: Descomentar cuando tengas Stripe configurado
            """
            # Cancelar en Stripe
            subscription = stripe.Subscription.modify(
                profile.stripe_subscription_id,
                cancel_at_period_end=True
            )
            
            profile.subscription_status = 'canceled'
            profile.save()
            
            return Response({
                'message': 'Suscripción cancelada. Tendrás acceso hasta el final del período actual.',
                'end_date': profile.subscription_end_date
            })
            """
            
            # Respuesta temporal
            profile.subscription_status = 'canceled'
            profile.save()
            
            return Response({
                'message': 'Suscripción cancelada (simulación - Stripe no configurado)',
                'end_date': profile.subscription_end_date
            })
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubscriptionStatusView(APIView):
    """Obtener estado de la suscripción del usuario"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        profile = request.user.profile
        
        return Response({
            'subscription_status': profile.subscription_status,
            'user_type': profile.user_type,
            'subscription_start_date': profile.subscription_start_date,
            'subscription_end_date': profile.subscription_end_date,
            'max_fichas_per_month': profile.max_fichas_per_month,
            'fichas_created_this_month': profile.fichas_created_this_month,
            'has_active_subscription': profile.has_active_subscription(),
            'can_create_more_fichas': profile.can_create_ficha()
        })
