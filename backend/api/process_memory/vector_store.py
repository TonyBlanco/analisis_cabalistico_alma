"""
Process Memory retrieval backends (Phase 1 step 3 — pgvector scaffold).

Default: ``LexicalRankBackend`` — token overlap on ``ProcessSnapshot.text_summary``
(same ranking as pre-scaffold ``RAGService.retrieve``).

Future: ``PgVectorBackend`` — cosine search on ``EmbeddingChunk.embedding`` via
pgvector on the shared Postgres used by Studios33 (``docker-compose.studios33.yml`` →
``voxtv_net`` / ``studio33_db``). Do not enable on Hetzner until ops approves.

Env: ``PROCESS_MEMORY_VECTOR_BACKEND=lexical|pgvector`` (see ``core.settings``).
Ops: ``python manage.py ensure_pgvector`` (dry-run) then ``--apply`` on Postgres only.
"""

from __future__ import annotations

import re
from abc import ABC, abstractmethod
from typing import Any, Dict, List

from django.conf import settings
from django.contrib.auth.models import User

from api.models import AIInteractionFeedback, Patient, ProcessSnapshot

PGVECTOR_NOT_DEPLOYED_MSG = (
    "PgVectorBackend is not deployed yet. Keep PROCESS_MEMORY_VECTOR_BACKEND=lexical. "
    "On Postgres (studio33_db / voxtv_postgres): run `python manage.py ensure_pgvector` "
    "(dry-run), then `ensure_pgvector --apply`, add vector column migration for "
    "EmbeddingChunk.embedding, and switch PROCESS_MEMORY_VECTOR_BACKEND=pgvector."
)


def _tokens(text: str) -> set[str]:
    return {token for token in re.findall(r"\w+", (text or "").lower()) if len(token) > 2}


def _feedback_boost(snapshot: ProcessSnapshot) -> float:
    has_positive_feedback = AIInteractionFeedback.objects.filter(
        therapist=snapshot.therapist,
        patient=snapshot.patient,
        rating__gte=4,
        correction_text__icontains=str(snapshot.id),
    ).exists()
    return 2.0 if has_positive_feedback else 0.0


def _resolve_patient(therapist: User, patient_id: int) -> Patient:
    try:
        return Patient.objects.get(pk=patient_id, therapist=therapist)
    except Patient.DoesNotExist as exc:
        raise PermissionError("Paciente no autorizado para este terapeuta.") from exc


class VectorStoreBackend(ABC):
    @abstractmethod
    def retrieve(
        self,
        *,
        therapist: User,
        patient_id: int,
        lane: str,
        query: str,
        top_k: int = 5,
        domain: str | None = None,
    ) -> List[Dict[str, Any]]:
        ...


class LexicalRankBackend(VectorStoreBackend):
    """Token-overlap ranking on process snapshots (Phase 1 default)."""

    def retrieve(
        self,
        *,
        therapist: User,
        patient_id: int,
        lane: str,
        query: str,
        top_k: int = 5,
        domain: str | None = None,
    ) -> List[Dict[str, Any]]:
        patient = _resolve_patient(therapist, patient_id)

        qs = ProcessSnapshot.objects.filter(
            therapist=therapist,
            patient=patient,
            lane=lane,
            consent_scope__in=["store_with_consent", "store_anonymized"],
        )
        if domain:
            qs = qs.filter(domain=domain)

        query_tokens = _tokens(query)
        ranked: list[tuple[float, Any, ProcessSnapshot]] = []
        for snapshot in qs:
            overlap = len(query_tokens & _tokens(snapshot.text_summary))
            score = overlap + snapshot.base_weight + _feedback_boost(snapshot)
            ranked.append((score, snapshot.created_at, snapshot))

        ranked.sort(key=lambda item: (item[0], item[1]), reverse=True)
        return [
            {
                "snapshot_id": str(snapshot.id),
                "domain": snapshot.domain,
                "lane": snapshot.lane,
                "source_type": snapshot.source_type,
                "source_id": snapshot.source_id,
                "text_summary": snapshot.text_summary,
                "score": score,
            }
            for score, _created_at, snapshot in ranked[:top_k]
        ]


class PgVectorBackend(VectorStoreBackend):
    """Stub for EmbeddingChunk cosine search; requires pgvector extension + column migration."""

    def retrieve(
        self,
        *,
        therapist: User,
        patient_id: int,
        lane: str,
        query: str,
        top_k: int = 5,
        domain: str | None = None,
    ) -> List[Dict[str, Any]]:
        raise NotImplementedError(PGVECTOR_NOT_DEPLOYED_MSG)


def get_vector_store_backend() -> VectorStoreBackend:
    backend = getattr(settings, "PROCESS_MEMORY_VECTOR_BACKEND", "lexical")
    if backend == "pgvector":
        return PgVectorBackend()
    if backend != "lexical":
        raise ValueError(
            f"Unknown PROCESS_MEMORY_VECTOR_BACKEND={backend!r}; use 'lexical' or 'pgvector'."
        )
    return LexicalRankBackend()