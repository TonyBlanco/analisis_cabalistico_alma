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

        # Expect patient id in payload
        patient_id = request.data.get('patient') or request.data.get('patient_id')
        if not patient_id:
            return Response({'error': 'patient is required'}, status=status.HTTP_400_BAD_REQUEST)

        patient = get_object_or_404(PatientModel, id=patient_id)

        # Validate ownership: therapist must own the patient
        if patient.therapist_id != user.id:
            return Response({'error': 'No puedes crear notas para pacientes de otro terapeuta'}, status=status.HTTP_403_FORBIDDEN)

        # Enforce plain text (no markdown): strip newlines? we accept content but limit length
        content = (request.data.get('content') or '').strip()
        if not content:
            return Response({'error': 'content is required'}, status=status.HTTP_400_BAD_REQUEST)
        if len(content) > 1000:
            return Response({'error': 'content too long'}, status=status.HTTP_400_BAD_REQUEST)

        note = PatientMessage.objects.create(therapist=user, patient=patient, content=content)
        serializer = PatientMessageSerializer(note, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request):
        # Only patients can list their notes
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile or profile.user_type != 'patient':
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

        # Resolve patient record linked to this user
        patient = PatientModel.objects.filter(user=user, is_active=True).order_by('-id').first()
        if not patient:
            # If no patient record, return empty list per frontend rule
            return Response({'notes': []})

        notes = PatientMessage.objects.filter(patient=patient, is_archived=False).order_by('-created_at')
        serializer = PatientMessageSerializer(notes, many=True, context={'request': request})
        return Response({'notes': serializer.data})
