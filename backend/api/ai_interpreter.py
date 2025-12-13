"""
Motor de interpretación cabalística con IA (Gemini)
"""
from django.conf import settings
import json
from datetime import datetime
from typing import Dict, Any, Optional
from api.utils.gemini_rest import call_gemini_api


class GeminiInterpreter:
    """Intérprete de análisis cabalísticos usando Gemini AI"""
    
    def __init__(self):
        """Inicializa el cliente de Gemini"""
        api_key = settings.GEMINI_API_KEY if hasattr(settings, 'GEMINI_API_KEY') else None
        # Usar modelo correcto: gemini-2.0-flash (stable y gratuito)
        model_name = settings.GEMINI_MODEL if hasattr(settings, 'GEMINI_MODEL') else 'gemini-2.0-flash'
        
        if api_key:
            try:
                self.model_name = model_name
                self.enabled = True
                print(f"[OK] Gemini configurado con modelo: {model_name} (Google GenAI SDK)")
            except Exception as e:
                self.enabled = False
                print(f"[WARNING] Error configurando Gemini: {e}")
                print("   Usando interpretaciones locales")
        else:
            self.enabled = False
            print("[WARNING] Gemini API key no configurada, usando interpretaciones locales")
    
    def generate_basic_interpretation(
        self,
        nombre: str,
        fecha_nacimiento: str,
        numeros: Dict[str, int]
    ) -> str:
        """
        Genera una interpretación básica del análisis cabalístico
        
        Args:
            nombre: Nombre completo de la persona
            fecha_nacimiento: Fecha de nacimiento
            numeros: Diccionario con los números calculados
        
        Returns:
            Interpretación personalizada en español
        """
        if not self.enabled:
            return self._fallback_interpretation(numeros)
        
        prompt = f"""
Eres un experto cabalista y numerólogo con profundo conocimiento en interpretación de números sagrados.

Analiza el siguiente perfil numerológico y genera una interpretación profunda, personalizada y espiritual:

DATOS:
- Nombre: {nombre}
- Fecha de nacimiento: {fecha_nacimiento}

NÚMEROS CALCULADOS:
- Número del Destino: {numeros.get('destino', 'N/A')}
- Número del Alma: {numeros.get('alma', 'N/A')}
- Número de Personalidad: {numeros.get('personalidad', 'N/A')}
- Número de Expresión: {numeros.get('expresion', 'N/A')}

INSTRUCCIONES:
1. Proporciona una interpretación completa y profunda de cada número
2. Explica cómo estos números se complementan entre sí
3. Identifica fortalezas, desafíos y propósito de vida
4. Usa un tono cálido, espiritual pero profesional
5. Escribe en español de forma clara y poética
6. Divide la respuesta en secciones claras
7. Incluye consejos prácticos para el crecimiento personal

Formato de respuesta:
- Introducción personalizada
- Número del Destino (significado y guía)
- Número del Alma (esencia interior)
- Número de Personalidad (cómo te perciben)
- Síntesis armónica (cómo trabajar con estos números)
- Mensaje final inspirador
"""
        
        try:
            response_text = call_gemini_api(
                prompt=prompt,
                model_name=self.model_name,
                temperature=0.8,
                top_p=0.9,
                top_k=40,
                max_output_tokens=2048
            )
            return response_text
        except Exception as e:
            print(f"Error en Gemini API: {e}")
            return self._fallback_interpretation(numeros)
    
    def generate_compatibility_interpretation(
        self,
        persona1: Dict[str, Any],
        persona2: Dict[str, Any],
        compatibilidad_score: float
    ) -> str:
        """Genera interpretación de compatibilidad de pareja"""
        
        if not self.enabled:
            return self._fallback_compatibility(compatibilidad_score)
        
        prompt = f"""
Eres un experto cabalista especializado en análisis de compatibilidad de parejas.

Analiza la compatibilidad numerológica entre estas dos personas:

PERSONA 1:
- Nombre: {persona1['nombre']}
- Número del Destino: {persona1.get('destino', 'N/A')}
- Número del Alma: {persona1.get('alma', 'N/A')}

PERSONA 2:
- Nombre: {persona2['nombre']}
- Número del Destino: {persona2.get('destino', 'N/A')}
- Número del Alma: {persona2.get('alma', 'N/A')}

SCORE DE COMPATIBILIDAD: {compatibilidad_score:.1f}%

Genera un análisis detallado que incluya:
1. Visión general de la compatibilidad
2. Fortalezas de la relación
3. Desafíos potenciales
4. Consejos para armonizar la relación
5. Áreas de crecimiento conjunto
6. Mensaje final esperanzador

Usa un tono empático y constructivo. Escribe en español.
"""
        
        try:
            response_text = call_gemini_api(
                prompt=prompt,
                model_name=self.model_name,
                temperature=0.8,
                top_p=0.9,
                top_k=40,
                max_output_tokens=2048
            )
            return response_text
        except Exception as e:
            print(f"Error en Gemini API: {e}")
            return self._fallback_compatibility(compatibilidad_score)
    
    def generate_career_guidance(
        self,
        nombre: str,
        numeros: Dict[str, int]
    ) -> str:
        """Genera orientación profesional basada en numerología"""
        
        if not self.enabled:
            return self._fallback_career(numeros)
        
        prompt = f"""
Eres un guía vocacional experto en numerología cabalística.

Proporciona orientación profesional para:

PERSONA:
- Nombre: {nombre}
- Número del Destino: {numeros.get('destino', 'N/A')}
- Número de Expresión: {numeros.get('expresion', 'N/A')}

Genera una guía profesional completa que incluya:
1. Talentos naturales y habilidades innatas
2. Profesiones y campos más adecuados
3. Estilo de trabajo ideal
4. Fortalezas para el éxito profesional
5. Áreas de desarrollo
6. Consejos para encontrar tu vocación

Sé específico con ejemplos de profesiones. Escribe en español.
"""
        
        try:
            response_text = call_gemini_api(
                prompt=prompt,
                model_name=self.model_name,
                temperature=0.8,
                top_p=0.9,
                top_k=40,
                max_output_tokens=2048
            )
            return response_text
        except Exception as e:
            print(f"Error en Gemini API: {e}")
            return self._fallback_career(numeros)
    
    def generate_spiritual_path(
        self,
        nombre: str,
        numeros: Dict[str, int]
    ) -> str:
        """Genera análisis del camino espiritual"""
        
        if not self.enabled:
            return self._fallback_spiritual(numeros)
        
        prompt = f"""
Eres un maestro espiritual y cabalista profundo.

Revela el camino espiritual de:

BUSCADOR:
- Nombre: {nombre}
- Número del Alma: {numeros.get('alma', 'N/A')}
- Número del Destino: {numeros.get('destino', 'N/A')}

Proporciona una guía espiritual que incluya:
1. Propósito espiritual en esta vida
2. Lecciones kármicas a aprender
3. Dones espirituales naturales
4. Prácticas espirituales recomendadas
5. Obstáculos en el camino y cómo superarlos
6. Mensaje del alma para este momento

Usa lenguaje poético y profundo. Escribe en español.
"""
        
        try:
            response_text = call_gemini_api(
                prompt=prompt,
                model_name=self.model_name,
                temperature=0.8,
                top_p=0.9,
                top_k=40,
                max_output_tokens=2048
            )
            return response_text
        except Exception as e:
            print(f"Error en Gemini API: {e}")
            return self._fallback_spiritual(numeros)
    
    # Fallbacks locales (sin IA)
    
    def _fallback_interpretation(self, numeros: Dict[str, int]) -> str:
        """Interpretación básica sin IA"""
        destino = numeros.get('destino', 0)
        alma = numeros.get('alma', 0)
        
        interpretaciones_destino = {
            1: "Eres un líder natural con una fuerte voluntad y determinación.",
            2: "Tu camino es la diplomacia y la cooperación con otros.",
            3: "La creatividad y la expresión son tu propósito de vida.",
            4: "Tu misión es construir bases sólidas y aportar estabilidad.",
            5: "El cambio y la libertad son esenciales en tu destino.",
            6: "Tu propósito es servir y cuidar a los demás.",
            7: "La búsqueda de conocimiento y sabiduría define tu camino.",
            8: "El poder material y el éxito son parte de tu destino.",
            9: "Tu misión es ser un faro de luz para la humanidad.",
        }
        
        texto = f"**INTERPRETACIÓN NUMEROLÓGICA**\n\n"
        texto += f"**Número del Destino ({destino}):** "
        texto += interpretaciones_destino.get(destino, "Número especial con significado único.")
        texto += f"\n\n**Número del Alma ({alma}):** "
        texto += "Tu esencia interior te guía en este viaje espiritual."
        
        return texto
    
    def _fallback_compatibility(self, score: float) -> str:
        """Compatibilidad básica sin IA"""
        if score >= 80:
            nivel = "excelente"
            mensaje = "Esta es una combinación muy armoniosa."
        elif score >= 60:
            nivel = "buena"
            mensaje = "Hay buen potencial con esfuerzo mutuo."
        else:
            nivel = "desafiante"
            mensaje = "Requiere trabajo y comprensión."
        
        return f"**COMPATIBILIDAD {nivel.upper()} ({score:.1f}%)**\n\n{mensaje}"
    
    def _fallback_career(self, numeros: Dict[str, int]) -> str:
        """Orientación profesional básica sin IA"""
        return "**ORIENTACIÓN PROFESIONAL**\n\nTus números sugieren explorar campos donde puedas expresar tu creatividad y liderazgo natural."
    
    def _fallback_spiritual(self, numeros: Dict[str, int]) -> str:
        """Camino espiritual básico sin IA"""
        return "**CAMINO ESPIRITUAL**\n\nTu alma busca el crecimiento a través del servicio y la conexión con tu verdadero ser."
    
    def generate_clinical_analysis(
        self,
        test_module_code: str,
        result_data: Dict[str, Any],
        patient_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Genera análisis clínico con IA para tests clínicos estructurados
        
        Args:
            test_module_code: Código del módulo de test (ej: 'scdf')
            result_data: Datos del resultado del test (de compute_scdf o equivalente)
            patient_data: Datos adicionales del paciente (opcional)
        
        Returns:
            Dict con análisis clínico estructurado (JSON-compatible)
        """
        # Solo procesar SCDF por ahora
        if test_module_code != 'scdf':
            return {
                'error': f'Análisis clínico no implementado para test_module_code: {test_module_code}',
                'note': 'Solo se soporta SCDF actualmente'
            }
        
        if not self.enabled:
            return self._fallback_clinical_analysis(result_data)
        
        # Extraer datos relevantes de result_data
        module_outcomes = result_data.get('module_outcomes', [])
        provisional_diagnoses = result_data.get('provisional_diagnoses', [])
        quality_checks = result_data.get('quality_checks', {})
        clinical_summary = result_data.get('clinical_summary', '')
        client_data = result_data.get('datos_cliente', {})
        
        # Construir prompt para Gemini
        prompt = f"""Eres un asistente clínico experto que proporciona apoyo en la interpretación de evaluaciones clínicas estructuradas.

IMPORTANTE: NO estás diagnosticando. Estás proporcionando apoyo clínico y sugerencias para que el clínico tome decisiones informadas.

DATOS DEL CLIENTE:
- Nombre: {client_data.get('nombre', 'No proporcionado')}
- Edad: {client_data.get('edad', 'N/A')}
- Fecha de evaluación: {client_data.get('fecha', 'N/A')}

RESULTADOS DE LA EVALUACIÓN:
{json.dumps({
    'module_outcomes': module_outcomes,
    'provisional_diagnoses': provisional_diagnoses,
    'quality_checks': quality_checks,
    'clinical_summary': clinical_summary
}, indent=2, ensure_ascii=False)}

TAREA:
Genera un análisis clínico estructurado en formato JSON que incluya:

1. **resumen_ejecutivo**: Resumen breve (2-3 oraciones) de los hallazgos principales
2. **modulos_activos**: Lista de módulos con outcome positivo, parcial o excluido, con breve explicación
3. **exclusiones_destacadas**: Lista de exclusiones activas (sustancias, condiciones médicas, otros trastornos) y su relevancia clínica
4. **inconsistencias_detectadas**: Lista de inconsistencias o datos faltantes detectados en quality_checks, con sugerencias para resolverlas
5. **consideraciones_diferenciales**: Lista de consideraciones diferenciales (como sugerencias, NO como diagnósticos) basadas en los módulos positivos
6. **preguntas_seguimiento**: Lista de preguntas sugeridas para explorar más a fondo áreas de interés clínico
7. **siguientes_pasos**: Lista de pasos sugeridos (evaluación adicional, derivación, seguimiento, etc.)
8. **limitaciones**: Lista de limitaciones de esta evaluación (datos faltantes, contexto limitado, etc.)
9. **disclaimer**: Texto que enfatiza que este es apoyo clínico y que el juicio clínico profesional es esencial

RESTRICCIONES:
- NO uses texto literal de DSM-5 o SCID-5
- NO diagnostiques
- Sé conservador y enfatiza la necesidad de evaluación clínica profesional
- Usa lenguaje de apoyo y sugerencias, no afirmaciones definitivas
- Escribe en español
- El formato de respuesta debe ser JSON válido

Formato de respuesta (JSON):
{{
  "resumen_ejecutivo": "...",
  "modulos_activos": [
    {{
      "module_id": "...",
      "module_name": "...",
      "outcome": "positive/partial/excluded",
      "explicacion": "..."
    }}
  ],
  "exclusiones_destacadas": [
    {{
      "tipo": "substance_related/medical_condition/other_disorder",
      "modulo": "...",
      "relevancia": "..."
    }}
  ],
  "inconsistencias_detectadas": [
    {{
      "tipo": "missing_data/inconsistency",
      "descripcion": "...",
      "sugerencia": "..."
    }}
  ],
  "consideraciones_diferenciales": [
    {{
      "area": "...",
      "sugerencia": "...",
      "nota": "Esto es una sugerencia, no un diagnóstico"
    }}
  ],
  "preguntas_seguimiento": [
    "..."
  ],
  "siguientes_pasos": [
    "..."
  ],
  "limitaciones": [
    "..."
  ],
  "disclaimer": "..."
}}
"""
        
        try:
            response_text = call_gemini_api(
                prompt=prompt,
                model_name=self.model_name,
                temperature=0.7,  # Más conservador para análisis clínico
                top_p=0.8,
                top_k=30,
                max_output_tokens=3072
            )
            
            # Intentar parsear JSON de la respuesta
            try:
                # Limpiar respuesta (puede tener markdown code blocks)
                cleaned_response = response_text.strip()
                if cleaned_response.startswith('```json'):
                    cleaned_response = cleaned_response[7:]
                elif cleaned_response.startswith('```'):
                    cleaned_response = cleaned_response[3:]
                if cleaned_response.endswith('```'):
                    cleaned_response = cleaned_response[:-3]
                cleaned_response = cleaned_response.strip()
                
                analysis_dict = json.loads(cleaned_response)
                
                # Validar estructura mínima
                required_keys = ['resumen_ejecutivo', 'disclaimer']
                for key in required_keys:
                    if key not in analysis_dict:
                        raise ValueError(f"Falta clave requerida: {key}")
                
                # Agregar metadatos de auditoría
                analysis_dict['generated_at'] = datetime.utcnow().isoformat()
                analysis_dict['model_id'] = self.model_name
                analysis_dict['test_module_code'] = test_module_code
                
                return analysis_dict
            except json.JSONDecodeError as e:
                print(f"Error parseando JSON de Gemini: {e}")
                print(f"Respuesta recibida: {response_text[:500]}")
                # Fallback: retornar análisis básico estructurado
                return self._fallback_clinical_analysis(result_data, raw_response=response_text)
        except Exception as e:
            print(f"Error en Gemini API para análisis clínico: {e}")
            return self._fallback_clinical_analysis(result_data)
    
    def _fallback_clinical_analysis(
        self,
        result_data: Dict[str, Any],
        raw_response: Optional[str] = None
    ) -> Dict[str, Any]:
        """Análisis clínico básico sin IA o cuando falla la IA"""
        module_outcomes = result_data.get('module_outcomes', [])
        provisional_diagnoses = result_data.get('provisional_diagnoses', [])
        quality_checks = result_data.get('quality_checks', {})
        
        positive_modules = [m for m in module_outcomes if m.get('outcome') == 'positive']
        excluded_modules = [m for m in module_outcomes if m.get('excluded', False)]
        
        return {
            'resumen_ejecutivo': (
                f"Evaluación completada con {len(module_outcomes)} módulos. "
                f"{len(positive_modules)} módulos con resultados positivos, "
                f"{len(excluded_modules)} módulos excluidos. "
                f"Se generaron {len(provisional_diagnoses)} diagnósticos provisionales."
            ),
            'modulos_activos': [
                {
                    'module_id': m.get('module_id', 'unknown'),
                    'module_name': m.get('module_name', 'Módulo sin nombre'),
                    'outcome': m.get('outcome', 'unknown'),
                    'explicacion': m.get('reason', 'Sin explicación disponible')
                }
                for m in module_outcomes if m.get('outcome') in ['positive', 'partial', 'excluded']
            ],
            'exclusiones_destacadas': [
                {
                    'tipo': 'substance_related' if 'sustancias' in reason.lower() else 
                            'medical_condition' if 'médica' in reason.lower() else 
                            'other_disorder',
                    'modulo': m.get('module_name', 'Unknown'),
                    'relevancia': 'Revisar en evaluación clínica completa'
                }
                for m in excluded_modules
                for reason in m.get('exclusion_reasons', [])
            ],
            'inconsistencias_detectadas': [
                {
                    'tipo': 'missing_data',
                    'descripcion': item,
                    'sugerencia': 'Completar datos faltantes antes de tomar decisiones clínicas'
                }
                for item in quality_checks.get('missing_data', [])
            ] + [
                {
                    'tipo': 'inconsistency',
                    'descripcion': item,
                    'sugerencia': 'Revisar consistencia de respuestas y considerar re-evaluación'
                }
                for item in quality_checks.get('inconsistencies', [])
            ],
            'consideraciones_diferenciales': [
                {
                    'area': m.get('module_name', 'Unknown'),
                    'sugerencia': f"Considerar evaluación adicional para {m.get('module_name', 'este módulo')}",
                    'nota': 'Esto es una sugerencia, no un diagnóstico'
                }
                for m in positive_modules
            ],
            'preguntas_seguimiento': [
                '¿Hay antecedentes familiares relevantes?',
                '¿Existe historial de tratamientos previos?',
                '¿Hay factores estresantes actuales significativos?'
            ],
            'siguientes_pasos': [
                'Revisar historial clínico completo',
                'Considerar evaluación adicional según módulos positivos',
                'Planificar seguimiento según necesidades identificadas'
            ],
            'limitaciones': [
                'Esta evaluación es un apoyo clínico y no reemplaza la evaluación clínica profesional',
                'Los datos proporcionados pueden ser limitados',
                'Se requiere juicio clínico para interpretar los resultados'
            ],
            'disclaimer': (
                'Este análisis es un apoyo clínico generado por IA. '
                'NO constituye un diagnóstico. '
                'El juicio clínico profesional es esencial para la toma de decisiones. '
                'Siempre considere el contexto completo del paciente y sus circunstancias individuales.'
            ),
            'generated_at': datetime.utcnow().isoformat(),
            'model_id': 'fallback',
            'test_module_code': 'scdf',
            'note': 'Análisis generado sin IA (fallback)' + (f' | Respuesta IA no parseable: {raw_response[:200]}' if raw_response else '')
        }


# Instancia global
gemini_interpreter = GeminiInterpreter()
