"""
Motor de Síntesis Holística Evaluativa (MSHE)
Lee automáticamente analysis-records no clínicos y genera scoring simbólico
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
from django.contrib.auth.models import User
from ..models import Patient, AnalysisRecord, TherapistHolisticConfig
from .ai_interpreter import GeminiInterpreter
import logging

logger = logging.getLogger(__name__)


class HolisticSynthesisEngine:


class HolisticSynthesisEngine:
    """
    Motor que sintetiza evaluaciones holísticas no clínicas
    """

    # Ejes de evaluación holística (fijos)
    HOLISTIC_AXES = [
        'identity_purpose',      # Identidad y Propósito
        'emotion_regulation',    # Emoción y Regulación
        'relationships_bonds',   # Relaciones y Vínculos
        'vital_energy',          # Energía Vital y Cuerpo Simbólico
        'cycles_change',         # Ciclos y Procesos de Cambio
        'memory_lineage'         # Memoria y Linaje Transgeneracional
    ]

    # Mapeo de categorías a pesos
    CATEGORY_MAPPING = {
        'kabbalah': 'kabbalah_numerology',
        'numerology': 'kabbalah_numerology',
        'tarot': 'tarot_evolutivo',
        'astrology': 'astrologia_terapeutica',
        'transgenerational': 'transgeneracional',
        'biodecoding': 'biodecodificacion',
        'holistic_screening': 'biodecodificacion'  # Mapear a biodecodificación por defecto
    }

    def __init__(self, patient: Patient, therapist: User):
        self.patient = patient
        self.therapist = therapist
        self.weights = self._get_weights()
        self.records = self._load_records()

    def _get_weights(self) -> Dict[str, float]:
        """Obtener pesos configurados por el terapeuta"""
        try:
            config = TherapistHolisticConfig.objects.get(therapist=self.therapist)
            return config.weights
        except TherapistHolisticConfig.DoesNotExist:
            # Usar pesos por defecto
            return TherapistHolisticConfig.get_default_weights()

    def _load_records(self) -> List[AnalysisRecord]:
        """Cargar analysis-records no clínicos del paciente"""
        non_clinical_kinds = [
            'kabbalah', 'numerology', 'tarot', 'astrology',
            'transgenerational', 'biodecoding', 'holistic_screening'
        ]

        return list(AnalysisRecord.objects.filter(
            patient=self.patient,
            kind__in=non_clinical_kinds
        ).order_by('-created_at'))

    def _extract_scores_from_record(self, record: AnalysisRecord) -> Dict[str, float]:
        """
        Extraer scores simbólicos de un analysis-record
        Retorna dict con scores por eje holístico (0-100)
        """
        scores = {}

        # Intentar extraer de computed_result
        computed = record.computed_result or {}

        # Lógica específica por tipo de análisis
        if record.kind == 'kabbalah':
            scores = self._extract_kabbalah_scores(computed)
        elif record.kind == 'numerology':
            scores = self._extract_numerology_scores(computed)
        elif record.kind == 'tarot':
            scores = self._extract_tarot_scores(computed)
        elif record.kind == 'astrology':
            scores = self._extract_astrology_scores(computed)
        elif record.kind == 'transgenerational':
            scores = self._extract_transgenerational_scores(computed)
        elif record.kind == 'biodecoding':
            scores = self._extract_biodecoding_scores(computed)
        elif record.kind == 'holistic_screening':
            scores = self._extract_holistic_screening_scores(computed)

        return scores

    def _extract_kabbalah_scores(self, computed: Dict) -> Dict[str, float]:
        """Extraer scores de análisis cabalístico"""
        # Lógica simplificada - en producción sería más compleja
        scores = {}
        if 'sefirot' in computed:
            # Mapear sefirot a ejes holísticos
            sefirot_scores = computed.get('sefirot', {})
            scores['identity_purpose'] = sefirot_scores.get('keter', 70)  # Corona
            scores['emotion_regulation'] = sefirot_scores.get('yesod', 65)  # Fundación
            scores['relationships_bonds'] = sefirot_scores.get('hod_netzach', 60)  # Gloria/Victoria
            scores['vital_energy'] = sefirot_scores.get('malkuth', 75)  # Reino
            scores['cycles_change'] = sefirot_scores.get('hod_netzach', 55)
            scores['memory_lineage'] = sefirot_scores.get('binah', 80)  # Entendimiento
        return scores

    def _extract_numerology_scores(self, computed: Dict) -> Dict[str, float]:
        """Extraer scores de numerología"""
        scores = {}
        if 'numbers' in computed:
            numbers = computed.get('numbers', {})
            # Mapear números a ejes
            scores['identity_purpose'] = numbers.get('destiny', 70)
            scores['emotion_regulation'] = numbers.get('heart', 65)
            scores['relationships_bonds'] = numbers.get('social', 60)
            scores['vital_energy'] = numbers.get('physical', 75)
            scores['cycles_change'] = numbers.get('life_path', 55)
            scores['memory_lineage'] = numbers.get('karmic', 80)
        return scores

    def _extract_tarot_scores(self, computed: Dict) -> Dict[str, float]:
        """Extraer scores de tarot evolutivo"""
        scores = {}
        if 'reading' in computed:
            reading = computed.get('reading', {})
            # Análisis de arcanos y posiciones
            scores['identity_purpose'] = reading.get('self_awareness', 70)
            scores['emotion_regulation'] = reading.get('emotional_balance', 65)
            scores['relationships_bonds'] = reading.get('relationships', 60)
            scores['vital_energy'] = reading.get('energy_flow', 75)
            scores['cycles_change'] = reading.get('life_cycles', 55)
            scores['memory_lineage'] = reading.get('ancestral_wisdom', 80)
        return scores

    def _extract_astrology_scores(self, computed: Dict) -> Dict[str, float]:
        """Extraer scores de astrología terapéutica"""
        scores = {}
        if 'chart' in computed:
            chart = computed.get('chart', {})
            scores['identity_purpose'] = chart.get('sun_moon', 70)
            scores['emotion_regulation'] = chart.get('moon_venus', 65)
            scores['relationships_bonds'] = chart.get('venus_mars', 60)
            scores['vital_energy'] = chart.get('mars_pluto', 75)
            scores['cycles_change'] = chart.get('saturn_pluto', 55)
            scores['memory_lineage'] = chart.get('saturn_neptune', 80)
        return scores

    def _extract_transgenerational_scores(self, computed: Dict) -> Dict[str, float]:
        """Extraer scores de análisis transgeneracional"""
        scores = {}
        if 'lineage' in computed:
            lineage = computed.get('lineage', {})
            scores['identity_purpose'] = lineage.get('identity_patterns', 70)
            scores['emotion_regulation'] = lineage.get('emotional_inheritance', 65)
            scores['relationships_bonds'] = lineage.get('relational_patterns', 60)
            scores['vital_energy'] = lineage.get('energy_trauma', 75)
            scores['cycles_change'] = lineage.get('generational_cycles', 55)
            scores['memory_lineage'] = lineage.get('ancestral_memory', 80)
        return scores

    def _extract_biodecoding_scores(self, computed: Dict) -> Dict[str, float]:
        """Extraer scores de biodecodificación simbólica"""
        scores = {}
        if 'biodecoding' in computed:
            bio = computed.get('biodecoding', {})
            scores['identity_purpose'] = bio.get('identity_conflicts', 70)
            scores['emotion_regulation'] = bio.get('emotional_blockages', 65)
            scores['relationships_bonds'] = bio.get('relational_conflicts', 60)
            scores['vital_energy'] = bio.get('body_symbolism', 75)
            scores['cycles_change'] = bio.get('life_transitions', 55)
            scores['memory_lineage'] = bio.get('generational_patterns', 80)
        return scores

    def _extract_holistic_screening_scores(self, computed: Dict) -> Dict[str, float]:
        """Extraer scores de holistic screening (past-lives, etc.)"""
        scores = {}
        if 'holistic_screening' in computed:
            screening = computed.get('holistic_screening', {})
            scores['identity_purpose'] = screening.get('identity_resonance', 70)
            scores['emotion_regulation'] = screening.get('emotional_patterns', 65)
            scores['relationships_bonds'] = screening.get('relational_dynamics', 60)
            scores['vital_energy'] = screening.get('energy_alignment', 75)
            scores['cycles_change'] = screening.get('life_cycles', 55)
            scores['memory_lineage'] = screening.get('ancestral_connections', 80)
        return scores

    def compute_synthesis(self) -> Dict[str, Any]:
        """
        Computar síntesis holística evaluativa
        """
        if not self.records:
            return self._empty_synthesis()

        # Recopilar contribuciones por eje
        axis_contributions = {axis: [] for axis in self.HOLISTIC_AXES}

        for record in self.records:
            scores = self._extract_scores_from_record(record)
            weight_key = self.CATEGORY_MAPPING.get(record.kind, 'biodecodificacion')
            weight = self.weights.get(weight_key, 0.20)

            for axis in self.HOLISTIC_AXES:
                if axis in scores:
                    axis_contributions[axis].append({
                        'score': scores[axis],
                        'weight': weight,
                        'source': record.kind,
                        'date': record.created_at
                    })

        # Calcular scores finales por eje
        final_scores = {}
        for axis, contributions in axis_contributions.items():
            if contributions:
                # Score ponderado
                weighted_sum = sum(c['score'] * c['weight'] for c in contributions)
                total_weight = sum(c['weight'] for c in contributions)
                final_scores[axis] = weighted_sum / total_weight if total_weight > 0 else 0
            else:
                final_scores[axis] = 0

        # Generar colores de alerta
        color_alerts = self._compute_color_alerts(final_scores)

        # Preparar datos para IA
        ai_input_data = self._prepare_ai_input(final_scores, axis_contributions)

        return {
            'scores': final_scores,
            'color_alerts': color_alerts,
            'axis_contributions': axis_contributions,
            'ai_input_data': ai_input_data,
            'metadata': {
                'total_records': len(self.records),
                'weights_used': self.weights,
                'computed_at': datetime.now().isoformat(),
                'patient_id': self.patient.id,
                'therapist_id': self.therapist.id
            }
        }

    def _empty_synthesis(self) -> Dict[str, Any]:
        """Síntesis cuando no hay registros"""
        return {
            'scores': {axis: 0 for axis in self.HOLISTIC_AXES},
            'color_alerts': {axis: 'verde' for axis in self.HOLISTIC_AXES},
            'axis_contributions': {axis: [] for axis in self.HOLISTIC_AXES},
            'ai_input_data': {},
            'metadata': {
                'total_records': 0,
                'weights_used': self.weights,
                'computed_at': datetime.now().isoformat(),
                'patient_id': self.patient.id,
                'therapist_id': self.therapist.id
            }
        }

    def _compute_color_alerts(self, scores: Dict[str, float]) -> Dict[str, str]:
        """Computar colores de alerta basado en scores"""
        alerts = {}
        for axis, score in scores.items():
            if score <= 30:
                alerts[axis] = 'verde'
            elif score <= 60:
                alerts[axis] = 'amarillo'
            elif score <= 80:
                alerts[axis] = 'naranja'
            else:
                alerts[axis] = 'rojo'
        return alerts

    def _prepare_ai_input(self, scores: Dict[str, float], contributions: Dict) -> Dict[str, Any]:
        """Preparar datos para análisis IA"""
        return {
            'current_scores': scores,
            'contributions_summary': {
                axis: [
                    {
                        'score': c['score'],
                        'source': c['source'],
                        'date': c['date'].isoformat()
                    } for c in contribs
                ] for axis, contribs in contributions.items()
            },
            'dominant_themes': self._identify_dominant_themes(scores),
            'priority_axes': self._identify_priority_axes(scores)
        }

    def _identify_dominant_themes(self, scores: Dict[str, float]) -> List[str]:
        """Identificar temas dominantes"""
        themes = []
        if scores.get('identity_purpose', 0) > 70:
            themes.append("Fuerte sentido de propósito")
        if scores.get('emotion_regulation', 0) < 40:
            themes.append("Dificultades emocionales")
        if scores.get('relationships_bonds', 0) > 75:
            themes.append("Conexiones relacionales sólidas")
        if scores.get('memory_lineage', 0) > 80:
            themes.append("Conexión ancestral profunda")
        return themes

    def _identify_priority_axes(self, scores: Dict[str, float]) -> List[str]:
        """Identificar ejes prioritarios (scores altos)"""
        sorted_axes = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return [axis for axis, score in sorted_axes if score > 60][:3]

    def generate_ai_analysis(self, synthesis_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generar análisis IA de la síntesis holística
        """
        ai_interpreter = GeminiInterpreter()

        if not ai_interpreter.enabled:
            return self._fallback_ai_analysis(synthesis_data)

        # Preparar prompt para IA
        prompt = self._build_ai_prompt(synthesis_data)

        try:
            response = ai_interpreter.model.generate_content(prompt)
            ai_text = response.text

            # Parsear respuesta estructurada
            return self._parse_ai_response(ai_text)

        except Exception as e:
            logger.error(f"Error en análisis IA MSHE: {e}")
            return self._fallback_ai_analysis(synthesis_data)

    def _build_ai_prompt(self, synthesis_data: Dict[str, Any]) -> str:
        """Construir prompt para análisis IA"""
        scores = synthesis_data.get('scores', {})
        color_alerts = synthesis_data.get('color_alerts', {})
        contributions = synthesis_data.get('axis_contributions', {})

        # Traducir nombres de ejes para IA
        axis_names = {
            'identity_purpose': 'Identidad y Propósito',
            'emotion_regulation': 'Emoción y Regulación',
            'relationships_bonds': 'Relaciones y Vínculos',
            'vital_energy': 'Energía Vital y Cuerpo Simbólico',
            'cycles_change': 'Ciclos y Procesos de Cambio',
            'memory_lineage': 'Memoria y Linaje Transgeneracional'
        }

        # Construir resumen de scores
        scores_summary = "\n".join([
            f"- {axis_names.get(axis, axis)}: {score:.1f} ({color_alerts.get(axis, 'verde')})"
            for axis, score in scores.items()
        ])

        # Construir resumen de contribuciones
        contributions_summary = []
        for axis, contribs in contributions.items():
            if contribs:
                axis_name = axis_names.get(axis, axis)
                sources = [f"{c['source']} ({c['score']:.1f})" for c in contribs[:3]]  # Top 3
                contributions_summary.append(f"- {axis_name}: {', '.join(sources)}")

        contributions_text = "\n".join(contributions_summary)

        prompt = f"""
Eres un analista simbólico holístico especializado en síntesis de evaluaciones no clínicas.

Analiza la siguiente síntesis holística evaluativa de un paciente y genera un análisis profundo:

SCORES POR EJE HOLÍSTICO:
{scores_summary}

CONTRIBUCIONES POR FUENTE:
{contributions_text}

INSTRUCCIONES PARA EL ANÁLISIS:

1. **Temas Dominantes**: Identifica 3-5 temas principales que emergen de los scores
2. **Ejes Prioritarios**: Señala los ejes que requieren más atención (scores altos o colores rojo/naranja)
3. **Patrones Recurrentes**: Busca conexiones entre diferentes ejes o fuentes
4. **Áreas de Progreso**: Identifica fortalezas y áreas donde hay evolución positiva
5. **Áreas de Estancamiento**: Señala bloqueos o áreas que necesitan trabajo

6. **Conclusión Evaluativa**: Proporciona una síntesis general simbólica y orientativa

IMPORTANTE - RESTRICCIONES ÉTICAS:
- NO uses lenguaje médico o clínico
- NO hagas diagnósticos
- NO sugieras tratamientos o intervenciones
- Mantén un enfoque simbólico y holístico
- Las conclusiones deben ser orientativas, no definitivas

Estructura tu respuesta en JSON válido con esta estructura exacta:
{{
  "dominant_themes": ["tema 1", "tema 2", "tema 3"],
  "priority_axes": ["eje prioritario 1", "eje prioritario 2"],
  "recurrent_patterns": ["patrón 1", "patrón 2"],
  "areas_of_progress": ["área de progreso 1", "área de progreso 2"],
  "areas_of_stagnation": ["área de estancamiento 1"],
  "evaluated_summary": "Conclusión general simbólica orientativa",
  "confidence_level": "low|medium|high",
  "limits_notice": "Conclusión simbólica orientativa."
}}

Responde ÚNICAMENTE con el JSON, sin texto adicional.
"""

        return prompt

    def _parse_ai_response(self, ai_text: str) -> Dict[str, Any]:
        """Parsear respuesta de IA a estructura esperada"""
        try:
            # Intentar parsear JSON directamente
            import json
            result = json.loads(ai_text.strip())

            # Validar estructura mínima
            required_keys = [
                'dominant_themes', 'priority_axes', 'recurrent_patterns',
                'areas_of_progress', 'areas_of_stagnation', 'evaluated_summary'
            ]

            for key in required_keys:
                if key not in result:
                    result[key] = [] if key.endswith('s') else ""

            # Asegurar tipos correctos
            list_keys = ['dominant_themes', 'priority_axes', 'recurrent_patterns',
                        'areas_of_progress', 'areas_of_stagnation']
            for key in list_keys:
                if not isinstance(result.get(key), list):
                    result[key] = [str(result.get(key, ""))]

            return result

        except json.JSONDecodeError:
            # Fallback si no es JSON válido
            return self._fallback_ai_analysis({})

    def _fallback_ai_analysis(self, synthesis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Análisis fallback cuando IA no está disponible"""
        scores = synthesis_data.get('scores', {})

        # Análisis básico basado en scores
        dominant_themes = []
        if scores.get('identity_purpose', 0) > 70:
            dominant_themes.append("Fuerte conexión con propósito vital")
        if scores.get('memory_lineage', 0) > 75:
            dominant_themes.append("Conexión ancestral significativa")

        priority_axes = []
        for axis, score in scores.items():
            if score > 70:
                priority_axes.append(axis)

        return {
            "dominant_themes": dominant_themes[:3],
            "priority_axes": priority_axes[:3],
            "recurrent_patterns": ["Análisis limitado sin IA"],
            "areas_of_progress": ["Requiere análisis IA completo"],
            "areas_of_stagnation": ["Sin datos suficientes"],
            "evaluated_summary": "Evaluación simbólica básica - se recomienda análisis IA completo para mayor profundidad",
            "confidence_level": "low",
            "limits_notice": "Conclusión simbólica orientativa - análisis limitado."
        }