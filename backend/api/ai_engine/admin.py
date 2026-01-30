"""
AI Engine Admin Configuration
"""
from django.contrib import admin
from .models import AIInterpretation, AIAuditLog


@admin.register(AIInterpretation)
class AIInterpretationAdmin(admin.ModelAdmin):
    """Admin interface for AIInterpretation."""
    
    list_display = [
        'id',
        'test_result',
        'patient',
        'interpreter_type',
        'model_used',
        'total_cost_usd',
        'cache_hit_count',
        'created_at',
        'created_by'
    ]
    list_filter = ['interpreter_type', 'model_used', 'created_at', 'is_cached']
    search_fields = ['id', 'test_result__id', 'patient__full_name', 'created_by__username']
    readonly_fields = [
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
    
    def has_add_permission(self, request):
        """Disable manual creation (only via API)."""
        return False


@admin.register(AIAuditLog)
class AIAuditLogAdmin(admin.ModelAdmin):
    """Admin interface for AIAuditLog."""
    
    list_display = [
        'id',
        'request_type',
        'test_type',
        'user',
        'success',
        'latency_ms',
        'tokens_used',
        'cost_usd',
        'timestamp'
    ]
    list_filter = ['success', 'request_type', 'test_type', 'timestamp']
    search_fields = ['user__username', 'test_type', 'error_message']
    readonly_fields = [
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
    
    def has_add_permission(self, request):
        """Disable manual creation (only via API)."""
        return False
