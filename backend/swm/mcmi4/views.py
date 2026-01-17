"""
DRF Views for MCMI-4 Místico SWM.

Implements all 12 endpoints from SWM_MCMI4_API_SPEC.md:
- POST /create
- GET /list
- GET /status
- POST /start
- POST /progress
- POST /seal
- GET /results
- POST /grant-permission
- POST /revoke-permission
- GET /audit
- GET /artifacts
- POST /review
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from swm.mcmi4.models import (
    WorkspaceInstance,
    WorkspaceSession,
    WorkspaceArtifact,
    WorkspacePermission
)
from swm.mcmi4.serializers import (
    CreateWorkspaceRequestSerializer,
    CreateWorkspaceResponseSerializer,
    StartSessionRequestSerializer,
    StartSessionResponseSerializer,
    ProgressRequestSerializer,
    ProgressResponseSerializer,
    SealWorkspaceRequestSerializer,
    SealWorkspaceResponseSerializer,
    WorkspaceStatusResponseSerializer,
    WorkspaceInstanceSerializer,
    WorkspaceArtifactSerializer,
    QuestionnaireQuerySerializer,
    QuestionnaireResponseSerializer,
    ProgressQuerySerializer,
    ProgressGetResponseSerializer,
    ProgressActionSerializer,
    ProgressActionResponseSerializer,
    SealQuestionnaireRequestSerializer
)
from swm.mcmi4.services import WorkspaceService, SessionService, AuditService
from swm.mcmi4.services.questionnaire_service import QuestionnaireService
from swm.mcmi4.guards.permissions import (
    HasWorkspaceExecutorPermission,
    HasWorkspaceObserverPermission,
    IsWorkspaceOwnerOrAdmin
)
from typing import Dict, Any
from django.core.exceptions import ValidationError
import uuid

User = get_user_model()


def get_request_context(request) -> Dict[str, Any]:
    """Extract IP and user agent from request."""
    ip_address = request.META.get('REMOTE_ADDR')
    return {'ip_address': ip_address}


class CreateWorkspaceView(APIView):
    """POST /api/swm/mcmi4/create"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CreateWorkspaceRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        subject_user_id = serializer.validated_data['subject_user_id']
        try:
            subject_user = User.objects.get(id=subject_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'subject_user_id must reference an existing user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            workspace = WorkspaceService.create_workspace(
                creator_user=request.user,
                subject_user=subject_user,
                mcmi4_source_data_id=serializer.validated_data['mcmi4_source_data_id'],
                config=serializer.validated_data.get('config', {}),
                metadata=serializer.validated_data.get('metadata', {}),
                request_context=get_request_context(request)
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        response_data = {
            'workspace_id': workspace.id,
            'status': workspace.status,
            'subject_user_id': workspace.subject_user.id,
            'creator_user_id': workspace.creator_user.id,
            'created_at': workspace.created_at,
            'mcmi4_source_data_id': workspace.mcmi4_source_data_id
        }
        
        response_serializer = CreateWorkspaceResponseSerializer(response_data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class ListWorkspacesView(APIView):
    """GET /api/swm/mcmi4/list"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Filter workspaces where user is creator or has permission
        user = request.user
        
        # Creator
        created_workspaces = WorkspaceInstance.objects.filter(creator_user=user)
        
        # Has permission
        permitted_workspace_ids = WorkspacePermission.objects.filter(
            user=user,
            is_active=True
        ).values_list('workspace_instance_id', flat=True)
        
        permitted_workspaces = WorkspaceInstance.objects.filter(
            id__in=permitted_workspace_ids
        )
        
        # Union
        workspaces = (created_workspaces | permitted_workspaces).distinct()
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            workspaces = workspaces.filter(status=status_filter)
        
        # Filter by subject_user_id if provided
        subject_user_id = request.query_params.get('subject_user_id')
        if subject_user_id:
            workspaces = workspaces.filter(subject_user__id=subject_user_id)
        
        serializer = WorkspaceInstanceSerializer(workspaces, many=True)
        return Response({'workspaces': serializer.data}, status=status.HTTP_200_OK)


class WorkspaceStatusView(APIView):
    """GET /api/swm/mcmi4/status"""
    permission_classes = [IsAuthenticated, HasWorkspaceObserverPermission]
    
    def get(self, request):
        workspace_id = request.query_params.get('workspace_id')
        if not workspace_id:
            return Response(
                {'error': 'workspace_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            workspace_status = WorkspaceService.get_workspace_status(
                uuid.UUID(workspace_id)
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = WorkspaceStatusResponseSerializer(workspace_status)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StartSessionView(APIView):
    """POST /api/swm/mcmi4/start"""
    permission_classes = [IsAuthenticated, HasWorkspaceExecutorPermission]
    
    def post(self, request):
        serializer = StartSessionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        workspace_id = serializer.validated_data['workspace_id']
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        
        # Permission check done by HasWorkspaceExecutorPermission
        
        try:
            session = SessionService.start_session(
                workspace=workspace,
                executor_user=request.user,
                request_context=get_request_context(request)
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        response_data = {
            'session_id': session.id,
            'workspace_id': workspace.id,
            'executor_user_id': session.executor_user.id,
            'started_at': session.started_at,
            'current_phase': session.current_phase,
            'session_state': session.session_state
        }
        
        response_serializer = StartSessionResponseSerializer(response_data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class ProgressView(APIView):
    """POST /api/swm/mcmi4/progress"""
    permission_classes = [IsAuthenticated, HasWorkspaceExecutorPermission]
    
    def post(self, request):
        serializer = ProgressRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        workspace_id = serializer.validated_data['workspace_id']
        session_id = serializer.validated_data['session_id']
        
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        session = get_object_or_404(WorkspaceSession, id=session_id, workspace_instance=workspace)
        
        try:
            result = SessionService.record_progress(
                session=session,
                user=request.user,
                action=serializer.validated_data['action'],
                payload=serializer.validated_data['payload'],
                request_context=get_request_context(request)
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        response_serializer = ProgressResponseSerializer(result)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class SealWorkspaceView(APIView):
    """POST /api/swm/mcmi4/seal"""
    permission_classes = [IsAuthenticated, HasWorkspaceExecutorPermission]
    
    def post(self, request):
        serializer = SealWorkspaceRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        workspace_id = serializer.validated_data['workspace_id']
        session_id = serializer.validated_data['session_id']
        
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        session = get_object_or_404(WorkspaceSession, id=session_id, workspace_instance=workspace)
        
        # End session first
        try:
            SessionService.end_session(
                session=session,
                user=request.user,
                request_context=get_request_context(request)
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Seal workspace
        try:
            workspace, synthesis = WorkspaceService.seal_workspace(
                workspace=workspace,
                user=request.user,
                final_synthesis=serializer.validated_data['final_synthesis'],
                request_context=get_request_context(request)
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        response_data = {
            'workspace_id': workspace.id,
            'status': workspace.status,
            'sealed_at': workspace.sealed_at,
            'session_summary': {
                'session_id': str(session.id),
                'interactions_count': session.interactions_count,
                'duration_seconds': (session.ended_at - session.started_at).total_seconds()
            },
            'synthesis_report_id': synthesis.id
        }
        
        response_serializer = SealWorkspaceResponseSerializer(response_data)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class ResultsView(APIView):
    """GET /api/swm/mcmi4/results"""
    permission_classes = [IsAuthenticated, HasWorkspaceObserverPermission]
    
    def get(self, request):
        workspace_id = request.query_params.get('workspace_id')
        if not workspace_id:
            return Response(
                {'error': 'workspace_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        
        if workspace.status not in ['sealed', 'reviewed', 'archived']:
            return Response(
                {'error': f'Results not available for workspace in status {workspace.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get final synthesis
        synthesis = workspace.artifacts.filter(artifact_type='final_synthesis').first()
        
        # Get all artifacts
        artifacts = workspace.artifacts.all()
        
        response_data = {
            'workspace_id': workspace.id,
            'status': workspace.status,
            'final_synthesis': synthesis.content if synthesis else None,
            'artifacts': WorkspaceArtifactSerializer(artifacts, many=True).data,
            'sealed_at': workspace.sealed_at
        }
        
        return Response(response_data, status=status.HTTP_200_OK)


class GrantPermissionView(APIView):
    """POST /api/swm/mcmi4/grant-permission"""
    permission_classes = [IsAuthenticated, IsWorkspaceOwnerOrAdmin]
    
    def post(self, request):
        workspace_id = request.data.get('workspace_id')
        user_id = request.data.get('user_id')
        permission_type = request.data.get('permission_type')
        
        if not all([workspace_id, user_id, permission_type]):
            return Response(
                {'error': 'workspace_id, user_id, and permission_type required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        target_user = get_object_or_404(User, id=user_id)
        
        # Create or reactivate permission
        permission, created = WorkspacePermission.objects.get_or_create(
            workspace_instance=workspace,
            user=target_user,
            permission_type=permission_type,
            defaults={
                'granted_by': request.user
            }
        )
        
        if not created and permission.revoked_at:
            permission.is_active = True
            permission.revoked_at = None
            permission.granted_by = request.user
            permission.save()
        
        AuditService.log_action(
            workspace_instance=workspace,
            user=request.user,
            action='permission_granted',
            details={
                'target_user_id': str(user_id),
                'permission_type': permission_type
            },
            request_context=get_request_context(request)
        )
        
        return Response(
            {'permission_id': permission.id, 'created': created},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class RevokePermissionView(APIView):
    """POST /api/swm/mcmi4/revoke-permission"""
    permission_classes = [IsAuthenticated, IsWorkspaceOwnerOrAdmin]
    
    def post(self, request):
        workspace_id = request.data.get('workspace_id')
        user_id = request.data.get('user_id')
        permission_type = request.data.get('permission_type')
        
        if not all([workspace_id, user_id, permission_type]):
            return Response(
                {'error': 'workspace_id, user_id, and permission_type required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        
        try:
            permission = WorkspacePermission.objects.get(
                workspace_instance=workspace,
                user__id=user_id,
                permission_type=permission_type,
                is_active=True
            )
        except WorkspacePermission.DoesNotExist:
            return Response(
                {'error': 'Active permission not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        permission.revoke()
        
        AuditService.log_action(
            workspace_instance=workspace,
            user=request.user,
            action='permission_revoked',
            details={
                'target_user_id': str(user_id),
                'permission_type': permission_type
            },
            request_context=get_request_context(request)
        )
        
        return Response({'revoked': True}, status=status.HTTP_200_OK)


class AuditTrailView(APIView):
    """GET /api/swm/mcmi4/audit"""
    permission_classes = [IsAuthenticated, HasWorkspaceObserverPermission]
    
    def get(self, request):
        workspace_id = request.query_params.get('workspace_id')
        if not workspace_id:
            return Response(
                {'error': 'workspace_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        
        limit = request.query_params.get('limit')
        limit = int(limit) if limit else None
        
        audit_trail = AuditService.get_workspace_audit_trail(workspace, limit=limit)
        
        return Response({'audit_trail': audit_trail}, status=status.HTTP_200_OK)


class ArtifactsView(APIView):
    """GET /api/swm/mcmi4/artifacts"""
    permission_classes = [IsAuthenticated, HasWorkspaceObserverPermission]
    
    def get(self, request):
        workspace_id = request.query_params.get('workspace_id')
        if not workspace_id:
            return Response(
                {'error': 'workspace_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        
        artifact_type = request.query_params.get('artifact_type')
        artifacts = workspace.artifacts.all()
        
        if artifact_type:
            artifacts = artifacts.filter(artifact_type=artifact_type)
        
        serializer = WorkspaceArtifactSerializer(artifacts, many=True)
        return Response({'artifacts': serializer.data}, status=status.HTTP_200_OK)


class ReviewWorkspaceView(APIView):
    """POST /api/swm/mcmi4/review"""
    permission_classes = [IsAuthenticated]  # Only reviewers can call this
    
    def post(self, request):
        workspace_id = request.data.get('workspace_id')
        review_notes = request.data.get('review_notes')
        
        if not workspace_id:
            return Response(
                {'error': 'workspace_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        
        # Check reviewer permission
        if not workspace.has_permission(request.user, 'reviewer'):
            return Response(
                {'error': 'Reviewer permission required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if workspace.status != 'sealed':
            return Response(
                {'error': f'Cannot review workspace in status {workspace.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Transition to reviewed
        workspace.status = 'reviewed'
        from django.utils import timezone
        workspace.reviewed_at = timezone.now()
        workspace.save()
        
        # Create review artifact
        if review_notes:
            WorkspaceArtifact.objects.create(
                workspace_instance=workspace,
                artifact_type='interpretation_note',
                content={'review_notes': review_notes},
                created_by=request.user,
                is_sealed=True,
                metadata={'review_completed_at': timezone.now().isoformat()}
            )
        
        AuditService.log_action(
            workspace_instance=workspace,
            user=request.user,
            action='workspace_reviewed',
            details={'reviewed_at': workspace.reviewed_at.isoformat()},
            request_context=get_request_context(request)
        )
        
        return Response(
            {
                'workspace_id': workspace.id,
                'status': workspace.status,
                'reviewed_at': workspace.reviewed_at
            },
            status=status.HTTP_200_OK
        )


# ========== QUESTIONNAIRE API VIEWS (FASE 2) ==========

class QuestionnaireView(APIView):
    """
    GET /api/swm/mcmi4/questionnaire
    
    Devuelve las 195 preguntas del cuestionario organizadas por mundos
    + progreso actual del workspace.
    """
    permission_classes = [IsAuthenticated, HasWorkspaceExecutorPermission]
    
    def get(self, request):
        serializer = QuestionnaireQuerySerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        workspace_id = serializer.validated_data['workspace_id']
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        
        # Obtener artifacts
        config_artifact = WorkspaceArtifact.objects.filter(
            workspace_instance=workspace,
            artifact_type='questionnaire_config'
        ).first()
        
        if not config_artifact:
            return Response(
                {'error': 'questionnaire_config artifact not found. Has the session started?'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        progress_artifact = WorkspaceArtifact.objects.filter(
            workspace_instance=workspace,
            artifact_type='questionnaire_progress'
        ).first()
        
        # Organizar preguntas por mundo
        questions_full = config_artifact.content.get('questions_full', [])
        worlds = {}
        
        for world_name in QuestionnaireService.WORLDS_ORDER:
            world_questions = [q for q in questions_full if q['world'] == world_name]
            worlds[world_name] = {
                'name': world_name,
                'total_questions': len(world_questions),
                'questions': world_questions
            }
        
        # Progreso actual
        if progress_artifact:
            progress_payload = progress_artifact.content
            current_progress = {
                'current_world': progress_payload.get('current_world', 'atzilut'),
                'current_question_index': progress_payload.get('current_question_index', 0),
                'answered_count': len(progress_payload.get('responses', {})),
                'progress_percentage': progress_payload.get('progress_percentage', 0.0),
                'completed_worlds': progress_payload.get('completed_worlds', []),
                'worlds_progress': progress_payload.get('worlds_progress', {})
            }
        else:
            # Estado inicial si no hay progreso
            current_progress = {
                'current_world': 'atzilut',
                'current_question_index': 0,
                'answered_count': 0,
                'progress_percentage': 0.0,
                'completed_worlds': [],
                'worlds_progress': {
                    world: {'answered': 0, 'total': count}
                    for world, count in QuestionnaireService.QUESTIONS_PER_WORLD.items()
                }
            }
        
        response_data = {
            'workspace_id': workspace.id,
            'status': workspace.status,
            'questionnaire': {
                'total_questions': QuestionnaireService.TOTAL_QUESTIONS,
                'worlds': worlds
            },
            'current_progress': current_progress
        }
        
        response_serializer = QuestionnaireResponseSerializer(response_data)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class QuestionnaireProgressView(APIView):
    """
    GET /api/swm/mcmi4/progress
    
    Devuelve el progreso actual del cuestionario sin mutar estado.
    """
    permission_classes = [IsAuthenticated, HasWorkspaceExecutorPermission]
    
    def get(self, request):
        serializer = ProgressQuerySerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        workspace_id = serializer.validated_data['workspace_id']
        session_id = serializer.validated_data.get('session_id')
        
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        
        # Validar sesión si se proporciona
        session = None
        session_status = None
        if session_id:
            session = get_object_or_404(
                WorkspaceSession, 
                id=session_id, 
                workspace_instance=workspace
            )
            session_status = session.status
        
        # Obtener artifact de progreso
        progress_artifact = WorkspaceArtifact.objects.filter(
            workspace_instance=workspace,
            artifact_type='questionnaire_progress'
        ).first()
        
        if progress_artifact:
            progress_payload = progress_artifact.content
            current_progress = {
                'current_world': progress_payload.get('current_world', 'atzilut'),
                'current_question_index': progress_payload.get('current_question_index', 0),
                'answered_count': len(progress_payload.get('responses', {})),
                'progress_percentage': progress_payload.get('progress_percentage', 0.0),
                'completed_worlds': progress_payload.get('completed_worlds', []),
                'worlds_progress': progress_payload.get('worlds_progress', {})
            }
            responses = progress_payload.get('responses', {})
        else:
            # Estado inicial
            current_progress = {
                'current_world': 'atzilut',
                'current_question_index': 0,
                'answered_count': 0,
                'progress_percentage': 0.0,
                'completed_worlds': [],
                'worlds_progress': {
                    world: {'answered': 0, 'total': count}
                    for world, count in QuestionnaireService.QUESTIONS_PER_WORLD.items()
                }
            }
            responses = {}
        
        response_data = {
            'workspace_id': workspace.id,
            'session_id': session.id if session else None,
            'session_status': session_status,
            'current_progress': current_progress,
            'responses': responses
        }
        
        response_serializer = ProgressGetResponseSerializer(response_data)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class ProgressActionView(APIView):
    """
    POST /api/swm/mcmi4/progress
    
    Ejecuta acciones sobre el progreso del cuestionario:
    - save_response: Guarda una respuesta a una pregunta
    - change_world: Cambia el mundo actual
    """
    permission_classes = [IsAuthenticated, HasWorkspaceExecutorPermission]
    
    def post(self, request):
        serializer = ProgressActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        workspace_id = serializer.validated_data['workspace_id']
        session_id = serializer.validated_data['session_id']
        action = serializer.validated_data['action']
        payload = serializer.validated_data['payload']
        
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        session = get_object_or_404(
            WorkspaceSession, 
            id=session_id, 
            workspace_instance=workspace
        )
        
        # Validar sesión activa
        if session.status != 'active':
            return Response(
                {'error': f'Session is not active (status: {session.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar workspace en progreso
        if workspace.status != 'in_progress':
            return Response(
                {'error': f'Workspace must be in_progress (current: {workspace.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ejecutar acción
        try:
            if action == 'save_response':
                result = self._handle_save_response(
                    workspace, session, payload
                )
            elif action == 'change_world':
                result = self._handle_change_world(
                    workspace, session, payload
                )
            else:
                return Response(
                    {'error': f'Unknown action: {action}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        response_serializer = ProgressActionResponseSerializer(result)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    
    def _handle_save_response(
        self, 
        workspace: WorkspaceInstance, 
        session: WorkspaceSession, 
        payload: dict
    ) -> dict:
        """Maneja la acción save_response."""
        question_id = payload['question_id']
        value = payload['value']
        world = payload['world']
        
        # Delegar a QuestionnaireService
        progress_artifact, progress_summary = QuestionnaireService.save_response(
            workspace_instance=workspace,
            session=session,
            question_id=question_id,
            value=value,
            world=world
        )
        
        # Obtener siguiente pregunta
        config_artifact = WorkspaceArtifact.objects.filter(
            workspace_instance=workspace,
            artifact_type='questionnaire_config'
        ).first()
        
        next_question = None
        if config_artifact:
            next_question = QuestionnaireService.get_next_question(
                config_artifact, progress_artifact
            )
        
        return {
            'success': True,
            'action': 'save_response',
            'current_progress': progress_summary,
            'next_question': next_question
        }
    
    def _handle_change_world(
        self, 
        workspace: WorkspaceInstance, 
        session: WorkspaceSession, 
        payload: dict
    ) -> dict:
        """Maneja la acción change_world."""
        target_world = payload['target_world']
        
        # Obtener artifacts
        progress_artifact = WorkspaceArtifact.objects.filter(
            workspace_instance=workspace,
            artifact_type='questionnaire_progress'
        ).first()
        
        if not progress_artifact:
            raise ValueError("questionnaire_progress artifact not found")
        
        config_artifact = WorkspaceArtifact.objects.filter(
            workspace_instance=workspace,
            artifact_type='questionnaire_config'
        ).first()
        
        if not config_artifact:
            raise ValueError("questionnaire_config artifact not found")
        
        current_world = progress_artifact.content.get('current_world', 'atzilut')
        worlds_order = QuestionnaireService.WORLDS_ORDER
        current_index = worlds_order.index(current_world)
        target_index = worlds_order.index(target_world)
        
        # Validar navegación
        if target_index > current_index:
            # Navegar hacia adelante: validar que mundo actual está completo
            worlds_progress = progress_artifact.content.get('worlds_progress', {})
            current_world_progress = worlds_progress.get(current_world, {})
            
            answered = current_world_progress.get('answered', 0)
            total = current_world_progress.get('total', 0)
            
            if answered < total:
                raise ValueError(
                    f"Cannot advance to {target_world}. "
                    f"Current world '{current_world}' incomplete ({answered}/{total})"
                )
        
        # Actualizar mundo actual
        progress_artifact.content['current_world'] = target_world
        progress_artifact.save()
        
        # Encontrar primera pregunta del mundo destino
        questions_full = config_artifact.content.get('questions_full', [])
        target_world_questions = [q for q in questions_full if q['world'] == target_world]
        
        # Encontrar primera pregunta no respondida en el mundo destino
        responses = progress_artifact.content.get('responses', {})
        first_question = None
        
        for question in target_world_questions:
            if question['id'] not in responses:
                first_question = question
                break
        
        # Si todas están respondidas, mostrar la primera del mundo
        if not first_question and target_world_questions:
            first_question = target_world_questions[0]
        
        # Auditar cambio de mundo
        AuditService.log_action(
            workspace_instance=workspace,
            user=session.executor_user,
            action='questionnaire_world_changed',
            details={
                'from_world': current_world,
                'to_world': target_world,
                'session_id': str(session.id)
            },
            session=session
        )
        
        return {
            'success': True,
            'action': 'change_world',
            'current_world': target_world,
            'first_question': first_question
        }


class SealQuestionnaireView(APIView):
    """
    POST /api/swm/mcmi4/seal
    
    Sella el workspace creando questionnaire_completion artifact.
    Reemplaza SealWorkspaceView con integración de QuestionnaireService.
    """
    permission_classes = [IsAuthenticated, HasWorkspaceExecutorPermission]
    
    def post(self, request):
        serializer = SealQuestionnaireRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        workspace_id = serializer.validated_data['workspace_id']
        session_id = serializer.validated_data.get('session_id')
        
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        
        # Validar estado
        if workspace.status != 'in_progress':
            return Response(
                {'error': f'Cannot seal workspace in status {workspace.status}. Expected in_progress.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener o validar sesión
        session = None
        if session_id:
            session = get_object_or_404(
                WorkspaceSession, 
                id=session_id, 
                workspace_instance=workspace
            )
        else:
            # Buscar última sesión activa
            session = WorkspaceSession.objects.filter(
                workspace_instance=workspace,
                status='active'
            ).order_by('-started_at').first()
        
        if not session:
            return Response(
                {'error': 'No active session found. Session required to seal workspace.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que el cuestionario está completo (195 respuestas)
        progress_artifact = WorkspaceArtifact.objects.filter(
            workspace=workspace,
            artifact_type='questionnaire_progress'
        ).first()
        
        if not progress_artifact:
            return Response(
                {'error': 'questionnaire_progress artifact not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        responses_count = len(progress_artifact.content.get('responses', {}))
        if responses_count < QuestionnaireService.TOTAL_QUESTIONS:
            return Response(
                {
                    'error': f'Questionnaire incomplete. {responses_count}/{QuestionnaireService.TOTAL_QUESTIONS} answered.',
                    'progress_percentage': progress_artifact.content.get('progress_percentage', 0.0)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Finalizar sesión si está activa
        if session.status == 'active':
            try:
                SessionService.end_session(
                    session=session,
                    user=request.user,
                    request_context=get_request_context(request)
                )
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Finalizar cuestionario usando QuestionnaireService
        try:
            completion_artifact = QuestionnaireService.finalize_questionnaire(
                workspace_instance=workspace,
                session=session
            )
        except (ValueError, ValidationError) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear synthesis artifact si se proporciona
        final_synthesis = serializer.validated_data.get('final_synthesis')
        synthesis_artifact = None
        
        if final_synthesis:
            synthesis_artifact = WorkspaceArtifact.objects.create(
                workspace_instance=workspace,
                session=session,
                artifact_type='final_synthesis',
                content=final_synthesis,
                created_by=request.user,
                is_sealed=True,
                metadata={'sealed_with_questionnaire': True}
            )
        
        # Preparar respuesta
        response_data = {
            'workspace_id': workspace.id,
            'status': workspace.status,
            'sealed_at': workspace.sealed_at,
            'session_summary': {
                'session_id': str(session.id),
                'interactions_count': session.interactions_count,
                'total_responses': responses_count
            },
            'completion_artifact_id': str(completion_artifact.id),
            'synthesis_report_id': str(synthesis_artifact.id) if synthesis_artifact else None
        }
        
        return Response(response_data, status=status.HTTP_200_OK)

