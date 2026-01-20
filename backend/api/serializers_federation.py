"""Federation Serializers - Proyección normalizada de AnalysisRecord para hubs federados.

NO crea tabla nueva; solo serializa desde AnalysisRecord existente.

Policy: HOLISTIC_FEDERATION_POLICY.md
Contract: FEDERATION_HUBS_CONTRACT.md §2.1, §2.3
"""

from rest_framework import serializers
from api.models import FederationAuditLog


class AnalysisRecordNormalizedSerializer(serializers.Serializer):
    """Serializer de proyección para AnalysisRecordNormalized (sin modelo DB).
    
    Mapea desde AnalysisRecord a schema normalizado para hubs federados.
    """
    
    record_id = serializers.UUIDField(
        help_text='ID del AnalysisRecord original'
    )
    module_code = serializers.CharField(
        max_length=64,
        help_text='Código del módulo (ej: PHQ9, SCDF, MCMI4)'
    )
    kind = serializers.CharField(
        max_length=32,
        help_text='Tipo de análisis (clinical_test, kabbalah, etc.)'
    )
    created_at = serializers.DateTimeField(
        help_text='Timestamp de creación del record'
    )
    visibility = serializers.CharField(
        max_length=16,
        help_text='Visibilidad del record (therapist/patient/both)'
    )
    algorithm_snapshot = serializers.DictField(
        help_text='Snapshot mínimo del algoritmo (engine, version)'
    )
    summary_public = serializers.CharField(
        help_text='Resumen simbólico para consultante (no técnico, no IDs)'
    )
    summary_pro = serializers.CharField(
        help_text='Resumen profesional para terapeuta (puede incluir scores/patterns, NO diagnóstico)'
    )
    tags = serializers.ListField(
        child=serializers.CharField(),
        help_text='Tags/categorías simbólicas (sefirot, arquetipos, etc.)'
    )
    record_ref = serializers.CharField(
        help_text='URI de referencia al record completo'
    )


class HubFeedSnapshotSerializer(serializers.Serializer):
    """Serializer para HubFeedSnapshot completo (respuesta del endpoint).
    
    Schema FEDERATION_HUBS_CONTRACT §2.3
    """
    
    metadata = serializers.DictField(
        help_text='Metadata del feed: feed_id, subject_patient_id, hub_code, scope, date_range, generated_at, records_count'
    )
    records = AnalysisRecordNormalizedSerializer(
        many=True,
        help_text='Lista de AnalysisRecordNormalized'
    )
    audit_log_id = serializers.UUIDField(
        help_text='ID del FederationAuditLog generado para esta lectura'
    )


class FederationAuditLogSerializer(serializers.ModelSerializer):
    """Serializer read-only para FederationAuditLog (compliance reports)."""
    
    requested_by_username = serializers.CharField(
        source='requested_by_user.username',
        read_only=True
    )
    subject_patient_name = serializers.CharField(
        source='subject_patient.full_name',
        read_only=True
    )
    
    class Meta:
        model = FederationAuditLog
        fields = [
            'id',
            'timestamp',
            'requested_by_user',
            'requested_by_username',
            'subject_patient',
            'subject_patient_name',
            'federation_hub',
            'scope',
            'status',
            'records_accessed_count',
            'denial_reason',
            'output_snapshot_id',
        ]
        read_only_fields = '__all__'  # Immutable logs
