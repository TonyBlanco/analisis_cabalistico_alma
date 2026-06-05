"""
Servicio de IA Holística para Terapeutas
Integra Psicología, Cábala y Astrología en un solo reporte vía router unificado.
"""
import json
import re
from typing import Dict, Any, List

from api.ai.llm_bridge import generate_text, is_llm_available, unavailable_message


class HolisticTherapistAI:
    """Generador de reportes holísticos integrando Psicología, Cábala y Astrología"""

    def __init__(self):
        self.enabled = is_llm_available()
        self.error_message = None if self.enabled else unavailable_message()

    def _format_test_history(self, test_results: List[Dict[str, Any]]) -> str:
        if not test_results:
            return "No hay tests realizados aún."
        formatted = []
        for test in test_results:
            test_name = test.get('test_name', test.get('test_id', 'Desconocido'))
            score = test.get('score', 'N/A')
            diagnosis = test.get('clinical_diagnosis', 'Sin diagnóstico')
            angel = test.get('angel_remedy', 'No asignado')
            formatted.append(f"- {test_name}: {diagnosis} (Score: {score}, Ángel: {angel})")
        return "\n".join(formatted)

    def _calculate_zodiac_sign(self, birth_date: str) -> str:
        try:
            from datetime import datetime
            date_obj = datetime.strptime(birth_date, '%Y-%m-%d')
            month, day = date_obj.month, date_obj.day
            if (month == 3 and day >= 21) or (month == 4 and day <= 19):
                return "Aries"
            if (month == 4 and day >= 20) or (month == 5 and day <= 20):
                return "Tauro"
            if (month == 5 and day >= 21) or (month == 6 and day <= 20):
                return "Géminis"
            if (month == 6 and day >= 21) or (month == 7 and day <= 22):
                return "Cáncer"
            if (month == 7 and day >= 23) or (month == 8 and day <= 22):
                return "Leo"
            if (month == 8 and day >= 23) or (month == 9 and day <= 22):
                return "Virgo"
            if (month == 9 and day >= 23) or (month == 10 and day <= 22):
                return "Libra"
            if (month == 10 and day >= 23) or (month == 11 and day <= 21):
                return "Escorpio"
            if (month == 11 and day >= 22) or (month == 12 and day <= 21):
                return "Sagitario"
            if (month == 12 and day >= 22) or (month == 1 and day <= 19):
                return "Capricornio"
            if (month == 1 and day >= 20) or (month == 2 and day <= 18):
                return "Acuario"
            return "Piscis"
        except Exception:
            return "Desconocido"

    def _calculate_age(self, birth_date: str) -> int:
        try:
            from datetime import datetime
            today = datetime.now()
            birth = datetime.strptime(birth_date, '%Y-%m-%d')
            age = today.year - birth.year
            if (today.month, today.day) < (birth.month, birth.day):
                age -= 1
            return age
        except Exception:
            return 0

    def generate_report(
        self,
        patient_data: Dict[str, Any],
        test_history: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        if not self.enabled:
            return {"error": self.error_message or unavailable_message()}

        name = patient_data.get('full_name', patient_data.get('first_name', 'Paciente'))
        birth_date = patient_data.get('birth_date', '')
        age = self._calculate_age(birth_date) if birth_date else 0
        zodiac_sign = self._calculate_zodiac_sign(birth_date) if birth_date else 'Desconocido'
        main_complaint = patient_data.get('main_complaint', 'No especificado')
        clinical_history = patient_data.get('clinical_history', '')
        therapy_level = patient_data.get('therapy_level', '')
        test_history_summary = self._format_test_history(test_history)

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

Genera un Plan de Tratamiento Holístico en JSON estricto con: sintesis_diagnostica, estrategia_clinica (array),
receta_cabalistica (objeto), receta_natural (objeto), biodecodificacion.
Responde SOLO JSON válido, sin markdown."""

        result = generate_text(prompt, temperature=0.7, max_tokens=2048)
        if not result.get('success'):
            return {"error": result.get('error') or 'Error de IA'}

        response_text = (result.get('text') or '').strip()
        if response_text.startswith('```json'):
            response_text = response_text.replace('```json', '').replace('```', '').strip()
        elif response_text.startswith('```'):
            response_text = response_text.replace('```', '').strip()

        try:
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return {
                "error": f"Error al parsear la respuesta de IA: {str(e)}",
                "raw_response": response_text[:500],
                "provider": result.get('provider'),
            }


holistic_ai = HolisticTherapistAI()