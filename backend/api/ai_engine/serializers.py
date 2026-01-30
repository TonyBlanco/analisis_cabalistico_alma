"""
AI Engine Serializers
"""
from rest_framework import serializers
from .models import AIInterpretation, AIAuditLog


class AIInterpretationSerializer(serializers.ModelSerializer):
    """Serializer for AIInterpretation model."""
    
    class Meta:
        model = AIInterpretation
        fields = [
            'id',
            'test_result',
            'patient',
            'interpreter_type',
            'narrative',
            'suggested_diagnoses',
            'therapeutic_route',
            'model_used',
            'prompt_tokens',
            'completion_tokens',
            'total_cost_usd',
            'rag_sources',
            'created_at',
            'created_by',
            'is_cached',
            'cache_hit_count'
        ]
        read_only_fields = fields


class AIAuditLogSerializer(serializers.ModelSerializer):
    """Serializer for AIAuditLog model."""
    
    class Meta:
        model = AIAuditLog
        fields = [
            'id',
            'interpretation',
            'request_type',
            'test_type',
            'user',
            'success',
            'error_message',
            'latency_ms',
            'tokens_used',
            'cost_usd',
            'timestamp'
        ]
        read_only_fields = fields
