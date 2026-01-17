"""
Tests for Questionnaire API endpoints (Fase 2).

Tests básicos para validar el funcionamiento de:
- GET /api/swm/mcmi4/questionnaire
- GET /api/swm/mcmi4/questionnaire/progress
- POST /api/swm/mcmi4/questionnaire/action (save_response, change_world)
- POST /api/swm/mcmi4/questionnaire/seal
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from swm.mcmi4.models import (
    WorkspaceDefinition,
    WorkspaceInstance,
    WorkspaceSession,
    WorkspaceArtifact,
    WorkspacePermission
)
from swm.mcmi4.services.questionnaire_service import QuestionnaireService
import uuid

User = get_user_model()


class QuestionnaireAPITestCase(TestCase):
    """Tests para Questionnaire API."""
    
    def setUp(self):
        """Setup común para todos los tests."""
        # Crear usuarios
        self.creator_user = User.objects.create_user(
            username='creator_test',
            password='testpass123'
        )
        self.subject_user = User.objects.create_user(
            username='subject_test',
            password='testpass123'
        )
        self.executor_user = User.objects.create_user(
            username='executor_test',
            password='testpass123'
        )
        
        # Crear definición de workspace
        self.workspace_def = WorkspaceDefinition.objects.create(
            code='MCMI4_MYSTIC',
            name='MCMI-4 Místico',
            version='1.0',
            is_active=True
        )
        
        # Crear workspace
        self.workspace = WorkspaceInstance.objects.create(
            workspace_definition=self.workspace_def,
            creator_user=self.creator_user,
            subject_user=self.subject_user,
            status='created',
            mcmi4_source_data_id='TEST_001'
        )
        
        # Cliente API
        self.client = APIClient()
    
    def test_questionnaire_get_requires_permission(self):
        """Test: GET /questionnaire requiere permiso de executor."""
        # Usuario sin permiso
        self.client.force_authenticate(user=self.executor_user)
        
        response = self.client.get(
            '/api/swm/mcmi4/questionnaire',
            {'workspace_id': str(self.workspace.id)}
        )
        
        # Debe fallar por falta de permiso (403 o 404 según guard)
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])
        
        # Otorgar permiso
        WorkspacePermission.objects.create(
            workspace_instance=self.workspace,
            user=self.executor_user,
            permission_type='executor',
            granted_by=self.creator_user
        )
        
        # Crear artifacts mínimos para que no sea 404
        selected_questions, metadata = QuestionnaireService.select_questions(
            subject_user_id=self.subject_user.id,
            id=str(self.workspace.id)
        )
        QuestionnaireService.create_questionnaire_config(
            workspace_instance=self.workspace,
            selected_questions=selected_questions,
            metadata=metadata
        )
        
        # Ahora debe funcionar
        response = self.client.get(
            '/api/swm/mcmi4/questionnaire',
            {'workspace_id': str(self.workspace.id)}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('questionnaire', response.data)
        self.assertIn('current_progress', response.data)
    
    def test_progress_save_response_persists_artifact(self):
        """Test: POST action=save_response persiste respuesta en artifact."""
        # Setup: crear config, session, progress
        selected_questions, metadata = QuestionnaireService.select_questions(
            subject_user_id=self.subject_user.id,
            id=str(self.workspace.id)
        )
        config_artifact = QuestionnaireService.create_questionnaire_config(
            workspace_instance=self.workspace,
            selected_questions=selected_questions,
            metadata=metadata
        )
        
        # Cambiar workspace a in_progress
        self.workspace.status = 'in_progress'
        self.workspace.save()
        
        # Crear sesión activa
        session = WorkspaceSession.objects.create(
            workspace_instance=self.workspace,
            executor_user=self.executor_user,
            started_at=timezone.now(),
            current_phase='questionnaire'
        )
        
        # Inicializar progreso
        progress_artifact = QuestionnaireService.initialize_progress(
            workspace_instance=self.workspace,
            session=session
        )
        
        # Otorgar permiso
        WorkspacePermission.objects.create(
            workspace_instance=self.workspace,
            user=self.executor_user,
            permission_type='executor',
            granted_by=self.creator_user
        )
        
        # Autenticar
        self.client.force_authenticate(user=self.executor_user)
        
        # Obtener primera pregunta
        first_question = selected_questions[0]
        
        # Guardar respuesta
        response = self.client.post(
            '/api/swm/mcmi4/questionnaire/action',
            {
                'workspace_id': str(self.workspace.id),
                'session_id': str(session.id),
                'action': 'save_response',
                'payload': {
                    'question_id': first_question['id'],
                    'value': 4,
                    'world': first_question['world']
                }
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['action'], 'save_response')
        
        # Verificar que la respuesta se persistió
        progress_artifact.refresh_from_db()
        responses = progress_artifact.content.get('responses', {})
        self.assertIn(first_question['id'], responses)
        self.assertEqual(responses[first_question['id']]['value'], 4)
    
    def test_change_world_forward_requires_completion(self):
        """Test: change_world hacia adelante requiere mundo actual completo."""
        # Setup: workspace in_progress con progreso parcial
        selected_questions, metadata = QuestionnaireService.select_questions(
            subject_user_id=self.subject_user.id,
            id=str(self.workspace.id)
        )
        QuestionnaireService.create_questionnaire_config(
            workspace_instance=self.workspace,
            selected_questions=selected_questions,
            metadata=metadata
        )
        
        self.workspace.status = 'in_progress'
        self.workspace.save()
        
        session = WorkspaceSession.objects.create(
            workspace_instance=self.workspace,
            executor_user=self.executor_user,
            started_at=timezone.now(),
            current_phase='questionnaire'
        )
        
        QuestionnaireService.initialize_progress(
            workspace_instance=self.workspace,
            session=session
        )
        
        WorkspacePermission.objects.create(
            workspace_instance=self.workspace,
            user=self.executor_user,
            permission_type='executor',
            granted_by=self.creator_user
        )
        
        self.client.force_authenticate(user=self.executor_user)
        
        # Intentar cambiar a Briah sin completar Atzilut (0/49)
        response = self.client.post(
            '/api/swm/mcmi4/questionnaire/action',
            {
                'workspace_id': str(self.workspace.id),
                'session_id': str(session.id),
                'action': 'change_world',
                'payload': {'target_world': 'briah'}
            },
            format='json'
        )
        
        # Debe fallar
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('incomplete', response.data['error'].lower())
        
        # Cambiar hacia atrás (Atzilut → Atzilut) debe funcionar
        response = self.client.post(
            '/api/swm/mcmi4/questionnaire/action',
            {
                'workspace_id': str(self.workspace.id),
                'session_id': str(session.id),
                'action': 'change_world',
                'payload': {'target_world': 'atzilut'}
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
    
    def test_seal_creates_completion_artifact_and_seals(self):
        """Test: POST /seal crea questionnaire_completion y sella workspace."""
        # Setup: workspace con 195 respuestas
        selected_questions, metadata = QuestionnaireService.select_questions(
            subject_user_id=self.subject_user.id,
            id=str(self.workspace.id)
        )
        QuestionnaireService.create_questionnaire_config(
            workspace_instance=self.workspace,
            selected_questions=selected_questions,
            metadata=metadata
        )
        
        self.workspace.status = 'in_progress'
        self.workspace.save()
        
        session = WorkspaceSession.objects.create(
            workspace_instance=self.workspace,
            executor_user=self.executor_user,
            started_at=timezone.now(),
            current_phase='questionnaire'
        )
        
        QuestionnaireService.initialize_progress(
            workspace_instance=self.workspace,
            session=session
        )
        
        # Simular 195 respuestas
        for i, question in enumerate(selected_questions):
            QuestionnaireService.save_response(
                workspace_instance=self.workspace,
                session=session,
                question_id=question['id'],
                value=3,  # Respuesta neutral
                world=question['world']
            )
        
        WorkspacePermission.objects.create(
            workspace_instance=self.workspace,
            user=self.executor_user,
            permission_type='executor',
            granted_by=self.creator_user
        )
        
        self.client.force_authenticate(user=self.executor_user)
        
        # Sellar workspace
        response = self.client.post(
            '/api/swm/mcmi4/questionnaire/seal',
            {
                'workspace_id': str(self.workspace.id),
                'session_id': str(session.id)
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'sealed')
        self.assertIn('completion_artifact_id', response.data)
        
        # Verificar que el artifact se creó
        completion_artifact = WorkspaceArtifact.objects.filter(
            workspace_instance=self.workspace,
            artifact_type='questionnaire_completion'
        ).first()
        
        self.assertIsNotNone(completion_artifact)
        self.assertEqual(len(completion_artifact.content['responses']), 195)
        
        # Verificar que workspace está sellado
        self.workspace.refresh_from_db()
        self.assertEqual(self.workspace.status, 'sealed')


