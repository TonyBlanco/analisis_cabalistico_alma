from __future__ import annotations

import re
from typing import Any, Dict, List, Sequence

from django.contrib.auth.models import User

from api.models import EmbeddingChunk, Patient, ProcessEvent, ProcessSnapshot
from api.process_memory.vector_store import get_vector_store_backend
from api.process_memory.embeddings import get_embedding_backend


SYMBOLIC_EVENTS = {
    "swm.tarot.sealed",
    "swm.cabala.completed",
    "swm.mcmi4.sealed",
    "analysis_record.executed",
}


def _assert_owns_patient(therapist: User, patient: Patient) -> None:
    if not therapist or not patient or patient.therapist_id != therapist.id:
        raise PermissionError("Paciente no autorizado para este terapeuta.")


def infer_lane(event_type: str = "", domain: str = "", source_type: str = "") -> str:
    symbolic_markers = ("kabbalah", "tarot", "cabala", "swm_tarot", "swm_cabala")
    joined = " ".join([event_type or "", domain or "", source_type or ""]).lower()
    if event_type in SYMBOLIC_EVENTS or any(marker in joined for marker in symbolic_markers):
        return "symbolic"
    return "clinical_support"


def infer_domain(source_type: str = "", kind: str = "") -> str:
    source = (source_type or kind or "").lower()
    if "tarot" in source:
        return "tarot"
    if "bio" in source:
        return "bioemotion"
    if "kabbalah" in source or "cabala" in source:
        return "kabbalah"
    if "astro" in source:
        return "astrology"
    if "clinical" in source:
        return "clinical"
    return "kabbalah" if kind == "kabbalah" else "clinical"


def sanitize_summary(text: str, patient: Patient | None = None) -> str:
    value = (text or "").strip()
    if not value:
        return ""

    value = re.sub(r"[\w.\-+]+@[\w.\-]+\.\w+", "[redacted]", value)
    value = re.sub(r"\b(?:\+?\d[\s-]?){7,}\b", "[redacted]", value)

    if patient:
        names = {
            getattr(patient, "first_name", ""),
            getattr(patient, "last_name", ""),
            getattr(patient, "full_name", ""),
            getattr(patient, "email", ""),
        }
        for name in sorted((n.strip() for n in names if n and n.strip()), key=len, reverse=True):
            value = re.sub(re.escape(name), "[redacted]", value, flags=re.I)

    value = re.sub(r"\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+ (?=\[redacted\])", "", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value[:2000]


def record_process_event(
    *,
    therapist: User,
    patient: Patient,
    event_type: str,
    source_type: str,
    source_id: str,
    payload: Dict[str, Any] | None = None,
    lane: str | None = None,
) -> ProcessEvent:
    _assert_owns_patient(therapist, patient)
    return ProcessEvent.objects.create(
        therapist=therapist,
        patient=patient,
        event_type=event_type,
        lane=lane or infer_lane(event_type=event_type, source_type=source_type),
        source_type=source_type,
        source_id=str(source_id),
        payload=payload or {},
    )


def create_process_snapshot(
    *,
    therapist: User,
    patient: Patient,
    domain: str,
    lane: str,
    source_type: str,
    source_id: str,
    structured: Dict[str, Any] | None,
    text_summary: str,
    consent_scope: str = "store_with_consent",
    base_weight: float = 1.0,
) -> ProcessSnapshot:
    _assert_owns_patient(therapist, patient)
    clean_summary = sanitize_summary(text_summary, patient=patient)
    snapshot, _created = ProcessSnapshot.objects.update_or_create(
        therapist=therapist,
        source_type=source_type,
        source_id=str(source_id),
        defaults={
            "patient": patient,
            "domain": domain,
            "lane": lane,
            "structured": structured or {},
            "text_summary": clean_summary,
            "consent_scope": consent_scope,
            "base_weight": base_weight,
        },
    )
    return snapshot


def create_embedding_chunk(
    *,
    snapshot: ProcessSnapshot,
    therapist: User,
    patient: Patient,
    lane: str,
    text: str,
    embedding: Sequence[float] | None = None,
    weight: float = 1.0,
) -> EmbeddingChunk:
    _assert_owns_patient(therapist, patient)
    if snapshot.therapist_id != therapist.id or snapshot.patient_id != patient.id:
        raise PermissionError("Snapshot no autorizado para este terapeuta.")
    clean_text = sanitize_summary(text, patient=patient)
    if embedding is not None:
        resolved_embedding = list(embedding)
    else:
        resolved_embedding = get_embedding_backend().embed(clean_text)
    return EmbeddingChunk.objects.create(
        snapshot=snapshot,
        therapist=therapist,
        patient=patient,
        lane=lane,
        text=clean_text,
        embedding=resolved_embedding,
        weight=weight,
    )


class RAGService:
    @staticmethod
    def retrieve(
        *,
        therapist: User,
        patient_id: int,
        lane: str,
        query: str,
        top_k: int = 5,
        domain: str | None = None,
    ) -> List[Dict[str, Any]]:
        return get_vector_store_backend().retrieve(
            therapist=therapist,
            patient_id=patient_id,
            lane=lane,
            query=query,
            top_k=top_k,
            domain=domain,
        )
