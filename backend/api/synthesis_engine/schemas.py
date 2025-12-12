"""
Esquemas de datos para el motor de síntesis cruzada
Define estructuras normalizadas y resultado final
"""
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class ClinicalSignal:
    """Señal clínica normalizada desde TestResult"""
    test_id: str
    test_name: str
    score: Optional[int]
    severity: str  # "Leve", "Moderada", "Severa", etc.
    clinical_diagnosis: str
    sefira: Optional[str]  # Sefirá relacionada si existe
    date: datetime
    source_id: int  # ID del TestResult original


@dataclass
class SymbolicSignal:
    """Señal simbólica normalizada desde CabalisticAnalysis"""
    analysis_type: str  # "tarot", "astrology-kerykeion", "gematria", etc.
    key_data: Dict[str, Any]  # Datos clave extraídos según el tipo
    date: datetime
    source_id: int  # ID del CabalisticAnalysis original


@dataclass
class NormalizedSource:
    """Fuente normalizada (clínica o simbólica)"""
    type: str  # "clinical" o "symbolic"
    signal: Any  # ClinicalSignal o SymbolicSignal
    weight: float  # Peso para síntesis (0.0 - 1.0)
    priority: int  # Prioridad (mayor = más importante)


@dataclass
class Conflict:
    """Conflicto detectado entre señales"""
    type: str  # "severity_mismatch", "elemental_conflict", "sefira_tension"
    description: str
    sources: List[int]  # IDs de las fuentes en conflicto
    severity: str  # "low", "medium", "high"


@dataclass
class Strength:
    """Fortaleza detectada (coherencia entre señales)"""
    type: str  # "aligned_sefirot", "consistent_arcana", "harmonic_aspects"
    description: str
    sources: List[int]
    confidence: float  # 0.0 - 1.0


@dataclass
class Recommendation:
    """Recomendación terapéutica generada"""
    category: str  # "immediate", "therapeutic", "spiritual", "integration"
    priority: str  # "high", "medium", "low"
    action: str
    rationale: str
    related_sources: List[int]


@dataclass
class SynthesisResult:
    """Resultado completo de la síntesis cruzada"""
    # Metadatos
    generated_at: datetime
    patient_id: int
    therapist_id: int
    
    # Fuentes normalizadas
    sources: List[NormalizedSource]
    
    # Síntesis
    signals: Dict[str, Any]  # Señales principales detectadas
    conflicts: List[Conflict]
    strengths: List[Strength]
    recommendations: List[Recommendation]
    
    # Narrativa para terapeuta
    narrative: str
    
    # Trazabilidad
    evidence: Dict[str, Any]  # Evidencia de cada síntesis
    source_trace: List[Dict[str, Any]]  # Trazabilidad completa de fuentes
    
    # Para guardar en CabalisticAnalysis
    def to_result_data(self) -> Dict[str, Any]:
        """Convierte a formato result_data para CabalisticAnalysis"""
        return {
            "engine": "synthesis_cross",
            "generated_at": self.generated_at.isoformat(),
            "signals": self.signals,
            "conflicts": [
                {
                    "type": c.type,
                    "description": c.description,
                    "sources": c.sources,
                    "severity": c.severity
                }
                for c in self.conflicts
            ],
            "strengths": [
                {
                    "type": s.type,
                    "description": s.description,
                    "sources": s.sources,
                    "confidence": s.confidence
                }
                for s in self.strengths
            ],
            "recommendations": [
                {
                    "category": r.category,
                    "priority": r.priority,
                    "action": r.action,
                    "rationale": r.rationale,
                    "related_sources": r.related_sources
                }
                for r in self.recommendations
            ],
            "narrative": self.narrative,
            "evidence": self.evidence,
            "source_trace": self.source_trace
        }

