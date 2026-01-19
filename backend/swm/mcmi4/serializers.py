"""
DRF Serializers for MCMI-4 Místico SWM.

Following SWM_MCMI4_API_SPEC.md for request/response structures.
"""

from rest_framework import serializers
from swm.mcmi4.models import (
    WorkspaceDefinition,
    WorkspaceInstance,
    WorkspaceSession,
    WorkspaceArtifact,
    WorkspacePermission,
    WorkspaceAuditLog
)
from django.contrib.auth import get_user_model

User = get_user_model()


class WorkspaceDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceDefinition
        fields = ['id', 'name', 'code', 'version', 'description', 'is_active']
        read_only_fields = ['id', 'code']


class WorkspaceInstanceSerializer(serializers.ModelSerializer):
    """Workspace instance with status and metadata."""
    subject_user_id = serializers.UUIDField(source='subject_user.id', read_only=True)
    creator_user_id = serializers.UUIDField(source='creator_user.id', read_only=True)
    
    class Meta:
        model = WorkspaceInstance
        fields = [
            'id', 'workspace_definition', 'subject_user_id', 'creator_user_id',
            'status', 'mcmi4_source_data_id', 'config', 'metadata',
            'created_at', 'started_at', 'sealed_at', 'reviewed_at', 'archived_at'
        ]
        read_only_fields = [
            'id', 'status', 'created_at', 'started_at', 'sealed_at',
            'reviewed_at', 'archived_at'
        ]


class WorkspaceSessionSerializer(serializers.ModelSerializer):
    """Session within workspace."""
    executor_user_id = serializers.UUIDField(source='executor_user.id', read_only=True)
    
    class Meta:
        model = WorkspaceSession
        fields = [
            'id', 'workspace_instance', 'executor_user_id',
            'started_at', 'ended_at', 'session_state',
            'interactions_count', 'current_phase', 'is_active'
        ]
        read_only_fields = [
            'id', 'started_at', 'ended_at', 'executor_user_id'
        ]


class WorkspaceArtifactSerializer(serializers.ModelSerializer):
    """Artifact generated during/after session."""
    created_by_id = serializers.UUIDField(source='created_by.id', read_only=True)
    
    class Meta:
        model = WorkspaceArtifact
        fields = [
            'id', 'workspace_instance', 'session', 'artifact_type',
            'content', 'created_by_id', 'created_at', 'is_sealed', 'metadata'
        ]
        read_only_fields = ['id', 'created_at', 'created_by_id']


class WorkspacePermissionSerializer(serializers.ModelSerializer):
    """Permission on workspace."""
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    granted_by_id = serializers.UUIDField(source='granted_by.id', read_only=True)
    
    class Meta:
        model = WorkspacePermission
        fields = [
            'id', 'workspace_instance', 'user_id', 'permission_type',
            'granted_by_id', 'granted_at', 'revoked_at', 'is_active'
        ]
        read_only_fields = ['id', 'granted_at', 'revoked_at', 'granted_by_id']


class WorkspaceAuditLogSerializer(serializers.ModelSerializer):
    """Audit log entry (read-only)."""
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    
    class Meta:
        model = WorkspaceAuditLog
        fields = [
            'id', 'workspace_instance', 'session', 'user_id',
            'action', 'timestamp', 'details', 'ip_address'
        ]
        read_only_fields = '__all__'


# Request/Response serializers for API endpoints

class CreateWorkspaceRequestSerializer(serializers.Serializer):
    """POST /api/swm/mcmi4/create request."""
    subject_user_id = serializers.IntegerField(min_value=1)
    mcmi4_source_data_id = serializers.CharField(max_length=100)
    config = serializers.JSONField(required=False, default=dict)
    metadata = serializers.JSONField(required=False, default=dict)


class CreateWorkspaceResponseSerializer(serializers.Serializer):
    """POST /api/swm/mcmi4/create response."""
    workspace_id = serializers.UUIDField()
    status = serializers.CharField()
    subject_user_id = serializers.UUIDField()
    creator_user_id = serializers.UUIDField()
    created_at = serializers.DateTimeField()
    mcmi4_source_data_id = serializers.CharField()


class StartSessionRequestSerializer(serializers.Serializer):
    """POST /api/swm/mcmi4/start request."""
    workspace_id = serializers.UUIDField()


class StartSessionResponseSerializer(serializers.Serializer):
    """POST /api/swm/mcmi4/start response."""
    session_id = serializers.UUIDField()
    workspace_id = serializers.UUIDField()
    executor_user_id = serializers.UUIDField()
    started_at = serializers.DateTimeField()
    current_phase = serializers.CharField()
    session_state = serializers.JSONField()


class ProgressRequestSerializer(serializers.Serializer):
    """POST /api/swm/mcmi4/progress request."""
    workspace_id = serializers.UUIDField()
    session_id = serializers.UUIDField()
    action = serializers.ChoiceField(choices=['advance_phase', 'record_decision', 'generate_artifact'])
    payload = serializers.JSONField()


class ProgressResponseSerializer(serializers.Serializer):
    """POST /api/swm/mcmi4/progress response."""
    session_id = serializers.UUIDField()
    current_phase = serializers.CharField()
    session_state = serializers.JSONField()
    interactions_count = serializers.IntegerField()
    artifact_created = serializers.UUIDField(required=False, allow_null=True)


class SealWorkspaceRequestSerializer(serializers.Serializer):
    """POST /api/swm/mcmi4/seal request."""
    workspace_id = serializers.UUIDField()
    session_id = serializers.UUIDField()
    final_synthesis = serializers.JSONField()


class SealWorkspaceResponseSerializer(serializers.Serializer):
    """POST /api/swm/mcmi4/seal response."""
    workspace_id = serializers.UUIDField()
    status = serializers.CharField()
    sealed_at = serializers.DateTimeField()
    session_summary = serializers.JSONField()
    synthesis_report_id = serializers.UUIDField()


class WorkspaceStatusResponseSerializer(serializers.Serializer):
    """GET /api/swm/mcmi4/status response."""
    workspace_id = serializers.UUIDField()
    status = serializers.CharField()
    subject_user_id = serializers.UUIDField()
    creator_user_id = serializers.UUIDField()
    created_at = serializers.DateTimeField()
    started_at = serializers.DateTimeField(allow_null=True)
    sealed_at = serializers.DateTimeField(allow_null=True)
    reviewed_at = serializers.DateTimeField(allow_null=True)
    active_session = serializers.JSONField(allow_null=True)
    permissions = serializers.ListField(child=serializers.JSONField())
    artifacts_count = serializers.JSONField()


# ========== QUESTIONNAIRE API SERIALIZERS (FASE 2) ==========

class QuestionnaireQuerySerializer(serializers.Serializer):
    """GET /api/swm/mcmi4/questionnaire query params."""
    workspace_id = serializers.UUIDField(required=True)


class QuestionnaireResponseSerializer(serializers.Serializer):
    """GET /api/swm/mcmi4/questionnaire response."""
    workspace_id = serializers.UUIDField()
    status = serializers.CharField()
    questionnaire = serializers.JSONField()
    current_progress = serializers.JSONField()


class ProgressQuerySerializer(serializers.Serializer):
    """GET /api/swm/mcmi4/progress query params."""
    workspace_id = serializers.UUIDField(required=True)
    session_id = serializers.UUIDField(required=False, allow_null=True)


class ProgressGetResponseSerializer(serializers.Serializer):
    """GET /api/swm/mcmi4/progress response."""
    workspace_id = serializers.UUIDField()
    session_id = serializers.UUIDField(allow_null=True)
    session_status = serializers.CharField(allow_null=True)
    current_progress = serializers.JSONField()
    responses = serializers.JSONField()


class ProgressActionSerializer(serializers.Serializer):
    """POST /api/swm/mcmi4/progress request (save_response or change_world)."""
    workspace_id = serializers.UUIDField(required=True)
    session_id = serializers.UUIDField(required=True)
    action = serializers.ChoiceField(
        choices=['save_response', 'change_world'],
        required=True
    )
    payload = serializers.JSONField(required=True)
    
    def validate_payload(self, value):
        """Validate payload based on action."""
        action = self.initial_data.get('action')
        
        if action == 'save_response':
            required_fields = ['question_id', 'value', 'world']
            for field in required_fields:
                if field not in value:
                    raise serializers.ValidationError(
                        f"payload.{field} required for save_response action"
                    )
            
            # Validate value range
            if not isinstance(value['value'], int) or value['value'] < 1 or value['value'] > 5:
                raise serializers.ValidationError(
                    "payload.value must be integer between 1-5"
                )
        
        elif action == 'change_world':
            if 'target_world' not in value:
                raise serializers.ValidationError(
                    "payload.target_world required for change_world action"
                )
            
            valid_worlds = ['atzilut', 'briah', 'yetzirah', 'assiah']
            if value['target_world'] not in valid_worlds:
                raise serializers.ValidationError(
                    f"payload.target_world must be one of {valid_worlds}"
                )
        
        return value


class ProgressActionResponseSerializer(serializers.Serializer):
    """POST /api/swm/mcmi4/progress response."""
    success = serializers.BooleanField()
    action = serializers.CharField()
    current_progress = serializers.JSONField(required=False)
    next_question = serializers.JSONField(required=False, allow_null=True)
    current_world = serializers.CharField(required=False)
    first_question = serializers.JSONField(required=False, allow_null=True)


class SealQuestionnaireRequestSerializer(serializers.Serializer):
    """POST /api/swm/mcmi4/seal request (extended for questionnaire)."""
    workspace_id = serializers.UUIDField(required=True)
    session_id = serializers.UUIDField(required=False, allow_null=True)
    final_synthesis = serializers.JSONField(required=False, default=dict)
