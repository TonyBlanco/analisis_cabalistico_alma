"""
Transgeneracional Profundo SWM Views.

REST API views for psychogenealogical workspace.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction

from swm.transgenerational.models import (
    TransgenerationalSession,
    FamilyMember,
    FamilyRelationship,
    TransgenerationalPattern,
    SyndromeMark,
    TransgenerationalSnapshot,
    RELATIONSHIP_CHOICES,
    PATTERN_TYPE_CHOICES,
    EVENT_TYPE_CHOICES,
    GENDER_CHOICES,
    MEMBER_STATUS_CHOICES,
)
from swm.transgenerational.serializers import (
    TransgenerationalSessionListSerializer,
    TransgenerationalSessionDetailSerializer,
    TransgenerationalSessionCreateSerializer,
    TransgenerationalSessionUpdateSerializer,
    FamilyMemberSerializer,
    FamilyMemberCreateSerializer,
    FamilyRelationshipSerializer,
    FamilyRelationshipCreateSerializer,
    TransgenerationalPatternSerializer,
    TransgenerationalPatternCreateSerializer,
    SyndromeMarkSerializer,
    SyndromeMarkCreateSerializer,
    TransgenerationalSnapshotSerializer,
    GenogramUpdateSerializer,
)

import logging

logger = logging.getLogger(__name__)


# ============================================================================
# SESSION VIEWS
# ============================================================================

class TransgenerationalSessionListView(APIView):
    """
    GET /api/swm/transgenerational/sessions/
    
    List all transgenerational sessions for the current therapist.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        patient_id = request.query_params.get('patient_id')
        
        # Therapists see their sessions
        if hasattr(user, 'therapist_profile') or user.groups.filter(name='therapist').exists():
            sessions = TransgenerationalSession.objects.filter(therapist=user)
        else:
            sessions = TransgenerationalSession.objects.filter(patient=user)
        
        if patient_id:
            sessions = sessions.filter(patient_id=patient_id)
        
        sessions = sessions.order_by('-created_at')
        
        serializer = TransgenerationalSessionListSerializer(sessions, many=True)
        return Response(serializer.data)


class TransgenerationalSessionCreateView(APIView):
    """
    POST /api/swm/transgenerational/sessions/
    
    Create a new transgenerational session.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        # Verify user is a therapist
        if not (hasattr(user, 'therapist_profile') or user.groups.filter(name='therapist').exists()):
            return Response(
                {'error': 'Solo terapeutas pueden crear sesiones transgeneracionales'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = TransgenerationalSessionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        session = serializer.save(therapist=user)
        
        detail_serializer = TransgenerationalSessionDetailSerializer(session)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)


class TransgenerationalSessionDetailView(APIView):
    """
    GET /api/swm/transgenerational/sessions/{id}/
    
    Get session details including family members and patterns.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, session_id):
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        user = request.user
        if session.therapist != user and session.patient != user:
            return Response(
                {'error': 'No tiene acceso a esta sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = TransgenerationalSessionDetailSerializer(session)
        return Response(serializer.data)


class TransgenerationalSessionUpdateView(APIView):
    """
    PATCH /api/swm/transgenerational/sessions/{id}/
    
    Update session (notes, title, focus_areas).
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, session_id):
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede actualizar la sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.is_closed:
            return Response(
                {'error': 'No se puede modificar una sesión cerrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = TransgenerationalSessionUpdateSerializer(session, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        
        detail_serializer = TransgenerationalSessionDetailSerializer(session)
        return Response(detail_serializer.data)


class TransgenerationalSessionStartView(APIView):
    """
    POST /api/swm/transgenerational/sessions/{id}/start/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, session_id):
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede iniciar la sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.status != 'created':
            return Response(
                {'error': f'No se puede iniciar una sesión con estado "{session.status}"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.start()
        
        detail_serializer = TransgenerationalSessionDetailSerializer(session)
        return Response(detail_serializer.data)


class TransgenerationalSessionCloseView(APIView):
    """
    POST /api/swm/transgenerational/sessions/{id}/close/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, session_id):
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede cerrar la sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.is_closed:
            return Response(
                {'error': 'La sesión ya está cerrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.close()

        self._record_for_mshe(session)

        detail_serializer = TransgenerationalSessionDetailSerializer(session)
        return Response(detail_serializer.data)

    def _record_for_mshe(self, session) -> None:
        """Persiste el artefacto normalizado (kind='transgenerational') del cierre.

        Scores 0-100 derivados de los datos reales del genograma; el MSHE los
        lee desde computed_result['lineage'] (federación de solo lectura).
        """
        from api.services.holistic_records import (
            build_transgenerational_module_payload,
            record_module_synthesis,
        )

        payload = build_transgenerational_module_payload(session)
        if payload:
            record_module_synthesis(**payload)


# ============================================================================
# GENOGRAM VIEWS
# ============================================================================

class GenogramView(APIView):
    """
    GET/PATCH /api/swm/transgenerational/genogram/{session_id}/
    
    Get or update the genogram data.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, session_id):
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        user = request.user
        if session.therapist != user and session.patient != user:
            return Response(
                {'error': 'No tiene acceso a esta sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response({
            'session_id': str(session.id),
            'genogram_data': session.genogram_data,
            'member_count': session.member_count,
            'updated_at': session.updated_at,
        })
    
    def patch(self, request, session_id):
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede actualizar el genograma'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.is_closed:
            return Response(
                {'error': 'No se puede modificar una sesión cerrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = GenogramUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        with transaction.atomic():
            if data.get('create_snapshot', False):
                TransgenerationalSnapshot.objects.create(
                    session=session,
                    genogram_data=session.genogram_data,
                    notes=data.get('snapshot_notes', '')
                )
            
            session.genogram_data = data['genogram_data']
            session.save(update_fields=['genogram_data', 'updated_at'])
        
        return Response({
            'session_id': str(session.id),
            'genogram_data': session.genogram_data,
            'updated_at': session.updated_at,
        })


# ============================================================================
# FAMILY MEMBER VIEWS
# ============================================================================

class FamilyMemberListView(APIView):
    """
    GET /api/swm/transgenerational/members/{session_id}/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, session_id):
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        user = request.user
        if session.therapist != user and session.patient != user:
            return Response(
                {'error': 'No tiene acceso a esta sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        members = session.family_members.all()
        serializer = FamilyMemberSerializer(members, many=True)
        return Response(serializer.data)


class FamilyMemberCreateView(APIView):
    """
    POST /api/swm/transgenerational/members/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede agregar miembros'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.is_closed:
            return Response(
                {'error': 'No se puede modificar una sesión cerrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = FamilyMemberCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        member = serializer.save(session=session)
        
        result_serializer = FamilyMemberSerializer(member)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)


class FamilyMemberUpdateView(APIView):
    """
    PATCH /api/swm/transgenerational/members/{member_id}/
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, member_id):
        member = get_object_or_404(FamilyMember, id=member_id)
        session = member.session
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede actualizar miembros'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.is_closed:
            return Response(
                {'error': 'No se puede modificar una sesión cerrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = FamilyMemberCreateSerializer(member, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        
        result_serializer = FamilyMemberSerializer(member)
        return Response(result_serializer.data)


class FamilyMemberDeleteView(APIView):
    """
    DELETE /api/swm/transgenerational/members/{member_id}/
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, member_id):
        member = get_object_or_404(FamilyMember, id=member_id)
        session = member.session
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede eliminar miembros'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.is_closed:
            return Response(
                {'error': 'No se puede modificar una sesión cerrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================================================
# FAMILY RELATIONSHIP VIEWS
# ============================================================================

class FamilyRelationshipListView(APIView):
    """
    GET /api/swm/transgenerational/relationships/{session_id}/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, session_id):
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        user = request.user
        if session.therapist != user and session.patient != user:
            return Response(
                {'error': 'No tiene acceso a esta sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        relationships = session.family_relationships.all()
        serializer = FamilyRelationshipSerializer(relationships, many=True)
        return Response(serializer.data)


class FamilyRelationshipCreateView(APIView):
    """
    POST /api/swm/transgenerational/relationships/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede agregar relaciones'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.is_closed:
            return Response(
                {'error': 'No se puede modificar una sesión cerrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = FamilyRelationshipCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        relationship = serializer.save(session=session)
        
        result_serializer = FamilyRelationshipSerializer(relationship)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)


# ============================================================================
# PATTERN VIEWS
# ============================================================================

class PatternListView(APIView):
    """
    GET /api/swm/transgenerational/patterns/{session_id}/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, session_id):
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        user = request.user
        if session.therapist != user and session.patient != user:
            return Response(
                {'error': 'No tiene acceso a esta sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        patterns = session.patterns.all()
        serializer = TransgenerationalPatternSerializer(patterns, many=True)
        return Response(serializer.data)


class PatternCreateView(APIView):
    """
    POST /api/swm/transgenerational/patterns/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede agregar patrones'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.is_closed:
            return Response(
                {'error': 'No se puede modificar una sesión cerrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = TransgenerationalPatternCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        pattern = serializer.save(session=session)
        
        result_serializer = TransgenerationalPatternSerializer(pattern)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)


class PatternUpdateView(APIView):
    """
    PATCH /api/swm/transgenerational/patterns/{pattern_id}/
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pattern_id):
        pattern = get_object_or_404(TransgenerationalPattern, id=pattern_id)
        session = pattern.session
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede actualizar patrones'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Allow updating even closed sessions for therapeutic work tracking
        serializer = TransgenerationalPatternCreateSerializer(pattern, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        
        result_serializer = TransgenerationalPatternSerializer(pattern)
        return Response(result_serializer.data)


# ============================================================================
# SYNDROME MARK VIEWS
# ============================================================================

class SyndromeMarkListView(APIView):
    """
    GET /api/swm/transgenerational/syndromes/{session_id}/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, session_id):
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        user = request.user
        if session.therapist != user and session.patient != user:
            return Response(
                {'error': 'No tiene acceso a esta sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        marks = session.syndrome_marks.all()
        serializer = SyndromeMarkSerializer(marks, many=True)
        return Response(serializer.data)


class SyndromeMarkCreateView(APIView):
    """
    POST /api/swm/transgenerational/syndromes/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede agregar marcas de síndrome'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.is_closed:
            return Response(
                {'error': 'No se puede modificar una sesión cerrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = SyndromeMarkCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        mark = serializer.save(session=session)
        
        result_serializer = SyndromeMarkSerializer(mark)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)


# ============================================================================
# SNAPSHOT VIEWS
# ============================================================================

class SnapshotListView(APIView):
    """
    GET /api/swm/transgenerational/sessions/{id}/snapshots/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, session_id):
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        user = request.user
        if session.therapist != user and session.patient != user:
            return Response(
                {'error': 'No tiene acceso a esta sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        snapshots = session.snapshots.all()
        serializer = TransgenerationalSnapshotSerializer(snapshots, many=True)
        return Response(serializer.data)


class SnapshotCreateView(APIView):
    """
    POST /api/swm/transgenerational/sessions/{id}/snapshots/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, session_id):
        session = get_object_or_404(TransgenerationalSession, id=session_id)
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede crear snapshots'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        notes = request.data.get('notes', '')
        
        snapshot = TransgenerationalSnapshot.objects.create(
            session=session,
            genogram_data=session.genogram_data,
            notes=notes
        )
        
        serializer = TransgenerationalSnapshotSerializer(snapshot)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ============================================================================
# CHOICES VIEW
# ============================================================================

class TransgenerationalChoicesView(APIView):
    """
    GET /api/swm/transgenerational/choices/
    
    Return all available choices for the transgenerational module.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from swm.transgenerational.models import FamilyRelationship
        
        return Response({
            'relationships': [{'value': c[0], 'label': c[1]} for c in RELATIONSHIP_CHOICES],
            'pattern_types': [{'value': c[0], 'label': c[1]} for c in PATTERN_TYPE_CHOICES],
            'event_types': [{'value': c[0], 'label': c[1]} for c in EVENT_TYPE_CHOICES],
            'genders': [{'value': c[0], 'label': c[1]} for c in GENDER_CHOICES],
            'member_statuses': [{'value': c[0], 'label': c[1]} for c in MEMBER_STATUS_CHOICES],
            'relationship_types': [{'value': c[0], 'label': c[1]} for c in FamilyRelationship.RELATIONSHIP_TYPE_CHOICES],
            'relationship_qualities': [{'value': c[0], 'label': c[1]} for c in FamilyRelationship.QUALITY_CHOICES],
        })
