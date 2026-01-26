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
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

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


class ClinicalContextSummaryView(APIView):
    """
    GET /api/swm/cabala/clinical-summary/{patient_id}/
    
    Get a summary of clinical test data for Cabala workspace integration.
    Returns data from AQ-Kabbalah, ASRS-Essence, and SHA-Harmony tests.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, patient_id):
        from api.models import Patient
        from swm.cabala.services.session_service import (
            get_test_results_for_patient,
            extract_sefira_scores_from_aq,
            extract_ritmo_from_asrs,
            extract_harmony_from_sha,
        )
        
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify access - user must be therapist of this patient
        user = request.user
        is_therapist = hasattr(user, 'profile') and user.profile.user_type == 'therapist'
        is_owner = patient.therapist == user
        
        if not (is_owner or user.is_staff or user.is_superuser):
            return Response(
                {'error': 'No tiene acceso a los datos de este paciente'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Build summary
        summary = {
            'has_ritmo_almico': False,
            'has_aq_kabbalah': False,
            'has_sha_harmony': False,
            'illuminated_sefirot': [],
            'ritmo_state': None,
            'mundo_predominante': None,
            'harmony_index': None,
        }
        
        # 1. Check ASRS-Essence (Ritmo Almico)
        try:
            asrs_results = get_test_results_for_patient(patient, 'asrs_essence')
            if asrs_results and asrs_results.exists():
                asrs_result = asrs_results.first()
                ritmo_data = extract_ritmo_from_asrs(asrs_result)
                if ritmo_data:
                    summary['has_ritmo_almico'] = True
                    summary['ritmo_state'] = ritmo_data.get('ritmo_esencial')
                    summary['mundo_predominante'] = ritmo_data.get('mundo_predominante')
        except Exception as e:
            logger.warning(f"Error fetching ASRS results: {e}")
        
        # 2. Check AQ-Kabbalah (Sefirot Illumination)
        try:
            aq_results = get_test_results_for_patient(patient, 'aq_kabbalah')
            if aq_results and aq_results.exists():
                aq_result = aq_results.first()
                sefira_scores = extract_sefira_scores_from_aq(aq_result)
                if sefira_scores:
                    summary['has_aq_kabbalah'] = True
                    # Convert to illuminated sefirot list
                    for sefira, score in sefira_scores.items():
                        if score >= 7:  # Illumination threshold
                            summary['illuminated_sefirot'].append({
                                'name': sefira,
                                'intensity': min(score / 10.0, 1.0),
                                'aq_score': score,
                            })
        except Exception as e:
            logger.warning(f"Error fetching AQ results: {e}")
        
        # 3. Check SHA-Harmony
        try:
            sha_results = get_test_results_for_patient(patient, 'sha_harmony')
            if sha_results and sha_results.exists():
                sha_result = sha_results.first()
                harmony_data = extract_harmony_from_sha(sha_result)
                if harmony_data:
                    summary['has_sha_harmony'] = True
                    summary['harmony_index'] = harmony_data.get('harmony_index')
        except Exception as e:
            logger.warning(f"Error fetching SHA results: {e}")
        
        return Response(summary)


# ============================================================================
# COMPREHENSIVE REPORT VIEW (Phoenix Backend Bridge)
# ============================================================================

class ComprehensiveReportView(APIView):
    """
    Phoenix Backend Bridge - Comprehensive Kabbalistic Report.
    
    Exposes legacy engine (cabala_py) through modern Django REST API.
    
    Endpoint: GET /api/swm/cabala/comprehensive-report/?patient_id=<id>
    
    Returns complete kabbalistic map for specified patient or authenticated user.
    Cached for 1 hour since report is computationally expensive and static per user.
    """
    permission_classes = [IsAuthenticated]
    
    @method_decorator(cache_page(60 * 60))  # 1 hour cache
    def get(self, request):
        """
        Generate comprehensive kabbalistic report for patient or authenticated user.
        
        Query params:
            patient_id (optional): ID of patient to generate report for (therapist only)
        
        Returns:
            200: Complete report dictionary
            400: Missing profile or birth data
            403: Not authorized to access patient
            404: Patient not found
            500: Legacy engine error
        """
        from django.contrib.auth.models import User
        from api.models import Patient
        from swm.cabala.services.comprehensive_engine import ComprehensiveReportService
        
        try:
            # Check if patient_id is provided
            patient_id = request.query_params.get('patient_id')
            
            if patient_id:
                # Therapist requesting report for a patient
                try:
                    patient = Patient.objects.get(id=patient_id)
                except Patient.DoesNotExist:
                    return Response({
                        'status': 'error',
                        'error': f'Patient with ID {patient_id} not found',
                        'code': 'PATIENT_NOT_FOUND'
                    }, status=status.HTTP_404_NOT_FOUND)
                
                # Verify access - user must be therapist of this patient
                if patient.therapist != request.user and not (request.user.is_staff or request.user.is_superuser):
                    return Response({
                        'status': 'error',
                        'error': 'You do not have access to this patient',
                        'code': 'PERMISSION_DENIED'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                # Generate report directly from Patient model
                report = ComprehensiveReportService.generate_for_patient(patient)
                
                return Response({
                    'status': 'success',
                    'report': report,
                    'patient': {
                        'id': patient.id,
                        'full_name': patient.full_name,
                    },
                }, status=status.HTTP_200_OK)
            else:
                # Generate report for authenticated user
                target_user = request.user
                report = ComprehensiveReportService.generate_for_user(target_user)
                
                return Response({
                    'status': 'success',
                    'report': report,
                    'user': {
                        'username': target_user.username,
                        'id': target_user.id,
                    },
                }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            # Missing data (profile, name, birth_date)
            logger.warning(f"Validation error for user {request.user.username}: {e}")
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'MISSING_DATA'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except RuntimeError as e:
            # Legacy engine failure
            logger.error(f"Engine error for user {request.user.username}: {e}")
            return Response({
                'status': 'error',
                'error': 'Failed to generate report',
                'code': 'ENGINE_ERROR'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            # Unexpected error
            logger.error(f"Unexpected error for user {request.user.username}: {e}", exc_info=True)
            return Response({
                'status': 'error',
                'error': 'Internal server error',
                'code': 'INTERNAL_ERROR'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
