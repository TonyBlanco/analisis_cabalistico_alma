"""
API views for MCMI-4 Reflection SWM.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from api.test_models import TestResult, Assignment
from swm.mcmi4_reflection.models import WorkspaceInstance
from swm.mcmi4_reflection.services.workspace_service import WorkspaceService
from swm.mcmi4_reflection.serializers import (
    CreateReflectionRequestSerializer,
    CreateReflectionBySignalRequestSerializer,
    UpdateReflectionRequestSerializer,
    ReflectionStatusResponseSerializer
)

User = get_user_model()

def _has_therapist_read_access(user: User, workspace: WorkspaceInstance) -> bool:
    """
    Therapist read-only access is granted if the therapist is linked via Assignment
    to the subject (consultant_user) for mcmi4-signal.
    """
    return Assignment.objects.filter(
        subject_user=workspace.consultant_user,
        assigned_by_user=user,
        test_type='mcmi4-signal'
    ).exists() or Assignment.objects.filter(
        subject_user=workspace.consultant_user,
        assigned_to_user=user,
        test_type='mcmi4-signal'
    ).exists()


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


class CreateReflectionBySignalView(APIView):
    """
    POST /api/swm/mcmi4-reflection/create-by-signal
    
    Create or reuse reflection workspace for a given subject_user and signal TestResult.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateReflectionBySignalRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        subject_user_id = serializer.validated_data['subject_user_id']
        signal_id = serializer.validated_data['signal_id']

        try:
            subject_user = User.objects.get(id=subject_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'subject_user_id must reference an existing user'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            signal_pk = int(signal_id)
        except (TypeError, ValueError):
            return Response(
                {'error': 'signal_id must be a valid TestResult id'},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        test_result = TestResult.objects.select_related('test_module').filter(pk=signal_pk).first()
        if not test_result:
            return Response(
                {'error': f'Signal TestResult {signal_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if test_result.user_id != subject_user.id:
            return Response(
                {'error': 'signal_id must belong to subject_user_id'},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        if not test_result.test_module or test_result.test_module.code != 'mcmi4-signal':
            return Response(
                {'error': "signal_id must reference a TestResult whose test_module.code is 'mcmi4-signal'"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        existing_workspace = WorkspaceInstance.objects.filter(
            consultant_user=subject_user,
            linked_test_result_id=str(signal_pk)
        ).first()

        if existing_workspace:
            workspace_status = WorkspaceService.get_workspace_status(str(existing_workspace.id))
            response_serializer = ReflectionStatusResponseSerializer(workspace_status)
            data = response_serializer.data
            data['existing'] = True
            return Response(data, status=status.HTTP_200_OK)

        try:
            workspace, artifact = WorkspaceService.create_workspace(
                consultant_user=subject_user,
                linked_test_result_id=str(signal_pk),
                initial_answers={},
                request_context={
                    'ip_address': self.get_client_ip(request),
                    'requested_by': request.user.id
                }
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        workspace_status = WorkspaceService.get_workspace_status(str(workspace.id))
        response_serializer = ReflectionStatusResponseSerializer(workspace_status)
        data = response_serializer.data
        data['created'] = True
        data['artifact_id'] = str(artifact.id)
        return Response(data, status=status.HTTP_201_CREATED)

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
            if workspace.consultant_user != request.user and not _has_therapist_read_access(request.user, workspace):
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

        # Only consultant (subject_user) can edit
        if workspace.consultant_user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
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

        # Only consultant (subject_user) can seal
        if workspace.consultant_user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
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
