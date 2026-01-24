"""
Transgeneracional Profundo SWM Serializers.

REST API serializers for psychogenealogical workspace.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

from swm.transgenerational.models import (
    TransgenerationalSession,
    FamilyMember,
    FamilyRelationship,
    TransgenerationalPattern,
    SyndromeMark,
    TransgenerationalSnapshot,
    RELATIONSHIP_CHOICES,
    PATTERN_TYPE_CHOICES,
    EVENT_TYPE_CHOICES,
    GENDER_CHOICES,
    MEMBER_STATUS_CHOICES,
)

User = get_user_model()


# ============================================================================
# FAMILY MEMBER SERIALIZERS
# ============================================================================

class FamilyMemberSerializer(serializers.ModelSerializer):
    """Full serializer for FamilyMember."""
    
    relationship_display = serializers.CharField(source='get_relationship_display', read_only=True)
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = FamilyMember
        fields = [
            'id',
            'session',
            'alias',
            'gender',
            'gender_display',
            'relationship',
            'relationship_display',
            'generation',
            'birth_order',
            'status',
            'status_display',
            'birth_year',
            'death_year',
            'significant_events',
            'characteristics',
            'notes',
            'position_x',
            'position_y',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FamilyMemberCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating family members."""
    
    class Meta:
        model = FamilyMember
        fields = [
            'alias',
            'gender',
            'relationship',
            'generation',
            'birth_order',
            'status',
            'birth_year',
            'death_year',
            'significant_events',
            'characteristics',
            'notes',
            'position_x',
            'position_y',
        ]


# ============================================================================
# FAMILY RELATIONSHIP SERIALIZERS
# ============================================================================

class FamilyRelationshipSerializer(serializers.ModelSerializer):
    """Full serializer for FamilyRelationship."""
    
    relationship_type_display = serializers.CharField(source='get_relationship_type_display', read_only=True)
    quality_display = serializers.CharField(source='get_quality_display', read_only=True)
    member_from_alias = serializers.CharField(source='member_from.alias', read_only=True)
    member_to_alias = serializers.CharField(source='member_to.alias', read_only=True)
    
    class Meta:
        model = FamilyRelationship
        fields = [
            'id',
            'session',
            'member_from',
            'member_from_alias',
            'member_to',
            'member_to_alias',
            'relationship_type',
            'relationship_type_display',
            'quality',
            'quality_display',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FamilyRelationshipCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating family relationships."""
    
    class Meta:
        model = FamilyRelationship
        fields = [
            'member_from',
            'member_to',
            'relationship_type',
            'quality',
            'notes',
        ]


# ============================================================================
# PATTERN SERIALIZERS
# ============================================================================

class TransgenerationalPatternSerializer(serializers.ModelSerializer):
    """Full serializer for TransgenerationalPattern."""
    
    pattern_type_display = serializers.CharField(source='get_pattern_type_display', read_only=True)
    members_involved_aliases = serializers.SerializerMethodField()
    
    class Meta:
        model = TransgenerationalPattern
        fields = [
            'id',
            'session',
            'pattern_name',
            'pattern_type',
            'pattern_type_display',
            'members_involved',
            'members_involved_aliases',
            'generations_affected',
            'description',
            'therapist_notes',
            'is_acknowledged',
            'is_worked',
            'intensity',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_members_involved_aliases(self, obj):
        return [m.alias for m in obj.members_involved.all()]


class TransgenerationalPatternCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating patterns."""
    
    class Meta:
        model = TransgenerationalPattern
        fields = [
            'pattern_name',
            'pattern_type',
            'members_involved',
            'generations_affected',
            'description',
            'therapist_notes',
            'intensity',
        ]


# ============================================================================
# SYNDROME MARK SERIALIZERS
# ============================================================================

class SyndromeMarkSerializer(serializers.ModelSerializer):
    """Full serializer for SyndromeMark."""
    
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    original_member_alias = serializers.CharField(source='original_member.alias', read_only=True, allow_null=True)
    
    class Meta:
        model = SyndromeMark
        fields = [
            'id',
            'session',
            'event_type',
            'event_type_display',
            'original_member',
            'original_member_alias',
            'original_date',
            'original_year',
            'recurring_pattern',
            'recurring_dates',
            'significance',
            'therapist_notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SyndromeMarkCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating syndrome marks."""
    
    class Meta:
        model = SyndromeMark
        fields = [
            'event_type',
            'original_member',
            'original_date',
            'original_year',
            'recurring_pattern',
            'recurring_dates',
            'significance',
            'therapist_notes',
        ]


# ============================================================================
# SNAPSHOT SERIALIZERS
# ============================================================================

class TransgenerationalSnapshotSerializer(serializers.ModelSerializer):
    """Serializer for session snapshots."""
    
    class Meta:
        model = TransgenerationalSnapshot
        fields = [
            'id',
            'session',
            'genogram_data',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


# ============================================================================
# SESSION SERIALIZERS
# ============================================================================

class TransgenerationalSessionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing sessions."""
    
    patient_username = serializers.CharField(source='patient.username', read_only=True)
    therapist_username = serializers.CharField(source='therapist.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    member_count = serializers.IntegerField(read_only=True)
    pattern_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = TransgenerationalSession
        fields = [
            'id',
            'patient',
            'patient_username',
            'therapist',
            'therapist_username',
            'title',
            'status',
            'status_display',
            'is_closed',
            'member_count',
            'pattern_count',
            'focus_areas',
            'created_at',
            'updated_at',
        ]


class TransgenerationalSessionDetailSerializer(serializers.ModelSerializer):
    """Full serializer for session detail view."""
    
    patient_username = serializers.CharField(source='patient.username', read_only=True)
    therapist_username = serializers.CharField(source='therapist.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    family_members = FamilyMemberSerializer(many=True, read_only=True)
    family_relationships = FamilyRelationshipSerializer(many=True, read_only=True)
    patterns = TransgenerationalPatternSerializer(many=True, read_only=True)
    syndrome_marks = SyndromeMarkSerializer(many=True, read_only=True)
    
    class Meta:
        model = TransgenerationalSession
        fields = [
            'id',
            'patient',
            'patient_username',
            'therapist',
            'therapist_username',
            'title',
            'status',
            'status_display',
            'genogram_data',
            'session_notes',
            'focus_areas',
            'is_closed',
            'member_count',
            'pattern_count',
            'family_members',
            'family_relationships',
            'patterns',
            'syndrome_marks',
            'created_at',
            'updated_at',
            'started_at',
            'closed_at',
        ]


class TransgenerationalSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new session."""
    
    class Meta:
        model = TransgenerationalSession
        fields = [
            'patient',
            'title',
            'genogram_data',
            'session_notes',
            'focus_areas',
        ]


class TransgenerationalSessionUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating session."""
    
    class Meta:
        model = TransgenerationalSession
        fields = [
            'title',
            'genogram_data',
            'session_notes',
            'focus_areas',
        ]


class GenogramUpdateSerializer(serializers.Serializer):
    """Serializer for updating only the genogram_data."""
    
    genogram_data = serializers.JSONField(required=True)
    create_snapshot = serializers.BooleanField(default=False)
    snapshot_notes = serializers.CharField(required=False, allow_blank=True, default='')
