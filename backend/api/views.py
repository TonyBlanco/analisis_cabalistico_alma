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
from .models import (
    Calculo,
    Ficha,
    UserProfile,
    Patient,
    Session,
    TherapistNote,
    Service,
    ServiceCategory,
    ServicePackage,
    Booking,
    AvailableSlot,
    BlockedDate,
)
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
    BlockedDateSerializer,
    UserProfileDetailSerializer,
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
            'last_name': request.user.last_name,
        }
        
        # Agregar datos del perfil si existe
        if hasattr(request.user, 'profile'):
            profile = request.user.profile
            user_data.update({
                'full_name': profile.full_name,
                'legal_full_name': profile.legal_full_name or profile.full_name,
                'user_type': profile.user_type,
                'is_admin': profile.is_admin,
                'subscription_status': profile.subscription_status,
                'subscription_plan': profile.subscription_plan,
                'membership_expires': str(profile.membership_expires) if profile.membership_expires else None,
                'phone': profile.phone,
                'current_patients_count': profile.current_patients_count,
                'fichas_created_this_month': profile.fichas_created_this_month,
                'profile_version': profile.profile_version,
                'name_change_count': profile.name_change_count,
                'consent_accepted_at': profile.consent_accepted_at.isoformat() if profile.consent_accepted_at else None,
                'birth_date': str(profile.birth_date) if profile.birth_date else None,
                'birth_time': str(profile.birth_time) if profile.birth_time else None,
                'birth_city': profile.birth_city,
                'birth_country': profile.birth_country,
                'birth_latitude': float(profile.birth_latitude) if profile.birth_latitude is not None else None,
                'birth_longitude': float(profile.birth_longitude) if profile.birth_longitude is not None else None,
                'birth_timezone': profile.birth_timezone,
            })
            
            # Si es paciente, incluir patient_id y referencia al therapist
            if profile.user_type == 'patient':
                try:
                    patient = request.user.patient_profile
                    user_data['patient_id'] = patient.id
                    user_data['therapist'] = {
                        'id': patient.therapist.id,
                        'username': patient.therapist.username,
                        'full_name': patient.therapist.profile.full_name if hasattr(patient.therapist, 'profile') else patient.therapist.username,
                    }
                except Exception:
                    # Si no tiene patient_profile vinculado, no incluir estos campos
                    pass

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
                    'birth_place_label': bd.birth_place_label,
                    'is_locked': bd.is_locked,
                    'full_name_change_count': bd.full_name_change_count,
                    'full_name_locked': bd.full_name_locked
                }
                # Sincronizar suavemente ciertos campos de perfil si faltan
                if not profile.birth_date and bd.birth_date:
                    profile.birth_date = bd.birth_date
                if not profile.birth_city and bd.birth_city:
                    profile.birth_city = bd.birth_city
                if not profile.birth_country and bd.birth_country:
                    profile.birth_country = bd.birth_country
                if profile.birth_latitude is None and bd.birth_latitude is not None:
                    profile.birth_latitude = bd.birth_latitude
                if profile.birth_longitude is None and bd.birth_longitude is not None:
                    profile.birth_longitude = bd.birth_longitude
                if not profile.legal_full_name and bd.full_name:
                    profile.legal_full_name = bd.full_name
                # No forzamos timezone aquí: lo gestiona geocoding/birth_data directamente
                profile.save(update_fields=[
                    'birth_date',
                    'birth_city',
                    'birth_country',
                    'birth_latitude',
                    'birth_longitude',
                    'legal_full_name',
                ])
            except Exception:
                pass
        
        return Response(user_data)


class UserProfileMeView(APIView):
    """
    Perfil del usuario autenticado.

    Endpoints:
    - GET  /api/profile/me/         → Lee el núcleo de UserProfile
    - PATCH /api/profile/me/        → Actualiza datos básicos de identidad/nacimiento

    NOTA:
    - Admin no tiene capacidades especiales aquí: siempre actúa sobre su propio perfil.
    - No toca AnalysisRecord ni lógica clínica.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        serializer = UserProfileDetailSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        profile = request.user.profile
        serializer = UserProfileDetailSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Guardamos cambios de perfil (incluye control de cambios de nombre)
        profile = serializer.save()

        # Incrementar versión de perfil SI hubo cambios significativos en los campos manejados aquí
        fields_touched = set(request.data.keys())
        relevant_fields = {
            "legal_full_name",
            "birth_date",
            "birth_time",
            "birth_city",
            "birth_country",
            "birth_latitude",
            "birth_longitude",
        }
        if fields_touched.intersection(relevant_fields):
            try:
                profile.profile_version = (profile.profile_version or 1) + 1
            except Exception:
                profile.profile_version = 1
            profile.save(update_fields=["profile_version"])

        return Response(UserProfileDetailSerializer(profile).data, status=status.HTTP_200_OK)


class UserProfileConsentView(APIView):
    """
    Aceptación de consentimiento terapéutico / tratamiento de datos.

    Endpoint:
    - POST /api/profile/me/consent/

    Reglas:
    - `consent_accepted_at` solo se puede establecer una vez.
    - Idempotente: si ya estaba aceptado, devuelve 400 sin modificar la marca.
    - Incrementa `profile_version` al aceptar consentimiento por primera vez.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = request.user.profile

        if profile.consent_accepted_at:
            return Response(
                {
                    "detail": "El consentimiento ya había sido aceptado.",
                    "consent_accepted_at": profile.consent_accepted_at,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.consent_accepted_at = timezone.now()
        try:
            profile.profile_version = (profile.profile_version or 1) + 1
        except Exception:
            profile.profile_version = 1

        profile.save(update_fields=["consent_accepted_at", "profile_version"])
        return Response(UserProfileDetailSerializer(profile).data, status=status.HTTP_200_OK)


class UpdateProfileView(APIView):
    """Actualizar información del perfil del usuario"""
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        try:
            user = request.user
            profile = user.profile
            birth_data = None
            profile_fields_changed = False
            
            try:
                birth_data = user.birth_data
            except:
                pass
            
            # Update user fields
            if 'email' in request.data:
                user.email = request.data['email']
            if 'first_name' in request.data:
                user.first_name = request.data['first_name']
            if 'last_name' in request.data:
                user.last_name = request.data['last_name']
            user.save()
            
            # Update profile fields
            if 'phone' in request.data:
                profile.phone = request.data['phone']
                profile_fields_changed = True
            if 'full_name' in request.data:
                profile.full_name = request.data['full_name']
                profile_fields_changed = True
            if 'legal_full_name' in request.data:
                profile.legal_full_name = request.data['legal_full_name']
                profile_fields_changed = True
            if 'birth_date' in request.data and request.data['birth_date']:
                try:
                    from datetime import datetime as dt
                    birth_date_str = request.data['birth_date']
                    if isinstance(birth_date_str, str):
                        profile.birth_date = dt.strptime(birth_date_str, '%Y-%m-%d').date()
                    else:
                        profile.birth_date = birth_date_str
                    profile_fields_changed = True
                except (ValueError, TypeError) as e:
                    pass  # Skip if date format is invalid
            if 'birth_city' in request.data:
                profile.birth_city = request.data['birth_city']
                profile_fields_changed = True
            if 'birth_country' in request.data:
                profile.birth_country = request.data['birth_country']
                profile_fields_changed = True
            if 'birth_time' in request.data:
                profile.birth_time = request.data['birth_time'] or None
                profile_fields_changed = True
            profile.save()
            
            # Handle full_name changes with validation
            new_full_name = request.data.get('full_name')
            if new_full_name and birth_data:
                old_full_name = birth_data.full_name
                if new_full_name.strip() != old_full_name.strip():
                    # Name is changing - validate lock status
                    if birth_data.full_name_locked:
                        return Response(
                            {
                                'error': 'Cambios de nombre bloqueados',
                                'message': 'Name changes locked. Contact support@tonyblanco.es'
                            },
                            status=status.HTTP_403_FORBIDDEN
                        )
                    
                    # Check change count
                    if birth_data.full_name_change_count >= 2:
                        # Lock the name and reject
                        birth_data.full_name_locked = True
                        birth_data.save(update_fields=['full_name_locked'])
                        # Sincronizar contador en UserProfile
                        profile.name_change_count = birth_data.full_name_change_count
                        profile.save(update_fields=['name_change_count'])
                        # Log audit event (could use a logging system here)
                        return Response(
                            {
                                'error': 'Cambios de nombre bloqueados',
                                'message': 'Name changes locked. Contact support@tonyblanco.es'
                            },
                            status=status.HTTP_403_FORBIDDEN
                        )
                    
                    # Increment change count
                    birth_data.full_name_change_count += 1
                    profile.name_change_count = birth_data.full_name_change_count
                    profile_fields_changed = True
                    # Log audit event (could use a logging system here)
            
            # Update birth data if provided and exists
            # Also create birth_data if it doesn't exist but birth_city/country are provided
            if 'birth_city' in request.data or 'birth_country' in request.data or 'birth_latitude' in request.data or 'birth_longitude' in request.data:
                if not birth_data:
                    # Try to create birth_data if it doesn't exist
                    try:
                        from .birth_data_model import UserBirthData
                        birth_data = UserBirthData.objects.create(
                            user=user,
                            full_name=profile.full_name or user.get_full_name() or user.username,
                            birth_date=profile.birth_date if profile.birth_date else None,
                        )
                    except Exception:
                        pass  # If creation fails, continue without birth_data
            
            if birth_data and not birth_data.is_locked:
                if 'birth_city' in request.data:
                    birth_data.birth_city = request.data['birth_city']
                if 'birth_country' in request.data:
                    birth_data.birth_country = request.data['birth_country']
                if 'birth_time' in request.data:
                    birth_data.birth_time = request.data['birth_time']
                if 'birth_latitude' in request.data:
                    try:
                        birth_data.birth_latitude = float(request.data['birth_latitude'])
                    except (ValueError, TypeError):
                        pass
                if 'birth_longitude' in request.data:
                    try:
                        birth_data.birth_longitude = float(request.data['birth_longitude'])
                    except (ValueError, TypeError):
                        pass
                if 'birth_place_label' in request.data:
                    birth_data.birth_place_label = request.data['birth_place_label']
                if 'full_name' in request.data and not birth_data.full_name_locked:
                    birth_data.full_name = request.data['full_name']
                if 'birth_date' in request.data and request.data['birth_date']:
                    try:
                        from datetime import datetime as dt
                        birth_date_str = request.data['birth_date']
                        if isinstance(birth_date_str, str):
                            birth_data.birth_date = dt.strptime(birth_date_str, '%Y-%m-%d').date()
                        else:
                            birth_data.birth_date = birth_date_str
                    except (ValueError, TypeError):
                        pass  # Skip if date format is invalid
                birth_data.save()

            # Lógica de consentimiento: aceptar solo si nunca se había aceptado
            accept_consent = request.data.get('accept_consent')
            if accept_consent and not profile.consent_accepted_at:
                from django.utils import timezone
                profile.consent_accepted_at = timezone.now()
                profile_fields_changed = True

            # Incrementar versión de perfil si hubo cambios significativos
            if profile_fields_changed:
                try:
                    profile.profile_version = (profile.profile_version or 1) + 1
                except Exception:
                    # Fallback defensivo
                    profile.profile_version = 1
                profile.save(update_fields=[
                    'phone',
                    'full_name',
                    'legal_full_name',
                    'birth_date',
                    'birth_city',
                    'birth_country',
                    'birth_time',
                    'name_change_count',
                    'consent_accepted_at',
                    'profile_version',
                ])
            
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
            return Response({
                'error': 'validation',
                'message': 'Usuario/email y contraseña son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)

        UserModel = get_user_model()

        user = (
            UserModel.objects.filter(username=username_or_email).first()
            or UserModel.objects.filter(email=username_or_email).first()
        )

        if not user:
            return Response({
                'error': 'user_not_found',
                'message': 'El usuario o email no está registrado. Verifica que esté escrito correctamente.'
            }, status=status.HTTP_400_BAD_REQUEST)

        user_auth = authenticate(username=user.username, password=password)

        if not user_auth:
            return Response({
                'error': 'invalid_password',
                'message': 'La contraseña es incorrecta.',
                'email': user.email
            }, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user_auth)
        
        # Obtener el perfil del usuario para determinar el role
        role = 'visitor'  # Por defecto
        if hasattr(user_auth, 'profile'):
            role = user_auth.profile.user_type
        
        return Response({
            'token': token.key,
            'username': user_auth.username,
            'role': role
        })


class PasswordResetRequestView(APIView):
    """Solicita reset de contraseña enviando email con token."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        from django.conf import settings
        from .emails import send_password_reset_email
        
        email = request.data.get('email')
        
        if not email:
            return Response({
                'error': 'validation',
                'message': 'El email es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        UserModel = get_user_model()
        
        try:
            user = UserModel.objects.get(email=email)
        except UserModel.DoesNotExist:
            # Por seguridad, siempre devolvemos éxito aunque el email no exista
            return Response({
                'message': 'Si el email existe, recibirás un enlace para restablecer tu contraseña.'
            }, status=status.HTTP_200_OK)
        
        # Generar token de reset
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Enviar email
        try:
            send_password_reset_email(user, token, uid)
            return Response({
                'message': 'Si el email existe, recibirás un enlace para restablecer tu contraseña.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            # Por seguridad, siempre devolvemos éxito
            print(f"Error enviando email de reset: {e}")
            return Response({
                'message': 'Si el email existe, recibirás un enlace para restablecer tu contraseña.'
            }, status=status.HTTP_200_OK)


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
    """Listar y crear pacientes"""
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get_serializer_class(self):
        from .serializers import PatientSerializer
        return PatientSerializer
    
    def get_queryset(self):
        return Patient.objects.filter(therapist=self.request.user, is_active=True)
    
    def perform_create(self, serializer):
        """Crear paciente y calcular coordenadas si se proporciona ciudad"""
        instance = serializer.save(therapist=self.request.user)
        
        # Determinar ciudad y país desde diferentes fuentes
        city = None
        country = None
        
        # Prioridad 1: birth_city y birth_country explícitos
        if 'birth_city' in self.request.data and self.request.data.get('birth_city'):
            city = self.request.data.get('birth_city', '').strip()
            country = self.request.data.get('birth_country', '').strip() if self.request.data.get('birth_country') else None
        
        # Prioridad 2: Parsear birth_place si no hay birth_city
        elif 'birth_place' in self.request.data and self.request.data.get('birth_place'):
            birth_place = self.request.data.get('birth_place', '').strip()
            if birth_place:
                # Intentar parsear "Ciudad, País"
                parts = [p.strip() for p in birth_place.split(',')]
                if len(parts) >= 2:
                    city = parts[0]
                    country = parts[1]
                elif len(parts) == 1:
                    city = parts[0]
        
        # Si tenemos ciudad, calcular coordenadas automáticamente
        if city:
            # Solo geocodificar si no se proporcionaron coordenadas manualmente
            if not self.request.data.get('birth_latitude') or not self.request.data.get('birth_longitude'):
                try:
                    from .geocoding_utils import geocode_city
                    geo_result = geocode_city(city, country if country else None)
                    
                    if geo_result:
                        instance.birth_latitude = geo_result['latitude']
                        instance.birth_longitude = geo_result['longitude']
                        instance.birth_timezone = geo_result.get('timezone', '')
                        # Actualizar birth_city y birth_country con los valores normalizados
                        if geo_result.get('city'):
                            instance.birth_city = geo_result['city']
                        if geo_result.get('country'):
                            instance.birth_country = geo_result['country']
                        instance.save(update_fields=['birth_latitude', 'birth_longitude', 'birth_timezone', 'birth_city', 'birth_country'])
                except Exception as geo_error:
                    print(f"⚠️ Error en geocodificación automática para nuevo paciente: {geo_error}")
                    # No fallar la creación si la geocodificación falla


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Ver, editar o eliminar un paciente específico"""
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get_serializer_class(self):
        from .serializers import PatientSerializer
        return PatientSerializer
    
    def get_queryset(self):
        return Patient.objects.filter(therapist=self.request.user)
    
    def perform_update(self, serializer):
        """Actualizar paciente y calcular coordenadas si se proporciona ciudad"""
        instance = serializer.save()
        
        # Determinar ciudad y país desde diferentes fuentes
        city = None
        country = None
        
        # Prioridad 1: birth_city y birth_country explícitos
        if 'birth_city' in self.request.data and self.request.data.get('birth_city'):
            city = self.request.data.get('birth_city', '').strip()
            country = self.request.data.get('birth_country', '').strip() if self.request.data.get('birth_country') else None
        
        # Prioridad 2: Parsear birth_place si no hay birth_city
        elif 'birth_place' in self.request.data and self.request.data.get('birth_place') and not instance.birth_city:
            birth_place = self.request.data.get('birth_place', '').strip()
            if birth_place:
                # Intentar parsear "Ciudad, País"
                parts = [p.strip() for p in birth_place.split(',')]
                if len(parts) >= 2:
                    city = parts[0]
                    country = parts[1]
                elif len(parts) == 1:
                    city = parts[0]
        
        # Si tenemos ciudad, calcular coordenadas automáticamente
        if city:
            # Solo geocodificar si no se proporcionaron coordenadas manualmente
            if not self.request.data.get('birth_latitude') or not self.request.data.get('birth_longitude'):
                try:
                    from .geocoding_utils import geocode_city
                    geo_result = geocode_city(city, country if country else None)
                    
                    if geo_result:
                        instance.birth_latitude = geo_result['latitude']
                        instance.birth_longitude = geo_result['longitude']
                        instance.birth_timezone = geo_result.get('timezone', '')
                        # Actualizar birth_city y birth_country con los valores normalizados
                        if geo_result.get('city'):
                            instance.birth_city = geo_result['city']
                        if geo_result.get('country'):
                            instance.birth_country = geo_result['country']
                        instance.save(update_fields=['birth_latitude', 'birth_longitude', 'birth_timezone', 'birth_city', 'birth_country'])
                except Exception as geo_error:
                    print(f"⚠️ Error en geocodificación automática para paciente {instance.id}: {geo_error}")
                    # No fallar la actualización si la geocodificación falla
    
    def perform_destroy(self, instance):
        # Soft delete
        instance.is_active = False
        instance.save()


class TherapistPatientProfileView(APIView):
    """
    Perfil básico de paciente en contexto de terapeuta.

    Endpoint:
    - GET /api/therapist/patients/<int:pk>/profile/

    Reglas:
    - Solo el terapeuta propietario puede ver el perfil.
    - NO modifica nada (read-only).
    - No toca AnalysisRecord ni lógica clínica.
    """

    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request, pk):
        try:
            patient = Patient.objects.select_related("user").get(
                therapist=request.user,
                id=pk,
                is_active=True,
            )
        except Patient.DoesNotExist:
            return Response(
                {"error": "Paciente no encontrado o no te pertenece."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Datos base desde Patient
        profile_data = {
            "patient_id": patient.id,
            "birth_date": patient.birth_date,
            "birth_city": patient.birth_city,
            "birth_country": patient.birth_country,
            "birth_latitude": patient.birth_latitude,
            "birth_longitude": patient.birth_longitude,
            "birth_timezone": patient.birth_timezone,
            "legal_full_name": None,
            "consent_accepted_at": None,
        }

        # Si el paciente tiene cuenta de usuario vinculada, enriquecemos con UserProfile
        if patient.user and hasattr(patient.user, "profile"):
            up = patient.user.profile
            profile_data["legal_full_name"] = up.legal_full_name or up.full_name
            profile_data["consent_accepted_at"] = up.consent_accepted_at

        return Response(profile_data, status=status.HTTP_200_OK)


class GenerateAIPlanView(APIView):
    """
    Genera un plan de tratamiento holístico usando IA (Gemini)
    Ruta: POST /api/therapist/patients/<int:pk>/generate-ai-plan/
    Solo para terapeutas
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request, pk):
        """Genera el plan de tratamiento holístico con IA"""
        try:
            # Obtener el paciente
            patient = Patient.objects.filter(
                therapist=request.user,
                id=pk
            ).first()
            
            if not patient:
                return Response(
                    {'error': 'Paciente no encontrado o no tienes permisos'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Obtener historial de tests
            from .test_models import TestResult
            # Buscar tests del paciente (pueden estar vinculados al user o al patient)
            test_results = TestResult.objects.filter(
                patient=patient
            )
            # Si no hay tests vinculados al patient, buscar por user
            if not test_results.exists() and patient.user:
                test_results = TestResult.objects.filter(user=patient.user)
            test_results = test_results.order_by('-created_at')
            
            # Convertir a formato para el servicio AI
            test_history = []
            for test in test_results:
                # Obtener el nombre del test (puede ser del módulo o del test_id)
                test_name = test.test_module.name if test.test_module else (test.test_id.upper() if test.test_id else 'Test Desconocido')
                
                test_history.append({
                    'test_id': test.test_id or '',
                    'test_name': test_name,
                    'score': test.score,
                    'clinical_diagnosis': test.clinical_diagnosis or 'Sin diagnóstico',
                    'angel_remedy': test.angel_remedy or 'No asignado'
                })
            
            # Preparar datos del paciente
            from .serializers import PatientSerializer
            patient_serializer = PatientSerializer(patient)
            patient_data = patient_serializer.data
            
            # Generar el plan con IA
            from .utils.holistic_ai import holistic_ai
            
            if not holistic_ai.enabled:
                error_msg = getattr(holistic_ai, 'error_message', 'Servicio de IA no disponible. Verifica la configuración de GEMINI_API_KEY.')
                return Response(
                    {'error': error_msg},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            ai_plan = holistic_ai.generate_report(patient_data, test_history)
            
            # Verificar si hay error en la respuesta
            if 'error' in ai_plan:
                return Response(
                    {'error': ai_plan['error']},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Guardar el plan en el treatment_plan del paciente
            # Combinar con el plan existente si hay uno
            current_plan = patient.treatment_plan or {}
            
            # Actualizar con el nuevo plan de IA
            updated_plan = {
                **current_plan,
                'ai_generated_plan': ai_plan,
                'ai_generated_at': timezone.now().isoformat()
            }
            
            patient.treatment_plan = updated_plan
            patient.save()
            
            # Retornar el plan generado
            return Response({
                'success': True,
                'plan': ai_plan,
                'message': 'Plan de tratamiento holístico generado exitosamente'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Error al generar el plan: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CreatePatientWithAccountView(APIView):
    """
    Crear un paciente con cuenta de usuario (login)
    Ruta: POST /api/therapist/patients/create/
    Solo para terapeutas
    
    Genera automáticamente username y password temporal
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def _generate_username(self, first_name: str) -> str:
        """
        Genera un username único con prefijo 'pat_'
        Formato: pat_juan_1234
        """
        import re
        import secrets
        
        # Normalizar nombre: minúsculas, sin acentos, sin espacios
        def normalize(text):
            # Remover acentos básicos
            replacements = {
                'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
                'ñ': 'n', 'ü': 'u'
            }
            text = text.lower().strip()
            for old, new in replacements.items():
                text = text.replace(old, new)
            # Remover caracteres especiales, solo letras y números
            text = re.sub(r'[^a-z0-9]', '', text)
            return text
        
        first_normalized = normalize(first_name) if first_name else 'user'
        # Limitar a 15 caracteres
        name_part = first_normalized[:15]
        if not name_part:
            name_part = 'user'
        
        # Generar 4 dígitos aleatorios
        random_digits = secrets.randbelow(10000)
        random_digits_str = f"{random_digits:04d}"  # Asegurar 4 dígitos con ceros a la izquierda
        
        # Generar username base
        base_username = f"pat_{name_part}_{random_digits_str}"
        
        # Asegurar que sea único (si existe, generar nuevos dígitos)
        username = base_username
        attempts = 0
        while User.objects.filter(username=username).exists() and attempts < 10:
            random_digits = secrets.randbelow(10000)
            random_digits_str = f"{random_digits:04d}"
            username = f"pat_{name_part}_{random_digits_str}"
            attempts += 1
        
        # Si aún existe después de 10 intentos, agregar contador
        if User.objects.filter(username=username).exists():
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1
        
        return username
    
    def _generate_temp_password(self) -> str:
        """
        Genera una contraseña temporal segura
        Formato: Alma2025! (o similar)
        """
        import secrets
        from datetime import datetime as dt
        
        # Generar una contraseña con: mayúsculas, minúsculas, números, símbolos
        # Formato: Palabra + Año + Símbolo
        words = ['Alma', 'Salud', 'Bienestar', 'Crecimiento', 'Armonia', 'Luz', 'Vida']
        word = secrets.choice(words)
        year = dt.now().year
        symbols = ['!', '@', '#', '$', '%']
        symbol = secrets.choice(symbols)
        
        password = f"{word}{year}{symbol}"
        return password
    
    def post(self, request):
        """
        Crea un nuevo paciente con cuenta de usuario y ficha clínica holística
        
        Body esperado:
        {
            "first_name": "Juan",
            "last_name": "Pérez",
            "email": "juan@example.com",
            "phone": "123456789",  # Opcional
            "avatar": "https://...",  # Opcional
            "birth_date": "1990-01-01",  # Requerido
            "birth_time": "14:30:00",  # Opcional
            "birth_place": "Madrid, España",  # Opcional
            "hebrew_name": "יוחנן",  # Opcional
            "main_complaint": "Ansiedad y estrés",  # Opcional
            "clinical_history": "Historial clínico...",  # Opcional
            "treatment_plan": {  # Opcional
                "meditations": [],
                "oils": [],
                "magnetism": [],
                "biodecoding": []
            }
        }
        
        Retorna:
        {
            "patient": { ... datos del paciente ... },
            "credentials": {
                "username": "pat_juan_1234",
                "password": "Alma2025!"
            },
            "message": "Paciente creado exitosamente"
        }
        """
        # ========== DATOS PERSONALES ==========
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        email = request.data.get('email', '').strip()
        phone = request.data.get('phone', '').strip()
        avatar = request.data.get('avatar', '').strip()
        
        # ========== DATOS ASTROLÓGICOS/CABALÍSTICOS ==========
        birth_date = request.data.get('birth_date')
        birth_time = request.data.get('birth_time', '').strip()
        birth_place = request.data.get('birth_place', '').strip()
        hebrew_name = request.data.get('hebrew_name', '').strip()
        
        # ========== DATOS CLÍNICOS ==========
        main_complaint = request.data.get('main_complaint', '').strip()
        clinical_history = request.data.get('clinical_history', '').strip()
        
        # ========== PLAN DE TRATAMIENTO ==========
        treatment_plan = request.data.get('treatment_plan', {})
        if not isinstance(treatment_plan, dict):
            treatment_plan = {}
        # Asegurar estructura del plan de tratamiento
        if 'meditations' not in treatment_plan:
            treatment_plan['meditations'] = []
        if 'oils' not in treatment_plan:
            treatment_plan['oils'] = []
        if 'magnetism' not in treatment_plan:
            treatment_plan['magnetism'] = []
        if 'biodecoding' not in treatment_plan:
            treatment_plan['biodecoding'] = []
        
        # Validaciones
        if not first_name:
            return Response(
                {'error': 'first_name es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not last_name:
            return Response(
                {'error': 'last_name es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not email:
            return Response(
                {'error': 'email es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not birth_date:
            return Response(
                {'error': 'birth_date es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que el email no esté en uso
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Este email ya está registrado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar límite de pacientes del terapeuta
        therapist_profile = request.user.profile
        can_add, message = therapist_profile.can_add_patient()
        if not can_add:
            return Response(
                {'error': message},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Generar username automático (solo con first_name)
            username = self._generate_username(first_name)
            
            # Generar password temporal seguro
            temp_password = self._generate_temp_password()
            
            # Construir full_name
            full_name = f"{first_name} {last_name}".strip()
            
            # Crear usuario con rol 'patient'
            user = User.objects.create_user(
                username=username,
                email=email,
                password=temp_password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Crear perfil con rol 'patient'
            user_profile = UserProfile.objects.get(user=user)
            user_profile.user_type = 'patient'
            user_profile.full_name = full_name
            user_profile.phone = phone
            if birth_date:
                try:
                    from datetime import datetime as dt
                    if isinstance(birth_date, str):
                        birth_date_obj = dt.strptime(birth_date, '%Y-%m-%d').date()
                    else:
                        birth_date_obj = birth_date
                    user_profile.birth_date = birth_date_obj
                except (ValueError, TypeError):
                    pass  # Si hay error, dejar birth_date vacío
            user_profile.save()
            
            # Procesar birth_time si está presente
            birth_time_obj = None
            if birth_time:
                try:
                    from datetime import datetime as dt
                    if isinstance(birth_time, str):
                        # Intentar diferentes formatos
                        for fmt in ['%H:%M:%S', '%H:%M']:
                            try:
                                birth_time_obj = dt.strptime(birth_time, fmt).time()
                                break
                            except ValueError:
                                continue
                except (ValueError, TypeError):
                    pass
            
            # Procesar birth_date para Patient
            if isinstance(birth_date, str):
                from datetime import datetime as dt
                birth_date_obj = dt.strptime(birth_date, '%Y-%m-%d').date()
            else:
                birth_date_obj = birth_date
            
            # Crear entrada de Patient con todos los campos
            patient = Patient.objects.create(
                therapist=request.user,
                user=user,
                first_name=first_name,
                last_name=last_name,
                full_name=full_name,  # Se calculará automáticamente en save()
                email=email,
                phone=phone,
                avatar=avatar,
                birth_date=birth_date_obj,
                birth_time=birth_time_obj,
                birth_place=birth_place,
                hebrew_name=hebrew_name,
                main_complaint=main_complaint,
                clinical_history=clinical_history,
                treatment_plan=treatment_plan,
                is_active=True
            )
            
            # Actualizar contador de pacientes del terapeuta
            therapist_profile.current_patients_count = Patient.objects.filter(
                therapist=request.user,
                is_active=True
            ).count()
            therapist_profile.save()
            
            # Notificación simulada (preparada para send_mail más adelante)
            email_body = f"""
Hola {first_name},

Bienvenido/a a Mi Camino del Alma.

Tu cuenta de paciente ha sido creada por tu terapeuta.

Credenciales de acceso:
- Usuario: {username}
- Contraseña: {temp_password}

Por favor, cambia tu contraseña después de tu primer inicio de sesión.

Puedes acceder a tu cuenta en: https://app.tonyblanco.com/login

Saludos,
Equipo Mi Camino del Alma
            """.strip()
            
            # Imprimir en consola (simulación)
            print("=" * 60)
            print("EMAIL DE BIENVENIDA (SIMULADO)")
            print("=" * 60)
            print(f"Para: {email}")
            print(f"Asunto: Bienvenido/a a Mi Camino del Alma - Credenciales de Acceso")
            print("-" * 60)
            print(email_body)
            print("=" * 60)
            print(f"\n[NOTA: En producción, esto se enviará con send_mail de Django]")
            print("=" * 60)
            
            # Serializar respuesta con datos del paciente
            from .serializers import PatientSerializer
            patient_serializer = PatientSerializer(patient)
            
            # Retornar datos del paciente Y credenciales
            return Response({
                'patient': patient_serializer.data,
                'credentials': {
                    'username': username,
                    'password': temp_password
                },
                'message': 'Paciente creado exitosamente'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Si hay error, limpiar usuario creado si existe
            if 'user' in locals():
                try:
                    user.delete()
                except:
                    pass
            return Response(
                {'error': f'Error al crear paciente: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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


# ========== ENDPOINT TEMPORAL PARA RESETEAR PASSWORDS ==========
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_admin_passwords_temp(request):
    """
    ENDPOINT TEMPORAL - Resetea contraseñas de usuarios admin
    ⚠️ ELIMINAR ESTE ENDPOINT DESPUÉS DE USAR ⚠️
    """
    import os
    from django.contrib.auth.models import User
    
    # Password desde env o default
    default_password = os.environ.get('ADMIN_DEFAULT_PASSWORD', 'Admin2025!')
    
    usernames = ['supertony', 'supportadmin', 'tony']
    updated = []
    errors = []
    user_details = []
    
    for username in usernames:
        try:
            user = User.objects.get(username=username)
            user.set_password(default_password)
            user.save()
            updated.append(username)
            user_details.append({
                'username': username,
                'email': user.email,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            })
        except User.DoesNotExist:
            errors.append(f"{username} no existe")
        except Exception as e:
            errors.append(f"{username}: {str(e)}")
    
    return Response({
        'message': 'Proceso completado',
        'updated': updated,
        'errors': errors,
        'user_details': user_details,
        'password_used': '***' + default_password[-4:] if len(default_password) > 4 else '***'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def configure_admin_profiles_temp(request):
    """
    ENDPOINT TEMPORAL - Configura perfiles de admin con acceso ilimitado
    ⚠️ ELIMINAR ESTE ENDPOINT DESPUÉS DE USAR ⚠️
    """
    from django.contrib.auth.models import User
    from .models import UserProfile
    from django.utils import timezone
    from datetime import timedelta
    
    results = []
    
    # Configurar supportadmin
    try:
        user = User.objects.get(username='supportadmin')
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.full_name = 'Support Admin'
        profile.user_type = 'therapist'
        profile.is_admin = True
        profile.subscription_status = 'active'
        profile.subscription_plan = 'premium'
        profile.membership_active = True
        profile.membership_expires = None
        profile.subscription_end_date = None
        profile.max_patients = 0  # Ilimitado
        profile.max_fichas_per_month = 999999
        profile.save()
        results.append({'username': 'supportadmin', 'status': 'configured', 'type': 'therapist', 'access': 'unlimited'})
    except Exception as e:
        results.append({'username': 'supportadmin', 'status': 'error', 'message': str(e)})
    
    # Configurar supertony
    try:
        user = User.objects.get(username='supertony')
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.full_name = 'Tony Super'
        profile.user_type = 'therapist'
        profile.is_admin = True
        profile.subscription_status = 'active'
        profile.subscription_plan = 'professional'
        profile.membership_active = True
        profile.membership_expires = None
        profile.subscription_end_date = None
        profile.max_patients = 0  # Ilimitado
        profile.max_fichas_per_month = 999999
        profile.profession = 'Terapeuta'
        profile.specialization = 'Análisis Cabalístico'
        profile.years_of_experience = 20
        profile.save()
        results.append({'username': 'supertony', 'status': 'configured', 'type': 'therapist', 'access': 'unlimited'})
    except Exception as e:
        results.append({'username': 'supertony', 'status': 'error', 'message': str(e)})
    
    # Configurar tony
    try:
        user = User.objects.get(username='tony')
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.full_name = 'Tony Blanco'
        profile.user_type = 'personal'
        profile.is_admin = False
        profile.subscription_status = 'active'
        profile.subscription_plan = 'personal'
        profile.membership_active = True
        profile.membership_expires = timezone.now() + timedelta(days=365)
        profile.subscription_end_date = timezone.now() + timedelta(days=365)
        profile.max_fichas_per_month = 50
        profile.save()
        results.append({'username': 'tony', 'status': 'configured', 'type': 'personal', 'access': '1 year'})
    except Exception as e:
        results.append({'username': 'tony', 'status': 'error', 'message': str(e)})
    
    return Response({
        'message': 'Configuración de perfiles completada',
        'results': results
    })



