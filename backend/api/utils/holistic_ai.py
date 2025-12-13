"""
Servicio de IA Holística para Terapeutas
Integra Psicología, Cábala y Astrología en un solo reporte generado por Gemini
"""
import json
import re
from typing import Dict, Any, List
from django.conf import settings
from .gemini_rest import call_gemini_api, parse_gemini_json


class HolisticTherapistAI:
    """Generador de reportes holísticos integrando Psicología, Cábala y Astrología"""
    
    def __init__(self):
        """Inicializa el cliente de Gemini"""
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-1.5-flash')
        
        self.enabled = False
        self.model_name = model_name
        self.error_message = None
        
        if not api_key:
            self.error_message = "GEMINI_API_KEY no está configurada en settings.py"
            print(f"[WARNING] {self.error_message}")
            return
        
        self.enabled = True
        print(f"[OK] HolisticTherapistAI configurado con modelo: {model_name} (Google GenAI SDK)")
    
    def _format_test_history(self, test_results: List[Dict[str, Any]]) -> str:
        """Formatea el historial de tests para el prompt"""
        if not test_results:
            return "No hay tests realizados aún."
        
        formatted = []
        for test in test_results:
            test_id = test.get('test_id', 'Desconocido')
            test_name = test.get('test_name', test_id)
            score = test.get('score', 'N/A')
            diagnosis = test.get('clinical_diagnosis', 'Sin diagnóstico')
            angel = test.get('angel_remedy', 'No asignado')
            
            formatted.append(f"- {test_name}: {diagnosis} (Score: {score}, Ángel: {angel})")
        
        return "\n".join(formatted)
    
    def _calculate_zodiac_sign(self, birth_date: str) -> str:
        """Calcula el signo zodiacal a partir de la fecha de nacimiento"""
        try:
            from datetime import datetime
            date_obj = datetime.strptime(birth_date, '%Y-%m-%d')
            month = date_obj.month
            day = date_obj.day
            
            if (month == 3 and day >= 21) or (month == 4 and day <= 19):
                return "Aries"
            elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
                return "Tauro"
            elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
                return "Géminis"
            elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
                return "Cáncer"
            elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
                return "Leo"
            elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
                return "Virgo"
            elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
                return "Libra"
            elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
                return "Escorpio"
            elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
                return "Sagitario"
            elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
                return "Capricornio"
            elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
                return "Acuario"
            else:
                return "Piscis"
        except:
            return "Desconocido"
    
    def _calculate_age(self, birth_date: str) -> int:
        """Calcula la edad a partir de la fecha de nacimiento"""
        try:
            from datetime import datetime
            today = datetime.now()
            birth = datetime.strptime(birth_date, '%Y-%m-%d')
            age = today.year - birth.year
            if (today.month, today.day) < (birth.month, birth.day):
                age -= 1
            return age
        except:
            return 0
    
    def generate_report(
        self,
        patient_data: Dict[str, Any],
        test_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Genera un reporte holístico integrando Psicología, Cábala y Astrología
        
        Args:
            patient_data: Diccionario con datos del paciente
            test_history: Lista de resultados de tests realizados
        
        Returns:
            Dict con el plan de tratamiento holístico en formato JSON
        """
        if not self.enabled:
            error_msg = self.error_message or "Servicio de IA no disponible. Verifica la configuración de GEMINI_API_KEY."
            return {
                "error": error_msg
            }
        
        # Extraer datos del paciente
        name = patient_data.get('full_name', patient_data.get('first_name', 'Paciente'))
        birth_date = patient_data.get('birth_date', '')
        age = self._calculate_age(birth_date) if birth_date else 0
        zodiac_sign = self._calculate_zodiac_sign(birth_date) if birth_date else 'Desconocido'
        main_complaint = patient_data.get('main_complaint', 'No especificado')
        clinical_history = patient_data.get('clinical_history', '')
        therapy_level = patient_data.get('therapy_level', '')
        
        # Formatear historial de tests
        test_history_summary = self._format_test_history(test_history)
        
        # Construir el prompt
        prompt = f"""Actúa como un Terapeuta experto en Cábala, Psicología y Medicina Integrativa.

PACIENTE:
- Nombre: {name}
- Edad: {age} años
- Signo Zodiacal: {zodiac_sign}
- Nivel de Terapia: {therapy_level if therapy_level else 'No asignado'}
- Motivo de Consulta: {main_complaint}
- Historial Clínico: {clinical_history if clinical_history else 'No disponible'}

HISTORIAL DE TESTS REALIZADOS:
{test_history_summary}

TU TAREA:
Genera un Plan de Tratamiento Holístico en formato JSON estricto con esta estructura exacta:

{{
  "sintesis_diagnostica": "Un párrafo breve (2-3 oraciones) integrando lo clínico con lo espiritual. Ejemplo: 'La ansiedad severa detectada en GAD-7 proviene de un bloqueo energético en la Sefirá Netzach (Victoria), relacionado con conflictos de territorio y control. El Ángel Caliel puede ayudar a restaurar la verdad y la justicia interna.'",
  
  "estrategia_clinica": [
    "Paso 1: Estabilización inmediata (ej: Técnicas de respiración, mindfulness)",
    "Paso 2: Trabajo emocional (ej: Identificar patrones de pensamiento)",
    "Paso 3: Integración espiritual (ej: Meditación con el Ángel asignado)"
  ],
  
  "receta_cabalistica": {{
    "meditacion_nombre": "Nombre de la meditación específica (ej: 'Meditación de Netzach con Caliel')",
    "meditacion_instruccion": "Instrucción breve y práctica para la meditación (2-3 oraciones)",
    "salmo": "Número del salmo sugerido (ej: '23' o '91')",
    "sefira_recomendada": "Nombre de la Sefirá a trabajar (ej: 'Netzach', 'Tiferet')",
    "angel_asignado": "Nombre del Ángel recomendado basado en los tests"
  }},
  
  "receta_natural": {{
    "aceites_esenciales": ["Aceite 1 (ej: Lavanda)", "Aceite 2 (ej: Manzanilla)"],
    "flores_bach": ["Flor 1 (ej: Rescue Remedy)", "Flor 2 (ej: Mimulus)"],
    "uso": "Instrucción breve de cómo usar los aceites y flores (2-3 oraciones)"
  }},
  
  "biodecodificacion": "Conflicto emocional raíz probable basado en los síntomas y el signo zodiacal. Ejemplo: 'Conflicto de separación brutal (PTSD) o necesidad de control territorial (Ansiedad)'"
}}

IMPORTANTE:
- El JSON debe ser válido y parseable
- Usa información real de los tests realizados
- Integra la sabiduría cabalística con la psicología clínica
- Considera el signo zodiacal para personalizar las recomendaciones
- Sé específico y práctico en las recomendaciones
- Responde SOLO con el JSON, sin texto adicional antes o después
"""
        
        try:
            # Generar respuesta con Gemini usando API REST
            response_text = call_gemini_api(
                prompt=prompt,
                model_name=self.model_name,
                temperature=0.7,
                top_p=0.8,
                top_k=40,
                max_output_tokens=2048
            )
            
            # Parsear el JSON usando la función helper robusta
            try:
                plan = parse_gemini_json(response_text)
                return plan
            except ValueError as e:
                return {
                    "error": f"Error al parsear la respuesta de Gemini: {str(e)}",
                    "raw_response": response_text[:500]  # Primeros 500 caracteres para debug
                }
        
        except Exception as e:
            return {
                "error": f"Error al generar el reporte: {str(e)}"
            }


# Instancia global
holistic_ai = HolisticTherapistAI()

