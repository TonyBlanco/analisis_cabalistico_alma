from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import PatientMessage
from .models import Patient as PatientModel
from .models import UserProfile
from .serializers import PatientMessageSerializer


class PatientNotesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Only therapists can create notes
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.user_type != 'therapist':
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

        # Normalize patient identifier from payload (accept `patient` or `patient_id`)
        patient_id_raw = request.data.get('patient_id') or request.data.get('patient')
        if not patient_id_raw:
            return Response({'error': 'patient_id_required'}, status=status.HTTP_400_BAD_REQUEST)

        # Normalize to int safely
        try:
            patient_id = int(str(patient_id_raw).strip())
        except (ValueError, TypeError):
            return Response({'error': 'patient_id_invalid'}, status=status.HTTP_400_BAD_REQUEST)

        # Resolve patient safely
        try:
            patient = PatientModel.objects.get(id=patient_id)
        except PatientModel.DoesNotExist:
            return Response({'error': 'patient_not_found'}, status=status.HTTP_404_NOT_FOUND)

        # Validate ownership: therapist must own the patient
        if getattr(patient, 'therapist_id', None) != getattr(user, 'id', None):
            return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)

        # Enforce plain text (no markdown): strip newlines? we accept content but limit length
        content = (request.data.get('content') or '').strip()
        if not content:
            return Response({'error': 'content is required'}, status=status.HTTP_400_BAD_REQUEST)
        if len(content) > 1000:
            return Response({'error': 'content too long'}, status=status.HTTP_400_BAD_REQUEST)

        # create via serializer to ensure validations
        serializer = PatientMessageSerializer(data={'patient': patient.id, 'content': content}, context={'request': request})
        if serializer.is_valid():
            note = serializer.save(therapist=user)
            out = PatientMessageSerializer(note, context={'request': request})
            return Response(out.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        # If caller is a patient, list their own notes
        if profile and profile.user_type == 'patient':
            patient = PatientModel.objects.filter(user=user, is_active=True).order_by('-id').first()
            if not patient:
                return Response({'results': []})
            notes = PatientMessage.objects.filter(patient=patient, is_archived=False).order_by('-created_at')
            serializer = PatientMessageSerializer(notes, many=True, context={'request': request})
            return Response({'results': serializer.data})

        # If caller is a therapist and provided ?patient=, allow viewing that patient's notes
        if profile and profile.user_type == 'therapist':
            patient_raw = request.query_params.get('patient') or request.query_params.get('patient_id')
            if not patient_raw:
                return Response({'results': []})

            try:
                patient_id = int(str(patient_raw).strip())
            except (ValueError, TypeError):
                return Response({'error': 'patient_id_invalid'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                patient = PatientModel.objects.get(id=patient_id)
            except PatientModel.DoesNotExist:
                return Response({'error': 'patient_not_found'}, status=status.HTTP_404_NOT_FOUND)

            # Therapist must own the patient
            if getattr(patient, 'therapist_id', None) != getattr(user, 'id', None):
                return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)

            notes = PatientMessage.objects.filter(patient=patient, is_archived=False).order_by('-created_at')
            serializer = PatientMessageSerializer(notes, many=True, context={'request': request})
            return Response({'results': serializer.data})

        # Default: forbidden
        return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
