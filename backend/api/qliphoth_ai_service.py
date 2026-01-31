"""
AI Service for Qliphoth Shadow Cycles - Trabajo de Sombras Module

Reutiliza el SymbolicInterpreterAI existente para generar interpretaciones
de ciclos de sombra con principios éticos estrictos.
"""

from typing import Dict, Any, Optional, List
from django.conf import settings
from api.utils.symbolic_interpreter_ai import symbolic_ai_service
from api.ai_governance import AIGovernanceSystem, AIOperationType
import logging
import json

logger = logging.getLogger(__name__)


class QliphothAIService:
    """
    Servicio AI para interpretación de Ciclos de Sombra Personal.
    
    Wrapper ético alrededor del SymbolicInterpreterAI existente,
    especializado en análisis de Qliphoth con restricciones específicas.
    """
    
    def __init__(self, therapist_user):
        """
        Inicializa el servicio para un terapeuta específico.
        
        Args:
            therapist_user: Usuario Django que es el terapeuta
        """
        self.therapist = therapist_user
        self.governance = AIGovernanceSystem()
        self.enabled = symbolic_ai_service.enabled
        self.error_message = symbolic_ai_service.error_message
    
    def _build_qliphoth_prompt(
        self,
        qliphoth_data: Dict[str, Any],
        analysis_type: str = "cycle_analysis"
    ) -> str:
        """
        Construye el prompt específico para análisis Qliphoth.
        
        Args:
            qliphoth_data: Datos de ciclos Qliphoth del calculadora
            analysis_type: Tipo de análisis ("cycle_analysis", "pattern_synthesis", "integration_guidance")
            
        Returns:
            str: Prompt estructurado para el AI
        """
        
        # Disclaimer ético obligatorio
        ethical_disclaimer = """
        PRINCIPIOS ÉTICOS OBLIGATORIOS:
        - Este análisis es SIMBÓLICO y EDUCATIVO, nunca predictivo
        - No hagas afirmaciones sobre eventos futuros específicos
        - Enfócate en patrones de consciencia y reflexión
        - Usa lenguaje de "invitación a reflexionar", no determinismo
        - Los ciclos Qliphoth son mapas de autoconocimiento, no destino
        """
        
        if analysis_type == "cycle_analysis":
            prompt = f"""
            {ethical_disclaimer}
            
            ANÁLISIS DE CICLOS QLIPHOTH (SOMBRA PERSONAL)
            
            Datos del ciclo actual:
            - Qliphoth actual: {qliphoth_data.get('current_qliphoth', 'No especificada')}
            - Edad: {qliphoth_data.get('current_age', 'No especificada')} años
            - Correspondencia Sefirótica: {qliphoth_data.get('sephirah_correspondence', 'No especificada')}
            
            Eventos históricos correlacionados:
            {json.dumps(qliphoth_data.get('crisis_events', []), indent=2, ensure_ascii=False)}
            
            Patrones detectados:
            {json.dumps(qliphoth_data.get('shadow_patterns', {}), indent=2, ensure_ascii=False)}
            
            INSTRUCCIONES:
            1. Analiza los PATRONES HISTÓRICOS sin predecir el futuro
            2. Sugiere áreas de reflexión y consciencia preventiva
            3. Explica el simbolismo de la Qliphoth actual de forma educativa
            4. Ofrece herramientas de integración específicas para esta sombra
            5. Mantén un tono reflexivo y empoderador
            
            Genera una interpretación simbólica de 400-600 palabras enfocada en autoconocimiento.
            """
            
        elif analysis_type == "pattern_synthesis":
            prompt = f"""
            {ethical_disclaimer}
            
            SÍNTESIS DE PATRONES DE SOMBRA
            
            Múltiples ciclos Qliphoth analizados:
            {json.dumps(qliphoth_data.get('qliphoth_timeline', []), indent=2, ensure_ascii=False)}
            
            Patrones repetitivos identificados:
            {json.dumps(qliphoth_data.get('shadow_patterns', {}), indent=2, ensure_ascii=False)}
            
            INSTRUCCIONES:
            1. Sintetiza los temas recurrentes en los ciclos de sombra
            2. Identifica oportunidades de crecimiento e integración
            3. Sugiere un "mapa de consciencia" para trabajo terapéutico
            4. Enfócate en el potencial transformador de cada Qliphoth
            5. Usa metáforas del Árbol de la Vida invertido como herramienta de sanación
            
            Genera una síntesis comprensiva de 600-800 palabras para sesión terapéutica.
            """
            
        elif analysis_type == "integration_guidance":
            prompt = f"""
            {ethical_disclaimer}
            
            GUÍA DE INTEGRACIÓN DE SOMBRA QLIPHÓTICA
            
            Qliphoth para trabajar: {qliphoth_data.get('target_qliphoth', 'No especificada')}
            Sefirá correspondiente: {qliphoth_data.get('corresponding_sephirah', 'No especificada')}
            Contexto terapéutico: {qliphoth_data.get('therapeutic_context', 'Trabajo de sombra general')}
            
            INSTRUCCIONES:
            1. Diseña un plan de trabajo de sombra específico para esta Qliphoth
            2. Sugiere técnicas de meditación, journaling y reflexión
            3. Explica cómo transformar la energía sombría en fuerza constructiva
            4. Ofrece ejercicios prácticos de integración
            5. Incluye señales de progreso en el trabajo de integración
            
            Genera una guía práctica de 500-700 palabras para uso terapéutico.
            """
            
        else:
            prompt = f"""
            {ethical_disclaimer}
            
            ANÁLISIS QLIPHOTH GENERAL
            
            Datos disponibles:
            {json.dumps(qliphoth_data, indent=2, ensure_ascii=False)}
            
            Proporciona una interpretación simbólica general enfocada en autoconocimiento y crecimiento personal.
            """
        
        return prompt
    
    def generate_cycle_interpretation(
        self,
        qliphoth_data: Dict[str, Any],
        consultante_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Genera interpretación AI de los ciclos Qliphoth actuales.
        
        Args:
            qliphoth_data: Datos del QliphothCycleCalculator
            consultante_id: ID del consultante para logging
            
        Returns:
            Dict con 'interpretation', 'timestamp', 'disclaimer'
        """
        if not self.enabled:
            return {
                'success': False,
                'error': self.error_message or 'Servicio AI no disponible',
                'fallback_message': 'Usa la información simbólica proporcionada para reflexión manual.'
            }
        
        try:
            # Log de uso para governance
            self.governance.log_operation(
                operation_type=AIOperationType.SYMBOLIC_INTERPRETATION,
                user_id=self.therapist.id,
                context={
                    'module': 'qliphoth_cycles',
                    'analysis_type': 'cycle_analysis',
                    'consultante_id': consultante_id,
                    'current_qliphoth': qliphoth_data.get('current_qliphoth')
                }
            )
            
            prompt = self._build_qliphoth_prompt(qliphoth_data, "cycle_analysis")
            ai_response = symbolic_ai_service.generate_symbolic_interpretation(prompt)
            
            return {
                'success': True,
                'interpretation': ai_response,
                'analysis_type': 'cycle_analysis',
                'disclaimer': (
                    "Interpretación simbólica generada por IA. "
                    "Solo para reflexión terapéutica, no constituye diagnóstico. "
                    "Los ciclos Qliphoth son herramientas de autoconocimiento."
                ),
                'timestamp': json.dumps({'iso': 'now'})  # Frontend lo reemplazará
            }
            
        except Exception as e:
            logger.error(f"Error generando interpretación Qliphoth: {e}")
            return {
                'success': False,
                'error': str(e),
                'fallback_message': 'Error en generación AI. Procede con interpretación manual.'
            }
    
    def generate_pattern_synthesis(
        self,
        qliphoth_data: Dict[str, Any],
        consultante_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Genera síntesis AI de patrones de sombra a través de múltiples ciclos.
        
        Args:
            qliphoth_data: Datos completos de timeline Qliphoth
            consultante_id: ID del consultante para logging
            
        Returns:
            Dict con síntesis AI de patrones
        """
        if not self.enabled:
            return {
                'success': False,
                'error': 'Servicio AI no disponible para síntesis',
                'fallback_message': 'Analiza manualmente los patrones en el timeline.'
            }
        
        try:
            # Log de uso para governance
            self.governance.log_operation(
                operation_type=AIOperationType.PATTERN_ANALYSIS,
                user_id=self.therapist.id,
                context={
                    'module': 'qliphoth_cycles',
                    'analysis_type': 'pattern_synthesis',
                    'consultante_id': consultante_id,
                    'patterns_count': len(qliphoth_data.get('shadow_patterns', {}))
                }
            )
            
            prompt = self._build_qliphoth_prompt(qliphoth_data, "pattern_synthesis")
            ai_response = symbolic_ai_service.generate_symbolic_interpretation(prompt)
            
            return {
                'success': True,
                'synthesis': ai_response,
                'analysis_type': 'pattern_synthesis',
                'patterns_analyzed': qliphoth_data.get('shadow_patterns', {}),
                'disclaimer': (
                    "Síntesis de patrones generada por IA para apoyo terapéutico. "
                    "Requiere validación e interpretación profesional."
                ),
                'timestamp': json.dumps({'iso': 'now'})
            }
            
        except Exception as e:
            logger.error(f"Error generando síntesis de patrones Qliphoth: {e}")
            return {
                'success': False,
                'error': str(e),
                'fallback_message': 'Error en síntesis AI. Analiza patrones manualmente.'
            }
    
    def generate_integration_guide(
        self,
        target_qliphoth: str,
        therapeutic_context: str = "",
        consultante_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Genera guía AI para integración de una Qliphoth específica.
        
        Args:
            target_qliphoth: Nombre de la Qliphoth a trabajar
            therapeutic_context: Contexto adicional de la sesión
            consultante_id: ID del consultante para logging
            
        Returns:
            Dict con guía de integración
        """
        if not self.enabled:
            return {
                'success': False,
                'error': 'Servicio AI no disponible para guías',
                'fallback_message': f'Consulta recursos manuales para integración de {target_qliphoth}.'
            }
        
        try:
            # Información de la Qliphoth (del calculadora)
            from backend.api.cabala_qliphoth_cycles import QliphothCycleCalculator
            calculator = QliphothCycleCalculator()
            qliphoth_info = calculator.QLIPHOTH_INFO.get(target_qliphoth, {})
            
            qliphoth_data = {
                'target_qliphoth': target_qliphoth,
                'corresponding_sephirah': qliphoth_info.get('sephirahCorrespondence'),
                'therapeutic_context': therapeutic_context,
                'shadow_aspect': qliphoth_info.get('shadowAspect'),
                'integration_path': qliphoth_info.get('integrationPath')
            }
            
            # Log de uso para governance
            self.governance.log_operation(
                operation_type=AIOperationType.THERAPEUTIC_GUIDANCE,
                user_id=self.therapist.id,
                context={
                    'module': 'qliphoth_cycles',
                    'analysis_type': 'integration_guidance',
                    'consultante_id': consultante_id,
                    'target_qliphoth': target_qliphoth
                }
            )
            
            prompt = self._build_qliphoth_prompt(qliphoth_data, "integration_guidance")
            ai_response = symbolic_ai_service.generate_symbolic_interpretation(prompt)
            
            return {
                'success': True,
                'guidance': ai_response,
                'analysis_type': 'integration_guidance',
                'target_qliphoth': target_qliphoth,
                'qliphoth_info': qliphoth_info,
                'disclaimer': (
                    "Guía de integración generada por IA para apoyo terapéutico. "
                    "Adapta las sugerencias al contexto específico del consultante."
                ),
                'timestamp': json.dumps({'iso': 'now'})
            }
            
        except Exception as e:
            logger.error(f"Error generando guía de integración Qliphoth: {e}")
            return {
                'success': False,
                'error': str(e),
                'fallback_message': f'Error en guía AI para {target_qliphoth}. Procede con recursos manuales.'
            }


def create_qliphoth_ai_service(therapist_user) -> QliphothAIService:
    """
    Factory function para crear instancia del servicio AI Qliphoth.
    
    Args:
        therapist_user: Usuario Django terapeuta
        
    Returns:
        QliphothAIService: Instancia configurada del servicio
    """
    return QliphothAIService(therapist_user)