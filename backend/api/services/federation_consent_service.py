"""Grant/revoke patient federation consent with immutable audit trail."""

from __future__ import annotations

import logging
from typing import Optional, Tuple

from django.contrib.auth.models import User
from django.utils import timezone

from api.models import FederationAuditLog, Patient

logger = logging.getLogger(__name__)

CONSENT_SOURCES = frozenset({
    'patient_portal',
    'therapist_in_person',
    'management_command',
})


def audit_federation_consent_change(
    *,
    actor_user: Optional[User],
    patient: Patient,
    consent: bool,
    source: str,
    previous_consent: bool,
) -> FederationAuditLog:
    """Append-only audit entry (reuses FederationAuditLog without schema changes)."""
    return FederationAuditLog.objects.create(
        requested_by_user=actor_user,
        subject_patient=patient,
        federation_hub='MSHE',
        scope={
            'event': 'federation_consent_change',
            'consent': consent,
            'previous_consent': previous_consent,
            'source': source,
        },
        status='allowed',
        records_accessed_count=0,
    )


def set_patient_federation_consent(
    *,
    patient: Patient,
    consent: bool,
    actor_user: Optional[User],
    source: str,
) -> Tuple[Patient, bool]:
    """Set consent_federation flag. Returns (patient, changed). Idempotent."""
    if source not in CONSENT_SOURCES:
        raise ValueError(f'Invalid consent source: {source}')

    previous = bool(patient.consent_federation)
    if previous == consent:
        return patient, False

    patient.consent_federation = consent
    patient.consent_federation_date = timezone.now() if consent else None
    patient.save(
        update_fields=['consent_federation', 'consent_federation_date', 'updated_at'],
    )

    audit_federation_consent_change(
        actor_user=actor_user,
        patient=patient,
        consent=consent,
        source=source,
        previous_consent=previous,
    )
    logger.info(
        'federation_consent_change patient_id=%s consent=%s source=%s actor=%s',
        patient.id,
        consent,
        source,
        getattr(actor_user, 'id', None),
    )
    return patient, True