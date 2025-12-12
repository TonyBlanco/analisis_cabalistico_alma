import json
from pathlib import Path

class KabbalahDataLoader:
    def __init__(self):
        # Adjust the path to go up three levels to the project root
        self.base_dir = Path(__file__).resolve().parent.parent.parent / "tonyblanco-app" / "data"
        self.hebrew_lexicon = []
        self.angels_72 = []
        self._cargar_datos()

    def _cargar_datos(self):
        try:
            # 1. Cargar Base Maestra Hebrea
            with open(self.base_dir / "hebrew_database_master.json", "r", encoding="utf-8") as f:
                data = json.load(f)
                self.hebrew_lexicon = data.get("lexicon", [])

            # 2. Cargar 72 Ángeles
            with open(self.base_dir / "seventyTwoAngels.json", "r", encoding="utf-8") as f:
                self.angels_72 = json.load(f)
            
            print(f"✅ Datos cargados: {len(self.hebrew_lexicon)} términos y {len(self.angels_72)} ángeles.")
        except FileNotFoundError as e:
            print(f"⚠️ Error: Archivo no encontrado en la ruta: {e.filename}")
        except json.JSONDecodeError:
            print("⚠️ Error: El archivo JSON está mal formado.")
        except Exception as e:
            print(f"⚠️ Error inesperado cargando datos: {e}")

    def get_concepto_by_id(self, item_id):
        """Busca en el lexicon por ID (ej: sef_127)"""
        for item in self.hebrew_lexicon:
            if item.get("id") == item_id:
                return item
        return {}

    def get_angel_by_index(self, index):
        """Busca ángel por índice 0-71"""
        if 0 <= index < len(self.angels_72):
            return self.angels_72[index]
        return {}
