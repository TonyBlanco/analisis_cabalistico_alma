"""
Motor de interpretación cabalística con IA (Gemini)
"""
from django.conf import settings
genai = None
import json
from typing import Dict, Any, Optional
from .utils.genai_response import extract_text


class GeminiInterpreter:
    """Intérprete de análisis cabalísticos usando Gemini AI"""
    
    def __init__(self):
        """Inicializa el cliente de Gemini"""
        api_key = settings.GEMINI_API_KEY if hasattr(settings, 'GEMINI_API_KEY') else None
        # Import gemini lazily to avoid import failures when SDK isn't available in environment
        global genai
        try:
            from google import genai as genai_local
            genai = genai_local
        except Exception:
            genai = None
        if api_key and genai:
            try:
                client = genai.Client(api_key=api_key)
                # Usar modelo correcto: gemini-2.0-flash (stable y gratuito)
                model_name = settings.GEMINI_MODEL if hasattr(settings, 'GEMINI_MODEL') else 'gemini-2.0-flash'
                self.model = client.models.generate_content
                self.model_name = model_name
                self.enabled = True
                print(f"✅ Gemini configurado con modelo: {model_name}")
            except Exception as e:
                self.enabled = False
                print(f"⚠️ Error configurando Gemini: {e}")
                print("   Usando interpretaciones locales")
        else:
            self.enabled = False
            print("⚠️ Gemini API key no configurada, usando interpretaciones locales")
    
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
            response = self.model(
                model=self.model_name,
                contents=prompt
            )
            return extract_text(response)
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
            response = self.model(
                model=self.model_name,
                contents=prompt
            )
            return extract_text(response)
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
            response = self.model(
                model=self.model_name,
                contents=prompt
            )
            return extract_text(response)
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
            response = self.model(
                model=self.model_name,
                contents=prompt
            )
            return extract_text(response)
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


# Instancia global
gemini_interpreter = GeminiInterpreter()
