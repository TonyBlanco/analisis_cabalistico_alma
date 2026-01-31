"""
biographical_events_views.py - Eventos Biográficos Automáticos

Endpoint que agrega eventos biográficos de múltiples fuentes:
- Tests completados (clínicos y bienestar)
- Sesiones terapéuticas
- Datos de nacimiento y milestones
- Eventos registrados en módulos SWM

Usado por: SincroniasPanel, AlertasPreventivasPanel
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
import logging

from .models import Consultante
from .test_models import TestResult, Assignment
from .permissions import IsTherapist

logger = logging.getLogger(__name__)


class ConsultanteBiographicalEventsView(APIView):
    """
    GET /api/consultantes/{uuid}/biographical-events/
    
    Retorna eventos biográficos agregados de múltiples fuentes:
    - Tests completados
    - Sesiones terapéuticas
    - Milestones calculados (edades: 7, 14, 21, 28, 35, 42, 49, 56, 63...)
    - Eventos de workspaces SWM
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def get(self, request, uuid):
        try:
            consultante = get_object_or_404(
                Consultante.objects.select_related('user_account'),
                uuid=uuid,
                therapist=request.user
            )
            
            events = []
            
            # 1. Eventos de nacimiento y milestones sefiróticos
            if consultante.birth_date:
                events.extend(self._get_sefirotic_milestones(consultante))
            
            # 2. Tests completados
            events.extend(self._get_test_events(consultante))
            
            # 3. Sesiones terapéuticas (si hay model de sesiones)
            events.extend(self._get_session_events(consultante))
            
            # 4. Eventos de SWM workspaces
            events.extend(self._get_swm_events(consultante))
            
            # Ordenar por fecha
            events.sort(key=lambda x: x.get('date', ''), reverse=True)
            
            return Response({
                'success': True,
                'consultante_uuid': str(uuid),
                'consultante_name': consultante.full_name,
                'birth_date': str(consultante.birth_date) if consultante.birth_date else None,
                'events_count': len(events),
                'events': events,
                'sources': {
                    'milestones': sum(1 for e in events if e.get('source') == 'milestone'),
                    'tests': sum(1 for e in events if e.get('source') == 'test'),
                    'sessions': sum(1 for e in events if e.get('source') == 'session'),
                    'swm': sum(1 for e in events if e.get('source') == 'swm')
                }
            })
            
        except Consultante.DoesNotExist:
            return Response(
                {'error': 'Consultante no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error obteniendo eventos biográficos: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_sefirotic_milestones(self, consultante):
        """
        Genera milestones sefiróticos basados en ciclos de 7 años.
        
        Ciclos sefiróticos (ascendiendo por Árbol de la Vida):
        - 0-7: Malkuth (manifestación)
        - 7-14: Yesod (fundamento emocional)
        - 14-21: Hod/Netzach (mente/corazón)
        - 21-28: Tiferet (individualidad)
        - 28-35: Gevurah/Chesed (poder/amor)
        - 35-42: Binah/Chokmah (comprensión/sabiduría)
        - 42-49: Kether (corona - integración)
        - 49+: Nuevo ciclo
        """
        events = []
        birth_date = consultante.birth_date
        today = date.today()
        
        sefirotic_cycles = [
            (0, 'Nacimiento', 'Malkuth', 'Llegada al mundo material'),
            (7, 'Primera Iniciación', 'Yesod', 'Despertar emocional y lunar'),
            (14, 'Pubertad', 'Hod-Netzach', 'Polaridad mente-corazón'),
            (21, 'Mayoría Solar', 'Tiferet', 'Nacimiento del Yo individual'),
            (28, 'Primera Madurez', 'Gevurah-Chesed', 'Poder personal y apertura al amor'),
            (35, 'Segunda Madurez', 'Binah-Chokmah', 'Comprensión profunda'),
            (42, 'Integración', 'Kether inferior', 'Unificación del primer ciclo'),
            (49, 'Segundo Nacimiento', 'Nuevo Malkuth', 'Inicio de ciclo superior'),
            (56, 'Sabiduría', 'Yesod superior', 'Fundamento de sabiduría'),
            (63, 'Maestría', 'Tiferet superior', 'Individualidad trascendida'),
            (70, 'Ancianía Sagrada', 'Kether', 'Culminación'),
        ]
        
        for years, name, sefira, description in sefirotic_cycles:
            milestone_date = birth_date + relativedelta(years=years)
            
            # Solo incluir milestones pasados o dentro de 1 año
            if milestone_date <= today + relativedelta(years=1):
                is_future = milestone_date > today
                intensity = 7 if not is_future else 5  # Menor intensidad para futuros
                
                events.append({
                    'date': str(milestone_date),
                    'type': 'milestone_sefirotico',
                    'description': f"{name} - {sefira}: {description}",
                    'intensity': intensity,
                    'source': 'milestone',
                    'sefira': sefira,
                    'age': years,
                    'is_future': is_future
                })
        
        return events
    
    def _get_test_events(self, consultante):
        """Obtiene eventos de tests completados"""
        events = []
        
        try:
            # Obtener tests del consultante (por user_account)
            if consultante.user_account:
                test_results = TestResult.objects.filter(
                    user=consultante.user_account
                ).select_related('test_module').order_by('-completed_at')[:50]
                
                for result in test_results:
                    test_name = result.test_module.name if result.test_module else 'Test'
                    score = result.score if hasattr(result, 'score') else None
                    
                    # Determinar intensidad basado en severidad del resultado
                    intensity = 5
                    if score is not None:
                        if score > 70:
                            intensity = 8
                        elif score > 50:
                            intensity = 6
                        elif score > 30:
                            intensity = 4
                    
                    events.append({
                        'date': str(result.completed_at.date()) if result.completed_at else str(result.created_at.date()),
                        'type': f'test_{result.test_module.category if result.test_module else "clinical"}',
                        'description': f"Completado: {test_name}",
                        'intensity': intensity,
                        'source': 'test',
                        'test_id': result.id,
                        'score': score
                    })
        except Exception as e:
            logger.warning(f"Error obteniendo tests: {e}")
        
        return events
    
    def _get_session_events(self, consultante):
        """Obtiene eventos de sesiones terapéuticas"""
        events = []
        
        try:
            # Intentar obtener sesiones si existe el modelo
            from .models import Session
            sessions = Session.objects.filter(
                patient=consultante.user_account
            ).order_by('-date')[:30]
            
            for session in sessions:
                events.append({
                    'date': str(session.date),
                    'type': 'session_therapeutic',
                    'description': f"Sesión terapéutica: {session.notes[:50] if session.notes else 'Sin notas'}",
                    'intensity': 5,
                    'source': 'session',
                    'session_id': session.id
                })
        except Exception as e:
            # El modelo Session puede no existir o no estar relacionado
            logger.debug(f"Sesiones no disponibles: {e}")
        
        return events
    
    def _get_swm_events(self, consultante):
        """Obtiene eventos de workspaces SWM (SHA, Tarot, etc.)"""
        events = []
        
        try:
            # SHA workspace events
            from swm.sha.models import WorkspaceInstance, WorkspaceArtifact
            
            sha_workspaces = WorkspaceInstance.objects.filter(
                subject_user=consultante.user_account,
                status__in=['completed', 'sealed', 'pending_review']
            ).order_by('-created_at')[:20]
            
            for ws in sha_workspaces:
                events.append({
                    'date': str(ws.created_at.date()),
                    'type': 'swm_sha',
                    'description': f"Auditoría SHA: {ws.definition.name if ws.definition else 'Workspace'}",
                    'intensity': 6,
                    'source': 'swm',
                    'workspace_id': str(ws.id)
                })
                
                # Artefactos importantes del workspace
                artifacts = WorkspaceArtifact.objects.filter(
                    workspace_instance=ws
                ).order_by('-created_at')[:5]
                
                for artifact in artifacts:
                    events.append({
                        'date': str(artifact.created_at.date()),
                        'type': 'swm_artifact',
                        'description': f"Artefacto: {artifact.artifact_type}",
                        'intensity': 4,
                        'source': 'swm',
                        'artifact_id': str(artifact.id)
                    })
                    
        except ImportError:
            logger.debug("Módulo SHA no disponible")
        except Exception as e:
            logger.warning(f"Error obteniendo eventos SWM: {e}")
        
        return events


class ConsultanteAddBiographicalEventView(APIView):
    """
    POST /api/consultantes/{uuid}/biographical-events/add/
    
    Permite al terapeuta agregar eventos biográficos manualmente.
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request, uuid):
        try:
            consultante = get_object_or_404(
                Consultante,
                uuid=uuid,
                therapist=request.user
            )
            
            # Validar datos
            event_date = request.data.get('date')
            event_type = request.data.get('type', 'manual')
            description = request.data.get('description', '')
            intensity = request.data.get('intensity', 5)
            
            if not event_date or not description:
                return Response(
                    {'error': 'Se requiere fecha y descripción'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Por ahora guardamos en clinical_history como JSON
            # En el futuro podría haber un modelo BiographicalEvent
            event = {
                'date': event_date,
                'type': event_type,
                'description': description,
                'intensity': min(max(int(intensity), 1), 10),
                'added_by': request.user.username,
                'added_at': str(datetime.now())
            }
            
            # Append al clinical_history como evento estructurado
            # (Esto es temporal - idealmente habría un modelo dedicado)
            current_history = consultante.clinical_history or ''
            event_marker = f"\n\n[EVENTO BIOGRÁFICO {event_date}]\n{description}\nIntensidad: {intensity}/10\nTipo: {event_type}"
            consultante.clinical_history = current_history + event_marker
            consultante.save()
            
            return Response({
                'success': True,
                'message': 'Evento agregado correctamente',
                'event': event
            })
            
        except Exception as e:
            logger.error(f"Error agregando evento: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
