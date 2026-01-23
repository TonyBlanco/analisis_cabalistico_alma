"""
Django REST Framework Serializers for SWM Tarot Evolutivo.

Handles serialization and validation of workspace data
for the REST API endpoints.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

from swm.tarot.models import (
    WorkspaceDefinition,
    WorkspaceInstance,
    WorkspaceSession,
    WorkspaceArtifact,
    WorkspacePermission,
    WorkspaceAuditLog,
    SpreadType,
    TarotSystem,
    WorkspaceStatus,
    ArtifactType,
    PermissionLevel,
    SessionPhase,
)

User = get_user_model()


# =============================================================================
# USER SERIALIZERS
# =============================================================================

class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user info for embedding in other serializers."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = fields


# =============================================================================
# WORKSPACE DEFINITION
# =============================================================================

class WorkspaceDefinitionSerializer(serializers.ModelSerializer):
    """Serializer for WorkspaceDefinition model."""
    
    class Meta:
        model = WorkspaceDefinition
        fields = [
            'id', 'code', 'name', 'description', 'version',
            'config_schema', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = fields


# =============================================================================
# WORKSPACE INSTANCE
# =============================================================================

class WorkspaceInstanceSerializer(serializers.ModelSerializer):
    """Serializer for WorkspaceInstance model."""
    
    definition = WorkspaceDefinitionSerializer(read_only=True)
    subject_user = UserMinimalSerializer(read_only=True)
    creator_user = UserMinimalSerializer(read_only=True)
    spread_type_display = serializers.CharField(
        source='get_spread_type_display',
        read_only=True
    )
    tarot_system_display = serializers.CharField(
        source='get_tarot_system_display',
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    
    class Meta:
        model = WorkspaceInstance
        fields = [
            'id', 'definition', 'subject_user', 'creator_user',
            'spread_type', 'spread_type_display',
            'tarot_system', 'tarot_system_display',
            'total_cards', 'has_reversed',
            'status', 'status_display', 'config',
            'created_at', 'updated_at', 'started_at', 'sealed_at', 'reviewed_at'
        ]
        read_only_fields = [
            'id', 'definition', 'subject_user', 'creator_user',
            'status', 'created_at', 'updated_at', 'started_at', 'sealed_at', 'reviewed_at'
        ]


class WorkspaceInstanceCreateSerializer(serializers.Serializer):
    """Serializer for creating a new workspace instance."""
    
    subject_user_id = serializers.IntegerField(
        help_text="ID of the patient (subject)"
    )
    spread_type = serializers.ChoiceField(
        choices=SpreadType.choices,
        default=SpreadType.FREE,
        required=False
    )
    tarot_system = serializers.ChoiceField(
        choices=TarotSystem.choices,
        default=TarotSystem.RIDER_WAITE,
        required=False
    )
    has_reversed = serializers.BooleanField(
        default=True,
        required=False
    )
    config = serializers.JSONField(
        default=dict,
        required=False
    )
    
    def validate_subject_user_id(self, value):
        """Validate that subject user exists."""
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Subject user not found")
        return value


class WorkspaceInstanceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing workspaces."""
    
    subject_user = UserMinimalSerializer(read_only=True)
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    spread_type_display = serializers.CharField(
        source='get_spread_type_display',
        read_only=True
    )
    
    class Meta:
        model = WorkspaceInstance
        fields = [
            'id', 'subject_user', 'spread_type', 'spread_type_display',
            'tarot_system', 'total_cards', 'status', 'status_display',
            'created_at', 'sealed_at'
        ]
        read_only_fields = fields


# =============================================================================
# WORKSPACE SESSION
# =============================================================================

class WorkspaceSessionSerializer(serializers.ModelSerializer):
    """Serializer for WorkspaceSession model."""
    
    user = UserMinimalSerializer(read_only=True)
    phase_display = serializers.CharField(
        source='get_phase_display',
        read_only=True
    )
    
    class Meta:
        model = WorkspaceSession
        fields = [
            'id', 'user', 'phase', 'phase_display',
            'is_active', 'progress_data',
            'started_at', 'ended_at', 'last_activity_at'
        ]
        read_only_fields = fields


# =============================================================================
# WORKSPACE ARTIFACT
# =============================================================================

class WorkspaceArtifactSerializer(serializers.ModelSerializer):
    """Serializer for WorkspaceArtifact model."""
    
    created_by = UserMinimalSerializer(read_only=True)
    artifact_type_display = serializers.CharField(
        source='get_artifact_type_display',
        read_only=True
    )
    
    class Meta:
        model = WorkspaceArtifact
        fields = [
            'id', 'artifact_type', 'artifact_type_display',
            'content', 'is_sealed', 'version',
            'created_by', 'created_at', 'updated_at', 'sealed_at'
        ]
        read_only_fields = fields


class SaveSpreadSerializer(serializers.Serializer):
    """Serializer for saving a Tarot spread."""
    
    instance_id = serializers.UUIDField()
    spread_type = serializers.ChoiceField(
        choices=SpreadType.choices,
        required=False
    )
    tarot_system = serializers.ChoiceField(
        choices=TarotSystem.choices,
        required=False
    )
    cards = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        help_text="Array of card objects with position, card_id, reversed, etc."
    )
    therapist_notes = serializers.CharField(
        required=False,
        allow_blank=True,
        default=''
    )
    session_context = serializers.CharField(
        required=False,
        allow_blank=True,
        default=''
    )
    
    def validate_cards(self, value):
        """Validate card data structure."""
        positions_seen = set()
        
        for i, card in enumerate(value):
            # Required fields
            if 'position' not in card:
                raise serializers.ValidationError(
                    f"Card at index {i} missing 'position'"
                )
            if 'card_id' not in card:
                raise serializers.ValidationError(
                    f"Card at index {i} missing 'card_id'"
                )
            
            # Check for duplicate positions
            pos = card['position']
            if pos in positions_seen:
                raise serializers.ValidationError(
                    f"Duplicate position {pos} found"
                )
            positions_seen.add(pos)
            
            # Validate reversed is boolean if present
            if 'reversed' in card and not isinstance(card['reversed'], bool):
                raise serializers.ValidationError(
                    f"Card at position {pos}: 'reversed' must be boolean"
                )
        
        return value


# =============================================================================
# WORKSPACE PERMISSION
# =============================================================================

class WorkspacePermissionSerializer(serializers.ModelSerializer):
    """Serializer for WorkspacePermission model."""
    
    user = UserMinimalSerializer(read_only=True)
    granted_by = UserMinimalSerializer(read_only=True)
    revoked_by = UserMinimalSerializer(read_only=True)
    level_display = serializers.CharField(
        source='get_level_display',
        read_only=True
    )
    
    class Meta:
        model = WorkspacePermission
        fields = [
            'id', 'user', 'level', 'level_display',
            'granted_by', 'granted_at',
            'is_active', 'revoked_at', 'revoked_by'
        ]
        read_only_fields = fields


class GrantPermissionSerializer(serializers.Serializer):
    """Serializer for granting permission."""
    
    instance_id = serializers.UUIDField()
    user_id = serializers.IntegerField()
    level = serializers.ChoiceField(choices=PermissionLevel.choices)
    
    def validate_user_id(self, value):
        """Validate that user exists."""
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        return value


class RevokePermissionSerializer(serializers.Serializer):
    """Serializer for revoking permission."""
    
    instance_id = serializers.UUIDField()
    user_id = serializers.IntegerField()
    level = serializers.ChoiceField(choices=PermissionLevel.choices)


# =============================================================================
# WORKSPACE AUDIT LOG
# =============================================================================

class WorkspaceAuditLogSerializer(serializers.ModelSerializer):
    """Serializer for WorkspaceAuditLog model."""
    
    user = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = WorkspaceAuditLog
        fields = [
            'id', 'action', 'user', 'details',
            'ip_address', 'timestamp'
        ]
        read_only_fields = fields


# =============================================================================
# ACTION SERIALIZERS
# =============================================================================

class InstanceActionSerializer(serializers.Serializer):
    """Base serializer for actions requiring instance_id."""
    
    instance_id = serializers.UUIDField()


class StartSessionSerializer(InstanceActionSerializer):
    """Serializer for starting a session."""
    pass


class SealWorkspaceSerializer(InstanceActionSerializer):
    """Serializer for sealing a workspace."""
    pass


class ReviewWorkspaceSerializer(InstanceActionSerializer):
    """Serializer for reviewing a workspace."""
    pass
