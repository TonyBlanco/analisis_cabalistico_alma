"""
Reglas deterministas de síntesis cruzada
Detecta conflictos, fortalezas y genera recomendaciones
"""
from typing import List, Dict, Any
from .schemas import (
    NormalizedSource, ClinicalSignal, SymbolicSignal,
    Conflict, Strength, Recommendation
)


class SynthesisRules:
    """Reglas deterministas para síntesis cruzada"""
    
    @staticmethod
    def detect_conflicts(sources: List[NormalizedSource]) -> List[Conflict]:
        """
        Detecta conflictos entre señales clínicas y simbólicas
        
        Args:
            sources: Lista de fuentes normalizadas
            
        Returns:
            Lista de conflictos detectados
        """
        conflicts = []
        
        # Separar fuentes clínicas y simbólicas
        clinical_sources = [s for s in sources if s.type == 'clinical']
        symbolic_sources = [s for s in sources if s.type == 'symbolic']
        
        if not clinical_sources or not symbolic_sources:
            return conflicts
        
        # 1. Conflicto: Severidad clínica vs Arquetipo de Tarot
        conflicts.extend(
            SynthesisRules._check_tarot_severity_conflict(
                clinical_sources, symbolic_sources
            )
        )
        
        # 2. Conflicto: Sefirot inconsistentes
        conflicts.extend(
            SynthesisRules._check_sefira_conflicts(
                clinical_sources, symbolic_sources
            )
        )
        
        # 3. Conflicto: Elementos astrológicos vs síntomas clínicos
        conflicts.extend(
            SynthesisRules._check_astrological_conflicts(
                clinical_sources, symbolic_sources
            )
        )
        
        return conflicts
    
    @staticmethod
    def _check_tarot_severity_conflict(
        clinical: List[NormalizedSource],
        symbolic: List[NormalizedSource]
    ) -> List[Conflict]:
        """Detecta conflictos entre arquetipo de Tarot y severidad clínica"""
        conflicts = []
        
        # Buscar análisis de Tarot
        tarot_sources = [
            s for s in symbolic 
            if isinstance(s.signal, SymbolicSignal) and s.signal.analysis_type == 'tarot'
        ]
        
        if not tarot_sources:
            return conflicts
        
        # Obtener severidad clínica más alta
        max_severity = None
        max_severity_source = None
        for source in clinical:
            if isinstance(source.signal, ClinicalSignal):
                severity = source.signal.severity
                if not max_severity or SynthesisRules._severity_rank(severity) > SynthesisRules._severity_rank(max_severity):
                    max_severity = severity
                    max_severity_source = source
        
        if not max_severity or max_severity == "Ninguna":
            return conflicts
        
        # Verificar si el arquetipo de Tarot es compatible con la severidad
        for tarot_source in tarot_sources:
            if isinstance(tarot_source.signal, SymbolicSignal):
                arcana_name = tarot_source.signal.key_data.get('arcana_name', '')
                arcana_number = tarot_source.signal.key_data.get('arcana_number')
                
                # Arcanos de fuego/aire con ansiedad severa = conflicto
                if max_severity == "Severa":
                    fire_air_arcana = [0, 1, 3, 4, 7, 8, 10, 14, 16, 19, 20]  # Ejemplos
                    if arcana_number in fire_air_arcana and "Ansiedad" in (max_severity_source.signal.clinical_diagnosis if max_severity_source else ""):
                        conflicts.append(Conflict(
                            type="severity_mismatch",
                            description=f"El arquetipo {arcana_name} (fuego/aire) puede estar agravando la {max_severity} clínica",
                            sources=[tarot_source.signal.source_id, max_severity_source.signal.source_id if max_severity_source else None],
                            severity="high"
                        ))
        
        return conflicts
    
    @staticmethod
    def _check_sefira_conflicts(
        clinical: List[NormalizedSource],
        symbolic: List[NormalizedSource]
    ) -> List[Conflict]:
        """Detecta conflictos entre sefirot de diferentes fuentes"""
        conflicts = []
        
        # Recopilar sefirot de todas las fuentes
        sefirot_map = {}  # sefira -> [source_ids]
        
        for source in clinical + symbolic:
            sefira = None
            if isinstance(source.signal, ClinicalSignal):
                sefira = source.signal.sefira
            elif isinstance(source.signal, SymbolicSignal):
                # Extraer sefira según tipo
                if source.signal.analysis_type == 'astrology-kerykeion':
                    sefirot_mapping = source.signal.key_data.get('sefirot_mapping', {})
                    sefirot = list(sefirot_mapping.values())
                    if sefirot:
                        sefira = sefirot[0]  # Tomar la primera
        
            if sefira:
                if sefira not in sefirot_map:
                    sefirot_map[sefira] = []
                sefirot_map[sefira].append(source.signal.source_id)
        
        # Detectar sefirot en tensión (polaridades opuestas)
        polarities = {
            'Chesed': 'Gevurah',
            'Gevurah': 'Chesed',
            'Netzach': 'Hod',
            'Hod': 'Netzach',
            'Chokmah': 'Binah',
            'Binah': 'Chokmah'
        }
        
        for sefira, source_ids in sefirot_map.items():
            opposite = polarities.get(sefira)
            if opposite and opposite in sefirot_map:
                conflicts.append(Conflict(
                    type="sefira_tension",
                    description=f"Tensión entre {sefira} y {opposite} detectada en múltiples análisis",
                    sources=sefirot_map[sefira] + sefirot_map[opposite],
                    severity="medium"
                ))
        
        return conflicts
    
    @staticmethod
    def _check_astrological_conflicts(
        clinical: List[NormalizedSource],
        symbolic: List[NormalizedSource]
    ) -> List[Conflict]:
        """Detecta conflictos entre aspectos astrológicos y síntomas clínicos"""
        conflicts = []
        
        # Buscar análisis Kerykeion
        kerykeion_sources = [
            s for s in symbolic
            if isinstance(s.signal, SymbolicSignal) and s.signal.analysis_type == 'astrology-kerykeion'
        ]
        
        if not kerykeion_sources:
            return conflicts
        
        # Buscar síntomas de ansiedad/depresión en tests clínicos
        anxiety_depression_tests = [
            s for s in clinical
            if isinstance(s.signal, ClinicalSignal) and
            any(term in s.signal.clinical_diagnosis.lower() for term in ['ansiedad', 'anxiety', 'depresión', 'depression'])
        ]
        
        if not anxiety_depression_tests:
            return conflicts
        
        # Verificar aspectos tensos (cuadraturas, oposiciones)
        for kerykeion_source in kerykeion_sources:
            if isinstance(kerykeion_source.signal, SymbolicSignal):
                aspects = kerykeion_source.signal.key_data.get('major_aspects', [])
                tense_aspects = [
                    asp for asp in aspects
                    if asp.get('type') in ['square', 'opposition']
                ]
                
                if tense_aspects:
                    for test_source in anxiety_depression_tests:
                        conflicts.append(Conflict(
                            type="elemental_conflict",
                            description=f"Aspectos astrológicos tensos ({len(tense_aspects)} cuadraturas/oposiciones) pueden estar relacionándose con {test_source.signal.clinical_diagnosis}",
                            sources=[kerykeion_source.signal.source_id, test_source.signal.source_id],
                            severity="medium"
                        ))
        
        return conflicts
    
    @staticmethod
    def detect_strengths(sources: List[NormalizedSource]) -> List[Strength]:
        """Detecta fortalezas (coherencia entre señales)"""
        strengths = []
        
        # 1. Sefirot alineadas
        sefirot_aligned = SynthesisRules._check_aligned_sefirot(sources)
        strengths.extend(sefirot_aligned)
        
        # 2. Arquetipo consistente
        arcana_consistent = SynthesisRules._check_consistent_arcana(sources)
        strengths.extend(arcana_consistent)
        
        # 3. Aspectos armónicos
        harmonic_aspects = SynthesisRules._check_harmonic_aspects(sources)
        strengths.extend(harmonic_aspects)
        
        return strengths
    
    @staticmethod
    def _check_aligned_sefirot(sources: List[NormalizedSource]) -> List[Strength]:
        """Detecta cuando múltiples fuentes apuntan a la misma sefirá"""
        strengths = []
        sefirot_count = {}  # sefira -> [source_ids]
        
        for source in sources:
            sefira = None
            if isinstance(source.signal, ClinicalSignal):
                sefira = source.signal.sefira
            elif isinstance(source.signal, SymbolicSignal):
                if source.signal.analysis_type == 'astrology-kerykeion':
                    sefirot_mapping = source.signal.key_data.get('sefirot_mapping', {})
                    sefirot = list(sefirot_mapping.values())
                    if sefirot:
                        sefira = sefirot[0]
            
            if sefira:
                if sefira not in sefirot_count:
                    sefirot_count[sefira] = []
                sefirot_count[sefira].append(source.signal.source_id)
        
        # Si 2+ fuentes apuntan a la misma sefirá = fortaleza
        for sefira, source_ids in sefirot_count.items():
            if len(source_ids) >= 2:
                strengths.append(Strength(
                    type="aligned_sefirot",
                    description=f"Múltiples análisis confirman activación de {sefira}",
                    sources=source_ids,
                    confidence=min(1.0, len(source_ids) * 0.3)
                ))
        
        return strengths
    
    @staticmethod
    def _check_consistent_arcana(sources: List[NormalizedSource]) -> List[Strength]:
        """Detecta consistencia en arquetipos de Tarot"""
        strengths = []
        
        tarot_sources = [
            s for s in sources
            if isinstance(s.signal, SymbolicSignal) and s.signal.analysis_type == 'tarot'
        ]
        
        if len(tarot_sources) >= 2:
            # Verificar si todos apuntan al mismo arcana
            arcana_numbers = [
                s.signal.key_data.get('arcana_number')
                for s in tarot_sources
                if s.signal.key_data.get('arcana_number') is not None
            ]
            
            if len(set(arcana_numbers)) == 1:
                strengths.append(Strength(
                    type="consistent_arcana",
                    description=f"Arquetipo {tarot_sources[0].signal.key_data.get('arcana_name')} confirmado en múltiples análisis",
                    sources=[s.signal.source_id for s in tarot_sources],
                    confidence=0.9
                ))
        
        return strengths
    
    @staticmethod
    def _check_harmonic_aspects(sources: List[NormalizedSource]) -> List[Strength]:
        """Detecta aspectos astrológicos armónicos"""
        strengths = []
        
        kerykeion_sources = [
            s for s in sources
            if isinstance(s.signal, SymbolicSignal) and s.signal.analysis_type == 'astrology-kerykeion'
        ]
        
        for source in kerykeion_sources:
            if isinstance(source.signal, SymbolicSignal):
                aspects = source.signal.key_data.get('major_aspects', [])
                harmonic_aspects = [
                    asp for asp in aspects
                    if asp.get('type') in ['trine', 'sextile', 'conjunction']
                ]
                
                if len(harmonic_aspects) >= 3:
                    strengths.append(Strength(
                        type="harmonic_aspects",
                        description=f"Predominio de aspectos armónicos ({len(harmonic_aspects)} trinos/sextiles) indica flujo energético favorable",
                        sources=[source.signal.source_id],
                        confidence=0.7
                    ))
        
        return strengths
    
    @staticmethod
    def generate_recommendations(
        sources: List[NormalizedSource],
        conflicts: List[Conflict],
        strengths: List[Strength]
    ) -> List[Recommendation]:
        """Genera recomendaciones terapéuticas basadas en síntesis"""
        recommendations = []
        
        # Separar fuentes
        clinical_sources = [s for s in sources if s.type == 'clinical']
        symbolic_sources = [s for s in sources if s.type == 'symbolic']
        
        # 1. Recomendaciones inmediatas basadas en severidad clínica
        if clinical_sources:
            max_severity_source = max(
                clinical_sources,
                key=lambda s: SynthesisRules._severity_rank(s.signal.severity) if isinstance(s.signal, ClinicalSignal) else 0
            )
            if isinstance(max_severity_source.signal, ClinicalSignal):
                if max_severity_source.signal.severity == "Severa":
                    recommendations.append(Recommendation(
                        category="immediate",
                        priority="high",
                        action="Evaluar intervención clínica inmediata o derivación a especialista",
                        rationale=f"Severidad clínica {max_severity_source.signal.severity} detectada en {max_severity_source.signal.test_name}",
                        related_sources=[max_severity_source.signal.source_id]
                    ))
        
        # 2. Recomendaciones basadas en conflictos
        for conflict in conflicts:
            if conflict.severity == "high":
                recommendations.append(Recommendation(
                    category="therapeutic",
                    priority="high",
                    action=f"Trabajar integración de {conflict.type} mediante técnicas de equilibrio",
                    rationale=conflict.description,
                    related_sources=conflict.sources
                ))
        
        # 3. Recomendaciones basadas en fortalezas
        for strength in strengths:
            if strength.confidence >= 0.7:
                recommendations.append(Recommendation(
                    category="spiritual",
                    priority="medium",
                    action=f"Potenciar {strength.type} mediante prácticas alineadas",
                    rationale=strength.description,
                    related_sources=strength.sources
                ))
        
        # 4. Recomendación de integración general
        if len(sources) >= 3:
            recommendations.append(Recommendation(
                category="integration",
                priority="medium",
                action="Crear plan de integración holística considerando todas las fuentes",
                rationale=f"Síntesis cruzada de {len(sources)} fuentes sugiere abordaje multidimensional",
                related_sources=[s.signal.source_id for s in sources]
            ))
        
        return recommendations
    
    @staticmethod
    def _severity_rank(severity: str) -> int:
        """Ranking numérico de severidad (mayor = más severo)"""
        ranks = {
            'Severa': 5,
            'Moderada': 3,
            'Leve': 2,
            'Ninguna': 0,
            'No especificada': 1
        }
        return ranks.get(severity, 1)

