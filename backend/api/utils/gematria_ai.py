"""
Servicio de IA para Interpretación de Gematria
Genera análisis espiritual profundo usando Gemini
"""
import json
from typing import Dict, Any, List, Optional
from django.conf import settings

# Importar Gemini
genai = None
try:
    import google.generativeai as genai_local
    genai = genai_local
except ImportError:
    genai = None


class GematriaAI:
    """Generador de interpretaciones espirituales de Gematria usando IA"""
    
    def __init__(self):
        """Inicializa el cliente de Gemini"""
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-1.5-flash')
        
        self.enabled = False
        self.model = None
        self.error_message = None
        
        if not api_key:
            self.error_message = "GEMINI_API_KEY no está configurada en settings.py"
            print(f"[WARNING] {self.error_message}")
            return
        
        if not genai:
            self.error_message = "Módulo google.generativeai no está instalado. Ejecuta: pip install google-generativeai"
            print(f"[WARNING] {self.error_message}")
            return
        
        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(model_name)
            self.enabled = True
            print(f"[OK] GematriaAI configurado con modelo: {model_name}")
        except Exception as e:
            self.error_message = f"Error configurando Gemini: {str(e)}"
            print(f"[ERROR] {self.error_message}")
            self.enabled = False
    
    def generate_interpretation(
        self,
        word: str,
        ragil: int,
        katan: int,
        gadol: int,
        atbash_value: int,
        resonances: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Genera una interpretación espiritual profunda de los valores de Gematria
        
        Args:
            word: Palabra en hebreo
            ragil: Valor Gematria Ragil
            katan: Valor Gematria Katan
            gadol: Valor Gematria Gadol
            atbash_value: Valor Atbash
            resonances: Lista de palabras con el mismo valor
        
        Returns:
            Dict con la interpretación espiritual
        """
        if not self.enabled:
            error_msg = self.error_message or "Servicio de IA no disponible. Verifica la configuración de GEMINI_API_KEY."
            return {
                "error": error_msg
            }
        
        # Formatear resonancias
        resonances_text = ""
        if resonances:
            resonances_list = []
            for res in resonances[:5]:  # Limitar a 5 para no sobrecargar el prompt
                resonances_list.append(f"- {res.get('word', '')} ({res.get('transliteration', '')}): {res.get('meaning', '')}")
            resonances_text = "\n".join(resonances_list)
        else:
            resonances_text = "No se encontraron resonancias en el diccionario."
        
        # Construir el prompt
        prompt = f"""Actúa como un Maestro Cabalista experto en Gematria y Psicología Transpersonal.

ANÁLISIS DE GEMATRIA:

Palabra en Hebreo: {word}

VALORES CALCULADOS:
- Mispar Ragil (La Realidad): {ragil}
- Mispar Katan (La Esencia): {katan}
- Mispar Gadol (El Potencial): {gadol}
- Atbash (La Sombra): {atbash_value}

RESONANCIAS MÍSTICAS:
{resonances_text}

TU TAREA:
Genera una interpretación espiritual profunda en formato JSON estricto con esta estructura:

{{
  "titulo": "Título poético y místico (ej: 'El Alma que Busca la Unidad')",
  
  "analisis_ragil": {{
    "significado": "Interpretación del valor Ragil ({ragil}) - La Realidad y el Yo Consciente",
    "manifestacion": "Cómo se manifiesta esta energía en el plano físico (Malchut)",
    "mensaje": "Mensaje del alma sobre su identidad consciente"
  }},
  
  "analisis_katan": {{
    "significado": "Interpretación del valor Katan ({katan}) - La Esencia y la Semilla del Alma",
    "leccion": "Lección kármica principal que debe aprender",
    "arquetipo": "Arquetipo espiritual asociado a este número"
  }},
  
  "analisis_gadol": {{
    "significado": "Interpretación del valor Gadol ({gadol}) - El Potencial Máximo",
    "tikun": "Corrección espiritual (Tikún) que debe realizar",
    "evolucion": "Hacia dónde puede evolucionar el alma"
  }},
  
  "analisis_atbash": {{
    "significado": "Interpretación del valor Atbash ({atbash_value}) - La Sombra y lo Oculto",
    "bloqueos": "Bloqueos subconscientes o patrones ocultos revelados",
    "sombra": "Aspectos de la sombra que necesita integrar"
  }},
  
  "sintesis": "Síntesis integradora de todos los valores. Cómo se relacionan Ragil, Katan, Gadol y Atbash para formar un mensaje completo del alma.",
  
  "meditacion": "Una meditación o visualización guiada específica basada en estos valores (2-3 oraciones)",
  
  "accion_espiritual": "Una acción espiritual concreta recomendada (ej: trabajar con un ángel específico, recitar un salmo, etc.)"
}}

IMPORTANTE:
- El JSON debe ser válido y parseable
- Usa un tono místico pero accesible
- Integra la sabiduría cabalística con la psicología transpersonal
- Sé específico y práctico en las recomendaciones
- Responde SOLO con el JSON, sin texto adicional antes o después
"""
        
        try:
            # Generar respuesta con Gemini
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.8,
                    "top_p": 0.9,
                    "top_k": 40,
                    "max_output_tokens": 2048,
                }
            )
            
            # Extraer el texto de la respuesta
            response_text = response.text.strip()
            
            # Limpiar el texto si tiene markdown code blocks
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            elif response_text.startswith('```'):
                response_text = response_text.replace('```', '').strip()
            
            # Parsear el JSON
            try:
                interpretation = json.loads(response_text)
                return interpretation
            except json.JSONDecodeError as e:
                # Si falla el parseo, intentar extraer JSON del texto
                import re
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    interpretation = json.loads(json_match.group())
                    return interpretation
                else:
                    return {
                        "error": f"Error al parsear la respuesta de Gemini: {str(e)}",
                        "raw_response": response_text[:500]  # Primeros 500 caracteres para debug
                    }
        
        except Exception as e:
            return {
                "error": f"Error al generar la interpretación: {str(e)}"
            }


# Instancia global
gematria_ai = GematriaAI()

