import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.decorators import permission_classes
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .test_models import TestModule, UserTestAccess, TestResult
from datetime import datetime
from .test_serializers import (
    TestModuleSerializer, 
    TestResultSerializer, 
    TestExecutionSerializer
)
from api.utils import ClinicalScorer, TEST_LINKS
from .models import Patient, UserProfile
from .validators.test_execution import (
    validate_execution_mode,
    validate_role_for_execution,
    validate_clinical_context,
    validate_patient_ownership,
    validate_patient_self_context
)

logger = logging.getLogger(__name__)

def _resolve_active_patient_for_user(user):
    try:
        return Patient.objects.filter(user=user, is_active=True).order_by('-id').first()
    except Exception:
        return None

class PlaceholderPsychologicalTestExecutor:
    def __init__(self, *args, **kwargs):
        pass

    def execute(self):
        return {
            "status": "pending",
            "message": "Test asignado. Pendiente de implementación."
        }


# Placeholder executors for psychological tests marked "En desarrollo".
# Codes must match DB (see backend/initialize_tests.py).
EXECUTORS = {
    "phq-9": PlaceholderPsychologicalTestExecutor,
    "gad-7": PlaceholderPsychologicalTestExecutor,
    "bai": PlaceholderPsychologicalTestExecutor,
    "bdi-ii": PlaceholderPsychologicalTestExecutor,
    "insomnia-index": PlaceholderPsychologicalTestExecutor,
    "stai": PlaceholderPsychologicalTestExecutor,
    "scl-90": PlaceholderPsychologicalTestExecutor,
    "mcmi-iv": PlaceholderPsychologicalTestExecutor,
    "scid5": PlaceholderPsychologicalTestExecutor,
    "professional-pai": PlaceholderPsychologicalTestExecutor,
    "ptsd-check": PlaceholderPsychologicalTestExecutor,
    "ocd-screen": PlaceholderPsychologicalTestExecutor,
    "adhd-adult": PlaceholderPsychologicalTestExecutor,
    "substance-use": PlaceholderPsychologicalTestExecutor,
    "eating-disorder": PlaceholderPsychologicalTestExecutor,
}


class AvailableTestsView(APIView):
    """Lista todos los tests disponibles para el usuario actual"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        profile = user.profile
        
        # PHASE 3: Base catalog — exclude legacy/non-executable entries BEFORE role filters
        # Legacy identification relies on existing fields/text markers only.
        # Do NOT add new fields or change permissions logic.
        tests = (
            TestModule.objects
            .filter(is_active=True)
            # Exclude entries migrated from legacy backup
            .exclude(description__icontains="_legacy_app_backup")
            # Exclude non-executable markers present in description
            .exclude(description__icontains="No ejecutable")
        )
        
        # Check if user is admin (can view all tests)
        is_admin = (
            profile.is_admin or 
            user.is_staff or 
            user.is_superuser
        )
        
        # Robust therapist detection:
        # User is therapist if explicitly typed, is staff, or has patients assigned.
        is_therapist = (
            profile.user_type == 'therapist' or 
            user.is_staff or 
            Patient.objects.filter(therapist=user).exists()
        )
        
        if is_admin:
            # Admin can view all tests (no execution_mode filter)
            # Still filtered by is_active and is_available_for_user in serializer context
            pass
        elif is_therapist:
            # Therapist can see both patient_self and therapist_clinical tests
            from django.db.models import Q
            tests = tests.filter(
                Q(available_for_therapists=True) | Q(available_for_personal=True)
            )
        else:
            # patient / personal → ONLY patient_self tests
            tests = tests.filter(available_for_personal=True)

        # Filtering behavior differs by role:
        # - Therapists/Admin: return the full visible catalog. Access is enforced via
        #   `user_access.can_use` and the hardened validators on execution.
        #   This keeps the UI stable as new tests are added without needing code changes.
        # - Personal/Patient: only return tests the user can actually use, plus any
        #   tests granted via special access (assigned by therapist).
        if is_admin or is_therapist:
            filtered_tests = list(tests)
        else:
            special_access_codes = set(
                UserTestAccess.objects.filter(user=user, has_special_access=True)
                .values_list('test_module__code', flat=True)
            )
            filtered_tests = [
                test
                for test in tests
                if (test.is_available_for_user(user) or test.code in special_access_codes)
            ]
        
        serializer = TestModuleSerializer(
            filtered_tests, 
            many=True, 
            context={'request': request}
        )
        
        return Response({
            'tests': serializer.data,
            'user_type': profile.user_type,
            'subscription_plan': profile.subscription_plan or 'free',
            'membership_active': profile.membership_active
        })


class TestModuleDetailView(APIView):
    """Detalle de un módulo de test específico"""
    permission_classes = [IsAuthenticated]

    def get(self, request, code):
        test_module = get_object_or_404(TestModule, code=code, is_active=True)
        
        user = request.user
        profile = user.profile
        
        # PHASE 3: Validate access based on execution_mode and user role
        is_admin = (
            profile.is_admin or 
            user.is_staff or 
            user.is_superuser
        )
        
        if not is_admin:
            # For non-admin users, validate execution_mode access
            if profile.user_type == 'therapist':
                # Therapist can access both patient_self and therapist_clinical tests
                if not (test_module.available_for_therapists or test_module.available_for_personal):
                    return Response(
                        {
                            'error': 'No tienes acceso a este test',
                            'message': 'Este test no está disponible para terapeutas'
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                # patient / personal → ONLY patient_self tests
                if not test_module.available_for_personal:
                    return Response(
                        {
                            'error': 'No tienes acceso a este test',
                            'message': 'Este test solo está disponible para ejecución clínica (therapist_clinical)'
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )

        # Verify subscription/access level, but allow therapist-assigned (special access).
        has_special_access = UserTestAccess.objects.filter(
            user=user,
            test_module=test_module,
            has_special_access=True
        ).exists()
        if not (test_module.is_available_for_user(user) or has_special_access):
            return Response(
                {
                    'error': 'No tienes acceso a este test',
                    'required_level': test_module.required_access_level,
                    'your_level': profile.subscription_plan or 'free'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TestModuleSerializer(test_module, context={'request': request})
        return Response(serializer.data)


class ExecuteTestView(APIView):
    """Ejecuta un test y guarda el resultado"""
    permission_classes = [IsAuthenticated]

    def _infer_execution_mode(self, test_module, request_context):
        """
        Infiere el modo de ejecución basándose en los campos del test_module.
        H1: Execution Mode Validation helper
        """
        # Si solo está disponible para terapeutas, es therapist_clinical
        if test_module.available_for_therapists and not test_module.available_for_personal:
            return 'therapist_clinical'
        # Si solo está disponible para personal, es patient_self
        elif test_module.available_for_personal and not test_module.available_for_therapists:
            return 'patient_self'
        # Si está disponible para ambos, inferir del contexto
        elif test_module.available_for_therapists and test_module.available_for_personal:
            # Si hay patient_id en el request, es therapist_clinical
            if request_context.get('patient_id'):
                return 'therapist_clinical'
            else:
                return 'patient_self'
        # Por defecto, basarse en el tipo de usuario actual
        else:
            # Fallback: si el usuario es terapeuta y hay patient_id, es therapist_clinical
            if request_context.get('user_type') == 'therapist' and request_context.get('patient_id'):
                return 'therapist_clinical'
            return 'patient_self'

    # Legacy validation methods removed - now using centralized validators from api.validators.test_execution
    # This improves code reuse, testability, and ensures consistent validation across all endpoints

    def post(self, request):
        serializer = TestExecutionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        test_code = data['test_module_code']
        input_data = data['input_data']
        patient_id = data.get('patient_id')

        # SCDF is a therapist workspace tool and must not run through /api/tests/execute/.
        if str(test_code).strip().lower() == 'scdf':
            return Response(
                {
                    'error': 'SCDF no se ejecuta vía tests/execute; usar workspace profesional.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile = request.user.profile
        birth_data = None
        try:
            birth_data = request.user.birth_data
        except Exception:
            birth_data = None

        # Obtener el test_module
        try:
            test_module = TestModule.objects.get(code=test_code, is_active=True)
        except TestModule.DoesNotExist:
            return Response({
                'error': f'Test "{test_code}" no encontrado o no está activo',
                'note': 'Verifica que el test esté registrado en la base de datos ejecutando el script initialize_tests.py'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Infer execution mode
        request_context = {
            'patient_id': patient_id,
            'user_type': profile.user_type
        }
        execution_mode = self._infer_execution_mode(test_module, request_context)

        # Pilot guard: legacy-migrated psychological tests must not execute via the generic endpoint.
        if test_code in {"phq-9", "gad-7", "bai"}:
            return Response(
                {
                    'error': 'Ejecuci¢n no disponible',
                    'message': 'Este test est  en piloto y no se ejecuta por /tests/execute/.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


        # Safety rails (defense-in-depth): therapists never run patient_self; and
        # therapist_clinical requires patient_id.
        # These are also enforced by centralized validators, but keeping them here
        # makes behavior deterministic even if inference/validation changes.
        if profile.user_type == 'therapist':
            if execution_mode == 'patient_self':
                return Response(
                    {
                        'error': 'No autorizado para ejecución personal',
                        'message': 'Los terapeutas no pueden ejecutar tests en modo patient_self',
                        'execution_mode': execution_mode,
                        'user_role': 'therapist'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            if execution_mode == 'therapist_clinical' and not patient_id:
                return Response(
                    {
                        'error': 'patient_id requerido',
                        'message': 'patient_id es obligatorio para ejecución en modo therapist_clinical',
                        'execution_mode': execution_mode
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # PHASE 2: Apply hardened validators (using centralized validators)
        try:
            # 1. Validate execution mode compatibility with test_module
            validate_execution_mode(test_module, execution_mode)
            
            # 2. Validate role for execution mode
            validate_role_for_execution(request.user, execution_mode)
            
            # 3. Validate context (patient_id requirements based on mode)
            patient = None
            if execution_mode == 'therapist_clinical':
                # Validate patient_id is provided and valid
                validate_clinical_context(request.user, patient_id)
                # Validate ownership and prevent self-evaluation
                patient = validate_patient_ownership(request.user, patient_id)
            elif execution_mode == 'patient_self':
                # Validate patient_id is NOT provided
                validate_patient_self_context(patient_id)
        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            return Response(e.detail, status=status.HTTP_403_FORBIDDEN)

        # Crear/obtener acceso del usuario ANTES de validar disponibilidad.
        # Esto permite que asignaciones (has_special_access=True) habiliten el uso
        # incluso si el plan/membresía no alcanza el nivel requerido.
        user_access, created = UserTestAccess.objects.get_or_create(user=request.user, test_module=test_module)

        # Gate único: can_use_test() valida is_active, rol/disponibilidad, licencia y límites.
        if not user_access.can_use_test():
            # Distinguimos límite mensual de acceso denegado de forma simple.
            if test_module.uses_per_month is not None and user_access.current_month_uses >= test_module.uses_per_month:
                return Response(
                    {
                        'error': 'Has alcanzado el límite mensual de usos para este test',
                        'current_uses': user_access.current_month_uses,
                        'limit': test_module.uses_per_month
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            return Response({'error': 'No tienes acceso a este test'}, status=status.HTTP_403_FORBIDDEN)

        # Completar input_data con información del perfil si es necesario
        if execution_mode == 'patient_self':
            if not input_data.get('nombre'):
                if profile.full_name:
                    input_data['nombre'] = profile.full_name
                elif birth_data and birth_data.full_name:
                    input_data['nombre'] = birth_data.full_name
            if not input_data.get('fecha_nacimiento'):
                if profile.birth_date:
                    input_data['fecha_nacimiento'] = str(profile.birth_date)
                elif birth_data and birth_data.birth_date:
                    input_data['fecha_nacimiento'] = str(birth_data.birth_date)
        
        # Manejar casos especiales de compatibilidad
        if execution_mode == 'patient_self' and test_module.test_type == 'compatibility':
            if not input_data.get('persona1_nombre'):
                input_data['persona1_nombre'] = input_data.get('nombre') or profile.full_name or (birth_data.full_name if birth_data else '')
            if not input_data.get('persona1_fecha_nacimiento'):
                input_data['persona1_fecha_nacimiento'] = input_data.get('fecha_nacimiento') or (str(profile.birth_date) if profile.birth_date else (str(birth_data.birth_date) if birth_data else None))

        # Procesar el test
        result_data = self._process_test(test_module, input_data)
        user_access.record_use()

        test_result = None
        if data.get('save_result', True):
            patient_for_result = patient
            if execution_mode == 'patient_self' and getattr(profile, 'user_type', None) == 'patient':
                try:
                    patient_qs = Patient.objects.filter(user=request.user, is_active=True)
                    if patient_qs.count() == 1:
                        patient_for_result = patient_qs.first()
                except Exception:
                    patient_for_result = patient

            # Preparar datos del cliente
            if execution_mode == 'patient_self':
                client_name = profile.full_name or (birth_data.full_name if birth_data else '')
                client_birth_date = profile.birth_date or (birth_data.birth_date if birth_data else None)
            else:  # therapist_clinical
                client_name = data.get('client_name', '')
                client_birth_date = data.get('client_birth_date')
                # Usar datos del paciente si están disponibles
                if patient:
                    if not client_name:
                        client_name = patient.full_name
                    if not client_birth_date:
                        client_birth_date = patient.birth_date
            
            # H4: Audit Metadata - almacenar en details JSONField
            # Preparar metadata de auditoría
            audit_metadata = {
                'executed_by_user_id': request.user.id,
                'executed_by_role': profile.user_type,
                'execution_mode': execution_mode,
                'patient_id': patient_for_result.id if patient_for_result else None,
                'execution_timestamp': datetime.now().isoformat()
            }
            
            # Inicializar details_dict vacío (details es un campo JSONField independiente de result_data)
            # Si hay datos previos en details que queramos preservar, se pueden añadir aquí
            details_dict = {
                'audit': audit_metadata
            }

            clinician_notes = ''
            try:
                raw_notes = input_data.get('clinician_notes')
                if isinstance(raw_notes, str):
                    clinician_notes = raw_notes.strip()
            except Exception:
                clinician_notes = ''
            
            # Crear TestResult con metadata de auditoría
            test_result = TestResult.objects.create(
                user=request.user,
                test_module=test_module,
                input_data=input_data,
                result_data=result_data,
                client_name=client_name,
                client_birth_date=client_birth_date,
                patient=patient_for_result,
                details=details_dict,  # H4: Audit metadata stored in details JSONField
                notes=clinician_notes
            )

        response_data = {'success': True, 'result': result_data, 'uses_remaining': None}
        if test_module.uses_per_month:
            response_data['uses_remaining'] = (test_module.uses_per_month - user_access.current_month_uses)
        if test_result:
            response_data['result_id'] = test_result.id
        return Response(response_data)

    def _process_test(self, test_module, input_data):
        """Procesa el test según su tipo"""
        # Lazy import compute functions to avoid import errors when optional SDKs aren't installed
        compute_bdi = compute_bai = compute_scl90 = compute_stai = compute_mcmi4 = compute_scid5 = None
        compute_pai = None
        compute_wellness_assessment = None
        compute_insomnia_wellness = None
        compute_nutrition_wellness = None
        compute_stress_wellness = None
        compute_stress_regulation_wellness = None
        compute_anxiety_state_trait = None
        compute_screening_general = None
        compute_stress_screening = None
        compute_past_lives = None
        compute_scdf = None
        try:
            # optional internal modules; if missing, we'll continue with None placeholders
            from .pai import compute_pai
        except Exception:
            compute_pai = None
        try:
            from .diagnostics import (
            compute_bdi,
            compute_bai,
            compute_scl90,
            compute_stai,
            compute_mcmi4,
            compute_scid5,
            compute_wellness_assessment,
            compute_insomnia_wellness,
            compute_nutrition_wellness,
            compute_stress_wellness,
            compute_stress_regulation_wellness,
            compute_anxiety_state_trait,
            compute_screening_general,
            compute_stress_screening,
            compute_past_lives,
            compute_scdf,
            )
        except Exception:
            compute_bdi = compute_bai = compute_scl90 = compute_stai = compute_mcmi4 = compute_scid5 = None
            compute_wellness_assessment = None
            compute_insomnia_wellness = None
            compute_nutrition_wellness = None
            compute_stress_wellness = None
            compute_stress_regulation_wellness = None
            compute_screening_general = None
            compute_stress_screening = None
            compute_past_lives = None
            compute_scdf = None

        test_type = test_module.test_type
        try:
            # Guardrail: "insomnia" is a Wellness test and must never be routed to symbolic engines
            # even if the DB test_type is misconfigured (e.g., "health").
            if test_module.code == 'insomnia':
                responses = input_data.get('responses', {})
                if compute_insomnia_wellness:
                    return compute_insomnia_wellness({'fecha': input_data.get('fecha'), 'responses': responses})
                logger.error('compute_insomnia_wellness not available; refusing symbolic fallback for insomnia')
                raise ValueError('Insomnia wellness engine not available')

            # Guardrail: "nutrition" is a Wellness test and must never be routed to symbolic engines.
            if test_module.code == 'nutrition':
                responses = input_data.get('responses', {})
                if compute_nutrition_wellness:
                    return compute_nutrition_wellness({'fecha': input_data.get('fecha'), 'responses': responses})
                logger.error('compute_nutrition_wellness not available; refusing symbolic fallback for nutrition')
                raise ValueError('Nutrition wellness engine not available')

            # Guardrail: "stress" is a Wellness test and must never be routed to symbolic engines.
            if test_module.code == 'stress':
                responses = input_data.get('responses', {})
                if compute_stress_wellness:
                    return compute_stress_wellness({'fecha': input_data.get('fecha'), 'responses': responses})
                logger.error('compute_stress_wellness not available; refusing symbolic fallback for stress')
                raise ValueError('Stress wellness engine not available')

            # Guardrail: "stress-regulation" is a Wellness test and must never be routed to symbolic engines.
            if test_module.code == 'stress-regulation':
                responses = input_data.get('responses', {})
                if compute_stress_regulation_wellness:
                    return compute_stress_regulation_wellness({'fecha': input_data.get('fecha'), 'responses': responses})
                logger.error('compute_stress_regulation_wellness not available; refusing symbolic fallback for stress-regulation')
                raise ValueError('Stress-regulation wellness engine not available')

            if test_module.code == 'anxiety-state-trait':
                responses = input_data.get('responses', {})
                if compute_anxiety_state_trait:
                    return compute_anxiety_state_trait({'fecha': input_data.get('fecha'), 'responses': responses})
                logger.error('compute_anxiety_state_trait not available; refusing symbolic fallback for anxiety-state-trait')
                raise ValueError('Anxiety-state-trait wellness engine not available')

            if test_type == 'bdi' or test_module.code == 'bdi-ii':
                responses = input_data.get('responses', {})
                if compute_bdi:
                    result = compute_bdi({'nombre': input_data.get('nombre'), 'edad': input_data.get('edad'), 'fecha': input_data.get('fecha'), 'terapeuta': input_data.get('terapeuta'), 'responses': responses})
                else:
                    result = {'note': 'compute_bdi not available; missing module'}
                return {'test_type': 'bdi', 'result': result, 'timestamp': str(datetime.now())}
            if test_module.code == 'scl90':
                responses = input_data.get('responses', {})
                logger.warning('SCL-90 wellness execution requested before implementation')
                if compute_scl90_wellness:
                    return compute_scl90_wellness({'nombre': input_data.get('nombre'), 'edad': input_data.get('edad'), 'fecha': input_data.get('fecha'), 'terapeuta': input_data.get('terapeuta'), 'responses': responses})
                raise NotImplementedError('SCL-90 wellness execution pending')
            if test_type == 'scl90' or test_module.code == 'scl-90':
                responses = input_data.get('responses', {})
                if compute_scl90:
                    result = compute_scl90({'nombre': input_data.get('nombre'), 'edad': input_data.get('edad'), 'fecha': input_data.get('fecha'), 'terapeuta': input_data.get('terapeuta'), 'responses': responses})
                else:
                    result = {'note': 'compute_scl90 not available; missing module'}
                return {'test_type': 'scl90', 'result': result, 'timestamp': str(datetime.now())}
            if test_type == 'stai' or test_module.code == 'stai':
                responses = input_data.get('responses', {})
                if compute_stai:
                    result = compute_stai({'nombre': input_data.get('nombre'), 'edad': input_data.get('edad'), 'fecha': input_data.get('fecha'), 'terapeuta': input_data.get('terapeuta'), 'responses': responses})
                else:
                    result = {'note': 'compute_stai not available; missing module'}
                return {'test_type': 'stai', 'result': result, 'timestamp': str(datetime.now())}
            if test_type == 'mcmi-iv' or test_module.code == 'mcmi-iv':
                responses = input_data.get('responses', {})
                if compute_mcmi4:
                    result = compute_mcmi4({'nombre': input_data.get('nombre'), 'edad': input_data.get('edad'), 'fecha': input_data.get('fecha'), 'terapeuta': input_data.get('terapeuta'), 'responses': responses})
                else:
                    result = {'note': 'compute_mcmi4 not available; missing module'}
                return {'test_type': 'mcmi-iv', 'result': result, 'timestamp': str(datetime.now())}
            if test_type == 'scid5' or test_module.code == 'scid5':
                responses = input_data.get('responses', {})
                if compute_scid5:
                    result = compute_scid5({'nombre': input_data.get('nombre'), 'edad': input_data.get('edad'), 'fecha': input_data.get('fecha'), 'terapeuta': input_data.get('terapeuta'), 'responses': responses})
                else:
                    result = {'note': 'compute_scid5 not available; missing module'}
                return {'test_type': 'scid5', 'result': result, 'timestamp': str(datetime.now())}
            if test_type == 'pai' or test_module.code == 'professional-pai':
                responses = input_data.get('responses', {})
                nombre = input_data.get('nombre', '')
                edad = input_data.get('edad')
                fecha = input_data.get('fecha') or input_data.get('fecha_evaluacion')
                terapeuta = input_data.get('terapeuta')
                if compute_pai:
                    result = compute_pai({'nombre': nombre, 'edad': edad, 'fecha': fecha, 'terapeuta': terapeuta, 'responses': responses})
                else:
                    result = {'note': 'compute_pai not available; missing module'}
                return {'test_type': 'pai', 'result': result, 'timestamp': str(datetime.now())}
            if test_type == 'bai' or test_module.code == 'bai':
                responses = input_data.get('responses', {})
                if compute_bai:
                    result = compute_bai({'nombre': input_data.get('nombre'), 'edad': input_data.get('edad'), 'fecha': input_data.get('fecha'), 'terapeuta': input_data.get('terapeuta'), 'responses': responses})
                else:
                    result = {'note': 'compute_bai not available; missing module'}
                return {'test_type': 'bai', 'result': result, 'timestamp': str(datetime.now())}

            # In-house holistic screenings (non-licensed)
            if test_module.code == 'wellness' or test_type == 'holistic_screening':
                # Route by code to avoid collisions with other holistic_screening entries
                if test_module.code == 'wellness':
                    responses = input_data.get('responses', {})
                    if compute_wellness_assessment:
                        result = compute_wellness_assessment({'fecha': input_data.get('fecha'), 'responses': responses})
                    else:
                        result = {'note': 'compute_wellness_assessment not available; missing module'}
                    return {'test_type': 'holistic_screening', 'result': result, 'timestamp': str(datetime.now())}

                if test_module.code == 'screening-general':
                    responses = input_data.get('responses', {})
                    if compute_screening_general:
                        result = compute_screening_general({'fecha': input_data.get('fecha'), 'responses': responses})
                    else:
                        result = {'note': 'compute_screening_general not available; missing module'}
                    return {'test_type': 'holistic_screening', 'result': result, 'timestamp': str(datetime.now())}

                if test_module.code == 'past-lives':
                    responses = input_data.get('responses', {})
                    if compute_past_lives:
                        # Return direct schema (not wrapped) to match required result_data contract.
                        return compute_past_lives({
                            'fecha': input_data.get('fecha'),
                            'responses': responses,
                            'open_reflection': input_data.get('open_reflection'),
                        })
                    return {
                        'symbolic_resonance_level': 'medium',
                        'dominant_themes': [],
                        'reflection_axes': [],
                        'summary_text': 'compute_past_lives not available; missing module',
                    }
            # Astrología Cabalística (se calcula en el frontend con astronomy-engine)
            if test_type == 'astrology' or test_module.code == 'cabalistic-astrology':
                nombre = input_data.get('nombre') or input_data.get('full_name') or ''
                fecha_str = input_data.get('fecha_nacimiento') or input_data.get('birth_date') or ''
                hora = input_data.get('hora', '12:00')
                latitud = input_data.get('latitud', input_data.get('lat', 40.4168))
                longitud = input_data.get('longitud', input_data.get('lng', -3.7038))
                
                return {
                    'test_type': 'astrology',
                    'processed': True,
                    'timestamp': str(datetime.now()),
                    'result': {
                        'nombre': nombre,
                        'fecha_nacimiento': fecha_str,
                        'hora': hora,
                        'latitud': latitud,
                        'longitud': longitud,
                        'note': 'El cálculo astrológico se realiza en el frontend usando astronomy-engine'
                    },
                    'message': 'Test de Astrología Cabalística listo para cálculo local'
                }
            
            # Análisis cabalístico básico / numerología completa / abundancia financiera
            if test_type in ['basic', 'numerology', 'financial', 'career', 'spiritual', 'health', 'family', 'purpose', 'past_life']:
                from cabala_py.integracion_arbol import generar_mapa_cabalista_completo

                nombre = input_data.get('nombre') or input_data.get('full_name') or ''
                fecha_str = input_data.get('fecha_nacimiento') or input_data.get('birth_date') or ''
                try:
                    # Esperamos YYYY-MM-DD
                    fecha = datetime.fromisoformat(str(fecha_str)).date()
                    dia, mes, anio = fecha.day, fecha.month, fecha.year
                except Exception:
                    # Si falla el parseo, devolvemos nota y abortamos
                    return {
                        'test_type': test_type,
                        'processed': False,
                        'timestamp': str(datetime.now()),
                        'message': 'Fecha de nacimiento inválida o faltante',
                        'note': 'Provee fecha_nacimiento en formato YYYY-MM-DD'
                    }

                try:
                    mapa = generar_mapa_cabalista_completo(nombre, dia, mes, anio)
                    
                    # Para tests específicos, agregar análisis adicional según el tipo
                    if test_type == 'financial':
                        # Agregar análisis específico de abundancia financiera
                        # Esto se puede expandir más adelante con cálculos específicos
                        mapa['analisis_financiero'] = {
                            'ciclos_financieros': {
                                'año_personal': mapa.get('numeros_principales', {}).get('destino', {}).get('valor', 'N/A'),
                                'ciclo_vital': mapa.get('numeros_principales', {}).get('esencia', {}).get('valor', 'N/A'),
                            },
                            'numeros_prosperidad': {
                                'numero_abundancia': mapa.get('numeros_principales', {}).get('expresion', {}).get('valor', 'N/A'),
                                'numero_riqueza': mapa.get('numeros_principales', {}).get('destino', {}).get('valor', 'N/A'),
                            },
                            'recomendaciones': mapa.get('recomendaciones', [])
                        }
                    
                except Exception as calc_error:
                    return {
                        'test_type': test_type,
                        'processed': False,
                        'timestamp': str(datetime.now()),
                        'message': 'Error calculando el análisis cabalístico',
                        'note': str(calc_error)
                    }

                return {
                    'test_type': test_type,
                    'processed': True,
                    'timestamp': str(datetime.now()),
                    'result': mapa,
                    'message': f'Test {test_module.name} calculado correctamente'
                }
            # If no specific handler matched, return a default processed message
            return {'test_type': test_type, 'processed': True, 'timestamp': str(datetime.now()), 'message': f'Test {test_module.name} procesado correctamente', 'note': 'Implementación avanzada en desarrollo'}
        except Exception as e:
            return {'error': str(e), 'test_type': test_type, 'timestamp': str(datetime.now())}


class TestResultsView(APIView):
    """Lista y gestión de resultados de tests guardados"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Lista resultados accesibles según el rol del usuario"""
        user = request.user
        profile = user.profile
        
        # PHASE 4: Filter results based on user role and ownership
        is_admin = (
            profile.is_admin or 
            user.is_staff or 
            user.is_superuser
        )

        # Optional: filter by patient_id (used by therapist catalog UI)
        patient_id = request.query_params.get('patient_id')
        patient_id_int = None
        if patient_id is not None and str(patient_id).strip() != "":
            try:
                patient_id_int = int(str(patient_id).strip())
            except Exception:
                patient_id_int = None

        if patient_id_int is not None:
            # Admin can filter by any patient_id; therapist must own the patient.
            if is_admin:
                results = TestResult.objects.filter(is_archived=False, patient_id=patient_id_int)
            elif profile.user_type == 'therapist':
                try:
                    _ = validate_patient_ownership(user, patient_id_int)
                except PermissionDenied as e:
                    return Response(e.detail, status=status.HTTP_403_FORBIDDEN)
                results = TestResult.objects.filter(
                    is_archived=False,
                    patient_id=patient_id_int,
                ).select_related('test_module', 'user')
            else:
                # patient/personal: only allow filtering to their own linked Patient
                try:
                    own_patient = Patient.objects.get(user=user)
                except Exception:
                    own_patient = None
                if not own_patient or own_patient.id != patient_id_int:
                    return Response({"detail": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)
                results = TestResult.objects.filter(is_archived=False, user=user).select_related('test_module', 'user')
        else:
        
            if is_admin:
                # Admin can view all results (read-only access to all)
                results = TestResult.objects.filter(is_archived=False)
            elif profile.user_type == 'therapist':
                # Therapist can view own results + results of their patients
                from django.db.models import Q
                results = TestResult.objects.filter(
                    Q(is_archived=False) & (
                        Q(user=user) |  # Own result
                        Q(patient__therapist=user)  # Results of their patient
                    )
                )
            else:
                # patient / personal → only own results
                results = TestResult.objects.filter(
                    user=user,
                    is_archived=False
                )
        
        # Filtros opcionales
        test_code = request.query_params.get('test_code')
        if test_code:
            results = results.filter(test_module__code=test_code)
        
        favorites_only = request.query_params.get('favorites')
        if favorites_only == 'true':
            results = results.filter(is_favorite=True)
        
        serializer = TestResultSerializer(results, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        """Crea un nuevo resultado manualmente"""
        serializer = TestResultSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TestResultDetailView(APIView):
    """Detalle, actualización y eliminación de un resultado"""
    permission_classes = [IsAuthenticated]
    
    def _can_access_result(self, user, result):
        """
        PHASE 4: Check if user can access a specific result based on role and ownership
        
        Returns:
            bool: True if user can access the result
        """
        try:
            profile = user.profile
        except (AttributeError, UserProfile.DoesNotExist):
            return False
        
        is_admin = (
            profile.is_admin or 
            user.is_staff or 
            user.is_superuser
        )
        
        if is_admin:
            # Admin can view all results (read-only)
            return True
        elif profile.user_type == 'therapist':
            # Therapist can view own results + results of their patients
            return (
                result.user == user or  # Own result
                (result.patient and result.patient.therapist == user)  # Result of their patient
            )
        else:
            # patient / personal → only own results
            return result.user == user
    
    def get(self, request, pk):
        """Obtiene un resultado específico"""
        result = get_object_or_404(TestResult, pk=pk)
        user = request.user

        # Resolve profile and admin flag
        try:
            profile = user.profile
        except (AttributeError, UserProfile.DoesNotExist):
            profile = None

        is_admin = bool(profile and (profile.is_admin or user.is_staff or user.is_superuser))

        # Permission rules: allow if requester is
        # - admin
        # - the owning user who ran the test (result.user)
        # - the patient linked to the result (patient.user)
        # - the therapist assigned to the patient (patient.therapist)
        allowed = False
        if is_admin:
            allowed = True
        elif result.user and result.user == user:
            allowed = True
        elif result.patient is not None:
            try:
                if result.patient.user and result.patient.user == user:
                    allowed = True
                elif result.patient.therapist and result.patient.therapist == user:
                    allowed = True
            except Exception:
                # fallthrough
                allowed = allowed

        if not allowed:
            return Response({"detail": "No tienes permiso para ver este resultado"}, status=status.HTTP_403_FORBIDDEN)

        # Tolerant serialization: if the result doesn't contain clinical fields (score/clinical_diagnosis)
        # return the payload as-is so symbolic tests don't cause errors in the therapist workspace.
        try:
            has_clinical = (getattr(result, 'score', None) is not None) or bool(getattr(result, 'clinical_diagnosis', None))
        except Exception:
            has_clinical = False

        if not has_clinical:
            tm = getattr(result, 'test_module', None)
            return Response({
                'id': result.id,
                'test_module': {
                    'id': getattr(tm, 'id', None) if tm else None,
                    'code': getattr(tm, 'code', None) if tm else getattr(result, 'test_id', None),
                    'name': getattr(tm, 'name', None) if tm else None,
                },
                'created_at': getattr(result, 'created_at', None),
                'result_data': result.result_data or {},
                'details': result.details or {},
            })

        serializer = TestResultSerializer(result)
        return Response(serializer.data)
    
    def patch(self, request, pk):
        """Actualiza un resultado (notas, favorito, etc.)"""
        result = get_object_or_404(TestResult, pk=pk)
        
        # PHASE 4: Only owner can modify (not patients of therapist, not admin)
        # Admin is read-only for results
        try:
            profile = request.user.profile
            is_admin = (
                profile.is_admin or 
                request.user.is_staff or 
                request.user.is_superuser
            )
            if is_admin:
                return Response(
                    {
                        'error': 'No autorizado',
                        'message': 'Los administradores tienen acceso de solo lectura a los resultados'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
        except (AttributeError, UserProfile.DoesNotExist):
            return Response(
                {'error': 'Perfil de usuario no encontrado'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only the user who created the result can modify it
        if result.user != request.user:
            return Response(
                {
                    'error': 'No autorizado',
                    'message': 'Solo el usuario que creó este resultado puede modificarlo'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = TestResultSerializer(
            result, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Elimina (archiva) un resultado"""
        result = get_object_or_404(TestResult, pk=pk)
        
        # PHASE 4: Only owner can delete (not patients of therapist, not admin)
        # Admin is read-only for results
        try:
            profile = request.user.profile
            is_admin = (
                profile.is_admin or 
                request.user.is_staff or 
                request.user.is_superuser
            )
            if is_admin:
                return Response(
                    {
                        'error': 'No autorizado',
                        'message': 'Los administradores tienen acceso de solo lectura a los resultados'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
        except (AttributeError, UserProfile.DoesNotExist):
            return Response(
                {'error': 'Perfil de usuario no encontrado'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Allow deletion by the user who created the result, or by the
        # therapist assigned to the patient. Admins remain read-only.
        if result.user != request.user:
            try:
                requester_profile = request.user.profile
                # If requester is a therapist and owns the patient, allow
                if getattr(requester_profile, 'user_type', None) == 'therapist' and getattr(result, 'patient', None) and getattr(result.patient, 'therapist', None) == request.user:
                    # permitted: therapist assigned to the patient
                    pass
                else:
                    return Response(
                        {
                            'error': 'No autorizado',
                            'message': 'Solo el usuario que creó este resultado o el terapeuta asignado pueden eliminarlo'
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )
            except (AttributeError, UserProfile.DoesNotExist):
                return Response(
                    {
                        'error': 'Perfil de usuario no encontrado',
                        'message': 'No se pudo verificar permisos del usuario'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Archivar en lugar de eliminar
        result.is_archived = True
        result.save()
        
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserTestStatsView(APIView):
    """Estadísticas de uso de tests del usuario"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Obtener todos los accesos del usuario
        accesses = UserTestAccess.objects.filter(user=user).select_related('test_module')
        
        # Contar tests disponibles (que el usuario puede usar)
        available_count = 0
        for access in accesses:
            if access.can_use_test() or access.has_special_access:
                available_count += 1
        
        # Contar resultados guardados
        total_results = TestResult.objects.filter(user=user).count()
        
        # Contar usos este mes
        tests_this_month = sum(access.current_month_uses for access in accesses)
        
        stats = {
            'total_tests': TestModule.objects.filter(is_active=True).count(),
            'available_tests': available_count,
            'total_results': total_results,
            'tests_this_month': tests_this_month,
            'total_uses': sum(access.uses_count for access in accesses),
            'tests': []
        }
        
        for access in accesses:
            if access.uses_count > 0:
                stats['tests'].append({
                    'code': access.test_module.code,
                    'name': access.test_module.name,
                    'uses_count': access.uses_count,
                    'current_month_uses': access.current_month_uses,
                    'last_used': access.last_used,
                    'can_use_now': access.can_use_test()
                })
        
        return Response(stats)


class PatientPreviousTestsView(APIView):
    """Busca tests previos de un paciente basándose en nombre y fecha de nacimiento"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        PHASE 5: Busca tests previos de un paciente.
        Solo terapeutas pueden buscar tests de sus pacientes.
        """
        user = request.user
        profile = user.profile
        
        # PHASE 5: Determine requester role: admin / therapist / patient
        is_admin = (
            profile.is_admin or 
            user.is_staff or 
            user.is_superuser
        )

        # Allow access to admins, therapists, and the patient themself.
        # Other roles are forbidden.
        if not is_admin and profile.user_type not in ('therapist', 'patient'):
            return Response(
                {
                    'error': 'No autorizado',
                    'message': 'Solo terapeutas o el propio paciente pueden buscar tests de pacientes'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        patient_id = request.query_params.get('patient_id')
        patient_name = request.query_params.get('patient_name')
        patient_birth_date = request.query_params.get('patient_birth_date')

        # Normalize patient_id early (query params are strings)
        patient_id_int = None
        if patient_id is not None:
            try:
                patient_id_int = int(str(patient_id).strip())
            except Exception:
                patient_id_int = None
        
        # PHASE 5: Resolve patient context according to requester role
        if not is_admin:
            if profile.user_type == 'therapist':
                # Therapist must provide patient_id and must own the patient
                if not patient_id_int:
                    return Response(
                        {
                            'error': 'patient_id requerido',
                            'message': 'Se requiere patient_id para buscar tests de pacientes'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                try:
                    patient = validate_patient_ownership(user, patient_id_int)
                    patient_name = patient.full_name
                    patient_birth_date = str(patient.birth_date)
                except PermissionDenied as e:
                    return Response(e.detail, status=status.HTTP_403_FORBIDDEN)

            elif profile.user_type == 'patient':
                # Allow patients to query their own previous tests. Prefer direct Patient linkage.
                try:
                    own_patient = Patient.objects.get(user=user)
                    # If patient_id provided, ensure it matches the patient's record
                    if patient_id_int and own_patient.id != patient_id_int:
                        return Response(
                            {
                                'error': 'No autorizado',
                                'message': 'No tienes permiso para ver tests de otro paciente'
                            },
                            status=status.HTTP_403_FORBIDDEN
                        )

                    patient = own_patient
                    patient_name = patient.full_name
                    patient_birth_date = str(patient.birth_date)
                except Patient.DoesNotExist:
                    # If no linked Patient record, fall back to query params (must be provided)
                    if not patient_id_int and not (patient_name and patient_birth_date):
                        return Response(
                            {
                                'error': 'Datos insuficientes',
                                'message': 'No se encontró un perfil de paciente vinculado; proporciona patient_id o patient_name y patient_birth_date'
                            },
                            status=status.HTTP_400_BAD_REQUEST
                        )
        else:
            # Admin can search without patient_id (for administrative purposes)
            if not patient_id and not (patient_name and patient_birth_date):
                return Response(
                    {'error': 'Se requiere patient_id o patient_name y patient_birth_date'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if patient_id_int:
                try:
                    patient = Patient.objects.get(id=patient_id_int)
                    patient_name = patient.full_name
                    patient_birth_date = str(patient.birth_date)
                except Patient.DoesNotExist:
                    return Response(
                        {'error': 'Paciente no encontrado'},
                        status=status.HTTP_404_NOT_FOUND
                    )
        
        # Buscar tests que coincidan con nombre y fecha de nacimiento
        # Buscar en todos los usuarios, no solo del terapeuta actual
        # (porque el paciente pudo haber hecho el test en modo personal)
        results = TestResult.objects.filter(
            client_name__iexact=patient_name,
            client_birth_date=patient_birth_date
        ).exclude(
            patient__isnull=False  # Excluir tests que ya están vinculados a otro paciente
        ).select_related('test_module', 'user').order_by('-created_at')
        
        # Si el usuario es terapeuta (o admin con patient_id), también buscar tests ya vinculados a este paciente
        if (profile.user_type == 'therapist' or is_admin) and patient_id_int:
            try:
                if is_admin:
                    patient = Patient.objects.get(id=patient_id_int)
                else:
                    patient = Patient.objects.get(id=patient_id_int, therapist=user)
                
                patient_results = TestResult.objects.filter(patient=patient).select_related('test_module', 'user').order_by('-created_at')
                # Combinar resultados
                all_results = list(results) + list(patient_results)
                # Eliminar duplicados
                seen_ids = set()
                unique_results = []
                for result in all_results:
                    if result.id not in seen_ids:
                        seen_ids.add(result.id)
                        unique_results.append(result)
                results = unique_results
            except Patient.DoesNotExist:
                pass

        # If the requester is the patient themself, also include TestResult objects created by that user
        # (these may not have client_name/client_birth_date populated)
        if profile.user_type == 'patient' and getattr(user, 'id', None) and patient and patient.user and patient.user.id == user.id:
            try:
                user_results = TestResult.objects.filter(user=user).select_related('test_module', 'user').order_by('-created_at')
                all_results = list(results) + list(user_results)
                seen_ids = set()
                unique_results = []
                for result in all_results:
                    if result.id not in seen_ids:
                        seen_ids.add(result.id)
                        unique_results.append(result)
                results = unique_results
            except Exception:
                pass

        # If we have both an "assignment-only" legacy marker and a completed result for the same
        # test code, drop the legacy marker so the UI doesn't keep showing it as pending.
        try:
            completed_codes = set()
            for r in results:
                code = None
                try:
                    code = (r.test_module.code if getattr(r, 'test_module', None) else (r.test_id or None))
                except Exception:
                    code = None
                if not code:
                    continue
                try:
                    is_assignment_only = bool(getattr(r, 'result_data', None) and (r.result_data or {}).get('assignment_only') is True)
                    is_legacy_assignment = bool(isinstance(getattr(r, 'details', None), dict) and (r.details or {}).get('legacy_assignment') is True)
                except Exception:
                    is_assignment_only = False
                    is_legacy_assignment = False
                if not (is_assignment_only or is_legacy_assignment):
                    completed_codes.add(str(code).lower())

            if completed_codes:
                filtered = []
                for r in results:
                    code = None
                    try:
                        code = (r.test_module.code if getattr(r, 'test_module', None) else (r.test_id or None))
                    except Exception:
                        code = None
                    code_l = str(code).lower() if code else None
                    try:
                        is_assignment_only = bool(getattr(r, 'result_data', None) and (r.result_data or {}).get('assignment_only') is True)
                        is_legacy_assignment = bool(isinstance(getattr(r, 'details', None), dict) and (r.details or {}).get('legacy_assignment') is True)
                    except Exception:
                        is_assignment_only = False
                        is_legacy_assignment = False
                    if (is_assignment_only or is_legacy_assignment) and code_l and code_l in completed_codes:
                        continue
                    filtered.append(r)
                results = filtered
        except Exception:
            pass
        
        serializer = TestResultSerializer(results, many=True)
        serialized = serializer.data

        # Augment serialized results with legacy assignment info so frontend can display them
        augmented = []
        for obj, ser in zip(results, serialized):
            # If this is a legacy assignment (no test_module and flagged in details), normalize fields
            try:
                is_legacy = obj.test_module is None and isinstance(obj.details, dict) and obj.details.get('legacy_assignment') is True
            except Exception:
                is_legacy = False

            if is_legacy:
                # Ensure frontend-friendly fields exist: test_module_name, test_module_code
                ser['test_module_name'] = ser.get('test_module_name') or (obj.test_id or None)
                ser['test_module_code'] = ser.get('test_module_code') or (obj.test_id or None)
                # Expose a legacy flag and status for UI consumption
                ser['legacy'] = True
                ser['legacy_status'] = (obj.details or {}).get('status', 'assigned_pending_legacy')

            augmented.append(ser)

        # Additionally, include active UserTestAccess assignments (as pending) so
        # patients see canonical assignments created via UserTestAccess
        try:
            seen_codes = set()
            for s in augmented:
                code = None
                try:
                    code = (s.get('test_module') or {}).get('code') or s.get('test_module_code') or s.get('test_id')
                except Exception:
                    code = None
                if code:
                    seen_codes.add(str(code).lower())

            if patient and getattr(patient, 'user', None):
                accesses = UserTestAccess.objects.filter(user=patient.user, has_special_access=True).select_related('test_module')
                for access in accesses:
                    tm = getattr(access, 'test_module', None)
                    if not tm:
                        continue
                    code = (getattr(tm, 'code', None) or '').lower()
                    if code in seen_codes:
                        continue

                    pseudo = {
                        'id': f'useraccess-{access.id}',
                        'test_module_name': getattr(tm, 'name', None),
                        'test_module_code': getattr(tm, 'code', None),
                        'test_module': {
                            'id': getattr(tm, 'id', None),
                            'code': getattr(tm, 'code', None),
                            'name': getattr(tm, 'name', None),
                        },
                        'result_data': {'assignment_only': True},
                        'details': {'assigned_via_user_access': True},
                        'created_at': access.created_at.isoformat() if getattr(access, 'created_at', None) else None
                    }
                    augmented.append(pseudo)
                    seen_codes.add(code)
        except Exception:
            pass

        return Response({
            'count': len(augmented),
            'results': augmented
        })


class GrantTestAccessView(APIView):
    """Otorga acceso especial a un test (solo admin)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Only admin can grant test access
        if not request.user.is_staff and not request.user.profile.is_admin:
            return Response(
                {'error': 'No tienes permisos para esta acción'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_id = request.data.get('user_id')
        test_code = request.data.get('test_code')
        special_uses = request.data.get('special_uses')
        expires_at = request.data.get('expires_at')
        
        if not user_id or not test_code:
            return Response(
                {'error': 'user_id y test_code son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.contrib.auth.models import User
        target_user = get_object_or_404(User, id=user_id)
        test_module = get_object_or_404(TestModule, code=test_code)
        
        # PHASE 5: Prevent granting access to therapist_clinical tests to non-therapists
        # Check if test is therapist_clinical only
        if test_module.available_for_therapists and not test_module.available_for_personal:
            # This is a therapist_clinical only test
            try:
                target_profile = target_user.profile
                if target_profile.user_type != 'therapist':
                    return Response(
                        {
                            'error': 'No autorizado',
                            'message': f'No se puede otorgar acceso a tests clínicos (therapist_clinical) a usuarios que no son terapeutas. El usuario {target_user.username} tiene rol {target_profile.user_type}'
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )
            except (AttributeError, UserProfile.DoesNotExist):
                return Response(
                    {
                        'error': 'Perfil de usuario no encontrado',
                        'message': f'El usuario {target_user.username} no tiene un perfil válido'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        access, created = UserTestAccess.objects.get_or_create(
            user=target_user,
            test_module=test_module
        )
        
        access.has_special_access = True
        access.special_access_uses = special_uses
        if expires_at:
            from datetime import datetime
            access.special_access_expires = datetime.fromisoformat(expires_at)
        access.save()
        
        return Response({
            'success': True,
            'message': f'Acceso especial otorgado a {target_user.username} para {test_module.name}'
        })


class AssignTestToPatientView(APIView):
    """
    Permite a terapeutas asignar tests patient_self a sus propios pacientes.
    
    Solo terapeutas pueden usar este endpoint.
    Solo se pueden asignar tests patient_self (no therapist_clinical).
    El paciente debe pertenecer al terapeuta.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logger.info("ASSIGN_TEST: step 1 - request received")
        user = request.user
        try:
            profile = user.profile
        except (AttributeError, UserProfile.DoesNotExist):
            return Response(
                {
                    'error': 'Perfil de usuario no encontrado',
                    'message': 'El usuario autenticado no tiene un perfil válido'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info("ASSIGN_TEST: step 2 - user profile loaded")
        
        # SECURITY: Only therapists can assign tests (not admins)
        user_type = getattr(profile, 'user_type', None)
        if user_type != 'therapist':
            return Response(
                {
                    'error': 'No autorizado',
                    'message': 'Solo los terapeutas pueden asignar tests a pacientes. Los administradores no pueden realizar esta acción por razones de seguridad.'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        patient_id_raw = request.data.get('patient_id')
        test_code = request.data.get('test_code')
        
        logger.info(f"ASSIGN_TEST: step 3 - payload received patient_id={patient_id_raw}, test_code={test_code}")
        
        if not patient_id_raw or not test_code:
            return Response(
                {
                    'error': 'Datos incompletos',
                    'message': 'patient_id y test_code son requeridos'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            patient_id = int(patient_id_raw)
        except (TypeError, ValueError):
            return Response(
                {
                    'error': 'ID inválido',
                    'message': 'patient_id debe ser un número entero válido'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info("ASSIGN_TEST: step 4 - patient_id parsed")
        
        # Validate patient exists and belongs to therapist
        try:
            patient = Patient.objects.get(id=patient_id, therapist=user)
            logger.info("ASSIGN_TEST: step 5 - patient loaded")
        except Patient.DoesNotExist:
            return Response(
                {
                    'error': 'Paciente no encontrado',
                    'message': f'El paciente con ID {patient_id} no existe o no pertenece a este terapeuta'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.exception("ASSIGN_TEST: FAIL loading patient")
            return Response(
                {"detail": f"Error loading patient: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Validate patient has linked User account
        if not getattr(patient, 'user', None):
            return Response(
                {
                    'error': 'Paciente sin cuenta de usuario',
                    'message': 'El paciente debe tener una cuenta de usuario vinculada para poder asignarle tests'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Resolve test module tolerant to code/slug differences (case-insensitive).
        # Do NOT create records here; prefer existing DB entries. Do not filter by is_active
        # to allow assigning historical/legacy entries when execution_mode indicates holistic.
        from django.db.models import Q
        import re

        try:
            # Tolerant lookup: normalize codes by removing hyphens/underscores and lowercasing
            # Optimización: Reemplazo de loop en memoria por query directa
            
            raw_code = test_code
            candidates = TestModule.objects.filter(
                Q(code__iexact=raw_code) | 
                Q(name__iexact=raw_code)
            ).order_by('-is_active', '-updated_at')

            # Fallback para códigos normalizados (ej: gad7 vs gad-7) si no hay match directo
            if not candidates.exists():
                norm_code = re.sub(r"[-_]", "", (raw_code or "")).lower()
                if norm_code != raw_code.lower():
                     # Intento secundario con código normalizado, asumiendo que en DB algunos códigos pueden estar "limpios"
                     # o que el input vino sucio.
                     # Nota: Esto no cubre el caso inverso (input limpio, DB sucio) sin un loop o función DB, 
                     # pero cubre la mayoría de casos de fricción.
                     candidates = TestModule.objects.filter(
                         Q(code__iexact=norm_code) | 
                         Q(name__iexact=norm_code)
                     ).order_by('-is_active', '-updated_at')

            if candidates.exists():
                test_module = candidates.first()
            else:
                test_module = None

            logger.info("ASSIGN_TEST: step 6 - test module resolved")
        except Exception as e:
            logger.exception("ASSIGN_TEST: FAIL loading test module")
            return Response(
                {"detail": f"Error loading test: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if not test_module:
            # Fallback: allow assignment-only for legacy tests (no TestModule in DB)
            # Build a minimal legacy map (normalized keys)
            raw_legacy_map = {
                "phq-9": "phq-9",
                "phq9": "phq-9",
                "gad-7": "gad-7",
                "gad7": "gad-7",
                "bai": "bai",
                "bdi-ii": "bdi-ii",
                "eating": "eating",
                "isi": "insomnia",
                "scl-90": "scl-90",
                "scl90": "scl-90",
                "mcmi-iv": "mcmi-iv",
                "pai": "pai",
            }

            def _normalize_key(s: str) -> str:
                return re.sub(r"[-_]", "", (s or "")).lower()

            legacy_map = { _normalize_key(k): v for k, v in raw_legacy_map.items() }
            legacy_key = _normalize_key(test_code)

            if legacy_key in legacy_map:
                legacy_code = legacy_map[legacy_key]
                try:
                    # If the legacy mapping points to an existing TestModule, prefer creating
                    # a canonical UserTestAccess assignment so the patient can see it in the UI.
                    # This restores prior behavior for "isi"/insomnia-style assignments.
                    resolved_module = (
                        TestModule.objects.filter(code__iexact=legacy_code).first()
                        or TestModule.objects.filter(code__iexact=test_code).first()
                    )
                    if resolved_module and getattr(patient, 'user', None):
                        logger.warning(
                            "Legacy test alias used for assignment: alias=%s resolved_code=%s user_id=%s patient_id=%s endpoint=assign-to-patient",
                            test_code,
                            getattr(resolved_module, "code", None),
                            getattr(user, "id", None),
                            getattr(patient, "id", None),
                        )
                        access, created = UserTestAccess.objects.get_or_create(
                            user=patient.user,
                            test_module=resolved_module,
                        )
                        access.has_special_access = True
                        access.save()

                        patient_display_name = (
                            getattr(patient, 'full_name', None)
                            or getattr(patient, 'name', None)
                            or f'ID {patient.id}'
                        )
                        test_display_name = getattr(resolved_module, 'name', None) or legacy_code

                        return Response(
                            {
                                'success': True,
                                'message': f'Test "{test_display_name}" asignado exitosamente al paciente {patient_display_name}',
                                'patient_id': patient.id,
                                'test_code': test_code,
                                'created': created,
                                'status': None,
                            },
                            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
                        )

                    # Create a TestResult entry as an assignment-only legacy marker
                    tr = TestResult.objects.create(
                        user=request.user,
                        patient=patient,
                        test_module=None,
                        test_id=legacy_code,
                        input_data={},
                        result_data={'assignment_only': True},
                        details={
                            'assigned_by': request.user.id,
                            'legacy_assignment': True,
                            'status': 'assigned_pending_legacy'
                        },
                    )
                    return Response(
                        {
                            'detail': 'Test legacy asignado correctamente',
                            'legacy': True,
                            'code': legacy_code,
                            'result_id': tr.id,
                        },
                        status=status.HTTP_201_CREATED,
                    )
                except Exception as e:
                    logger.exception('ASSIGN_TEST: FAIL creating legacy assignment')
                    return Response({'detail': f'Error creando asignación legacy: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response(
                {
                    'error': 'Test no encontrado',
                    'message': f'El test con código {test_code} no existe'
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Functional validation: only allow assignment if the module is authorized for holistic execution
        if (
            getattr(test_module, "execution_mode", None) != "holistic"
            and not getattr(test_module, "available_for_personal", False)
        ):
            return Response(
                {
                    "error": "Modo de ejecución no permitido",
                    "message": "El test no está habilitado para asignación",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # SECURITY: Only allow patient_self tests (not therapist_clinical)
        if test_module.available_for_therapists and not test_module.available_for_personal:
            return Response(
                {
                    'error': 'Test no asignable',
                    'message': 'Solo se pueden asignar tests de tipo patient_self a pacientes. Los tests clínicos (therapist_clinical) no pueden ser asignados.'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Ensure test is available for personal/patient execution
        # Prefer explicit `execution_mode` on the TestModule when present (non-invasive).
        # If the module declares an execution_mode, allow assignment only for the
        # holistically-governed mode. Otherwise, fall back to legacy `available_for_personal` flag.
        exec_mode = getattr(test_module, 'execution_mode', None)
        if exec_mode is not None:
            if exec_mode != 'holistic':
                return Response(
                    {
                        'error': 'Modo de ejecución no permitido',
                        'message': 'El test no está habilitado para asignación en modo holístico'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            if not test_module.available_for_personal:
                return Response(
                    {
                        'error': 'Test no disponible',
                        'message': 'Este test no está disponible para ejecución por pacientes'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Create or update UserTestAccess for the patient's user account
        try:
            access, created = UserTestAccess.objects.get_or_create(
                user=patient.user,
                test_module=test_module
            )
            logger.info("ASSIGN_TEST: step 7 - assignment resolved (get_or_create)")
        except UserTestAccess.MultipleObjectsReturned:
            logger.info("ASSIGN_TEST: step 7b - multiple assignment rows detected")
            access = (
                UserTestAccess.objects
                .filter(user=patient.user, test_module=test_module)
                .order_by('-id')
                .first()
            )
            created = False
        except Exception as e:
            logger.exception("ASSIGN_TEST: FAIL creating assignment (get_or_create)")
            return Response(
                {"detail": f"Error creating assignment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        if not access:
            logger.error("ASSIGN_TEST: FAIL creating assignment - access unresolved")
            return Response(
                {"detail": "Error creating assignment: access unresolved"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            # Mark as special access (assigned by therapist)
            access.has_special_access = True
            access.save()
            logger.info("ASSIGN_TEST: step 8 - assignment saved")
        except Exception as e:
            logger.exception("ASSIGN_TEST: FAIL creating assignment (save)")
            return Response(
                {"detail": f"Error creating assignment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        patient_display_name = (
            getattr(patient, 'full_name', None)
            or getattr(patient, 'name', None)
            or f'ID {patient.id}'
        )
        test_display_name = getattr(test_module, 'name', None) or test_code
        
        logger.info("ASSIGN_TEST: step 9 - success")

        placeholder_cls = EXECUTORS.get(getattr(test_module, 'code', None))
        placeholder_payload = None
        if placeholder_cls is not None:
            try:
                placeholder_payload = placeholder_cls().execute()
            except Exception:
                placeholder_payload = None

        return Response({
            'success': True,
            'message': (
                placeholder_payload.get("message")
                if isinstance(placeholder_payload, dict) and placeholder_payload.get("message")
                else f'Test "{test_display_name}" asignado exitosamente al paciente {patient_display_name}'
            ),
            'patient_id': patient.id,
            'test_code': test_code,
            'created': created,
            'status': (
                placeholder_payload.get("status")
                if isinstance(placeholder_payload, dict) and placeholder_payload.get("status")
                else None
            )
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)




class UnassignTestFromPatientView(APIView):
    """
    Permite a terapeutas quitar tests asignados (patient_self) de sus pacientes.
    Elimina el UserTestAccess y marcadores legacy de asignacion (no borra resultados).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            profile = user.profile
        except (AttributeError, UserProfile.DoesNotExist):
            return Response(
                {
                    'error': 'Perfil de usuario no encontrado',
                    'message': 'El usuario autenticado no tiene un perfil valido'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user_type = getattr(profile, 'user_type', None)
        if user_type != 'therapist':
            return Response(
                {
                    'error': 'No autorizado',
                    'message': 'Solo los terapeutas pueden quitar tests asignados a pacientes.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        patient_id_raw = request.data.get('patient_id')
        test_code = request.data.get('test_code')

        if not patient_id_raw or not test_code:
            return Response(
                {
                    'error': 'Datos incompletos',
                    'message': 'patient_id y test_code son requeridos'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            patient_id = int(patient_id_raw)
        except (TypeError, ValueError):
            return Response(
                {
                    'error': 'ID invalido',
                    'message': 'patient_id debe ser un numero entero valido'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            patient = Patient.objects.get(id=patient_id, therapist=user)
        except Patient.DoesNotExist:
            return Response(
                {
                    'error': 'Paciente no encontrado',
                    'message': f'El paciente con ID {patient_id} no existe o no pertenece a este terapeuta'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not getattr(patient, 'user', None):
            return Response(
                {
                    'error': 'Paciente sin cuenta de usuario',
                    'message': 'El paciente debe tener una cuenta vinculada para quitar asignaciones'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        from django.db.models import Q
        import re as _re

        def _normalize(s: str) -> str:
            return _re.sub(r"[-_]", "", (s or "").lower())

        raw_code = str(test_code)
        norm = _normalize(raw_code)

        candidates = []
        for t in TestModule.objects.all():
            if _normalize(getattr(t, 'code', '')) == norm:
                candidates.append(t)
                continue
            if getattr(t, 'slug', None) and _normalize(getattr(t, 'slug')) == norm:
                candidates.append(t)

        if candidates:
            candidates.sort(key=lambda x: (getattr(x, 'is_active', False), getattr(x, 'updated_at', None) or 0), reverse=True)
            test_module = candidates[0]
        else:
            test_module = None

        raw_legacy_map = {
            'phq-9': 'phq-9',
            'phq9': 'phq-9',
            'gad-7': 'gad-7',
            'gad7': 'gad-7',
            'bai': 'bai',
            'bdi-ii': 'bdi-ii',
            'eating': 'eating',
            'isi': 'insomnia',
            'scl-90': 'scl-90',
            'scl90': 'scl-90',
            'mcmi-iv': 'mcmi-iv',
            'pai': 'pai',
        }
        legacy_map = { _normalize(k): v for k, v in raw_legacy_map.items() }
        legacy_code = legacy_map.get(norm)

        deleted_access = 0
        if test_module:
            deleted_access, _ = UserTestAccess.objects.filter(
                user=patient.user,
                test_module=test_module,
            ).delete()

        delete_markers_qs = TestResult.objects.filter(patient=patient).filter(
            Q(result_data__assignment_only=True) |
            Q(details__legacy_assignment=True) |
            Q(details__assigned_via_user_access=True)
        )

        if test_module:
            delete_markers_qs = delete_markers_qs.filter(
                Q(test_module=test_module) |
                Q(test_id__iexact=getattr(test_module, 'code', None))
            )
        elif legacy_code:
            delete_markers_qs = delete_markers_qs.filter(test_id__iexact=legacy_code)
        else:
            delete_markers_qs = delete_markers_qs.filter(test_id__iexact=raw_code)

        deleted_markers, _ = delete_markers_qs.delete()

        return Response(
            {
                'success': True,
                'message': 'Asignacion eliminada correctamente',
                'deleted_access': deleted_access,
                'deleted_markers': deleted_markers,
            },
            status=status.HTTP_200_OK,
        )
class PHQ9SubmitView(APIView):
    """
    Procesa PHQ-9 en modo patient_self y guarda el resultado.
    Ruta: POST /api/tests/phq9/submit/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.user_type != 'patient':
            return Response(
                {'error': 'No autorizado', 'message': 'Solo pacientes pueden enviar el PHQ-9.'},
                status=status.HTTP_403_FORBIDDEN
            )

        patient = _resolve_active_patient_for_user(user)

        answers = {}
        for i in range(1, 10):
            key = f"q{i}"
            if key not in request.data:
                return Response(
                    {'error': 'Respuestas incompletas', 'message': 'Faltan respuestas del cuestionario.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                value = int(request.data.get(key))
            except (TypeError, ValueError):
                return Response(
                    {'error': 'Respuesta inválida', 'message': f'La respuesta {key} debe ser un número entre 0 y 3.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if value < 0 or value > 3:
                return Response(
                    {'error': 'Respuesta fuera de rango', 'message': f'La respuesta {key} debe estar entre 0 y 3.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            answers[key] = value

        # Pilot mode: persist raw answers without clinical scoring or interpretation.
        try:
            test_module = TestModule.objects.get(code='phq-9')
        except TestModule.DoesNotExist:
            return Response(
                {'error': 'Test no encontrado', 'message': 'PHQ-9 no est  registrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        TestResult.objects.create(
            user=user,
            patient=patient,
            test_module=test_module,
            test_id='phq-9',
            input_data={'answers': answers},
            result_data={
                'status': 'pending',
                'message': 'Respuestas guardadas. Pendiente de implementaci¢n.',
            },
            score=None,
            clinical_diagnosis='',
            details={
                'raw_answers': answers,
                'legacy_migrated': True,
            },
        )

        return Response(
            {
                'status': 'pending',
                'message': 'Respuestas guardadas. Pendiente de implementaci¢n.',
            },
            status=status.HTTP_200_OK,
        )

        total_score = sum(answers.values())
        if total_score <= 4:
            severity_label = 'Mínima'
        elif total_score <= 9:
            severity_label = 'Leve'
        elif total_score <= 14:
            severity_label = 'Moderada'
        elif total_score <= 19:
            severity_label = 'Moderadamente grave'
        else:
            severity_label = 'Grave'

        suicidal_ideation = answers.get('q9', 0) > 0
        flags = {'suicidal_ideation': suicidal_ideation}
        clinical_warning = None
        if suicidal_ideation:
            clinical_warning = (
                'Se identifican respuestas en el ítem 9. Se recomienda seguimiento clínico inmediato.'
            )

        result_payload = {
            'total_score': total_score,
            'severity_label': severity_label,
            'flags': flags,
            'test_code': 'PHQ-9',
            'execution_mode': 'patient_self',
        }

        details_payload = {
            'raw_answers': answers,
            'flags': flags,
            'test_code': 'PHQ-9',
            'execution_mode': 'patient_self',
        }

        TestResult.objects.create(
            user=user,
            patient=patient,
            test_id='phq-9',
            input_data={'answers': answers},
            result_data=result_payload,
            score=total_score,
            clinical_diagnosis=severity_label,
            details=details_payload
        )

        response_payload = {
            'total_score': total_score,
            'severity_label': severity_label,
            'flags': flags,
            'message': 'Resultado guardado. Este test es un cribado y no constituye diagnóstico clínico.',
        }
        if clinical_warning:
            response_payload['clinical_warning'] = clinical_warning

        return Response(response_payload, status=status.HTTP_200_OK)


class GAD7SubmitView(APIView):
    """
    Procesa GAD-7 en modo patient_self y guarda el resultado.
    Ruta: POST /api/tests/gad7/submit/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.user_type != 'patient':
            return Response(
                {'error': 'No autorizado', 'message': 'Solo pacientes pueden enviar el GAD-7.'},
                status=status.HTTP_403_FORBIDDEN
            )

        patient = _resolve_active_patient_for_user(user)

        answers = {}
        for i in range(1, 8):
            key = f"q{i}"
            if key not in request.data:
                return Response(
                    {'error': 'Respuestas incompletas', 'message': 'Faltan respuestas del cuestionario.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                value = int(request.data.get(key))
            except (TypeError, ValueError):
                return Response(
                    {'error': 'Respuesta inválida', 'message': f'La respuesta {key} debe ser un número entre 0 y 3.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if value < 0 or value > 3:
                return Response(
                    {'error': 'Respuesta fuera de rango', 'message': f'La respuesta {key} debe estar entre 0 y 3.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            answers[key] = value

        # Pilot mode: persist raw answers without clinical scoring or interpretation.
        try:
            test_module = TestModule.objects.get(code='gad-7')
        except TestModule.DoesNotExist:
            return Response(
                {'error': 'Test no encontrado', 'message': 'GAD-7 no est  registrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        TestResult.objects.create(
            user=user,
            patient=patient,
            test_module=test_module,
            test_id='gad-7',
            input_data={'answers': answers},
            result_data={
                'status': 'pending',
                'message': 'Respuestas guardadas. Pendiente de implementaci¢n.',
            },
            score=None,
            clinical_diagnosis='',
            details={
                'raw_answers': answers,
                'legacy_migrated': True,
            },
        )

        return Response(
            {
                'status': 'pending',
                'message': 'Respuestas guardadas. Pendiente de implementaci¢n.',
            },
            status=status.HTTP_200_OK,
        )

        total_score = sum(answers.values())
        if total_score <= 4:
            severity_label = 'Mínima'
        elif total_score <= 9:
            severity_label = 'Leve'
        elif total_score <= 14:
            severity_label = 'Moderada'
        else:
            severity_label = 'Grave'

        result_payload = {
            'total_score': total_score,
            'severity_label': severity_label,
            'flags': {},
            'test_code': 'GAD-7',
            'execution_mode': 'patient_self',
        }

        details_payload = {
            'raw_answers': answers,
            'flags': {},
            'test_code': 'GAD-7',
            'execution_mode': 'patient_self',
        }

        test_module = None
        try:
            test_module = TestModule.objects.get(code='gad-7', is_active=True)
        except TestModule.DoesNotExist:
            test_module = None

        TestResult.objects.create(
            user=user,
            patient=patient,
            test_module=test_module,
            test_id='gad-7',
            input_data={'answers': answers},
            result_data=result_payload,
            score=total_score,
            clinical_diagnosis=severity_label,
            details=details_payload
        )

        response_payload = {
            'total_score': total_score,
            'severity_label': severity_label,
            'flags': {},
            'message': 'Resultado guardado. Este test es un cribado y no constituye diagnóstico clínico.',
        }

        return Response(response_payload, status=status.HTTP_200_OK)


class BAISubmitView(APIView):
    """
    Procesa BAI en modo patient_self y guarda el resultado.
    Ruta: POST /api/tests/bai/submit/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.user_type != 'patient':
            return Response(
                {'error': 'No autorizado', 'message': 'Solo pacientes pueden enviar el BAI.'},
                status=status.HTTP_403_FORBIDDEN
            )

        patient = _resolve_active_patient_for_user(user)

        answers = {}
        for i in range(1, 22):
            key = f"q{i}"
            if key not in request.data:
                return Response(
                    {'error': 'Respuestas incompletas', 'message': 'Faltan respuestas del cuestionario.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                value = int(request.data.get(key))
            except (TypeError, ValueError):
                return Response(
                    {'error': 'Respuesta inválida', 'message': f'La respuesta {key} debe ser un número entre 0 y 3.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if value < 0 or value > 3:
                return Response(
                    {'error': 'Respuesta fuera de rango', 'message': f'La respuesta {key} debe estar entre 0 y 3.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            answers[key] = value

        total_score = sum(answers.values())
        if total_score <= 7:
            severity_label = 'Ansiedad mínima'
        elif total_score <= 15:
            severity_label = 'Ansiedad leve'
        elif total_score <= 25:
            severity_label = 'Ansiedad moderada'
        else:
            severity_label = 'Ansiedad grave'

        result_payload = {
            'total_score': total_score,
            'severity_label': severity_label,
            'flags': {},
            'test_code': 'BAI',
            'execution_mode': 'patient_self',
        }

        details_payload = {
            'raw_answers': answers,
            'flags': {},
            'test_code': 'BAI',
            'execution_mode': 'patient_self',
        }

        test_module = None
        try:
            test_module = TestModule.objects.get(code='bai', is_active=True)
        except TestModule.DoesNotExist:
            test_module = None

        TestResult.objects.create(
            user=user,
            patient=patient,
            test_module=test_module,
            test_id='bai',
            input_data={'answers': answers},
            result_data=result_payload,
            score=total_score,
            clinical_diagnosis=severity_label,
            details=details_payload
        )

        response_payload = {
            'total_score': total_score,
            'severity_label': severity_label,
            'flags': {},
            'message': 'Resultado guardado. Este test es un cribado y no constituye diagnóstico clínico.',
        }

        return Response(response_payload, status=status.HTTP_200_OK)


class ISISubmitView(APIView):
    """
    Procesa ISI en modo patient_self y guarda el resultado.
    Ruta: POST /api/tests/isi/submit/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.user_type != 'patient':
            return Response(
                {'error': 'No autorizado', 'message': 'Solo pacientes pueden enviar el ISI.'},
                status=status.HTTP_403_FORBIDDEN
            )

        patient = _resolve_active_patient_for_user(user)

        answers = {}
        for i in range(1, 8):
            key = f"q{i}"
            if key not in request.data:
                return Response(
                    {'error': 'Respuestas incompletas', 'message': 'Faltan respuestas del cuestionario.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                value = int(request.data.get(key))
            except (TypeError, ValueError):
                return Response(
                    {'error': 'Respuesta inválida', 'message': f'La respuesta {key} debe ser un número entre 0 y 4.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if value < 0 or value > 4:
                return Response(
                    {'error': 'Respuesta fuera de rango', 'message': f'La respuesta {key} debe estar entre 0 y 4.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            answers[key] = value

        total_score = sum(answers.values())
        if total_score <= 7:
            severity_label = 'Insomnio clínicamente no significativo'
        elif total_score <= 14:
            severity_label = 'Insomnio subclínico'
        elif total_score <= 21:
            severity_label = 'Insomnio clínico moderado'
        else:
            severity_label = 'Insomnio clínico grave'

        result_payload = {
            'total_score': total_score,
            'severity_label': severity_label,
            'flags': {},
            'test_code': 'ISI',
            'execution_mode': 'patient_self',
        }

        details_payload = {
            'raw_answers': answers,
            'flags': {},
            'test_code': 'ISI',
            'execution_mode': 'patient_self',
        }

        test_module = None
        try:
            test_module = TestModule.objects.get(code='isi', is_active=True)
        except TestModule.DoesNotExist:
            test_module = None

        TestResult.objects.create(
            user=user,
            patient=patient,
            test_module=test_module,
            test_id='isi',
            input_data={'answers': answers},
            result_data=result_payload,
            score=total_score,
            clinical_diagnosis=severity_label,
            details=details_payload
        )

        response_payload = {
            'total_score': total_score,
            'severity_label': severity_label,
            'flags': {},
            'message': 'Resultado guardado. Este test es un cribado y no constituye diagnóstico clínico.',
        }

        return Response(response_payload, status=status.HTTP_200_OK)


class BDI2SubmitView(APIView):
    """
    Procesa BDI-II en modo patient_self y guarda el resultado.
    Ruta: POST /api/tests/bdi2/submit/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.user_type != 'patient':
            return Response(
                {'error': 'No autorizado', 'message': 'Solo pacientes pueden enviar el BDI-II.'},
                status=status.HTTP_403_FORBIDDEN
            )

        patient = _resolve_active_patient_for_user(user)

        answers = {}
        for i in range(1, 22):
            key = f"q{i}"
            if key not in request.data:
                return Response(
                    {'error': 'Respuestas incompletas', 'message': 'Faltan respuestas del cuestionario.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                value = int(request.data.get(key))
            except (TypeError, ValueError):
                return Response(
                    {'error': 'Respuesta inválida', 'message': f'La respuesta {key} debe ser un número entre 0 y 3.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if value < 0 or value > 3:
                return Response(
                    {'error': 'Respuesta fuera de rango', 'message': f'La respuesta {key} debe estar entre 0 y 3.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            answers[key] = value

        total_score = sum(answers.values())
        if total_score <= 13:
            severity_label = 'Depresión mínima'
        elif total_score <= 19:
            severity_label = 'Depresión leve'
        elif total_score <= 28:
            severity_label = 'Depresión moderada'
        else:
            severity_label = 'Depresión grave'

        suicidal_flag = answers.get('q9', 0) > 0
        flags = {'suicidal_ideation': suicidal_flag}

        result_payload = {
            'total_score': total_score,
            'severity_label': severity_label,
            'flags': flags,
            'test_code': 'BDI-II',
            'execution_mode': 'patient_self',
        }

        details_payload = {
            'raw_answers': answers,
            'flags': flags,
            'test_code': 'BDI-II',
            'execution_mode': 'patient_self',
        }

        test_module = None
        try:
            test_module = TestModule.objects.get(code='bdi-ii', is_active=True)
        except TestModule.DoesNotExist:
            test_module = None

        TestResult.objects.create(
            user=user,
            patient=patient,
            test_module=test_module,
            test_id='bdi-ii',
            input_data={'answers': answers},
            result_data=result_payload,
            score=total_score,
            clinical_diagnosis=severity_label,
            details=details_payload
        )

        response_payload = {
            'total_score': total_score,
            'severity_label': severity_label,
            'flags': flags,
            'message': 'Resultado guardado. Este test es un cribado de severidad y no constituye diagnóstico clínico.',
        }

        if suicidal_flag:
            response_payload['clinical_warning'] = 'Respuestas positivas en ítem de ideación suicida. Requiere valoración clínica.'

        return Response(response_payload, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class ProcessTestSubmissionView(APIView):
    """
    Vista para procesar tests psicométricos con análisis clínico y cabalístico
    Ruta: POST /api/tests/submit/
    """
    permission_classes = [AllowAny]  # Permitir desde frontend (Vercel)
    
    def post(self, request):
        """
        Procesa un test psicométrico y retorna análisis clínico y cabalístico
        
        Body esperado:
        {
            "test_id": "phq-9",
            "answers": [2, 3, 1, 2, 3, 2, 2, 1, 3],
            "patient_id": 1  # Opcional, para terapeutas
        }
        """
        test_id = request.data.get('test_id')
        answers = request.data.get('answers', [])
        patient_id = request.data.get('patient_id')
        
        # Validaciones básicas
        if not test_id:
            return Response(
                {'error': 'test_id es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not answers or not isinstance(answers, list):
            return Response(
                {'error': 'answers debe ser una lista de enteros'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # 1. Calcular score clínico
            scorer = ClinicalScorer()
            clinical_result = scorer.calcular_score(test_id, answers)
            
            # 2. Obtener mapeo cabalístico
            if test_id not in TEST_LINKS:
                return Response(
                    {'error': f'Test ID "{test_id}" no tiene mapeo cabalístico'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            kabbalah_mapping = TEST_LINKS[test_id]
            
            # 3. Obtener nombre del ángel desde el índice
            # Intentar cargar desde el JSON de ángeles
            angel_name_en = None
            try:
                from cabala_py.data_loader import KabbalahDataLoader
                loader = KabbalahDataLoader()
                angel_data = loader.get_angel_by_index(kabbalah_mapping['angel_remedio_idx'])
                if angel_data and 'name' in angel_data:
                    angel_name_en = angel_data['name'].get('en', f"Angel_{kabbalah_mapping['angel_remedio_idx']}")
            except Exception:
                # Si falla, usar un nombre genérico basado en el índice
                angel_name_en = f"Angel_{kabbalah_mapping['angel_remedio_idx']}"
            
            # 4. Preparar respuesta
            result = {
                'score': clinical_result['score_bruto'],
                'diagnosis': clinical_result['diagnostico_clinico'],
                'sefira': kabbalah_mapping['sefira_id'],
                'angel': angel_name_en,
                'angel_meditation_key': angel_name_en,  # Clave para buscar meditación en frontend
                'kabbalah': {
                    'test_name': kabbalah_mapping['test_name'],
                    'organo_ref_id': kabbalah_mapping['organo_ref_id'],
                    'concepto_clave_id': kabbalah_mapping['concepto_clave_id'],
                    'angel_remedio_idx': kabbalah_mapping['angel_remedio_idx'],
                    'bio_desc': kabbalah_mapping['bio_desc']
                }
            }
            
            # 5. Guardar resultado en la base de datos (si hay usuario autenticado)
            patient = None
            if request.user.is_authenticated:
                if patient_id:
                    # PHASE 2: Apply hardened validators for authenticated requests with patient_id
                    try:
                        # Validate that user is therapist (only therapists can link results to patients)
                        validate_role_for_execution(request.user, 'therapist_clinical')
                        # Validate patient ownership and prevent self-evaluation
                        patient = validate_patient_ownership(request.user, patient_id)
                    except (ValidationError, PermissionDenied) as e:
                        # If validation fails, return error (don't silently continue)
                        return Response(
                            e.detail if hasattr(e, 'detail') else {'error': str(e)},
                            status=status.HTTP_403_FORBIDDEN
                        )
            # Note: If patient_id provided but user not authenticated, it's ignored (don't link to patient)
                
                # Convertir score a int si es float (para SCL-90-R guardamos el promedio como int aproximado)
                score_value = clinical_result['score_bruto']
                if isinstance(score_value, float):
                    score_value = int(round(score_value))
                elif not isinstance(score_value, int):
                    score_value = 0
                
                test_result = TestResult.objects.create(
                    user=request.user,
                    patient=patient,
                    test_id=test_id,
                    score=score_value,
                    clinical_diagnosis=clinical_result['diagnostico_clinico'],
                    kabbalah_sefira=kabbalah_mapping['sefira_id'],
                    angel_remedy=angel_name_en or f"Angel_{kabbalah_mapping['angel_remedio_idx']}",
                    details={
                        'answers': answers,
                        'kabbalah_mapping': kabbalah_mapping,
                        'full_result': result,
                        'score_bruto_original': clinical_result['score_bruto']  # Guardar el valor original
                    }
                )
                
                result['test_result_id'] = test_result.id
            
            return Response(result, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            import traceback
            return Response(
                {'error': f'Error al procesar test: {str(e)}', 'traceback': traceback.format_exc()}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

 
