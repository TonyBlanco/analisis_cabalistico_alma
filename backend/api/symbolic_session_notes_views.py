"""
Persistencia de notas/resumen de sesión simbólica asistida (Modo Híbrido — Step 7).

Defensa en profundidad: además del BFF, esta capa resuelve el rol (fuente de
verdad: UserProfile.clinical_mode_enabled), aplica la política role-aware +
rail anti-fraude, y exige que el terapeuta sea dueño del consultante (Patient)
antes de guardar.
"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Patient as PatientModel
from .symbolic_session_notes_models import SymbolicSessionNote
from .symbolic_session_safety import validate_safety_for_role


def _serialize_note(note):
    return {
        'id': note.id,
        'patient': note.patient_id,
        'workspace': note.workspace,
        'role': note.role,
        'summary': note.summary,
        'full_text': note.full_text,
        'sections': note.sections,
        'clinical_vocabulary': note.clinical_vocabulary,
        'safety_warnings': note.safety_warnings,
        'created_at': note.created_at.isoformat() if note.created_at else None,
    }


def _resolve_patient(request, raw):
    try:
        patient_id = int(str(raw).strip())
    except (ValueError, TypeError):
        return None, Response({'error': 'patient_id_invalid'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        patient = PatientModel.objects.get(id=patient_id)
    except PatientModel.DoesNotExist:
        return None, Response({'error': 'patient_not_found'}, status=status.HTTP_404_NOT_FOUND)
    if getattr(patient, 'therapist_id', None) != getattr(request.user, 'id', None):
        return None, Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)
    return patient, None


class SymbolicSessionNoteView(APIView):
    """Crea y lista notas/resumen de sesión asistida asociadas a un consultante."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or getattr(profile, 'user_type', None) != 'therapist':
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

        patient_raw = request.data.get('patient_id') or request.data.get('patient')
        if not patient_raw:
            return Response({'error': 'patient_id_required'}, status=status.HTTP_400_BAD_REQUEST)
        patient, error = _resolve_patient(request, patient_raw)
        if error is not None:
            return error

        # Rol = fuente de verdad en Django (nunca del cliente).
        can_clinical = getattr(profile, 'can_use_clinical_lexicon', None)
        clinical_enabled = bool(can_clinical()) if callable(can_clinical) else bool(can_clinical)
        role = 'clinical' if clinical_enabled else 'observational'

        summary = (request.data.get('summary') or '').strip()
        full_text = (request.data.get('full_text') or request.data.get('fullText') or '').strip()
        sections = request.data.get('sections') or []
        if not isinstance(sections, list):
            return Response({'error': 'sections_invalid'}, status=status.HTTP_400_BAD_REQUEST)
        if not summary and not full_text:
            return Response({'error': 'content_required'}, status=status.HTTP_400_BAD_REQUEST)

        composed = f'{summary}\n{full_text}'
        result = validate_safety_for_role(composed, role)
        if not result['passed']:
            return Response(
                {'error': 'safety_validation_failed', 'role': role, 'warnings': result['warnings']},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        note = SymbolicSessionNote.objects.create(
            patient=patient,
            therapist=user,
            workspace=(request.data.get('workspace') or 'generic'),
            role=role,
            summary=summary,
            full_text=full_text or summary,
            sections=sections,
            safety_warnings=result['warnings'],
            clinical_vocabulary=(role == 'clinical'),
        )
        return Response(_serialize_note(note), status=status.HTTP_201_CREATED)

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or getattr(profile, 'user_type', None) != 'therapist':
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

        patient_raw = request.query_params.get('patient') or request.query_params.get('patient_id')
        if not patient_raw:
            return Response({'results': []})
        patient, error = _resolve_patient(request, patient_raw)
        if error is not None:
            return error

        notes = SymbolicSessionNote.objects.filter(patient=patient).order_by('-created_at')
        return Response({'results': [_serialize_note(n) for n in notes]})
