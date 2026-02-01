"""
Meditation AI Service — Generador de Meditaciones Cabalísticas con IA

Sistema de generación de meditaciones guiadas usando Gemini AI
con prompt especializado en Cábala Aplicada.

PRINCIPIOS INNEGOCIABLES:
1. La Cábala se presenta como mapa de conciencia, NO como creencia religiosa
2. NO usar dogma, rezos litúrgicos ni promesas milagrosas
3. NO hacer afirmaciones médicas o terapéuticas
4. Lenguaje claro, profundo, humano y universal
5. Los Nombres de Dios son estructuras simbólicas/frecuencias contemplativas,
   NUNCA fórmulas mágicas ni pronunciaciones obligatorias
"""
import json
import logging
from typing import Dict, Any, Optional
from django.conf import settings

logger = logging.getLogger(__name__)

# Import Gemini
genai = None
try:
    from google import genai as genai_local
    genai = genai_local
except ImportError:
    genai = None
from .multi_ai_service import MultiAIService


# ==============================================================================
# DATOS DE SEFIROT PARA MEDITACIONES
# ==============================================================================

SEFIROT_MEDITATION_DATA = {
    'keter': {
        'name': 'Kéter (Corona)',
        'function': 'La voluntad primordial, el punto donde la Nada se convierte en Algo. '
                    'Representa la conexión con lo infinito, la rendición del ego.',
        'psychology': 'La capacidad de soltar el control, confiar en algo mayor que uno mismo, '
                      'acceder a estados de conciencia expandida sin perder el centro.',
        'symbolism': 'Corona blanca brillante sobre la cabeza, luz que desciende, '
                     'espacio infinito silencioso.',
        'divine_name': 'אהיה (Ehyeh) - "Yo Seré/Soy"',
        'divine_meaning': 'El ser que trasciende el tiempo, pura potencialidad antes de toda manifestación.',
        'color': 'Blanco brillante / Luz pura'
    },
    'chokmah': {
        'name': 'Jojmá (Sabiduría)',
        'function': 'El primer destello de intuición, la chispa de insight antes del pensamiento. '
                    'Energía masculina, expansiva, creativa.',
        'psychology': 'Creatividad pura, intuición instantánea, la capacidad de ver lo esencial '
                      'sin análisis. El "¡Ajá!" antes de las palabras.',
        'symbolism': 'Rayo de luz plateada/gris, relámpago de comprensión, '
                     'semilla que contiene todo el árbol.',
        'divine_name': 'יה (Yah)',
        'divine_meaning': 'El impulso creativo primordial, la fuerza vital que inicia todo.',
        'color': 'Gris plateado / Iridiscente'
    },
    'binah': {
        'name': 'Biná (Entendimiento)',
        'function': 'La comprensión que estructura y da forma. Energía femenina, receptiva, '
                    'que procesa y gestalta la intuición de Jojmá.',
        'psychology': 'Capacidad analítica, contemplación profunda, dar sentido a la experiencia. '
                      'El útero donde las ideas toman forma.',
        'symbolism': 'Mar oscuro y profundo, útero cósmico, estructura cristalina.',
        'divine_name': 'יהוה (YHVH) pronunciado Elohim',
        'divine_meaning': 'El poder de dar forma, la matriz de toda creación.',
        'color': 'Negro profundo / Índigo'
    },
    'chesed': {
        'name': 'Jésed (Misericordia/Gracia)',
        'function': 'Amor incondicional, expansión, generosidad sin límites. '
                    'La fuerza que da sin pedir nada a cambio.',
        'psychology': 'Compasión, generosidad, capacidad de amar sin condiciones. '
                      'También el peligro de dar en exceso sin límites.',
        'symbolism': 'Océano azul expansivo, brazos abiertos, lluvia benéfica.',
        'divine_name': 'אל (El)',
        'divine_meaning': 'La bondad infinita que sostiene toda la creación.',
        'color': 'Azul celeste / Azul real'
    },
    'gevurah': {
        'name': 'Gevurá (Fuerza/Juicio)',
        'function': 'Discernimiento, límites necesarios, fuerza para decir no. '
                    'La espada que corta lo innecesario.',
        'psychology': 'Capacidad de poner límites sanos, disciplina, discernimiento. '
                      'También el peligro de rigidez excesiva.',
        'symbolism': 'Fuego rojo, espada flamígera, muro protector.',
        'divine_name': 'אלהים (Elohim)',
        'divine_meaning': 'El poder de definir límites, la justicia que equilibra.',
        'color': 'Rojo / Carmesí'
    },
    'tiferet': {
        'name': 'Tiféret (Belleza/Armonía)',
        'function': 'El corazón del Árbol, donde opuestos se integran. '
                    'Belleza como verdad, equilibrio entre dar y recibir.',
        'psychology': 'El self verdadero, identidad integrada, compasión equilibrada. '
                      'El yo que puede amar sin perderse.',
        'symbolism': 'Sol dorado en el centro del pecho, corazón radiante, arcoíris.',
        'divine_name': 'יהוה (YHVH) - el Tetragramatón',
        'divine_meaning': 'El nombre que une todos los aspectos, la armonía perfecta.',
        'color': 'Amarillo dorado / Oro'
    },
    'netzach': {
        'name': 'Nétzaj (Victoria/Eternidad)',
        'function': 'Persistencia, pasión, deseo de triunfar. '
                    'La fuerza emocional que no se rinde.',
        'psychology': 'Motivación, pasión, resistencia emocional. '
                      'También el peligro de impulsividad y apego excesivo.',
        'symbolism': 'Rosa verde, naturaleza exuberante, danza apasionada.',
        'divine_name': 'יהוה צבאות (YHVH Tzevaot)',
        'divine_meaning': 'La fuerza que persiste a través de todos los obstáculos.',
        'color': 'Verde esmeralda'
    },
    'hod': {
        'name': 'Hod (Gloria/Esplendor)',
        'function': 'Intelecto aplicado, comunicación, humildad del conocedor. '
                    'La mente que sirve al corazón.',
        'psychology': 'Pensamiento estructurado, comunicación clara, aceptación de límites. '
                      'También el peligro de sobre-intelectualización.',
        'symbolism': 'Mercurio líquido, libro abierto, palabras luminosas.',
        'divine_name': 'אלהים צבאות (Elohim Tzevaot)',
        'divine_meaning': 'La inteligencia que organiza y comunica la verdad.',
        'color': 'Naranja / Ámbar'
    },
    'yesod': {
        'name': 'Yesod (Fundamento)',
        'function': 'La base que conecta arriba con abajo. Inconsciente, sueños, '
                    'sexualidad, imaginación creativa.',
        'psychology': 'Vida emocional profunda, creatividad, conexión con el inconsciente. '
                      'La capacidad de fundar y sostener.',
        'symbolism': 'Luna plateada, espejo de aguas, raíces profundas.',
        'divine_name': 'שדי אל חי (Shaddai El Chai)',
        'divine_meaning': 'El Todopoderoso Viviente, la fuerza vital que funda toda existencia.',
        'color': 'Violeta / Púrpura'
    },
    'malkuth': {
        'name': 'Maljut (Reino)',
        'function': 'La manifestación final, el cuerpo, la tierra, el aquí y ahora. '
                    'Donde todo lo espiritual se hace concreto.',
        'psychology': 'Presencia, enraizamiento, capacidad de manifestar en lo concreto. '
                      'El cuerpo como templo sagrado.',
        'symbolism': 'Tierra fértil, árbol con raíces profundas, trono en la tierra.',
        'divine_name': 'אדני (Adonai)',
        'divine_meaning': 'El Señor que habita en lo material, la presencia divina en lo cotidiano.',
        'color': 'Marrón/Tierra y los cuatro colores elementales'
    }
}

MEDITATION_TYPES = {
    'equilibrio': {
        'name': 'Equilibrio',
        'description': 'Balancear excesos o deficiencias de la Sefirá',
        'focus': 'encontrar el punto medio entre los extremos, '
                 'conectar con la Sefirá complementaria'
    },
    'fortalecimiento': {
        'name': 'Fortalecimiento', 
        'description': 'Potenciar cualidades de la Sefirá',
        'focus': 'activar y amplificar las cualidades positivas, '
                 'integrar la energía en la vida diaria'
    },
    'sanacion': {
        'name': 'Sanación',
        'description': 'Sanar bloqueos o heridas asociadas',
        'focus': 'liberar patrones limitantes, sanar memorias asociadas, '
                 'restaurar el flujo natural de la energía'
    },
    'integracion': {
        'name': 'Integración',
        'description': 'Integrar luz y sombra de la Sefirá',
        'focus': 'reconocer y abrazar tanto la expresión positiva como la sombra, '
                 'transformar lo reprimido en recurso'
    }
}


# ==============================================================================
# PROMPT SYSTEM
# ==============================================================================

SYSTEM_PROMPT = """Actúa como un Arquitecto de Meditación Cabalística Aplicada.

Eres experto en:
- Cábala clásica (Zóhar, Isaac Luria – El Ari, Moshe Cordovero, Rab Ashlag, Rabash)
- Psicología simbólica del Árbol de la Vida
- Diseño de meditaciones guiadas holísticas, no religiosas y no clínicas

PRINCIPIOS INNEGOCIABLES:
1. La Cábala se presenta como mapa de conciencia, NO como creencia religiosa
2. NO usar dogma, rezos litúrgicos ni promesas milagrosas
3. NO hacer afirmaciones médicas o terapéuticas
4. Lenguaje claro, profundo, humano y universal

Los Nombres de Dios se tratan como:
- Estructuras simbólicas de conciencia
- Frecuencias contemplativas
- NUNCA como fórmulas mágicas ni pronunciaciones obligatorias

Cada meditación debe:
- Estar alineada con la Sefirá seleccionada
- Adaptarse al tipo de meditación
- Respetar ESTRICTAMENTE la duración solicitada
- Ser coherente, fluida y aplicable a la vida diaria
- Poder leerse en voz alta como una meditación guiada

FORMATO DE RESPUESTA (JSON):
{
    "title": "Título descriptivo de la meditación",
    "opening": "Texto de apertura y enraizamiento (1-2 párrafos)",
    "sefira_explanation": "Explicación breve y clara de la sefirá trabajada (1 párrafo)",
    "breathing_exercise": "Ejercicio de respiración si fue solicitado (o null)",
    "activation": "Activación simbólica mediante respiración y conciencia (2-3 párrafos)",
    "divine_name_contemplation": "Contemplación del Nombre de Dios - visualizado, no pronunciado (1-2 párrafos)",
    "visualization": "Visualización guiada si fue solicitada (o null)",
    "integration": "Integración emocional y práctica para la vida cotidiana (1-2 párrafos)",
    "closing": "Cierre con silencio, gratitud y estabilidad interior (1 párrafo)",
    "practice_tips": ["consejo 1", "consejo 2", "consejo 3"],
    "best_time": "Mejor momento del día para esta práctica"
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional."""


def build_meditation_prompt(
    sefira: str,
    meditation_type: str,
    duration_minutes: int,
    include_breathing: bool,
    include_visualization: bool,
    personal_intention: str = ""
) -> str:
    """Construye el prompt dinámico para generar meditación."""
    
    sefira_data = SEFIROT_MEDITATION_DATA.get(sefira, {})
    type_data = MEDITATION_TYPES.get(meditation_type, {})
    
    prompt = f"""Genera una meditación cabalística guiada con los siguientes parámetros:

SEFIRÁ PRINCIPAL:
{sefira_data.get('name', sefira)}

Función espiritual: {sefira_data.get('function', 'N/A')}
Aspecto psicológico: {sefira_data.get('psychology', 'N/A')}
Simbolismo: {sefira_data.get('symbolism', 'N/A')}
Nombre de Dios asociado: {sefira_data.get('divine_name', 'N/A')} - {sefira_data.get('divine_meaning', '')}
Color: {sefira_data.get('color', 'N/A')}

TIPO DE MEDITACIÓN:
{type_data.get('name', meditation_type)} - {type_data.get('description', '')}
Enfoque: {type_data.get('focus', '')}

DURACIÓN TOTAL:
{duration_minutes} minutos (ajusta el ritmo y profundidad a esta duración)

OPCIONES ACTIVAS:
- Ejercicio de respiración: {'SÍ - incluir' if include_breathing else 'NO - omitir campo breathing_exercise'}
- Visualización guiada: {'SÍ - incluir' if include_visualization else 'NO - omitir campo visualization'}

INTENCIÓN PERSONAL DEL CONSULTANTE:
{personal_intention if personal_intention else '(Sin intención específica - meditación general)'}

ESTRUCTURA OBLIGATORIA:
1. Apertura suave y enraizamiento (Maljut siempre presente al inicio)
2. Explicación breve y clara de la sefirá trabajada
3. Activación simbólica de la sefirá mediante respiración y conciencia
4. Contemplación del Nombre de Dios relacionado (visualizado, NO pronunciado)
5. Integración emocional y práctica en la vida cotidiana
6. Cierre con silencio, gratitud y estabilidad interior

REQUISITOS:
- Ajustar ritmo y profundidad a {duration_minutes} minutos
- Usar lenguaje meditativo, lento y claro
- NO mencionar instrucciones técnicas ni referencias a IA
- El texto debe poder leerse en voz alta como meditación guiada

Responde SOLO con el JSON estructurado."""

    return prompt


# ==============================================================================
# MEDITATION AI SERVICE CLASS
# ==============================================================================

class MeditationAIService:
    """Servicio de IA para generar meditaciones cabalísticas."""
    
    def __init__(self):
        """Initialize Gemini client."""
        groq_key = getattr(settings, 'GROQ_API_KEY', '')
        self.enabled = False
        self.error_message = None
        self._use_multi = False

        if groq_key:
            try:
                self.client = MultiAIService(preferred_provider='groq')
                self._use_multi = True
                self.enabled = True
                logger.info("MeditationAIService configured using MultiAIService (GROQ preferred)")
                return
            except Exception as e:
                self.error_message = f"Error initializing MultiAIService: {e}"
                logger.warning(self.error_message)

        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-1.5-flash')

        if not api_key:
            self.error_message = "GEMINI_API_KEY not configured"
            logger.warning(self.error_message)
            return

        if not genai:
            self.error_message = "google.genai module not installed"
            logger.warning(self.error_message)
            return

        try:
            self.client = genai.Client(api_key=api_key)
            self.model_name = model_name
            self.enabled = True
            logger.info(f"MeditationAIService configured with model: {model_name}")
        except Exception as e:
            self.error_message = f"Error configuring Gemini: {str(e)}"
            logger.error(self.error_message)
            self.enabled = False
    
    def generate_meditation(
        self,
        target_sefira: str,
        meditation_type: str,
        duration_minutes: int = 10,
        include_breathing: bool = True,
        include_visualization: bool = True,
        personal_intention: str = ""
    ) -> Dict[str, Any]:
        """
        Genera una meditación personalizada usando IA.
        
        Args:
            target_sefira: Sefirá objetivo (keter, chokmah, etc.)
            meditation_type: Tipo (equilibrio, fortalecimiento, sanacion, integracion)
            duration_minutes: Duración estimada (5-60 min)
            include_breathing: Incluir ejercicio de respiración
            include_visualization: Incluir visualización
            personal_intention: Intención personal del consultante
            
        Returns:
            Dict con contenido completo de la meditación
        """
        if not self.enabled:
            raise RuntimeError(f"MeditationAIService not enabled: {self.error_message}")
        
        # Validaciones
        if target_sefira not in SEFIROT_MEDITATION_DATA:
            raise ValueError(f"Sefirá inválida: {target_sefira}")
        
        if meditation_type not in MEDITATION_TYPES:
            raise ValueError(f"Tipo de meditación inválido: {meditation_type}")
        
        duration_minutes = max(5, min(60, duration_minutes))
        
        # Construir prompts
        user_prompt = build_meditation_prompt(
            sefira=target_sefira,
            meditation_type=meditation_type,
            duration_minutes=duration_minutes,
            include_breathing=include_breathing,
            include_visualization=include_visualization,
            personal_intention=personal_intention
        )
        
        try:
            if self._use_multi and isinstance(self.client, MultiAIService):
                # Usar prompt compuesto como texto para MultiAIService
                result = self.client.generate(user_prompt, temperature=0.7, max_tokens=4096, top_p=0.85)
                if not result.get('success'):
                    raise RuntimeError(result.get('error', 'MultiAIService error'))
                response_text = result.get('text', '')
            else:
                # Llamar a Gemini
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=[
                        {"role": "user", "parts": [{"text": SYSTEM_PROMPT}]},
                        {"role": "model", "parts": [{"text": "Entendido. Estoy listo para generar meditaciones cabalísticas siguiendo la estructura y principios indicados. Por favor, proporciona los parámetros."}]},
                        {"role": "user", "parts": [{"text": user_prompt}]}
                    ],
                    config={
                        "temperature": 0.7,
                        "top_p": 0.85,
                        "max_output_tokens": 4096,
                    }
                )
                
                # Extraer texto
                response_text = ""
                if hasattr(response, 'text'):
                    response_text = response.text
                elif hasattr(response, 'candidates') and response.candidates:
                    candidate = response.candidates[0]
                    if hasattr(candidate, 'content') and candidate.content.parts:
                        response_text = candidate.content.parts[0].text
            
            if not response_text:
                raise RuntimeError("No se recibió respuesta de la IA")
            
            # Limpiar y parsear JSON
            response_text = response_text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            meditation_content = json.loads(response_text)
            
            # Añadir metadata
            sefira_data = SEFIROT_MEDITATION_DATA[target_sefira]
            type_data = MEDITATION_TYPES[meditation_type]
            
            meditation_content['sefira'] = target_sefira
            meditation_content['sefira_name'] = sefira_data['name']
            meditation_content['type'] = meditation_type
            meditation_content['type_name'] = type_data['name']
            meditation_content['duration_minutes'] = duration_minutes
            meditation_content['divine_name'] = sefira_data.get('divine_name', '')
            meditation_content['color'] = sefira_data.get('color', '')
            meditation_content['generated_by_ai'] = True
            
            return meditation_content
            
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing AI response as JSON: {e}")
            logger.error(f"Raw response: {response_text[:500]}")
            raise RuntimeError(f"La IA no devolvió un formato válido: {str(e)}")
        except Exception as e:
            logger.error(f"Error generating meditation: {str(e)}")
            raise


# Singleton instance
meditation_ai_service = MeditationAIService()
