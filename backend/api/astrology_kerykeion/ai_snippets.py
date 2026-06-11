# -*- coding: utf-8 -*-
"""AI snippets for astrology-kerykeion cabalistic layer.

Goal
- Provide short, in-session therapeutic guidance (3 lines) for the therapist UI.
- Do not fetch or store Sefaria text.
- Do not output verbatim quotes; guidance must be original, clinical/observational.

This module is intentionally feature-flagged to avoid adding latency/cost unless enabled.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Dict, Tuple

from django.conf import settings

from api.ai.llm_bridge import generate_text, is_llm_available, unavailable_message


def _bool_setting(name: str, default: bool = False) -> bool:
    value = getattr(settings, name, default)
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "y", "on"}


def _clean_model_text(text: str) -> str:
    t = (text or "").strip()
    if t.startswith("```"):
        t = t.replace("```json", "").replace("```", "").strip()
    return t


def _coerce_three_lines(text: str) -> str:
    lines = [ln.strip() for ln in (text or "").splitlines() if ln.strip()]
    if not lines:
        return ""

    # Ensure the expected 3-line format; be conservative if model returns more.
    lines = lines[:3]

    # If the model returns fewer than 3 lines, pad with empty guidance.
    while len(lines) < 3:
        lines.append("")

    return "\n".join(lines).strip()


def _format_three_lines(text: str) -> str:
    """Force the 3-line labeled format even if the model returns raw sentences."""
    lines = [ln.strip() for ln in (text or "").splitlines() if ln.strip()]
    if not lines:
        return ""

    # If the model returned a single paragraph, split into sentences conservatively.
    if len(lines) == 1:
        raw = lines[0]
        parts: list[str] = []
        for sep in (". ", "! ", "? "):
            if sep in raw and len(parts) < 3:
                # Keep punctuation by re-adding '.'
                tmp = raw.split(sep)
                parts = [p.strip() for p in tmp if p.strip()]
                break
        if parts:
            lines = parts

    lines = lines[:3]
    while len(lines) < 3:
        lines.append("")

    # Strip common numbering if present
    cleaned: list[str] = []
    for ln in lines:
        ln = ln.lstrip("-• ")
        if ln[:2] in {"1)", "2)", "3)"}:
            ln = ln[2:].strip()
        if ln[:3] in {"1. ", "2. ", "3. "}:
            ln = ln[3:].strip()
        # Remove labels if the model included them.
        for prefix in (
            "Interpretación AI:",
            "Desafío kármico:",
            "Guía terapéutica:",
            "Desafio karmico:",
        ):
            if ln.lower().startswith(prefix.lower()):
                ln = ln[len(prefix):].strip()
                break
        cleaned.append(ln)

    return "\n".join(cleaned).strip()


def _sanitize_plain_text(text: str) -> str:
    t = (text or "").strip()
    if not t:
        return ""
    # Replace quotes (avoid JSON/UX issues; also aligns with "no quotes" rule)
    t = t.replace('"', "'").replace('“', "'").replace('”', "'")
    # Remove markdown-ish formatting characters
    t = t.replace('`', '').replace('*', '')
    return t.strip()


def _is_safe_snippet(text: str) -> bool:
    """Best-effort guardrails against accidental reproduction of external text."""
    t = (text or "").strip()
    if not t:
        return False

    # Hard length caps (3 lines * 160 chars + small overhead)
    if len(t) > 650:
        return False

    lowered = t.lower()
    # Avoid URLs or source-like dumps
    if "http://" in lowered or "https://" in lowered or "www." in lowered:
        return False

    # Avoid quote blocks / markdown fences
    if "```" in t:
        return False

    # Avoid direct quoting style (best-effort)
    if '"' in t or '“' in t or '”' in t:
        return False

    # Ensure it's 3 lines
    lines = [ln for ln in t.splitlines() if ln.strip()]
    if len(lines) != 3:
        return False

    # Per-line caps (keeps DB/UI tidy)
    if any(len(ln) > 220 for ln in lines):
        return False

    return True


@dataclass
class _SnippetContext:
    planet: str
    sign: str
    house: Optional[int]
    sefira: Optional[str]
    letter_name: Optional[str]
    letter_char: Optional[str]
    attribute: Optional[str]
    ref_title: str
    ref_url: str

    def cache_key(self) -> Tuple[str, str, str, str, str, str, str, str, str]:
        return (
            (self.planet or ""),
            (self.sign or ""),
            (str(self.house or "")),
            (self.sefira or ""),
            (self.letter_name or ""),
            (self.letter_char or ""),
            (self.attribute or ""),
            (self.ref_title or ""),
            (self.ref_url or ""),
        )


def _fallback_snippet(*, planet: str, sign: str, letter_name: Optional[str]) -> str:
    # Deterministic, 3-line, neutral fallback that never breaks UI.
    p = (planet or "planeta").strip() or "planeta"
    s = (sign or "signo").strip() or "signo"
    l = (letter_name or "").strip()
    l_part = f"La letra {l} sugiere foco y contención." if l else "Observa el símbolo sin absolutizarlo."
    return "\n".join(
        [
            f"Hoy nota el desafío de integrar {p} en {s} sin exigencia ni juicio.",
            l_part,
            "Elige una acción breve: respiración 3 minutos + una decisión concreta alineada a tu valor central.",
        ]
    )


class AstrologyKabbalahSnippetAI:
    """LLM-backed generator for short therapeutic snippets (llm_bridge / free_first → Groq)."""

    def __init__(self) -> None:
        self.enabled: bool = False
        self.error_message: Optional[str] = None
        self._cache: Dict[Tuple[str, str, str, str, str, str, str, str, str], str] = {}
        self._cache_max = 256

        if not _bool_setting("KERYKEION_AI_SNIPPETS_ENABLED", False):
            self.error_message = "AI snippets disabled (KERYKEION_AI_SNIPPETS_ENABLED=0)"
            return

        if not is_llm_available():
            self.error_message = unavailable_message()
            return

        self.enabled = True

    def generate_snippet(
        self,
        *,
        planet: str,
        sign: str,
        house: Optional[int],
        sefira: Optional[str],
        letter_name: Optional[str],
        letter_char: Optional[str],
        attribute: Optional[str],
        ref_title: str,
        ref_url: str,
        therapist_id: Optional[int] = None,
        patient_id: Optional[int] = None,
    ) -> Optional[str]:
        if not self.enabled:
            return None

        ctx = _SnippetContext(
            planet=planet,
            sign=sign,
            house=house,
            sefira=sefira,
            letter_name=letter_name,
            letter_char=letter_char,
            attribute=attribute,
            ref_title=ref_title,
            ref_url=ref_url,
        )
        key = ctx.cache_key()
        if key in self._cache:
            return self._cache[key]

        # NOTE: We do NOT pass Sefaria text.
        # We only use deterministic, already-mapped metadata (planet/sign/house/letter).
        letter_part = ""
        if ctx.letter_name and ctx.letter_char:
            letter_part = f"Letra: {ctx.letter_name} ({ctx.letter_char})"
        elif ctx.letter_name:
            letter_part = f"{ctx.letter_name}"

        attribute_part = ctx.attribute or (f"Sefirá: {ctx.sefira}" if ctx.sefira else "")
        house_part = str(ctx.house) if ctx.house is not None else "—"

        prompt = f"""Actúa como un Consultor Terapéutico experto en Astrología Cabalística y Psicología Transpersonal.
Tu objetivo es generar una Síntesis de Sanación basada en la carta natal del paciente.

REGLAS CRÍTICAS DE SALIDA:
1. BREVEDAD: exactamente 3 líneas.
2. FORMATO: texto plano (sin asteriscos, sin negritas, sin listas, sin numeración).
3. COPYRIGHT: NO citas literales; NO pegues pasajes; NO menciones URLs.
4. TONO: clínico, empoderador y enfocado en crecimiento personal.
5. ESTRUCTURA:
   - Línea 1: Desafío energético del planeta/signo (1 frase).
   - Línea 2: Atributo de la letra hebrea asociada como herramienta de sanación (1 frase).
   - Línea 3: Acción sugerida concreta para hoy (1 frase).

DATOS DE ENTRADA:
- Planeta: {ctx.planet}
- Signo: {ctx.sign}
- Casa: {house_part}
- Letra Hebrea Asociada: {letter_part or '—'}
- Atributo Espiritual: {attribute_part or '—'}

SALIDA: devuelve solo las 3 líneas, sin encabezados.
"""

        try:
            usage_context = None
            if therapist_id:
                from django.contrib.auth import get_user_model
                from api.ai.usage_meter import UsageContext

                therapist = get_user_model().objects.filter(pk=therapist_id).first()
                if therapist:
                    usage_context = UsageContext(
                        therapist=therapist,
                        task_type='astrology.snippet',
                        patient_id=patient_id,
                        source_type='kerykeion_snippet',
                        source_id=f'{planet}:{sign}',
                    )
            result = generate_text(
                prompt,
                temperature=0.5,
                max_tokens=220,
                top_p=0.8,
                usage_context=usage_context,
            )
            if not result.get("success"):
                return _fallback_snippet(
                    planet=ctx.planet, sign=ctx.sign, letter_name=ctx.letter_name
                )
            raw_text = _sanitize_plain_text(_clean_model_text(result.get("text") or ""))
            raw = _coerce_three_lines(raw_text)
            text = _format_three_lines(raw)
        except Exception:
            return _fallback_snippet(planet=ctx.planet, sign=ctx.sign, letter_name=ctx.letter_name)

        if not text or not _is_safe_snippet(text):
            text = _fallback_snippet(planet=ctx.planet, sign=ctx.sign, letter_name=ctx.letter_name)

        if not _is_safe_snippet(text):
            return None

        # Simple bounded cache
        if len(self._cache) >= self._cache_max:
            # FIFO-ish: remove an arbitrary (first) key
            first_key = next(iter(self._cache.keys()))
            self._cache.pop(first_key, None)
        self._cache[key] = text
        return text


kerykeion_snippet_ai = AstrologyKabbalahSnippetAI()
