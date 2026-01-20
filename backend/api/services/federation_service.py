"""Federation Service - Única puerta de entrada para lectura federada cross-workspace.

Implementa guardrails de:
- RBAC (terapeuta autenticado)
- Ownership (terapeuta tiene asignación con paciente)
- Consentimiento (patient.consent_federation == True)
- Scope explícito (date_range, dominios incluidos)
- Auditoría inmutable (FederationAuditLog en cada invocación)

Policy: HOLISTIC_FEDERATION_POLICY.md (v2.0)
Contract: FEDERATION_HUBS_CONTRACT.md
Authorization: FEDERATION_MVP_AUTHORIZATION_PLAN.md
"""

from typing import Dict, List, Optional
from datetime import datetime, date
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied, ValidationError

from api.models import AnalysisRecord, Patient, FederationAuditLog


def get_hub_feed(
    *,
    therapist_user: User,
    patient_id: int,
    hub_code: str,
    scope: Optional[List[str]] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> Dict:
    """Genera HubFeedSnapshot con validaciones y auditoría.
    
    Args:
        therapist_user: Usuario terapeuta autenticado (ya validado por view)
        patient_id: ID del paciente cuya información se consulta
        hub_code: Código del hub consumidor (MSHE|SCDF|SCID5)
        scope: Lista de dominios/scopes a incluir (opcional, default: ["analysis_records_summary"])
        date_from: Fecha inicio del rango temporal (opcional)
        date_to: Fecha fin del rango temporal (opcional)
    
    Returns:
        Dict con estructura HubFeedSnapshot:
        {
            "metadata": {...},
            "records": [...],
            "audit_log_id": "uuid",
        }
    
    Raises:
        PermissionDenied: Si terapeuta no tiene ownership o paciente sin consentimiento
        ValidationError: Si parámetros inválidos
    """
    
    # Normalizar scope
    if scope is None:
        scope = ["analysis_records_summary"]
    
    # Validar hub_code
    valid_hubs = ["MSHE", "SCDF", "SCID5"]
    if hub_code not in valid_hubs:
        raise ValidationError(f"Invalid hub_code. Must be one of: {valid_hubs}")
    
    # 1) Verificar que terapeuta es terapeuta (RBAC)
    if not hasattr(therapist_user, 'profile') or therapist_user.profile.user_type != 'therapist':
        _audit_denied(
            therapist_user=therapist_user,
            patient_id=patient_id,
            hub_code=hub_code,
            scope=scope,
            date_from=date_from,
            date_to=date_to,
            reason="not_therapist"
        )
        raise PermissionDenied("User is not a therapist")
    
    # 2) Cargar paciente
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        _audit_denied(
            therapist_user=therapist_user,
            patient_id=patient_id,
            hub_code=hub_code,
            scope=scope,
            date_from=date_from,
            date_to=date_to,
            reason="patient_not_found"
        )
        raise PermissionDenied("Patient not found")
    
    # 3) Verificar ownership (terapeuta es dueño del paciente)
    if patient.therapist_id != therapist_user.id:
        _audit_denied(
            therapist_user=therapist_user,
            patient_id=patient_id,
            hub_code=hub_code,
            scope=scope,
            date_from=date_from,
            date_to=date_to,
            reason="no_ownership"
        )
        raise PermissionDenied("Therapist does not have ownership of this patient")
    
    # 4) Verificar consentimiento federado
    if not patient.consent_federation:
        _audit_denied(
            therapist_user=therapist_user,
            patient_id=patient_id,
            hub_code=hub_code,
            scope=scope,
            date_from=date_from,
            date_to=date_to,
            reason="no_consent_federation"
        )
        raise PermissionDenied(
            "Patient has not consented to federated reading. "
            "Please obtain explicit consent before requesting holistic synthesis."
        )
    
    # 5) Query AnalysisRecord con filtros
    queryset = AnalysisRecord.objects.filter(patient_id=patient_id)
    
    # Filtro por visibility: terapeuta puede ver 'therapist' y 'both'
    queryset = queryset.filter(Q(visibility='therapist') | Q(visibility='both'))
    
    # Filtro temporal
    if date_from:
        queryset = queryset.filter(created_at__date__gte=date_from)
    if date_to:
        queryset = queryset.filter(created_at__date__lte=date_to)
    
    # Ordenar y limitar (MVP: max 50 records)
    queryset = queryset.order_by('-created_at')[:50]
    
    records = list(queryset)
    records_count = len(records)
    
    # 6) Generar audit log (éxito)
    audit_log = FederationAuditLog.objects.create(
        requested_by_user=therapist_user,
        subject_patient=patient,
        federation_hub=hub_code,
        scope={
            "date_range": {
                "start": date_from.isoformat() if date_from else None,
                "end": date_to.isoformat() if date_to else None,
            },
            "included_domains": scope,
        },
        status="allowed",
        records_accessed_count=records_count,
    )
    
    # 7) Construir HubFeedSnapshot (dict)
    hub_feed = {
        "metadata": {
            "feed_id": f"hubfeed-{hub_code.lower()}-{patient_id}-{audit_log.timestamp.isoformat()}",
            "subject_patient_id": patient_id,
            "requested_by_therapist_id": therapist_user.id,
            "hub_code": hub_code,
            "scope": scope,
            "date_range": {
                "start": date_from.isoformat() if date_from else None,
                "end": date_to.isoformat() if date_to else None,
            },
            "generated_at": audit_log.timestamp.isoformat(),
            "records_count": records_count,
        },
        "records": [_normalize_record(record) for record in records],
        "audit_log_id": str(audit_log.id),
    }
    
    return hub_feed


def _normalize_record(record: AnalysisRecord) -> Dict:
    """Proyecta AnalysisRecord a AnalysisRecordNormalized (schema FEDERATION_HUBS_CONTRACT §2.1).
    
    NO incluye raw_input completo (seguridad).
    Genera summary_public y summary_pro desde computed_result.
    """
    
    # Derivar summaries desde computed_result (si existe)
    computed = record.computed_result or {}
    
    # summary_public: texto simbólico breve (no IDs, no scores técnicos)
    summary_public = _extract_public_summary(computed, record.module_code)
    
    # summary_pro: puede incluir acrónimos técnicos, sin sentencias diagnósticas
    summary_pro = _extract_pro_summary(computed, record.module_code, record.kind)
    
    # Tags: derivar desde computed_result si tiene categorización
    tags = _extract_tags(computed)
    
    return {
        "record_id": str(record.id),
        "module_code": record.module_code,
        "kind": record.kind,
        "created_at": record.created_at.isoformat(),
        "visibility": record.visibility,
        "algorithm_snapshot": {
            "engine": record.algorithm_snapshot.get("engine", "unknown"),
            "version": record.algorithm_snapshot.get("version", "unknown"),
        },
        "summary_public": summary_public,
        "summary_pro": summary_pro,
        "tags": tags,
        "record_ref": f"/api/analysis-records/{record.id}/",
    }


def _extract_public_summary(computed: Dict, module_code: str) -> str:
    """Extrae resumen público (simbólico, no técnico) desde computed_result."""
    
    # Estrategia MVP: buscar campos comunes en computed_result
    # Priority: mensaje legible > descripción > fallback genérico
    
    if "public_summary" in computed:
        return computed["public_summary"]
    
    if "summary" in computed and isinstance(computed["summary"], str):
        # Limpiar IDs y scores técnicos si los hay (básico)
        summary = computed["summary"]
        # Truncar si muy largo
        if len(summary) > 300:
            summary = summary[:297] + "..."
        return summary
    
    if "interpretation" in computed:
        interp = computed["interpretation"]
        if isinstance(interp, str):
            return interp[:300]
    
    # Fallback: mensaje genérico por módulo
    return f"Exploración completada - {module_code}"


def _extract_pro_summary(computed: Dict, module_code: str, kind: str) -> str:
    """Extrae resumen profesional (puede incluir técnico, NO diagnóstico) desde computed_result."""
    
    if "pro_summary" in computed:
        return computed["pro_summary"]
    
    if "clinical_interpretation" in computed:
        return computed["clinical_interpretation"]
    
    # Para módulos legacy con scores/patterns, incluir esos datos
    if "scores" in computed or "patterns" in computed:
        parts = []
        
        if "scores" in computed:
            scores_str = ", ".join([f"{k}: {v}" for k, v in list(computed["scores"].items())[:5]])
            parts.append(f"Scores: {scores_str}")
        
        if "patterns" in computed:
            patterns = computed["patterns"]
            if isinstance(patterns, list) and patterns:
                parts.append(f"Patterns: {', '.join(patterns[:3])}")
            elif isinstance(patterns, dict):
                parts.append(f"Patterns: {', '.join(list(patterns.keys())[:3])}")
        
        if parts:
            return " | ".join(parts)
    
    # Fallback: indicar tipo de análisis
    return f"Análisis {kind} - {module_code} (ver record completo para detalles)"


def _extract_tags(computed: Dict) -> List[str]:
    """Extrae tags/categorías simbólicas desde computed_result."""
    
    tags = []
    
    # Buscar campos comunes de categorización
    if "tags" in computed and isinstance(computed["tags"], list):
        tags.extend(computed["tags"])
    
    if "sefirot" in computed and isinstance(computed["sefirot"], list):
        tags.extend(computed["sefirot"])
    
    if "categories" in computed and isinstance(computed["categories"], list):
        tags.extend(computed["categories"])
    
    # Limitar a 10 tags
    return tags[:10]


def _audit_denied(
    therapist_user: User,
    patient_id: int,
    hub_code: str,
    scope: List[str],
    date_from: Optional[date],
    date_to: Optional[date],
    reason: str,
) -> None:
    """Registra intento denegado en FederationAuditLog."""
    
    # Intentar cargar patient para FK (puede no existir)
    patient = None
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        pass
    
    FederationAuditLog.objects.create(
        requested_by_user=therapist_user,
        subject_patient=patient,
        federation_hub=hub_code,
        scope={
            "date_range": {
                "start": date_from.isoformat() if date_from else None,
                "end": date_to.isoformat() if date_to else None,
            },
            "included_domains": scope,
        },
        status="denied",
        records_accessed_count=0,
        denial_reason=reason,
    )
