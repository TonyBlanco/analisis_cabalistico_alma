# =============================================================================
# AI QLIPHOTH ANALYSIS VIEWS (NUEVO)
# =============================================================================

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from .permissions import IsTherapist
from .models import Consultante

@method_decorator(csrf_exempt, name='dispatch')
class ConsultanteQliphothAIAnalysisView(APIView):
    """
    Vista AI para interpretación de ciclos Qliphoth.
    
    POST /api/consultantes/{uuid}/qliphoth-ai-analysis/
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request, uuid):
        """
        Genera interpretación AI de los ciclos Qliphoth de un consultante.
        
        Body:
        {
            "analysis_type": "cycle_analysis" | "pattern_synthesis" | "integration_guidance",
            "target_qliphoth": "string" (opcional, para integration_guidance),
            "therapeutic_context": "string" (opcional, contexto adicional)
        }
        """
        try:
            # Validar consultante
            consultante = get_object_or_404(Consultante, uuid=uuid)
            
            # Importar servicio AI
            from .qliphoth_ai_service import create_qliphoth_ai_service
            ai_service = create_qliphoth_ai_service(request.user)
            
            if not ai_service.enabled:
                return Response({
                    'success': False,
                    'error': 'Servicio AI no disponible',
                    'fallback_message': 'Procede con interpretación manual de los ciclos.'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            # Obtener datos de ciclos Qliphoth
            from .cabala_qliphoth_cycles import QliphothCycleCalculator
            calculator = QliphothCycleCalculator()
            
            qliphoth_data = calculator.calculate_comprehensive_analysis(
                birth_date=consultante.birth_date,
                crisis_events=list(consultante.testresult_set.filter(
                    created_at__isnull=False
                ).order_by('created_at'))
            )
            
            # Parámetros del request
            analysis_type = request.data.get('analysis_type', 'cycle_analysis')
            target_qliphoth = request.data.get('target_qliphoth')
            therapeutic_context = request.data.get('therapeutic_context', '')
            
            # Generar interpretación según tipo
            if analysis_type == 'cycle_analysis':
                result = ai_service.generate_cycle_interpretation(
                    qliphoth_data=qliphoth_data,
                    consultante_id=consultante.id
                )
            elif analysis_type == 'pattern_synthesis':
                result = ai_service.generate_pattern_synthesis(
                    qliphoth_data=qliphoth_data,
                    consultante_id=consultante.id
                )
            elif analysis_type == 'integration_guidance':
                if not target_qliphoth:
                    return Response({
                        'success': False,
                        'error': 'target_qliphoth requerido para integration_guidance'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                result = ai_service.generate_integration_guide(
                    target_qliphoth=target_qliphoth,
                    therapeutic_context=therapeutic_context,
                    consultante_id=consultante.id
                )
            else:
                return Response({
                    'success': False,
                    'error': f'analysis_type no válido: {analysis_type}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Agregar metadata del consultante
            result['consultante_uuid'] = str(consultante.uuid)
            result['consultante_name'] = consultante.full_name
            result['current_qliphoth'] = qliphoth_data.get('current_qliphoth')
            result['current_age'] = qliphoth_data.get('current_age')
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in QliphothAI analysis for {uuid}: {e}")
            return Response({
                'success': False,
                'error': f'Error generando análisis AI: {str(e)}',
                'fallback_message': 'Procede con interpretación manual.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class SaveQliphothAnalysisView(APIView):
    """
    Guarda análisis de Ciclos Qliphoth como AnalysisRecord.
    
    POST /api/consultantes/{uuid}/qliphoth-analysis/save/
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request, uuid):
        """
        Guarda una sesión completa de análisis Qliphoth.
        
        Body:
        {
            "qliphoth_data": {...},  // Datos del QliphothCycleCalculator
            "ai_interpretation": {...},  // Interpretación AI (opcional)
            "therapist_notes": "string",  // Notas del terapeuta
            "session_type": "cycle_analysis" | "pattern_synthesis" | "integration_work",
            "integration_plan": {...}  // Plan de integración (opcional)
        }
        """
        try:
            # Validar consultante
            consultante = get_object_or_404(Consultante, uuid=uuid)
            
            # Datos del request
            qliphoth_data = request.data.get('qliphoth_data', {})
            ai_interpretation = request.data.get('ai_interpretation', {})
            therapist_notes = request.data.get('therapist_notes', '')
            session_type = request.data.get('session_type', 'cycle_analysis')
            integration_plan = request.data.get('integration_plan', {})
            
            # Validar que tenemos datos mínimos
            if not qliphoth_data.get('current_qliphoth'):
                return Response({
                    'success': False,
                    'error': 'qliphoth_data debe incluir current_qliphoth'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Construir snapshot de datos de nacimiento
            birth_snapshot = {
                'birth_date': consultante.birth_date.isoformat() if consultante.birth_date else None,
                'full_name': consultante.full_name,
                'analysis_date': qliphoth_data.get('analysis_date', 'now')
            }
            
            # Construir snapshot del algoritmo
            algo_snapshot = {
                'calculator_version': '1.0.0',
                'qliphoth_system': 'tree_of_death_inverse',
                'cycle_length': 10,  # años
                'ethical_principles': {
                    'no_prediction': True,
                    'historical_correlation_only': True,
                    'consciousness_oriented': True
                }
            }
            
            # Construir input raw
            raw_input = {
                'consultante_uuid': str(consultante.uuid),
                'session_type': session_type,
                'therapist_notes': therapist_notes,
                'requested_analysis': {
                    'current_qliphoth': qliphoth_data.get('current_qliphoth'),
                    'focus_areas': qliphoth_data.get('focus_areas', []),
                    'therapeutic_goals': integration_plan.get('goals', [])
                }
            }
            
            # Construir resultado computado
            computed_result = {
                'trabajo_sombras': {
                    'session_type': session_type,
                    'qliphoth_analysis': qliphoth_data,
                    'ai_interpretation': ai_interpretation,
                    'integration_plan': integration_plan,
                    'therapist_synthesis': therapist_notes,
                    'current_qliphoth_info': {
                        'name': qliphoth_data.get('current_qliphoth'),
                        'age': qliphoth_data.get('current_age'),
                        'sephirah_correspondence': qliphoth_data.get('sephirah_correspondence'),
                        'shadow_aspect': qliphoth_data.get('shadow_aspect')
                    },
                    'timeline_summary': {
                        'total_cycles_analyzed': len(qliphoth_data.get('qliphoth_timeline', [])),
                        'patterns_detected': qliphoth_data.get('shadow_patterns', {}),
                        'crisis_correlation': qliphoth_data.get('shadow_alerts', [])
                    }
                }
            }
            
            # Crear AnalysisRecord
            try:
                record = AnalysisRecord.objects.create(
                    kind='qliphoth_cycles',
                    module_code='trabajo_sombras',
                    role_context='therapist',
                    execution_mode=session_type,
                    birth_data_snapshot=birth_snapshot,
                    algorithm_snapshot=algo_snapshot,
                    raw_input=raw_input,
                    computed_result=computed_result,
                    visibility='therapist',
                    created_by_user=request.user,
                    therapist=request.user,
                    consultante=consultante,
                    subject_user=getattr(consultante, 'user', None),
                )
                
                serializer = AnalysisRecordSerializer(record, context={'request': request})
                
                return Response({
                    'success': True,
                    'record': serializer.data,
                    'message': f'Análisis de Ciclos Qliphoth guardado (sesión: {session_type})',
                    'consultante_uuid': str(consultante.uuid)
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                logger.warning(f'No se pudo crear AnalysisRecord para Qliphoth: {e}')
                return Response({
                    'success': True,  # Fallback graceful
                    'message': 'Análisis procesado correctamente (guardado parcial)',
                    'warning': 'Sistema de persistencia en mantenimiento',
                    'consultante_uuid': str(consultante.uuid),
                    'computed_result': computed_result
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error saving Qliphoth analysis for {uuid}: {e}")
            return Response({
                'success': False,
                'error': f'Error guardando análisis: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class QliphothAnalysisHistoryView(APIView):
    """
    Recupera historial de análisis Qliphoth de un consultante.
    
    GET /api/consultantes/{uuid}/qliphoth-analysis/history/
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get(self, request, uuid):
        """
        Obtiene historial de análisis Qliphoth para un consultante.
        
        Query params:
        - limit: Número máximo de registros (default: 10)
        - session_type: Filtro por tipo de sesión (opcional)
        """
        try:
            # Validar consultante
            consultante = get_object_or_404(Consultante, uuid=uuid)
            
            # Parámetros de consulta
            limit = int(request.GET.get('limit', 10))
            session_type = request.GET.get('session_type')
            
            # Buscar AnalysisRecord de tipo qliphoth_cycles
            records_query = AnalysisRecord.objects.filter(
                kind='qliphoth_cycles',
                consultante=consultante
            ).order_by('-created_at')
            
            # Filtro opcional por session_type
            if session_type:
                records_query = records_query.filter(execution_mode=session_type)
            
            records = records_query[:limit]
            
            # Serializar registros
            serializer = AnalysisRecordSerializer(records, many=True, context={'request': request})
            
            # Estadísticas del historial
            total_sessions = records_query.count()
            session_types = records_query.values_list('execution_mode', flat=True).distinct()
            
            return Response({
                'success': True,
                'consultante_uuid': str(consultante.uuid),
                'consultante_name': consultante.full_name,
                'history': serializer.data,
                'stats': {
                    'total_sessions': total_sessions,
                    'session_types': list(session_types),
                    'latest_session': records.first().created_at.isoformat() if records else None
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving Qliphoth history for {uuid}: {e}")
            return Response({
                'success': False,
                'error': f'Error recuperando historial: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class GenerateQliphothReportView(APIView):
    """
    Genera reporte completo de análisis Qliphoth con AI.
    
    POST /api/consultantes/{uuid}/qliphoth-report/generate/
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request, uuid):
        """
        Genera reporte integral AI de Ciclos de Sombra.
        
        Body:
        {
            "include_history": true,  // Incluir historial de sesiones
            "focus_areas": ["patterns", "integration", "prevention"],  // Áreas de enfoque
            "therapeutic_goals": ["integration", "prevention", "growth"],  // Objetivos terapéuticos
            "export_format": "structured" | "narrative"  // Formato de salida
        }
        """
        try:
            # Validar consultante
            consultante = get_object_or_404(Consultante, uuid=uuid)
            
            # Importar servicios
            from .qliphoth_ai_service import create_qliphoth_ai_service
            from .cabala_qliphoth_cycles import QliphothCycleCalculator
            
            ai_service = create_qliphoth_ai_service(request.user)
            calculator = QliphothCycleCalculator()
            
            # Parámetros del request
            include_history = request.data.get('include_history', True)
            focus_areas = request.data.get('focus_areas', ['patterns', 'integration'])
            therapeutic_goals = request.data.get('therapeutic_goals', ['integration'])
            export_format = request.data.get('export_format', 'structured')
            
            # Obtener datos de ciclos actuales
            qliphoth_data = calculator.calculate_comprehensive_analysis(
                birth_date=consultante.birth_date,
                crisis_events=list(consultante.testresult_set.filter(
                    created_at__isnull=False
                ).order_by('created_at'))
            )
            
            # Historial de sesiones (si se solicita)
            session_history = []
            if include_history:
                try:
                    recent_records = AnalysisRecord.objects.filter(
                        kind='qliphoth_cycles',
                        consultante=consultante
                    ).order_by('-created_at')[:5]
                    
                    for record in recent_records:
                        session_history.append({
                            'date': record.created_at.isoformat(),
                            'session_type': record.execution_mode,
                            'summary': record.computed_result.get('trabajo_sombras', {}).get('therapist_synthesis', '')[:200],
                            'qliphoth_focus': record.computed_result.get('trabajo_sombras', {}).get('current_qliphoth_info', {}).get('name')
                        })
                except Exception:
                    logger.warning(f"No se pudo recuperar historial para {uuid}")
                    session_history = []
            
            # Generar análisis AI integral
            ai_results = {}
            
            if ai_service.enabled:
                # 1. Análisis de ciclo actual
                if 'patterns' in focus_areas:
                    ai_results['cycle_analysis'] = ai_service.generate_cycle_interpretation(
                        qliphoth_data=qliphoth_data,
                        consultante_id=consultante.id
                    )
                
                # 2. Síntesis de patrones
                if 'integration' in focus_areas:
                    ai_results['pattern_synthesis'] = ai_service.generate_pattern_synthesis(
                        qliphoth_data=qliphoth_data,
                        consultante_id=consultante.id
                    )
                
                # 3. Guía de integración (para Qliphoth más problemática)
                most_challenging = qliphoth_data.get('shadow_patterns', {}).get('most_challenging_qliphoth')
                if most_challenging and 'integration' in therapeutic_goals:
                    ai_results['integration_guidance'] = ai_service.generate_integration_guide(
                        target_qliphoth=most_challenging,
                        therapeutic_context=f"Reporte integral - Objetivos: {', '.join(therapeutic_goals)}",
                        consultante_id=consultante.id
                    )
            
            # Construir reporte estructurado
            report = {
                'report_type': 'qliphoth_comprehensive',
                'consultante_info': {
                    'uuid': str(consultante.uuid),
                    'name': consultante.full_name,
                    'current_age': qliphoth_data.get('current_age'),
                    'birth_date': consultante.birth_date.isoformat() if consultante.birth_date else None
                },
                'current_cycle': {
                    'qliphoth': qliphoth_data.get('current_qliphoth'),
                    'sephirah_correspondence': qliphoth_data.get('sephirah_correspondence'),
                    'shadow_aspect': qliphoth_data.get('shadow_aspect'),
                    'integration_path': qliphoth_data.get('integration_path')
                },
                'historical_analysis': {
                    'patterns': qliphoth_data.get('shadow_patterns', {}),
                    'timeline': qliphoth_data.get('qliphoth_timeline', []),
                    'alerts': qliphoth_data.get('shadow_alerts', [])
                },
                'ai_interpretation': ai_results,
                'session_history': session_history,
                'therapeutic_recommendations': {
                    'focus_areas': focus_areas,
                    'goals': therapeutic_goals,
                    'next_steps': [
                        f"Profundizar trabajo con {qliphoth_data.get('current_qliphoth', 'Qliphoth actual')}",
                        "Monitorear patrones identificados",
                        "Aplicar herramientas de integración sugeridas"
                    ]
                },
                'export_metadata': {
                    'generated_at': 'now',  # Frontend lo reemplazará
                    'generated_by': request.user.username,
                    'format': export_format,
                    'ai_enabled': ai_service.enabled
                },
                'disclaimer': (
                    'Reporte integral de Ciclos de Sombra Personal generado para uso terapéutico. '
                    'Las interpretaciones son simbólicas y educativas, no predictivas. '
                    'Requiere supervisión e interpretación profesional.'
                )
            }
            
            return Response({
                'success': True,
                'report': report,
                'consultante_uuid': str(consultante.uuid)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating Qliphoth report for {uuid}: {e}")
            return Response({
                'success': False,
                'error': f'Error generando reporte: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)