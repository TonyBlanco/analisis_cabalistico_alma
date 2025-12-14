from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
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
from .models import Patient


class AvailableTestsView(APIView):
    """Lista todos los tests disponibles para el usuario actual"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        profile = user.profile
        
        # Filtrar tests según tipo de usuario
        tests = TestModule.objects.filter(is_active=True)
        
        if profile.user_type == 'therapist':
            tests = tests.filter(available_for_therapists=True)
        else:
            tests = tests.filter(available_for_personal=True)
        
        serializer = TestModuleSerializer(
            tests, 
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

        # Verificar si el usuario puede ver este test
        if not test_module.is_available_for_user(request.user):
            return Response(
                {
                    'error': 'No tienes acceso a este test',
                    'required_level': test_module.required_access_level,
                    'your_level': request.user.profile.subscription_plan or 'free'
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

    def _validate_execution_mode(self, test_module, execution_mode, request_context):
        """
        H1: Execution Mode Validation
        Valida que el modo de ejecución inferido coincida con el contexto de la request
        """
        # Validar que el modo inferido es compatible con la request
        if execution_mode == 'patient_self':
            # En patient_self, NO debe haber patient_id
            if request_context.get('patient_id'):
                return False, {
                    'error': 'Este test está configurado para ejecución personal (patient_self)',
                    'message': 'No se puede proporcionar patient_id en modo patient_self',
                    'execution_mode': execution_mode
                }, status.HTTP_400_BAD_REQUEST
        elif execution_mode == 'therapist_clinical':
            # En therapist_clinical, DEBE haber patient_id
            if not request_context.get('patient_id'):
                return False, {
                    'error': 'Este test está configurado para ejecución clínica (therapist_clinical)',
                    'message': 'patient_id es requerido para tests en modo therapist_clinical',
                    'execution_mode': execution_mode
                }, status.HTTP_400_BAD_REQUEST
        
        return True, None, None

    def _validate_role(self, execution_mode, profile, patient_id):
        """
        H2: Role Validation
        Valida que el rol del usuario coincida con el modo de ejecución
        """
        if execution_mode == 'patient_self':
            # En patient_self, el usuario NO debe ser terapeuta ni admin
            if profile.user_type == 'therapist':
                return False, {
                    'error': 'No autorizado para ejecución personal',
                    'message': 'Los terapeutas no pueden ejecutar tests en modo patient_self',
                    'execution_mode': execution_mode,
                    'user_role': profile.user_type
                }, status.HTTP_403_FORBIDDEN
            
            if profile.is_admin or profile.user.is_staff or profile.user.is_superuser:
                return False, {
                    'error': 'No autorizado para ejecución personal',
                    'message': 'Los administradores no pueden ejecutar tests en modo patient_self',
                    'execution_mode': execution_mode,
                    'user_role': 'admin'
                }, status.HTTP_403_FORBIDDEN
            
            # NO debe haber patient_id
            if patient_id:
                return False, {
                    'error': 'patient_id no permitido en modo patient_self',
                    'message': 'No se puede proporcionar patient_id cuando el usuario es personal',
                    'execution_mode': execution_mode
                }, status.HTTP_400_BAD_REQUEST
        
        elif execution_mode == 'therapist_clinical':
            # En therapist_clinical, el usuario DEBE ser terapeuta
            if profile.user_type != 'therapist':
                return False, {
                    'error': 'No autorizado para ejecución clínica',
                    'message': 'Solo los terapeutas pueden ejecutar tests en modo therapist_clinical',
                    'execution_mode': execution_mode,
                    'user_role': profile.user_type
                }, status.HTTP_403_FORBIDDEN
            
            # patient_id es REQUERIDO
            if not patient_id:
                return False, {
                    'error': 'patient_id requerido',
                    'message': 'patient_id es obligatorio para ejecución en modo therapist_clinical',
                    'execution_mode': execution_mode
                }, status.HTTP_400_BAD_REQUEST
        
        return True, None, None

    def _validate_therapist_patient_ownership(self, therapist_user, patient_id):
        """
        H3: Therapist-Patient Ownership Validation
        Valida que el paciente pertenezca al terapeuta autenticado
        """
        if not patient_id:
            return True, None, None
        
        try:
            patient = Patient.objects.get(id=patient_id, therapist=therapist_user)
            
            # Validar que el terapeuta NO esté evaluándose a sí mismo
            if patient.user == therapist_user:
                return False, {
                    'error': 'Auto-evaluación no permitida',
                    'message': 'Un terapeuta no puede ejecutar tests clínicos para sí mismo',
                    'patient_id': patient_id
                }, status.HTTP_403_FORBIDDEN
            
            return True, patient, None
            
        except Patient.DoesNotExist:
            return False, {
                'error': 'Paciente no encontrado o no autorizado',
                'message': f'El paciente con ID {patient_id} no existe o no pertenece a este terapeuta',
                'patient_id': patient_id
            }, status.HTTP_403_FORBIDDEN

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
        
        # H1: Execution Mode Validation
        request_context = {
            'patient_id': patient_id,
            'user_type': profile.user_type
        }
        execution_mode = self._infer_execution_mode(test_module, request_context)
        
        valid, error_response, error_status = self._validate_execution_mode(
            test_module, execution_mode, request_context
        )
        if not valid:
            return Response(error_response, status=error_status)
        
        # H2: Role Validation
        valid, error_response, error_status = self._validate_role(
            execution_mode, profile, patient_id
        )
        if not valid:
            return Response(error_response, status=error_status)
        
        # H3: Therapist-Patient Ownership Validation
        patient = None
        if execution_mode == 'therapist_clinical' and patient_id:
            valid, error_response_or_patient, error_status = self._validate_therapist_patient_ownership(
                request.user, patient_id
            )
            if not valid:
                return Response(error_response_or_patient, status=error_status)
            patient = error_response_or_patient
        
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
        """Lista todos los resultados del usuario"""
        results = TestResult.objects.filter(
            user=request.user,
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
    
    def get(self, request, pk):
        """Obtiene un resultado específico"""
        result = get_object_or_404(
            TestResult, 
            pk=pk, 
            user=request.user
        )
        serializer = TestResultSerializer(result)
        return Response(serializer.data)
    
    def patch(self, request, pk):
        """Actualiza un resultado (notas, favorito, etc.)"""
        result = get_object_or_404(
            TestResult, 
            pk=pk, 
            user=request.user
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
        result = get_object_or_404(
            TestResult, 
            pk=pk, 
            user=request.user
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
        """Busca tests previos que coincidan con el nombre y fecha de nacimiento del paciente"""
        patient_id = request.query_params.get('patient_id')
        patient_name = request.query_params.get('patient_name')
        patient_birth_date = request.query_params.get('patient_birth_date')
        
        if not patient_id and not (patient_name and patient_birth_date):
            return Response(
                {'error': 'Se requiere patient_id o patient_name y patient_birth_date'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile = request.user.profile
        
        # Si se proporciona patient_id, obtener datos del paciente
        if patient_id:
            from .models import Patient
            try:
                patient = Patient.objects.get(id=patient_id, therapist=request.user)
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
        
        # Si el usuario es terapeuta, también buscar tests ya vinculados a este paciente
        if profile.user_type == 'therapist' and patient_id:
            from .models import Patient
            try:
                patient = Patient.objects.get(id=patient_id, therapist=request.user)
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
        user = get_object_or_404(User, id=user_id)
        test_module = get_object_or_404(TestModule, code=test_code)
        
        access, created = UserTestAccess.objects.get_or_create(
            user=user,
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
            'message': f'Acceso especial otorgado a {user.username} para {test_module.name}'
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
            if request.user.is_authenticated:
                patient = None
                if patient_id:
                    try:
                        patient = Patient.objects.get(id=patient_id, therapist=request.user)
                    except Patient.DoesNotExist:
                        pass  # Si no existe, continuar sin paciente
                
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

 
