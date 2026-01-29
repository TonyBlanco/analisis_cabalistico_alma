"""DRF views for SHA (Auditoría de Armonía Sefirótica)."""

from typing import Dict
from uuid import UUID
from django.contrib.auth import get_user_model
from django.db import transaction, models
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.exceptions import ValidationError, PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import (
    WorkspaceDefinition,
    WorkspaceInstance,
    WorkspacePermission,
    WorkspaceArtifact,
)
from .serializers import (
    WorkspaceInstanceSerializer,
    WorkspaceInstanceListSerializer,
    CreateWorkspaceRequestSerializer,
    CreateWorkspaceResponseSerializer,
    SaveArtifactRequestSerializer,
    ArtifactSerializer,
    SealWorkspaceRequestSerializer,
    InstanceActionRequestSerializer,
)

User = get_user_model()


def get_default_definition() -> WorkspaceDefinition:
    definition, _ = WorkspaceDefinition.objects.get_or_create(
        code='SHA_SEFIROTICA',
        defaults={
            'name': 'Auditoría de Armonía Sefirótica',
            'description': 'Evaluación holística de balance sefirotico',
            'version': '1.0',
        }
    )
    return definition


def check_permission(instance: WorkspaceInstance, user: User, required: str) -> bool:
    """Simple permission check with patient exceptions."""
    if user.is_superuser or user.is_staff:
        return True
    if instance.creator_user_id == user.id:
        return True
    if required == 'patient' and instance.subject_user_id == user.id:
        return True

    hierarchy: Dict[str, int] = {
        'observer': 1,
        'executor': 2,
        'reviewer': 3,
        'admin': 4,
    }

    permissions = instance.permissions.filter(user=user, is_active=True)
    for perm in permissions:
        if hierarchy.get(perm.permission_type, 0) >= hierarchy.get(required, 0):
            return True
    return False


class CreateWorkspaceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateWorkspaceRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        subject_user_id = serializer.validated_data['subject_user_id']
        try:
            subject_user = User.objects.get(id=subject_user_id)
        except User.DoesNotExist:
            return Response({'error': 'subject_user_id must reference an existing user'}, status=status.HTTP_400_BAD_REQUEST)

        definition = get_default_definition()

        existing = WorkspaceInstance.objects.filter(
            definition=definition,
            subject_user=subject_user,
            status__in=['created', 'in_progress']
        ).first()
        if existing:
            return Response(
                {'error': 'Ya existe un workspace activo para este consultante'},
                status=status.HTTP_409_CONFLICT
            )

        with transaction.atomic():
            instance = WorkspaceInstance.objects.create(
                definition=definition,
                subject_user=subject_user,
                creator_user=request.user,
                config=serializer.validated_data.get('config', {}),
                metadata=serializer.validated_data.get('metadata', {}),
                status='created'
            )

            WorkspacePermission.objects.create(
                workspace_instance=instance,
                user=request.user,
                permission_type='executor',
                granted_by=request.user,
                is_active=True
            )

        response = CreateWorkspaceResponseSerializer({
            'workspace_id': instance.id,
            'status': instance.status,
            'subject_user_id': instance.subject_user_id,
            'creator_user_id': instance.creator_user_id,
            'created_at': instance.created_at,
        }).data
        return Response(response, status=status.HTTP_201_CREATED)


class ListWorkspacesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = WorkspaceInstance.objects.filter(definition__code='SHA_SEFIROTICA')

        # creator or subject
        qs = qs.filter(
            models.Q(creator_user=user) |
            models.Q(subject_user=user) |
            models.Q(id__in=WorkspacePermission.objects.filter(user=user, is_active=True).values('workspace_instance_id'))
        ).distinct()

        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        qs = qs.order_by('-created_at')
        data = WorkspaceInstanceListSerializer(qs, many=True).data
        return Response({'count': len(data), 'results': data})


class WorkspaceStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        instance_id = request.query_params.get('instance_id')
        if not instance_id:
            return Response({'error': 'instance_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        instance = get_object_or_404(WorkspaceInstance, id=instance_id)
        if not check_permission(instance, request.user, 'observer'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        data = WorkspaceInstanceSerializer(instance).data
        return Response({'instance': data})


class SaveArtifactView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SaveArtifactRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        instance = get_object_or_404(WorkspaceInstance, id=serializer.validated_data['instance_id'])
        artifact_type = serializer.validated_data['artifact_type']
        share_with_consultant = serializer.validated_data.get('share_with_consultant', False)

        is_patient = request.user.id == instance.subject_user_id
        if is_patient and artifact_type != 'patient_submission':
            return Response({'error': 'Solo puedes enviar patient_submission'}, status=status.HTTP_403_FORBIDDEN)

        required_perm = 'patient' if is_patient else 'executor'
        if not check_permission(instance, request.user, required_perm):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        artifact = WorkspaceArtifact.objects.create(
            workspace_instance=instance,
            artifact_type=artifact_type,
            created_by=request.user,
            content=serializer.validated_data['content'],
            share_with_consultant=share_with_consultant,
            is_patient_submission=is_patient,
        )

        if instance.status == 'created':
            instance.status = 'in_progress'
            instance.started_at = timezone.now()
            instance.save(update_fields=['status', 'started_at', 'updated_at'])

        return Response({'artifact': ArtifactSerializer(artifact).data}, status=status.HTTP_201_CREATED)


class ArtifactsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        instance_id = request.query_params.get('instance_id')
        if not instance_id:
            return Response({'error': 'instance_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        instance = get_object_or_404(WorkspaceInstance, id=instance_id)
        if not check_permission(instance, request.user, 'observer') and request.user.id != instance.subject_user_id:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        artifacts = instance.artifacts.all()
        if request.user.id == instance.subject_user_id:
            artifacts = artifacts.filter(
                models.Q(is_patient_submission=True, created_by=request.user) |
                models.Q(share_with_consultant=True)
            )

        data = ArtifactSerializer(artifacts.order_by('-created_at'), many=True).data
        return Response({'artifacts': data})


class SealWorkspaceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SealWorkspaceRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        instance = get_object_or_404(WorkspaceInstance, id=serializer.validated_data['instance_id'])
        if not check_permission(instance, request.user, 'executor'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        core_artifact = instance.artifacts.filter(
            artifact_type__in=['balance_map', 'patient_submission'],
        ).first()
        if not core_artifact:
            return Response({'error': 'No se puede sellar sin artefacto principal'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            instance.mark_sealed()
            instance.artifacts.filter(is_sealed=False).update(is_sealed=True, sealed_at=timezone.now())

        return Response({'instance': WorkspaceInstanceSerializer(instance).data})


class ReviewWorkspaceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = InstanceActionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        instance = get_object_or_404(WorkspaceInstance, id=serializer.validated_data['instance_id'])
        if not check_permission(instance, request.user, 'reviewer'):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        instance.mark_reviewed()
        return Response({'instance': WorkspaceInstanceSerializer(instance).data})
