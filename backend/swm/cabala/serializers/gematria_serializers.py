"""
Gematria Reading Serializers for API.
"""

from rest_framework import serializers
from ..gematria_models import GematriaReading, GematriaSynthesis


class GematriaReadingSerializer(serializers.ModelSerializer):
    """Full serializer for GematriaReading"""
    
    method_display = serializers.CharField(source='get_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    therapist_name = serializers.CharField(source='therapist.get_full_name', read_only=True)
    
    class Meta:
        model = GematriaReading
        fields = [
            'id', 'patient', 'patient_name', 'therapist', 'therapist_name',
            'method', 'method_display', 'status', 'status_display',
            'input_name', 'input_birth_date', 'hebrew_transliteration',
            'calculated_numbers', 'calculation_details', 'sefirotic_correspondence',
            'number_interpretations', 'method_interpretation',
            'therapist_notes', 'therapist_interpretation', 'highlights',
            'ai_interpretation', 'ai_generated_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'therapist']


class GematriaReadingCreateSerializer(serializers.Serializer):
    """Serializer for creating a new reading"""
    
    patient_id = serializers.IntegerField()
    method = serializers.ChoiceField(choices=GematriaReading.METHOD_CHOICES)
    input_name = serializers.CharField(max_length=200)
    input_birth_date = serializers.DateField(required=False, allow_null=True)
    hebrew_transliteration = serializers.CharField(max_length=200, required=False, default='')
    calculated_numbers = serializers.JSONField()
    calculation_details = serializers.JSONField(required=False, default=dict)
    sefirotic_correspondence = serializers.JSONField(required=False, default=dict)
    number_interpretations = serializers.JSONField(required=False, default=dict)
    method_interpretation = serializers.CharField(required=False, default='')
    therapist_notes = serializers.CharField(required=False, default='')


class GematriaReadingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing readings"""
    
    method_display = serializers.CharField(source='get_method_display', read_only=True)
    summary = serializers.SerializerMethodField()
    
    class Meta:
        model = GematriaReading
        fields = [
            'id', 'method', 'method_display', 'input_name',
            'calculated_numbers', 'status', 'summary', 'created_at',
        ]
    
    def get_summary(self, obj):
        """Generate a brief summary of the reading"""
        nums = obj.calculated_numbers or {}
        parts = []
        for key in ['esencia', 'expresion', 'caminoVida']:
            if key in nums and nums[key]:
                val = nums[key].get('reducido')
                if val:
                    parts.append(f"{key[0].upper()}:{val}")
        return ' | '.join(parts) if parts else 'Sin datos'


class GematriaSynthesisSerializer(serializers.ModelSerializer):
    """Full serializer for GematriaSynthesis"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    readings_count = serializers.IntegerField(read_only=True)
    methods_covered = serializers.ListField(read_only=True)
    readings = GematriaReadingListSerializer(many=True, read_only=True)
    
    class Meta:
        model = GematriaSynthesis
        fields = [
            'id', 'patient', 'patient_name', 'therapist',
            'status', 'status_display', 'title',
            'readings', 'readings_count', 'methods_covered',
            'ai_synthesis', 'ai_narrative',
            'cross_swm_sources', 'cross_swm_synthesis',
            'dominant_numbers', 'recurring_sefirot', 'archetypal_patterns',
            'shadow_themes', 'light_themes', 'tikun_suggestions',
            'therapist_validation', 'therapist_notes', 'therapist_edits',
            'exported_to_holistic', 'exported_at', 'holistic_record_id',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'therapist',
            'ai_synthesis', 'ai_narrative', 'readings_count', 'methods_covered',
        ]


class GematriaSynthesisCreateSerializer(serializers.Serializer):
    """Serializer for creating a new synthesis"""
    
    patient_id = serializers.IntegerField()
    reading_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        help_text='Specific reading IDs to include. If empty, includes all readings.',
    )
    include_cross_swm = serializers.BooleanField(default=True)
    title = serializers.CharField(max_length=200, default='Síntesis Gematrica')


class GematriaSynthesisExportSerializer(serializers.Serializer):
    """Serializer for exporting synthesis to holistic"""
    
    synthesis_id = serializers.UUIDField()
