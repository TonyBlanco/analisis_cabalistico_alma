"""
SessionService - Business logic for session management.

Handles session start, progress tracking, ending.
"""

from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model
from swm.mcmi4.models import (
    WorkspaceInstance,
    WorkspaceSession,
    WorkspaceArtifact
)
from swm.mcmi4.services.audit_service import AuditService
from typing import Dict, Any, Optional
import uuid

User = get_user_model()


class SessionService:
    """Service for session operations."""
    
    @staticmethod
    @transaction.atomic
    def start_session(
        workspace: WorkspaceInstance,
        executor_user: User,
        request_context: Optional[Dict] = None
    ) -> WorkspaceSession:
        """
        Start new session in workspace.
        
        Validates:
        - workspace status is 'created' or 'in_progress'
        - no active session exists
        - executor has executor permission
        
        Returns created WorkspaceSession.
        """
        # Validate workspace status
        if workspace.status not in ['created', 'in_progress']:
            raise ValueError(
                f"Cannot start session in workspace with status {workspace.status}"
            )
        
        # Check for active session
        if workspace.sessions.filter(is_active=True).exists():
            raise ValueError(
                f"Workspace {workspace.id} already has an active session"
            )
        
        # Validate permission
        if not workspace.has_permission(executor_user, 'executor'):
            raise ValueError(
                f"User {executor_user.id} does not have executor permission"
            )
        
        # Transition workspace if needed
        if workspace.status == 'created':
            from swm.mcmi4.services.workspace_service import WorkspaceService
            workspace = WorkspaceService.transition_to_in_progress(
                workspace, executor_user, request_context
            )
        
        # Create session
        session = WorkspaceSession.objects.create(
            workspace_instance=workspace,
            executor_user=executor_user,
            session_state={'phase': 'initial_review', 'step': 1},
            current_phase='initial_review',
            is_active=True
        )
        
        AuditService.log_action(
            workspace_instance=workspace,
            session=session,
            user=executor_user,
            action='session_started',
            details={
                'session_id': str(session.id),
                'executor_user_id': str(executor_user.id)
            },
            request_context=request_context
        )
        
        return session
    
    @staticmethod
    @transaction.atomic
    def record_progress(
        session: WorkspaceSession,
        user: User,
        action: str,
        payload: Dict[str, Any],
        request_context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Record progress in session.
        
        Actions:
        - advance_phase: move to next phase
        - record_decision: log interpretive decision
        - generate_artifact: create artifact
        
        Returns updated session state and artifact_id if created.
        """
        if not session.is_active:
            raise ValueError(f"Session {session.id} is not active")
        
        artifact_id = None
        
        if action == 'advance_phase':
            new_phase = payload.get('new_phase')
            if not new_phase:
                raise ValueError("new_phase required for advance_phase action")
            
            session.current_phase = new_phase
            session.session_state['phase'] = new_phase
            session.session_state['step'] = payload.get('step', 1)
            session.interactions_count += 1
            
            AuditService.log_action(
                workspace_instance=session.workspace_instance,
                session=session,
                user=user,
                action='phase_advanced',
                details={'from': session.current_phase, 'to': new_phase},
                request_context=request_context
            )
        
        elif action == 'record_decision':
            decision_text = payload.get('decision')
            if not decision_text:
                raise ValueError("decision required for record_decision action")
            
            # Create decision_log artifact
            artifact = WorkspaceArtifact.objects.create(
                workspace_instance=session.workspace_instance,
                session=session,
                artifact_type='decision_log',
                content={'decision': decision_text, 'timestamp': timezone.now().isoformat()},
                created_by=user,
                metadata=payload.get('metadata', {})
            )
            artifact_id = artifact.id
            
            session.interactions_count += 1
            
            AuditService.log_action(
                workspace_instance=session.workspace_instance,
                session=session,
                user=user,
                action='decision_recorded',
                details={'artifact_id': str(artifact_id)},
                request_context=request_context
            )
        
        elif action == 'generate_artifact':
            artifact_type = payload.get('artifact_type')
            content = payload.get('content')
            
            if not artifact_type or 'content' not in payload:
                raise ValueError("artifact_type and content required")
            
            allowed_phase_names = {'discovery', 'mapping', 'interpretation', 'synthesis'}
            is_phase_artifact = (
                isinstance(artifact_type, str)
                and artifact_type.startswith('phase:')
                and artifact_type.split(':', 1)[1] in allowed_phase_names
            )
            allowed_artifact_types = {'progress_snapshot', 'interpretation_note', 'notes'}
            if artifact_type not in allowed_artifact_types and not is_phase_artifact:
                raise ValueError(f"Invalid artifact_type: {artifact_type}")

            # Versionado simple: última versión (upsert por artifact_type).
            existing = WorkspaceArtifact.objects.filter(
                workspace_instance=session.workspace_instance,
                artifact_type=artifact_type,
                is_sealed=False,
            ).order_by('-created_at').first()

            if existing:
                existing.session = session
                existing.content = content
                metadata = dict(existing.metadata or {})
                metadata['updated_at'] = timezone.now().isoformat()
                existing.metadata = {**metadata, **(payload.get('metadata', {}) or {})}
                existing.save()
                artifact = existing
            else:
                artifact = WorkspaceArtifact.objects.create(
                    workspace_instance=session.workspace_instance,
                    session=session,
                    artifact_type=artifact_type,
                    content=content,
                    created_by=user,
                    metadata=payload.get('metadata', {})
                )
            
            artifact_id = artifact.id
            
            session.interactions_count += 1
            
            AuditService.log_action(
                workspace_instance=session.workspace_instance,
                session=session,
                user=user,
                action='artifact_generated',
                details={'artifact_id': str(artifact_id), 'artifact_type': artifact_type},
                request_context=request_context
            )
        
        else:
            raise ValueError(f"Unknown action: {action}")
        
        session.save()
        
        return {
            'session_id': session.id,
            'current_phase': session.current_phase,
            'session_state': session.session_state,
            'interactions_count': session.interactions_count,
            'artifact_created': artifact_id
        }
    
    @staticmethod
    @transaction.atomic
    def end_session(
        session: WorkspaceSession,
        user: User,
        request_context: Optional[Dict] = None
    ) -> WorkspaceSession:
        """End active session."""
        if not session.is_active:
            raise ValueError(f"Session {session.id} is already ended")
        
        session.is_active = False
        session.ended_at = timezone.now()
        session.save()
        
        AuditService.log_action(
            workspace_instance=session.workspace_instance,
            session=session,
            user=user,
            action='session_ended',
            details={
                'session_id': str(session.id),
                'duration_seconds': (session.ended_at - session.started_at).total_seconds(),
                'interactions_count': session.interactions_count
            },
            request_context=request_context
        )
        
        return session
