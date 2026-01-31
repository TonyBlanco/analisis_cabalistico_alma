"""
Cábala Aplicada SWM Serializers.

REST API serializers for Tree of Life workspace.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

from swm.cabala.models import (
    CabalaSession,
    SefirahObservation,
    PathObservation,
    CabalaSessionSnapshot,
    SEFIRAH_CHOICES,
    PATH_CHOICES,
    METHOD_CHOICES,
    EMOTION_TYPE_CHOICES,
    FLOW_DIRECTION_CHOICES,
)

User = get_user_model()


# ============================================================================
# SEFIRAH OBSERVATION SERIALIZERS
# ============================================================================

class SefirahObservationSerializer(serializers.ModelSerializer):
    """Full serializer for SefirahObservation."""
    
    sefirah_display = serializers.CharField(source='get_sefirah_name_display', read_only=True)
    emotion_display = serializers.CharField(source='get_emotion_type_display', read_only=True)
    
    class Meta:
        model = SefirahObservation
        fields = [
            'id',
            'session',
            'sefirah_name',
            'sefirah_display',
            'observation',
            'intensity',
            'emotion_type',
            'emotion_display',
            'is_blocked',
            'is_activated',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SefirahObservationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating sefirah observations."""
    
    class Meta:
        model = SefirahObservation
        fields = [
            'sefirah_name',
            'observation',
            'intensity',
            'emotion_type',
            'is_blocked',
            'is_activated',
        ]
    
    def validate_sefirah_name(self, value):
        valid_names = [choice[0] for choice in SEFIRAH_CHOICES]
        if value not in valid_names:
            raise serializers.ValidationError(
                f"sefirah_name must be one of: {', '.join(valid_names)}"
            )
        return value


# ============================================================================
# PATH OBSERVATION SERIALIZERS
# ============================================================================

class PathObservationSerializer(serializers.ModelSerializer):
    """Full serializer for PathObservation."""
    
    path_display = serializers.CharField(source='get_path_index_display', read_only=True)
    flow_display = serializers.CharField(source='get_flow_direction_display', read_only=True)
    
    class Meta:
        model = PathObservation
        fields = [
            'id',
            'session',
            'path_index',
            'path_display',
            'flow_direction',
            'flow_display',
            'observation',
            'is_blocked',
            'is_active',
            'tarot_card',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PathObservationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating path observations."""
    
    class Meta:
        model = PathObservation
        fields = [
            'path_index',
            'flow_direction',
            'observation',
            'is_blocked',
            'is_active',
            'tarot_card',
        ]
    
    def validate_path_index(self, value):
        if value < 0 or value > 21:
            raise serializers.ValidationError("path_index must be between 0 and 21")
        return value


# ============================================================================
# SESSION SNAPSHOT SERIALIZER
# ============================================================================

class CabalaSessionSnapshotSerializer(serializers.ModelSerializer):
    """Serializer for session snapshots."""
    
    class Meta:
        model = CabalaSessionSnapshot
        fields = [
            'id',
            'session',
            'tree_state',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


# ============================================================================
# CABALA SESSION SERIALIZERS
# ============================================================================

class CabalaSessionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing sessions."""
    
    patient_username = serializers.CharField(source='patient.username', read_only=True)
    therapist_username = serializers.CharField(source='therapist.username', read_only=True)
    method_display = serializers.CharField(source='get_method_id_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    observation_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = CabalaSession
        fields = [
            'id',
            'patient',
            'patient_username',
            'therapist',
            'therapist_username',
            'title',
            'method_id',
            'method_display',
            'status',
            'status_display',
            'is_closed',
            'duration_minutes',
            'observation_count',
            'created_at',
            'updated_at',
        ]


class CabalaSessionDetailSerializer(serializers.ModelSerializer):
    """Full serializer for session detail view."""
    
    patient_username = serializers.CharField(source='patient.username', read_only=True)
    therapist_username = serializers.CharField(source='therapist.username', read_only=True)
    method_display = serializers.CharField(source='get_method_id_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    sefirah_observations = SefirahObservationSerializer(many=True, read_only=True)
    path_observations = PathObservationSerializer(many=True, read_only=True)
    
    class Meta:
        model = CabalaSession
        fields = [
            'id',
            'patient',
            'patient_username',
            'therapist',
            'therapist_username',
            'title',
            'method_id',
            'method_display',
            'status',
            'status_display',
            'tree_state',
            'session_notes',
            'clinical_context',
            'is_closed',
            'duration_minutes',
            'sefirah_observations',
            'path_observations',
            'created_at',
            'updated_at',
            'started_at',
            'closed_at',
        ]


class CabalaSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new session."""
    
    class Meta:
        model = CabalaSession
        fields = [
            'patient',
            'title',
            'method_id',
            'tree_state',
            'session_notes',
            'clinical_context',
        ]
    
    def validate_method_id(self, value):
        valid_methods = [choice[0] for choice in METHOD_CHOICES]
        if value not in valid_methods:
            raise serializers.ValidationError(
                f"method_id must be one of: {', '.join(valid_methods)}"
            )
        return value


class CabalaSessionUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating session (tree_state, notes)."""
    
    class Meta:
        model = CabalaSession
        fields = [
            'title',
            'tree_state',
            'session_notes',
            'clinical_context',
        ]


class TreeStateUpdateSerializer(serializers.Serializer):
    """Serializer for updating only the tree_state."""
    
    tree_state = serializers.JSONField(required=True)
    create_snapshot = serializers.BooleanField(default=False)
    snapshot_notes = serializers.CharField(required=False, allow_blank=True, default='')


# ============================================================================
# BULK OBSERVATION SERIALIZERS
# ============================================================================

class BulkSefirahObservationSerializer(serializers.Serializer):
    """Serializer for bulk sefirah observation updates."""
    
    observations = SefirahObservationCreateSerializer(many=True)


class BulkPathObservationSerializer(serializers.Serializer):
    """Serializer for bulk path observation updates."""
    
    observations = PathObservationCreateSerializer(many=True)


# ============================================================================
# RESPONSE SERIALIZERS
# ============================================================================

class SefirahChoicesSerializer(serializers.Serializer):
    """Returns available sefirah choices."""
    
    choices = serializers.ListField(read_only=True)


class MethodChoicesSerializer(serializers.Serializer):
    """Returns available method choices."""
    
    choices = serializers.ListField(read_only=True)
