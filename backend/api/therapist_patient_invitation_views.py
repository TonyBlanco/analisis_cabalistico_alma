"""
Vinculación terapeuta ↔ usuario personal ya registrado (p. ej. Google).
Flujo con consentimiento: búsqueda por email → invitación → aceptación/rechazo.
"""
from __future__ import annotations

import re
from datetime import datetime

from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .emails import send_therapist_patient_invitation_email
from .models import Patient, TherapistPatientInvitation, UserProfile
from .permissions import IsPersonalUser, IsTherapist


def _normalize_email(email: str) -> str:
    return (email or '').strip().lower()


def _split_full_name(full_name: str, user: User) -> tuple[str, str]:
    name = (full_name or '').strip()
    if name:
        parts = name.split(None, 1)
        first = parts[0]
        last = parts[1] if len(parts) > 1 else ''
        return first, last
    first = (user.first_name or '').strip() or 'Consultante'
    last = (user.last_name or '').strip()
    return first, last


def _mask_display_name(full_name: str) -> str:
    name = (full_name or '').strip()
    if not name:
        return 'Usuario registrado'
    parts = name.split()
    if len(parts) == 1:
        return f"{parts[0][0]}***" if parts[0] else 'Usuario registrado'
    return f"{parts[0]} {parts[-1][0]}***"


def _lookup_target_user(email: str) -> User | None:
    normalized = _normalize_email(email)
    if not normalized:
        return None
    return User.objects.filter(email__iexact=normalized).first()


def _patient_for_user(user: User) -> Patient | None:
    return Patient.objects.filter(user=user).first()


def _refresh_therapist_patient_count(therapist: User) -> None:
    profile = therapist.profile
    profile.current_patients_count = Patient.objects.filter(
        therapist=therapist,
        is_active=True,
    ).count()
    profile.save(update_fields=['current_patients_count'])


def _build_lookup_payload(therapist: User, email: str) -> dict:
    normalized = _normalize_email(email)
    user = _lookup_target_user(normalized)

    if not user:
        return {
            'status': 'not_found',
            'can_invite': False,
            'message': 'No hay ninguna cuenta registrada con este email.',
        }

    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        return {
            'status': 'not_linkable',
            'can_invite': False,
            'message': 'La cuenta existe pero no tiene perfil completo.',
        }

    existing_patient = _patient_for_user(user)
    if existing_patient:
        if existing_patient.therapist_id == therapist.id:
            return {
                'status': 'already_your_patient',
                'can_invite': False,
                'patient_id': existing_patient.id,
                'message': 'Este usuario ya está en tu lista de consultantes.',
            }
        return {
            'status': 'already_with_other_therapist',
            'can_invite': False,
            'message': 'Este usuario ya está vinculado como consultante con otro terapeuta.',
        }

    if profile.user_type == 'therapist':
        return {
            'status': 'not_linkable',
            'can_invite': False,
            'message': 'Este email pertenece a una cuenta de terapeuta.',
        }

    if profile.user_type == 'admin' or profile.is_admin:
        return {
            'status': 'not_linkable',
            'can_invite': False,
            'message': 'No se puede invitar a una cuenta administrativa.',
        }

    if profile.user_type not in ('personal', 'patient'):
        return {
            'status': 'not_linkable',
            'can_invite': False,
            'message': 'Tipo de cuenta no compatible con este flujo.',
        }

    pending = TherapistPatientInvitation.objects.filter(
        therapist=therapist,
        target_user=user,
        status='pending',
    ).exists()

    has_birth_date = bool(profile.birth_date)

    return {
        'status': 'found_personal',
        'can_invite': not pending,
        'display_hint': _mask_display_name(profile.full_name),
        'has_birth_date': has_birth_date,
        'pending_invitation': pending,
        'uses_google': bool(profile.google_id),
        'message': (
            'Ya enviaste una invitación pendiente a este usuario.'
            if pending
            else 'Usuario encontrado. Puedes enviar una invitación de vinculación.'
        ),
    }


def create_patient_from_invitation(invitation: TherapistPatientInvitation) -> Patient:
    """Crea el registro Patient tras aceptación y actualiza el perfil del usuario."""
    user = invitation.target_user
    profile = user.profile
    therapist = invitation.therapist

    birth_date = profile.birth_date or invitation.supplemental_birth_date
    if not birth_date:
        raise ValueError('birth_date_required')

    first_name, last_name = _split_full_name(profile.full_name, user)
    full_name = f"{first_name} {last_name}".strip() or profile.full_name

    if Patient.objects.filter(user=user).exists():
        raise ValueError('user_already_has_patient')

    patient = Patient.objects.create(
        therapist=therapist,
        user=user,
        first_name=first_name,
        last_name=last_name,
        full_name=full_name,
        email=_normalize_email(invitation.email) or user.email,
        phone=profile.phone or '',
        birth_date=birth_date,
        birth_time=profile.birth_time,
        birth_city=profile.birth_city or '',
        birth_country=profile.birth_country or '',
        birth_latitude=profile.birth_latitude,
        birth_longitude=profile.birth_longitude,
        birth_timezone=profile.birth_timezone or '',
        is_active=True,
        therapy_status='active',
    )

    profile.user_type = 'patient'
    if not profile.consent_accepted_at:
        profile.consent_accepted_at = timezone.now()
    profile.save(update_fields=['user_type', 'consent_accepted_at'])

    invitation.status = 'accepted'
    invitation.patient = patient
    invitation.responded_at = timezone.now()
    invitation.save(update_fields=['status', 'patient', 'responded_at'])

    _refresh_therapist_patient_count(therapist)
    return patient


class TherapistPatientLookupView(APIView):
    """POST /api/therapist/patients/lookup/ — comprobar si un email puede vincularse."""
    permission_classes = [IsAuthenticated, IsTherapist]

    def post(self, request):
        email = _normalize_email(request.data.get('email', ''))
        if not email or not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return Response(
                {'error': 'email_invalid', 'message': 'Indica un email válido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(_build_lookup_payload(request.user, email))


class TherapistPatientInviteView(APIView):
    """POST /api/therapist/patients/invite/ — enviar invitación de vinculación."""
    permission_classes = [IsAuthenticated, IsTherapist]

    def post(self, request):
        email = _normalize_email(request.data.get('email', ''))
        message = (request.data.get('message') or '').strip()[:2000]
        supplemental_birth_date = request.data.get('birth_date')

        if not email:
            return Response(
                {'error': 'email_required', 'message': 'El email es obligatorio.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        lookup = _build_lookup_payload(request.user, email)
        if not lookup.get('can_invite'):
            return Response(
                {'error': lookup.get('status', 'not_linkable'), 'message': lookup.get('message')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = _lookup_target_user(email)
        if not user:
            return Response(
                {'error': 'not_found', 'message': 'Usuario no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile = user.profile
        birth_date_obj = None
        if supplemental_birth_date:
            try:
                if isinstance(supplemental_birth_date, str):
                    birth_date_obj = datetime.strptime(supplemental_birth_date, '%Y-%m-%d').date()
                else:
                    birth_date_obj = supplemental_birth_date
            except (ValueError, TypeError):
                return Response(
                    {'error': 'birth_date_invalid', 'message': 'Fecha de nacimiento inválida.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if not profile.birth_date and not birth_date_obj:
            return Response(
                {
                    'error': 'birth_date_required',
                    'message': 'El usuario no tiene fecha de nacimiento en su perfil. Indícala para enviar la invitación.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        therapist_profile = request.user.profile
        can_add, limit_message = therapist_profile.can_add_patient()
        if not can_add:
            return Response({'error': 'patient_limit', 'message': limit_message}, status=status.HTTP_403_FORBIDDEN)

        invitation = TherapistPatientInvitation.objects.create(
            therapist=request.user,
            target_user=user,
            email=email,
            message=message,
            supplemental_birth_date=birth_date_obj,
        )

        email_sent = send_therapist_patient_invitation_email(
            invitation,
            request.user.profile,
            user,
        )

        return Response(
            {
                'invitation': {
                    'id': invitation.id,
                    'status': invitation.status,
                    'email': invitation.email,
                    'display_hint': _mask_display_name(profile.full_name),
                    'created_at': invitation.created_at.isoformat(),
                },
                'email_sent': email_sent,
                'message': (
                    'Invitación enviada. El usuario recibirá un email y debe aceptarla en su panel personal.'
                    if email_sent
                    else 'Invitación registrada. No se pudo enviar el email (revisa SMTP); el usuario puede verla al iniciar sesión.'
                ),
            },
            status=status.HTTP_201_CREATED,
        )


class TherapistPatientInvitationListView(APIView):
    """GET /api/therapist/patients/invitations/ — invitaciones enviadas por el terapeuta."""
    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request):
        status_filter = (request.query_params.get('status') or 'pending').strip()
        qs = TherapistPatientInvitation.objects.filter(therapist=request.user)
        if status_filter != 'all':
            qs = qs.filter(status=status_filter)
        items = []
        for inv in qs.select_related('target_user', 'target_user__profile', 'patient')[:50]:
            profile = inv.target_user.profile
            items.append({
                'id': inv.id,
                'email': inv.email,
                'status': inv.status,
                'display_hint': _mask_display_name(profile.full_name),
                'message': inv.message,
                'patient_id': inv.patient_id,
                'created_at': inv.created_at.isoformat(),
                'responded_at': inv.responded_at.isoformat() if inv.responded_at else None,
            })
        return Response({'invitations': items})


class TherapistPatientInvitationCancelView(APIView):
    """POST /api/therapist/patients/invitations/<id>/cancel/"""
    permission_classes = [IsAuthenticated, IsTherapist]

    def post(self, request, invitation_id: int):
        try:
            invitation = TherapistPatientInvitation.objects.get(
                pk=invitation_id,
                therapist=request.user,
            )
        except TherapistPatientInvitation.DoesNotExist:
            return Response(
                {'error': 'not_found', 'message': 'Invitación no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if invitation.status != 'pending':
            return Response(
                {'error': 'not_pending', 'message': 'Solo se pueden cancelar invitaciones pendientes.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        invitation.status = 'cancelled'
        invitation.responded_at = timezone.now()
        invitation.save(update_fields=['status', 'responded_at'])
        return Response({'message': 'Invitación cancelada.', 'status': 'cancelled'})


class PersonalTherapistInvitationListView(APIView):
    """GET /api/personal/therapist-invitations/ — invitaciones recibidas (usuario personal)."""
    permission_classes = [IsAuthenticated, IsPersonalUser]

    def get(self, request):
        qs = TherapistPatientInvitation.objects.filter(
            target_user=request.user,
            status='pending',
        ).select_related('therapist', 'therapist__profile')
        items = []
        for inv in qs:
            tp = inv.therapist.profile
            items.append({
                'id': inv.id,
                'therapist': {
                    'id': inv.therapist.id,
                    'full_name': tp.full_name or inv.therapist.username,
                    'profession': tp.profession or '',
                },
                'message': inv.message,
                'created_at': inv.created_at.isoformat(),
            })
        return Response({'invitations': items})


class PersonalTherapistInvitationRespondView(APIView):
    """POST /api/personal/therapist-invitations/<id>/accept|reject/"""
    permission_classes = [IsAuthenticated, IsPersonalUser]

    def post(self, request, invitation_id: int, action: str):
        try:
            invitation = TherapistPatientInvitation.objects.select_related(
                'therapist', 'target_user', 'target_user__profile',
            ).get(pk=invitation_id, target_user=request.user)
        except TherapistPatientInvitation.DoesNotExist:
            return Response(
                {'error': 'not_found', 'message': 'Invitación no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if invitation.status != 'pending':
            return Response(
                {'error': 'not_pending', 'message': 'Esta invitación ya fue respondida.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if action == 'reject':
            invitation.status = 'rejected'
            invitation.responded_at = timezone.now()
            invitation.save(update_fields=['status', 'responded_at'])
            return Response({'message': 'Invitación rechazada.', 'status': 'rejected'})

        if action != 'accept':
            return Response({'error': 'invalid_action'}, status=status.HTTP_400_BAD_REQUEST)

        if _patient_for_user(request.user):
            return Response(
                {
                    'error': 'already_patient',
                    'message': 'Ya tienes un perfil de consultante vinculado.',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                patient = create_patient_from_invitation(invitation)
        except ValueError as exc:
            code = str(exc)
            if code == 'birth_date_required':
                return Response(
                    {
                        'error': code,
                        'message': 'Falta la fecha de nacimiento. Completa tu perfil o pide al terapeuta reenviar la invitación con ese dato.',
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {'error': code, 'message': 'No se pudo completar la vinculación.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                'message': 'Vinculación aceptada. Ya eres consultante de tu terapeuta.',
                'status': 'accepted',
                'patient_id': patient.id,
                'user_type': 'patient',
            },
            status=status.HTTP_200_OK,
        )