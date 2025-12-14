"""
Motor de Síntesis Cruzada
Consume TestResult y CabalisticAnalysis para generar síntesis integrada
"""
from typing import List, Dict, Any
from datetime import datetime
from django.contrib.auth.models import User
from ..models import Patient, CabalisticAnalysis
from ..test_models import TestResult
from .schemas import (
    SynthesisResult,
    NormalizedSource,
    ClinicalSignal,
    SymbolicSignal,
    Conflict,
    Strength,
    Recommendation
)


class SynthesisEngine:
    """
    Motor de síntesis cruzada que integra datos clínicos y cabalísticos
    """
    
    def __init__(self, patient: Patient, therapist: User):
        self.patient = patient
        self.therapist = therapist
        self.sources: List[NormalizedSource] = []
    
    def _load_clinical_sources(self) -> List[ClinicalSignal]:
        """Carga y normaliza TestResults del paciente"""
        test_results = TestResult.objects.filter(
            patient=self.patient
        ).order_by('-created_at')
        
        clinical_signals = []
        for tr in test_results:
            signal = ClinicalSignal(
                test_id=tr.test_id or tr.test_module.code if tr.test_module else 'unknown',
                test_name=tr.test_module.name if tr.test_module else tr.test_id or 'Test',
                score=tr.score,
                severity=self._determine_severity(tr),
                clinical_diagnosis=tr.clinical_diagnosis or 'No especificado',
                sefira=tr.kabbalah_sefira or None,
                date=tr.created_at,
                source_id=tr.id
            )
            clinical_signals.append(signal)
        
        return clinical_signals
    
    def _load_symbolic_sources(self) -> List[SymbolicSignal]:
        """Carga y normaliza CabalisticAnalysis del paciente"""
        analyses = CabalisticAnalysis.objects.filter(
            patient=self.patient
        ).order_by('-created_at')
        
        symbolic_signals = []
        for analysis in analyses:
            signal = SymbolicSignal(
                analysis_type=analysis.analysis_type,
                key_data=self._extract_key_data(analysis),
                date=analysis.created_at,
                source_id=analysis.id
            )
            symbolic_signals.append(signal)
        
        return symbolic_signals
    
    def _determine_severity(self, test_result: TestResult) -> str:
        """Determina severidad basada en score o diagnosis"""
        if test_result.clinical_severity:
            return test_result.clinical_severity
        
        if test_result.score is not None:
            # Lógica básica de severidad basada en score
            if test_result.score >= 20:
                return "Severa"
            elif test_result.score >= 10:
                return "Moderada"
            else:
                return "Leve"
        
        return "No especificada"
    
    def _extract_key_data(self, analysis: CabalisticAnalysis) -> Dict[str, Any]:
        """Extrae datos clave del análisis cabalístico según su tipo"""
        result_data = analysis.result_data or {}
        
        if analysis.analysis_type == 'tarot':
            return {
                'arcana': result_data.get('arcana'),
                'archetype': result_data.get('archetype'),
                'shadow_analysis': result_data.get('analisis_sombra'),
            }
        elif analysis.analysis_type == 'astrology-kerykeion':
            return {
                'sun_sign': result_data.get('sun_sign'),
                'moon_sign': result_data.get('moon_sign'),
                'ascendant': result_data.get('ascendant'),
            }
        elif analysis.analysis_type == 'gematria':
            return {
                'values': result_data.get('values'),
                'resonances': result_data.get('resonances'),
            }
        else:
            return result_data
    
    def _normalize_sources(self):
        """Normaliza todas las fuentes (clínicas y simbólicas)"""
        clinical_signals = self._load_clinical_sources()
        symbolic_signals = self._load_symbolic_sources()
        
        # Convertir señales clínicas a NormalizedSource
        for signal in clinical_signals:
            normalized = NormalizedSource(
                type='clinical',
                signal=signal,
                weight=1.0,
                priority=1
            )
            self.sources.append(normalized)
        
        # Convertir señales simbólicas a NormalizedSource
        for signal in symbolic_signals:
            normalized = NormalizedSource(
                type='symbolic',
                signal=signal,
                weight=0.8,  # Peso ligeramente menor que clínico
                priority=2
            )
            self.sources.append(normalized)
    
    def _detect_conflicts(self) -> List[Conflict]:
        """Detecta conflictos entre señales"""
        conflicts = []
        
        # Detectar conflictos de severidad
        clinical_severities = [
            s.signal.severity for s in self.sources 
            if s.type == 'clinical'
        ]
        
        if len(set(clinical_severities)) > 1:
            conflicts.append(Conflict(
                type='severity_mismatch',
                description='Inconsistencias en severidad entre tests clínicos',
                sources=[s.signal.source_id for s in self.sources if s.type == 'clinical'],
                severity='medium'
            ))
        
        return conflicts
    
    def _detect_strengths(self) -> List[Strength]:
        """Detecta fortalezas (coherencias) entre señales"""
        strengths = []
        
        # Detectar coherencia en sefirot
        sefirot = [
            s.signal.sefira for s in self.sources 
            if s.type == 'clinical' and s.signal.sefira
        ]
        
        if len(set(sefirot)) == 1 and len(sefirot) > 0:
            strengths.append(Strength(
                type='aligned_sefirot',
                description=f'Coherencia en Sefirá: {sefirot[0]}',
                sources=[s.signal.source_id for s in self.sources if s.type == 'clinical'],
                confidence=0.8
            ))
        
        return strengths
    
    def _generate_recommendations(self) -> List[Recommendation]:
        """Genera recomendaciones terapéuticas"""
        recommendations = []
        
        # Recomendación basada en severidad
        clinical_sources = [s for s in self.sources if s.type == 'clinical']
        if clinical_sources:
            max_severity = max(
                [s.signal.severity for s in clinical_sources],
                key=lambda x: ['Leve', 'Moderada', 'Severa'].index(x) if x in ['Leve', 'Moderada', 'Severa'] else 0
            )
            
            if max_severity == 'Severa':
                recommendations.append(Recommendation(
                    category='immediate',
                    priority='high',
                    action='Evaluación clínica urgente recomendada',
                    rationale='Severidad alta detectada en tests clínicos',
                    related_sources=[s.signal.source_id for s in clinical_sources]
                ))
        
        return recommendations
    
    def _generate_narrative(self, conflicts: List[Conflict], strengths: List[Strength]) -> str:
        """Genera narrativa para el terapeuta"""
        narrative_parts = []
        
        narrative_parts.append(f"Análisis de síntesis cruzada para {self.patient.full_name}.")
        
        if strengths:
            narrative_parts.append(f"Se detectaron {len(strengths)} fortaleza(s) en la coherencia de los datos.")
        
        if conflicts:
            narrative_parts.append(f"Se identificaron {len(conflicts)} conflicto(s) que requieren atención.")
        
        clinical_count = len([s for s in self.sources if s.type == 'clinical'])
        symbolic_count = len([s for s in self.sources if s.type == 'symbolic'])
        
        narrative_parts.append(
            f"Integración de {clinical_count} fuente(s) clínica(s) y {symbolic_count} fuente(s) simbólica(s)."
        )
        
        return " ".join(narrative_parts)
    
    def generate_synthesis(self) -> SynthesisResult:
        """
        Genera síntesis cruzada completa
        """
        # Validar que hay fuentes disponibles
        self._normalize_sources()
        
        if not self.sources:
            raise ValueError("No hay fuentes disponibles para generar síntesis. Se requieren TestResults o CabalisticAnalysis.")
        
        # Detectar conflictos y fortalezas
        conflicts = self._detect_conflicts()
        strengths = self._detect_strengths()
        
        # Generar recomendaciones
        recommendations = self._generate_recommendations()
        
        # Generar narrativa
        narrative = self._generate_narrative(conflicts, strengths)
        
        # Construir señales principales
        signals = {
            'clinical_count': len([s for s in self.sources if s.type == 'clinical']),
            'symbolic_count': len([s for s in self.sources if s.type == 'symbolic']),
            'total_sources': len(self.sources)
        }
        
        # Construir evidencia
        evidence = {
            'sources_used': len(self.sources),
            'conflicts_detected': len(conflicts),
            'strengths_detected': len(strengths)
        }
        
        # Trazabilidad de fuentes
        source_trace = [
            {
                'type': s.type,
                'source_id': s.signal.source_id,
                'date': s.signal.date.isoformat() if hasattr(s.signal, 'date') else None
            }
            for s in self.sources
        ]
        
        return SynthesisResult(
            generated_at=datetime.now(),
            patient_id=self.patient.id,
            therapist_id=self.therapist.id,
            sources=self.sources,
            signals=signals,
            conflicts=conflicts,
            strengths=strengths,
            recommendations=recommendations,
            narrative=narrative,
            evidence=evidence,
            source_trace=source_trace
        )
