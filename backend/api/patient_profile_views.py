"""
Patient Profile Management Views (Therapist-only)

Endpoints for therapists to manage their patients' profiles
with full ownership validation and data integrity tracking.

CORE RULE: Si se actualiza birth_city o birth_country, SE RESUELVEN coordenadas automáticamente.
Perfiles con ciudad/país pero sin coordenadas son INVÁLIDOS.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from .models import Patient
from .birth_data_model import UserBirthData


class TherapistUpdatePatientProfileView(APIView):
    """
    Therapist updates patient profile (PATCH only).
    
    Endpoint: PATCH /api/therapist/patients/<patient_id>/profile/update/
    
    PERMISSIONS:
    - Requester MUST be therapist
    - Patient MUST be owned by therapist
    
    FUNCTIONALITY:
    - Updates essential birth data fields
    - RESOLVES coordinates automatically when city/country change
    - Marks profile_updated_by_therapist = True
    - Records last_therapist_update timestamp
    - Records updated_by (therapist user)
    
    CORE RULE:
    - If birth_city or birth_country is provided, coordinates MUST be resolved
    - Profile update FAILS if geo-resolution fails
    
    ARCHITECTURE:
    - Does NOT touch AnalysisRecord
    - Does NOT modify execution flows
    - Minimal, surgical update only
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk):
        user = request.user
        
        # Security: Verify therapist role
        if not hasattr(user, 'profile') or user.profile.user_type != 'therapist':
            return Response(
                {'error': 'Solo terapeutas pueden editar perfiles de pacientes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Security: Verify ownership
        try:
            patient = Patient.objects.get(id=pk, therapist=user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o no pertenece a este terapeuta'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get or create birth data (si el paciente tiene cuenta)
        birth_data = None
        if patient.user:
            birth_data, created = UserBirthData.objects.get_or_create(
                user=patient.user,
                defaults={
                    'full_name': patient.full_name or patient.user.username,
                    'birth_date': patient.birth_date or timezone.now().date(),
                }
            )
        
        # Update fields (only essential data)
        full_name = request.data.get('full_name')
        birth_date = request.data.get('birth_date')
        birth_city = request.data.get('birth_city')
        birth_country = request.data.get('birth_country')
        birth_time = request.data.get('birth_time')
        biological_sex = request.data.get('biologicalSex')
        gender_identity = request.data.get('genderIdentity')
        
        if full_name is not None:
            # Validate: must have at least 2 words
            words = full_name.strip().split()
            if len(words) < 2:
                return Response(
                    {'full_name': 'El nombre debe incluir al menos nombre y apellido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            patient.full_name = full_name.strip()
            # Actualizar first_name/last_name
            name_parts = full_name.strip().split()
            patient.first_name = name_parts[0]
            patient.last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            if birth_data:
                birth_data.full_name = full_name.strip()
        
        if birth_date is not None:
            patient.birth_date = birth_date
            if birth_data:
                birth_data.birth_date = birth_date
        
        if birth_time is not None:
            patient.birth_time = birth_time
            if birth_data:
                birth_data.birth_time = birth_time

        # Demographics (profile metadata)
        if biological_sex is not None:
            allowed = {c[0] for c in Patient._meta.get_field('biological_sex').choices}
            if biological_sex not in allowed:
                return Response(
                    {'biologicalSex': f'Valor inválido: {biological_sex}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            patient.biological_sex = biological_sex

        if gender_identity is not None:
            allowed = {c[0] for c in Patient._meta.get_field('gender_identity').choices}
            if gender_identity not in allowed:
                return Response(
                    {'genderIdentity': f'Valor inválido: {gender_identity}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            patient.gender_identity = gender_identity
        
        # === GEO-RESOLUTION CORE LOGIC ===
        new_city = birth_city
        new_country = birth_country
        city_changing = new_city is not None and new_city != (patient.birth_city or "")
        country_changing = new_country is not None and new_country != (patient.birth_country or "")
        location_changing = city_changing or country_changing

        # Also geocode if coordinates are missing but city/country already exist (backfill case)
        effective_city = new_city if new_city is not None else patient.birth_city
        effective_country = new_country if new_country is not None else patient.birth_country
        coords_missing = patient.birth_latitude is None or patient.birth_longitude is None
        needs_geocode = location_changing or (coords_missing and bool(effective_city or effective_country))

        if needs_geocode:
            final_city = new_city if new_city is not None else patient.birth_city
            final_country = new_country if new_country is not None else patient.birth_country
            
            if final_city or final_country:
                # Verificar si se proporcionaron coordenadas manualmente
                manual_lat = request.data.get('birth_latitude')
                manual_lng = request.data.get('birth_longitude')
                
                if manual_lat is None or manual_lng is None:
                    # Resolver coordenadas automáticamente
                    from .geocoding_utils import geocode_city
                    
                    geo_result = geocode_city(final_city, final_country)
                    
                    if geo_result:
                        patient.birth_city = geo_result.get('city', final_city)
                        patient.birth_country = geo_result.get('country', final_country)
                        patient.birth_latitude = geo_result['latitude']
                        patient.birth_longitude = geo_result['longitude']
                        patient.birth_timezone = geo_result['timezone']
                        
                        if birth_data:
                            birth_data.birth_city = patient.birth_city
                            birth_data.birth_country = patient.birth_country
                            birth_data.birth_latitude = patient.birth_latitude
                            birth_data.birth_longitude = patient.birth_longitude
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
                    patient.birth_city = final_city
                    patient.birth_country = final_country
                    patient.birth_latitude = float(manual_lat)
                    patient.birth_longitude = float(manual_lng)
                    if 'birth_timezone' in request.data:
                        patient.birth_timezone = request.data['birth_timezone']
                    
                    if birth_data:
                        birth_data.birth_city = patient.birth_city
                        birth_data.birth_country = patient.birth_country
                        birth_data.birth_latitude = patient.birth_latitude
                        birth_data.birth_longitude = patient.birth_longitude
            else:
                # Only clear coordinates when the user explicitly sent empty city/country
                if location_changing:
                    patient.birth_city = ""
                    patient.birth_country = ""
                    patient.birth_latitude = None
                    patient.birth_longitude = None
                    patient.birth_timezone = ""

                    if birth_data:
                        birth_data.birth_city = ""
                        birth_data.birth_country = ""
                        birth_data.birth_latitude = None
                        birth_data.birth_longitude = None
        
        # Guardar Patient
        patient.save()
        
        # Mark as updated by therapist y guardar birth_data
        if birth_data:
            birth_data.profile_updated_by_therapist = True
            birth_data.last_therapist_update = timezone.now()
            birth_data.updated_by = user
            birth_data.save()
        
        # También sincronizar a UserProfile del paciente si existe
        if patient.user and hasattr(patient.user, 'profile'):
            user_profile = patient.user.profile
            update_fields = []

            user_profile.birth_city = patient.birth_city
            user_profile.birth_country = patient.birth_country
            user_profile.birth_latitude = patient.birth_latitude
            user_profile.birth_longitude = patient.birth_longitude
            user_profile.birth_timezone = patient.birth_timezone or ''
            update_fields.extend(['birth_city', 'birth_country', 'birth_latitude', 'birth_longitude', 'birth_timezone'])

            if patient.birth_date:
                user_profile.birth_date = patient.birth_date
                update_fields.append('birth_date')
            # Always sync birth_time (including None, to clear stale values)
            user_profile.birth_time = patient.birth_time
            update_fields.append('birth_time')

            if biological_sex is not None:
                user_profile.biological_sex = patient.biological_sex
                update_fields.append('biological_sex')

            if gender_identity is not None:
                user_profile.gender_identity = patient.gender_identity
                update_fields.append('gender_identity')

            user_profile.save(update_fields=sorted(set(update_fields)))

        # === SYNC IdentityProfile (used by kabbalistic / astrological engines) ===
        if patient.user and patient.birth_date:
            from .models import IdentityProfile
            ip, _ = IdentityProfile.objects.get_or_create(
                user=patient.user,
                defaults={'birth_date': patient.birth_date},
            )
            ip.birth_date = patient.birth_date
            ip.birth_time = patient.birth_time
            ip.birth_city = patient.birth_city or ''
            ip.birth_country = patient.birth_country or ''
            ip.birth_latitude = patient.birth_latitude
            ip.birth_longitude = patient.birth_longitude
            ip.birth_timezone = patient.birth_timezone or ''
            ip.save(update_fields=[
                'birth_date', 'birth_time', 'birth_city', 'birth_country',
                'birth_latitude', 'birth_longitude', 'birth_timezone',
            ])

        # === INVALIDATE NatalChart so it gets recomputed on next request ===
        if patient.user:
            try:
                from astrology.models import NatalChart
                NatalChart.objects.filter(patient=patient).update(is_valid=False)
            except Exception:
                pass  # NatalChart may not exist yet — OK

        # Check if profile is now complete
        validation = {'is_complete': True, 'missing_fields': [], 'warnings': []}
        if birth_data:
            validation = birth_data.is_profile_complete()
        else:
            # Validar desde Patient directamente
            missing = []
            if not patient.full_name:
                missing.append('full_name')
            if not patient.birth_date:
                missing.append('birth_date')
            if not patient.birth_city:
                missing.append('birth_city')
            if not patient.birth_country:
                missing.append('birth_country')
            validation = {
                'is_complete': len(missing) == 0,
                'missing_fields': missing,
                'warnings': []
            }
        
        return Response({
            'message': 'Perfil del paciente actualizado correctamente',
            'profile_complete': validation['is_complete'],
            'missing_fields': validation['missing_fields'],
            'profile_updated_by_therapist': True,
            'last_therapist_update': birth_data.last_therapist_update.isoformat() if birth_data and birth_data.last_therapist_update else timezone.now().isoformat(),
            'biologicalSex': getattr(patient, 'biological_sex', None),
            'genderIdentity': getattr(patient, 'gender_identity', None),
            'coordinates': {
                'latitude': float(patient.birth_latitude) if patient.birth_latitude else None,
                'longitude': float(patient.birth_longitude) if patient.birth_longitude else None,
                'timezone': patient.birth_timezone,
            }
        }, status=status.HTTP_200_OK)


class PatientProfileValidationView(APIView):
    """
    Get patient profile validation status.
    
    Endpoint: GET /api/patients/<patient_id>/profile/validation/
    
    PERMISSIONS:
    - Requester MUST be therapist
    - Patient MUST be owned by therapist
    
    RETURNS:
    - is_complete: bool
    - missing_fields: list
    - warnings: list
    - profile_updated_by_therapist: bool
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        user = request.user
        
        # Security: Verify therapist role
        if not hasattr(user, 'profile') or user.profile.user_type != 'therapist':
            return Response(
                {'error': 'Solo terapeutas pueden validar perfiles de pacientes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Security: Verify ownership
        try:
            patient = Patient.objects.get(id=pk, therapist=user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o no pertenece a este terapeuta'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get birth data
        try:
            birth_data = UserBirthData.objects.get(user=patient.user)
            validation = birth_data.is_profile_complete()
            
            return Response({
                'is_complete': validation['is_complete'],
                'missing_fields': validation['missing_fields'],
                'warnings': validation['warnings'],
                'profile_updated_by_therapist': birth_data.profile_updated_by_therapist,
                'last_therapist_update': birth_data.last_therapist_update.isoformat() if birth_data.last_therapist_update else None,
            }, status=status.HTTP_200_OK)
        
        except UserBirthData.DoesNotExist:
            # No birth data = profile incomplete
            return Response({
                'is_complete': False,
                'missing_fields': ['full_name', 'birth_date', 'birth_city', 'birth_country'],
                'warnings': ['Perfil de nacimiento no creado'],
                'profile_updated_by_therapist': False,
                'last_therapist_update': None,
            }, status=status.HTTP_200_OK)


class ProfileUpdateAcknowledgeView(APIView):
    """
    Patient acknowledges therapist profile update.
    
    Endpoint: POST /api/profile/me/acknowledge-update/
    
    FUNCTIONALITY:
    - Resets profile_updated_by_therapist flag
    - Patient has seen the notice
    - Idempotent: safe to call multiple times
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        try:
            birth_data = UserBirthData.objects.get(user=user)
            
            # Reset flag
            birth_data.profile_updated_by_therapist = False
            birth_data.save(update_fields=['profile_updated_by_therapist'])
            
            return Response({
                'message': 'Actualización reconocida',
                'profile_updated_by_therapist': False,
            }, status=status.HTTP_200_OK)
        
        except UserBirthData.DoesNotExist:
            # No birth data = nothing to acknowledge
            return Response({
                'message': 'No hay datos de nacimiento',
                'profile_updated_by_therapist': False,
            }, status=status.HTTP_200_OK)
