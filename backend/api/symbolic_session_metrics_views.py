"""
Observabilidad del Modo Interactivo Asistido (Híbrido) — Step 9 / D6.

Dos endpoints, ambos therapist-only y sin PII:

- POST /api/symbolic/session-events/   -> registra un evento agregable.
- GET  /api/therapist/hybrid-metrics/  -> agregados para el dashboard del terapeuta.

El rol se resuelve SIEMPRE en Django (fuente de verdad: UserProfile), nunca desde
el cliente. Los conteos de notas se derivan de SymbolicSessionNote; el resto, de
SymbolicSessionEvent.
"""
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Patient as PatientModel
from .symbolic_session_metrics_models import SymbolicSessionEvent
from .symbolic_session_notes_models import SymbolicSessionNote


VALID_EVENT_TYPES = {choice[0] for choice in SymbolicSessionEvent.EVENT_TYPE_CHOICES}
VALID_WORKSPACES = {choice[0] for choice in SymbolicSessionEvent.WORKSPACE_CHOICES}


def _require_therapist(request):
    profile = getattr(request.user, 'profile', None)
    if not profile or getattr(profile, 'user_type', None) != 'therapist':
        return None, Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
    return profile, None


def _resolve_role(profile):
    can_clinical = getattr(profile, 'can_use_clinical_lexicon', None)
    clinical_enabled = bool(can_clinical()) if callable(can_clinical) else bool(can_clinical)
    return 'clinical' if clinical_enabled else 'observational'


class SymbolicSessionEventView(APIView):
    """Registra un evento agregable de sesión simbólica (sin PII)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, error = _require_therapist(request)
        if error is not None:
            return error

        event_type = (request.data.get('event_type') or '').strip()
        if event_type not in VALID_EVENT_TYPES:
            return Response(
                {'error': 'event_type_invalid', 'allowed': sorted(VALID_EVENT_TYPES)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        workspace = (request.data.get('workspace') or 'generic').strip()
        if workspace not in VALID_WORKSPACES:
            workspace = 'generic'

        # Consultante opcional; si se envía, validar propiedad del terapeuta.
        patient = None
        patient_raw = request.data.get('patient_id') or request.data.get('patient')
        if patient_raw:
            try:
                patient = PatientModel.objects.get(id=int(str(patient_raw).strip()))
            except (ValueError, TypeError, PatientModel.DoesNotExist):
                return Response({'error': 'patient_not_found'}, status=status.HTTP_404_NOT_FOUND)
            if getattr(patient, 'therapist_id', None) != getattr(request.user, 'id', None):
                return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)

        metadata = request.data.get('metadata') or {}
        if not isinstance(metadata, dict):
            return Response({'error': 'metadata_invalid'}, status=status.HTTP_400_BAD_REQUEST)
        # Defensa anti-PII: solo escalares y cadenas cortas; sin texto libre largo.
        safe_metadata = {
            str(k): v
            for k, v in metadata.items()
            if isinstance(v, (int, float, bool)) or (isinstance(v, str) and len(v) <= 64)
        }

        # El rol es SIEMPRE el resuelto por Django, nunca el del cliente.
        role = _resolve_role(profile)

        event = SymbolicSessionEvent.objects.create(
            event_type=event_type,
            workspace=workspace,
            role=role,
            metadata=safe_metadata,
            therapist=request.user,
            patient=patient,
        )
        return Response(
            {
                'id': event.id,
                'event_type': event.event_type,
                'workspace': event.workspace,
                'role': event.role,
            },
            status=status.HTTP_201_CREATED,
        )


class HybridModeMetricsView(APIView):
    """Agregados D6 del Modo Híbrido para el terapeuta autenticado (sin PII)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        _profile, error = _require_therapist(request)
        if error is not None:
            return error

        user = request.user
        events = SymbolicSessionEvent.objects.filter(therapist=user)
        notes = SymbolicSessionNote.objects.filter(therapist=user)

        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        def _count_by_type(qs):
            counts = {t: 0 for t in VALID_EVENT_TYPES}
            for row in qs.values('event_type').annotate(count=Count('id')):
                counts[row['event_type']] = row['count']
            return counts

        all_counts = _count_by_type(events)
        month_counts = _count_by_type(events.filter(created_at__gte=month_start))

        def _kpi(counts, notes_count):
            return {
                'sessions_started': counts.get('session_started', 0),
                'interpretations_generated': counts.get('interpretation_generated', 0),
                'interpretations_accepted': counts.get('interpretation_accepted', 0),
                'exercises_completed': counts.get('exercise_completed', 0),
                'anti_fraud_blocks': counts.get('anti_fraud_block', 0),
                'notes_created': notes_count,
            }

        kpi = _kpi(all_counts, notes.count())
        kpi_this_month = _kpi(month_counts, notes.filter(created_at__gte=month_start).count())

        events_by_month = [
            {
                'month': row['month'].strftime('%Y-%m'),
                'count': row['count'],
            }
            for row in (
                events.annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(count=Count('id'))
                .order_by('month')
            )
            if row['month']
        ]

        by_workspace = {}
        for row in events.values('workspace').annotate(count=Count('id')):
            by_workspace[row['workspace']] = row['count']

        role_breakdown = {'observational': 0, 'clinical': 0}
        for row in events.values('role').annotate(count=Count('id')):
            if row['role'] in role_breakdown:
                role_breakdown[row['role']] = row['count']

        return Response({
            'kpi': kpi,
            'kpi_this_month': kpi_this_month,
            'events_by_month': events_by_month,
            'by_workspace': by_workspace,
            'role_breakdown': role_breakdown,
        })
