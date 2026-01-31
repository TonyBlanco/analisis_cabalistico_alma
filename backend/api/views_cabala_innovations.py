"""
views_cabala_innovations.py - API Views para las 4 Innovaciones Cabalísticas

Endpoints:
1. /api/cabala/sincronias/ - Detector de Sincronías Biográficas
2. /api/cabala/alertas-preventivas/ - Alertas Preventivas Éticas
3. /api/cabala/exportacion-narrativa/ - Exportación Narrativa Hermosa
4. /api/cabala/calendario-cosmico/ - Conexión Calendario Lunar/Solar

Todos los endpoints requieren autenticación y datos del consultante.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from datetime import date, datetime
from typing import Dict, Any, List, Optional
import logging

# Importar los motores
from .cabala_sincronias_biograficas import SincroniaBiograficaDetector
from .cabala_alertas_preventivas import AlertasPreventivasManager
from .cabala_exportacion_narrativa import ExportacionNarrativaGenerator
from .cabala_calendario_cosmico import CalendarioCosmicoCabala
from .cabala_laboratorio_nombres import LaboratorioNombres
from .cabala_meditaciones_personalizadas import MeditacionesPersonalizadas
from .cabala_arbol_vivo import ArbolVivo

logger = logging.getLogger(__name__)


class CabalaSincroniasView(APIView):
    """
    INNOVACIÓN 7: Detector de Sincronías Biográficas
    
    POST /api/cabala/sincronias/
    
    Detecta coincidencias significativas en la línea temporal biográfica.
    Ejemplos: "Hace 9, 18 y 27 años hubo pérdidas - todas en transición Tiferet→Netzach"
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Detecta sincronías en eventos biográficos"""
        try:
            # Validar datos requeridos
            birth_date_str = request.data.get('birth_date')
            events = request.data.get('events', [])
            
            if not birth_date_str:
                return Response(
                    {'error': 'Se requiere birth_date'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not events or not isinstance(events, list):
                return Response(
                    {'error': 'Se requiere una lista de events'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Parsear fecha de nacimiento
            try:
                birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Formato de birth_date inválido. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar y parsear eventos
            parsed_events = self._parse_events(events)
            
            # Detectar sincronías
            detector = SincroniaBiograficaDetector()
            result = detector.detect_sincronias(
                birth_date=birth_date,
                events=parsed_events
            )
            
            return Response({
                'success': True,
                'sincronias': result,
                'generated_at': datetime.now().isoformat(),
                'disclaimer': (
                    'Las sincronías son patrones observados para reflexión terapéutica. '
                    'No constituyen predicciones ni diagnósticos.'
                )
            })
            
        except Exception as e:
            logger.error(f"Error en sincronías biográficas: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _parse_events(self, events: List[Dict]) -> List[Dict]:
        """Parsea y valida eventos"""
        parsed = []
        for event in events:
            if 'date' not in event:
                continue
            
            try:
                event_date = datetime.strptime(event['date'], '%Y-%m-%d').date()
                parsed.append({
                    'date': event_date,
                    'type': event.get('type', 'unspecified'),
                    'description': event.get('description', ''),
                    'intensity': event.get('intensity', 5)
                })
            except (ValueError, TypeError):
                continue
        
        return parsed


class CabalaAlertasPreventivasView(APIView):
    """
    Alertas Preventivas Éticas
    
    POST /api/cabala/alertas-preventivas/
    
    Sistema de avisos basado en la historia propia del consultante.
    NO es predicción - es análisis de patrones personales.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Genera alertas preventivas"""
        try:
            # Validar datos requeridos
            birth_date_str = request.data.get('birth_date')
            events = request.data.get('events', [])
            target_date_str = request.data.get('target_date')
            months_ahead = request.data.get('months_ahead', 3)
            
            if not birth_date_str:
                return Response(
                    {'error': 'Se requiere birth_date'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Parsear fechas
            try:
                birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Formato de birth_date inválido. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            target_date = date.today()
            if target_date_str:
                try:
                    target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
                except ValueError:
                    pass
            
            # Parsear eventos
            parsed_events = self._parse_events(events)
            
            # Generar alertas
            manager = AlertasPreventivasManager()
            result = manager.generate_alerts(
                birth_date=birth_date,
                events=parsed_events,
                target_date=target_date,
                months_ahead=months_ahead
            )
            
            return Response({
                'success': True,
                'alertas': result,
                'generated_at': datetime.now().isoformat(),
                'ethical_disclaimer': (
                    'IMPORTANTE: Estas alertas se basan ÚNICAMENTE en patrones '
                    'observados en TU propia historia. No son predicciones. '
                    'Son recordatorios para prepararte basados en tu experiencia pasada.'
                )
            })
            
        except Exception as e:
            logger.error(f"Error en alertas preventivas: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _parse_events(self, events: List[Dict]) -> List[Dict]:
        """Parsea y valida eventos"""
        parsed = []
        for event in events:
            if 'date' not in event:
                continue
            
            try:
                event_date = datetime.strptime(event['date'], '%Y-%m-%d').date()
                parsed.append({
                    'date': event_date,
                    'type': event.get('type', 'unspecified'),
                    'description': event.get('description', ''),
                    'intensity': event.get('intensity', 5)
                })
            except (ValueError, TypeError):
                continue
        
        return parsed


class CabalaExportacionNarrativaView(APIView):
    """
    Exportación Narrativa Hermosa
    
    POST /api/cabala/exportacion-narrativa/
    
    Genera documentos narrativos hermosos:
    - Carta del Alma
    - Mapa del Viaje
    - Libro del Proceso
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Genera exportación narrativa"""
        try:
            # Validar datos requeridos
            export_type = request.data.get('type', 'soul_letter')
            name = request.data.get('name', 'Consultante')
            birth_date_str = request.data.get('birth_date')
            journey_data = request.data.get('journey_data', {})
            
            if not birth_date_str:
                return Response(
                    {'error': 'Se requiere birth_date'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Parsear fecha
            try:
                birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Formato de birth_date inválido. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar tipo de exportación
            valid_types = ['soul_letter', 'journey_map', 'process_book']
            if export_type not in valid_types:
                return Response(
                    {'error': f'Tipo inválido. Válidos: {valid_types}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generar exportación
            generator = ExportacionNarrativaGenerator()
            
            # Extract life_events from journey_data if present
            life_events = journey_data.get('life_events', [])
            process_summary = journey_data.get('process_summary', journey_data)
            
            if export_type == 'soul_letter':
                result = generator.generate_soul_letter(
                    consultante_name=name,
                    birth_date=birth_date,
                    process_summary=process_summary,
                    life_events=life_events
                )
            elif export_type == 'journey_map':
                result = generator.generate_journey_map(
                    consultante_name=name,
                    birth_date=birth_date,
                    life_events=life_events,
                    process_milestones=journey_data.get('milestones')
                )
            elif export_type == 'process_book':
                result = generator.generate_process_book(
                    consultante_name=name,
                    birth_date=birth_date,
                    complete_analysis=process_summary,
                    life_events=life_events,
                    test_results=journey_data.get('test_results'),
                    therapist_observations=journey_data.get('therapist_observations')
                )
            
            return Response({
                'success': True,
                'export_type': export_type,
                'document': result,
                'generated_at': datetime.now().isoformat(),
                'note': 'Este documento es una narrativa simbólica para acompañar tu proceso terapéutico.'
            })
            
        except Exception as e:
            logger.error(f"Error en exportación narrativa: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CabalaCalendarioCosmicView(APIView):
    """
    INNOVACIÓN 15: Conexión con Calendario Lunar/Solar Real
    
    GET /api/cabala/calendario-cosmico/
    GET /api/cabala/calendario-cosmico/lunar/
    GET /api/cabala/calendario-cosmico/anual/
    
    Sincroniza ciclos cabalísticos con astronomía real.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Obtiene contexto cósmico actual"""
        try:
            # Parámetros opcionales
            target_date_str = request.query_params.get('date')
            birth_date_str = request.query_params.get('birth_date')
            
            # Parsear fecha objetivo
            target_date = date.today()
            if target_date_str:
                try:
                    target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
                except ValueError:
                    pass
            
            # Parsear fecha de nacimiento
            birth_date = None
            if birth_date_str:
                try:
                    birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
                except ValueError:
                    pass
            
            # Obtener contexto
            calendar = CalendarioCosmicoCabala()
            context = calendar.get_cosmic_context(
                target_date=target_date,
                birth_date=birth_date
            )
            
            return Response({
                'success': True,
                'cosmic_context': context,
                'disclaimer': (
                    'Las correspondencias cósmicas son simbólicas. '
                    'Los ciclos naturales reflejan patrones universales, '
                    'no determinan tu destino.'
                )
            })
            
        except Exception as e:
            logger.error(f"Error en calendario cósmico: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CabalaCalendarioLunarView(APIView):
    """
    Calendario Lunar Sefirótico
    
    GET /api/cabala/calendario-cosmico/lunar/
    
    Genera calendario mensual con fases lunares y correspondencias sefiróticas.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Genera calendario lunar sefirótico"""
        try:
            # Parámetros
            start_date_str = request.query_params.get('start_date')
            months = int(request.query_params.get('months', 1))
            
            # Parsear fecha de inicio
            start_date = date.today()
            if start_date_str:
                try:
                    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                except ValueError:
                    pass
            
            # Limitar meses
            months = min(max(1, months), 12)
            
            # Generar calendario
            calendar = CalendarioCosmicoCabala()
            lunar_calendar = calendar.get_lunar_sefirotic_calendar(
                start_date=start_date,
                months=months
            )
            
            return Response({
                'success': True,
                'start_date': start_date.isoformat(),
                'months': months,
                'calendar': lunar_calendar,
                'legend': {
                    'phases': [
                        'new_moon - Luna Nueva (Binah)',
                        'waxing_crescent - Luna Creciente (Chesed)',
                        'first_quarter - Cuarto Creciente (Gevurah)',
                        'waxing_gibbous - Gibosa Creciente (Tiferet)',
                        'full_moon - Luna Llena (Keter)',
                        'waning_gibbous - Gibosa Menguante (Chokmah)',
                        'last_quarter - Cuarto Menguante (Hod)',
                        'waning_crescent - Luna Menguante (Yesod)'
                    ]
                }
            })
            
        except Exception as e:
            logger.error(f"Error en calendario lunar: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CabalaMapaAnualView(APIView):
    """
    Mapa Cósmico Anual
    
    GET /api/cabala/calendario-cosmico/anual/
    
    Genera mapa anual con todos los eventos cósmicos significativos.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Genera mapa cósmico anual"""
        try:
            # Parámetros
            year = int(request.query_params.get('year', date.today().year))
            birth_date_str = request.query_params.get('birth_date')
            
            # Parsear fecha de nacimiento
            birth_date = None
            if birth_date_str:
                try:
                    birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
                except ValueError:
                    pass
            
            # Generar mapa anual
            calendar = CalendarioCosmicoCabala()
            annual_map = calendar.get_annual_cosmic_map(
                year=year,
                birth_date=birth_date
            )
            
            return Response({
                'success': True,
                'year': year,
                'annual_map': annual_map,
                'usage_note': (
                    'Este mapa muestra los momentos de energía especial durante el año. '
                    'Úsalo como guía para planificar prácticas espirituales y momentos de reflexión.'
                )
            })
            
        except Exception as e:
            logger.error(f"Error en mapa anual: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CabalaAnalisisEventoView(APIView):
    """
    Análisis de Contexto Cósmico de Evento
    
    POST /api/cabala/calendario-cosmico/analizar-evento/
    
    Analiza el contexto cósmico en que ocurrió un evento específico.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Analiza contexto cósmico de un evento"""
        try:
            # Validar datos
            event_date_str = request.data.get('event_date')
            event_type = request.data.get('event_type', 'unspecified')
            birth_date_str = request.data.get('birth_date')
            
            if not event_date_str:
                return Response(
                    {'error': 'Se requiere event_date'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Parsear fechas
            try:
                event_date = datetime.strptime(event_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Formato de event_date inválido. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            birth_date = None
            if birth_date_str:
                try:
                    birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
                except ValueError:
                    pass
            
            # Analizar
            calendar = CalendarioCosmicoCabala()
            analysis = calendar.analyze_event_cosmic_context(
                event_date=event_date,
                event_type=event_type,
                birth_date=birth_date
            )
            
            return Response({
                'success': True,
                'analysis': analysis,
                'insight': (
                    'Comprender el contexto cósmico de un evento no es buscar excusas '
                    'sino encontrar significado. Los eventos ocurren cuando deben ocurrir.'
                )
            })
            
        except Exception as e:
            logger.error(f"Error en análisis de evento: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==============================================================================
# INNOVACIÓN 4: LABORATORIO DE NOMBRES
# ==============================================================================

class CabalaLaboratorioNombresView(APIView):
    """
    INNOVACIÓN 4: Laboratorio de Nombres (Gematría Relacional Familiar)
    
    POST /api/cabala/laboratorio-nombres/
    
    Analiza nombres del consultante y familia:
    - Transliteración hebrea
    - Valores gematría
    - Letras compartidas
    - Resonancias numéricas
    - Preguntas generativas
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Analiza nombres familiares"""
        try:
            # Validar datos requeridos
            primary_name = request.data.get('primary_name')
            family_members = request.data.get('family_members', [])
            
            if not primary_name:
                return Response(
                    {'error': 'Se requiere primary_name (nombre del consultante)'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not family_members or not isinstance(family_members, list):
                return Response(
                    {'error': 'Se requiere family_members como lista de objetos {name, relation}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar estructura de family_members
            parsed_members = []
            for member in family_members:
                if not isinstance(member, dict) or 'name' not in member:
                    continue
                parsed_members.append({
                    'name': member.get('name', ''),
                    'relation': member.get('relation', 'familiar')
                })
            
            if not parsed_members:
                return Response(
                    {'error': 'Al menos un family_member válido es requerido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Ejecutar análisis
            lab = LaboratorioNombres()
            result = lab.analyze_names(
                primary_name=primary_name,
                family_members=parsed_members
            )
            
            return Response({
                'success': True,
                'analysis': result,
                'generated_at': datetime.now().isoformat(),
                'therapeutic_note': (
                    'Este análisis de nombres es una herramienta de reflexión. '
                    'Los patrones numéricos invitan a la contemplación, no determinan destinos. '
                    'Las letras compartidas pueden simbolizar legados emocionales.'
                )
            })
            
        except Exception as e:
            logger.error(f"Error en laboratorio de nombres: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==============================================================================
# INNOVACIÓN 5: MEDITACIONES PERSONALIZADAS
# ==============================================================================

class CabalaMeditacionesView(APIView):
    """
    INNOVACIÓN 5: Meditaciones Personalizadas por Sefirá
    
    POST /api/cabala/meditaciones/
    
    Genera meditaciones guiadas adaptadas:
    - Sefirá objetivo
    - Tipo (equilibrio, fortalecimiento, sanación, integración)
    - Duración personalizada
    - Intención personal
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Genera meditación personalizada"""
        try:
            # Validar datos requeridos
            target_sefira = request.data.get('target_sefira')
            meditation_type = request.data.get('meditation_type', 'equilibrio')
            
            if not target_sefira:
                return Response(
                    {'error': 'Se requiere target_sefira'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar sefirá
            valid_sefirot = [
                'keter', 'chokmah', 'binah', 'chesed', 'gevurah',
                'tiferet', 'netzach', 'hod', 'yesod', 'malkuth'
            ]
            if target_sefira.lower() not in valid_sefirot:
                return Response(
                    {'error': f'Sefirá inválida. Válidas: {valid_sefirot}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar tipo
            valid_types = ['equilibrio', 'fortalecimiento', 'sanacion', 'integracion']
            if meditation_type.lower() not in valid_types:
                return Response(
                    {'error': f'Tipo inválido. Válidos: {valid_types}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Parámetros opcionales
            duration = int(request.data.get('duration_minutes', 10))
            include_breathing = request.data.get('include_breathing', True)
            include_visualization = request.data.get('include_visualization', True)
            personal_intention = request.data.get('personal_intention', '')
            consultant_name = request.data.get('consultant_name', 'Consultante')
            
            # Limitar duración
            duration = min(max(5, duration), 60)
            
            # Generar meditación
            generator = MeditacionesPersonalizadas()
            result = generator.generate_meditation(
                target_sefira=target_sefira.lower(),
                meditation_type=meditation_type.lower(),
                duration_minutes=duration,
                include_breathing=include_breathing,
                include_visualization=include_visualization,
                personal_intention=personal_intention,
                consultant_name=consultant_name
            )
            
            return Response({
                'success': True,
                'meditation': result,
                'generated_at': datetime.now().isoformat(),
                'usage_note': (
                    'Esta meditación es una guía para tu práctica personal. '
                    'Adáptala según te sientas guiado/a. El objetivo no es la perfección, '
                    'sino la presencia y la intención amorosa.'
                )
            })
            
        except Exception as e:
            logger.error(f"Error en meditaciones personalizadas: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==============================================================================
# INNOVACIÓN 13: ÁRBOL VIVO (GAMIFICACIÓN)
# ==============================================================================

class CabalaArbolVivoView(APIView):
    """
    INNOVACIÓN 13: Árbol Vivo (Gamificación del Progreso)
    
    GET /api/cabala/arbol-vivo/{uuid}/ - Obtener estado actual
    POST /api/cabala/arbol-vivo/{uuid}/activity/ - Registrar actividad
    
    Sistema de gamificación que visualiza el progreso como un árbol creciendo.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, uuid=None):
        """Obtiene el estado del árbol de un consultante"""
        try:
            # Si no hay UUID, crear estado inicial demo
            if not uuid:
                engine = ArbolVivo()
                tree_state = engine.initialize_tree_state(user_id='demo')
                viz_data = engine.get_tree_visualization_data(tree_state)
                achievements = engine.get_available_achievements(tree_state)
                
                return Response({
                    'success': True,
                    'tree_state': tree_state,
                    'visualization': viz_data,
                    'achievements': achievements,
                    'is_new': True
                })
            
            # En producción, aquí buscarías en DB el estado guardado
            # Por ahora, simulamos con estado inicial
            engine = ArbolVivo()
            tree_state = engine.initialize_tree_state(user_id=str(uuid))
            viz_data = engine.get_tree_visualization_data(tree_state)
            achievements = engine.get_available_achievements(tree_state)
            
            return Response({
                'success': True,
                'tree_state': tree_state,
                'visualization': viz_data,
                'achievements': achievements,
                'is_new': True
            })
            
        except Exception as e:
            logger.error(f"Error obteniendo árbol vivo: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CabalaArbolVivoActivityView(APIView):
    """
    Registrar actividad en el Árbol Vivo
    
    POST /api/cabala/arbol-vivo/{uuid}/activity/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, uuid):
        """Registra una actividad y actualiza el árbol"""
        try:
            # Validar datos
            activity_type = request.data.get('activity_type')
            tree_state = request.data.get('tree_state')
            
            if not activity_type:
                return Response(
                    {'error': 'Se requiere activity_type'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not tree_state:
                return Response(
                    {'error': 'Se requiere tree_state (estado actual del árbol)'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Parámetros opcionales
            associated_sefira = request.data.get('associated_sefira')
            metadata = request.data.get('metadata', {})
            
            # Registrar actividad
            engine = ArbolVivo()
            result = engine.record_activity(
                tree_state=tree_state,
                activity_type=activity_type,
                associated_sefira=associated_sefira,
                metadata=metadata
            )
            
            # Generar datos de visualización actualizados
            viz_data = engine.get_tree_visualization_data(result['tree_state'])
            
            return Response({
                'success': True,
                'tree_state': result['tree_state'],
                'changes': result['changes'],
                'visualization': viz_data,
                'celebration_message': self._get_celebration_message(result['changes'])
            })
            
        except Exception as e:
            logger.error(f"Error registrando actividad: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_celebration_message(self, changes: Dict) -> Optional[str]:
        """Genera mensaje de celebración si hay logros especiales"""
        messages = []
        
        if changes.get('level_up'):
            messages.append('🎉 ¡Tu árbol ha crecido a un nuevo nivel!')
        
        if changes.get('sefira_evolved'):
            sefira = changes['sefira_evolved']['sefira']
            new_state = changes['sefira_evolved']['new_state']
            messages.append(f'✨ {sefira.capitalize()} ha evolucionado a {new_state}!')
        
        if changes.get('new_achievements'):
            for ach in changes['new_achievements']:
                messages.append(f"🏆 ¡Logro desbloqueado: {ach['icon']} {ach['name']}!")
        
        if changes.get('new_milestones'):
            for ms in changes['new_milestones']:
                messages.append(f"🌟 Milestone alcanzado: {ms['name']}")
        
        return ' | '.join(messages) if messages else None
