"""
YAML prompt registry for PlanAI (inference only — no training).
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Tuple

import yaml

PROMPT_CORE_NAME = "planai_agent_core_v1"
PROMPT_KABBALAH_NAME = "kabbalah_interpret_v1"
PROMPT_BIOEMOTION_NAME = "bioemotional_draft_v1"
PROMPT_VERSION_KABBALAH = PROMPT_KABBALAH_NAME
PROMPT_VERSION_BIOEMOTION_DRAFT = PROMPT_BIOEMOTION_NAME

_PROMPTS_DIR = Path(__file__).resolve().parents[2] / "ai" / "prompts"

RAG_PENDING = (
    "(Sin contexto RAG recuperado — disponible tras Fase 1 Process Memory.)"
)


@lru_cache(maxsize=8)
def _load_yaml(name: str) -> Dict[str, Any]:
    path = _PROMPTS_DIR / f"{name}.yaml"
    if not path.is_file():
        raise FileNotFoundError(f"Prompt template not found: {path}")
    with path.open(encoding="utf-8") as fh:
        data = yaml.safe_load(fh)
    if not isinstance(data, dict):
        raise ValueError(f"Invalid prompt YAML: {path}")
    return data


def _lane_allowed(spec: Dict[str, Any], lane: str) -> bool:
    raw = str(spec.get("lane") or "")
    allowed = [p.strip() for p in raw.split("|") if p.strip()]
    return lane in allowed if allowed else True


def render_prompt(
    *,
    user_task: str,
    rag_context: str = "",
    patient_history_summary: str = "",
    consent_scope: str = "therapist_workspace",
    template_name: str = PROMPT_CORE_NAME,
    lane: str | None = None,
) -> Tuple[str, str, float, int]:
    """
    Returns (full_prompt, version, temperature, max_tokens).
    """
    spec = _load_yaml(template_name)
    spec_lane = str(spec.get("lane") or "").strip()
    if spec_lane:
        check_lane = lane or spec_lane.split("|")[0].strip()
        if not _lane_allowed(spec, check_lane):
            raise ValueError(f"Lane '{check_lane}' not allowed for template {template_name}")

    template = spec.get("system_prompt") or ""
    if not template.strip():
        raise ValueError(f"Empty system_prompt in {template_name}")

    rag = (rag_context or "").strip() or RAG_PENDING
    history = (patient_history_summary or "").strip() or "(Sin resumen de historial en esta solicitud.)"
    if consent_scope:
        history = f"{history}\n\nconsent_scope: {consent_scope}"

    prompt = (
        template.replace("{RAG_CONTEXT}", rag)
        .replace("{PATIENT_HISTORY_SUMMARY}", history)
        .replace("{USER_TASK}", user_task.strip())
    )

    version = str(spec.get("version") or spec.get("name") or template_name)
    temperature = float(spec.get("temperature", 0.65))
    max_tokens = int(spec.get("max_tokens", 1200))
    return prompt, version, temperature, max_tokens


def render_planai_prompt(
    *,
    lane: str,
    user_task: str,
    rag_context: str = "",
    patient_history_summary: str = "",
    consent_scope: str = "therapist_workspace",
    template_name: str = PROMPT_CORE_NAME,
) -> Tuple[str, str, float, int]:
    """PlanAI core template (general lanes)."""
    return render_prompt(
        lane=lane,
        user_task=user_task,
        rag_context=rag_context,
        patient_history_summary=patient_history_summary,
        consent_scope=consent_scope,
        template_name=template_name,
    )