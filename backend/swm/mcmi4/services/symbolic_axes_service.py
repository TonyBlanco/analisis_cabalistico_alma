"""
Symbolic Axes Service - Transforms TestResult signal into symbolic axes.

Computes 5 symbolic dimensions from mcmi4-signal responses without clinical scoring.
All computations are symbolic/interpretative, not diagnostic.
"""

from typing import Dict, List, Any, Optional
from django.db import transaction
from api.test_models import TestResult
from swm.mcmi4.models import WorkspaceInstance, WorkspaceArtifact
import statistics


class SymbolicAxis:
    """Represents one symbolic dimension derived from signal."""
    
    def __init__(self, name: str, description: str, value: float, level: str):
        self.name = name
        self.description = description
        self.value = value  # 0.0 to 1.0
        self.level = level  # "bajo" | "medio" | "alto"
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "value": self.value,
            "level": self.level,
        }


class SymbolicAxesService:
    """Service for computing symbolic axes from TestResult."""
    
    @staticmethod
    def compute_axes_from_test_result(test_result: TestResult) -> List[SymbolicAxis]:
        """
        Compute symbolic axes from TestResult.
        
        Args:
            test_result: TestResult instance with test_module.code='mcmi4-signal'
        
        Returns:
            List of 5 SymbolicAxis instances
        
        Raises:
            ValueError if test_result is invalid or not mcmi4-signal
        """
        if not test_result:
            raise ValueError("TestResult is required")
        
        # Validate test module code
        test_module = getattr(test_result, 'test_module', None)
        if not test_module or getattr(test_module, 'code', None) != 'mcmi4-signal':
            raise ValueError(f"TestResult must be mcmi4-signal, got: {getattr(test_module, 'code', 'unknown')}")
        
        # Extract responses from input_data
        input_data = test_result.input_data or {}
        responses = input_data.get('responses', {})
        
        if not responses or not isinstance(responses, dict):
            raise ValueError("TestResult has no valid responses")
        
        # Convert responses to numeric values (skip non-numeric)
        values = []
        for v in responses.values():
            try:
                numeric = float(v)
                if 1 <= numeric <= 5:  # Valid Likert 1-5
                    values.append(numeric)
            except (ValueError, TypeError):
                continue
        
        if not values:
            raise ValueError("No valid numeric responses found")
        
        # Compute symbolic axes
        return [
            SymbolicAxesService._compute_intensity(values),
            SymbolicAxesService._compute_variability(values),
            SymbolicAxesService._compute_self_regulation(values),
            SymbolicAxesService._compute_contextual_sensitivity(values),
            SymbolicAxesService._compute_integration(values),
        ]
    
    @staticmethod
    def _compute_intensity(values: List[float]) -> SymbolicAxis:
        """
        Intensidad: Average response magnitude.
        High values suggest strong engagement with items.
        """
        mean_val = statistics.mean(values)
        normalized = (mean_val - 1) / 4  # Scale from [1,5] to [0,1]
        
        if normalized < 0.33:
            level = "bajo"
        elif normalized < 0.67:
            level = "medio"
        else:
            level = "alto"
        
        return SymbolicAxis(
            name="Intensidad",
            description="Magnitud promedio de respuesta a la señal. Sugiere nivel de activación emocional/simbólica.",
            value=round(normalized, 3),
            level=level,
        )
    
    @staticmethod
    def _compute_variability(values: List[float]) -> SymbolicAxis:
        """
        Variabilidad: Standard deviation of responses.
        High variability suggests diverse symbolic landscape.
        """
        if len(values) < 2:
            stdev = 0.0
        else:
            stdev = statistics.stdev(values)
        
        # Normalize stdev (max possible stdev for [1,5] is ~1.63 for extreme variance)
        normalized = min(stdev / 1.63, 1.0)
        
        if normalized < 0.33:
            level = "bajo"
        elif normalized < 0.67:
            level = "medio"
        else:
            level = "alto"
        
        return SymbolicAxis(
            name="Variabilidad",
            description="Dispersión de respuestas. Alta variabilidad indica paisaje simbólico diverso o fluctuante.",
            value=round(normalized, 3),
            level=level,
        )
    
    @staticmethod
    def _compute_self_regulation(values: List[float]) -> SymbolicAxis:
        """
        Autorregulación: Presence of mid-range responses (2,3,4).
        High mid-range suggests nuanced self-regulation vs. extremes (1,5).
        """
        mid_range_count = sum(1 for v in values if 2 <= v <= 4)
        ratio = mid_range_count / len(values)
        
        if ratio < 0.33:
            level = "bajo"
        elif ratio < 0.67:
            level = "medio"
        else:
            level = "alto"
        
        return SymbolicAxis(
            name="Autorregulación",
            description="Proporción de respuestas matizadas (vs. extremas). Alta ratio sugiere capacidad reguladora.",
            value=round(ratio, 3),
            level=level,
        )
    
    @staticmethod
    def _compute_contextual_sensitivity(values: List[float]) -> SymbolicAxis:
        """
        Sensibilidad contextual: Transitions between consecutive responses.
        High transitions suggest context-responsive engagement.
        """
        if len(values) < 2:
            transitions = 0
        else:
            transitions = sum(1 for i in range(len(values) - 1) if abs(values[i] - values[i + 1]) >= 2)
        
        ratio = transitions / max(len(values) - 1, 1)
        
        if ratio < 0.2:
            level = "bajo"
        elif ratio < 0.5:
            level = "medio"
        else:
            level = "alto"
        
        return SymbolicAxis(
            name="Sensibilidad contextual",
            description="Frecuencia de cambios significativos entre ítems. Alta sensibilidad indica respuesta contextual.",
            value=round(ratio, 3),
            level=level,
        )
    
    @staticmethod
    def _compute_integration(values: List[float]) -> SymbolicAxis:
        """
        Integración: Coefficient of variation (stdev/mean).
        Lower CV suggests consistent internal pattern (integrated).
        """
        mean_val = statistics.mean(values)
        if mean_val == 0:
            cv = 0.0
        else:
            stdev = statistics.stdev(values) if len(values) > 1 else 0.0
            cv = stdev / mean_val
        
        # Invert: high integration = low CV
        # Max CV for [1,5] is ~1.0, normalize and invert
        normalized = max(0, 1 - min(cv, 1.0))
        
        if normalized < 0.33:
            level = "bajo"
        elif normalized < 0.67:
            level = "medio"
        else:
            level = "alto"
        
        return SymbolicAxis(
            name="Integración",
            description="Consistencia del patrón interno. Alta integración sugiere coherencia simbólica.",
            value=round(normalized, 3),
            level=level,
        )
    
    @staticmethod
    @transaction.atomic
    def compute_and_store_axes(
        workspace: WorkspaceInstance,
        test_result: TestResult,
        user
    ) -> WorkspaceArtifact:
        """
        Compute symbolic axes and store as workspace artifact.
        
        Args:
            workspace: WorkspaceInstance to store artifact in
            test_result: TestResult (mcmi4-signal) to compute from
            user: User performing the computation
        
        Returns:
            Created WorkspaceArtifact with type='symbolic_axes'
        """
        axes = SymbolicAxesService.compute_axes_from_test_result(test_result)
        
        # Check if artifact already exists
        existing = WorkspaceArtifact.objects.filter(
            workspace_instance=workspace,
            artifact_type='symbolic_axes'
        ).first()
        
        if existing and not existing.is_sealed:
            # Update existing
            existing.content = {
                "axes": [axis.to_dict() for axis in axes],
                "source_test_result_id": str(test_result.id),
                "source_test_module": "mcmi4-signal",
                "computed_at": str(test_result.created_at) if test_result.created_at else None,
            }
            existing.metadata = {
                "items_count": len(test_result.input_data.get('responses', {})),
                "recomputed": True,
            }
            existing.save()
            return existing
        elif existing and existing.is_sealed:
            # Cannot modify sealed artifact
            raise ValueError("Symbolic axes artifact is sealed and cannot be recomputed")
        else:
            # Create new artifact
            artifact = WorkspaceArtifact.objects.create(
                workspace_instance=workspace,
                artifact_type='symbolic_axes',
                content={
                    "axes": [axis.to_dict() for axis in axes],
                    "source_test_result_id": str(test_result.id),
                    "source_test_module": "mcmi4-signal",
                    "computed_at": str(test_result.created_at) if test_result.created_at else None,
                },
                created_by=user,
                metadata={
                    "items_count": len(test_result.input_data.get('responses', {})),
                },
            )
            return artifact
