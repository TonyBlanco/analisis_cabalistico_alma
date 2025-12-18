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
import logging
from .models import Patient, CabalisticAnalysis
from .utils.tarot_service import analyze_archetype_vs_clinical
from .astrology_kerykeion.service import execute_kerykeion
from .astrology_kerykeion.schemas import KerykeionInputSchema
from .permissions import IsTherapist
from .synthesis_engine import SynthesisEngine
from pydantic import ValidationError

logger = logging.getLogger(__name__)


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
    Endpoint para calcular y guardar análisis Kerykeion
    Ruta: POST /api/therapist/patients/<id>/astrology-kerykeion/
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request, id):
        """
        Calcula carta natal técnica Kerykeion y la guarda en CabalisticAnalysis
        
        Flujo:
        1. Validar input
        2. Ejecutar Kerykeion
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
                return Response(
                    {'error': 'Paciente no encontrado o no tienes acceso'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Validar datos de entrada
            try:
                input_schema = KerykeionInputSchema(**request.data)
            except ValidationError:
                logger.error(f"Error validando input Kerykeion para paciente {id}", exc_info=True)
                return Response(
                    {'error': 'Datos de entrada invalidos'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception:
                logger.error(f"Error inesperado validando input Kerykeion para paciente {id}", exc_info=True)
                return Response(
                    {'error': 'Datos de entrada invalidos'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Ejecutar Kerykeion
            try:
                result = execute_kerykeion(input_schema)
            except Exception:
                logger.error(f"Error ejecutando Kerykeion para paciente {id}", exc_info=True)
                return Response(
                    {'error': 'Error al calcular carta natal. Por favor, verifica los datos de entrada.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Guardar en CabalisticAnalysis
            try:
                result_dict = result.model_dump()
                houses_dict = result_dict.get('houses', {})
                asc_sign = houses_dict.get('1', {}).get('sign', 'N/A') if houses_dict else 'N/A'
                mc_sign = houses_dict.get('10', {}).get('sign', 'N/A') if houses_dict else 'N/A'
                
                analysis = CabalisticAnalysis.objects.create(
                    therapist=request.user,
                    patient=patient,
                    analysis_type='astrology-kerykeion',
                    input_data=input_schema.model_dump(),
                    result_data=result_dict,
                    summary=f"Kerykeion {result.engine_version}: ASC {asc_sign} - MC {mc_sign}",
                    therapist_notes='Generado automáticamente por Módulo Kerykeion - Fuente técnica objetiva'
                )
                
                logger.info(f"Análisis Kerykeion creado: ID {analysis.id} para paciente {patient.id} por terapeuta {request.user.id}")
                
            except Exception:
                logger.error(f"Error guardando analisis Kerykeion para paciente {id}", exc_info=True)
                return Response(
                    {'error': 'Error al guardar el analisis'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Retornar analysis_id (formato limpio)
            return Response(
                {
                    'analysis_id': analysis.id,
                    'status': 'ok'
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception:
            logger.error(f"Error inesperado en KerykeionAnalysisView para paciente {id}", exc_info=True)
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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


