from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from datetime import date
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, get_user_model
from google.auth.transport import requests
from google.oauth2 import id_token

# Importamos tu lógica maestra
from cabala_py.integracion_arbol import generar_mapa_cabalista_completo
from .models import Calculo, Ficha, UserProfile, Patient, Session, TherapistNote, Service, ServiceCategory, ServicePackage, Booking, AvailableSlot, BlockedDate
from .birth_data_model import UserBirthData
from .serializers import (
    FichaSerializer, 
    RegisterTherapistSerializer, 
    RegisterPersonalSerializer,
    UserSerializer,
    PatientSerializer,
    SessionSerializer,
    TherapistNoteSerializer,
    ServiceSerializer,
    ServiceCategorySerializer,
    ServicePackageSerializer,
    BookingSerializer,
    BookingCreateSerializer,
    AvailableSlotSerializer,
    BlockedDateSerializer
)
from .serializers import UserBirthDataSerializer
from .emails import send_welcome_email, send_booking_confirmation_email


# Vista para la raíz /api/
@api_view(['GET'])
def welcome_api(request):
    """Vista de bienvenida para la raíz de la API."""
    return Response({
        "message": "Bienvenido a la API de Análisis Cabalístico del Alma",
        "version": "2.0",
        "endpoints": {
            "register_therapist": "/api/register/therapist/",
            "register_personal": "/api/register/personal/",
            "login": "/api/login/",
            "calcular": "/api/calcular/",
            "fichas": "/api/fichas/",
            "me": "/api/me/"
        }
    }, status=status.HTTP_200_OK)


class RegisterTherapistView(APIView):
    """Registro de terapeutas profesionales"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterTherapistSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            
            # Enviar email de bienvenida
            try:
                send_welcome_email(user.profile)
            except Exception as e:
                print(f"Error enviando email de bienvenida: {e}")
            
            return Response({
                'message': 'Terapeuta registrado exitosamente',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'user_type': 'therapist'
                },
                'token': token.key,
                'trial_days': 14
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterPersonalView(APIView):
    """Registro de usuarios personales"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterPersonalSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            
            # Enviar email de bienvenida
            try:
                send_welcome_email(user.profile)
            except Exception as e:
                print(f"Error enviando email de bienvenida: {e}")
            
            return Response({
                'message': 'Usuario registrado exitosamente',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'user_type': 'personal'
                },
                'token': token.key,
                'trial_days': 7
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    """Obtener información del usuario actual"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_data = {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
        }
        
        # Agregar datos del perfil si existe
        if hasattr(request.user, 'profile'):
            user_data.update({
                'full_name': request.user.profile.full_name,
                'user_type': request.user.profile.user_type,
                'is_admin': request.user.profile.is_admin,
                'subscription_status': request.user.profile.subscription_status,
                'subscription_plan': request.user.profile.subscription_plan,
                'membership_expires': str(request.user.profile.membership_expires) if request.user.profile.membership_expires else None,
                'phone': request.user.profile.phone,
                'current_patients_count': request.user.profile.current_patients_count,
                'fichas_created_this_month': request.user.profile.fichas_created_this_month,
            })
            # Incluir fecha de nacimiento si está en el perfil
            if request.user.profile.birth_date:
                user_data['birth_date'] = str(request.user.profile.birth_date)
            # Incluir datos extendidos si existe el modelo UserBirthData
            try:
                bd = request.user.birth_data
                user_data['birth_data'] = {
                    'full_name': bd.full_name,
                    'birth_date': str(bd.birth_date),
                    'birth_time': str(bd.birth_time) if bd.birth_time else None,
                    'birth_city': bd.birth_city,
                    'birth_country': bd.birth_country,
                    'birth_latitude': float(bd.birth_latitude) if bd.birth_latitude else None,
                    'birth_longitude': float(bd.birth_longitude) if bd.birth_longitude else None,
                    'is_locked': bd.is_locked
                }
            except Exception:
                pass
        
        return Response(user_data)


class UpdateProfileView(APIView):
    """Actualizar información del perfil del usuario"""
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        try:
            user = request.user
            profile = user.profile
            birth_data = None
            
            try:
                birth_data = user.birth_data
            except:
                pass
            
            # Update user fields
            if 'email' in request.data:
                user.email = request.data['email']
            if 'first_name' in request.data:
                user.first_name = request.data['first_name']
            user.save()
            
            # Update profile fields
            if 'phone' in request.data:
                profile.phone = request.data['phone']
            profile.save()
            
            # Update birth data if provided and exists
            if birth_data and not birth_data.is_locked:
                if 'birth_city' in request.data:
                    birth_data.birth_city = request.data['birth_city']
                if 'birth_country' in request.data:
                    birth_data.birth_country = request.data['birth_country']
                if 'birth_time' in request.data:
                    birth_data.birth_time = request.data['birth_time']
                if 'birth_latitude' in request.data:
                    birth_data.birth_latitude = request.data['birth_latitude']
                if 'birth_longitude' in request.data:
                    birth_data.birth_longitude = request.data['birth_longitude']
                birth_data.save()
            
            return Response({
                'success': True,
                'message': 'Perfil actualizado correctamente'
            })
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class CheckMembershipView(APIView):
    """Verifica si el usuario tiene membresía activa"""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            profile = request.user.profile
            user = request.user
            
            # Superusuario tiene acceso completo
            if user.username == 'supertony' or user.is_superuser or user.is_staff:
                return Response({
                    'membership_active': True,
                    'user_type': profile.user_type,
                    'subscription_status': 'active',
                    'subscription_plan': 'premium',  # Máximo nivel
                    'membership_expires': None,
                    'can_access_dashboard': True,
                    'can_create_ficha': True,
                    'is_superuser': True,  # Flag adicional
                })
            
            has_active = profile.has_active_subscription()
            
            return Response({
                'membership_active': has_active,
                'user_type': profile.user_type,
                'subscription_status': profile.subscription_status,
                'subscription_plan': profile.subscription_plan or 'trial',
                'membership_expires': profile.membership_expires,
                'can_access_dashboard': has_active,
                'can_create_ficha': profile.can_create_ficha(),
                'is_superuser': False,
            })
        except Exception as e:
            return Response({
                'error': str(e),
                'membership_active': False,
                'can_access_dashboard': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EmailOrUsernameAuthToken(APIView):
    """Permite login con username o email y devuelve un token."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username_or_email = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        if not username_or_email or not password:
            return Response({'detail': 'Usuario/email y contraseña son requeridos'}, status=status.HTTP_400_BAD_REQUEST)

        UserModel = get_user_model()

        user = (
            UserModel.objects.filter(username=username_or_email).first()
            or UserModel.objects.filter(email=username_or_email).first()
        )

        if not user:
            return Response({'detail': 'Credenciales inválidas'}, status=status.HTTP_400_BAD_REQUEST)

        user_auth = authenticate(username=user.username, password=password)

        if not user_auth:
            return Response({'detail': 'Credenciales inválidas'}, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user_auth)
        return Response({'token': token.key})


class CalculoCabalisticoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            # Verificar que el usuario tiene profile, si no, crear uno
            user_profile, created = request.user.profile if hasattr(request.user, 'profile') else None, False
            if user_profile is None:
                from api.models import UserProfile
                from datetime import datetime, timedelta
                
                user_profile, created = UserProfile.objects.get_or_create(
                    user=request.user,
                    defaults={
                        'full_name': request.user.get_full_name() or request.user.username,
                        'user_type': 'personal',
                        'subscription_status': 'trial',
                        'subscription_start_date': datetime.now(),
                        'subscription_end_date': datetime.now() + timedelta(days=7),
                        'max_fichas_per_month': 10,
                    }
                )
                if created:
                    print(f"✅ UserProfile creado para usuario: {request.user.username}")
            
            # Verificar suscripción activa
            if not user_profile.has_active_subscription():
                return Response({
                    "error": "Suscripción inactiva",
                    "detalle": "Tu período de prueba ha expirado. Por favor, actualiza tu suscripción."
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Recibir datos del Frontend
            data = request.data
            nombre = data.get('nombre', '').strip()
            
            # VALIDACIÓN SEGÚN TIPO DE USUARIO
            if user_profile.user_type == 'personal':
                # Particulares: solo pueden crear fichas con su nombre
                user_full_name = user_profile.full_name or request.user.get_full_name() or request.user.username
                # Normalizar para comparación
                nombre_normalizado = nombre.strip().lower()
                nombre_bd_normalizado = user_full_name.strip().lower()
                
                if nombre_normalizado != nombre_bd_normalizado:
                    return Response({
                        "error": "Nombre inválido",
                        "detalle": f"Como usuario particular, solo puedes crear fichas con tu nombre: {user_full_name}",
                        "expected_name": user_full_name
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Terapeutas: verificar límite de clientes
                if not user_profile.can_create_ficha():
                    return Response({
                        "error": "Límite de clientes alcanzado",
                        "detalle": f"Has alcanzado el límite de {user_profile.max_patients} clientes. Necesitas un upgrade.",
                        "user_type": "therapist",
                        "remaining_capacity": 0
                    }, status=status.HTTP_403_FORBIDDEN)
            
            # VALIDACIÓN PARA PARTICULARES
            if user_profile.user_type == 'personal':
                if not user_profile.can_create_ficha():
                    return Response({
                        "error": "Límite alcanzado",
                        "detalle": f"Has alcanzado el límite de {user_profile.max_fichas_per_month} fichas este mes.",
                        "user_type": "personal",
                        "remaining_capacity": 0
                    }, status=status.HTTP_403_FORBIDDEN)
            
            # Resto de validaciones
            dia = data.get('dia')
            mes = data.get('mes')
            anio = data.get('anio')
            sistema = data.get('sistema', 'dshevastan')

            # Validación de datos
            if not all([nombre, dia, mes, anio]):
                return Response(
                    {"error": "Datos incompletos", "detalle": "Faltan nombre, día, mes o año."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            dia, mes, anio = int(dia), int(mes), int(anio)

            print(f"Calculando para: {nombre} ({dia}/{mes}/{anio}) usando el sistema: {sistema}")

            # Llamar a la lógica de cálculo
            resultado = generar_mapa_cabalista_completo(
                nombre_completo=nombre,
                dia=dia,
                mes=mes,
                anio=anio,
                sistema=sistema
            )

            # Guardar resumen en Calculo
            try:
                Calculo.objects.create(
                    nombre=nombre,
                    fecha_nacimiento=date(anio, mes, dia),
                    sistema=sistema,
                    esencia=resultado['numeros_principales']['esencia']['valor'],
                    expresion=resultado['numeros_principales']['expresion']['valor'],
                    destino=resultado['numeros_principales']['destino']['valor']
                )
                print(f"✅ Cálculo para '{nombre}' guardado en la base de datos.")
            except Exception as db_error:
                print(f"⚠️ Error al guardar en la base de datos: {db_error}")

            # Guardar Ficha completa y actualizar contadores
            try:
                ficha = Ficha.objects.create(
                    usuario=request.user,
                    nombre=nombre,
                    fecha_nacimiento=date(anio, mes, dia),
                    sistema=sistema,
                    resultado=resultado
                )
                
                # Actualizar contadores según tipo de usuario
                if user_profile.user_type == 'personal':
                    user_profile.fichas_created_this_month += 1
                else:  # therapist
                    user_profile.current_patients_count += 1
                
                user_profile.save()
                
                print(f"✅ Ficha completa creada para usuario: {request.user.username} (id={ficha.id})")
            except Exception as db_error:
                print(f"⚠️ Error al guardar la ficha completa: {db_error}")

            # Retornar resultado con información de límites
            response_data = resultado.copy()
            response_data['user_info'] = {
                'user_type': user_profile.user_type,
                'remaining_capacity': user_profile.get_remaining_capacity(),
                'full_name': user_profile.full_name
            }
            return Response(response_data, status=status.HTTP_200_OK)

        except (ValueError, TypeError):
            return Response(
                {"error": "Datos inválidos", "detalle": "El día, mes y año deben ser números válidos."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Error inesperado: {e}")
            return Response(
                {"error": "Error interno del servidor", "detalle": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GeocodeCityView(APIView):
    """Geocodificar una ciudad para obtener coordenadas y zona horaria"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        city = request.data.get('city', '')
        country = request.data.get('country', '')
        
        if not city:
            return Response(
                {'error': 'Se requiere el nombre de la ciudad'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from .geocoding_utils import geocode_city
            result = geocode_city(city, country)
            
            if result:
                return Response({
                    'success': True,
                    'latitude': result['latitude'],
                    'longitude': result['longitude'],
                    'timezone': result['timezone'],
                    'city': result['city'],
                    'country': result['country'],
                    'full_address': result.get('full_address', '')
                })
            else:
                return Response(
                    {'error': f'No se pudo encontrar la ciudad: {city}'},
                    status=status.HTTP_404_NOT_FOUND
                )
        except Exception as e:
            return Response(
                {'error': f'Error en geocodificación: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BirthDataView(APIView):
    """Obtener o actualizar los datos de nacimiento del usuario"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            bd = request.user.birth_data
            serializer = UserBirthDataSerializer(bd)
            return Response(serializer.data)
        except Exception:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        # Crear o actualizar
        try:
            data = request.data
            bd, created = UserBirthData.objects.get_or_create(user=request.user,
                defaults={
                    'full_name': data.get('full_name', request.user.profile.full_name if hasattr(request.user,'profile') else ''),
                    'birth_date': data.get('birth_date')
                }
            )
            
            # Si se proporciona ciudad, geocodificar automáticamente
            if 'birth_city' in data and data['birth_city']:
                city = data.get('birth_city', '')
                country = data.get('birth_country', '')
                
                # Solo geocodificar si no se proporcionaron coordenadas manualmente
                if not data.get('birth_latitude') or not data.get('birth_longitude'):
                    try:
                        from .geocoding_utils import geocode_city
                        geo_result = geocode_city(city, country)
                        
                        if geo_result:
                            data['birth_latitude'] = geo_result['latitude']
                            data['birth_longitude'] = geo_result['longitude']
                            # Actualizar país si se detectó
                            if not country and geo_result.get('country'):
                                data['birth_country'] = geo_result['country']
                    except Exception as geo_error:
                        print(f"⚠️ Error en geocodificación automática: {geo_error}")
                        # Continuar sin coordenadas si falla
            
            if (not created) and bd.is_locked and not request.user.is_staff:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Los datos de nacimiento están bloqueados para edición')

            # Control de lock: si intentan desbloquear (is_locked=False) y no son staff -> denegar
            if 'is_locked' in data and data.get('is_locked') in [False, 'false', 'False', 0, '0']:
                # Intento de desbloqueo vía este endpoint
                if not request.user.is_staff:
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied('No puedes desbloquear tus datos vía este endpoint. Usa la verificación por email o pago.')

            # Actualizar campos
            serializer = UserBirthDataSerializer(bd, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BirthDataUnlockRequestView(APIView):
    """Solicitar desbloqueo — genera token y envía email"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            bd = request.user.birth_data
        except Exception:
            return Response({'error': 'Datos de nacimiento no encontrados'}, status=status.HTTP_404_NOT_FOUND)

        # Si no está bloqueado, no se necesita solicitud
        if not bd.is_locked:
            return Response({'message': 'Datos no están bloqueados'}, status=status.HTTP_400_BAD_REQUEST)

        token = bd.generate_unlock_token()
        try:
            from .emails import send_birthdata_unlock_email
            success = send_birthdata_unlock_email(request.user.profile, token)
            if not success:
                return Response({'error': 'Error enviando email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'Solicitud enviada'} )


class BirthDataUnlockConfirmView(APIView):
    """Confirmar desbloqueo por token o por pago verificado"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            bd = request.user.birth_data
        except Exception:
            return Response({'error': 'Datos de nacimiento no encontrados'}, status=status.HTTP_404_NOT_FOUND)

        token = request.data.get('token')
        payment_confirmed = request.data.get('payment_confirmed')

        # Sed implementado: si token coincide, desbloquear. Si 'payment_confirmed' True y user is staff or true, unlock.
        if token and bd.unlock_token and token == bd.unlock_token:
            bd.is_locked = False
            bd.clear_unlock_request()
            bd.save()
            return Response({'message': 'Datos desbloqueados'})

        # Permitir desbloqueo vía pago si flag enviado (in real world verify with payment gateway)
        if payment_confirmed:
            bd.is_locked = False
            bd.clear_unlock_request()
            bd.save()
            return Response({'message': 'Datos desbloqueados por pago (simulado) '})

        return Response({'error': 'Token inválido o verificación de pago requerida'}, status=status.HTTP_400_BAD_REQUEST)


class FichaListCreateView(generics.ListCreateAPIView):
    """Listar y crear fichas para el usuario autenticado"""
    serializer_class = FichaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Ficha.objects.filter(usuario=self.request.user).order_by('-creado_en')

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class FichaRetrieveView(generics.RetrieveDestroyAPIView):
    """Obtener, editar o eliminar una ficha por ID si pertenece al usuario autenticado"""
    serializer_class = FichaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Ficha.objects.filter(usuario=self.request.user)
    
    def perform_destroy(self, instance):
        """Verificar que el usuario sea el propietario antes de eliminar"""
        if instance.usuario != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("No tienes permiso para eliminar esta ficha")
        instance.delete()


# ============ VISTAS ESPECÍFICAS PARA TERAPEUTAS ============

from .models import Patient, Session, TherapistNote
from .permissions import IsTherapist


class PatientListCreateView(generics.ListCreateAPIView):
    """Listar y crear pacientes (solo terapeutas)"""
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get_serializer_class(self):
        from .serializers import PatientSerializer
        return PatientSerializer
    
    def get_queryset(self):
        return Patient.objects.filter(therapist=self.request.user, is_active=True)
    
    def perform_create(self, serializer):
        serializer.save(therapist=self.request.user)


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Ver, editar o eliminar un paciente específico"""
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get_serializer_class(self):
        from .serializers import PatientSerializer
        return PatientSerializer
    
    def get_queryset(self):
        return Patient.objects.filter(therapist=self.request.user)
    
    def perform_destroy(self, instance):
        # Soft delete
        instance.is_active = False
        instance.save()


class SessionListCreateView(generics.ListCreateAPIView):
    """Listar y crear sesiones terapéuticas"""
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get_serializer_class(self):
        from .serializers import SessionSerializer
        return SessionSerializer
    
    def get_queryset(self):
        return Session.objects.filter(therapist=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(therapist=self.request.user)


class SessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Ver, editar o eliminar una sesión específica"""
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get_serializer_class(self):
        from .serializers import SessionSerializer
        return SessionSerializer
    
    def get_queryset(self):
        return Session.objects.filter(therapist=self.request.user)


class TherapistNoteListCreateView(generics.ListCreateAPIView):
    """Listar y crear notas del terapeuta"""
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get_serializer_class(self):
        from .serializers import TherapistNoteSerializer
        return TherapistNoteSerializer
    
    def get_queryset(self):
        return TherapistNote.objects.filter(therapist=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(therapist=self.request.user)


class TherapistDashboardView(APIView):
    """Dashboard con estadísticas para terapeutas"""
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get(self, request):
        user = request.user
        
        # Contar pacientes activos
        total_patients = Patient.objects.filter(therapist=user, is_active=True).count()
        
        # Contar sesiones este mes
        from django.utils import timezone
        from datetime import timedelta
        
        today = timezone.now()
        first_day_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        sessions_this_month = Session.objects.filter(
            therapist=user,
            session_date__gte=first_day_month
        ).count()
        
        # Contar fichas creadas este mes
        fichas_this_month = Ficha.objects.filter(
            usuario=user,
            creado_en__gte=first_day_month
        ).count()
        
        # Últimas sesiones
        recent_sessions = Session.objects.filter(therapist=user)[:5]
        from .serializers import SessionSerializer
        recent_sessions_data = SessionSerializer(recent_sessions, many=True).data
        
        return Response({
            'total_patients': total_patients,
            'sessions_this_month': sessions_this_month,
            'fichas_this_month': fichas_this_month,
            'recent_sessions': recent_sessions_data,
            'subscription_status': user.profile.subscription_status,
            'subscription_end_date': user.profile.subscription_end_date
        })


# ========== VISTAS PARA SERVICIOS Y RESERVAS ==========

class ServiceCategoryListView(generics.ListAPIView):
    """Listar todas las categorías de servicios activas"""
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    permission_classes = [AllowAny]


class ServiceListView(generics.ListAPIView):
    """Listar todos los servicios activos"""
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Service.objects.filter(is_active=True)
        
        # Filtrar por categoría
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__name=category)
        
        # Filtrar por tipo
        service_type = self.request.query_params.get('type', None)
        if service_type:
            queryset = queryset.filter(service_type=service_type)
        
        # Solo destacados
        featured = self.request.query_params.get('featured', None)
        if featured:
            queryset = queryset.filter(is_featured=True)
        
        return queryset


class ServiceDetailView(generics.RetrieveAPIView):
    """Detalle de un servicio específico"""
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class ServicePackageListView(generics.ListAPIView):
    """Listar todos los paquetes activos"""
    queryset = ServicePackage.objects.filter(is_active=True)
    serializer_class = ServicePackageSerializer
    permission_classes = [AllowAny]


class ServicePackageDetailView(generics.RetrieveAPIView):
    """Detalle de un paquete específico"""
    queryset = ServicePackage.objects.filter(is_active=True)
    serializer_class = ServicePackageSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class BookingListCreateView(generics.ListCreateAPIView):
    """Listar y crear reservas"""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Solo mostrar las reservas del usuario autenticado"""
        return Booking.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookingCreateSerializer
        return BookingSerializer
    
    def perform_create(self, serializer):
        """Asignar el usuario autenticado a la reserva y enviar email"""
        booking = serializer.save(user=self.request.user)
        
        # Enviar email de confirmación
        try:
            send_booking_confirmation_email(booking)
        except Exception as e:
            print(f"Error enviando email de confirmación: {e}")


class BookingDetailView(generics.RetrieveUpdateAPIView):
    """Ver y actualizar una reserva específica"""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Solo mostrar las reservas del usuario autenticado"""
        return Booking.objects.filter(user=self.request.user)


class AvailableSlotsView(generics.ListAPIView):
    """Ver horarios disponibles"""
    queryset = AvailableSlot.objects.filter(is_active=True)
    serializer_class = AvailableSlotSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar por día de la semana
        day = self.request.query_params.get('day', None)
        if day is not None:
            queryset = queryset.filter(day_of_week=day)
        
        # Filtrar por servicio
        service_id = self.request.query_params.get('service', None)
        if service_id:
            queryset = queryset.filter(allowed_services__id=service_id)
        
        return queryset


class BlockedDatesView(generics.ListAPIView):
    """Ver fechas bloqueadas"""
    queryset = BlockedDate.objects.all()
    serializer_class = BlockedDateSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        from datetime import datetime
        queryset = super().get_queryset()
        
        # Solo fechas futuras por defecto
        queryset = queryset.filter(date__gte=datetime.now().date())
        
        # Filtrar por rango de fechas
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset


# Vista para obtener estadísticas de servicios (admin)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def service_stats(request):
    """Estadísticas de servicios y reservas (solo para staff)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'No tienes permisos para acceder a esta información.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from django.db.models import Count, Sum, Avg
    
    # Total de reservas
    total_bookings = Booking.objects.count()
    confirmed_bookings = Booking.objects.filter(status='confirmed').count()
    completed_bookings = Booking.objects.filter(status='completed').count()
    
    # Ingresos totales
    total_revenue_usd = Booking.objects.filter(
        payment_status='confirmed',
        currency='USD'
    ).aggregate(total=Sum('amount_paid'))['total'] or 0
    
    total_revenue_eur = Booking.objects.filter(
        payment_status='confirmed',
        currency='EUR'
    ).aggregate(total=Sum('amount_paid'))['total'] or 0
    
    # Servicios más populares
    popular_services = Service.objects.annotate(
        booking_count=Count('bookings')
    ).order_by('-booking_count')[:5]
    
    popular_services_data = [{
        'name': service.name,
        'bookings': service.booking_count
    } for service in popular_services]
    
    # Métodos de pago
    payment_methods = Booking.objects.values('payment_method').annotate(
        count=Count('id')
    ).order_by('-count')
    
    return Response({
        'total_bookings': total_bookings,
        'confirmed_bookings': confirmed_bookings,
        'completed_bookings': completed_bookings,
        'total_revenue': {
            'usd': float(total_revenue_usd),
            'eur': float(total_revenue_eur)
        },
        'popular_services': popular_services_data,
        'payment_methods': list(payment_methods)
    })


class GoogleOAuthView(APIView):
    """
    Vista para manejar Google OAuth login
    Espera un token de Google en el body: {"token": "google_id_token"}
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Maneja el login con Google"""
        try:
            token = request.data.get('token')
            if not token:
                return Response(
                    {'error': 'No token provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar el token con Google
            # Nota: En producción, usar CLIENT_ID desde settings
            CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
            
            try:
                idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
                google_id = idinfo['sub']
                email = idinfo['email']
                name = idinfo.get('name', email.split('@')[0])
                
            except ValueError:
                return Response(
                    {'error': 'Invalid token'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Buscar o crear el usuario
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': email, 'first_name': name}
            )
            
            # Actualizar o crear el perfil
            profile, _ = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'user_type': 'personal',
                    'full_name': name,
                    'google_id': google_id,
                    'subscription_status': 'trial'
                }
            )
            
            # Actualizar google_id si no lo tenía
            if not profile.google_id:
                profile.google_id = google_id
                profile.save()
            
            # Obtener o crear token de autenticación
            token, _ = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'full_name': profile.full_name,
                    'user_type': profile.user_type,
                    'is_admin': profile.is_admin,
                },
                'created': created,
                'message': 'Login exitoso con Google'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminStatsView(APIView):
    """
    Vista para obtener estadísticas del admin
    Solo accesible por usuarios con is_admin=True
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Obtiene estadísticas generales del sistema"""
        # Verificar que es admin
        if not request.user.profile.is_admin:
            return Response(
                {'error': 'No tienes permisos de administrador'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        total_users = User.objects.count()
        therapists = UserProfile.objects.filter(user_type='therapist').count()
        personal_users = UserProfile.objects.filter(user_type='personal').count()
        total_fichas = Ficha.objects.count()
        active_subscriptions = UserProfile.objects.filter(
            subscription_status__in=['trial', 'active']
        ).count()
        
        # Estadísticas de cursos (si existe la app courses)
        total_courses = 0
        total_enrollments = 0
        total_course_revenue = 0
        try:
            from courses.models import Course, CourseEnrollment
            total_courses = Course.objects.filter(status='published').count()
            total_enrollments = CourseEnrollment.objects.filter(status='active').count()
            total_course_revenue = sum(
                enrollment.amount_paid for enrollment in CourseEnrollment.objects.all()
            )
        except ImportError:
            pass  # La app courses no existe aún
        
        return Response({
            'total_users': total_users,
            'therapists': therapists,
            'personal_users': personal_users,
            'total_fichas': total_fichas,
            'active_subscriptions': active_subscriptions,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'total_course_revenue': total_course_revenue,
        })


class AdminUsersView(generics.ListAPIView):
    """
    Vista para listar y gestionar todos los usuarios
    Solo accesible por administradores
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Verificar que es admin
        if not self.request.user.profile.is_admin:
            return User.objects.none()
        
        return User.objects.all().select_related('profile')
    
    def delete(self, request, pk=None):
        """Eliminar un usuario"""
        if not request.user.profile.is_admin:
            return Response(
                {'error': 'No tienes permisos de administrador'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            user = User.objects.get(pk=pk)
            # Proteger al usuario admin principal
            if user.username == 'tony':
                return Response(
                    {'error': 'No puedes eliminar al administrador principal'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.delete()
            return Response(
                {'message': 'Usuario eliminado correctamente'},
                status=status.HTTP_204_NO_CONTENT
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para ver detalles de un usuario y actualizarlo
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'
    
    def get_queryset(self):
        if not self.request.user.profile.is_admin:
            return User.objects.none()
        return User.objects.all()

    def delete(self, request, *args, **kwargs):
        user = self.get_object()
        if user.username == 'tony':
            return Response(
                {'error': 'No puedes eliminar al administrador principal'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().delete(request, *args, **kwargs)


# TEMPORARY SETUP ENDPOINT - REMOVE AFTER USE
# Force redeploy trigger
@api_view(['GET'])
@permission_classes([AllowAny])
def setup_admin_user(request):
    """
    TEMPORARY ENDPOINT: Create supertony admin user
    Access: GET /api/setup-admin/
    Remove this endpoint after first use for security!
    """
    try:
        # Create or get the user
        user, created = User.objects.get_or_create(
            username='supertony',
            defaults={
                'email': 'admin@analisis-cabalistico-alma.com',
                'first_name': 'Super',
                'last_name': 'Tony',
                'is_staff': True,
                'is_superuser': True,
            }
        )

        if created:
            message = f"✅ Created admin user: {user.username}"
        else:
            message = f"✅ User {user.username} already exists, updating permissions..."

        # Ensure admin permissions
        user.is_staff = True
        user.is_superuser = True
        user.save()

        # Create or update profile
        profile, profile_created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'user_type': 'therapist',
                'full_name': 'Super Tony Admin',
                'is_admin': True,
                'subscription_status': 'active',
                'profession': 'Administrador del Sistema',
                'max_patients': 0,
            }
        )

        profile.is_admin = True
        profile.save()

        return Response({
            'status': 'success',
            'message': message,
            'user': {
                'username': user.username,
                'email': user.email,
                'is_superuser': user.is_superuser,
                'is_staff': user.is_staff,
                'profile_admin': profile.is_admin
            },
            'instructions': [
                '🎉 Admin user created successfully!',
                '📧 Email: admin@analisis-cabalistico-alma.com',
                '🔑 Username: supertony',
                '👑 Superuser: True',
                '🛡️ Staff: True',
                '⚡ Admin: True',
                '',
                '💡 You can now access /admin with username "supertony"',
                '',
                '⚠️  IMPORTANT: Remove this endpoint from views.py and urls.py for security!'
            ]
        })

    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error creating admin user: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


