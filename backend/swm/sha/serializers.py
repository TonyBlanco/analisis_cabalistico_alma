"""Serializers for SHA workspace flows."""

from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import WorkspaceInstance, WorkspaceArtifact

User = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class WorkspaceInstanceSerializer(serializers.ModelSerializer):
    subject_user = UserMinimalSerializer(read_only=True)
    creator_user = UserMinimalSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = WorkspaceInstance
        fields = [
            'id', 'subject_user', 'creator_user', 'status', 'status_display',
            'config', 'metadata', 'created_at', 'started_at', 'sealed_at', 'reviewed_at'
        ]


class WorkspaceInstanceListSerializer(serializers.ModelSerializer):
    subject_user = UserMinimalSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = WorkspaceInstance
        fields = [
            'id', 'subject_user', 'status', 'status_display', 'created_at', 'sealed_at'
        ]


class CreateWorkspaceRequestSerializer(serializers.Serializer):
    subject_user_id = serializers.IntegerField()
    config = serializers.JSONField(required=False)
    metadata = serializers.JSONField(required=False)


class CreateWorkspaceResponseSerializer(serializers.Serializer):
    workspace_id = serializers.UUIDField()
    status = serializers.CharField()
    subject_user_id = serializers.IntegerField()
    creator_user_id = serializers.IntegerField()
    created_at = serializers.DateTimeField()


class SaveArtifactRequestSerializer(serializers.Serializer):
    instance_id = serializers.UUIDField()
    artifact_type = serializers.ChoiceField(choices=[
        'balance_map', 'therapist_notes', 'patient_submission', 'consultant_guide'
    ])
    content = serializers.JSONField()
    share_with_consultant = serializers.BooleanField(required=False, default=False)


class ArtifactSerializer(serializers.ModelSerializer):
    artifact_type_display = serializers.CharField(source='get_artifact_type_display', read_only=True)
    created_by = UserMinimalSerializer(read_only=True)

    class Meta:
        model = WorkspaceArtifact
        fields = [
            'id', 'artifact_type', 'artifact_type_display', 'content', 'is_sealed',
            'share_with_consultant', 'is_patient_submission', 'version',
            'created_at', 'updated_at', 'sealed_at', 'created_by'
        ]


class SealWorkspaceRequestSerializer(serializers.Serializer):
    instance_id = serializers.UUIDField()


class InstanceActionRequestSerializer(serializers.Serializer):
    instance_id = serializers.UUIDField()
