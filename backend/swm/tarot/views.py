"""
Django REST Framework Views for SWM Tarot Evolutivo.

Provides API endpoints for workspace management, session handling,
spread saving, and audit trail access.
"""

from typing import Optional

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError, PermissionDenied

from swm.tarot.models import (
    WorkspaceInstance,
    WorkspaceArtifact,
    WorkspaceStatus,
    PermissionLevel,
)
from swm.tarot.serializers import (
    WorkspaceDefinitionSerializer,
    WorkspaceInstanceSerializer,
    WorkspaceInstanceCreateSerializer,
    WorkspaceInstanceListSerializer,
    WorkspaceSessionSerializer,
    WorkspaceArtifactSerializer,
    WorkspacePermissionSerializer,
    WorkspaceAuditLogSerializer,
    SaveSpreadSerializer,
    GrantPermissionSerializer,
    RevokePermissionSerializer,
    StartSessionSerializer,
    SealWorkspaceSerializer,
    ReviewWorkspaceSerializer,
    InstanceActionSerializer,
)
from swm.tarot.services.workspace_service import WorkspaceService
from swm.tarot.services.session_service import SessionService
from swm.tarot.services.audit_service import AuditService

User = get_user_model()


def get_client_ip(request) -> Optional[str]:
    """Extract client IP from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def get_user_agent(request) -> str:
    """Extract user agent from request."""
    return request.META.get('HTTP_USER_AGENT', '')


# =============================================================================
# WORKSPACE DEFINITION
# =============================================================================

class WorkspaceDefinitionView(APIView):
    """
    GET /api/swm/tarot/definition
    
    Returns the Tarot Evolutivo workspace definition.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            definition = WorkspaceService.get_definition()
            serializer = WorkspaceDefinitionSerializer(definition)
            return Response(serializer.data)
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )


# =============================================================================
# WORKSPACE CRUD
# =============================================================================

class CreateWorkspaceView(APIView):
    """
    POST /api/swm/tarot/create
    
    Create a new Tarot workspace instance.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Debug logging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"[SWM Tarot] Create request data: {request.data}")
        
        serializer = WorkspaceInstanceCreateSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"[SWM Tarot] Validation failed: {serializer.errors}")
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        
        try:
            subject_user = User.objects.get(id=data['subject_user_id'])
            
            instance = WorkspaceService.create_workspace(
                creator_user=request.user,
                subject_user=subject_user,
                spread_type=data.get('spread_type', 'free'),
                tarot_system=data.get('tarot_system', 'rider-waite'),
                has_reversed=data.get('has_reversed', True),
                config=data.get('config', {}),
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request)
            )
            
            return Response(
                {'instance': WorkspaceInstanceSerializer(instance).data},
                status=status.HTTP_201_CREATED
            )
            
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Internal error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ListWorkspacesView(APIView):
    """
    GET /api/swm/tarot/list
    
    List workspaces accessible to the current user.
    Query params:
        - status: Filter by status
        - as_subject: Include workspaces where user is subject
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        status_filter = request.query_params.get('status')
        as_subject = request.query_params.get('as_subject', '').lower() == 'true'
        
        instances = WorkspaceService.list_workspaces(
            user=request.user,
            status_filter=status_filter,
            as_creator=True,
            as_subject=as_subject
        )
        
        serializer = WorkspaceInstanceListSerializer(instances, many=True)
        return Response({
            'count': len(instances),
            'results': serializer.data
        })


class WorkspaceStatusView(APIView):
    """
    GET /api/swm/tarot/status?instance_id=<uuid>
    
    Get detailed status of a workspace instance.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        instance_id = request.query_params.get('instance_id')
        if not instance_id:
            return Response(
                {'error': 'instance_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            instance = WorkspaceService.get_instance(instance_id)
            
            # Check permission
            if not WorkspaceService.check_permission(
                instance, request.user, PermissionLevel.OBSERVER
            ):
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get active session
            active_session = SessionService.get_active_session(instance)
            
            return Response({
                'instance': WorkspaceInstanceSerializer(instance).data,
                'active_session': (
                    WorkspaceSessionSerializer(active_session).data
                    if active_session else None
                ),
                'artifact_count': instance.artifacts.count(),
                'session_count': instance.sessions.count()
            })
            
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )


# =============================================================================
# SESSION MANAGEMENT
# =============================================================================

class StartSessionView(APIView):
    """
    POST /api/swm/tarot/start
    
    Start a new session for a workspace.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = StartSessionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            instance = WorkspaceService.get_instance(
                serializer.validated_data['instance_id']
            )
            
            session = SessionService.start_session(
                instance=instance,
                user=request.user,
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request)
            )
            
            return Response({
                'session': WorkspaceSessionSerializer(session).data,
                'instance': WorkspaceInstanceSerializer(instance).data
            })
            
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionDenied as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_403_FORBIDDEN
            )


# =============================================================================
# SPREAD MANAGEMENT
# =============================================================================

class SaveSpreadView(APIView):
    """
    POST /api/swm/tarot/save-spread
    
    Save a Tarot spread to the workspace.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = SaveSpreadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        
        try:
            instance = WorkspaceService.get_instance(data['instance_id'])
            
            artifact = WorkspaceService.save_spread(
                instance=instance,
                user=request.user,
                cards=data['cards'],
                spread_type=data.get('spread_type'),
                tarot_system=data.get('tarot_system'),
                therapist_notes=data.get('therapist_notes', ''),
                session_context=data.get('session_context', ''),
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request)
            )
            
            return Response({
                'artifact': WorkspaceArtifactSerializer(artifact).data,
                'message': 'Spread saved successfully'
            })
            
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionDenied as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_403_FORBIDDEN
            )


# =============================================================================
# SEAL & REVIEW
# =============================================================================

class SealWorkspaceView(APIView):
    """
    POST /api/swm/tarot/seal
    
    Seal a workspace (make it immutable).
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = SealWorkspaceSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            instance = WorkspaceService.get_instance(
                serializer.validated_data['instance_id']
            )
            
            # End active session if any
            active_session = SessionService.get_active_session(instance)
            if active_session:
                SessionService.end_session(
                    session=active_session,
                    user=request.user,
                    ip_address=get_client_ip(request),
                    user_agent=get_user_agent(request)
                )
            
            # Transition to sealed
            instance = WorkspaceService.transition_status(
                instance=instance,
                new_status=WorkspaceStatus.SEALED,
                user=request.user,
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request)
            )
            
            return Response({
                'instance': WorkspaceInstanceSerializer(instance).data,
                'message': 'Workspace sealed successfully'
            })
            
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionDenied as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_403_FORBIDDEN
            )


class ReviewWorkspaceView(APIView):
    """
    POST /api/swm/tarot/review
    
    Mark a sealed workspace as reviewed.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ReviewWorkspaceSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            instance = WorkspaceService.get_instance(
                serializer.validated_data['instance_id']
            )
            
            instance = WorkspaceService.transition_status(
                instance=instance,
                new_status=WorkspaceStatus.REVIEWED,
                user=request.user,
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request)
            )
            
            return Response({
                'instance': WorkspaceInstanceSerializer(instance).data,
                'message': 'Workspace marked as reviewed'
            })
            
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionDenied as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_403_FORBIDDEN
            )


# =============================================================================
# ARTIFACTS
# =============================================================================

class ArtifactsView(APIView):
    """
    GET /api/swm/tarot/artifacts?instance_id=<uuid>
    
    Get all artifacts for a workspace.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        instance_id = request.query_params.get('instance_id')
        if not instance_id:
            return Response(
                {'error': 'instance_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            instance = WorkspaceService.get_instance(instance_id)
            
            # Check permission
            if not WorkspaceService.check_permission(
                instance, request.user, PermissionLevel.OBSERVER
            ):
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            artifacts = instance.artifacts.all().order_by('-created_at')
            serializer = WorkspaceArtifactSerializer(artifacts, many=True)
            
            return Response({
                'count': artifacts.count(),
                'results': serializer.data
            })
            
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )


# =============================================================================
# AUDIT TRAIL
# =============================================================================

class AuditTrailView(APIView):
    """
    GET /api/swm/tarot/audit?instance_id=<uuid>
    
    Get audit trail for a workspace.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        instance_id = request.query_params.get('instance_id')
        if not instance_id:
            return Response(
                {'error': 'instance_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            instance = WorkspaceService.get_instance(instance_id)
            
            # Check permission
            if not WorkspaceService.check_permission(
                instance, request.user, PermissionLevel.OBSERVER
            ):
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            action_filter = request.query_params.get('action')
            limit = int(request.query_params.get('limit', 100))
            
            logs = AuditService.get_audit_trail(
                instance_id=instance.id,
                action_filter=action_filter,
                limit=limit
            )
            
            serializer = WorkspaceAuditLogSerializer(logs, many=True)
            
            return Response({
                'count': len(logs),
                'results': serializer.data
            })
            
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )


# =============================================================================
# PERMISSIONS
# =============================================================================

class GrantPermissionView(APIView):
    """
    POST /api/swm/tarot/grant-permission
    
    Grant permission to a user for a workspace.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = GrantPermissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        
        try:
            instance = WorkspaceService.get_instance(data['instance_id'])
            target_user = User.objects.get(id=data['user_id'])
            
            permission = WorkspaceService.grant_permission(
                instance=instance,
                user=target_user,
                level=data['level'],
                granted_by=request.user,
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request)
            )
            
            return Response({
                'permission': WorkspacePermissionSerializer(permission).data,
                'message': 'Permission granted successfully'
            })
            
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionDenied as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_403_FORBIDDEN
            )


class RevokePermissionView(APIView):
    """
    POST /api/swm/tarot/revoke-permission
    
    Revoke a user's permission for a workspace.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = RevokePermissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        
        try:
            instance = WorkspaceService.get_instance(data['instance_id'])
            target_user = User.objects.get(id=data['user_id'])
            
            WorkspaceService.revoke_permission(
                instance=instance,
                user=target_user,
                level=data['level'],
                revoked_by=request.user,
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request)
            )
            
            return Response({
                'message': 'Permission revoked successfully'
            })
            
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionDenied as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_403_FORBIDDEN
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
