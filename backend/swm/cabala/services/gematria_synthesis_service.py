"""
Gematria Synthesis Service - AI-powered analysis of multiple gematria readings.

Integrates readings across methods and with other SWM modules for comprehensive
symbolic understanding.
"""

import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from django.db import transaction
from django.conf import settings
from django.utils import timezone

from ..gematria_models import GematriaReading, GematriaSynthesis
from api.models import Patient, CabalisticAnalysis, AnalysisRecord
from api.test_models import TestResult

logger = logging.getLogger(__name__)


# Number interpretations for synthesis
NUMBER_MEANINGS = {
    1: {'essence': 'Unidad, liderazgo, iniciativa', 'archetype': 'El Pionero', 'sefira': 'Keter'},
    2: {'essence': 'Dualidad, cooperación, equilibrio', 'archetype': 'El Mediador', 'sefira': 'Chokmah'},
    3: {'essence': 'Expresión, creatividad, comunicación', 'archetype': 'El Comunicador', 'sefira': 'Binah'},
    4: {'essence': 'Estructura, estabilidad, fundamento', 'archetype': 'El Constructor', 'sefira': 'Chesed'},
    5: {'essence': 'Cambio, libertad, aventura', 'archetype': 'El Aventurero', 'sefira': 'Gevurah'},
    6: {'essence': 'Amor, responsabilidad, armonía', 'archetype': 'El Cuidador', 'sefira': 'Tiferet'},
    7: {'essence': 'Introspección, sabiduría, espiritualidad', 'archetype': 'El Buscador', 'sefira': 'Netzach'},
    8: {'essence': 'Poder, abundancia, manifestación', 'archetype': 'El Manifestador', 'sefira': 'Hod'},
    9: {'essence': 'Culminación, humanitarismo, sabiduría', 'archetype': 'El Sabio', 'sefira': 'Yesod'},
    11: {'essence': 'Maestro: Iluminación, visión', 'archetype': 'El Visionario', 'sefira': 'Daath'},
    22: {'essence': 'Maestro: Constructor del imposible', 'archetype': 'El Maestro Constructor', 'sefira': 'Malkuth elevado'},
    33: {'essence': 'Maestro: Sanador, amor incondicional', 'archetype': 'El Maestro Espiritual', 'sefira': 'Keter inferior'},
}


class GematriaSynthesisService:
    """
    Service for generating AI-powered gematria synthesis.
    """
    
    def __init__(self, patient: Patient, therapist):
        self.patient = patient
        self.therapist = therapist
        self._ai_client = None
    
    def _get_ai_client(self):
        """Lazy load AI client"""
        if self._ai_client is None:
            try:
                from api.ai_engine import get_ai_engine
                self._ai_client = get_ai_engine()
            except ImportError:
                logger.warning("AI engine not available, synthesis will be basic")
                self._ai_client = None
        return self._ai_client
    
    def get_patient_readings(self, method_filter: Optional[str] = None) -> List[GematriaReading]:
        """Get all gematria readings for the patient"""
        qs = GematriaReading.objects.filter(patient=self.patient).order_by('-created_at')
        if method_filter:
            qs = qs.filter(method=method_filter)
        return list(qs)
    
    def save_reading(
        self,
        method: str,
        input_name: str,
        input_birth_date: Optional[str],
        hebrew_transliteration: str,
        calculated_numbers: Dict,
        calculation_details: Dict,
        sefirotic_correspondence: Dict,
        number_interpretations: Dict,
        method_interpretation: str = '',
        therapist_notes: str = '',
    ) -> GematriaReading:
        """Save a new gematria reading"""
        
        birth_date = None
        if input_birth_date:
            try:
                birth_date = datetime.strptime(input_birth_date, '%Y-%m-%d').date()
            except ValueError:
                pass
        
        reading = GematriaReading.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            method=method,
            input_name=input_name,
            input_birth_date=birth_date,
            hebrew_transliteration=hebrew_transliteration,
            calculated_numbers=calculated_numbers,
            calculation_details=calculation_details,
            sefirotic_correspondence=sefirotic_correspondence,
            number_interpretations=number_interpretations,
            method_interpretation=method_interpretation,
            therapist_notes=therapist_notes,
            status='saved',
        )
        
        return reading
    
    def analyze_number_patterns(self, readings: List[GematriaReading]) -> Dict[str, Any]:
        """Analyze patterns across all readings"""
        
        number_counts = {}
        sefira_counts = {}
        archetype_counts = {}
        method_results = {}
        
        for reading in readings:
            # Count numbers
            nums = reading.calculated_numbers or {}
            for key in ['esencia', 'expresion', 'herencia', 'caminoVida']:
                if key in nums and nums[key]:
                    reduced = nums[key].get('reducido')
                    if reduced:
                        number_counts[reduced] = number_counts.get(reduced, 0) + 1
                        # Track archetype
                        if reduced in NUMBER_MEANINGS:
                            arch = NUMBER_MEANINGS[reduced]['archetype']
                            archetype_counts[arch] = archetype_counts.get(arch, 0) + 1
            
            # Count sefirot
            corresp = reading.sefirotic_correspondence or {}
            sefira = corresp.get('sefira') or corresp.get('sefiraOriginal')
            if sefira:
                sefira_counts[sefira] = sefira_counts.get(sefira, 0) + 1
            
            # Store by method
            if reading.method not in method_results:
                method_results[reading.method] = []
            method_results[reading.method].append({
                'id': str(reading.id),
                'numbers': reading.calculated_numbers,
                'sefira': sefira,
                'created_at': reading.created_at.isoformat(),
            })
        
        # Find dominants (top 3)
        sorted_numbers = sorted(number_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        sorted_sefirot = sorted(sefira_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        sorted_archetypes = sorted(archetype_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            'dominant_numbers': [{'number': n, 'count': c, 'meaning': NUMBER_MEANINGS.get(n, {})} for n, c in sorted_numbers],
            'recurring_sefirot': [{'sefira': s, 'count': c} for s, c in sorted_sefirot],
            'archetypal_patterns': [{'archetype': a, 'count': c} for a, c in sorted_archetypes],
            'methods_analyzed': list(method_results.keys()),
            'total_readings': len(readings),
            'method_breakdown': method_results,
        }
    
    def get_cross_swm_data(self) -> List[Dict[str, Any]]:
        """Get relevant data from other SWM modules for cross-synthesis"""
        
        cross_data = []
        
        # 1. MCMI-4 results (if available)
        try:
            mcmi_results = TestResult.objects.filter(
                patient=self.patient,
                test_module__code__icontains='mcmi'
            ).order_by('-created_at')[:3]
            
            for result in mcmi_results:
                cross_data.append({
                    'swm': 'mcmi4',
                    'source_id': str(result.id),
                    'key_findings': {
                        'score': result.score,
                        'severity': result.clinical_severity,
                        'sefira': result.kabbalah_sefira,
                        'diagnosis': result.clinical_diagnosis,
                    },
                    'date': result.created_at.isoformat(),
                })
        except Exception as e:
            logger.warning(f"Could not load MCMI data: {e}")
        
        # 2. Tarot readings (from CabalisticAnalysis)
        try:
            tarot_analyses = CabalisticAnalysis.objects.filter(
                patient=self.patient,
                analysis_type='tarot'
            ).order_by('-created_at')[:3]
            
            for analysis in tarot_analyses:
                cross_data.append({
                    'swm': 'tarot',
                    'source_id': str(analysis.id),
                    'key_findings': {
                        'arcana': analysis.result_data.get('arcana'),
                        'archetype': analysis.result_data.get('archetype'),
                        'shadow': analysis.result_data.get('analisis_sombra'),
                    },
                    'date': analysis.created_at.isoformat(),
                })
        except Exception as e:
            logger.warning(f"Could not load Tarot data: {e}")
        
        # 3. Other CabalisticAnalysis types
        try:
            other_analyses = CabalisticAnalysis.objects.filter(
                patient=self.patient
            ).exclude(analysis_type='tarot').exclude(analysis_type='gematria').order_by('-created_at')[:3]
            
            for analysis in other_analyses:
                cross_data.append({
                    'swm': analysis.analysis_type,
                    'source_id': str(analysis.id),
                    'key_findings': analysis.result_data,
                    'date': analysis.created_at.isoformat(),
                })
        except Exception as e:
            logger.warning(f"Could not load other analyses: {e}")
        
        return cross_data
    
    def generate_ai_synthesis(
        self,
        readings: List[GematriaReading],
        pattern_analysis: Dict[str, Any],
        cross_swm_data: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Generate AI-powered synthesis from readings and cross-SWM data"""
        
        ai_client = self._get_ai_client()
        
        # Build context for AI
        context = self._build_synthesis_context(readings, pattern_analysis, cross_swm_data)
        
        if ai_client:
            try:
                return self._generate_with_ai(context, ai_client)
            except Exception as e:
                logger.error(f"AI synthesis failed: {e}")
        
        # Fallback to algorithmic synthesis
        return self._generate_algorithmic_synthesis(pattern_analysis, cross_swm_data)
    
    def _build_synthesis_context(
        self,
        readings: List[GematriaReading],
        pattern_analysis: Dict[str, Any],
        cross_swm_data: List[Dict[str, Any]],
    ) -> str:
        """Build context string for AI synthesis"""
        
        context_parts = [
            f"# Síntesis Gematrica para: {self.patient.full_name}",
            f"\n## Resumen de Lecturas ({len(readings)} lecturas)",
        ]
        
        # Add pattern summary
        dominant = pattern_analysis.get('dominant_numbers', [])
        if dominant:
            context_parts.append("\n### Números Dominantes:")
            for d in dominant:
                num = d['number']
                meaning = d.get('meaning', {})
                context_parts.append(f"- **{num}** (aparece {d['count']} veces): {meaning.get('essence', '')} - Arquetipo: {meaning.get('archetype', '')}")
        
        sefirot = pattern_analysis.get('recurring_sefirot', [])
        if sefirot:
            context_parts.append("\n### Sefirot Recurrentes:")
            for s in sefirot:
                context_parts.append(f"- **{s['sefira']}** (aparece {s['count']} veces)")
        
        # Add method-specific insights
        context_parts.append("\n### Lecturas por Método:")
        for reading in readings:
            nums = reading.calculated_numbers or {}
            context_parts.append(f"\n**{reading.get_method_display()}** ({reading.created_at.strftime('%Y-%m-%d')}):")
            for key in ['esencia', 'expresion', 'herencia', 'caminoVida']:
                if key in nums and nums[key]:
                    context_parts.append(f"  - {key.title()}: {nums[key].get('reducido')} (original: {nums[key].get('original')})")
            if reading.therapist_notes:
                context_parts.append(f"  - Nota terapeuta: {reading.therapist_notes}")
        
        # Add cross-SWM context
        if cross_swm_data:
            context_parts.append("\n## Datos de Otros Módulos SWM:")
            for data in cross_swm_data:
                context_parts.append(f"\n**{data['swm'].upper()}** ({data['date'][:10]}):")
                findings = data.get('key_findings', {})
                for k, v in findings.items():
                    if v:
                        context_parts.append(f"  - {k}: {v}")
        
        return "\n".join(context_parts)
    
    def _generate_with_ai(self, context: str, ai_client) -> Dict[str, Any]:
        """Generate synthesis using AI engine"""
        
        system_prompt = """Eres un experto en Cábala y numerología terapéutica. 
Tu tarea es sintetizar múltiples lecturas gematricas en un análisis coherente y profundo.

IMPORTANTE:
- Usa lenguaje simbólico, NO diagnóstico
- Enfócate en patrones recurrentes y su significado
- Integra información de diferentes métodos
- Identifica temas de luz (fortalezas) y sombra (desafíos)
- Sugiere áreas de Tikún (rectificación/trabajo interior)
- Si hay datos de otros módulos (MCMI4, Tarot), integra esas perspectivas

Responde en JSON con esta estructura:
{
    "narrative_summary": "Párrafo narrativo de 3-5 oraciones integrando los hallazgos principales",
    "dominant_themes": ["tema1", "tema2", "tema3"],
    "light_aspects": ["fortaleza1", "fortaleza2"],
    "shadow_aspects": ["desafío1", "desafío2"],
    "archetypal_journey": "Descripción del viaje arquetípico que revelan los números",
    "sefirotic_focus": "Sefirot principal a trabajar y por qué",
    "tikun_suggestions": ["sugerencia1", "sugerencia2"],
    "cross_swm_insights": "Cómo los otros módulos confirman o complementan el análisis gematrico",
    "therapeutic_direction": "Orientación simbólica para el proceso terapéutico"
}"""

        try:
            response = ai_client.generate(
                system_prompt=system_prompt,
                user_prompt=f"Analiza y sintetiza las siguientes lecturas gematricas:\n\n{context}",
                max_tokens=2000,
                temperature=0.7,
            )
            
            # Parse JSON response
            result = json.loads(response)
            result['ai_generated'] = True
            result['generated_at'] = timezone.now().isoformat()
            return result
            
        except json.JSONDecodeError:
            # If AI returns non-JSON, wrap it
            return {
                'narrative_summary': response,
                'ai_generated': True,
                'generated_at': timezone.now().isoformat(),
                'parse_error': True,
            }
    
    def _generate_algorithmic_synthesis(
        self,
        pattern_analysis: Dict[str, Any],
        cross_swm_data: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Generate basic synthesis without AI"""
        
        dominant = pattern_analysis.get('dominant_numbers', [])
        sefirot = pattern_analysis.get('recurring_sefirot', [])
        archetypes = pattern_analysis.get('archetypal_patterns', [])
        
        # Build narrative from patterns
        narrative_parts = []
        
        if dominant:
            top_num = dominant[0]
            meaning = top_num.get('meaning', {})
            narrative_parts.append(
                f"El número {top_num['number']} emerge como dominante en tus lecturas, "
                f"representando {meaning.get('essence', 'un patrón significativo')}. "
                f"El arquetipo de {meaning.get('archetype', 'tu esencia')} guía tu camino."
            )
        
        if sefirot:
            top_sefira = sefirot[0]['sefira']
            narrative_parts.append(
                f"La Sefirá {top_sefira} aparece recurrentemente, "
                f"indicando un área de trabajo y potencial en tu proceso."
            )
        
        return {
            'narrative_summary': ' '.join(narrative_parts) if narrative_parts else 'Análisis pendiente de más lecturas.',
            'dominant_themes': [a['archetype'] for a in archetypes],
            'light_aspects': [m.get('meaning', {}).get('essence', '') for m in dominant if m.get('meaning')],
            'shadow_aspects': ['Requiere revisión con terapeuta'],
            'archetypal_journey': f"Camino del {archetypes[0]['archetype']}" if archetypes else 'Por determinar',
            'sefirotic_focus': sefirot[0]['sefira'] if sefirot else 'Por determinar',
            'tikun_suggestions': ['Consultar con terapeuta para orientación personalizada'],
            'cross_swm_insights': f"Se encontraron {len(cross_swm_data)} registros de otros módulos para integrar." if cross_swm_data else 'Sin datos adicionales.',
            'therapeutic_direction': 'Continuar explorando con lecturas adicionales.',
            'ai_generated': False,
            'generated_at': timezone.now().isoformat(),
        }
    
    @transaction.atomic
    def create_synthesis(
        self,
        reading_ids: Optional[List[str]] = None,
        include_cross_swm: bool = True,
        title: str = 'Síntesis Gematrica',
    ) -> GematriaSynthesis:
        """Create a complete synthesis from readings"""
        
        # Get readings
        if reading_ids:
            readings = list(GematriaReading.objects.filter(
                id__in=reading_ids,
                patient=self.patient
            ))
        else:
            readings = self.get_patient_readings()
        
        if not readings:
            raise ValueError("No hay lecturas gematricas para sintetizar")
        
        # Analyze patterns
        pattern_analysis = self.analyze_number_patterns(readings)
        
        # Get cross-SWM data if requested
        cross_swm_data = self.get_cross_swm_data() if include_cross_swm else []
        
        # Generate AI synthesis
        ai_result = self.generate_ai_synthesis(readings, pattern_analysis, cross_swm_data)
        
        # Create synthesis record
        synthesis = GematriaSynthesis.objects.create(
            patient=self.patient,
            therapist=self.therapist,
            title=title,
            status='generated',
            ai_synthesis=ai_result,
            ai_narrative=ai_result.get('narrative_summary', ''),
            cross_swm_sources=cross_swm_data,
            cross_swm_synthesis={'integrated': bool(cross_swm_data)},
            dominant_numbers=pattern_analysis.get('dominant_numbers', []),
            recurring_sefirot=pattern_analysis.get('recurring_sefirot', []),
            archetypal_patterns=pattern_analysis.get('archetypal_patterns', []),
            shadow_themes=ai_result.get('shadow_aspects', []),
            light_themes=ai_result.get('light_aspects', []),
            tikun_suggestions=ai_result.get('tikun_suggestions', []),
        )
        
        # Associate readings
        synthesis.readings.set(readings)
        
        # Update reading statuses
        GematriaReading.objects.filter(id__in=[r.id for r in readings]).update(status='synthesized')
        
        return synthesis
    
    def export_to_holistic(self, synthesis: GematriaSynthesis) -> Optional[str]:
        """Export synthesis to the holistic synthesis (AnalysisRecord)"""
        
        try:
            # Prepare data with safe serialization
            raw_input = {
                'synthesis_id': str(synthesis.id),
                'readings_count': synthesis.readings_count,
                'methods_covered': synthesis.methods_covered or [],
                'ai_synthesis': synthesis.ai_synthesis or {},
                'source': 'gematria_synthesis',
            }
            
            computed_result = {
                'dominant_numbers': synthesis.dominant_numbers or [],
                'recurring_sefirot': synthesis.recurring_sefirot or [],
                'archetypal_patterns': synthesis.archetypal_patterns or [],
                'light_themes': synthesis.light_themes or [],
                'shadow_themes': synthesis.shadow_themes or [],
                'tikun_suggestions': synthesis.tikun_suggestions or [],
                'narrative': synthesis.ai_narrative or '',
                'type': 'gematria_synthesis',
            }
            
            # Build required birth_data_snapshot
            # Prefer legal_full_name from associated UserProfile when available
            legal_name = None
            try:
                if getattr(self.patient, 'user', None) and getattr(self.patient.user, 'profile', None):
                    legal_name = getattr(self.patient.user.profile, 'legal_full_name', None)
            except Exception:
                legal_name = None

            legal_name = legal_name or getattr(self.patient, 'legal_full_name', None) or getattr(self.patient, 'full_name', None)

            birth_data_snapshot = {
                'legal_name': legal_name,
                'birth_date': str(self.patient.birth_date) if self.patient.birth_date else None,
                'birth_time': str(self.patient.birth_time) if hasattr(self.patient, 'birth_time') and self.patient.birth_time else None,
                'city': getattr(self.patient, 'city_of_birth', None) or '',
                'country': getattr(self.patient, 'country_of_birth', None) or '',
                'lat': getattr(self.patient, 'birth_latitude', None),
                'lng': getattr(self.patient, 'birth_longitude', None),
                'timezone': getattr(self.patient, 'birth_timezone', None) or 'UTC',
                'geocode_source': 'patient_profile',
            }
            
            # Build required algorithm_snapshot
            algorithm_snapshot = {
                'engine': 'gematria_synthesis_service',
                'version': '1.0.0',
                'params': {
                    'methods_count': len(synthesis.methods_covered or []),
                    'readings_count': synthesis.readings_count,
                    'include_cross_swm': bool(synthesis.cross_swm_sources),
                },
            }
            
            logger.info(f"Exporting synthesis {synthesis.id} to holistic for patient {self.patient.id}")
            
            record = AnalysisRecord.objects.create(
                patient=self.patient,
                therapist=self.therapist,
                kind='kabbalah',  # Use existing kind choice
                module_code='GEMATRIA_SYNTHESIS',
                role_context='therapist',
                birth_data_snapshot=birth_data_snapshot,
                algorithm_snapshot=algorithm_snapshot,
                raw_input=raw_input,
                computed_result=computed_result,
            )
            
            # Update synthesis record
            synthesis.exported_to_holistic = True
            synthesis.exported_at = timezone.now()
            synthesis.holistic_record_id = str(record.id)
            synthesis.status = 'exported'
            synthesis.save()
            
            return str(record.id)
            
        except Exception as e:
            logger.error(f"Failed to export to holistic: {e}")
            return None
