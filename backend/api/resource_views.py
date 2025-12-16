"""
Resource Access Core Views - FASE SELLADA
Endpoints mínimos para gestión de acceso a recursos compartidos.
"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from django.shortcuts import get_object_or_404
from django.db import IntegrityError

from .models import Resource, UserResourceAccess, Patient, UserProfile
from .serializers import (
    ResourceSerializer,
    ResourceWithAccessSerializer,
    UserResourceAccessSerializer,
    AssignResourceSerializer,
)
from .permissions import IsTherapist


class MyResourcesView(APIView):
    """
    GET /api/resources/my/
    Lista todos los recursos accesibles para el usuario actual.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        user_type = user.profile.user_type if hasattr(user, 'profile') else None
        
        # Obtener recursos con acceso explícito
        accesses = UserResourceAccess.objects.filter(user=user).select_related('resource', 'assigned_by')
        resources_with_access = [access.resource for access in accesses]
        
        # Obtener recursos free (según nivel y visibilidad)
        free_resources = Resource.objects.filter(
            level='free',
            is_active=True
        ).exclude(id__in=[r.id for r in resources_with_access])
        
        # Combinar recursos
        all_resources = list(resources_with_access) + list(free_resources)
        
        # Filtrar por rol (Personal no ve clínicos)
        if user_type == 'personal':
            all_resources = [r for r in all_resources if r.category != 'clínica']
        
        # Serializar con información de acceso
        serializer = ResourceWithAccessSerializer(
            all_resources,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'resources': serializer.data
        }, status=status.HTTP_200_OK)


class AssignResourceToPatientView(APIView):
    """
    POST /api/patients/{id}/resources/assign
    Terapeuta asigna recurso a paciente.
    """
    permission_classes = [IsAuthenticated, IsTherapist]
    
    def post(self, request, id):
        # Validar que es terapeuta
        if not hasattr(request.user, 'profile') or request.user.profile.user_type != 'therapist':
            raise PermissionDenied("Solo los terapeutas pueden asignar recursos")
        
        # Obtener paciente y validar ownership
        patient = get_object_or_404(Patient, id=id)
        if patient.therapist != request.user:
            raise PermissionDenied("No tienes acceso a este paciente")
        
        # Validar que el paciente tenga usuario asociado
        if not patient.user:
            raise ValidationError("El paciente no tiene cuenta de usuario asociada")
        
        # Validar request
        serializer = AssignResourceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        resource_id = serializer.validated_data['resource_id']
        
        # Obtener recurso
        resource = get_object_or_404(Resource, id=resource_id, is_active=True)
        
        # Validar que el paciente no tenga ya acceso
        if UserResourceAccess.objects.filter(user=patient.user, resource=resource).exists():
            return Response(
                {'error': 'El paciente ya tiene acceso a este recurso'},
                status=status.HTTP_409_CONFLICT
            )
        
        # Crear acceso
        try:
            access = UserResourceAccess.objects.create(
                user=patient.user,
                resource=resource,
                source='assigned_by_therapist',
                assigned_by=request.user
            )
        except IntegrityError:
            return Response(
                {'error': 'El paciente ya tiene acceso a este recurso'},
                status=status.HTTP_409_CONFLICT
            )
        
        serializer_response = UserResourceAccessSerializer(access)
        return Response(serializer_response.data, status=status.HTTP_201_CREATED)


class AcquireResourceView(APIView):
    """
    POST /api/resources/{id}/acquire
    Simula "compra" de recurso (sin pagos todavía).
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, id):
        user = request.user
        user_type = user.profile.user_type if hasattr(user, 'profile') else None
        
        # Validar que el usuario puede adquirir recursos
        if user_type not in ['patient', 'personal']:
            raise PermissionDenied("Solo pacientes y usuarios personales pueden adquirir recursos")
        
        # Obtener recurso
        resource = get_object_or_404(Resource, id=id, is_active=True)
        
        # Validar que no tenga ya acceso
        if UserResourceAccess.objects.filter(user=user, resource=resource).exists():
            return Response(
                {'error': 'Ya tienes acceso a este recurso'},
                status=status.HTTP_409_CONFLICT
            )
        
        # Crear acceso con source='self_purchased'
        try:
            access = UserResourceAccess.objects.create(
                user=user,
                resource=resource,
                source='self_purchased',
                assigned_by=None
            )
        except IntegrityError:
            return Response(
                {'error': 'Ya tienes acceso a este recurso'},
                status=status.HTTP_409_CONFLICT
            )
        
        # Si es paciente y tiene terapeuta, crear notificación (futuro)
        # Por ahora solo creamos el acceso
        
        serializer_response = UserResourceAccessSerializer(access)
        return Response(serializer_response.data, status=status.HTTP_201_CREATED)
