"""
Session Service for SWM Tarot Evolutivo.

Handles session lifecycle: starting, tracking progress,
and ending sessions within workspace instances.
"""

from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from django.db import transaction
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError, PermissionDenied
from django.utils import timezone

from swm.tarot.models import (
    WorkspaceInstance,
    WorkspaceSession,
    WorkspaceStatus,
    SessionPhase,
    PermissionLevel,
)
from swm.tarot.services.audit_service import AuditService
from swm.tarot.services.workspace_service import WorkspaceService

User = get_user_model()


class SessionService:
    """Service for managing workspace sessions."""
    
    @staticmethod
    @transaction.atomic
    def start_session(
        instance: WorkspaceInstance,
        user: User,
        ip_address: Optional[str] = None,
        user_agent: str = ''
    ) -> WorkspaceSession:
        """
        Start a new session for a workspace.
        
        Args:
            instance: The workspace instance
            user: User starting the session
            ip_address: Client IP address
            user_agent: Client user agent string
            
        Returns:
            The created WorkspaceSession
            
        Raises:
            ValidationError: If session cannot be started
            PermissionDenied: If user lacks permission
        """
        # Check permission
        if not WorkspaceService.check_permission(
            instance, user, PermissionLevel.EXECUTOR
        ):
            raise PermissionDenied("Only executor can start sessions")
        
        # Check workspace status
        if instance.status not in [
            WorkspaceStatus.CREATED,
            WorkspaceStatus.IN_PROGRESS
        ]:
            raise ValidationError(
                f"Cannot start session: workspace status is '{instance.status}'"
            )
        
        # End any existing active sessions
        instance.sessions.filter(is_active=True).update(
            is_active=False,
            ended_at=timezone.now()
        )
        
        # Transition to in_progress if needed
        if instance.status == WorkspaceStatus.CREATED:
            WorkspaceService.transition_status(
                instance=instance,
                new_status=WorkspaceStatus.IN_PROGRESS,
                user=user,
                ip_address=ip_address,
                user_agent=user_agent
            )
        
        # Create new session
        session = WorkspaceSession.objects.create(
            instance=instance,
            user=user,
            phase=SessionPhase.SETUP,
            is_active=True,
            ip_address=ip_address,
            user_agent=user_agent or ''
        )
        
        # Audit log
        AuditService.log_action(
            instance=instance,
            action=AuditService.ACTION_SESSION_STARTED,
            user=user,
            details={
                'session_id': str(session.id),
                'phase': session.phase
            },
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return session
    
    @staticmethod
    def get_active_session(instance: WorkspaceInstance) -> Optional[WorkspaceSession]:
        """
        Get the active session for a workspace, if any.
        
        Args:
            instance: The workspace instance
            
        Returns:
            Active WorkspaceSession or None
        """
        return instance.sessions.filter(is_active=True).first()
    
    @staticmethod
    @transaction.atomic
    def update_phase(
        session: WorkspaceSession,
        new_phase: str,
        user: User
    ) -> WorkspaceSession:
        """
        Update the session phase.
        
        Args:
            session: The workspace session
            new_phase: Target phase
            user: User making the update
            
        Returns:
            Updated WorkspaceSession
        """
        # Validate phase
        valid_phases = [choice[0] for choice in SessionPhase.choices]
        if new_phase not in valid_phases:
            raise ValidationError(f"Invalid phase: {new_phase}")
        
        # Check permission
        if not WorkspaceService.check_permission(
            session.instance, user, PermissionLevel.EXECUTOR
        ):
            raise PermissionDenied("Only executor can update session phase")
        
        session.phase = new_phase
        session.save()
        
        return session
    
    @staticmethod
    @transaction.atomic
    def record_progress(
        session: WorkspaceSession,
        progress_data: Dict[str, Any],
        user: User
    ) -> WorkspaceSession:
        """
        Record progress data in the session.
        
        Args:
            session: The workspace session
            progress_data: Data to merge into progress
            user: User recording progress
            
        Returns:
            Updated WorkspaceSession
        """
        if not session.is_active:
            raise ValidationError("Cannot record progress on inactive session")
        
        # Check permission
        if not WorkspaceService.check_permission(
            session.instance, user, PermissionLevel.EXECUTOR
        ):
            raise PermissionDenied("Only executor can record progress")
        
        # Merge progress data
        current = session.progress_data or {}
        current.update(progress_data)
        current['last_updated'] = datetime.now().isoformat()
        
        session.progress_data = current
        session.save()
        
        return session
    
    @staticmethod
    @transaction.atomic
    def end_session(
        session: WorkspaceSession,
        user: User,
        ip_address: Optional[str] = None,
        user_agent: str = ''
    ) -> WorkspaceSession:
        """
        End an active session.
        
        Args:
            session: The workspace session
            user: User ending the session
            ip_address: Client IP for audit
            user_agent: Client user agent for audit
            
        Returns:
            Updated WorkspaceSession
        """
        if not session.is_active:
            raise ValidationError("Session is already ended")
        
        # Check permission
        if not WorkspaceService.check_permission(
            session.instance, user, PermissionLevel.EXECUTOR
        ):
            raise PermissionDenied("Only executor can end sessions")
        
        session.is_active = False
        session.ended_at = timezone.now()
        session.save()
        
        # Audit log
        AuditService.log_action(
            instance=session.instance,
            action=AuditService.ACTION_SESSION_ENDED,
            user=user,
            details={
                'session_id': str(session.id),
                'final_phase': session.phase,
                'duration_minutes': (
                    (session.ended_at - session.started_at).total_seconds() / 60
                    if session.ended_at and session.started_at
                    else None
                )
            },
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return session
    
    @staticmethod
    def get_session_history(
        instance: WorkspaceInstance,
        limit: int = 10
    ) -> list:
        """
        Get session history for a workspace.
        
        Args:
            instance: The workspace instance
            limit: Maximum sessions to return
            
        Returns:
            List of WorkspaceSession objects
        """
        return list(
            instance.sessions.select_related('user')
            .order_by('-started_at')[:limit]
        )
