from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional

from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from .models import SymbolicReading


@dataclass(frozen=True)
class SymbolicReadingSaveContext:
    therapist: User
    consultant: Optional[User] = None
    system_id: str = "thoth"
    reading_type: str = SymbolicReading.ReadingType.EDUCATIONAL
    consent_version: str = ""
    consent_accepted_at: str = ""


def _validate_reading_content(content: Any) -> None:
    if not isinstance(content, dict):
        raise ValueError("Invalid content payload.")

    allowed_top_keys = {"id", "summary", "themes", "correspondences", "caution", "cards", "symbolic_reading"}
    extra_keys = set(content.keys()) - allowed_top_keys
    if extra_keys:
        raise ValueError("Content contains unsupported fields.")

    forbidden_markers = {"prompt", "input", "notes", "intention"}
    if any(marker in content for marker in forbidden_markers):
        raise ValueError("Content contains forbidden fields.")


def saveSymbolicReading(
    reading: dict[str, Any],
    consentMode: str,
    context: SymbolicReadingSaveContext,
) -> Optional[SymbolicReading]:
    """
    Phase 3 governed persistence (non-clinical).

    Rules:
    - no_store -> return None (no DB write)
    - store_anonymized -> consultant_id forced to null
    - store_with_consent -> store therapist + consultant (if provided)
    """
    if consentMode not in {
        SymbolicReading.ConsentMode.NO_STORE,
        SymbolicReading.ConsentMode.STORE_ANONYMIZED,
        SymbolicReading.ConsentMode.STORE_WITH_CONSENT,
    }:
        raise ValueError("Invalid consent_mode.")

    if consentMode == SymbolicReading.ConsentMode.NO_STORE:
        return None

    if not context.consent_version or not context.consent_accepted_at:
        raise ValueError("Consent version and timestamp are required.")

    accepted_at = parse_datetime(context.consent_accepted_at)
    if accepted_at is None:
        raise ValueError("Invalid consent accepted_at timestamp.")

    if context.reading_type != SymbolicReading.ReadingType.EDUCATIONAL:
        raise ValueError("Only educational readings are allowed in Phase 3.")

    _validate_reading_content(reading)

    consultant = context.consultant
    if consentMode == SymbolicReading.ConsentMode.STORE_ANONYMIZED:
        consultant = None

    audit_trace = {
        "swm_version": "v3",
        "phase": "phase-3",
        "flags": {
            "governed_persistence": True,
            "no_ai": True,
            "non_clinical": True,
        },
        "source": "mock",
        "system_id": context.system_id,
        "reading_type": context.reading_type,
        "consent_mode": consentMode,
        "consent_version": context.consent_version,
        "consent_accepted_at": accepted_at.isoformat(),
        "disclaimer_visible": reading.get("caution"),
        "stored_at": timezone.now().isoformat(),
    }

    return SymbolicReading.objects.create(
        therapist=context.therapist,
        consultant=consultant,
        system_id=context.system_id,
        reading_type=context.reading_type,
        content=reading,
        consent_mode=consentMode,
        consent_version=context.consent_version,
        consent_accepted_at=accepted_at,
        audit_trace=audit_trace,
    )
