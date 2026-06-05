from __future__ import annotations

from typing import Any, Dict

from django.contrib.auth.models import User

from api.models import AnalysisRecord, Patient, ProcessSnapshot
from api.process_memory.services import create_process_snapshot, infer_domain, infer_lane


def resolve_tarot_workspace_patient(instance: Any) -> Patient | None:
    """Map a sealed Tarot workspace subject to the therapist's clinical Patient."""
    if not instance or not getattr(instance, "subject_user_id", None):
        return None
    return Patient.objects.filter(
        therapist_id=instance.creator_user_id,
        user_id=instance.subject_user_id,
        is_active=True,
    ).first()


def build_tarot_spread_from_instance(instance: Any) -> Dict[str, Any]:
    """Extract spread payload from a sealed workspace instance."""
    from swm.tarot.models import ArtifactType

    artifact = (
        instance.artifacts.filter(artifact_type=ArtifactType.SPREAD)
        .order_by("-updated_at")
        .first()
    )
    if artifact and isinstance(artifact.content, dict):
        content = artifact.content
        return {
            "workspace_id": str(instance.id),
            "spread_type": content.get("spread_type") or instance.spread_type,
            "tarot_system": content.get("tarot_system") or instance.tarot_system,
            "cards": content.get("cards") or [],
            "therapist_notes": content.get("therapist_notes", ""),
            "session_context": content.get("session_context", ""),
        }
    return {
        "workspace_id": str(instance.id),
        "spread_type": instance.spread_type,
        "tarot_system": instance.tarot_system,
        "cards": [],
    }


def _summary_from_structured(data: Dict[str, Any]) -> str:
    if not data:
        return "Snapshot de proceso sin resumen textual."
    summary = data.get("summary") or data.get("evaluated_summary") or data.get("text")
    if summary:
        return str(summary)
    return " ".join(str(value) for value in data.values())[:2000]


def ingest_tarot_seal(
    *,
    therapist: User,
    patient: Patient,
    source_id: str,
    spread: Dict[str, Any],
) -> ProcessSnapshot:
    cards = spread.get("cards") if isinstance(spread, dict) else None
    card_text = ", ".join(str(card) for card in cards) if cards else _summary_from_structured(spread)
    return create_process_snapshot(
        therapist=therapist,
        patient=patient,
        domain="tarot",
        lane="symbolic",
        source_type="swm_tarot",
        source_id=source_id,
        structured=spread,
        text_summary=f"Tarot sellado: {card_text}",
    )


def ingest_bio_synthesis_close(synthesis: Any) -> ProcessSnapshot | None:
    if not getattr(synthesis, "is_closed", False):
        return None
    return create_process_snapshot(
        therapist=synthesis.therapist,
        patient=synthesis.patient,
        domain="bioemotion",
        lane="clinical_support",
        source_type="bioemotional_synthesis",
        source_id=str(synthesis.id),
        structured={"synthesis_id": str(synthesis.id)},
        text_summary=synthesis.text,
    )


def ingest_analysis_record(record: AnalysisRecord) -> ProcessSnapshot | None:
    if not record.therapist_id or not record.patient_id:
        return None
    domain = infer_domain(kind=record.kind)
    lane = infer_lane(domain=domain, source_type=record.kind)
    structured = record.computed_result or record.legacy_output or {}
    summary = _summary_from_structured(structured)
    return create_process_snapshot(
        therapist=record.therapist,
        patient=record.patient,
        domain=domain,
        lane=lane,
        source_type="analysis_record",
        source_id=str(record.id),
        structured=structured,
        text_summary=summary,
    )
