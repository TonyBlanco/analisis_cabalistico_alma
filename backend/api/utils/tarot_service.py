"""
Servicio de Análisis de Tarot Terapéutico Cruzado
Combina el Arcano de Vida del paciente con su estado clínico actual
"""
import json
from typing import Dict, Any, Optional
from django.conf import settings
from datetime import datetime
from .genai_response import extract_text
from .multi_ai_service import MultiAIService

# Importar Gemini
genai = None
try:
    from google import genai as genai_local
    genai = genai_local
except ImportError:
    genai = None


def calculate_life_arcana(birth_date: str) -> int:
    """
    Calcula el Arcano de Vida basado en la fecha de nacimiento
    Fórmula: Suma todos los dígitos de la fecha -> Reduce a 1-22
    """
    try:
        # Parsear fecha
        if isinstance(birth_date, str):
            date_obj = datetime.strptime(birth_date, '%Y-%m-%d')
        else:
            date_obj = birth_date
        
        # Extraer día, mes y año
        day = date_obj.day
        month = date_obj.month
        year = date_obj.year
        
        # Sumar todos los dígitos
        def sum_digits(n):
            return sum(int(d) for d in str(n))
        
        total = sum_digits(day) + sum_digits(month) + sum_digits(year)
        
        # Reducir a 1-22
        while total > 22:
            total = sum_digits(total)
        
        # Si es 0, retornar 0 (El Loco)
        if total == 0:
            return 0
        
        return total
    except Exception as e:
        print(f"[ERROR] Error calculando Arcano de Vida: {e}")
        return None


# Mapeo de Arcanos (0-21)
ARCANA_MAP = {
    0: {'name': 'El Loco', 'hebrew': 'א', 'path': 'Keter → Chokmah'},
    1: {'name': 'El Mago', 'hebrew': 'ב', 'path': 'Keter → Binah'},
    2: {'name': 'La Sacerdotisa', 'hebrew': 'ג', 'path': 'Keter → Tiferet'},
    3: {'name': 'La Emperatriz', 'hebrew': 'ד', 'path': 'Chokmah → Binah'},
    4: {'name': 'El Emperador', 'hebrew': 'ה', 'path': 'Chokmah → Tiferet'},
    5: {'name': 'El Hierofante', 'hebrew': 'ו', 'path': 'Chokmah → Chesed'},
    6: {'name': 'Los Enamorados', 'hebrew': 'ז', 'path': 'Binah → Tiferet'},
    7: {'name': 'El Carro', 'hebrew': 'ח', 'path': 'Binah → Gevurah'},
    8: {'name': 'La Fuerza', 'hebrew': 'ט', 'path': 'Chesed → Gevurah'},
    9: {'name': 'El Ermitaño', 'hebrew': 'י', 'path': 'Chesed → Tiferet'},
    10: {'name': 'La Rueda de la Fortuna', 'hebrew': 'כ', 'path': 'Chesed → Netzach'},
    11: {'name': 'La Justicia', 'hebrew': 'ל', 'path': 'Gevurah → Tiferet'},
    12: {'name': 'El Colgado', 'hebrew': 'מ', 'path': 'Gevurah → Hod'},
    13: {'name': 'La Muerte', 'hebrew': 'נ', 'path': 'Tiferet → Netzach'},
    14: {'name': 'La Templanza', 'hebrew': 'ס', 'path': 'Tiferet → Yesod'},
    15: {'name': 'El Diablo', 'hebrew': 'ע', 'path': 'Tiferet → Hod'},
    16: {'name': 'La Torre', 'hebrew': 'פ', 'path': 'Netzach → Hod'},
    17: {'name': 'La Estrella', 'hebrew': 'צ', 'path': 'Netzach → Yesod'},
    18: {'name': 'La Luna', 'hebrew': 'ק', 'path': 'Netzach → Malkuth'},
    19: {'name': 'El Sol', 'hebrew': 'ר', 'path': 'Hod → Yesod'},
    20: {'name': 'El Juicio', 'hebrew': 'ש', 'path': 'Hod → Malkuth'},
    21: {'name': 'El Mundo', 'hebrew': 'ת', 'path': 'Yesod → Malkuth'},
}


class TarotTherapeuticAI:
    """Generador de análisis terapéutico cruzado usando Tarot + Estado Clínico"""
    
    def __init__(self):
        """Inicializa el cliente de Gemini"""
        groq_key = getattr(settings, 'GROQ_API_KEY', '')
        self.enabled = False
        self.model = None
        self.error_message = None
        self._use_multi = False

        if groq_key:
            try:
                self.client = MultiAIService(preferred_provider='groq')
                self._use_multi = True
                self.enabled = True
                print('[OK] TarotTherapeuticAI configured using MultiAIService (GROQ preferred)')
                return
            except Exception as e:
                self.error_message = f"Error initializing MultiAIService: {e}"
                print(f"[WARNING] {self.error_message}")

        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-1.5-flash')

        if not api_key:
            self.error_message = "GEMINI_API_KEY no está configurada en settings.py"
            print(f"[WARNING] {self.error_message}")
            return

        if not genai:
            self.error_message = "Módulo google.genai no está instalado. Ejecuta: pip install google-genai"
            print(f"[WARNING] {self.error_message}")
            return

        try:
            self.client = genai.Client(api_key=api_key)
            self.model = self.client.models.generate_content
            self.model_name = model_name
            self.enabled = True
            print(f"[OK] TarotTherapeuticAI configurado con modelo: {model_name}")
        except Exception as e:
            self.error_message = f"Error configurando Gemini: {str(e)}"
            print(f"[ERROR] {self.error_message}")
            self.enabled = False
    
    def analyze_archetype_vs_clinical(
        self,
        arcana_number: int,
        arcana_name: str,
        hebrew_letter: str,
        test_name: str,
        clinical_severity: str,
        patient_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analiza cómo el arquetipo del Tarot está afectando negativamente (Sombra)
        y propone acciones de sanación específicas
        
        Args:
            arcana_number: Número del arcano (0-21)
            arcana_name: Nombre del arcano (ej: "El Loco")
            hebrew_letter: Letra hebrea correspondiente
            test_name: Nombre del test clínico (ej: "GAD-7")
            clinical_severity: Severidad clínica (ej: "Ansiedad Severa")
            patient_name: Nombre del paciente (opcional)
        
        Returns:
            Dict con el análisis y acciones de sanación
        """
        if not self.enabled:
            error_msg = self.error_message or "Servicio de IA no disponible. Verifica la configuración de GEMINI_API_KEY."
            return {
                "error": error_msg
            }
        
        # Construir el prompt
        patient_context = f" del paciente {patient_name}" if patient_name else ""
        prompt = f"""Actúa como un Terapeuta Experto en Psicología Transpersonal y Cábala.

CONTEXTO DEL PACIENTE{patient_context}:
- Arquetipo de Tarot (Arcano de Vida): {arcana_number} - {arcana_name} (Letra Hebrea: {hebrew_letter})
- Estado Clínico Actual: {test_name} con resultado: {clinical_severity}

TU TAREA:
Analiza cómo el arquetipo {arcana_name} está manifestándose en su "Sombra" (aspecto negativo/desbalanceado) y cómo esto está provocando o agravando el síntoma clínico {clinical_severity}.

Genera una respuesta en formato JSON estricto con esta estructura:

{{
  "analisis_sombra": "Explicación detallada (2-3 párrafos) de cómo el arquetipo {arcana_name} en su aspecto sombra está relacionado con {clinical_severity}. Explica la conexión entre el bloqueo en el sendero del Árbol de la Vida y el síntoma clínico.",
  
  "acciones_sanadoras": [
    {{
      "titulo": "Título de la acción 1",
      "descripcion": "Descripción detallada de la acción terapéutica concreta",
      "tipo": "Tipo de terapia (ej: Meditación, Trabajo con Ángeles, Biomagnetismo, etc.)"
    }},
    {{
      "titulo": "Título de la acción 2",
      "descripcion": "Descripción detallada de la acción terapéutica concreta",
      "tipo": "Tipo de terapia"
    }},
    {{
      "titulo": "Título de la acción 3",
      "descripcion": "Descripción detallada de la acción terapéutica concreta",
      "tipo": "Tipo de terapia"
    }}
  ],
  
  "mensaje_integrador": "Un mensaje final integrador (1-2 oraciones) que conecte el arquetipo, el síntoma y el camino de sanación."
}}

IMPORTANTE:
- El JSON debe ser válido y parseable
- Sé específico y práctico en las acciones de sanación
- Integra la sabiduría cabalística con la psicología clínica
- Las acciones deben ser concretas y aplicables
- Responde SOLO con el JSON, sin texto adicional antes o después
"""
        
        try:
            if self._use_multi and isinstance(self.client, MultiAIService):
                result = self.client.generate(prompt, temperature=0.8, max_tokens=2048, top_p=0.9)
                if not result.get('success'):
                    return {"error": result.get('error', 'MultiAIService error')}
                response_text = result.get('text', '').strip()
            else:
                # Generar respuesta con Gemini
                response = self.model(
                    model=self.model_name,
                    contents=prompt,
                    config={
                        "temperature": 0.8,
                        "top_p": 0.9,
                        "top_k": 40,
                        "max_output_tokens": 2048,
                    }
                )
                # Extraer el texto de la respuesta
                response_text = extract_text(response).strip()
            
            # Limpiar el texto si tiene markdown code blocks
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            elif response_text.startswith('```'):
                response_text = response_text.replace('```', '').strip()
            
            # Parsear el JSON
            try:
                analysis = json.loads(response_text)
                return analysis
            except json.JSONDecodeError as e:
                # Si falla el parseo, intentar extraer JSON del texto
                import re
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    analysis = json.loads(json_match.group())
                    return analysis
                else:
                    return {
                        "error": f"Error al parsear la respuesta de Gemini: {str(e)}",
                        "raw_response": response_text[:500]
                    }
        
        except Exception as e:
            return {
                "error": f"Error al generar el análisis: {str(e)}"
            }


# Instancia global
tarot_ai = TarotTherapeuticAI()


def analyze_archetype_vs_clinical(patient, birth_date: str) -> Dict[str, Any]:
    """
    Función principal para analizar el arquetipo vs estado clínico
    
    Args:
        patient: Instancia del modelo Patient
        birth_date: Fecha de nacimiento en formato YYYY-MM-DD
    
    Returns:
        Dict con el análisis completo
    """
    # Paso A: Calcular Arcano de Vida
    arcana_number = calculate_life_arcana(birth_date)
    
    if arcana_number is None:
        return {
            "error": "No se pudo calcular el Arcano de Vida. Verifica la fecha de nacimiento."
        }
    
    arcana_info = ARCANA_MAP.get(arcana_number)
    if not arcana_info:
        return {
            "error": f"Arcano {arcana_number} no encontrado en el mapa."
        }
    
    # Paso B: Buscar último test clínico
    try:
        from api.test_models import TestResult
    except ImportError:
        # Intentar import alternativo
        from api.models import TestResult
    
    # Buscar tests del paciente
    test_results = TestResult.objects.filter(
        patient=patient
    ).order_by('-created_at')
    
    # Si no hay tests del paciente, buscar por usuario
    if not test_results.exists() and patient.user:
        test_results = TestResult.objects.filter(
            user=patient.user
        ).order_by('-created_at')
    
    if not test_results.exists():
        return {
            "error": "No se encontraron tests clínicos para este paciente. Realiza al menos un test antes de generar el análisis de Tarot."
        }
    
    # Obtener el test más reciente
    latest_test = test_results.first()
    
    # Extraer nombre del test y severidad clínica
    test_name = getattr(latest_test, 'test_name', None) or latest_test.test_id or "Test Clínico"
    
    # Intentar obtener diagnóstico clínico de diferentes campos posibles
    clinical_severity = (
        getattr(latest_test, 'clinical_diagnosis', None) or
        (latest_test.result_data.get('clinical_diagnosis') if latest_test.result_data else None) or
        (latest_test.result_data.get('diagnostico_clinico') if latest_test.result_data else None) or
        "Sin diagnóstico específico"
    )
    
    # Paso C: Consultar IA
    analysis = tarot_ai.analyze_archetype_vs_clinical(
        arcana_number=arcana_number,
        arcana_name=arcana_info['name'],
        hebrew_letter=arcana_info['hebrew'],
        test_name=test_name,
        clinical_severity=clinical_severity,
        patient_name=patient.full_name or patient.first_name
    )
    
    if 'error' in analysis:
        return analysis
    
    # Construir respuesta completa
    return {
        "arcana_number": arcana_number,
        "arcana_name": arcana_info['name'],
        "hebrew_letter": arcana_info['hebrew'],
        "path": arcana_info['path'],
        "test_name": test_name,
        "clinical_severity": clinical_severity,
        "test_date": latest_test.created_at.isoformat() if latest_test.created_at else None,
        "analisis_sombra": analysis.get("analisis_sombra", ""),
        "acciones_sanadoras": analysis.get("acciones_sanadoras", []),
        "mensaje_integrador": analysis.get("mensaje_integrador", "")
    }
