import pandas as pd
from .data_loader import KabbalahDataLoader
from .test_mappings import TEST_LINKS

class SoulAnalyticsEngine:
    def __init__(self):
        self.loader = KabbalahDataLoader()
        self.links = TEST_LINKS

    def interpretar_individual(self, key_test, score):
        """Analiza un solo test recién terminado"""
        link = self.links.get(key_test)
        if not link: return {"error": "Test no configurado en mappings"}

        # Traer datos reales de tus JSONs
        sefira = self.loader.get_concepto_by_id(link["sefira_id"])
        angel = self.loader.get_angel_by_index(link["angel_remedio_idx"])
        organo = self.loader.get_concepto_by_id(link["organo_ref_id"])

        # Acceso seguro a los datos del ángel
        angel_name = angel.get("name", {})
        angel_attribute = angel.get("attribute", {})
        
        return {
            "test": link["test_name"],
            "score": score,
            "analisis_alma": {
                "sefira_afectada": sefira.get("transliteration", "N/A"),
                "significado_sefira": sefira.get("meaning_es", ""),
                "concepto_mistico": sefira.get("mystical_desc", ""),
                "organo_relacionado": organo.get("meaning_es", "")
            },
            "remedio_angelical": {
                "nombre_en": angel_name.get("en", "N/A"), # Ej: Vehuiah (clave para frontend)
                "nombre_he": angel_name.get("he", "N/A"),
                "atributo": angel_attribute.get("en", "N/A")
            }
        }

    def analizar_lote_historico(self, historial):
        """Calcula Pearson para historial de datos"""
        df = pd.DataFrame(historial).fillna(0)
        # Aquí iría la lógica de Pearson que vimos antes...
        # Por ahora lo dejamos simple para que funcione el individual
        return {"mensaje": "Análisis de lote pendiente de implementación completa"}
