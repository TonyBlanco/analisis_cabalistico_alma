"""
Vistas para análisis de Alta Cábala
Gematria, Tarot, Mapa del Alma, Astrología, Tikún
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from django.db import OperationalError
import logging
from .models import Patient, CabalisticAnalysis, AnalysisRecord
from .models_astrology import AstrologyNatalChart
from .utils.tarot_service import analyze_archetype_vs_clinical
from .astrology_kerykeion.service import execute_kerykeion
from .astrology_kerykeion.schemas import KerykeionInputSchema, LocationSchema
from .astrology_kerykeion.normalizer import normalize_kerykeion_output
from .permissions import IsTherapist
from .synthesis_engine import SynthesisEngine
from pydantic import ValidationError

# Analysis service for creating/executing AnalysisRecord
from .services.analysis_service import create_and_execute_analysis
from .serializers import AnalysisRecordSerializer

# Symbolic PoC engine
from .symbolic.kabbalah_engine import score_72_names, compute_tikun_signals

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class CabalaAplicadaMethodRecordView(APIView):
    """Guarda una ejecución del workspace Cabala Aplicada como AnalysisRecord.

    Ruta:
      POST /api/therapist/patients/<id>/cabala-aplicada/records/

    Objetivo:
    - Persistir ejecuciones manuales (client-side) de métodos simbólicos
      (pitágoras, gematrías, notarikon, etc.) como artefactos longitudinales.
    - Hacerlos visibles en historial/overview y en export holístico.
    """

    permission_classes = [IsAuthenticated, IsTherapist]

    def post(self, request, id):
        try:
            try:
                patient = Patient.objects.get(id=id, therapist=request.user)
            except Patient.DoesNotExist:
                return Response({'error': 'Paciente no encontrado o no tienes acceso'}, status=status.HTTP_404_NOT_FOUND)

            body = request.data if isinstance(request.data, dict) else {}
            method_id = body.get('method_id')
            method_name = body.get('method_name')

            if not isinstance(method_id, str) or not method_id.strip():
                return Response({'error': 'method_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)

            # Normalizar módulo estable (max_length=64)
            normalized_method = method_id.strip().lower().replace(' ', '-')
            module_code = f"CABALA_APLICADA_{normalized_method}"[:64]

            birth_snapshot = {
                'legal_name': patient.full_name or '',
                'birth_date': patient.birth_date.strftime('%Y-%m-%d') if patient.birth_date else '',
                'birth_time': patient.birth_time.strftime('%H:%M') if patient.birth_time else '',
                'city': patient.birth_city or '',
                'country': patient.birth_country or '',
                'lat': float(patient.birth_latitude) if patient.birth_latitude is not None else None,
                'lng': float(patient.birth_longitude) if patient.birth_longitude is not None else None,
                'timezone': patient.birth_timezone or '',
                'geocode_source': 'patient_profile',
            }

            algo_snapshot = {
                'engine': 'cabala_aplicada_client',
                'version': '0.1.0',
                'params': {
                    'method_id': normalized_method,
                    'method_name': method_name or None,
                },
            }

            raw_input = {
                'method_id': normalized_method,
                'method_name': method_name or None,
                'input': body.get('input') if isinstance(body.get('input'), dict) else None,
            }

            # computed_result: mantener un namespace claro
            computed_result = {
                'cabala_aplicada': {
                    'method_id': normalized_method,
                    'method_name': method_name or None,
                    'method_output': body.get('method_output') if isinstance(body.get('method_output'), dict) else None,
                    'tree_state': body.get('tree_state') if isinstance(body.get('tree_state'), dict) else None,
                    'backend_structural_state': body.get('backend_structural_state') if isinstance(body.get('backend_structural_state'), dict) else None,
                    'symbolic_interpretation': body.get('symbolic_interpretation') if isinstance(body.get('symbolic_interpretation'), dict) else None,
                }
            }

            record = AnalysisRecord.objects.create(
                kind='kabbalah',
                module_code=module_code,
                role_context='therapist',
                execution_mode=None,
                birth_data_snapshot=birth_snapshot,
                algorithm_snapshot=algo_snapshot,
                raw_input=raw_input,
                computed_result=computed_result,
                visibility='therapist',
                created_by_user=request.user,
                therapist=request.user,
                patient=patient,
                subject_user=getattr(patient, 'user', None),
            )

            serializer = AnalysisRecordSerializer(record, context={'request': request})
            return Response({'success': True, 'record': serializer.data}, status=status.HTTP_201_CREATED)

        except Exception:
            logger.exception('Error inesperado en CabalaAplicadaMethodRecordView')
            return Response({'error': 'Error interno del servidor'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class SaveCabalisticAnalysisView(APIView):
    """
    Guarda un análisis de Alta Cábala para un paciente
    Ruta: POST /api/therapist/patients/<id>/cabalistic-analysis/
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request, id):
        """Guarda un análisis cabalístico"""
        try:
            # Obtener el paciente (solo si es del terapeuta actual)
            patient = get_object_or_404(
                Patient.objects.filter(therapist=request.user),
                id=id
            )
            
            analysis_type = request.data.get('analysis_type')
            input_data = request.data.get('input_data', {})
            result_data = request.data.get('result_data', {})
            summary = request.data.get('summary', '')
            therapist_notes = request.data.get('therapist_notes', '')
            
            if not analysis_type:
                return Response(
                    {'error': 'El tipo de análisis (analysis_type) es requerido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar que el tipo sea válido
            valid_types = [choice[0] for choice in CabalisticAnalysis.ANALYSIS_TYPE_CHOICES]
            if analysis_type not in valid_types:
                return Response(
                    {'error': f'Tipo de análisis inválido. Debe ser uno de: {", ".join(valid_types)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Crear el análisis
            analysis = CabalisticAnalysis.objects.create(
                patient=patient,
                therapist=request.user,
                analysis_type=analysis_type,
                input_data=input_data,
                result_data=result_data,
                summary=summary,
                therapist_notes=therapist_notes
            )
            
            return Response({
                'success': True,
                'analysis_id': analysis.id,
                'message': 'Análisis guardado exitosamente'
            }, status=status.HTTP_201_CREATED)
        
        except Exception:
            logger.error("Error al guardar analisis cabalistico", exc_info=True)
            return Response(
                {'error': 'Error al guardar el analisis'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class ListCabalisticAnalysesView(APIView):
    """
    Lista todos los análisis de Alta Cábala de un paciente
    Ruta: GET /api/therapist/patients/<id>/cabalistic-analyses/
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get(self, request, id):
        """Lista los análisis cabalísticos del paciente"""
        try:
            # Obtener el paciente (solo si es del terapeuta actual)
            patient = get_object_or_404(
                Patient.objects.filter(therapist=request.user),
                id=id
            )
            
            # Filtrar por tipo si se especifica
            analysis_type = request.query_params.get('type', None)
            analyses = CabalisticAnalysis.objects.filter(patient=patient)
            
            if analysis_type:
                analyses = analyses.filter(analysis_type=analysis_type)
            
            analyses = analyses.order_by('-created_at')
            
            # Serializar resultados
            results = []
            for analysis in analyses:
                results.append({
                    'id': analysis.id,
                    'analysis_type': analysis.analysis_type,
                    'analysis_type_display': analysis.get_analysis_type_display(),
                    'input_data': analysis.input_data,
                    'result_data': analysis.result_data,
                    'summary': analysis.summary,
                    'therapist_notes': analysis.therapist_notes,
                    'created_at': analysis.created_at.isoformat(),
                    'updated_at': analysis.updated_at.isoformat()
                })
            
            return Response({
                'success': True,
                'count': len(results),
                'results': results
            }, status=status.HTTP_200_OK)
        
        except Exception:
            logger.error("Error al listar analisis cabalisticos", exc_info=True)
            return Response(
                {'error': 'Error al listar los analisis'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class GenerateAndSaveTarotAnalysisView(APIView):
    """
    Genera y guarda automáticamente un análisis de Tarot cruzado
    Ruta: POST /api/therapist/patients/<id>/tarot-analysis/generate-and-save/
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request, id):
        """Genera y guarda el análisis de Tarot"""
        try:
            # Obtener el paciente
            patient = get_object_or_404(
                Patient.objects.filter(therapist=request.user),
                id=id
            )
            
            # Verificar que tenga fecha de nacimiento
            if not patient.birth_date:
                return Response(
                    {'error': 'El paciente no tiene fecha de nacimiento registrada'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generar análisis usando el servicio existente
            from .utils.tarot_service import analyze_archetype_vs_clinical
            analysis_result = analyze_archetype_vs_clinical(
                patient=patient,
                birth_date=patient.birth_date.isoformat()
            )
            
            # Verificar si hay error
            if 'error' in analysis_result:
                error_status = status.HTTP_500_INTERNAL_SERVER_ERROR
                if 'No se encontraron tests' in analysis_result['error']:
                    error_status = status.HTTP_400_BAD_REQUEST
                elif 'fecha de nacimiento' in analysis_result['error'].lower():
                    error_status = status.HTTP_400_BAD_REQUEST
                
                return Response(
                    {'error': analysis_result['error']},
                    status=error_status
                )
            
            # Crear resumen
            summary = f"Arcano {analysis_result['arcana_number']}: {analysis_result['arcana_name']} - {analysis_result['test_name']} ({analysis_result['clinical_severity']})"
            
            # Guardar el análisis
            analysis = CabalisticAnalysis.objects.create(
                patient=patient,
                therapist=request.user,
                analysis_type='tarot',
                input_data={
                    'birth_date': patient.birth_date.isoformat(),
                    'patient_name': patient.full_name
                },
                result_data=analysis_result,
                summary=summary,
                therapist_notes=request.data.get('therapist_notes', '')
            )
            
            return Response({
                'success': True,
                'analysis_id': analysis.id,
                'analysis': analysis_result,
                'message': 'Análisis de Tarot generado y guardado exitosamente'
            }, status=status.HTTP_201_CREATED)
        
        except Exception:
            logger.error("Error al generar y guardar analisis de Tarot", exc_info=True)
            return Response(
                {'error': 'Error al generar y guardar el analisis'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class KerykeionAnalysisView(APIView):
    """
    Endpoint para calcular y recuperar carta natal Kerykeion
    Ruta: GET/POST /api/therapist/patients/<id>/astrology-kerykeion/
    
    GET: Devuelve la última carta natal calculada
    POST: Calcula nueva carta natal usando datos del perfil del paciente
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get(self, request, id):
        """
        Obtiene la última carta natal calculada para el paciente
        
        Returns:
            200: Carta natal normalizada
            404: No se ha calculado ninguna carta natal aún
        """
        try:
            # Verificar acceso al paciente
            try:
                patient = Patient.objects.get(
                    id=id,
                    therapist=request.user
                )
            except Patient.DoesNotExist:
                return Response(
                    {'error': 'Paciente no encontrado o no tienes acceso'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Buscar la última carta natal
            try:
                natal_chart = AstrologyNatalChart.objects.get(patient=patient)
            except AstrologyNatalChart.DoesNotExist:
                return Response(
                    {
                        'error': 'No se ha calculado ninguna carta natal para este paciente',
                        'message': 'Usa POST para calcular la carta natal por primera vez'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Devolver payload normalizado
            response_data = {
                'status': 'ok',
                'calculated_at': natal_chart.calculated_at.isoformat(),
                'house_system': natal_chart.house_system,
                'zodiac_type': (natal_chart.input_snapshot or {}).get('zodiac_type', 'tropical'),
                'source': natal_chart.source,
                'chart': natal_chart.chart_payload
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error inesperado en GET KerykeionAnalysisView para paciente {id}: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request, id):
        """
        Calcula carta natal usando datos del perfil del paciente
        
        Flujo:
        1. Verificar permisos y acceso
        2. Validar que el perfil tenga todos los datos requeridos
        3. Construir input desde el perfil (NO desde request)
        4. Ejecutar Kerykeion
        5. Normalizar output
        6. Persistir en AstrologyNatalChart
        7. Retornar payload normalizado
        
        Returns:
            200: Carta natal calculada y normalizada
            400: Faltan datos en el perfil del paciente
            500: Error en el cálculo
        """
        try:
            # Verificar acceso al paciente
            try:
                patient = Patient.objects.get(
                    id=id,
                    therapist=request.user
                )
            except Patient.DoesNotExist:
                return Response(
                    {'error': 'Paciente no encontrado o no tienes acceso'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Validar que el perfil tenga todos los datos requeridos
            missing_fields = []
            
            if not patient.birth_date:
                missing_fields.append('birth_date')
            if not patient.birth_time:
                missing_fields.append('birth_time')
            if not patient.birth_city:
                missing_fields.append('birth_city')
            if not patient.birth_country:
                missing_fields.append('birth_country')
            if patient.birth_latitude is None:
                missing_fields.append('birth_latitude')
            if patient.birth_longitude is None:
                missing_fields.append('birth_longitude')
            if not patient.birth_timezone:
                missing_fields.append('birth_timezone')
            
            if missing_fields:
                return Response(
                    {
                        'error': 'El perfil del paciente no tiene todos los datos requeridos',
                        'missing_fields': missing_fields,
                        'message': 'Por favor completa el perfil del paciente antes de calcular la carta natal'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Normalizar parámetros opcionales desde request (birth data siempre desde perfil)
            from .astrology_kerykeion.params import normalize_params

            try:
                params = normalize_params(
                    house_system=request.data.get('house_system'),
                    zodiac_type=request.data.get('zodiac_type'),
                    zodiac_system=request.data.get('zodiac_system'),
                    ayanamsha=request.data.get('ayanamsha'),
                )
            except ValueError as e:
                return Response(
                    {'error': 'Parámetros inválidos', 'details': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Construir input desde el perfil del paciente
            input_data_dict = {
                'birth_date': patient.birth_date.strftime('%Y-%m-%d'),
                'birth_time': patient.birth_time.strftime('%H:%M'),
                'location': {
                    'city': patient.birth_city,
                    'country': patient.birth_country,
                    'lat': float(patient.birth_latitude),
                    'lng': float(patient.birth_longitude),
                    'timezone': patient.birth_timezone
                },
                # Persist canonical house system name (e.g. 'placidus')
                'house_system': params.house_system_name,
                # Backward-compatible field for schema
                'zodiac_system': 'sidereal' if params.zodiac_type == 'sidereal' else 'tropical',
                # Preferred field
                'zodiac_type': params.zodiac_type,
                'ayanamsha': params.ayanamsha,
                'engine': 'kerykeion',
                'engine_version': '1.0.0'
            }
            
            # Validar con schema
            try:
                input_schema = KerykeionInputSchema(**input_data_dict)
            except ValidationError as e:
                logger.error(f"Error validando input Kerykeion para paciente {id}: {str(e)}", exc_info=True)
                return Response(
                    {
                        'error': 'Error en los datos del perfil del paciente',
                        'details': str(e)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Ejecutar Kerykeion
            try:
                kerykeion_result = execute_kerykeion(input_schema)
                kerykeion_result_dict = kerykeion_result.model_dump()
            except Exception as e:
                logger.error(f"Error ejecutando Kerykeion para paciente {id}: {str(e)}", exc_info=True)
                
                # Guardar error en modelo
                AstrologyNatalChart.objects.update_or_create(
                    patient=patient,
                    defaults={
                        'created_by': request.user,
                        'house_system': input_data_dict['house_system'],
                        'source': 'kerykeion',
                        'status': 'error',
                        'chart_payload': {},
                        'input_snapshot': input_data_dict,
                        'error_payload': {
                            'error': str(e),
                            'type': type(e).__name__
                        }
                    }
                )
                
                return Response(
                    {
                        'error': 'Error al calcular carta natal',
                        'message': 'Por favor verifica los datos de nacimiento del paciente'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Normalizar output
            try:
                normalized_chart = normalize_kerykeion_output(
                    kerykeion_result_dict,
                    input_data_dict
                )
            except Exception as e:
                logger.error(f"Error normalizando output Kerykeion para paciente {id}: {str(e)}", exc_info=True)
                return Response(
                    {'error': 'Error al procesar los resultados del cálculo'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Persistir en AstrologyNatalChart (update_or_create para sobrescribir si existe)
            try:
                natal_chart, created = AstrologyNatalChart.objects.update_or_create(
                    patient=patient,
                    defaults={
                        'created_by': request.user,
                        'house_system': input_data_dict['house_system'],
                        'source': 'kerykeion',
                        'status': 'ok',
                        'chart_payload': normalized_chart,
                        'input_snapshot': input_data_dict,
                        'error_payload': None
                    }
                )
                
                action = 'creada' if created else 'actualizada'
                logger.info(f"Carta natal {action} para paciente {patient.id} por terapeuta {request.user.id}")
                
            except Exception as e:
                logger.error(f"Error persistiendo carta natal para paciente {id}: {str(e)}", exc_info=True)
                return Response(
                    {'error': 'Error al guardar la carta natal'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Retornar payload normalizado
            response_data = {
                'status': 'ok',
                'calculated_at': natal_chart.calculated_at.isoformat(),
                'house_system': natal_chart.house_system,
                'zodiac_type': (natal_chart.input_snapshot or {}).get('zodiac_type', 'tropical'),
                'source': natal_chart.source,
                'chart': normalized_chart
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error inesperado en POST KerykeionAnalysisView para paciente {id}: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class KabbalahInterpretationView(APIView):
    """
    PoC endpoint para interpretación cabalística profunda (Kabbalah).
    Ruta: POST /api/therapist/patients/<id>/interpretation/kabbalah/

    POST: Ejecuta e intenta persistir el análisis.
    GET: Devuelve la última interpretación kabbalística calculada para el paciente si existe.
    """
    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request, id):
        try:
            patient = Patient.objects.get(id=id, therapist=request.user)
        except Patient.DoesNotExist:
            return Response({'error': 'Paciente no encontrado o no tienes acceso'}, status=status.HTTP_404_NOT_FOUND)

        # Buscar último AnalysisRecord de kind=kabbalah
        try:
            record = AnalysisRecord.objects.filter(kind='kabbalah', patient=patient).order_by('-created_at').first()
        except OperationalError as e:
            # En algunos entornos de prueba el esquema puede estar desactualizado (columna faltante).
            # Capturamos el error y devolvemos un 404 para mantener la compatibilidad y permitir el fallback.
            logger.error(f"Error al acceder a AnalysisRecord (posible esquema desactualizado): {e}", exc_info=True)
            record = None

        if not record or not record.computed_result:
            return Response({'error': 'No se ha encontrado ninguna interpretación kabbalística para este paciente'}, status=status.HTTP_404_NOT_FOUND)

        ke = (record.computed_result or {}).get('kabbalah_engine')
        if not ke:
            return Response({'error': 'La interpretación existe pero el motor kabbalístico no generó salidas'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'success': True, 'kabbalah_engine': ke, 'record_id': str(record.id)}, status=status.HTTP_200_OK)

    def post(self, request, id):
        try:
            # Obtener paciente y validar ownership
            try:
                patient = Patient.objects.get(id=id, therapist=request.user)
            except Patient.DoesNotExist:
                return Response({'error': 'Paciente no encontrado o no tienes acceso'}, status=status.HTTP_404_NOT_FOUND)

            # Validaciones mínimas para PoC
            missing = []
            if not patient.full_name:
                missing.append('full_name')
            if not patient.birth_date:
                missing.append('birth_date')

            if missing:
                return Response({
                    'error': 'Faltan campos requeridos en el perfil del paciente',
                    'missing_fields': missing
                }, status=status.HTTP_400_BAD_REQUEST)

            # Construir birth_data_snapshot
            birth_snapshot = {
                'legal_name': patient.full_name,
                'birth_date': patient.birth_date.strftime('%Y-%m-%d'),
                'birth_time': patient.birth_time.strftime('%H:%M') if patient.birth_time else '',
                'city': patient.birth_city or '',
                'country': patient.birth_country or '',
                'lat': float(patient.birth_latitude) if patient.birth_latitude is not None else None,
                'lng': float(patient.birth_longitude) if patient.birth_longitude is not None else None,
                'timezone': patient.birth_timezone or '',
                'geocode_source': 'patient_profile'
            }

            # Para esta PoC requerimos coordenadas explícitas en el perfil (no intento de geocoding automático)
            if birth_snapshot['lat'] is None or birth_snapshot['lng'] is None:
                return Response(
                    {'error': 'El perfil del paciente debe incluir latitud y longitud para interpretación cabalística en esta fase.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            raw_input = request.data.get('raw_input', {}) or {}
            sistema = raw_input.get('sistema', 'dshevastan')

            algo_snapshot = {
                'engine': 'kabbalah_adapter',
                'version': '1.0.0',
                'params': {
                    'sistema': sistema
                }
            }

            record_payload = {
                'kind': 'kabbalah',
                'module_code': 'kabbalah_core',
                'role_context': 'therapist',
                'birth_data_snapshot': birth_snapshot,
                'algorithm_snapshot': algo_snapshot,
                'raw_input': raw_input,
                'patient': patient,
                'therapist': request.user,
                'created_by_user': request.user,
                'visibility': 'therapist',
            }

            # Intentamos persistir el AnalysisRecord; en caso de fallo (entorno de pruebas o migraciones)
            # caemos a un modo PoC no persistente que ejecuta directamente el adapter para devolver resultados.
            try:
                record = create_and_execute_analysis(record_payload)

                # Integrate deterministic PoC engine outputs into computed_result
                try:
                    natal = None
                    if record.computed_result and isinstance(record.computed_result, dict):
                        natal = record.computed_result.get('profile') or record.computed_result
                    elif record.legacy_output and isinstance(record.legacy_output, dict):
                        natal = record.legacy_output.get('profile') or record.legacy_output

                    if natal:
                        names_scores = score_72_names(natal)
                        tikun_signals = compute_tikun_signals(natal)
                        # Attach under a clear namespace
                        cr = record.computed_result or {}
                        cr['kabbalah_engine'] = {
                            '72_names': names_scores,
                            'tikun_signals': tikun_signals,
                        }
                        record.computed_result = cr
                        record.save(update_fields=['computed_result'])
                except Exception:
                    logger.exception('Error integrando outputs del motor Kabbalah PoC')

                serializer = AnalysisRecordSerializer(record, context={'request': request})
                return Response({'success': True, 'record': serializer.data}, status=status.HTTP_200_OK)

            except Exception as e:
                logger.warning('No se pudo persistir AnalysisRecord (PoC fallback): %s', e)
                # Fallback: execute adapter directly without saving
                from types import SimpleNamespace
                from .adapters.kabbalah_adapter import KabbalahAdapter

                fake_record = SimpleNamespace(
                    birth_data_snapshot=birth_snapshot,
                    raw_input=raw_input,
                    algorithm_snapshot=algo_snapshot,
                    created_by_user=request.user,
                    patient=patient,
                )

                try:
                    adapter = KabbalahAdapter(fake_record)
                    outputs = adapter.execute()
                except Exception as e2:
                    logger.exception('Error ejecutando adapter Kabbalah en modo fallback')
                    return Response({'error': 'Error ejecutando interpretación cabalística (fallback)', 'details': str(e2)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                # Compute engine outputs from adapter result
                try:
                    natal = outputs.get('computed_result', {}) or outputs.get('legacy_output', {})
                    profile = natal.get('profile') if isinstance(natal, dict) else natal
                    names_scores = score_72_names(profile or {})
                    tikun_signals = compute_tikun_signals(profile or {})
                except Exception:
                    logger.exception('Error ejecutando motor kabbalah en fallback')
                    names_scores = {}
                    tikun_signals = []

                # Normalizar respuesta para mantener la forma 'record' esperada por clientes
                minimal_record = {
                    'kind': 'kabbalah',
                    'module_code': 'kabbalah_core',
                    'patient': {'id': patient.id, 'full_name': patient.full_name},
                    'therapist': {'id': request.user.id, 'username': request.user.username},
                    'birth_snapshot': birth_snapshot,
                    'computed_result': outputs.get('computed_result'),
                    'legacy_output': outputs.get('legacy_output'),
                }

                # Attach engine outputs to minimal record
                minimal_record['computed_result'] = minimal_record.get('computed_result') or {}
                minimal_record['computed_result']['kabbalah_engine'] = {
                    '72_names': names_scores,
                    'tikun_signals': tikun_signals,
                }

                return Response({'success': True, 'record': minimal_record}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception('Error inesperado en KabbalahInterpretationView')
            return Response({'error': 'Error interno del servidor'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class CrossoverSynthesisView(APIView):
    """
    Endpoint para generar y guardar síntesis cruzada
    Ruta: POST /api/therapist/patients/<id>/crossover/generate-and-save/
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request, id):
        """
        Genera síntesis cruzada de TestResult y CabalisticAnalysis
        y la guarda como nuevo CabalisticAnalysis con analysis_type='crossover'
        
        Flujo:
        1. Validar acceso al paciente
        2. Ejecutar motor de síntesis
        3. Guardar en CabalisticAnalysis
        4. Retornar analysis_id
        """
        try:
            # Obtener el paciente (solo si es del terapeuta actual)
            try:
                patient = Patient.objects.get(
                    id=id,
                    therapist=request.user
                )
            except Patient.DoesNotExist:
                logger.warning(f"Paciente {id} no encontrado o sin acceso para usuario {request.user.id}")
                return Response(
                    {'error': 'Paciente no encontrado o no tienes acceso'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Ejecutar motor de síntesis
            try:
                engine = SynthesisEngine(patient=patient, therapist=request.user)
                synthesis_result = engine.generate_synthesis()
            except ValueError:
                logger.warning(f"Error de validacion en sintesis para paciente {id}", exc_info=True)
                return Response(
                    {'error': 'Datos invalidos para generar sintesis'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception:
                logger.error(f"Error ejecutando sintesis cruzada para paciente {id}", exc_info=True)
                return Response(
                    {'error': 'Error al generar sintesis cruzada'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Guardar en CabalisticAnalysis
            try:
                result_data = synthesis_result.to_result_data()
                
                # Construir summary
                signals = result_data.get('signals', {})
                primary_clinical = signals.get('primary_clinical', {})
                primary_symbolic = signals.get('primary_symbolic', {})
                
                summary_parts = []
                if primary_clinical:
                    summary_parts.append(f"{primary_clinical.get('test_name', 'Test')}: {primary_clinical.get('severity', 'N/A')}")
                if primary_symbolic:
                    summary_parts.append(f"{primary_symbolic.get('analysis_type', 'Análisis')}")
                
                summary = " | ".join(summary_parts) if summary_parts else "Síntesis cruzada"
                
                # Construir input_data con trazabilidad
                input_data = {
                    'sources_count': len(synthesis_result.sources),
                    'clinical_sources': len([s for s in synthesis_result.sources if s.type == 'clinical']),
                    'symbolic_sources': len([s for s in synthesis_result.sources if s.type == 'symbolic']),
                    'source_ids': {
                        'test_results': [
                            s.signal.source_id for s in synthesis_result.sources
                            if s.type == 'clinical'
                        ],
                        'cabalistic_analyses': [
                            s.signal.source_id for s in synthesis_result.sources
                            if s.type == 'symbolic'
                        ]
                    }
                }
                
                analysis = CabalisticAnalysis.objects.create(
                    therapist=request.user,
                    patient=patient,
                    analysis_type='crossover',
                    input_data=input_data,
                    result_data=result_data,
                    summary=summary,
                    therapist_notes='Generado automáticamente por Motor de Síntesis Cruzada'
                )
                
                logger.info(
                    f"Síntesis cruzada creada: ID {analysis.id} para paciente {patient.id} "
                    f"por terapeuta {request.user.id} con {len(synthesis_result.sources)} fuentes"
                )
                
            except Exception:
                logger.error(f"Error guardando sintesis cruzada para paciente {id}", exc_info=True)
                return Response(
                    {'error': 'Error al guardar la sintesis'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Retornar analysis_id
            return Response(
                {
                    'analysis_id': analysis.id,
                    'status': 'ok',
                    'sources_count': len(synthesis_result.sources),
                    'conflicts_count': len(synthesis_result.conflicts),
                    'strengths_count': len(synthesis_result.strengths),
                    'recommendations_count': len(synthesis_result.recommendations)
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception:
            logger.error(f"Error inesperado en CrossoverSynthesisView para paciente {id}", exc_info=True)
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


