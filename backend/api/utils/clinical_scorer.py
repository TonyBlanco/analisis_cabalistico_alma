"""
Motor de Calificación Clínica para Tests Psicológicos
Proporciona baremos estandarizados para interpretación clínica de tests
"""


class ClinicalScorer:
    """
    Motor de calificación clínica para tests psicológicos.
    Proporciona baremos estandarizados y cálculo de diagnósticos clínicos.
    """
    
    def __init__(self):
        """
        Inicializa el motor con los baremos clínicos estandarizados.
        """
        self.baremos = {
            "phq-9": [
                (0, 4, "Ninguna"),
                (5, 9, "Leve"),
                (10, 14, "Moderada"),
                (15, 19, "Moderadamente Severa"),
                (20, 27, "Severa")
            ],
            "gad-7": [
                (0, 4, "Mínima"),
                (5, 9, "Leve"),
                (10, 14, "Moderada"),
                (15, 21, "Severa")
            ],
            "bdi-ii": [
                (0, 13, "Mínima"),
                (14, 19, "Leve"),
                (20, 28, "Moderada"),
                (29, 63, "Severa")
            ],
            "bai": [
                (0, 7, "Mínima"),
                (8, 15, "Leve"),
                (16, 25, "Moderada"),
                (26, 63, "Severa")
            ],
            "ptsd": [
                (0, 32, "Bajo riesgo"),
                (33, 80, "Riesgo clínico alto")
            ],
            "ocd": [
                (0, 7, "Subclínico"),
                (8, 15, "Leve"),
                (16, 23, "Moderado"),
                (24, 31, "Severo"),
                (32, 40, "Extremo")
            ],
            "insomnia": [
                (0, 7, "Sin insomnio"),
                (8, 14, "Subumbral"),
                (15, 21, "Moderado"),
                (22, 28, "Severo")
            ],
            "scl-90-r": [
                (0.0, 0.99, "Normal"),
                (1.00, 2.49, "Riesgo Moderado"),
                (2.50, 4.00, "Patología Severa")
            ],
            "stai": [
                (20, 39, "Ansiedad Baja"),
                (40, 59, "Ansiedad Media"),
                (60, 80, "Ansiedad Alta")
            ],
            "pai": [
                (0, 59, "Normal"),
                (60, 69, "Riesgo Leve"),
                (70, 90, "Significativo")
            ],
            "scid-5-rv": [
                (0, 1, "Sin criterios"),
                (2, 8, "Posible diagnóstico - Requiere entrevista")
            ],
            "adhd": [
                (0, 13, "Poco probable"),
                (14, 19, "Probable"),
                (20, 24, "Muy Probable")
            ],
            "substance": [
                (0, 1, "Bajo Riesgo"),
                (2, 4, "Riesgo de Abuso/Dependencia")
            ],
            "eating": [
                (0, 1, "Bajo Riesgo"),
                (2, 5, "Posible Trastorno Alimentario")
            ],
            "ptsd-pcl5": [
                (0, 32, "Síntomas sub-clínicos"),
                (33, 45, "PTSD Moderado"),
                (46, 80, "PTSD Severo")
            ]
        }
    
    def calcular_score(self, test_id, respuestas):
        """
        Calcula el score bruto y determina el diagnóstico clínico.
        
        Args:
            test_id (str): Identificador del test (phq-9, gad-7, bdi-ii, bai, ptsd, ocd, insomnia, scl-90-r, stai, pai, scid-5-rv, adhd, substance, eating, ptsd-pcl5)
            respuestas (list): Lista de enteros con las respuestas del test
        
        Returns:
            dict: Diccionario con "score_bruto" (int o float) y "diagnostico_clinico" (str)
        """
        # Validar que el test_id existe en los baremos
        if test_id not in self.baremos:
            raise ValueError(f"Test ID '{test_id}' no está configurado en los baremos")
        
        # Validar que respuestas es una lista
        if not isinstance(respuestas, list):
            raise TypeError("Las respuestas deben ser una lista de enteros")
        
        # Calcular score bruto
        try:
            if test_id == "scl-90-r":
                # Para SCL-90-R, calcular el promedio (GSI: Global Severity Index)
                suma_total = sum(int(r) for r in respuestas)
                num_items = len(respuestas) if respuestas else 1
                score_bruto = round(suma_total / num_items, 2)  # Promedio con 2 decimales
            else:
                # Para otros tests, sumar todos los valores
                score_bruto = sum(int(r) for r in respuestas)
        except (ValueError, TypeError) as e:
            raise ValueError(f"Error al procesar respuestas: {e}")
        
        # Determinar diagnóstico clínico comparando con los rangos
        diagnostico_clinico = self._determinar_diagnostico(test_id, score_bruto)
        
        return {
            "score_bruto": score_bruto,
            "diagnostico_clinico": diagnostico_clinico
        }
    
    def _determinar_diagnostico(self, test_id, score_bruto):
        """
        Determina el diagnóstico clínico basado en el score bruto y los baremos.
        
        Args:
            test_id (str): Identificador del test
            score_bruto (int o float): Score total calculado
        
        Returns:
            str: Texto del diagnóstico clínico
        """
        rangos = self.baremos[test_id]
        
        # Iterar sobre los rangos (están ordenados de menor a mayor)
        for min_score, max_score, diagnostico in rangos:
            if min_score <= score_bruto <= max_score:
                return diagnostico
        
        # Si el score está fuera de todos los rangos, retornar el más extremo
        # (esto no debería pasar con los baremos actuales, pero por seguridad)
        if score_bruto < rangos[0][0]:
            return rangos[0][2]  # Retornar el diagnóstico del rango más bajo
        else:
            return rangos[-1][2]  # Retornar el diagnóstico del rango más alto

