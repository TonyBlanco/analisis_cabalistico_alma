"""
Motor principal de síntesis cruzada
Orquesta normalización, reglas y generación de resultado final
"""
import logging
from typing import List, Dict, Any
from datetime import datetime
from django.contrib.auth.models import User
from ..models import Patient, CabalisticAnalysis
from ..test_models import TestResult
from .normalizers import (
    TestResultNormalizer, CabalisticAnalysisNormalizer, SourceWeightCalculator
)
from .rules import SynthesisRules
from .schemas import (
    NormalizedSource, SynthesisResult, ClinicalSignal, SymbolicSignal
)

logger = logging.getLogger(__name__)


class SynthesisEngine:
    """Motor de síntesis cruzada que integra TestResult y CabalisticAnalysis"""
    
    def __init__(self, patient: Patient, therapist: User):
        """
        Inicializa el motor de síntesis
        
        Args:
            patient: Paciente para el que se genera la síntesis
            therapist: Terapeuta que ejecuta la síntesis
        """
        self.patient = patient
        self.therapist = therapist
    
    def generate_synthesis(self) -> SynthesisResult:
        """
        Genera síntesis cruzada completa
        
        Returns:
            SynthesisResult con toda la síntesis
            
        Raises:
            ValueError: Si no hay suficientes fuentes para síntesis
        """
        # Paso 1: Recopilar fuentes
        test_results = self._collect_test_results()
        cabalistic_analyses = self._collect_cabalistic_analyses()
        
        if not test_results and not cabalistic_analyses:
            raise ValueError(
                "No se encontraron fuentes para síntesis. "
                "Se requiere al menos un TestResult o un CabalisticAnalysis."
            )
        
        # Paso 2: Normalizar fuentes
        normalized_sources = self._normalize_sources(test_results, cabalistic_analyses)
        
        if not normalized_sources:
            raise ValueError("No se pudieron normalizar las fuentes disponibles.")
        
        # Paso 3: Aplicar reglas de síntesis
        conflicts = SynthesisRules.detect_conflicts(normalized_sources)
        strengths = SynthesisRules.detect_strengths(normalized_sources)
        recommendations = SynthesisRules.generate_recommendations(
            normalized_sources, conflicts, strengths
        )
        
        # Paso 4: Generar señales principales
        signals = self._extract_main_signals(normalized_sources)
        
        # Paso 5: Generar narrativa
        narrative = self._generate_narrative(
            normalized_sources, conflicts, strengths, recommendations
        )
        
        # Paso 6: Construir trazabilidad
        evidence = self._build_evidence(normalized_sources, conflicts, strengths)
        source_trace = self._build_source_trace(normalized_sources)
        
        # Paso 7: Construir resultado final
        return SynthesisResult(
            generated_at=datetime.now(),
            patient_id=self.patient.id,
            therapist_id=self.therapist.id,
            sources=normalized_sources,
            signals=signals,
            conflicts=conflicts,
            strengths=strengths,
            recommendations=recommendations,
            narrative=narrative,
            evidence=evidence,
            source_trace=source_trace
        )
    
    def _collect_test_results(self) -> List[TestResult]:
        """Recopila TestResult del paciente"""
        results = TestResult.objects.filter(
            patient=self.patient
        ).order_by('-created_at')
        
        # Si no hay por paciente, buscar por usuario
        if not results.exists() and self.patient.user:
            results = TestResult.objects.filter(
                user=self.patient.user
            ).order_by('-created_at')
        
        return list(results)
    
    def _collect_cabalistic_analyses(self) -> List[CabalisticAnalysis]:
        """Recopila CabalisticAnalysis del paciente (excluyendo crossover)"""
        analyses = CabalisticAnalysis.objects.filter(
            patient=self.patient,
            therapist=self.therapist
        ).exclude(
            analysis_type='crossover'  # Excluir síntesis previas
        ).order_by('-created_at')
        
        return list(analyses)
    
    def _normalize_sources(
        self,
        test_results: List[TestResult],
        cabalistic_analyses: List[CabalisticAnalysis]
    ) -> List[NormalizedSource]:
        """Normaliza todas las fuentes a formato común"""
        normalized = []
        
        # Normalizar tests clínicos
        for test_result in test_results:
            try:
                clinical_signal = TestResultNormalizer.normalize(test_result)
                weight = SourceWeightCalculator.calculate_weight(
                    NormalizedSource(
                        type='clinical',
                        signal=clinical_signal,
                        weight=0.0,  # Se calculará
                        priority=0
                    )
                )
                priority = SourceWeightCalculator.calculate_priority(
                    NormalizedSource(
                        type='clinical',
                        signal=clinical_signal,
                        weight=0.0,
                        priority=0
                    )
                )
                
                normalized.append(NormalizedSource(
                    type='clinical',
                    signal=clinical_signal,
                    weight=weight,
                    priority=priority
                ))
            except Exception as e:
                logger.warning(f"Error normalizando TestResult {test_result.id}: {e}")
        
        # Normalizar análisis cabalísticos
        for analysis in cabalistic_analyses:
            try:
                symbolic_signal = CabalisticAnalysisNormalizer.normalize(analysis)
                weight = SourceWeightCalculator.calculate_weight(
                    NormalizedSource(
                        type='symbolic',
                        signal=symbolic_signal,
                        weight=0.0,
                        priority=0
                    )
                )
                priority = SourceWeightCalculator.calculate_priority(
                    NormalizedSource(
                        type='symbolic',
                        signal=symbolic_signal,
                        weight=0.0,
                        priority=0
                    )
                )
                
                normalized.append(NormalizedSource(
                    type='symbolic',
                    signal=symbolic_signal,
                    weight=weight,
                    priority=priority
                ))
            except Exception as e:
                logger.warning(f"Error normalizando CabalisticAnalysis {analysis.id}: {e}")
        
        # Ordenar por prioridad (mayor primero)
        normalized.sort(key=lambda s: s.priority, reverse=True)
        
        return normalized
    
    def _extract_main_signals(self, sources: List[NormalizedSource]) -> Dict[str, Any]:
        """Extrae señales principales de las fuentes normalizadas"""
        signals = {
            'primary_clinical': None,
            'primary_symbolic': None,
            'severity_summary': {},
            'sefirot_mentioned': [],
            'arcana_mentioned': []
        }
        
        # Señal clínica principal (mayor severidad)
        clinical_sources = [s for s in sources if s.type == 'clinical']
        if clinical_sources:
            primary_clinical = max(
                clinical_sources,
                key=lambda s: SynthesisRules._severity_rank(s.signal.severity) if isinstance(s.signal, ClinicalSignal) else 0
            )
            if isinstance(primary_clinical.signal, ClinicalSignal):
                signals['primary_clinical'] = {
                    'test_name': primary_clinical.signal.test_name,
                    'severity': primary_clinical.signal.severity,
                    'diagnosis': primary_clinical.signal.clinical_diagnosis,
                    'source_id': primary_clinical.signal.source_id
                }
        
        # Señal simbólica principal (mayor peso)
        symbolic_sources = [s for s in sources if s.type == 'symbolic']
        if symbolic_sources:
            primary_symbolic = max(symbolic_sources, key=lambda s: s.weight)
            if isinstance(primary_symbolic.signal, SymbolicSignal):
                signals['primary_symbolic'] = {
                    'analysis_type': primary_symbolic.signal.analysis_type,
                    'key_data': primary_symbolic.signal.key_data,
                    'source_id': primary_symbolic.signal.source_id
                }
        
        # Resumen de severidades
        severity_counts = {}
        for source in clinical_sources:
            if isinstance(source.signal, ClinicalSignal):
                severity = source.signal.severity
                severity_counts[severity] = severity_counts.get(severity, 0) + 1
        signals['severity_summary'] = severity_counts
        
        # Sefirot mencionadas
        sefirot_set = set()
        for source in sources:
            if isinstance(source.signal, ClinicalSignal) and source.signal.sefira:
                sefirot_set.add(source.signal.sefira)
            elif isinstance(source.signal, SymbolicSignal):
                if source.signal.analysis_type == 'astrology-kerykeion':
                    sefirot_mapping = source.signal.key_data.get('sefirot_mapping', {})
                    sefirot_set.update(sefirot_mapping.values())
        signals['sefirot_mentioned'] = list(sefirot_set)
        
        # Arcanos mencionados
        arcana_set = set()
        for source in sources:
            if isinstance(source.signal, SymbolicSignal) and source.signal.analysis_type == 'tarot':
                arcana_name = source.signal.key_data.get('arcana_name')
                if arcana_name:
                    arcana_set.add(arcana_name)
        signals['arcana_mentioned'] = list(arcana_set)
        
        # Domain signals de SCDF
        scdf_source = next(
            (s for s in sources 
             if isinstance(s.signal, ClinicalSignal) and s.signal.test_id == 'scdf'),
            None
        )
        if scdf_source and isinstance(scdf_source.signal, ClinicalSignal):
            scdf_diagnosis = scdf_source.signal.clinical_diagnosis
            if "Señales:" in scdf_diagnosis:
                signals_part = scdf_diagnosis.split("Señales:")[-1].strip()
                # Parsear domain signals
                domain_signals = {}
                for item in signals_part.split(", "):
                    if ":" in item:
                        domain, signal = item.split(":", 1)
                        domain_signals[domain.strip()] = signal.strip()
                signals['scdf_domain_signals'] = domain_signals
        
        return signals
    
    def _generate_narrative(
        self,
        sources: List[NormalizedSource],
        conflicts: List,
        strengths: List,
        recommendations: List
    ) -> str:
        """Genera narrativa terapéutica basada en síntesis"""
        narrative_parts = []
        
        # Introducción
        narrative_parts.append(
            f"Síntesis cruzada generada el {datetime.now().strftime('%d/%m/%Y %H:%M')} "
            f"para {self.patient.full_name or 'el paciente'}."
        )
        
        # Resumen de fuentes
        clinical_count = len([s for s in sources if s.type == 'clinical'])
        symbolic_count = len([s for s in sources if s.type == 'symbolic'])
        narrative_parts.append(
            f"Se analizaron {clinical_count} test(s) clínico(s) y {symbolic_count} análisis(es) cabalístico(s)."
        )
        
        # Señales principales
        if sources:
            primary_clinical = next(
                (s for s in sources if s.type == 'clinical'), None
            )
            if primary_clinical and isinstance(primary_clinical.signal, ClinicalSignal):
                narrative_parts.append(
                    f"Estado clínico principal: {primary_clinical.signal.clinical_diagnosis} "
                    f"({primary_clinical.signal.severity}) según {primary_clinical.signal.test_name}."
                )
            
            primary_symbolic = next(
                (s for s in sources if s.type == 'symbolic'), None
            )
            if primary_symbolic and isinstance(primary_symbolic.signal, SymbolicSignal):
                narrative_parts.append(
                    f"Análisis simbólico principal: {primary_symbolic.signal.analysis_type} "
                    f"con datos clave identificados."
                )
        
        # Conflictos
        if conflicts:
            high_conflicts = [c for c in conflicts if c.severity == 'high']
            if high_conflicts:
                narrative_parts.append(
                    f"Se detectaron {len(high_conflicts)} conflicto(s) de alta severidad que requieren atención."
                )
            narrative_parts.append(
                f"Total de conflictos detectados: {len(conflicts)}."
            )
        
        # Fortalezas
        if strengths:
            narrative_parts.append(
                f"Se identificaron {len(strengths)} fortaleza(s) y coherencia(s) entre las fuentes."
            )
        
        # Recomendaciones
        if recommendations:
            high_priority = [r for r in recommendations if r.priority == 'high']
            if high_priority:
                narrative_parts.append(
                    f"Se generaron {len(high_priority)} recomendación(es) de alta prioridad."
                )
            narrative_parts.append(
                f"Total de recomendaciones: {len(recommendations)}."
            )
        
        # Convergencias e inconsistencias con SCDF
        scdf_source = next(
            (s for s in sources 
             if s.type == 'clinical' and isinstance(s.signal, ClinicalSignal) and s.signal.test_id == 'scdf'),
            None
        )
        if scdf_source:
            # Buscar convergencias e inconsistencias relacionadas con SCDF
            scdf_conflicts = [c for c in conflicts if scdf_source.signal.source_id in c.sources and 'scdf' in c.type]
            scdf_strengths = [s for s in strengths if scdf_source.signal.source_id in s.sources and 'scdf' in s.type]
            
            if scdf_strengths:
                narrative_parts.append(
                    f"SCDF converge con {len(scdf_strengths)} fuente(s) clínica(s), reforzando evidencia."
                )
            if scdf_conflicts:
                narrative_parts.append(
                    f"SCDF muestra {len(scdf_conflicts)} inconsistencia(s) con otros tests que requieren revisión."
                )
        
        return " ".join(narrative_parts)
    
    def _build_evidence(
        self,
        sources: List[NormalizedSource],
        conflicts: List,
        strengths: List
    ) -> Dict[str, Any]:
        """Construye evidencia estructurada"""
        return {
            'total_sources': len(sources),
            'clinical_sources': len([s for s in sources if s.type == 'clinical']),
            'symbolic_sources': len([s for s in sources if s.type == 'symbolic']),
            'conflicts_count': len(conflicts),
            'strengths_count': len(strengths),
            'weighted_average': sum(s.weight for s in sources) / len(sources) if sources else 0.0
        }
    
    def _build_source_trace(self, sources: List[NormalizedSource]) -> List[Dict[str, Any]]:
        """Construye trazabilidad completa de fuentes"""
        trace = []
        for source in sources:
            if isinstance(source.signal, ClinicalSignal):
                trace.append({
                    'type': 'clinical',
                    'source_id': source.signal.source_id,
                    'test_name': source.signal.test_name,
                    'severity': source.signal.severity,
                    'weight': source.weight,
                    'priority': source.priority
                })
            elif isinstance(source.signal, SymbolicSignal):
                trace.append({
                    'type': 'symbolic',
                    'source_id': source.signal.source_id,
                    'analysis_type': source.signal.analysis_type,
                    'weight': source.weight,
                    'priority': source.priority
                })
        return trace

