"""
API views for MCMI-4 Reflection SWM.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from swm.mcmi4_reflection.models import WorkspaceInstance
from swm.mcmi4_reflection.services.workspace_service import WorkspaceService
from swm.mcmi4_reflection.serializers import (
    CreateReflectionRequestSerializer,
    UpdateReflectionRequestSerializer,
    ReflectionStatusResponseSerializer
)


class CreateReflectionView(APIView):
    """
    POST /api/swm/mcmi4-reflection/create
    
    Create new reflection workspace.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CreateReflectionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            workspace, artifact = WorkspaceService.create_workspace(
                consultant_user=request.user,
                linked_test_result_id=serializer.validated_data['linked_test_result_id'],
                initial_answers=serializer.validated_data.get('initial_answers', {}),
                request_context={'ip_address': self.get_client_ip(request)}
            )
            
            return Response({
                'workspace_id': str(workspace.id),
                'artifact_id': str(artifact.id),
                'status': workspace.status,
                'message': 'Reflection workspace created successfully'
            }, status=status.HTTP_201_CREATED)
        
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except Exception as e:
            return Response({
                'error': f'Unexpected error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_client_ip(self, request):
        """Extract client IP from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class ReflectionWorkspaceView(APIView):
    """
    GET /api/swm/mcmi4-reflection/{workspace_id}
    PATCH /api/swm/mcmi4-reflection/{workspace_id}
    
    Get or update reflection workspace.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, workspace_id):
        """Get workspace status and content."""
        try:
            workspace_status = WorkspaceService.get_workspace_status(workspace_id)
            
            # Check permissions: consultant can always read, therapist needs explicit permission
            workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
            if workspace.consultant_user != request.user:
                # For now, only consultant can read
                # TODO: Add explicit permissions for therapists
                return Response({
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = ReflectionStatusResponseSerializer(workspace_status)
            return Response(serializer.data)
        
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_404_NOT_FOUND)
    
    def patch(self, request, workspace_id):
        """Update reflection answers."""
        serializer = UpdateReflectionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        
        try:
            artifact = WorkspaceService.update_reflection(
                workspace=workspace,
                user=request.user,
                answers=serializer.validated_data['answers'],
                request_context={'ip_address': self.get_client_ip(request)}
            )
            
            return Response({
                'artifact_id': str(artifact.id),
                'updated_at': artifact.updated_at,
                'message': 'Reflection updated successfully'
            })
        
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    
    def get_client_ip(self, request):
        """Extract client IP from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class SealReflectionView(APIView):
    """
    POST /api/swm/mcmi4-reflection/{workspace_id}/seal
    
    Seal reflection workspace.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, workspace_id):
        workspace = get_object_or_404(WorkspaceInstance, id=workspace_id)
        
        try:
            workspace = WorkspaceService.seal_reflection(
                workspace=workspace,
                user=request.user,
                request_context={'ip_address': self.get_client_ip(request)}
            )
            
            return Response({
                'workspace_id': str(workspace.id),
                'status': workspace.status,
                'sealed_at': workspace.sealed_at,
                'message': 'Reflection sealed successfully'
            })
        
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    
    def get_client_ip(self, request):
        """Extract client IP from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class ReflectionBySignalView(APIView):
    """
    GET /api/swm/mcmi4-reflection/by-signal/{signal_id}
    
    Lookup reflection workspace by signal TestResult ID.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, signal_id):
        """Get workspace associated with signal TestResult."""
        try:
            workspace = WorkspaceInstance.objects.get(linked_test_result_id=signal_id)
            workspace_status = WorkspaceService.get_workspace_status(str(workspace.id))
            serializer = ReflectionStatusResponseSerializer(workspace_status)
            return Response(serializer.data)
        
        except WorkspaceInstance.DoesNotExist:
            return Response({
                'error': 'No reflection workspace found for this signal'
            }, status=status.HTTP_404_NOT_FOUND)


class ReflectionByUserView(APIView):
    """
    GET /api/swm/mcmi4-reflection/by-user/{user_id}
    
    Lookup most recent reflection workspace for user.
    Prefers sealed over draft.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        """Get most recent reflection for user (prefer sealed)."""
        # Try sealed first
        sealed_workspace = WorkspaceInstance.objects.filter(
            consultant_user_id=user_id,
            status='sealed'
        ).order_by('-sealed_at').first()
        
        if sealed_workspace:
            workspace_status = WorkspaceService.get_workspace_status(str(sealed_workspace.id))
            serializer = ReflectionStatusResponseSerializer(workspace_status)
            return Response(serializer.data)
        
        # Fallback to most recent draft
        draft_workspace = WorkspaceInstance.objects.filter(
            consultant_user_id=user_id,
            status='draft'
        ).order_by('-created_at').first()
        
        if draft_workspace:
            workspace_status = WorkspaceService.get_workspace_status(str(draft_workspace.id))
            serializer = ReflectionStatusResponseSerializer(workspace_status)
            return Response(serializer.data)
        
        # No workspace found
        return Response({
            'error': 'No reflection workspace found for this user'
        }, status=status.HTTP_404_NOT_FOUND)
