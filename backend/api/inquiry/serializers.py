"""
Active Inquiry Engine - Serializers
"""

from rest_framework import serializers
from .models import InquiryDefinition, PatientInquiryResponse


class InquiryDefinitionSerializer(serializers.ModelSerializer):
    """Serializer for InquiryDefinition (read-only for public endpoints)."""
    
    class Meta:
        model = InquiryDefinition
        fields = [
            'id', 'code', 'source_module', 'priority', 'category',
            'question_type', 'question_text', 'question_text_short',
            'help_text', 'placeholder', 'choices', 'scale_labels',
            'validation', 'valid_for_days', 'dynamic', 'applies_per',
            'sensitive', 'opt_out_visible'
        ]
        read_only_fields = fields


class InquiryDefinitionAdminSerializer(serializers.ModelSerializer):
    """Full serializer for admin/management purposes."""
    
    class Meta:
        model = InquiryDefinition
        fields = '__all__'


class PatientInquiryResponseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating responses."""
    
    class Meta:
        model = PatientInquiryResponse
        fields = [
            'patient', 'inquiry', 'session', 'response_value',
            'collected_by', 'related_entity_type', 'related_entity_id'
        ]
    
    def validate_response_value(self, value):
        """Validate response based on inquiry type."""
        inquiry = self.initial_data.get('inquiry')
        if not inquiry:
            return value
        
        try:
            inquiry_def = InquiryDefinition.objects.get(pk=inquiry)
        except InquiryDefinition.DoesNotExist:
            return value
        
        question_type = inquiry_def.question_type
        validation_rules = inquiry_def.validation or {}
        
        # Validate based on question type
        if question_type == 'scale_1_10':
            if not isinstance(value, (int, float)) or not (1 <= value <= 10):
                raise serializers.ValidationError("El valor debe estar entre 1 y 10.")
        
        elif question_type == 'yes_no':
            if value not in [True, False, 'yes', 'no', 'si', 'sí']:
                raise serializers.ValidationError("El valor debe ser sí o no.")
        
        elif question_type in ['text_short', 'text_long']:
            if not isinstance(value, str):
                raise serializers.ValidationError("El valor debe ser texto.")
            
            min_len = validation_rules.get('min_length', 0)
            max_len = validation_rules.get('max_length', 2000)
            
            if len(value) < min_len:
                raise serializers.ValidationError(
                    f"El texto debe tener al menos {min_len} caracteres."
                )
            if len(value) > max_len:
                raise serializers.ValidationError(
                    f"El texto no puede exceder {max_len} caracteres."
                )
        
        elif question_type == 'choice_single':
            valid_values = [c.get('value') for c in (inquiry_def.choices or [])]
            if value not in valid_values:
                raise serializers.ValidationError("Opción no válida.")
        
        elif question_type == 'choice_multi':
            if not isinstance(value, list):
                raise serializers.ValidationError("Debe ser una lista de valores.")
            valid_values = [c.get('value') for c in (inquiry_def.choices or [])]
            for v in value:
                if v not in valid_values:
                    raise serializers.ValidationError(f"Opción no válida: {v}")
        
        return value
    
    def create(self, validated_data):
        # Set collected_by_user from request context
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['collected_by_user'] = request.user
        
        return super().create(validated_data)


class PatientInquiryResponseSerializer(serializers.ModelSerializer):
    """Full serializer for reading responses."""
    
    inquiry_code = serializers.CharField(source='inquiry.code', read_only=True)
    inquiry_question = serializers.CharField(source='inquiry.question_text_short', read_only=True)
    
    class Meta:
        model = PatientInquiryResponse
        fields = [
            'id', 'patient', 'inquiry', 'inquiry_code', 'inquiry_question',
            'session', 'response_value', 'collected_by', 'collected_by_user',
            'collected_at', 'expires_at', 'is_valid',
            'related_entity_type', 'related_entity_id'
        ]
        read_only_fields = ['id', 'collected_at', 'expires_at', 'collected_by_user']


class KnowledgeGapSerializer(serializers.Serializer):
    """Serializer for gap detection results."""
    
    inquiry_code = serializers.CharField()
    inquiry_id = serializers.IntegerField()
    question_text_short = serializers.CharField()
    priority = serializers.CharField()
    source_module = serializers.CharField()
    has_response = serializers.BooleanField()
    response_expired = serializers.BooleanField()
    last_response_date = serializers.DateTimeField(allow_null=True)
