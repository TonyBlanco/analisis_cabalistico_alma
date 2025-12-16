from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.decorators import permission_classes
from django.shortcuts import get_object_or_404
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


class AvailableTestsView(APIView):
    """Lista todos los tests disponibles para el usuario actual"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        profile = user.profile
        
        # PHASE 3: Filter tests by execution_mode based on user role
        tests = TestModule.objects.filter(is_active=True)
        
        # Check if user is admin (can view all tests)
        is_admin = (
            profile.is_admin or 
            user.is_staff or 
            user.is_superuser
        )
        
        if is_admin:
            # Admin can view all tests (no execution_mode filter)
            # Still filtered by is_active and is_available_for_user in serializer context
            pass
        elif profile.user_type == 'therapist':
            # Therapist can see both patient_self and therapist_clinical tests
            from django.db.models import Q
            tests = tests.filter(
                Q(available_for_therapists=True) | Q(available_for_personal=True)
            )
        else:
            # patient / personal → ONLY patient_self tests
            tests = tests.filter(available_for_personal=True)
        
        # Additional filtering by subscription/access level (existing logic)
        # Filter by is_available_for_user for each test (subscription/access level checks)
        filtered_tests = [test for test in tests if test.is_available_for_user(user)]
        
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

        # Verify subscription/access level (existing logic)
        if not test_module.is_available_for_user(user):
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
        
        # Verificar disponibilidad del test para el usuario (validación existente)
        if not test_module.is_available_for_user(request.user):
            return Response({'error': 'No tienes acceso a este test'}, status=status.HTTP_403_FORBIDDEN)

        user_access, created = UserTestAccess.objects.get_or_create(user=request.user, test_module=test_module)
        if not user_access.can_use_test():
            return Response({'error': 'Has alcanzado el límite mensual de usos para este test', 'current_uses': user_access.current_month_uses, 'limit': test_module.uses_per_month}, status=status.HTTP_429_TOO_MANY_REQUESTS)

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
                'patient_id': patient.id if patient else None,
                'execution_timestamp': datetime.now().isoformat()
            }
            
            # Inicializar details_dict vacío (details es un campo JSONField independiente de result_data)
            # Si hay datos previos en details que queramos preservar, se pueden añadir aquí
            details_dict = {
                'audit': audit_metadata
            }
            
            # Crear TestResult con metadata de auditoría
            test_result = TestResult.objects.create(
                user=request.user,
                test_module=test_module,
                input_data=input_data,
                result_data=result_data,
                client_name=client_name,
                client_birth_date=client_birth_date,
                patient=patient,
                details=details_dict  # H4: Audit metadata stored in details JSONField
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
        try:
            # optional internal modules; if missing, we'll continue with None placeholders
            from .pai import compute_pai
        except Exception:
            compute_pai = None
        try:
            from .diagnostics import compute_bdi, compute_bai, compute_scl90, compute_stai, compute_mcmi4, compute_scid5
        except Exception:
            compute_bdi = compute_bai = compute_scl90 = compute_stai = compute_mcmi4 = compute_scid5 = None

        test_type = test_module.test_type
        try:
            if test_type == 'bdi' or test_module.code == 'bdi-ii':
                responses = input_data.get('responses', {})
                if compute_bdi:
                    result = compute_bdi({'nombre': input_data.get('nombre'), 'edad': input_data.get('edad'), 'fecha': input_data.get('fecha'), 'terapeuta': input_data.get('terapeuta'), 'responses': responses})
                else:
                    result = {'note': 'compute_bdi not available; missing module'}
                return {'test_type': 'bdi', 'result': result, 'timestamp': str(datetime.now())}
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
        
        if is_admin:
            # Admin can view all results (read-only access to all)
            results = TestResult.objects.filter(is_archived=False)
        elif profile.user_type == 'therapist':
            # Therapist can view own results + results of their patients
            from django.db.models import Q
            results = TestResult.objects.filter(
                Q(is_archived=False) & (
                    Q(user=user) |  # Own results
                    Q(patient__therapist=user)  # Results of their patients
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
        
        # PHASE 4: Validate access based on role and ownership
        if not self._can_access_result(request.user, result):
            return Response(
                {
                    'error': 'No tienes acceso a este resultado',
                    'message': 'Este resultado no pertenece a tu cuenta o a tus pacientes'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
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
        
        # Only the user who created the result can delete it
        if result.user != request.user:
            return Response(
                {
                    'error': 'No autorizado',
                    'message': 'Solo el usuario que creó este resultado puede eliminarlo'
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
        
        # PHASE 5: Only therapist can search patient tests
        is_admin = (
            profile.is_admin or 
            user.is_staff or 
            user.is_superuser
        )
        
        if not is_admin and profile.user_type != 'therapist':
            return Response(
                {
                    'error': 'No autorizado',
                    'message': 'Solo los terapeutas pueden buscar tests de pacientes'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        patient_id = request.query_params.get('patient_id')
        patient_name = request.query_params.get('patient_name')
        patient_birth_date = request.query_params.get('patient_birth_date')
        
        # PHASE 5: patient_id is required for therapist searches (ensures ownership validation)
        if not is_admin:
            if not patient_id:
                return Response(
                    {
                        'error': 'patient_id requerido',
                        'message': 'Se requiere patient_id para buscar tests de pacientes'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # PHASE 5: Validate patient ownership using hardened validator
            try:
                patient = validate_patient_ownership(user, patient_id)
                patient_name = patient.full_name
                patient_birth_date = str(patient.birth_date)
            except PermissionDenied as e:
                return Response(e.detail, status=status.HTTP_403_FORBIDDEN)
        else:
            # Admin can search without patient_id (for administrative purposes)
            if not patient_id and not (patient_name and patient_birth_date):
                return Response(
                    {'error': 'Se requiere patient_id o patient_name y patient_birth_date'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if patient_id:
                try:
                    patient = Patient.objects.get(id=patient_id)
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
        if (profile.user_type == 'therapist' or is_admin) and patient_id:
            try:
                if is_admin:
                    patient = Patient.objects.get(id=patient_id)
                else:
                    patient = Patient.objects.get(id=patient_id, therapist=user)
                
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
        
        serializer = TestResultSerializer(results, many=True)
        return Response({
            'count': len(results),
            'results': serializer.data
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


class AssignedTestsView(APIView):
    """
    Endpoint para pacientes: retorna tests asignados por su terapeuta.
    
    GET /api/tests/assigned/
    - Solo para rol 'patient'
    - Retorna SOLO tests con has_special_access=True para el usuario autenticado
    - Solo tests patient_self (available_for_personal=True)
    - Ownership forzado en backend (solo tests del usuario autenticado)
    - Retorna [] si no hay tests asignados (200 OK)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        profile = user.profile
        
        # SECURITY: Solo pacientes pueden acceder
        if profile.user_type != 'patient':
            return Response(
                {
                    'error': 'No autorizado',
                    'message': 'Este endpoint solo está disponible para pacientes'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener tests asignados: UserTestAccess con has_special_access=True
        # y que sean patient_self (available_for_personal=True)
        assigned_accesses = UserTestAccess.objects.filter(
            user=user,
            has_special_access=True,
            test_module__is_active=True,
            test_module__available_for_personal=True
        ).select_related('test_module')
        
        # Convertir a lista de TestModule
        assigned_tests = [access.test_module for access in assigned_accesses]
        
        # Serializar usando el mismo serializer que AvailableTestsView
        serializer = TestModuleSerializer(
            assigned_tests,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'tests': serializer.data
        })


class AssignTestToPatientView(APIView):
    """
    Permite a terapeutas asignar tests patient_self a sus propios pacientes.
    
    Solo terapeutas pueden usar este endpoint (no admins).
    Solo se pueden asignar tests patient_self (no therapist_clinical).
    El paciente debe pertenecer al terapeuta.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        profile = user.profile
        
        # SECURITY: Only therapists can assign tests (not admins)
        if profile.user_type != 'therapist':
            return Response(
                {
                    'error': 'No autorizado',
                    'message': 'Solo los terapeutas pueden asignar tests a pacientes. Los administradores no pueden realizar esta acción por razones de seguridad.'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # SECURITY: Explicitly block admins even if user_type is 'therapist'
        is_admin = (
            profile.is_admin or 
            user.is_staff or 
            user.is_superuser
        )
        if is_admin:
            return Response(
                {
                    'error': 'No autorizado',
                    'message': 'Los administradores no pueden asignar tests a pacientes por razones de seguridad. Solo los terapeutas pueden gestionar sus propios pacientes.'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        patient_id = request.data.get('patient_id')
        test_code = request.data.get('test_code')
        
        if not patient_id or not test_code:
            return Response(
                {
                    'error': 'Datos incompletos',
                    'message': 'patient_id y test_code son requeridos'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate patient exists and belongs to therapist
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
        
        # Validate patient has linked User account
        if not patient.user:
            return Response(
                {
                    'error': 'Paciente sin cuenta de usuario',
                    'message': 'El paciente debe tener una cuenta de usuario vinculada para poder asignarle tests'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate test module exists
        try:
            test_module = TestModule.objects.get(code=test_code, is_active=True)
        except TestModule.DoesNotExist:
            return Response(
                {
                    'error': 'Test no encontrado',
                    'message': f'El test con código {test_code} no existe o no está activo'
                },
                status=status.HTTP_404_NOT_FOUND
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
        if not test_module.available_for_personal:
            return Response(
                {
                    'error': 'Test no disponible',
                    'message': 'Este test no está disponible para ejecución por pacientes'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create or update UserTestAccess for the patient's user account
        access, created = UserTestAccess.objects.get_or_create(
            user=patient.user,
            test_module=test_module
        )
        
        # Mark as special access (assigned by therapist)
        access.has_special_access = True
        access.save()
        
        return Response({
            'success': True,
            'message': f'Test "{test_module.name}" asignado exitosamente al paciente {patient.full_name}',
            'patient_id': patient.id,
            'test_code': test_code,
            'created': created
        })


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

 
