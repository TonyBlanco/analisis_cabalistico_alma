"""Views for data cleanup utilities (therapist only)."""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from api.models import Patient
from api.test_models import TestResult, Assignment, UserTestAccess
from django.db.models import Q

User = get_user_model()


class DataCleanupView(APIView):
    """API endpoint for therapists to clean test data for their patients.
    
    Security:
    - Only therapists can access
    - Therapists can only clean data for THEIR patients
    - Dry-run by default for safety
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List patients with their data counts."""
        user = request.user
        
        # Only therapists can use this tool
        if not hasattr(user, 'profile') or user.profile.user_type != 'therapist':
            return Response(
                {'error': 'Only therapists can access this tool'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get therapist's patients
        patients = Patient.objects.filter(
            therapist=user,
            is_active=True
        ).select_related('user')
        
        patient_data = []
        for patient in patients:
            if not patient.user:
                continue
                
            # Count test results
            tr_linked = TestResult.objects.filter(patient=patient).count()
            tr_orphan = TestResult.objects.filter(
                user=patient.user,
                patient__isnull=True
            ).count()
            
            # Count assignments
            assignments = Assignment.objects.filter(
                Q(clinical_profile=patient) | Q(subject_user=patient.user)
            ).count()
            
            # Count test accesses (assigned tests)
            test_accesses = UserTestAccess.objects.filter(user=patient.user).count()
            
            patient_data.append({
                'id': patient.id,
                'user_id': patient.user.id,
                'full_name': patient.full_name,
                'email': patient.email,
                'counts': {
                    'test_results_linked': tr_linked,
                    'test_results_orphan': tr_orphan,
                    'assignments': assignments,
                    'test_accesses': test_accesses,
                    'total': tr_linked + tr_orphan + assignments + test_accesses
                }
            })
        
        return Response({
            'patients': patient_data
        })

    def post(self, request):
        """Execute data cleanup for a specific patient.
        
        Body params:
        - patient_id: ID of the Patient record
        - dry_run: boolean (default: True)
        """
        user = request.user
        
        # Only therapists can use this tool
        if not hasattr(user, 'profile') or user.profile.user_type != 'therapist':
            return Response(
                {'error': 'Only therapists can access this tool'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        patient_id = request.data.get('patient_id')
        dry_run = request.data.get('dry_run', True)
        
        if not patient_id:
            return Response(
                {'error': 'patient_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify patient belongs to this therapist
        try:
            patient = Patient.objects.get(
                id=patient_id,
                therapist=user,
                is_active=True
            )
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found or not owned by you'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not patient.user:
            return Response(
                {'error': 'Patient has no associated user account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Count records
        tr_linked_qs = TestResult.objects.filter(patient=patient)
        tr_orphan_qs = TestResult.objects.filter(
            user=patient.user,
            patient__isnull=True
        )
        assign_qs = Assignment.objects.filter(
            Q(clinical_profile=patient) | Q(subject_user=patient.user)
        )
        access_qs = UserTestAccess.objects.filter(user=patient.user)
        
        counts = {
            'test_results_linked': tr_linked_qs.count(),
            'test_results_orphan': tr_orphan_qs.count(),
            'assignments': assign_qs.count(),
            'test_accesses': access_qs.count(),
        }
        
        if dry_run:
            return Response({
                'dry_run': True,
                'patient': {
                    'id': patient.id,
                    'full_name': patient.full_name,
                },
                'counts': counts,
                'message': 'Dry-run mode: no records deleted. Set dry_run=false to execute.'
            })
        
        # Execute deletions
        deleted_tr_orphan = tr_orphan_qs.delete()
        deleted_tr_linked = tr_linked_qs.delete()
        deleted_assign = assign_qs.delete()
        deleted_access = access_qs.delete()
        
        return Response({
            'dry_run': False,
            'patient': {
                'id': patient.id,
                'full_name': patient.full_name,
            },
            'deleted': {
                'test_results_orphan': deleted_tr_orphan[0] if deleted_tr_orphan else 0,
                'test_results_linked': deleted_tr_linked[0] if deleted_tr_linked else 0,
                'assignments': deleted_assign[0] if deleted_assign else 0,
                'test_accesses': deleted_access[0] if deleted_access else 0,
            },
            'message': 'Cleanup completed successfully'
        })
