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

from .turnstile import (
    TURNSTILE_USER_MESSAGES,
    turnstile_check_request,
    turnstile_public_config,
)

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
    Resource,
    UserResourceAccess,
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
    UserResourceAccessSerializer,
)
from .serializers import UserBirthDataSerializer
from .emails import send_welcome_email, send_booking_confirmation_email
from .notifications.dispatch import notify_patient_account_access


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
        turnstile_ok, turnstile_error = turnstile_check_request(request)
        if not turnstile_ok:
            return Response(
                {
                    'error': turnstile_error,
                    'message': TURNSTILE_USER_MESSAGES.get(turnstile_error, ''),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

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
        turnstile_ok, turnstile_error = turnstile_check_request(request)
        if not turnstile_ok:
            return Response(
                {
                    'error': turnstile_error,
                    'message': TURNSTILE_USER_MESSAGES.get(turnstile_error, ''),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

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
    """
    Obtener información del usuario actual.
    
    CORE RULE: Si hay ciudad/país pero no coordenadas, se intenta resolver automáticamente.
    """
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

            from .dashboard_role import can_access_admin_workspace, dashboard_role_for_user

            # Dashboard Next.js usa user_type del perfil; admin workspace es aparte (is_admin)
            effective_user_type = dashboard_role_for_user(request.user)
            platform_admin = can_access_admin_workspace(request.user)
            
            # Obtener datos de ubicación
            birth_city = getattr(profile, 'birth_city', None)
            birth_country = getattr(profile, 'birth_country', None)
            birth_lat = getattr(profile, 'birth_latitude', None)
            birth_lng = getattr(profile, 'birth_longitude', None)
            birth_timezone = getattr(profile, 'birth_timezone', None)
            
            # CORE RULE: Si hay ciudad/país pero no coordenadas, intentar resolver
            if (birth_city or birth_country) and (birth_lat is None or birth_lng is None):
                from .geocoding_utils import geocode_city
                geo_result = geocode_city(birth_city, birth_country)
                if geo_result:
                    birth_lat = geo_result['latitude']
                    birth_lng = geo_result['longitude']
                    birth_timezone = geo_result.get('timezone', birth_timezone)
                    # Actualizar el perfil con las coordenadas resueltas
                    profile.birth_latitude = birth_lat
                    profile.birth_longitude = birth_lng
                    profile.birth_timezone = birth_timezone or ''
                    profile.save(update_fields=['birth_latitude', 'birth_longitude', 'birth_timezone'])
            
            user_data.update({
                'full_name': getattr(profile, 'full_name', None),
                'legal_full_name': getattr(profile, 'legal_full_name', None) or getattr(profile, 'full_name', None),
                'user_type': effective_user_type,
                'role': effective_user_type,
                'is_admin': platform_admin,
                'can_access_admin_workspace': platform_admin,
                'is_superuser': request.user.is_superuser,
                'is_staff': request.user.is_staff,
                'subscription_status': getattr(profile, 'subscription_status', None),
                'subscription_plan': getattr(profile, 'subscription_plan', None),
                'membership_expires': (
                    str(getattr(profile, 'membership_expires', None))
                    if getattr(profile, 'membership_expires', None) else None
                ),
                'phone': getattr(profile, 'phone', None),
                'current_patients_count': getattr(profile, 'current_patients_count', None),
                'fichas_created_this_month': getattr(profile, 'fichas_created_this_month', None),
                'profile_version': getattr(profile, 'profile_version', None),
                'name_change_count': getattr(profile, 'name_change_count', None),
                'consent_accepted_at': (
                    getattr(profile, 'consent_accepted_at', None).isoformat()
                    if getattr(profile, 'consent_accepted_at', None) else None
                ),
                'birth_date': (
                    str(getattr(profile, 'birth_date', None))
                    if getattr(profile, 'birth_date', None) else None
                ),
                'birth_time': (
                    str(getattr(profile, 'birth_time', None))
                    if getattr(profile, 'birth_time', None) else None
                ),
                'birth_city': birth_city,
                'birth_country': birth_country,
                'birth_latitude': float(birth_lat) if birth_lat is not None else None,
                'birth_longitude': float(birth_lng) if birth_lng is not None else None,
                'birth_timezone': birth_timezone,
                # Validación de completitud de coordenadas
                'coordinates_valid': birth_lat is not None and birth_lng is not None,
            })
            
            # Si es paciente, incluir patient_id y referencia al therapist
            if effective_user_type == 'patient':
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
                
                # CORE RULE: Sincronizar coordenadas a birth_data si faltan
                bd_lat = bd.birth_latitude
                bd_lng = bd.birth_longitude
                bd_city = bd.birth_city
                bd_country = bd.birth_country
                
                if (bd_city or bd_country) and (bd_lat is None or bd_lng is None):
                    from .geocoding_utils import geocode_city
                    geo_result = geocode_city(bd_city, bd_country)
                    if geo_result:
                        bd_lat = geo_result['latitude']
                        bd_lng = geo_result['longitude']
                        bd.birth_latitude = bd_lat
                        bd.birth_longitude = bd_lng
                        bd.save(update_fields=['birth_latitude', 'birth_longitude'])
                
                user_data['birth_data'] = {
                    'full_name': bd.full_name,
                    'birth_date': str(bd.birth_date),
                    'birth_time': str(bd.birth_time) if bd.birth_time else None,
                    'birth_city': bd_city,
                    'birth_country': bd_country,
                    'birth_latitude': float(bd_lat) if bd_lat else None,
                    'birth_longitude': float(bd_lng) if bd_lng else None,
                    'birth_place_label': bd.birth_place_label,
                    'is_locked': bd.is_locked,
                    'full_name_change_count': bd.full_name_change_count,
                    'full_name_locked': bd.full_name_locked,
                    'coordinates_valid': bd_lat is not None and bd_lng is not None,
                }
                # Sincronizar suavemente ciertos campos de perfil si faltan
                sync_needed = False
                if not profile.birth_date and bd.birth_date:
                    profile.birth_date = bd.birth_date
                    sync_needed = True
                if not profile.birth_city and bd_city:
                    profile.birth_city = bd_city
                    sync_needed = True
                if not profile.birth_country and bd_country:
                    profile.birth_country = bd_country
                    sync_needed = True
                if profile.birth_latitude is None and bd_lat is not None:
                    profile.birth_latitude = bd_lat
                    sync_needed = True
                if profile.birth_longitude is None and bd_lng is not None:
                    profile.birth_longitude = bd_lng
                    sync_needed = True
                if not profile.legal_full_name and bd.full_name:
                    profile.legal_full_name = bd.full_name
                    sync_needed = True
                    
                if sync_needed:
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
        else:
            from .dashboard_role import can_access_admin_workspace

            if can_access_admin_workspace(request.user):
                user_data.update({
                    'user_type': 'visitor',
                    'role': 'visitor',
                    'is_admin': True,
                    'can_access_admin_workspace': True,
                    'is_superuser': request.user.is_superuser,
                    'is_staff': request.user.is_staff,
                })
        
        # Alias explícito para clientes que leen `role` en lugar de `user_type`
        if user_data.get('user_type') and 'role' not in user_data:
            user_data['role'] = user_data['user_type']
        
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
            "biologicalSex",
            "genderIdentity",
        }
        if fields_touched.intersection(relevant_fields):
            try:
                profile.profile_version = (profile.profile_version or 1) + 1
            except Exception:
                profile.profile_version = 1
            profile.save(update_fields=["profile_version"])

        # Si el usuario es un paciente con entidad Patient vinculada,
        # sincronizar los datos del UserProfile para que el terapeuta vea lo mismo.
        if getattr(profile, 'user_type', None) == 'patient':
            try:
                patient = Patient.objects.select_related('user').get(user=request.user, is_active=True)
                changed_fields = []

                # Identidad básica
                desired_full_name = (getattr(profile, 'legal_full_name', None) or getattr(profile, 'full_name', None) or '').strip()
                if desired_full_name and desired_full_name != (patient.full_name or ''):
                    patient.full_name = desired_full_name
                    changed_fields.append('full_name')

                # Contacto
                if getattr(profile, 'phone', '') != (patient.phone or ''):
                    patient.phone = getattr(profile, 'phone', '') or ''
                    changed_fields.append('phone')

                # Nacimiento / geo
                if getattr(profile, 'birth_date', None) and getattr(profile, 'birth_date', None) != patient.birth_date:
                    patient.birth_date = profile.birth_date
                    changed_fields.append('birth_date')
                if getattr(profile, 'birth_time', None) != patient.birth_time:
                    patient.birth_time = getattr(profile, 'birth_time', None)
                    changed_fields.append('birth_time')
                if getattr(profile, 'birth_city', '') != (patient.birth_city or ''):
                    patient.birth_city = getattr(profile, 'birth_city', '') or ''
                    changed_fields.append('birth_city')
                if getattr(profile, 'birth_country', '') != (patient.birth_country or ''):
                    patient.birth_country = getattr(profile, 'birth_country', '') or ''
                    changed_fields.append('birth_country')
                if getattr(profile, 'birth_latitude', None) is not None and getattr(profile, 'birth_latitude', None) != patient.birth_latitude:
                    patient.birth_latitude = profile.birth_latitude
                    changed_fields.append('birth_latitude')
                if getattr(profile, 'birth_longitude', None) is not None and getattr(profile, 'birth_longitude', None) != patient.birth_longitude:
                    patient.birth_longitude = profile.birth_longitude
                    changed_fields.append('birth_longitude')
                if getattr(profile, 'birth_timezone', '') != (patient.birth_timezone or ''):
                    patient.birth_timezone = getattr(profile, 'birth_timezone', '') or ''
                    changed_fields.append('birth_timezone')

                if getattr(profile, 'biological_sex', None) != getattr(patient, 'biological_sex', None):
                    patient.biological_sex = getattr(profile, 'biological_sex', None) or 'not_recorded'
                    changed_fields.append('biological_sex')

                if getattr(profile, 'gender_identity', None) != getattr(patient, 'gender_identity', None):
                    patient.gender_identity = getattr(profile, 'gender_identity', None) or 'not_recorded'
                    changed_fields.append('gender_identity')

                if changed_fields:
                    patient.save(update_fields=changed_fields)
            except Patient.DoesNotExist:
                pass

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
    """
    Actualizar información del perfil del usuario.
    
    CORE RULE: Si se actualiza birth_city o birth_country, SE RESUELVEN coordenadas automáticamente.
    Perfiles con ciudad/país pero sin coordenadas son INVÁLIDOS y serán rechazados.
    """
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
            if 'biologicalSex' in request.data:
                profile.biological_sex = request.data.get('biologicalSex') or 'not_recorded'
                profile_fields_changed = True
            if 'genderIdentity' in request.data:
                profile.gender_identity = request.data.get('genderIdentity') or 'not_recorded'
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
            if 'birth_time' in request.data:
                profile.birth_time = request.data['birth_time'] or None
                profile_fields_changed = True
            
            # === GEO-RESOLUTION CORE LOGIC ===
            # Si se actualiza birth_city o birth_country, resolver coordenadas
            # force_geocode=true permite forzar re-geocodificación aunque la ciudad no cambie
            new_city = request.data.get('birth_city')
            new_country = request.data.get('birth_country')
            force_geocode = request.data.get('force_geocode', False)
            city_changing = new_city is not None and new_city != (profile.birth_city or "")
            country_changing = new_country is not None and new_country != (profile.birth_country or "")
            location_changing = city_changing or country_changing or force_geocode
            
            if location_changing:
                final_city = new_city if new_city is not None else profile.birth_city
                final_country = new_country if new_country is not None else profile.birth_country
                
                if final_city or final_country:
                    # Verificar si el usuario proporcionó coordenadas manualmente
                    manual_lat = request.data.get('birth_latitude')
                    manual_lng = request.data.get('birth_longitude')
                    
                    if manual_lat is None or manual_lng is None:
                        # Resolver coordenadas automáticamente
                        from .geocoding_utils import geocode_city, GeoResolutionError
                        
                        geo_result = geocode_city(final_city, final_country)
                        
                        if geo_result:
                            profile.birth_city = geo_result.get('city', final_city)
                            profile.birth_country = geo_result.get('country', final_country)
                            profile.birth_latitude = geo_result['latitude']
                            profile.birth_longitude = geo_result['longitude']
                            profile.birth_timezone = geo_result['timezone']
                            profile_fields_changed = True
                        else:
                            # FALLO DE RESOLUCIÓN - error crítico
                            location_str = f"{final_city}, {final_country}" if final_country else final_city
                            return Response({
                                'error': 'Error de geo-resolución',
                                'message': f"No se pudieron resolver las coordenadas para: {location_str}. "
                                           f"Verifica que el nombre de la ciudad y país sean correctos."
                            }, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        # Usar coordenadas manuales
                        profile.birth_city = final_city
                        profile.birth_country = final_country
                        profile.birth_latitude = float(manual_lat)
                        profile.birth_longitude = float(manual_lng)
                        if 'birth_timezone' in request.data:
                            profile.birth_timezone = request.data['birth_timezone']
                        profile_fields_changed = True
                else:
                    # Ciudad/país vacíos - limpiar coordenadas también
                    profile.birth_city = ""
                    profile.birth_country = ""
                    profile.birth_latitude = None
                    profile.birth_longitude = None
                    profile.birth_timezone = ""
                    profile_fields_changed = True
            elif 'birth_city' in request.data or 'birth_country' in request.data:
                # Se enviaron pero no cambiaron - mantener valores existentes
                pass
            
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
                # Sincronizar datos geo-resueltos a birth_data
                if profile.birth_city:
                    birth_data.birth_city = profile.birth_city
                if profile.birth_country:
                    birth_data.birth_country = profile.birth_country
                if profile.birth_latitude is not None:
                    birth_data.birth_latitude = profile.birth_latitude
                if profile.birth_longitude is not None:
                    birth_data.birth_longitude = profile.birth_longitude
                if 'birth_time' in request.data:
                    birth_data.birth_time = request.data['birth_time']
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
                    'biological_sex',
                    'gender_identity',
                    'full_name',
                    'legal_full_name',
                    'birth_date',
                    'birth_city',
                    'birth_country',
                    'birth_latitude',
                    'birth_longitude',
                    'birth_timezone',
                    'birth_time',
                    'name_change_count',
                    'consent_accepted_at',
                    'profile_version',
                ])

            # Si el usuario es paciente y existe Patient vinculado, sincronizar para que el terapeuta vea lo mismo.
            if getattr(profile, 'user_type', None) == 'patient':
                try:
                    patient = Patient.objects.get(user=user, is_active=True)
                    changed_fields = []

                    desired_full_name = (getattr(profile, 'legal_full_name', None) or getattr(profile, 'full_name', None) or '').strip()
                    if desired_full_name and desired_full_name != (patient.full_name or ''):
                        patient.full_name = desired_full_name
                        changed_fields.append('full_name')

                    if getattr(profile, 'phone', '') != (patient.phone or ''):
                        patient.phone = getattr(profile, 'phone', '') or ''
                        changed_fields.append('phone')

                    if getattr(profile, 'birth_date', None) and getattr(profile, 'birth_date', None) != patient.birth_date:
                        patient.birth_date = profile.birth_date
                        changed_fields.append('birth_date')
                    if getattr(profile, 'birth_time', None) != patient.birth_time:
                        patient.birth_time = getattr(profile, 'birth_time', None)
                        changed_fields.append('birth_time')

                    if getattr(profile, 'birth_city', '') != (patient.birth_city or ''):
                        patient.birth_city = getattr(profile, 'birth_city', '') or ''
                        changed_fields.append('birth_city')
                    if getattr(profile, 'birth_country', '') != (patient.birth_country or ''):
                        patient.birth_country = getattr(profile, 'birth_country', '') or ''
                        changed_fields.append('birth_country')

                    if getattr(profile, 'birth_latitude', None) is not None and getattr(profile, 'birth_latitude', None) != patient.birth_latitude:
                        patient.birth_latitude = profile.birth_latitude
                        changed_fields.append('birth_latitude')
                    if getattr(profile, 'birth_longitude', None) is not None and getattr(profile, 'birth_longitude', None) != patient.birth_longitude:
                        patient.birth_longitude = profile.birth_longitude
                        changed_fields.append('birth_longitude')

                    if getattr(profile, 'birth_timezone', '') != (patient.birth_timezone or ''):
                        patient.birth_timezone = getattr(profile, 'birth_timezone', '') or ''
                        changed_fields.append('birth_timezone')

                    if getattr(profile, 'biological_sex', None) != getattr(patient, 'biological_sex', None):
                        patient.biological_sex = getattr(profile, 'biological_sex', None) or 'not_recorded'
                        changed_fields.append('biological_sex')

                    if getattr(profile, 'gender_identity', None) != getattr(patient, 'gender_identity', None):
                        patient.gender_identity = getattr(profile, 'gender_identity', None) or 'not_recorded'
                        changed_fields.append('gender_identity')

                    if changed_fields:
                        patient.save(update_fields=changed_fields)
                except Patient.DoesNotExist:
                    pass
            
            return Response({
                'success': True,
                'message': 'Perfil actualizado correctamente',
                'profile': {
                    'birth_city': profile.birth_city,
                    'birth_country': profile.birth_country,
                    'birth_latitude': float(profile.birth_latitude) if profile.birth_latitude else None,
                    'birth_longitude': float(profile.birth_longitude) if profile.birth_longitude else None,
                    'birth_timezone': profile.birth_timezone,
                    'biologicalSex': getattr(profile, 'biological_sex', None),
                    'genderIdentity': getattr(profile, 'gender_identity', None),
                }
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
            user = request.user

            from .dashboard_role import can_access_admin_workspace, dashboard_role_for_user

            profile = request.user.profile
            dashboard_role = dashboard_role_for_user(user)
            platform_admin = can_access_admin_workspace(user)

            # Staff/superuser: acceso completo; rol de dashboard = user_type del perfil
            if user.username == 'supertony' or user.is_superuser or user.is_staff or platform_admin:
                return Response({
                    'membership_active': True,
                    'user_type': dashboard_role,
                    'subscription_status': 'active',
                    'subscription_plan': 'premium',
                    'membership_expires': None,
                    'can_access_dashboard': True,
                    'can_create_ficha': True,
                    'is_superuser': bool(user.is_superuser or platform_admin),
                    'can_access_admin_workspace': platform_admin,
                })

            has_active = profile.has_active_subscription()
            
            return Response({
                'membership_active': has_active,
                'user_type': dashboard_role,
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


class TurnstileConfigView(APIView):
    """Config pública del widget Cloudflare Turnstile (login)."""
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(turnstile_public_config())


class GoogleOAuthConfigView(APIView):
    """Client ID público para Google Sign-In (GIS) en el frontend."""
    permission_classes = [AllowAny]

    def get(self, request):
        from decouple import config

        client_id = config('GOOGLE_CLIENT_ID', default='').strip()
        return Response({
            'enabled': bool(client_id),
            'client_id': client_id or None,
        })


class EmailOrUsernameAuthToken(APIView):
    """
    Permite login con username o email y devuelve un token.
    
    Respuestas de error específicas:
    - error: 'validation' - Campos requeridos faltantes
    - error: 'turnstile_required' - Falta verificación anti-bot
    - error: 'turnstile_invalid' - Token Turnstile inválido
    - error: 'turnstile_verify_failed' - Error al validar con Cloudflare
    - error: 'user_not_found' - Usuario/email no existe
    - error: 'invalid_password' - Contraseña incorrecta
    - error: 'account_inactive' - Cuenta desactivada
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        turnstile_ok, turnstile_error = turnstile_check_request(request)
        if not turnstile_ok:
            return Response(
                {
                    'error': turnstile_error,
                    'message': TURNSTILE_USER_MESSAGES.get(
                        turnstile_error,
                        'Verificación de seguridad requerida.',
                    ),
                    'detail': TURNSTILE_USER_MESSAGES.get(turnstile_error, ''),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        username_or_email = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        # Validación de campos requeridos
        if not username_or_email or not password:
            return Response({
                'error': 'validation',
                'message': 'Usuario/email y contraseña son requeridos',
                'detail': 'Usuario/email y contraseña son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)

        UserModel = get_user_model()

        # Buscar usuario por username o email
        user = (
            UserModel.objects.filter(username__iexact=username_or_email).first()
            or UserModel.objects.filter(email__iexact=username_or_email).first()
        )

        # Usuario no encontrado
        if not user:
            return Response({
                'error': 'user_not_found',
                'message': 'No existe una cuenta con ese usuario o email',
                'detail': 'No existe una cuenta con ese usuario o email'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Verificar si la cuenta está activa
        if not user.is_active:
            return Response({
                'error': 'account_inactive',
                'message': 'Esta cuenta ha sido desactivada. Contacta soporte.',
                'detail': 'Esta cuenta ha sido desactivada'
            }, status=status.HTTP_403_FORBIDDEN)

        # Autenticar con contraseña
        user_auth = authenticate(username=user.username, password=password)

        # Contraseña incorrecta
        if not user_auth:
            return Response({
                'error': 'invalid_password',
                'message': 'La contraseña es incorrecta',
                'detail': 'La contraseña es incorrecta',
                'email': user.email  # Para facilitar recuperación
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Login exitoso - generar token
        token, _ = Token.objects.get_or_create(user=user_auth)

        from .dashboard_role import dashboard_role_for_user

        role = dashboard_role_for_user(user_auth)

        return Response({
            'token': token.key,
            'username': user_auth.username,
            'email': user_auth.email,
            'role': role
        })


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


class BirthDataView(APIView):
    """
    Obtener o actualizar los datos de nacimiento del usuario.
    
    CORE RULE: Si se actualiza birth_city o birth_country, SE RESUELVEN coordenadas automáticamente.
    La actualización FALLARÁ si las coordenadas no pueden ser resueltas.
    """
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
            data = request.data.copy()  # Copia mutable
            bd, created = UserBirthData.objects.get_or_create(user=request.user,
                defaults={
                    'full_name': data.get('full_name', request.user.profile.full_name if hasattr(request.user,'profile') else ''),
                    'birth_date': data.get('birth_date')
                }
            )
            
            if (not created) and bd.is_locked and not request.user.is_staff:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Los datos de nacimiento están bloqueados para edición')

            # Control de lock: si intentan desbloquear (is_locked=False) y no son staff -> denegar
            if 'is_locked' in data and data.get('is_locked') in [False, 'false', 'False', 0, '0']:
                # Intento de desbloqueo vía este endpoint
                if not request.user.is_staff:
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied('No puedes desbloquear tus datos vía este endpoint. Usa la verificación por email o pago.')

            # === GEO-RESOLUTION CORE LOGIC ===
            new_city = data.get('birth_city')
            new_country = data.get('birth_country')
            city_changing = new_city is not None and new_city != (bd.birth_city or "")
            country_changing = new_country is not None and new_country != (bd.birth_country or "")
            location_changing = city_changing or country_changing
            
            if location_changing or (new_city and (not bd.birth_latitude or not bd.birth_longitude)):
                final_city = new_city if new_city is not None else bd.birth_city
                final_country = new_country if new_country is not None else bd.birth_country
                
                if final_city or final_country:
                    # Verificar si el usuario proporcionó coordenadas manualmente
                    manual_lat = data.get('birth_latitude')
                    manual_lng = data.get('birth_longitude')
                    
                    if manual_lat is None or manual_lng is None:
                        # Resolver coordenadas automáticamente
                        from .geocoding_utils import geocode_city
                        
                        geo_result = geocode_city(final_city, final_country)
                        
                        if geo_result:
                            data['birth_latitude'] = geo_result['latitude']
                            data['birth_longitude'] = geo_result['longitude']
                            # Normalizar ciudad/país
                            if geo_result.get('city'):
                                data['birth_city'] = geo_result['city']
                            if geo_result.get('country'):
                                data['birth_country'] = geo_result['country']
                        else:
                            # FALLO DE RESOLUCIÓN - error crítico
                            location_str = f"{final_city}, {final_country}" if final_country else final_city
                            return Response({
                                'error': 'Error de geo-resolución',
                                'message': f"No se pudieron resolver las coordenadas para: {location_str}. "
                                           f"Verifica que el nombre de la ciudad y país sean correctos."
                            }, status=status.HTTP_400_BAD_REQUEST)

            # Actualizar campos
            serializer = UserBirthDataSerializer(bd, data=data, partial=True)
            if serializer.is_valid():
                bd_saved = serializer.save()
                
                # Sincronizar a UserProfile si existe
                if hasattr(request.user, 'profile'):
                    profile = request.user.profile
                    sync_fields = False
                    if bd_saved.birth_city:
                        profile.birth_city = bd_saved.birth_city
                        sync_fields = True
                    if bd_saved.birth_country:
                        profile.birth_country = bd_saved.birth_country
                        sync_fields = True
                    if bd_saved.birth_latitude is not None:
                        profile.birth_latitude = bd_saved.birth_latitude
                        sync_fields = True
                    if bd_saved.birth_longitude is not None:
                        profile.birth_longitude = bd_saved.birth_longitude
                        sync_fields = True
                    if sync_fields:
                        profile.save(update_fields=['birth_city', 'birth_country', 'birth_latitude', 'birth_longitude'])
                
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
    """
    Listar y crear pacientes.
    
    CORE RULE: Si se proporciona birth_city o birth_country, SE RESUELVEN coordenadas automáticamente.
    La creación FALLARÁ si las coordenadas no pueden ser resueltas.
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get_serializer_class(self):
        from .serializers import PatientSerializer
        return PatientSerializer
    
    def get_queryset(self):
        return Patient.objects.filter(therapist=self.request.user, is_active=True)
    
    def create(self, request, *args, **kwargs):
        """Override create para aplicar geo-resolución ANTES de guardar"""
        from .geocoding_utils import geocode_city
        
        # Determinar ciudad y país desde diferentes fuentes
        city = None
        country = None
        
        # Prioridad 1: birth_city y birth_country explícitos
        if 'birth_city' in request.data and request.data.get('birth_city'):
            city = request.data.get('birth_city', '').strip()
            country = request.data.get('birth_country', '').strip() if request.data.get('birth_country') else None
        
        # Prioridad 2: Parsear birth_place si no hay birth_city
        elif 'birth_place' in request.data and request.data.get('birth_place'):
            birth_place = request.data.get('birth_place', '').strip()
            if birth_place:
                # Intentar parsear "Ciudad, País"
                parts = [p.strip() for p in birth_place.split(',')]
                if len(parts) >= 2:
                    city = parts[0]
                    country = parts[1]
                elif len(parts) == 1:
                    city = parts[0]
        
        # Si hay ciudad, resolver coordenadas ANTES de crear
        if city:
            manual_lat = request.data.get('birth_latitude')
            manual_lng = request.data.get('birth_longitude')
            
            if manual_lat is None or manual_lng is None:
                geo_result = geocode_city(city, country if country else None)
                
                if geo_result:
                    # Modificar request.data con las coordenadas resueltas
                    mutable_data = request.data.copy()
                    mutable_data['birth_latitude'] = geo_result['latitude']
                    mutable_data['birth_longitude'] = geo_result['longitude']
                    mutable_data['birth_timezone'] = geo_result.get('timezone', '')
                    if geo_result.get('city'):
                        mutable_data['birth_city'] = geo_result['city']
                    if geo_result.get('country'):
                        mutable_data['birth_country'] = geo_result['country']
                    request._full_data = mutable_data
                else:
                    # FALLO DE RESOLUCIÓN - error crítico
                    location_str = f"{city}, {country}" if country else city
                    return Response({
                        'error': 'Error de geo-resolución',
                        'message': f"No se pudieron resolver las coordenadas para: {location_str}. "
                                   f"Verifica que el nombre de la ciudad y país sean correctos."
                    }, status=status.HTTP_400_BAD_REQUEST)
        
        # Llamar al create original
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        """Crear paciente con coordenadas ya resueltas"""
        serializer.save(therapist=self.request.user)


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Ver, editar o eliminar un paciente específico.
    
    CORE RULE: Si se actualiza birth_city o birth_country, SE RESUELVEN coordenadas automáticamente.
    La actualización FALLARÁ si las coordenadas no pueden ser resueltas.
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get_serializer_class(self):
        from .serializers import PatientSerializer
        return PatientSerializer
    
    def get_queryset(self):
        return Patient.objects.filter(therapist=self.request.user)
    
    def update(self, request, *args, **kwargs):
        """Override update para aplicar geo-resolución ANTES de guardar"""
        from .geocoding_utils import geocode_city
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Determinar si la ubicación está cambiando
        new_city = request.data.get('birth_city')
        new_country = request.data.get('birth_country')
        city_changing = new_city is not None and new_city != (instance.birth_city or "")
        country_changing = new_country is not None and new_country != (instance.birth_country or "")
        location_changing = city_changing or country_changing
        
        # También verificar birth_place
        if not location_changing and 'birth_place' in request.data and request.data.get('birth_place'):
            birth_place = request.data.get('birth_place', '').strip()
            if birth_place:
                parts = [p.strip() for p in birth_place.split(',')]
                if len(parts) >= 2:
                    new_city = parts[0]
                    new_country = parts[1]
                elif len(parts) == 1:
                    new_city = parts[0]
                location_changing = True
        
        if location_changing:
            final_city = new_city if new_city is not None else instance.birth_city
            final_country = new_country if new_country is not None else instance.birth_country
            
            if final_city or final_country:
                manual_lat = request.data.get('birth_latitude')
                manual_lng = request.data.get('birth_longitude')
                
                if manual_lat is None or manual_lng is None:
                    geo_result = geocode_city(final_city, final_country if final_country else None)
                    
                    if geo_result:
                        # Modificar request.data con las coordenadas resueltas
                        mutable_data = request.data.copy()
                        mutable_data['birth_latitude'] = geo_result['latitude']
                        mutable_data['birth_longitude'] = geo_result['longitude']
                        mutable_data['birth_timezone'] = geo_result.get('timezone', '')
                        if geo_result.get('city'):
                            mutable_data['birth_city'] = geo_result['city']
                        if geo_result.get('country'):
                            mutable_data['birth_country'] = geo_result['country']
                        request._full_data = mutable_data
                    else:
                        # FALLO DE RESOLUCIÓN - error crítico
                        location_str = f"{final_city}, {final_country}" if final_country else final_city
                        return Response({
                            'error': 'Error de geo-resolución',
                            'message': f"No se pudieron resolver las coordenadas para: {location_str}. "
                                       f"Verifica que el nombre de la ciudad y país sean correctos."
                        }, status=status.HTTP_400_BAD_REQUEST)
        
        # Llamar al update original
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
    
    def perform_update(self, serializer):
        """Actualizar paciente con coordenadas ya resueltas"""
        instance = serializer.save()
        
        # Sincronizar a UserProfile del paciente si existe
        if instance.user and hasattr(instance.user, 'profile'):
            user_profile = instance.user.profile
            sync_fields = []
            if instance.birth_city:
                user_profile.birth_city = instance.birth_city
                sync_fields.append('birth_city')
            if instance.birth_country:
                user_profile.birth_country = instance.birth_country
                sync_fields.append('birth_country')
            if instance.birth_latitude is not None:
                user_profile.birth_latitude = instance.birth_latitude
                sync_fields.append('birth_latitude')
            if instance.birth_longitude is not None:
                user_profile.birth_longitude = instance.birth_longitude
                sync_fields.append('birth_longitude')
            if hasattr(instance, 'birth_timezone') and instance.birth_timezone:
                user_profile.birth_timezone = instance.birth_timezone
                sync_fields.append('birth_timezone')
            if sync_fields:
                user_profile.save(update_fields=sync_fields)
    
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
    - SIEMPRE retorna lat/lng si hay ciudad/país.
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
        birth_lat = getattr(patient, "birth_latitude", None)
        birth_lng = getattr(patient, "birth_longitude", None)
        birth_city = getattr(patient, "birth_city", None)
        birth_country = getattr(patient, "birth_country", None)
        birth_timezone = getattr(patient, "birth_timezone", None)
        
        # CORE RULE: Si hay ciudad/país pero no coordenadas, intentar resolver
        if (birth_city or birth_country) and (birth_lat is None or birth_lng is None):
            from .geocoding_utils import geocode_city
            geo_result = geocode_city(birth_city, birth_country)
            if geo_result:
                birth_lat = geo_result['latitude']
                birth_lng = geo_result['longitude']
                birth_timezone = geo_result.get('timezone', birth_timezone)
                # Actualizar el paciente con las coordenadas resueltas
                patient.birth_latitude = birth_lat
                patient.birth_longitude = birth_lng
                patient.birth_timezone = birth_timezone or ''
                patient.save(update_fields=['birth_latitude', 'birth_longitude', 'birth_timezone'])

        profile_data = {
            "patient_id": patient.id,
            "user_id": patient.user.id if patient.user else None,  # For SWM workspace creation
            "full_name": patient.full_name,
            "birth_date": getattr(patient, "birth_date", None),
            "birth_time": str(patient.birth_time) if patient.birth_time else None,
            "birth_city": birth_city,
            "birth_country": birth_country,
            "birth_latitude": float(birth_lat) if birth_lat is not None else None,
            "birth_longitude": float(birth_lng) if birth_lng is not None else None,
            "birth_timezone": birth_timezone,
            "legal_full_name": None,
            "consent_accepted_at": None,
            "biologicalSex": getattr(patient, "biological_sex", None),
            "genderIdentity": getattr(patient, "gender_identity", None),
            # Validación de completitud
            "coordinates_valid": birth_lat is not None and birth_lng is not None,
        }

        # Si el paciente tiene cuenta de usuario vinculada, enriquecemos con UserProfile
        if patient.user and hasattr(patient.user, "profile"):
            up = patient.user.profile
            profile_data["legal_full_name"] = getattr(up, "legal_full_name", None) or getattr(
                up, "full_name", None
            )
            profile_data["consent_accepted_at"] = getattr(up, "consent_accepted_at", None)

            # Enriquecer demografía desde UserProfile si existe (fuente de verdad para pacientes con cuenta).
            # Evitar pisar valores reales con defaults ("not_recorded").
            up_bio = getattr(up, "biological_sex", None)
            if up_bio and up_bio != "not_recorded":
                profile_data["biologicalSex"] = up_bio
            up_gender = getattr(up, "gender_identity", None)
            if up_gender and up_gender != "not_recorded":
                profile_data["genderIdentity"] = up_gender

        return Response(profile_data, status=status.HTTP_200_OK)


class TherapistUpdatePatientProfileView(APIView):
    """
    Actualización de perfil de paciente por terapeuta.

    Endpoint:
    - PATCH /api/therapist/patients/<int:pk>/profile/update/

    Reglas:
    - Solo el terapeuta propietario puede actualizar el perfil del paciente.
    - Actualiza campos básicos del paciente (Patient model) y UserProfile si existe cuenta vinculada.
    - Si se proporciona ciudad/país, automáticamente resuelve coordenadas y zona horaria.
    - Retorna estado de completitud del perfil.
    """

    permission_classes = [IsAuthenticated, IsTherapist]

    def patch(self, request, pk):
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

        # Campos permitidos para actualizar en Patient model
        patient_fields = {
            'full_name': 'full_name',  # legal_full_name se mapea a full_name en Patient
            'birth_date': 'birth_date',
            'birth_time': 'birth_time',
            'birth_city': 'birth_city', 
            'birth_country': 'birth_country',
            'biologicalSex': 'biological_sex',
            'genderIdentity': 'gender_identity',
        }

        # Actualizar campos del Patient model
        patient_updated = False
        for api_field, model_field in patient_fields.items():
            if api_field in request.data and request.data[api_field] is not None:
                setattr(patient, model_field, request.data[api_field])
                patient_updated = True

        # Si se actualizó ciudad o país, intentar geocoding
        city = request.data.get('birth_city') or getattr(patient, 'birth_city', None)
        country = request.data.get('birth_country') or getattr(patient, 'birth_country', None)
        if city or country:
            from .geocoding_utils import geocode_city
            geo_result = geocode_city(city, country)
            if geo_result:
                patient.birth_latitude = geo_result['latitude'] 
                patient.birth_longitude = geo_result['longitude']
                patient.birth_timezone = geo_result.get('timezone', '')
                patient_updated = True

        if patient_updated:
            patient.save()

        # Si el paciente tiene cuenta de usuario vinculada, actualizar UserProfile también
        user_profile_updated = False
        if patient.user and hasattr(patient.user, "profile"):
            up = patient.user.profile
            update_fields = []

            if 'legal_full_name' in request.data:
                up.legal_full_name = request.data['legal_full_name'] or None
                update_fields.append('legal_full_name')

            if 'biologicalSex' in request.data and request.data.get('biologicalSex') is not None:
                up.biological_sex = request.data.get('biologicalSex')
                update_fields.append('biological_sex')

            if 'genderIdentity' in request.data and request.data.get('genderIdentity') is not None:
                up.gender_identity = request.data.get('genderIdentity')
                update_fields.append('gender_identity')

            if update_fields:
                # Mantener updated_at si existe
                if hasattr(up, 'updated_at'):
                    update_fields.append('updated_at')
                up.save(update_fields=update_fields)
                user_profile_updated = True

        # Calcular estado de completitud del perfil
        profile_complete = bool(
            patient.full_name and
            patient.birth_date and
            patient.birth_city and
            patient.birth_country and
            patient.birth_latitude is not None and
            patient.birth_longitude is not None
        )

        missing_fields = []
        if not patient.full_name: missing_fields.append('legal_full_name')  # API usa legal_full_name
        if not patient.birth_date: missing_fields.append('birth_date') 
        if not patient.birth_city: missing_fields.append('birth_city') 
        if not patient.birth_country: missing_fields.append('birth_country') 
        if patient.birth_latitude is None or patient.birth_longitude is None: missing_fields.append('coordinates') 

        return Response({
            "message": "Perfil actualizado exitosamente" if patient_updated or user_profile_updated else "No se realizaron cambios", 
            "profile_complete": profile_complete, 
            "missing_fields": missing_fields, 
            "profile_updated_by_therapist": True, 
            "last_therapist_update": timezone.now().isoformat() if patient_updated else None
        })


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
            
            ai_plan = holistic_ai.generate_report(
                patient_data,
                test_history,
                therapist=request.user,
                patient_id=patient.id,
            )
            
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
        from .serializers import CreatePatientWithAccountInputSerializer

        input_serializer = CreatePatientWithAccountInputSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated = input_serializer.validated_data

        # ========== DATOS PERSONALES ==========
        first_name = validated['first_name'].strip()
        last_name = validated['last_name'].strip()
        email = validated['email'].strip()
        phone = validated.get('phone', '').strip()
        telegram = validated.get('telegram', '').strip()
        send_via = validated.get('send_via', ['email'])
        avatar = request.data.get('avatar', '').strip()
        
        # ========== DATOS ASTROLÓGICOS/CABALÍSTICOS ==========
        birth_date = validated['birth_date']
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
            
            # === GEO-RESOLUTION CORE LOGIC ===
            # Determinar ciudad y país desde birth_place o campos explícitos
            birth_city = request.data.get('birth_city', '').strip()
            birth_country = request.data.get('birth_country', '').strip()
            birth_latitude = None
            birth_longitude = None
            birth_timezone = ''
            
            # Si no hay birth_city pero hay birth_place, parsear
            if not birth_city and birth_place:
                parts = [p.strip() for p in birth_place.split(',')]
                if len(parts) >= 2:
                    birth_city = parts[0]
                    birth_country = parts[1]
                elif len(parts) == 1:
                    birth_city = parts[0]
            
            # Si hay ciudad/país, resolver coordenadas
            if birth_city or birth_country:
                manual_lat = request.data.get('birth_latitude')
                manual_lng = request.data.get('birth_longitude')
                
                if manual_lat is not None and manual_lng is not None:
                    # Usar coordenadas manuales
                    birth_latitude = float(manual_lat)
                    birth_longitude = float(manual_lng)
                    birth_timezone = request.data.get('birth_timezone', '')
                else:
                    # Resolver coordenadas automáticamente
                    from .geocoding_utils import geocode_city
                    geo_result = geocode_city(birth_city, birth_country if birth_country else None)
                    
                    if geo_result:
                        birth_city = geo_result.get('city', birth_city)
                        birth_country = geo_result.get('country', birth_country)
                        birth_latitude = geo_result['latitude']
                        birth_longitude = geo_result['longitude']
                        birth_timezone = geo_result.get('timezone', '')
                    else:
                        # FALLO DE RESOLUCIÓN - error crítico
                        # Limpiar usuario creado
                        user.delete()
                        location_str = f"{birth_city}, {birth_country}" if birth_country else birth_city
                        return Response({
                            'error': 'Error de geo-resolución',
                            'message': f"No se pudieron resolver las coordenadas para: {location_str}. "
                                       f"Verifica que el nombre de la ciudad y país sean correctos."
                        }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear entrada de Patient con todos los campos incluyendo coordenadas
            patient = Patient.objects.create(
                therapist=request.user,
                user=user,
                first_name=first_name,
                last_name=last_name,
                full_name=full_name,  # Se calculará automáticamente en save()
                email=email,
                phone=phone,
                telegram=telegram,
                send_credentials_via=send_via,
                avatar=avatar,
                birth_date=birth_date_obj,
                birth_time=birth_time_obj,
                birth_place=birth_place,
                birth_city=birth_city,
                birth_country=birth_country,
                birth_latitude=birth_latitude,
                birth_longitude=birth_longitude,
                birth_timezone=birth_timezone,
                hebrew_name=hebrew_name,
                main_complaint=main_complaint,
                clinical_history=clinical_history,
                treatment_plan=treatment_plan,
                is_active=True
            )
            
            # Sincronizar coordenadas a UserProfile del paciente
            user_profile.birth_city = birth_city
            user_profile.birth_country = birth_country
            user_profile.birth_latitude = birth_latitude
            user_profile.birth_longitude = birth_longitude
            user_profile.birth_timezone = birth_timezone
            user_profile.save(update_fields=['birth_city', 'birth_country', 'birth_latitude', 'birth_longitude', 'birth_timezone'])
            
            # Actualizar contador de pacientes del terapeuta
            therapist_profile.current_patients_count = Patient.objects.filter(
                therapist=request.user,
                is_active=True
            ).count()
            therapist_profile.save()
            
            therapist_name = therapist_profile.full_name or request.user.get_full_name() or request.user.username
            notification = notify_patient_account_access(
                patient_id=patient.id,
                user_id=user.id,
                patient_email=email,
                patient_phone=phone,
                patient_first_name=first_name,
                username=username,
                temp_password=temp_password,
                therapist_name=therapist_name,
                send_via=send_via,
            )

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
                'email_sent': notification.email_sent,
                'telegram_sent': notification.telegram_sent,
                'telegram_link': notification.telegram_link,
                'whatsapp_sent': notification.whatsapp_sent,
                'welcome_url': notification.welcome_url,
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


class ResendPatientCredentialsView(APIView):
    """
    Regenera contraseña temporal y reenvía credenciales al consultante.
    Ruta: POST /api/therapist/patients/<pk>/resend-credentials/
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    RESEND_COOLDOWN_SECONDS = 60

    def post(self, request, pk):
        from django.core.cache import cache

        cache_key = f'patient_resend:{request.user.id}:{pk}'
        if cache.get(cache_key):
            return Response(
                {
                    'error': 'rate_limited',
                    'message': 'Espera un momento antes de reenviar credenciales otra vez.',
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        try:
            patient = Patient.objects.select_related('user', 'therapist__profile').get(pk=pk)
        except Patient.DoesNotExist:
            return Response({'error': 'Consultante no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        if patient.therapist_id != request.user.id:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

        if not patient.user_id:
            return Response(
                {'error': 'Este consultante no tiene cuenta de acceso. Usa «Vincular cuenta existente».'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = patient.user
        if not patient.email and not user.email:
            return Response({'error': 'El consultante no tiene email registrado'}, status=status.HTTP_400_BAD_REQUEST)

        creator = CreatePatientWithAccountView()
        temp_password = creator._generate_temp_password()
        user.set_password(temp_password)
        user.save(update_fields=['password'])

        therapist_profile = request.user.profile
        therapist_name = therapist_profile.full_name or request.user.get_full_name() or request.user.username
        target_email = patient.email or user.email
        target_phone = patient.phone or getattr(user.profile, 'phone', '')
        send_via = patient.send_credentials_via or ['email']

        notification = notify_patient_account_access(
            patient_id=patient.id,
            user_id=user.id,
            patient_email=target_email,
            patient_phone=target_phone,
            patient_first_name=patient.first_name or user.first_name,
            username=user.username,
            temp_password=temp_password,
            therapist_name=therapist_name,
            send_via=send_via,
        )

        cache.set(cache_key, True, self.RESEND_COOLDOWN_SECONDS)

        channels = []
        if notification.email_sent:
            channels.append('email')
        if notification.telegram_sent:
            channels.append('Telegram')
        if notification.whatsapp_sent:
            channels.append('WhatsApp')
        channel_note = ', '.join(channels) if channels else 'ningún canal'

        return Response({
            'credentials': {
                'username': user.username,
                'password': temp_password,
            },
            'email_sent': notification.email_sent,
            'telegram_sent': notification.telegram_sent,
            'telegram_link': notification.telegram_link,
            'whatsapp_sent': notification.whatsapp_sent,
            'welcome_url': notification.welcome_url,
            'message': f'Credenciales reenviadas por {channel_note}',
        })


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
                qs = TherapistNote.objects.filter(therapist=self.request.user)
                patient_id = self.request.query_params.get('patient')
                ficha_id = self.request.query_params.get('ficha')
                if patient_id:
                    try:
                        qs = qs.filter(patient_id=int(patient_id))
                    except Exception:
                        pass
                if ficha_id:
                    try:
                        qs = qs.filter(ficha_id=int(ficha_id))
                    except Exception:
                        pass
                return qs
    
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

        from .therapist_workload import build_therapist_workload

        workload = build_therapist_workload(user)

        return Response({
            'total_patients': total_patients,
            'sessions_this_month': sessions_this_month,
            'fichas_this_month': fichas_this_month,
            'recent_sessions': recent_sessions_data,
            'subscription_status': user.profile.subscription_status,
            'subscription_end_date': user.profile.subscription_end_date,
            'workload': workload,
        })


class TherapistMetricsView(APIView):
    """
    Métricas agregadas de seguimiento para el terapeuta autenticado.
    READ-ONLY. Devuelve SOLO conteos/agregados — nunca nombres ni datos
    clínicos de pacientes individuales (sin PII en el cliente).
    """
    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request):
        from datetime import timedelta
        from django.db.models import Count
        from django.db.models.functions import TruncMonth

        user = request.user
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        twelve_months_ago = (now - timedelta(days=365)).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )

        # ── KPI cards ────────────────────────────────────────────────────────
        total_patients = Patient.objects.filter(therapist=user).count()

        active_patients_30d = (
            Session.objects.filter(therapist=user, session_date__gte=thirty_days_ago)
            .values('patient')
            .distinct()
            .count()
        )

        sessions_this_month = Session.objects.filter(
            therapist=user, session_date__gte=first_of_month
        ).count()

        fichas_this_month = Ficha.objects.filter(
            usuario=user, creado_en__gte=first_of_month
        ).count()

        new_patients_30d = Patient.objects.filter(
            therapist=user, created_at__gte=thirty_days_ago
        ).count()

        # ── Monthly series (last 12 months) ──────────────────────────────────
        sessions_by_month_qs = (
            Session.objects.filter(therapist=user, session_date__gte=twelve_months_ago)
            .annotate(month=TruncMonth('session_date'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        fichas_by_month_qs = (
            Ficha.objects.filter(usuario=user, creado_en__gte=twelve_months_ago)
            .annotate(month=TruncMonth('creado_en'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        # ── Breakdowns ────────────────────────────────────────────────────────
        status_counts = {
            row['therapy_status']: row['count']
            for row in Patient.objects.filter(therapist=user)
            .values('therapy_status')
            .annotate(count=Count('id'))
        }

        consent_with = Patient.objects.filter(
            therapist=user, consent_federation=True
        ).count()
        consent_without = Patient.objects.filter(
            therapist=user, consent_federation=False
        ).count()

        return Response({
            'kpi': {
                'total_patients': total_patients,
                'active_patients_30d': active_patients_30d,
                'sessions_this_month': sessions_this_month,
                'fichas_this_month': fichas_this_month,
                'new_patients_30d': new_patients_30d,
            },
            'sessions_by_month': [
                {'month': row['month'].strftime('%Y-%m'), 'count': row['count']}
                for row in sessions_by_month_qs
            ],
            'fichas_by_month': [
                {'month': row['month'].strftime('%Y-%m'), 'count': row['count']}
                for row in fichas_by_month_qs
            ],
            'therapy_status_breakdown': status_counts,
            'consent_breakdown': {
                'with_consent': consent_with,
                'without_consent': consent_without,
            },
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
            
            from decouple import config

            client_id = config('GOOGLE_CLIENT_ID', default='').strip()
            if not client_id:
                return Response(
                    {'error': 'google_auth_disabled', 'message': 'Inicio con Google no configurado'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            try:
                idinfo = id_token.verify_oauth2_token(token, requests.Request(), client_id)
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
                profile.save(update_fields=['google_id'])

            intent = (request.data.get('registration_intent') or '').strip().lower()
            if created and intent in ('therapist', 'personal'):
                profile.user_type = intent
                profile.save(update_fields=['user_type'])
            
            # Obtener o crear token de autenticación
            token, _ = Token.objects.get_or_create(user=user)
            
            from .dashboard_role import can_access_admin_workspace, dashboard_role_for_user

            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'full_name': profile.full_name,
                    'user_type': dashboard_role_for_user(user),
                    'role': dashboard_role_for_user(user),
                    'is_admin': can_access_admin_workspace(user),
                    'can_access_admin_workspace': can_access_admin_workspace(user),
                },
                'role': dashboard_role_for_user(user),
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


# ========================================
# RESOURCE ACCESS CORE
# ========================================

class MyResourcesView(APIView):
    """
    GET /api/resources/my/
    Return all resources accessible to current user.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        accesses = UserResourceAccess.objects.filter(user=user).select_related('resource', 'assigned_by')
        serializer = UserResourceAccessSerializer(accesses, many=True)
        return Response(serializer.data)


class AssignResourceToPatientView(APIView):
    """
    POST /api/patients/{id}/resources/assign
    Therapist assigns resource to patient.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, patient_id):
        user = request.user
        
        # Check therapist role
        try:
            profile = user.profile
            if profile.user_type != 'therapist':
                return Response(
                    {'error': 'Only therapists can assign resources'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check patient exists and is owned by therapist
        try:
            patient = Patient.objects.get(id=patient_id, therapist=user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found or not owned by you'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate request data
        serializer = AssignResourceSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        resource_id = serializer.validated_data['resource_id']
        
        # Get resource
        try:
            from .models import Resource
            resource = Resource.objects.get(id=resource_id)
        except Resource.DoesNotExist:
            return Response(
                {'error': 'Resource not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create or get access
        access, created = UserResourceAccess.objects.get_or_create(
            user=patient.user,
            resource=resource,
            defaults={
                'source': 'assigned_by_therapist',
                'assigned_by': user,
            }
        )
        
        if not created:
            return Response(
                {'message': 'Resource already assigned to patient'},
                status=status.HTTP_200_OK
            )
        
        return Response(
            UserResourceAccessSerializer(access).data,
            status=status.HTTP_201_CREATED
        )


class AcquireResourceView(APIView):
    """
    POST /api/resources/{id}/acquire
    Simulate self-purchase (no payments).
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, resource_id):
        user = request.user
        
        # Check user role (only patient and personal can self-purchase)
        try:
            profile = user.profile
            if profile.user_type not in ['patient', 'personal']:
                return Response(
                    {'error': 'Only patient and personal users can acquire resources'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get resource
        try:
            from .models import Resource
            resource = Resource.objects.get(id=resource_id)
        except Resource.DoesNotExist:
            return Response(
                {'error': 'Resource not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create or get access
        access, created = UserResourceAccess.objects.get_or_create(
            user=user,
            resource=resource,
            defaults={
                'source': 'self_purchased',
            }
        )
        
        if not created:
            return Response(
                {'message': 'Resource already acquired'},
                status=status.HTTP_200_OK
            )
        
        return Response(
            UserResourceAccessSerializer(access).data,
            status=status.HTTP_201_CREATED
        )


# ========================================
# GEOCODING VIEWS
# ========================================

class GeocodeCityView(APIView):
    """
    Geocode a city to get coordinates and timezone.
    Uses the centralized geocoding_utils.py module.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .geocoding_utils import geocode_city

        city = request.data.get('city', '').strip()
        country = request.data.get('country', '').strip() or None

        if not city:
            return Response(
                {'error': 'City is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
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
                return Response({
                    'success': False,
                    'error': 'City not found'
                }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response(
                {'error': f'Geocoding failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



