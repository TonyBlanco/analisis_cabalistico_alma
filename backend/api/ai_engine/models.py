"""
AI Engine Models
AIInterpretation and AIAuditLog for tracking AI-generated interpretations
"""
from django.db import models
from django.contrib.auth.models import User
from api.test_models import TestResult
from api.models import Patient


class AIInterpretation(models.Model):
    """
    Stores AI-generated interpretations for test results.
    Therapist-only feature.
    """
    id = models.CharField(max_length=50, primary_key=True)  # e.g., ai_interp_abc123
    test_result = models.ForeignKey(
        TestResult,
        on_delete=models.CASCADE,
        related_name='ai_interpretations'
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    interpreter_type = models.CharField(max_length=50)  # sha_interpreter, mcmi4_interpreter
    
    # Interpretation content (JSON)
    narrative = models.JSONField()  # {summary, key_insights, clinical_concerns, strengths}
    suggested_diagnoses = models.JSONField(default=list)  # [{code, name, probability, evidence}]
    therapeutic_route = models.JSONField()  # {immediate_focus, complementary_modalities, next_assessments}
    
    # Metadata
    model_used = models.CharField(max_length=100, default='gpt-4-turbo-preview')
    prompt_tokens = models.IntegerField(default=0)
    completion_tokens = models.IntegerField(default=0)
    total_cost_usd = models.DecimalField(max_digits=10, decimal_places=6, default=0.0)
    
    # RAG context used
    rag_sources = models.JSONField(default=list)  # List of knowledge base chunks retrieved
    
    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    is_cached = models.BooleanField(default=False)
    cache_hit_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'ai_interpretations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['test_result', '-created_at']),
            models.Index(fields=['patient', '-created_at']),
            models.Index(fields=['interpreter_type']),
        ]
    
    def __str__(self):
        return f"AI Interpretation {self.id} for TestResult {self.test_result_id}"


class AIAuditLog(models.Model):
    """
    Audit log for all AI Engine requests.
    Tracks usage, errors, and costs.
    """
    id = models.AutoField(primary_key=True)
    interpretation = models.ForeignKey(
        AIInterpretation,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    # Request details
    request_type = models.CharField(max_length=50)  # generate_interpretation, retrieve_context
    test_type = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Response details
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    latency_ms = models.IntegerField()  # Response time in milliseconds
    
    # Costs
    tokens_used = models.IntegerField(default=0)
    cost_usd = models.DecimalField(max_digits=10, decimal_places=6, default=0.0)
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ai_audit_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['test_type', '-timestamp']),
            models.Index(fields=['success']),
        ]
    
    def __str__(self):
        status = "✓" if self.success else "✗"
        return f"{status} {self.request_type} by {self.user.username} at {self.timestamp}"
