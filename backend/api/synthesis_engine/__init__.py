"""
Motor de Síntesis Cruzada
Consume TestResult y CabalisticAnalysis para generar síntesis integrada
"""

from .engine import SynthesisEngine
from .schemas import SynthesisResult, NormalizedSource

__all__ = ['SynthesisEngine', 'SynthesisResult', 'NormalizedSource']

