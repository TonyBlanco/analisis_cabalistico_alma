"""
Patient Status Management Views (Therapist Ownership)

Endpoints for therapists to manage their patients' therapy status.
Therapist owns their patients completely (admin de su cartera).
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as http_status
from django.utils import timezone
from .models import Patient


class PatientStatusUpdateView(APIView):
    """
    Update patient therapy status.
    
    Endpoint: PATCH /api/patients/<patient_id>/status/
    
    PERMISSIONS:
    - Requester MUST be therapist
    - Patient MUST be owned by therapist (ownership check)
    
    ALLOWED STATUS TRANSITIONS:
    - active → paused, inactive, archived
    - paused → active, inactive, archived
    - inactive → active, paused, archived
    - archived → active (restore)
    
    PAYLOAD:
    {
        "therapy_status": "paused",
        "pause_reason": "Vacaciones del paciente" (optional, required for paused)
    }
    
    BUSINESS RULES:
    - pause_reason required if therapy_status === 'paused'
    - status_changed_at updated automatically
    - status_changed_by = current user
    - is_active synchronized (false if archived)
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, patient_id):
        user = request.user
        
        # Security: Verify therapist role
        if not hasattr(user, 'profile') or user.profile.user_type != 'therapist':
            return Response(
                {'error': 'Solo terapeutas pueden cambiar el estado de sus pacientes'},
                status=http_status.HTTP_403_FORBIDDEN
            )
        
        # Security: Verify ownership
        try:
            patient = Patient.objects.get(id=patient_id, therapist=user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o no pertenece a este terapeuta'},
                status=http_status.HTTP_404_NOT_FOUND
            )
        
        # Validate payload
        new_status = request.data.get('therapy_status')
        pause_reason = request.data.get('pause_reason', '').strip()
        
        if not new_status:
            return Response(
                {'error': 'El campo therapy_status es requerido'},
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = ['active', 'paused', 'inactive', 'archived']
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Estado inválido. Valores permitidos: {", ".join(valid_statuses)}'},
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        # Business rule: pause_reason required for paused status
        if new_status == 'paused' and not pause_reason:
            return Response(
                {'error': 'El campo pause_reason es requerido para pausar al paciente'},
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        # Update patient status
        old_status = patient.therapy_status
        patient.therapy_status = new_status
        patient.pause_reason = pause_reason if new_status == 'paused' else ''
        patient.status_changed_at = timezone.now()
        patient.status_changed_by = user
        
        # Synchronize is_active
        patient.is_active = (new_status != 'archived')
        
        patient.save()
        
        return Response({
            'message': f'Estado del paciente actualizado de "{old_status}" a "{new_status}"',
            'patient_id': patient.id,
            'patient_name': patient.full_name,
            'therapy_status': patient.therapy_status,
            'pause_reason': patient.pause_reason,
            'status_changed_at': patient.status_changed_at.isoformat(),
            'status_changed_by': user.username,
            'is_active': patient.is_active,
        }, status=http_status.HTTP_200_OK)


class PatientArchiveView(APIView):
    """
    Archive patient (soft delete).
    
    Endpoint: DELETE /api/patients/<patient_id>/archive/
    
    FUNCTIONALITY:
    - Sets therapy_status = 'archived'
    - Sets is_active = False
    - Patient data is preserved (soft delete)
    - Can be restored via PATCH /status/ → active
    
    PERMISSIONS:
    - Therapist ownership check
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, patient_id):
        user = request.user
        
        # Security: Verify therapist role
        if not hasattr(user, 'profile') or user.profile.user_type != 'therapist':
            return Response(
                {'error': 'Solo terapeutas pueden archivar sus pacientes'},
                status=http_status.HTTP_403_FORBIDDEN
            )
        
        # Security: Verify ownership
        try:
            patient = Patient.objects.get(id=patient_id, therapist=user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o no pertenece a este terapeuta'},
                status=http_status.HTTP_404_NOT_FOUND
            )
        
        # Archive patient (soft delete)
        patient.therapy_status = 'archived'
        patient.is_active = False
        patient.status_changed_at = timezone.now()
        patient.status_changed_by = user
        patient.save()
        
        return Response({
            'message': f'Paciente "{patient.full_name}" archivado correctamente',
            'patient_id': patient.id,
            'therapy_status': 'archived',
            'can_restore': True,
        }, status=http_status.HTTP_200_OK)
