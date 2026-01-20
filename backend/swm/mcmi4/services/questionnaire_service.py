"""
QuestionnaireService - Motor del Cuestionario de los 4 Mundos Cabalísticos

Servicio dedicado a la lógica del cuestionario simbólico MCMI-4 Místico.
NO depende de TestModule, Assignment, Patient ni ExecuteTestView.
Opera únicamente sobre WorkspaceInstance, WorkspaceSession y WorkspaceArtifact.

Responsabilidades:
- Cargar y validar datos de los 4 Mundos desde JSON
- Seleccionar 195 preguntas únicas con anti-repetición
- Crear y gestionar artifacts: questionnaire_config, questionnaire_progress, questionnaire_completion
- Gestionar flujo de respuestas y progreso
- Finalizar cuestionario y sellar workspace
"""

import json
import hashlib
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
from django.conf import settings
from django.db import transaction
from django.core.exceptions import ValidationError

from ..models import WorkspaceInstance, WorkspaceSession, WorkspaceArtifact, WorkspaceAuditLog
from .audit_service import AuditService


class QuestionnaireService:
    """
    Servicio para el cuestionario simbólico de los 4 Mundos.
    Todos los métodos son estáticos - no mantiene estado.
    """
    
    # Constantes de configuración
    WORLDS_ORDER = ["atzilut", "briah", "yetzirah", "assiah"]
    QUESTIONS_PER_WORLD = {
        "atzilut": 49,
        "briah": 49,
        "yetzirah": 49,
        "assiah": 48
    }
    TOTAL_QUESTIONS = 195
    
    DATA_DIR = Path(settings.BASE_DIR) / "data"
    
    @staticmethod
    def load_worlds_data() -> Dict[str, Any]:
        """
        Carga los 4 archivos JSON de los Mundos Cabalísticos desde backend/data/
        
        Returns:
            Dict indexado por nombre de mundo con estructura completa:
            {
                "atzilut": {...metadata, dimensions: {...}},
                "briah": {...},
                "yetzirah": {...},
                "assiah": {...}
            }
        
        Raises:
            FileNotFoundError: Si falta algún archivo JSON
            ValidationError: Si la estructura o totales no son válidos
        """
        worlds_data = {}
        total_questions_loaded = 0
        
        for world_name in QuestionnaireService.WORLDS_ORDER:
            file_path = QuestionnaireService.DATA_DIR / f"mcmi4_mystic_questions_{world_name}.json"
            
            if not file_path.exists():
                raise FileNotFoundError(
                    f"Missing world data file: {file_path}. "
                    f"Expected 4 files: mcmi4_mystic_questions_{{atzilut,briah,yetzirah,assiah}}.json"
                )
            
            with open(file_path, 'r', encoding='utf-8') as f:
                world_data = json.load(f)
            
            # Validar estructura básica
            if "metadata" not in world_data or "dimensions" not in world_data:
                raise ValidationError(
                    f"Invalid structure in {file_path}: missing 'metadata' or 'dimensions'"
                )
            
            # Contar preguntas requeridas del mundo (usar items_required si está disponible)
            questions_count = 0
            for dimension_data in world_data["dimensions"].values():
                if "items_required" in dimension_data:
                    questions_count += int(dimension_data.get("items_required", 0))
                elif "questions" in dimension_data:
                    questions_count += len(dimension_data["questions"])
            
            expected_count = QuestionnaireService.QUESTIONS_PER_WORLD[world_name]
            if questions_count != expected_count:
                raise ValidationError(
                    f"World '{world_name}' has {questions_count} questions, expected {expected_count}"
                )
            
            worlds_data[world_name] = world_data
            total_questions_loaded += questions_count
        
        # Validar total global
        if total_questions_loaded != QuestionnaireService.TOTAL_QUESTIONS:
            raise ValidationError(
                f"Total questions loaded: {total_questions_loaded}, expected {QuestionnaireService.TOTAL_QUESTIONS}"
            )
        
        return worlds_data
    
    @staticmethod
    def select_questions(subject_user_id: int, id: str) -> Tuple[List[Dict], Dict]:
        """
        Selecciona 195 preguntas únicas evitando repetición con workspaces previos del subject_user.
        
        Args:
            subject_user_id: ID del usuario sujeto (paciente)
            id: UUID del workspace actual (para excluirlo del historial)
        
        Returns:
            Tuple con:
            - Lista de 195 preguntas seleccionadas (con id, text, world, dimension, sefirah)
            - Metadata de selección:
                {
                    "collision": bool,
                    "collision_count": int,
                    "questions_hash": str,
                    "selection_strategy": str
                }
        
        Raises:
            ValidationError: Si no se pueden cargar los datos
        """
        # Cargar datos de los 4 Mundos
        worlds_data = QuestionnaireService.load_worlds_data()
        
        # Obtener IDs de preguntas ya usadas en workspaces previos del subject
        previous_question_ids = set()
        collision_count = 0
        
        previous_workspaces = WorkspaceInstance.objects.filter(
            subject_user_id=subject_user_id,
            status__in=['sealed', 'reviewed']
        ).exclude(id=id)
        
        for workspace in previous_workspaces:
            completion_artifacts = WorkspaceArtifact.objects.filter(
                workspace_instance=workspace,
                artifact_type='questionnaire_completion'
            )
            
            for artifact in completion_artifacts:
                if 'responses' in artifact.content:
                    used_ids = set(artifact.content['responses'].keys())
                    previous_question_ids.update(used_ids)
                    collision_count += len(used_ids)
        
        # Seleccionar preguntas por mundo
        selected_questions = []
        all_question_ids = []
        
        for world_name in QuestionnaireService.WORLDS_ORDER:
            world_data = worlds_data[world_name]
            world_questions = []
            
            # Recolectar todas las preguntas del mundo con metadata completa
            for dimension_id, dimension_data in world_data["dimensions"].items():
                dimension_name = dimension_data.get("dimension", dimension_id)
                sefirah = dimension_data.get("sefirah", "")
                
                for question in dimension_data.get("questions", []):
                    question_with_metadata = {
                        "id": question["id"],
                        "text": question["text"],
                        "world": world_name,
                        "dimension": dimension_name,
                        "dimension_id": dimension_id,
                        "sefirah": sefirah,
                        "reverse_scored": question.get("reverse_scored", False),
                        "weight": question.get("weight", 1.0)
                    }
                    world_questions.append(question_with_metadata)
            
            # Estrategia de selección: priorizar no usadas, luego determinista
            expected_count = QuestionnaireService.QUESTIONS_PER_WORLD[world_name]
            
            # Separar preguntas no usadas vs usadas
            unused_questions = [q for q in world_questions if q["id"] not in previous_question_ids]
            used_questions = [q for q in world_questions if q["id"] in previous_question_ids]
            
            # Seleccionar: primero no usadas, luego usadas si es necesario
            if len(unused_questions) >= expected_count:
                # Hay suficientes preguntas no usadas - selección determinista
                world_selected = sorted(unused_questions, key=lambda q: q["id"])[:expected_count]
            else:
                # Usar todas las no usadas + completar con usadas
                world_selected = unused_questions + sorted(used_questions, key=lambda q: q["id"])[:expected_count - len(unused_questions)]
            
            selected_questions.extend(world_selected)
            all_question_ids.extend([q["id"] for q in world_selected])
        
        # Generar hash de la selección (para detección de duplicados)
        questions_hash = hashlib.sha256(
            json.dumps(sorted(all_question_ids), sort_keys=True).encode()
        ).hexdigest()[:16]
        
        # Metadata de selección
        metadata = {
            "collision": collision_count > 0,
            "collision_count": collision_count,
            "questions_hash": questions_hash,
            "selection_strategy": "anti_repetition_deterministic",
            "previous_workspaces_count": previous_workspaces.count()
        }
        
        return selected_questions, metadata
    
    @staticmethod
    @transaction.atomic
    def create_questionnaire_config(
        workspace_instance: WorkspaceInstance,
        selected_questions: List[Dict],
        metadata: Dict
    ) -> WorkspaceArtifact:
        """
        Crea el artifact questionnaire_config con las preguntas seleccionadas.
        
        Args:
            workspace_instance: Instancia del workspace
            selected_questions: Lista de 195 preguntas seleccionadas
            metadata: Metadata de selección (collision, hash, etc.)
        
        Returns:
            WorkspaceArtifact de tipo questionnaire_config
        
        Raises:
            ValidationError: Si el workspace no está en estado válido
        """
        if workspace_instance.status != 'created':
            raise ValidationError(
                f"Cannot create questionnaire_config for workspace in status '{workspace_instance.status}'. "
                f"Expected 'created'."
            )
        
        # Organizar preguntas por mundo para payload
        questions_by_world = {world: [] for world in QuestionnaireService.WORLDS_ORDER}
        for question in selected_questions:
            questions_by_world[question["world"]].append(question["id"])
        
        # Crear payload del artifact
        payload = {
            "total_questions": QuestionnaireService.TOTAL_QUESTIONS,
            "questions_per_world": QuestionnaireService.QUESTIONS_PER_WORLD,
            "selected_question_ids": [q["id"] for q in selected_questions],
            "questions_by_world": questions_by_world,
            "selection_metadata": metadata,
            "worlds_order": QuestionnaireService.WORLDS_ORDER,
            "sealed": False,
            "questions_full": selected_questions  # Incluir preguntas completas para fácil acceso
        }
        
        # Crear artifact
        config_artifact = WorkspaceArtifact.objects.create(
            workspace_instance=workspace_instance,
            artifact_type='questionnaire_config',
            content=payload,
            created_by=workspace_instance.creator_user,
            metadata={
                "questions_hash": metadata.get("questions_hash", ""),
                "collision": metadata.get("collision", False)
            }
        )
        
        # Auditar creación de configuración
        AuditService.log_action(
            workspace_instance=workspace_instance,
            user=workspace_instance.creator_user,
            action='questionnaire_config_created',
            details={
                "id": str(config_artifact.id),
                "total_questions": QuestionnaireService.TOTAL_QUESTIONS,
                "collision": metadata.get("collision", False)
            }
        )
        
        return config_artifact
    
    @staticmethod
    @transaction.atomic
    def initialize_progress(
        workspace_instance: WorkspaceInstance,
        session: WorkspaceSession
    ) -> WorkspaceArtifact:
        """
        Crea el artifact questionnaire_progress con estado inicial.
        
        Args:
            workspace_instance: Instancia del workspace
            session: Sesión activa asociada
        
        Returns:
            WorkspaceArtifact de tipo questionnaire_progress
        
        Raises:
            ValidationError: Si el workspace o sesión no están en estado válido
        """
        if workspace_instance.status not in ['created', 'in_progress']:
            raise ValidationError(
                f"Cannot initialize progress for workspace in status '{workspace_instance.status}'"
            )
        
        if session.status != 'active':
            raise ValidationError(
                f"Cannot initialize progress with session in status '{session.status}'. Expected 'active'."
            )
        
        # Crear payload inicial
        payload = {
            "current_world": QuestionnaireService.WORLDS_ORDER[0],  # "atzilut"
            "current_question_index": 0,
            "responses": {},  # question_id -> {value, timestamp, world, dimension}
            "completed_worlds": [],
            "progress_percentage": 0.0,
            "worlds_progress": {
                world: {"answered": 0, "total": count}
                for world, count in QuestionnaireService.QUESTIONS_PER_WORLD.items()
            }
        }
        
        # Crear artifact
        progress_artifact = WorkspaceArtifact.objects.create(
            workspace_instance=workspace_instance,
            artifact_type='questionnaire_progress',
            content=payload,
            created_by=session.executor_user,
            metadata={
                "id": str(session.id),
                "initialized_at": session.started_at.isoformat()
            }
        )
        
        # Auditar inicialización
        AuditService.log_action(
            workspace_instance=workspace_instance,
            user=session.executor_user,
            action='questionnaire_progress_initialized',
            details={
                "progress_artifact_id": str(progress_artifact.id),
                "session_id": str(session.id)
            },
            session=session
        )
        
        return progress_artifact
    
    @staticmethod
    @transaction.atomic
    def save_response(
        workspace_instance: WorkspaceInstance,
        session: WorkspaceSession,
        question_id: str,
        value: int,
        world: str
    ) -> Tuple[WorkspaceArtifact, Dict]:
        """
        Guarda una respuesta y actualiza el progreso del cuestionario.
        
        Args:
            workspace_instance: Instancia del workspace
            session: Sesión activa
            question_id: ID de la pregunta (ej: "atz_ktr_001")
            value: Valor de respuesta (1-5, escala Likert)
            world: Nombre del mundo actual ("atzilut", "briah", etc.)
        
        Returns:
            Tuple con:
            - WorkspaceArtifact actualizado (questionnaire_progress)
            - Dict con resumen de progreso:
                {
                    "progress_percentage": float,
                    "current_world": str,
                    "current_question_index": int,
                    "world_completed": bool,
                    "questionnaire_completed": bool
                }
        
        Raises:
            ValidationError: Si validaciones fallan
        """
        # Validar sesión activa
        if session.status != 'active':
            raise ValidationError(f"Session is not active (status: {session.status})")
        
        # Validar workspace en progreso
        if workspace_instance.status not in ['in_progress']:
            raise ValidationError(
                f"Cannot save response for workspace in status '{workspace_instance.status}'"
            )
        
        # Validar valor de respuesta
        if not isinstance(value, int) or value < 1 or value > 5:
            raise ValidationError(f"Response value must be integer between 1-5, got: {value}")
        
        # Validar mundo
        if world not in QuestionnaireService.WORLDS_ORDER:
            raise ValidationError(f"Invalid world: {world}. Must be one of {QuestionnaireService.WORLDS_ORDER}")
        
        # Obtener artifacts
        config_artifact = WorkspaceArtifact.objects.filter(
            workspace_instance=workspace_instance,
            artifact_type='questionnaire_config'
        ).first()
        
        if not config_artifact:
            raise ValidationError("questionnaire_config artifact not found")
        
        progress_artifact = WorkspaceArtifact.objects.filter(
            workspace_instance=workspace_instance,
            artifact_type='questionnaire_progress'
        ).first()
        
        if not progress_artifact:
            raise ValidationError("questionnaire_progress artifact not found")
        
        # Validar que question_id pertenece al workspace
        if question_id not in config_artifact.content.get("selected_question_ids", []):
            raise ValidationError(f"Question '{question_id}' does not belong to this workspace")
        
        # Obtener metadata completa de la pregunta
        question_metadata = None
        for q in config_artifact.content.get("questions_full", []):
            if q["id"] == question_id:
                question_metadata = q
                break
        
        if not question_metadata:
            raise ValidationError(f"Question metadata not found for '{question_id}'")
        
        # Actualizar payload de progreso
        payload = progress_artifact.content
        
        # Guardar respuesta con metadata
        from django.utils import timezone
        payload["responses"][question_id] = {
            "value": value,
            "timestamp": timezone.now().isoformat(),
            "world": question_metadata["world"],
            "dimension": question_metadata["dimension"],
            "sefirah": question_metadata.get("sefirah", "")
        }
        
        # Incrementar índice
        payload["current_question_index"] += 1
        
        # Actualizar progreso por mundo
        world_name = question_metadata["world"]
        if world_name in payload["worlds_progress"]:
            payload["worlds_progress"][world_name]["answered"] += 1
        
        # Calcular progreso global
        total_answered = len(payload["responses"])
        payload["progress_percentage"] = round((total_answered / QuestionnaireService.TOTAL_QUESTIONS) * 100, 2)
        
        # Verificar si el mundo actual se completó
        world_completed = False
        if world_name in payload["worlds_progress"]:
            world_progress = payload["worlds_progress"][world_name]
            if world_progress["answered"] >= world_progress["total"]:
                if world_name not in payload["completed_worlds"]:
                    payload["completed_worlds"].append(world_name)
                    world_completed = True
        
        # Verificar si el cuestionario completo terminó
        questionnaire_completed = total_answered >= QuestionnaireService.TOTAL_QUESTIONS
        
        # Guardar artifact actualizado
        progress_artifact.content = payload
        progress_artifact.save()
        
        # Resumen de progreso
        progress_summary = {
            "progress_percentage": payload["progress_percentage"],
            "current_world": payload["current_world"],
            "current_question_index": payload["current_question_index"],
            "world_completed": world_completed,
            "questionnaire_completed": questionnaire_completed,
            "total_answered": total_answered
        }
        
        return progress_artifact, progress_summary
    
    @staticmethod
    @transaction.atomic
    def finalize_questionnaire(
        workspace_instance: WorkspaceInstance,
        session: WorkspaceSession
    ) -> WorkspaceArtifact:
        """
        Finaliza el cuestionario creando artifact questionnaire_completion y sellando el workspace.
        
        Args:
            workspace_instance: Instancia del workspace
            session: Sesión activa
        
        Returns:
            WorkspaceArtifact de tipo questionnaire_completion
        
        Raises:
            ValidationError: Si el cuestionario no está completo o workspace no está en estado válido
        """
        # Validar estado del workspace
        if workspace_instance.status != 'in_progress':
            raise ValidationError(
                f"Cannot finalize questionnaire for workspace in status '{workspace_instance.status}'. "
                f"Expected 'in_progress'."
            )
        
        # Obtener artifacts
        config_artifact = WorkspaceArtifact.objects.filter(
            workspace_instance=workspace_instance,
            artifact_type='questionnaire_config'
        ).first()
        
        progress_artifact = WorkspaceArtifact.objects.filter(
            workspace_instance=workspace_instance,
            artifact_type='questionnaire_progress'
        ).first()
        
        if not config_artifact or not progress_artifact:
            raise ValidationError("Missing required artifacts (config or progress)")
        
        # Validar que las 195 preguntas fueron respondidas
        responses = progress_artifact.content.get("responses", {})
        if len(responses) < QuestionnaireService.TOTAL_QUESTIONS:
            raise ValidationError(
                f"Questionnaire incomplete: {len(responses)}/{QuestionnaireService.TOTAL_QUESTIONS} answered"
            )
        
        # Crear payload de completion con TODAS las respuestas + metadata
        completion_payload = {
            "total_questions": QuestionnaireService.TOTAL_QUESTIONS,
            "total_answered": len(responses),
            "responses": responses,  # Copiar todas las respuestas con metadata
            "worlds_progress": progress_artifact.content.get("worlds_progress", {}),
            "completed_worlds": progress_artifact.content.get("completed_worlds", []),
            "questions_hash": config_artifact.content.get("selection_metadata", {}).get("questions_hash", ""),
            "finalized_at": session.ended_at.isoformat() if session.ended_at else None
        }
        
        # Crear artifact de completion
        completion_artifact = WorkspaceArtifact.objects.create(
            workspace_instance=workspace_instance,
            artifact_type='questionnaire_completion',
            content=completion_payload,
            created_by=session.executor_user,
            metadata={
                "id": str(session.id),
                "completed_worlds_count": len(progress_artifact.content.get("completed_worlds", []))
            }
        )
        
        # Marcar artifacts como sellados
        config_artifact.content["sealed"] = True
        config_artifact.save()
        
        progress_artifact.content["sealed"] = True
        progress_artifact.save()
        
        # Cambiar estado del workspace a 'sealed'
        workspace_instance.status = 'sealed'
        workspace_instance.save()
        
        # Auditar sellado
        AuditService.log_action(
            workspace_instance=workspace_instance,
            user=session.executor_user,
            action='workspace_sealed',
            details={
                "completion_artifact_id": str(completion_artifact.id),
                "total_answered": len(responses),
                "session_id": str(session.id)
            },
            session=session
        )
        
        return completion_artifact
    
    @staticmethod
    def get_next_question(
        config_artifact: WorkspaceArtifact,
        progress_artifact: WorkspaceArtifact
    ) -> Optional[Dict]:
        """
        Retorna la siguiente pregunta según el índice actual de progreso.
        
        Args:
            config_artifact: Artifact questionnaire_config con preguntas completas
            progress_artifact: Artifact questionnaire_progress con estado actual
        
        Returns:
            Dict con datos de la siguiente pregunta o None si el cuestionario terminó:
            {
                "id": str,
                "text": str,
                "world": str,
                "dimension": str,
                "sefirah": str,
                "index": int,
                "total": int
            }
        
        Raises:
            ValidationError: Si artifacts no son válidos
        """
        if config_artifact.artifact_type != 'questionnaire_config':
            raise ValidationError("First artifact must be questionnaire_config")
        
        if progress_artifact.artifact_type != 'questionnaire_progress':
            raise ValidationError("Second artifact must be questionnaire_progress")
        
        # Obtener índice actual
        current_index = progress_artifact.content.get("current_question_index", 0)
        
        # Obtener lista de preguntas completas
        questions_full = config_artifact.content.get("questions_full", [])
        
        if not questions_full:
            raise ValidationError("No questions found in config artifact")
        
        # Verificar si el cuestionario terminó
        if current_index >= len(questions_full):
            return None
        
        # Retornar siguiente pregunta
        next_question = questions_full[current_index]
        
        return {
            "id": next_question["id"],
            "text": next_question["text"],
            "world": next_question["world"],
            "dimension": next_question["dimension"],
            "dimension_id": next_question.get("dimension_id", ""),
            "sefirah": next_question.get("sefirah", ""),
            "reverse_scored": next_question.get("reverse_scored", False),
            "weight": next_question.get("weight", 1.0),
            "index": current_index,
            "total": len(questions_full)
        }



