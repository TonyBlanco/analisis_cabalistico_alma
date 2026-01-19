"""
Process status endpoint for MCMI-4.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from api.test_models import TestResult, Assignment
from swm.mcmi4.models import WorkspaceInstance as McmiWorkspace
from swm.mcmi4_reflection.models import WorkspaceInstance as ReflectionWorkspace

User = get_user_model()


class ProcessStatusView(APIView):
    """
    GET /api/swm/mcmi4/status/<int:user_id>/
    
    Returns real process state for MCMI-4 workflow using TestResult as source of truth.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        """Get MCMI-4 process status for user."""
        # Verify user exists
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check assignment
        assignment_exists = Assignment.objects.filter(
            subject_user_id=user_id,
            test_type='mcmi4-signal'
        ).exists()
        
        # Check signal (most recent TestResult)
        signal_result = TestResult.objects.filter(
            user_id=user_id,
            test_module__code='mcmi4-signal'
        ).order_by('-created_at').first()
        
        signal_data = {
            'exists': signal_result is not None,
            'test_result_id': signal_result.id if signal_result else None,
            'completed_at': signal_result.created_at.isoformat() if signal_result else None
        }
        
        # Check reflection (prefer sealed over draft)
        reflection_sealed = ReflectionWorkspace.objects.filter(
            consultant_user_id=user_id,
            status='sealed'
        ).order_by('-sealed_at').first()
        
        reflection_draft = ReflectionWorkspace.objects.filter(
            consultant_user_id=user_id,
            status='draft'
        ).order_by('-created_at').first()
        
        reflection_ws = reflection_sealed or reflection_draft
        
        reflection_data = {
            'exists': reflection_ws is not None,
            'workspace_id': str(reflection_ws.id) if reflection_ws else None,
            'sealed': reflection_ws.status == 'sealed' if reflection_ws else False
        }
        
        # Check workspace (místico)
        workspace = McmiWorkspace.objects.filter(
            subject_user_id=user_id
        ).order_by('-created_at').first()
        
        workspace_data = {
            'exists': workspace is not None,
            'workspace_id': str(workspace.id) if workspace else None
        }
        
        return Response({
            'assignment': {
                'exists': assignment_exists
            },
            'signal': signal_data,
            'reflection': reflection_data,
            'workspace': workspace_data
        })
