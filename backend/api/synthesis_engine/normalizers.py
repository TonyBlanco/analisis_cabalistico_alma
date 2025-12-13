"""
Normalizadores para convertir TestResult y CabalisticAnalysis
a formato interno común del motor de síntesis
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from .schemas import ClinicalSignal, SymbolicSignal, NormalizedSource


class TestResultNormalizer:
    """Normaliza TestResult a ClinicalSignal"""
    
    @staticmethod
    def normalize(test_result) -> ClinicalSignal:
        """
        Convierte un TestResult a ClinicalSignal normalizado
        
        Args:
            test_result: Instancia de TestResult
            
        Returns:
            ClinicalSignal normalizado
        """
        # Detectar si es SCDF
        is_scdf = (
            test_result.test_module and test_result.test_module.code == 'scdf'
        ) or (
            test_result.result_data and 
            test_result.result_data.get('result', {}).get('module_outcomes') is not None
        )
        
        if is_scdf:
            return TestResultNormalizer._normalize_scdf(test_result)
        
        # Extraer test_id y nombre
        test_id = test_result.test_id or ""
        test_name = (
            test_result.test_module.name if test_result.test_module 
            else test_id.upper().replace("-", " ")
        )
        
        # Extraer score
        score = test_result.score
        if score is None and test_result.result_data:
            score = test_result.result_data.get('score') or test_result.result_data.get('score_bruto')
        
        # Extraer diagnóstico clínico
        clinical_diagnosis = test_result.clinical_diagnosis or ""
        if not clinical_diagnosis and test_result.result_data:
            clinical_diagnosis = (
                test_result.result_data.get('clinical_diagnosis') or
                test_result.result_data.get('diagnostico_clinico') or
                ""
            )
        
        # Determinar severidad desde diagnóstico
        severity = TestResultNormalizer._extract_severity(clinical_diagnosis)
        
        # Extraer sefirá si existe
        sefira = test_result.kabbalah_sefira or ""
        if not sefira and test_result.result_data:
            sefira = test_result.result_data.get('sefira') or test_result.result_data.get('kabbalah_sefira') or ""
        
        return ClinicalSignal(
            test_id=test_id,
            test_name=test_name,
            score=score,
            severity=severity,
            clinical_diagnosis=clinical_diagnosis,
            sefira=sefira if sefira else None,
            date=test_result.created_at or datetime.now(),
            source_id=test_result.id
        )
    
    @staticmethod
    def _normalize_scdf(test_result) -> ClinicalSignal:
        """Normaliza TestResult de SCDF a ClinicalSignal con domain signals"""
        result_data = test_result.result_data or {}
        scdf_result = result_data.get('result', {}) if isinstance(result_data, dict) else result_data
        
        # Extraer module_outcomes
        module_outcomes = scdf_result.get('module_outcomes', [])
        quality_checks = scdf_result.get('quality_checks', {})
        provisional_diagnoses = scdf_result.get('provisional_diagnoses', [])
        
        # Extraer domain signals
        domain_signals = TestResultNormalizer._extract_scdf_domain_signals(module_outcomes)
        
        # Determinar severidad general basada en módulos positivos
        positive_modules = [m for m in module_outcomes if m.get('outcome') == 'positive']
        excluded_modules = [m for m in module_outcomes if m.get('excluded', False)]
        
        if len(positive_modules) >= 3:
            severity = "Severa"
        elif len(positive_modules) >= 2:
            severity = "Moderada"
        elif len(positive_modules) >= 1:
            severity = "Leve"
        else:
            severity = "Ninguna"
        
        # Construir diagnóstico clínico resumido (sin texto DSM/SCID)
        diagnosis_parts = []
        if positive_modules:
            diagnosis_parts.append(f"{len(positive_modules)} módulo(s) con evidencia positiva")
        if excluded_modules:
            diagnosis_parts.append(f"{len(excluded_modules)} módulo(s) excluido(s)")
        if quality_checks.get('inconsistencies'):
            diagnosis_parts.append("Inconsistencias detectadas")
        
        clinical_diagnosis = ". ".join(diagnosis_parts) if diagnosis_parts else "Evaluación SCDF completada"
        
        # Agregar domain signals al diagnóstico como metadata (formato parseable)
        if domain_signals:
            signals_summary = ", ".join([
                f"{domain}: {signal}" 
                for domain, signal in domain_signals.items() 
                if signal != 'negative'
            ])
            if signals_summary:
                clinical_diagnosis += f" | Señales: {signals_summary}"
        
        # Almacenar domain signals en el TestResult.result_data para acceso futuro
        # (esto se hace automáticamente cuando se guarda el TestResult)
        
        return ClinicalSignal(
            test_id='scdf',
            test_name='Structured Clinical Diagnostic Framework (SCDF)',
            score=len(positive_modules),  # Usar número de módulos positivos como score
            severity=severity,
            clinical_diagnosis=clinical_diagnosis,
            sefira=None,  # SCDF no tiene sefirá directa
            date=test_result.created_at or datetime.now(),
            source_id=test_result.id
        )
    
    @staticmethod
    def _extract_scdf_domain_signals(module_outcomes: List[Dict[str, Any]]) -> Dict[str, str]:
        """
        Extrae domain signals de SCDF module_outcomes
        
        Returns:
            Dict con domain -> signal (positive/partial/negative/excluded)
        """
        domain_signals = {}
        
        # Mapeo de module_id a domain
        module_to_domain = {
            'MOOD_001': 'mood_signal',
            'ANXIETY_001': 'anxiety_signal',
            'PSYCHOSIS_001': 'psychosis_signal',
            'TRAUMA_001': 'trauma_signal',
            'SUBSTANCE_001': 'substance_signal',
            'PERSONALITY_001': 'personality_signal',
            'EATING_001': 'eating_signal',
            'SLEEP_001': 'sleep_signal'
        }
        
        for outcome in module_outcomes:
            module_id = outcome.get('module_id', '')
            domain = module_to_domain.get(module_id)
            if domain:
                outcome_value = outcome.get('outcome', 'negative')
                domain_signals[domain] = outcome_value
        
        return domain_signals
    
    @staticmethod
    def _extract_severity(diagnosis: str) -> str:
        """Extrae nivel de severidad desde diagnóstico clínico"""
        diagnosis_lower = diagnosis.lower()
        
        if any(word in diagnosis_lower for word in ['severa', 'severe', 'alto', 'high']):
            return "Severa"
        elif any(word in diagnosis_lower for word in ['moderada', 'moderate', 'moderadamente']):
            return "Moderada"
        elif any(word in diagnosis_lower for word in ['leve', 'mild', 'mínima', 'minimal']):
            return "Leve"
        elif any(word in diagnosis_lower for word in ['ninguna', 'none', 'bajo', 'low']):
            return "Ninguna"
        else:
            return "No especificada"


class CabalisticAnalysisNormalizer:
    """Normaliza CabalisticAnalysis a SymbolicSignal"""
    
    @staticmethod
    def normalize(analysis) -> SymbolicSignal:
        """
        Convierte un CabalisticAnalysis a SymbolicSignal normalizado
        
        Args:
            analysis: Instancia de CabalisticAnalysis
            
        Returns:
            SymbolicSignal normalizado
        """
        result_data = analysis.result_data or {}
        
        # Extraer datos clave según el tipo de análisis
        key_data = CabalisticAnalysisNormalizer._extract_key_data(
            analysis.analysis_type,
            result_data
        )
        
        return SymbolicSignal(
            analysis_type=analysis.analysis_type,
            key_data=key_data,
            date=analysis.created_at or datetime.now(),
            source_id=analysis.id
        )
    
    @staticmethod
    def _extract_key_data(analysis_type: str, result_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extrae datos clave según el tipo de análisis"""
        key_data = {}
        
        if analysis_type == 'tarot':
            # Tarot: arcana, path, hebrew letter
            key_data = {
                'arcana_number': result_data.get('arcana_number'),
                'arcana_name': result_data.get('arcana_name'),
                'hebrew_letter': result_data.get('hebrew_letter'),
                'path': result_data.get('path'),
                'clinical_severity': result_data.get('clinical_severity'),
                'test_name': result_data.get('test_name')
            }
        
        elif analysis_type == 'astrology-kerykeion':
            # Kerykeion: planetas principales, aspectos, mapeo cabalístico
            planets = result_data.get('planets', {})
            aspects = result_data.get('aspects', [])
            cabalistic_mapping = result_data.get('cabalistic_mapping', {})
            
            key_data = {
                'sun_sign': planets.get('Sun', {}).get('sign') if planets else None,
                'moon_sign': planets.get('Moon', {}).get('sign') if planets else None,
                'ascendant': result_data.get('houses', {}).get('1', {}).get('sign') if result_data.get('houses') else None,
                'major_aspects': aspects[:5] if aspects else [],  # Top 5 aspectos
                'sefirot_mapping': {
                    planet: mapping.get('sefira') 
                    for planet, mapping in cabalistic_mapping.items()
                    if mapping.get('sefira')
                } if cabalistic_mapping else {}
            }
        
        elif analysis_type == 'gematria':
            # Gematria: valores principales
            key_data = {
                'ragil': result_data.get('ragil'),
                'katan': result_data.get('katan'),
                'gadol': result_data.get('gadol'),
                'atbash': result_data.get('atbash'),
                'text': result_data.get('text')
            }
        
        elif analysis_type == 'shekinah':
            # Shekinah: PIN, OTD, karmas
            key_data = {
                'pin': result_data.get('identity', {}).get('pin') if isinstance(result_data.get('identity'), dict) else None,
                'otd': result_data.get('otd', {}),
                'karmas': result_data.get('karmas', {})
            }
        
        else:
            # Otros tipos: guardar result_data completo
            key_data = result_data
        
        return key_data


class SourceWeightCalculator:
    """Calcula pesos y prioridades para fuentes normalizadas"""
    
    # Pesos base por tipo de fuente
    CLINICAL_BASE_WEIGHT = 1.0  # Tests clínicos tienen máxima prioridad
    SYMBOLIC_BASE_WEIGHT = 0.7
    
    # Pesos por tipo de análisis simbólico
    SYMBOLIC_TYPE_WEIGHTS = {
        'tarot': 0.8,
        'astrology-kerykeion': 0.9,
        'shekinah': 0.7,
        'gematria': 0.6,
        'soul-map': 0.7,
        'astrology': 0.8,
        'tikun': 0.6
    }
    
    # Prioridades por severidad clínica
    SEVERITY_PRIORITIES = {
        'Severa': 10,
        'Moderada': 7,
        'Leve': 4,
        'Ninguna': 1,
        'No especificada': 2
    }
    
    @staticmethod
    def calculate_weight(source: NormalizedSource) -> float:
        """Calcula peso final para una fuente normalizada"""
        if source.type == 'clinical':
            # Tests clínicos: peso base + ajuste por severidad
            base = SourceWeightCalculator.CLINICAL_BASE_WEIGHT
            if isinstance(source.signal, ClinicalSignal):
                severity_boost = SourceWeightCalculator.SEVERITY_PRIORITIES.get(
                    source.signal.severity, 1
                ) / 10.0
                return min(1.0, base + severity_boost * 0.2)
            return base
        
        elif source.type == 'symbolic':
            # Análisis simbólicos: peso según tipo
            if isinstance(source.signal, SymbolicSignal):
                type_weight = SourceWeightCalculator.SYMBOLIC_TYPE_WEIGHTS.get(
                    source.signal.analysis_type, 0.5
                )
                return type_weight * SourceWeightCalculator.SYMBOLIC_BASE_WEIGHT
        
        return 0.5  # Peso por defecto
    
    @staticmethod
    def calculate_priority(source: NormalizedSource) -> int:
        """Calcula prioridad (mayor = más importante)"""
        if source.type == 'clinical':
            if isinstance(source.signal, ClinicalSignal):
                return SourceWeightCalculator.SEVERITY_PRIORITIES.get(
                    source.signal.severity, 5
                )
            return 8
        
        elif source.type == 'symbolic':
            if isinstance(source.signal, SymbolicSignal):
                # Prioridad según tipo de análisis
                type_priorities = {
                    'astrology-kerykeion': 7,
                    'tarot': 6,
                    'shekinah': 5,
                    'gematria': 4,
                    'soul-map': 5,
                    'astrology': 6,
                    'tikun': 4
                }
                return type_priorities.get(source.signal.analysis_type, 3)
        
        return 3



