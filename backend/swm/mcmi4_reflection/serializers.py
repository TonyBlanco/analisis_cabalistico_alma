"""
Serializers for MCMI-4 Reflection SWM.
"""

from rest_framework import serializers
from swm.mcmi4_reflection.models import (
    WorkspaceDefinition,
    WorkspaceInstance,
    WorkspaceArtifact,
    WorkspaceAuditLog
)


class WorkspaceDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceDefinition
        fields = ['id', 'name', 'code', 'version', 'description', 'is_active']


class WorkspaceInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceInstance
        fields = [
            'id', 'workspace_definition', 'consultant_user', 'status',
            'linked_test_result_id', 'created_at', 'sealed_at'
        ]
        read_only_fields = ['id', 'created_at', 'sealed_at']


class WorkspaceArtifactSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceArtifact
        fields = [
            'id', 'workspace_instance', 'artifact_type', 'content',
            'created_by', 'created_at', 'updated_at', 'is_sealed'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_sealed']


class WorkspaceAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceAuditLog
        fields = ['id', 'workspace_instance', 'user', 'action', 'timestamp', 'details']
        read_only_fields = ['id', 'timestamp']


class CreateReflectionRequestSerializer(serializers.Serializer):
    linked_test_result_id = serializers.CharField(required=True)
    initial_answers = serializers.DictField(required=False, default=dict)


class CreateReflectionBySignalRequestSerializer(serializers.Serializer):
    subject_user_id = serializers.IntegerField(required=True)
    signal_id = serializers.CharField(required=True)


class UpdateReflectionRequestSerializer(serializers.Serializer):
    answers = serializers.DictField(required=True)


class ReflectionStatusResponseSerializer(serializers.Serializer):
    workspace_id = serializers.UUIDField()
    status = serializers.CharField()
    consultant_user_id = serializers.IntegerField()
    linked_test_result_id = serializers.CharField()
    created_at = serializers.DateTimeField()
    sealed_at = serializers.DateTimeField(allow_null=True)
    can_edit = serializers.BooleanField()
    artifact = serializers.DictField(allow_null=True)
