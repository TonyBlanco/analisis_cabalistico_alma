"""
Cábala Aplicada SWM Views.

REST API views for Tree of Life workspace.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Count

from swm.cabala.models import (
    CabalaSession,
    SefirahObservation,
    PathObservation,
    CabalaSessionSnapshot,
    SEFIRAH_CHOICES,
    PATH_CHOICES,
    METHOD_CHOICES,
    EMOTION_TYPE_CHOICES,
    FLOW_DIRECTION_CHOICES,
)
from swm.cabala.serializers import (
    CabalaSessionListSerializer,
    CabalaSessionDetailSerializer,
    CabalaSessionCreateSerializer,
    CabalaSessionUpdateSerializer,
    SefirahObservationSerializer,
    SefirahObservationCreateSerializer,
    PathObservationSerializer,
    PathObservationCreateSerializer,
    CabalaSessionSnapshotSerializer,
    TreeStateUpdateSerializer,
    BulkSefirahObservationSerializer,
)

import logging

logger = logging.getLogger(__name__)


# ============================================================================
# SESSION VIEWS
# ============================================================================

class CabalaSessionListView(APIView):
    """
    GET /api/swm/cabala/sessions/
    
    List all Cábala sessions for the current therapist.
    Optionally filter by patient_id.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        patient_id = request.query_params.get('patient_id')
        
        # Therapists see their sessions, patients see sessions where they are the patient
        if hasattr(user, 'therapist_profile') or user.groups.filter(name='therapist').exists():
            sessions = CabalaSession.objects.filter(therapist=user)
        else:
            sessions = CabalaSession.objects.filter(patient=user)
        
        if patient_id:
            sessions = sessions.filter(patient_id=patient_id)
        
        # Annotate with observation count
        sessions = sessions.annotate(
            observation_count=Count('sefirah_observations')
        ).order_by('-created_at')
        
        serializer = CabalaSessionListSerializer(sessions, many=True)
        return Response(serializer.data)


class CabalaSessionCreateView(APIView):
    """
    POST /api/swm/cabala/sessions/
    
    Create a new Cábala session.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        # Verify user is a therapist
        if not (hasattr(user, 'therapist_profile') or user.groups.filter(name='therapist').exists()):
            return Response(
                {'error': 'Solo terapeutas pueden crear sesiones de Cábala'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CabalaSessionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Create session with therapist set to current user
        session = serializer.save(therapist=user)
        
        # Return full detail
        detail_serializer = CabalaSessionDetailSerializer(session)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)


class CabalaSessionDetailView(APIView):
    """
    GET /api/swm/cabala/sessions/{id}/
    
    Get session details including observations.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, session_id):
        session = get_object_or_404(CabalaSession, id=session_id)
        
        # Verify access
        user = request.user
        if session.therapist != user and session.patient != user:
            return Response(
                {'error': 'No tiene acceso a esta sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CabalaSessionDetailSerializer(session)
        return Response(serializer.data)


class CabalaSessionUpdateView(APIView):
    """
    PATCH /api/swm/cabala/sessions/{id}/
    
    Update session (notes, title, clinical_context).
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, session_id):
        session = get_object_or_404(CabalaSession, id=session_id)
        
        # Only therapist can update
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
        
        serializer = CabalaSessionUpdateSerializer(session, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        
        detail_serializer = CabalaSessionDetailSerializer(session)
        return Response(detail_serializer.data)


class CabalaSessionStartView(APIView):
    """
    POST /api/swm/cabala/sessions/{id}/start/
    
    Start a session (change status from created to in_progress).
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, session_id):
        session = get_object_or_404(CabalaSession, id=session_id)
        
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
        
        detail_serializer = CabalaSessionDetailSerializer(session)
        return Response(detail_serializer.data)


class CabalaSessionCloseView(APIView):
    """
    POST /api/swm/cabala/sessions/{id}/close/
    
    Close a session.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, session_id):
        session = get_object_or_404(CabalaSession, id=session_id)
        
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
        
        detail_serializer = CabalaSessionDetailSerializer(session)
        return Response(detail_serializer.data)


# ============================================================================
# TREE STATE VIEWS
# ============================================================================

class TreeStateView(APIView):
    """
    GET/PATCH /api/swm/cabala/sessions/{id}/tree-state/
    
    Get or update the tree state for a session.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, session_id):
        session = get_object_or_404(CabalaSession, id=session_id)
        
        # Verify access
        user = request.user
        if session.therapist != user and session.patient != user:
            return Response(
                {'error': 'No tiene acceso a esta sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response({
            'session_id': str(session.id),
            'tree_state': session.tree_state,
            'updated_at': session.updated_at,
        })
    
    def patch(self, request, session_id):
        session = get_object_or_404(CabalaSession, id=session_id)
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede actualizar el estado del árbol'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.is_closed:
            return Response(
                {'error': 'No se puede modificar una sesión cerrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = TreeStateUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        with transaction.atomic():
            # Optionally create snapshot before updating
            if data.get('create_snapshot', False):
                CabalaSessionSnapshot.objects.create(
                    session=session,
                    tree_state=session.tree_state,
                    notes=data.get('snapshot_notes', '')
                )
            
            # Update tree state
            session.tree_state = data['tree_state']
            session.save(update_fields=['tree_state', 'updated_at'])
        
        return Response({
            'session_id': str(session.id),
            'tree_state': session.tree_state,
            'updated_at': session.updated_at,
        })


# ============================================================================
# SEFIRAH OBSERVATION VIEWS
# ============================================================================

class SefirahObservationListView(APIView):
    """
    GET /api/swm/cabala/sefirot/{session_id}/
    
    List all sefirah observations for a session.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, session_id):
        session = get_object_or_404(CabalaSession, id=session_id)
        
        # Verify access
        user = request.user
        if session.therapist != user and session.patient != user:
            return Response(
                {'error': 'No tiene acceso a esta sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        observations = session.sefirah_observations.all()
        serializer = SefirahObservationSerializer(observations, many=True)
        return Response(serializer.data)


class SefirahObservationCreateView(APIView):
    """
    POST /api/swm/cabala/sefirot/observe/
    
    Create or update a sefirah observation.
    Uses upsert logic: if observation for this sefirah exists, update it.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session = get_object_or_404(CabalaSession, id=session_id)
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede agregar observaciones'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.is_closed:
            return Response(
                {'error': 'No se puede modificar una sesión cerrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = SefirahObservationCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Upsert: create or update
        observation, created = SefirahObservation.objects.update_or_create(
            session=session,
            sefirah_name=data['sefirah_name'],
            defaults=data
        )
        
        result_serializer = SefirahObservationSerializer(observation)
        return Response(
            result_serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class SefirahObservationDeleteView(APIView):
    """
    DELETE /api/swm/cabala/sefirot/{observation_id}/
    
    Delete a sefirah observation.
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, observation_id):
        observation = get_object_or_404(SefirahObservation, id=observation_id)
        session = observation.session
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede eliminar observaciones'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.is_closed:
            return Response(
                {'error': 'No se puede modificar una sesión cerrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        observation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================================================
# PATH OBSERVATION VIEWS
# ============================================================================

class PathObservationListView(APIView):
    """
    GET /api/swm/cabala/paths/{session_id}/
    
    List all path observations for a session.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, session_id):
        session = get_object_or_404(CabalaSession, id=session_id)
        
        # Verify access
        user = request.user
        if session.therapist != user and session.patient != user:
            return Response(
                {'error': 'No tiene acceso a esta sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        observations = session.path_observations.all()
        serializer = PathObservationSerializer(observations, many=True)
        return Response(serializer.data)


class PathObservationCreateView(APIView):
    """
    POST /api/swm/cabala/paths/observe/
    
    Create or update a path observation.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session = get_object_or_404(CabalaSession, id=session_id)
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede agregar observaciones'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if session.is_closed:
            return Response(
                {'error': 'No se puede modificar una sesión cerrada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PathObservationCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Upsert: create or update
        observation, created = PathObservation.objects.update_or_create(
            session=session,
            path_index=data['path_index'],
            defaults=data
        )
        
        result_serializer = PathObservationSerializer(observation)
        return Response(
            result_serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


# ============================================================================
# SNAPSHOT VIEWS
# ============================================================================

class SessionSnapshotListView(APIView):
    """
    GET /api/swm/cabala/sessions/{id}/snapshots/
    
    List all snapshots for a session.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, session_id):
        session = get_object_or_404(CabalaSession, id=session_id)
        
        # Verify access
        user = request.user
        if session.therapist != user and session.patient != user:
            return Response(
                {'error': 'No tiene acceso a esta sesión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        snapshots = session.snapshots.all()
        serializer = CabalaSessionSnapshotSerializer(snapshots, many=True)
        return Response(serializer.data)


class SessionSnapshotCreateView(APIView):
    """
    POST /api/swm/cabala/sessions/{id}/snapshots/
    
    Create a snapshot of current tree state.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, session_id):
        session = get_object_or_404(CabalaSession, id=session_id)
        
        if session.therapist != request.user:
            return Response(
                {'error': 'Solo el terapeuta puede crear snapshots'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        notes = request.data.get('notes', '')
        
        snapshot = CabalaSessionSnapshot.objects.create(
            session=session,
            tree_state=session.tree_state,
            notes=notes
        )
        
        serializer = CabalaSessionSnapshotSerializer(snapshot)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ============================================================================
# METADATA VIEWS
# ============================================================================

class CabalaChoicesView(APIView):
    """
    GET /api/swm/cabala/choices/
    
    Return all available choices for the Cábala module.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'sefirot': [{'value': c[0], 'label': c[1]} for c in SEFIRAH_CHOICES],
            'paths': [{'value': c[0], 'label': c[1]} for c in PATH_CHOICES],
            'methods': [{'value': c[0], 'label': c[1]} for c in METHOD_CHOICES],
            'emotions': [{'value': c[0], 'label': c[1]} for c in EMOTION_TYPE_CHOICES],
            'flow_directions': [{'value': c[0], 'label': c[1]} for c in FLOW_DIRECTION_CHOICES],
        })
