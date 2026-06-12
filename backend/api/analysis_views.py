import json
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
import logging

from .models import AnalysisRecord, Patient
from .serializers import AnalysisRecordSerializer
from .permissions import IsTherapist
from .utils.genai_response import extract_debug, extract_text

logger = logging.getLogger(__name__)


class TherapistPatientResultsView(APIView):
    """
    GET /api/analysis-records/?patient_id={id}
    
    Terapeuta: Lista resultados del paciente activo.
    Requiere: role = therapist, ownership del paciente.
    """
    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request):
        patient_id = request.query_params.get('patient_id')
        if not patient_id:
            return Response(
                {'error': 'patient_id es requerido en query params.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        therapist = request.user

        # Validar ownership
        try:
            patient = Patient.objects.get(pk=patient_id, therapist=therapist)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o no tienes permisos para acceder.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Obtener resultados del paciente
        records = AnalysisRecord.objects.filter(
            patient=patient
        ).order_by('-created_at')

        serializer = AnalysisRecordSerializer(records, many=True, context={'request': request})
        return Response({'results': serializer.data}, status=status.HTTP_200_OK)


class UpdateAnalysisAnnotationsView(APIView):
    """
    PATCH /api/analysis-records/{uuid}/annotations
    
    Terapeuta: Actualiza anotaciones de un resultado.
    Requiere: role = therapist, ownership del resultado.
    NO permite modificar computed_result ni snapshots.
    """
    permission_classes = [IsAuthenticated, IsTherapist]

    def patch(self, request, pk):
        therapist = request.user
        logger.info(
            "UpdateAnalysisAnnotationsView.patch called",
            extra={
                "user_id": getattr(therapist, "id", None),
                "record_id": str(pk),
            },
        )

        try:
            record = AnalysisRecord.objects.get(pk=pk)
        except AnalysisRecord.DoesNotExist:
            logger.warning(
                "AnalysisRecord not found for annotations",
                extra={"user_id": therapist.id, "record_id": str(pk)},
            )
            return Response(
                {'error': 'Resultado no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validar ownership: el terapeuta debe ser el propietario del resultado
        if record.therapist_id != therapist.id:
            logger.warning(
                "Therapist tried to edit annotations without ownership",
                extra={
                    "user_id": therapist.id,
                    "record_id": str(record.id),
                    "record_therapist_id": record.therapist_id,
                },
            )
            return Response(
                {'error': 'No tienes permisos para editar este resultado.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validar que solo se actualicen annotations
        allowed_fields = {
            'summary',
            'notes',
            'clinical_notes',
            'diagnosis_hypotheses',
            'recommendations_next_steps',
            'visible_to_patient',
        }
        annotations_data = request.data.get('therapist_annotations', {})
        
        if not isinstance(annotations_data, dict):
            return Response(
                {'error': 'therapist_annotations debe ser un objeto JSON.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        current_annotations = record.therapist_annotations or {}

        # Merge defensivo: solo keys permitidas.
        updated_annotations = {
            key: annotations_data.get(key, current_annotations.get(key))
            for key in allowed_fields
        }

        record.therapist_annotations = updated_annotations

        # Si es un export holístico, refrescar markdown para que el PDF refleje los campos guardados.
        try:
            if record.module_code == 'HOLISTIC_EXPORT_V1' and isinstance(record.computed_result, dict):
                export_obj = record.computed_result.get('export')
                if isinstance(export_obj, dict):
                    export_obj['therapist_annotations'] = {
                        'clinical_notes': updated_annotations.get('clinical_notes', '') or '',
                        'diagnosis_hypotheses': updated_annotations.get('diagnosis_hypotheses', '') or '',
                        'recommendations_next_steps': updated_annotations.get('recommendations_next_steps', '') or '',
                    }
                    from .patient_holistic_export_views import _build_markdown

                    export_obj['markdown'] = _build_markdown(export_obj)
                    record.computed_result['export'] = export_obj
                    record.save(update_fields=['therapist_annotations', 'computed_result'])
                else:
                    record.save(update_fields=['therapist_annotations'])
            else:
                record.save(update_fields=['therapist_annotations'])
        except Exception:
            record.save(update_fields=['therapist_annotations'])

        logger.info(
            "Therapist annotations updated successfully",
            extra={
                "user_id": therapist.id,
                "record_id": str(record.id),
                "visible_to_patient": updated_annotations.get('visible_to_patient', False),
            },
        )

        serializer = AnalysisRecordSerializer(record, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class PatientMyResultsView(APIView):
    """
    GET /api/analysis-records/my-results/
    
    Paciente: Lista sus propios resultados.
    Filtra por: subject_user = request.user, visibility in (patient, both)
    Oculta therapist_annotations a menos que visible_to_patient = true
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            profile = getattr(user, 'profile', None)

            # Validar que es paciente
            if not profile or profile.user_type != 'patient':
                return Response(
                    {'error': 'Solo los pacientes pueden acceder a este endpoint.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Obtener resultados del paciente
            records = AnalysisRecord.objects.filter(
                Q(subject_user=user) | Q(patient__user=user)
            ).filter(
                Q(visibility__in=['patient', 'both']) | Q(visibility__isnull=True)
            ).order_by('-created_at')

            # Serializar y filtrar annotations según visibilidad
            serializer = AnalysisRecordSerializer(records, many=True, context={'request': request})
            results_data = serializer.data

            # Filtrar therapist_annotations: solo mostrar si visible_to_patient = true
            for result in results_data:
                annotations = result.get('therapist_annotations', {})
                if isinstance(annotations, dict) and not annotations.get('visible_to_patient', False):
                    # Ocultar annotations si no están marcadas como visibles
                    result['therapist_annotations'] = None

            return Response({'results': results_data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error en PatientMyResultsView.get")
            return Response(
                {'error': f'Error interno del servidor: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AnalysisRecordListCreateView(generics.ListCreateAPIView):
    """
    GET: Lista AnalysisRecords visibles para el usuario autenticado.
    POST: Crea un nuevo AnalysisRecord (validaciones en el serializer).
    """

    serializer_class = AnalysisRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = AnalysisRecord.objects.all()

        # Filtro opcional por tipo: GET /api/analysis-records/?kind=holistic_evaluative_synthesis
        kind = self.request.query_params.get('kind')
        if kind:
            qs = qs.filter(kind=kind)

        # Soportar GET /api/analysis-records/?patient_id={id} para terapeutas
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            profile = getattr(user, 'profile', None)
            if not profile or profile.user_type != 'therapist':
                # Usuario sin rol terapeuta: no ve nada en este modo
                return AnalysisRecord.objects.none()

            return qs.filter(
                patient__id=patient_id,
                therapist=user,
            ).order_by('-created_at')

        # Filtro general por ownership/relación
        return qs.filter(
            Q(created_by_user=user)
            | Q(subject_user=user)
            | Q(patient__therapist=user)
            | Q(patient__user=user)
        ).order_by('-created_at')

    def perform_create(self, serializer):
        # El serializer ya fija created_by_user y execution_mode en validate()
        serializer.save()


class AnalysisRecordDetailView(generics.RetrieveAPIView):
    """
    GET: Detalle de un AnalysisRecord concreto, validando permisos básicos.
    """

    serializer_class = AnalysisRecordSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'
    queryset = AnalysisRecord.objects.all()

    def get_queryset(self):
        user = self.request.user
        return AnalysisRecord.objects.filter(
            Q(created_by_user=user)
            | Q(subject_user=user)
            | Q(patient__therapist=user)
            | Q(patient__user=user)
        )


# ========== VISTAS PARA MOTOR DE SÍNTESIS HOLÍSTICA EVALUATIVA (MSHE) ==========

class HolisticSynthesisView(APIView):
    """
    POST /api/analysis-records/holistic-synthesis/?patient_id={id}

    Terapeuta: Genera síntesis holística evaluativa automática.
    Lee todos los analysis-records no clínicos del paciente.
    Requiere: role = therapist, ownership del paciente.
    """
    permission_classes = [IsAuthenticated, IsTherapist]

    def post(self, request):
        therapist = request.user
        patient_id = request.query_params.get('patient_id')

        if not patient_id:
            return Response(
                {'error': 'patient_id es requerido en query params.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar ownership del paciente
        try:
            patient = Patient.objects.get(pk=patient_id, therapist=therapist)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o no tienes permisos.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            # Importar aquí para evitar dependencias circulares
            from .holistic_synthesis_engine import HolisticSynthesisEngine

            # Crear motor de síntesis
            engine = HolisticSynthesisEngine(patient, therapist)

            # Computar síntesis
            synthesis_data = engine.compute_synthesis()

            # Generar análisis IA
            ai_analysis = engine.generate_ai_analysis(synthesis_data)

            # Preparar datos para guardar
            raw_input = {
                'holistic_synthesis': {
                    'scores': synthesis_data['scores'],
                    'color_alerts': synthesis_data['color_alerts'],
                    'axis_contributions': synthesis_data['axis_contributions'],
                    'metadata': synthesis_data['metadata']
                },
                'ai_analysis': ai_analysis
            }

            # Crear AnalysisRecord
            analysis_record = AnalysisRecord.objects.create(
                kind='holistic_evaluative_synthesis',
                module_code='MSHE',
                role_context='therapist',
                execution_mode='therapist_clinical',
                birth_data_snapshot={},  # No aplica para síntesis
                algorithm_snapshot={
                    'engine': 'HolisticSynthesisEngine',
                    'version': '1.0',
                    'build_hash': None,
                    'params': {
                        'weights': synthesis_data['metadata']['weights_used']
                    }
                },
                raw_input=raw_input,
                computed_result=synthesis_data,
                visibility='therapist',
                created_by_user=therapist,
                therapist=therapist,
                patient=patient
            )

            # Serializar respuesta
            serializer = AnalysisRecordSerializer(analysis_record, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.exception("Error en HolisticSynthesisView.post")
            return Response(
                {'error': f'Error generando síntesis holística: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ========== ASISTENTE IA PARA SCID-5 HOLÍSTICO ==========

class SCID5AIAssistant:
    """Asistente IA para SCID-5 Holístico - Capa Asistente, no central"""

    def __init__(self, patient, therapist):
        self.patient = patient
        self.therapist = therapist

        # Configurar Gemini
        self.genai = None
        try:
            from google import genai as genai_local
            self.genai = genai_local
        except ImportError:
            pass

        from django.conf import settings
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.0-flash')
        self.enabled = bool(self.api_key and self.genai)

    def _get_contextual_data(self):
        """Obtiene datos contextuales del paciente para correlaciones"""
        context = {}

        # MSHE - síntesis holística
        try:
            mshe_records = AnalysisRecord.objects.filter(
                patient=self.patient,
                kind='holistic_evaluative_synthesis',
                module_code='MSHE'
            ).order_by('-created_at')[:1]

            if mshe_records:
                mshe_data = mshe_records[0].computed_result
                if isinstance(mshe_data, dict):
                    context['mshe'] = {
                        'ejes': mshe_data.get('axis_contributions', {}),
                        'evolucion': mshe_data.get('evolution_patterns', {}),
                        'patrones_persistentes': mshe_data.get('persistent_patterns', [])
                    }
        except Exception:
            pass

        # Cábala/Numerología
        try:
            cabala_records = AnalysisRecord.objects.filter(
                patient=self.patient,
                kind__in=['cabalistic_analysis', 'numerological_analysis']
            ).order_by('-created_at')[:1]

            if cabala_records:
                cabala_data = cabala_records[0].computed_result
                if isinstance(cabala_data, dict):
                    context['cabala'] = cabala_data
        except Exception:
            pass

        # Tarot
        try:
            tarot_records = AnalysisRecord.objects.filter(
                patient=self.patient,
                kind='tarot_analysis'
            ).order_by('-created_at')[:1]

            if tarot_records:
                tarot_data = tarot_records[0].computed_result
                if isinstance(tarot_data, dict):
                    context['tarot'] = tarot_data
        except Exception:
            pass

        # Astrología
        try:
            astrology_records = AnalysisRecord.objects.filter(
                patient=self.patient,
                kind='astrology_kerykeion'
            ).order_by('-created_at')[:1]

            if astrology_records:
                astrology_data = astrology_records[0].computed_result
                if isinstance(astrology_data, dict):
                    context['astrology'] = astrology_data
        except Exception:
            pass

        # Transgeneracional
        try:
            transgenerational_records = AnalysisRecord.objects.filter(
                patient=self.patient,
                kind='transgenerational_analysis'
            ).order_by('-created_at')[:1]

            if transgenerational_records:
                trans_data = transgenerational_records[0].computed_result
                if isinstance(trans_data, dict):
                    context['transgenerational'] = trans_data
        except Exception:
            pass

        # Biodecodificación
        try:
            bio_records = AnalysisRecord.objects.filter(
                patient=self.patient,
                kind='biodecoding_analysis'
            ).order_by('-created_at')[:1]

            if bio_records:
                bio_data = bio_records[0].computed_result
                if isinstance(bio_data, dict):
                    context['biodecoding'] = bio_data
        except Exception:
            pass

        return context

    def _build_prompt(self, scid5_data, depth_level, active_section, context_data):
        """Construye el prompt para Gemini basado en el contexto"""

        section_map = {
            'emotional_vitality': 'Estado emocional y vitalidad',
            'anxiety_calm': 'Ansiedad, preocupación y calma interior',
            'meaning_reality': 'Experiencia de realidad y significado',
            'impact_memory': 'Experiencias de impacto, memoria y estrés',
            'self_regulation': 'Autorregulación y conducta',
            'identity_relationships': 'Patrones de identidad y relación'
        }

        section_name = section_map.get(active_section, active_section or 'general')

        # Extraer datos de la sección activa
        section_data = scid5_data.get('holistic_exploration', {}).get(active_section, {})
        explorado = section_data.get('explorado', False)
        patrones = section_data.get('patrones_observados', False)
        intensidad = section_data.get('intensidad_experiencial', 'no_aplica')
        notas = section_data.get('notas_observacionales', '')

        # Construir contexto disponible
        context_parts = []
        if 'mshe' in context_data:
            context_parts.append(f"MSHE disponible: {context_data['mshe']}")
        if 'cabala' in context_data:
            context_parts.append("Cábala/Numerología disponible")
        if 'tarot' in context_data:
            context_parts.append("Tarot disponible")
        if 'astrology' in context_data:
            context_parts.append("Astrología disponible")
        if 'transgenerational' in context_data:
            context_parts.append("Análisis transgeneracional disponible")
        if 'biodecoding' in context_data:
            context_parts.append("Biodecodificación disponible")

        context_str = "; ".join(context_parts) if context_parts else "Sin datos contextuales adicionales"

        # Nivel de profundidad
        depth_config = {
            1: "NIVEL 1 — BÁSICO: 2–3 preguntas suaves, 1 hipótesis orientativa máximo, sin correlaciones complejas",
            2: "NIVEL 2 — PROFUNDO: 4–6 preguntas (incluye cuerpo, relación, propósito), correlación simple con MSHE y un módulo extra",
            3: "NIVEL 3 — AVANZADO: 6–10 preguntas, correlación multi-módulo, identifica tensión central + pregunta integradora, propone mini-síntesis revisable"
        }

        prompt = f"""Eres una IA especializada en acompañamiento holístico estructurado para SCID-5.
Tu función es asistir al terapeuta durante una entrevista/exploración, proponiendo preguntas profundas no inductivas, correlaciones simbólicas entre módulos, clarificaciones de lenguaje, y síntesis orientativas revisables.

REGLAS ÉTICAS (NO NEGOCIABLES):
❌ No diagnosticar (médico o psicológico)
❌ No usar DSM, CIE o terminología clínica de patología
❌ No usar palabras: "enfermedad", "trastorno", "síndrome", "certeza", "pronóstico"
❌ No prescribir tratamientos
❌ No afirmar causalidad biológica
❌ No predecir eventos futuros
❌ No inducir respuestas ("¿es cierto que…?")
❌ No sustituir el criterio del terapeuta

LENGUAJE OBLIGATORIO: Usa siempre "posible lectura simbólica", "hipótesis orientativa", "resonancia observada", "pregunta exploratoria", "área de atención consciente", "proceso en curso", "esto requiere contexto y validación humana"

DATOS ACTUALES DEL SCID-5:
- Sección activa: {section_name}
- Explorada: {"Sí" if explorado else "No"}
- Patrones observados: {"Sí" if patrones else "No"}
- Intensidad: {intensidad}
- Notas: {notas[:200]}...

CONTEXTO DISPONIBLE: {context_str}

PROFUNDIDAD SOLICITADA: {depth_config[depth_level]}

INSTRUCCIONES DE RESPUESTA:
Debes responder ÚNICAMENTE con un JSON válido en este formato exacto:

{{
  "section": "{section_name}",
  "depth_level": {depth_level},
  "suggested_questions": [
    {{"q": "pregunta completa", "intent": "breve explicación del propósito"}}
  ],
  "symbolic_correlations": [
    {{"source": "MSHE|tarot|astrology|kabbalah|transgenerational|biodecoding", "note": "descripción simbólica"}}
  ],
  "draft_section_synthesis": "3-5 líneas de síntesis revisable, no conclusiva",
  "ethical_guardrails": [
    "recordatorio ético si aplica"
  ],
  "therapist_actions": [
    {{"action": "acción sugerida", "why": "razón"}}
  ]
}}

IMPORTANTE:
- Máximo 10 preguntas
- Preguntas abiertas, no inductivas
- Correlaciones como "posibilidad" no como "verdad"
- Síntesis para que el terapeuta edite
- JSON válido sin texto adicional"""

        return prompt

    def generate_assistance(self, scid5_data, depth_level, active_section):
        """Genera asistencia IA para SCID-5"""

        if not self.enabled:
            # Respuesta fallback cuando Gemini no está disponible
            return {
                "section": active_section or "general",
                "depth_level": depth_level,
                "suggested_questions": [
                    {
                        "q": "¿Cómo describes tu experiencia en esta área?",
                        "intent": "Pregunta inicial abierta para explorar la vivencia subjetiva"
                    }
                ],
                "symbolic_correlations": [],
                "draft_section_synthesis": "Esta sección requiere más exploración para elaborar una síntesis orientativa.",
                "ethical_guardrails": [
                    "Recuerda: esta es asistencia simbólica, no diagnóstica"
                ],
                "therapist_actions": [
                    {
                        "action": "Continuar exploración con preguntas abiertas",
                        "why": "Para profundizar sin inducir respuestas específicas"
                    }
                ]
            }

        try:
            # Obtener datos contextuales
            context_data = self._get_contextual_data()

            # Construir prompt
            prompt = self._build_prompt(scid5_data, depth_level, active_section, context_data)

            # Configurar modelo
            from google import genai
            self.client = genai.Client(api_key=self.api_key)
            
            # Generar respuesta
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={
                    'temperature': 0.7,
                    'max_output_tokens': 2048,
                }
            )
            response_text = extract_text(response).strip()

            # Limpiar respuesta (remover posibles markdown)
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            # Parsear JSON
            try:
                result = json.loads(response_text)
                # Validar estructura básica
                required_keys = ['section', 'depth_level', 'suggested_questions', 'symbolic_correlations', 'draft_section_synthesis', 'ethical_guardrails', 'therapist_actions']
                for key in required_keys:
                    if key not in result:
                        raise ValueError(f"Missing required key: {key}")

                return result

            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(
                    f"Invalid AI response format: {e}",
                    extra={
                        "response_text": response_text,
                        "response_debug": extract_debug(response),
                    },
                )
                # Fallback
                return {
                    "section": active_section or "general",
                    "depth_level": depth_level,
                    "suggested_questions": [
                        {
                            "q": "¿Cómo describes tu experiencia en esta área?",
                            "intent": "Pregunta inicial abierta para explorar la vivencia subjetiva"
                        }
                    ],
                    "symbolic_correlations": [],
                    "draft_section_synthesis": "La IA generó una respuesta con formato inválido. Se requiere validación manual.",
                    "ethical_guardrails": [
                        "Verificar respuesta IA antes de usar",
                        "Mantener lenguaje consultivo y simbólico"
                    ],
                    "therapist_actions": [
                        {
                            "action": "Revisar y adaptar sugerencias IA",
                            "why": "Asegurar alineación con principios éticos"
                        }
                    ]
                }

        except Exception as e:
            logger.exception("Error generando asistencia SCID-5 IA")
            return {
                "section": active_section or "general",
                "depth_level": depth_level,
                "suggested_questions": [
                    {
                        "q": "¿Qué aspectos de esta área te gustaría explorar?",
                        "intent": "Pregunta abierta para guiar la exploración"
                    }
                ],
                "symbolic_correlations": [],
                "draft_section_synthesis": "Error temporal en el asistente IA. Continuar con exploración clínica estándar.",
                "ethical_guardrails": [
                    "El asistente IA no está disponible temporalmente"
                ],
                "therapist_actions": [
                    {
                        "action": "Proceder con entrevista clínica estándar",
                        "why": "Mantener continuidad del proceso terapéutico"
                    }
                ]
            }


class TherapistHolisticConfigView(APIView):
    """
    GET /api/therapist/holistic-config/
    PUT /api/therapist/holistic-config/

    Terapeuta: Gestiona configuración de pesos MSHE.
    """
    permission_classes = [IsAuthenticated, IsTherapist]

    def get(self, request):
        therapist = request.user

        try:
            from .models import TherapistHolisticConfig
            config = TherapistHolisticConfig.objects.get(therapist=therapist)
            return Response({
                'weights': config.weights,
                'created_at': config.created_at,
                'updated_at': config.updated_at
            })
        except TherapistHolisticConfig.DoesNotExist:
            # Retornar configuración por defecto
            from .models import TherapistHolisticConfig
            default_weights = TherapistHolisticConfig.get_default_weights()
            return Response({
                'weights': default_weights,
                'message': 'Usando pesos por defecto'
            })

    def put(self, request):
        therapist = request.user
        weights = request.data.get('weights', {})

        # Validar que los pesos sumen 1.0
        total = sum(weights.values())
        if abs(total - 1.0) > 0.001:
            return Response(
                {'error': f'Los pesos deben sumar 1.0, actualmente suman {total}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar pesos individuales
        for key, value in weights.items():
            if not isinstance(value, (int, float)) or value < 0 or value > 1:
                return Response(
                    {'error': f'Peso inválido para {key}: {value}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        from .models import TherapistHolisticConfig
        config, created = TherapistHolisticConfig.objects.get_or_create(
            therapist=therapist,
            defaults={'weights': weights}
        )

        if not created:
            config.weights = weights
            config.save()

        return Response({
            'weights': config.weights,
            'created': created,
            'updated_at': config.updated_at
        })


class SCID5AIAssistantView(APIView):
    """
    POST /api/analysis-records/scid5-ai-assistant/?patient_id={id}

    Terapeuta: Obtiene asistencia IA para SCID-5 Holístico.
    Requiere: role = therapist, ownership del paciente.
    Retorna: JSON estructurado con sugerencias, correlaciones y síntesis.
    """
    permission_classes = [IsAuthenticated, IsTherapist]

    def post(self, request):
        therapist = request.user
        patient_id = request.query_params.get('patient_id')

        if not patient_id:
            return Response(
                {'error': 'patient_id es requerido en query params.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar ownership del paciente
        try:
            patient = Patient.objects.get(pk=patient_id, therapist=therapist)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Paciente no encontrado o no tienes permisos.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Extraer datos del request
        scid5_data = request.data.get('scid5_data', {})
        depth_level = request.data.get('depth_level', 1)
        active_section = request.data.get('active_section', '')

        if not isinstance(scid5_data, dict):
            return Response(
                {'error': 'scid5_data debe ser un objeto JSON válido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if depth_level not in [1, 2, 3]:
            return Response(
                {'error': 'depth_level debe ser 1, 2 o 3.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Crear motor de asistencia IA
            assistant = SCID5AIAssistant(patient, therapist)

            # Generar asistencia
            assistance_result = assistant.generate_assistance(
                scid5_data=scid5_data,
                depth_level=depth_level,
                active_section=active_section
            )

            return Response(assistance_result, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Error en SCID5AIAssistantView")
            return Response(
                {'error': f'Error interno del servidor: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
