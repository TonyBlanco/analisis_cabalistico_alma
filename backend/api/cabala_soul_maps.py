"""
cabala_soul_maps.py - P2.1 Soul Maps Calculator

Calcula mapas del alma basados en numerología cabalística.
Este módulo es OBSERVACIONAL - genera datos estructurados, NO interpretaciones.

⚠️ ADVERTENCIA: Este código NO diagnostica ni predice. Es una herramienta
de exploración simbólica que requiere interpretación profesional.
"""

from datetime import datetime, date
from typing import Dict, List, Optional, Any


class SoulMapCalculator:
    """
    Calculadora de Mapas del Alma basada en numerología cabalística.
    
    Genera mapas estructurales que relacionan:
    - Fecha de nacimiento con Sefirot
    - Nombre con valores numéricos
    - Ciclos temporales con posiciones en el Árbol
    
    NO interpreta ni diagnostica. Solo calcula y mapea.
    """
    
    SEFIROT = {
        'keter': {'id': 'sef_1', 'name': 'Keter', 'position': 1, 'meaning': 'Corona'},
        'chokmah': {'id': 'sef_2', 'name': 'Chokmah', 'position': 2, 'meaning': 'Sabiduría'},
        'binah': {'id': 'sef_3', 'name': 'Binah', 'position': 3, 'meaning': 'Entendimiento'},
        'chesed': {'id': 'sef_4', 'name': 'Chesed', 'position': 4, 'meaning': 'Misericordia'},
        'gevurah': {'id': 'sef_5', 'name': 'Gevurah', 'position': 5, 'meaning': 'Rigor'},
        'tiferet': {'id': 'sef_6', 'name': 'Tiferet', 'position': 6, 'meaning': 'Belleza'},
        'netzach': {'id': 'sef_7', 'name': 'Netzach', 'position': 7, 'meaning': 'Victoria'},
        'hod': {'id': 'sef_8', 'name': 'Hod', 'position': 8, 'meaning': 'Esplendor'},
        'yesod': {'id': 'sef_9', 'name': 'Yesod', 'position': 9, 'meaning': 'Fundamento'},
        'malkuth': {'id': 'sef_10', 'name': 'Malkuth', 'position': 10, 'meaning': 'Reino'}
    }
    
    # Mapeo posición → nombre de Sefirá
    SEFIRA_BY_POSITION = [
        None,  # índice 0 no usado
        'keter', 'chokmah', 'binah', 'chesed', 'gevurah',
        'tiferet', 'netzach', 'hod', 'yesod', 'malkuth'
    ]
    
    def calculate_life_path_sefira(self, birth_date: date) -> str:
        """
        Calcula Sefirá de camino de vida según fecha de nacimiento.
        Similar a número de vida en numerología.
        
        Args:
            birth_date: Fecha de nacimiento
            
        Returns:
            Nombre de la Sefirá correspondiente (ej: 'tiferet')
        """
        # Suma todos los dígitos de la fecha
        total = self._sum_digits(birth_date.day)
        total += self._sum_digits(birth_date.month)
        total += self._sum_digits(birth_date.year)
        
        # Reduce a un dígito (1-10)
        while total > 10:
            total = self._sum_digits(total)
        
        # Caso especial: 0 se convierte en 10 (Malkuth)
        if total == 0:
            total = 10
            
        return self.SEFIRA_BY_POSITION[total]
    
    def calculate_name_sefira(self, full_name: str) -> str:
        """
        Calcula Sefirá asociada al nombre completo.
        Usa suma de valores ordinales como aproximación.
        
        Nota: Para Gematría hebrea precisa, usar módulo gematria_engine.
        
        Args:
            full_name: Nombre completo del consultante
            
        Returns:
            Nombre de la Sefirá correspondiente
        """
        # Limpia el nombre
        clean_name = full_name.strip().upper().replace(' ', '')
        
        if not clean_name:
            return 'malkuth'  # Default para nombres vacíos
        
        # Suma valores ordinales de letras (A=1, B=2, etc.)
        total = 0
        for char in clean_name:
            if char.isalpha():
                # A-Z corresponde a 1-26
                total += ord(char) - ord('A') + 1
        
        # Reduce a 1-10
        while total > 10:
            total = self._sum_digits(total)
        
        if total == 0:
            total = 10
            
        return self.SEFIRA_BY_POSITION[total]
    
    def calculate_current_cycle_sefira(self, birth_date: date, target_date: Optional[date] = None) -> str:
        """
        Calcula Sefirá del ciclo actual (año personal).
        Se actualiza cada año en el cumpleaños.
        
        Args:
            birth_date: Fecha de nacimiento
            target_date: Fecha para calcular (default: hoy)
            
        Returns:
            Nombre de la Sefirá del ciclo actual
        """
        if target_date is None:
            target_date = date.today()
        
        age = self._calculate_age(birth_date, target_date)
        
        # Ciclo de 10 años (incluyendo Keter)
        cycle_position = age % 10
        
        # Mapeo inverso: 0=Malkuth, 1=Yesod, ..., 9=Chokmah
        # En múltiplos de 10, se alcanza Keter
        if cycle_position == 0 and age > 0:
            return 'keter'
        
        # Ciclo ascendente desde Malkuth
        cycle_map = ['malkuth', 'yesod', 'hod', 'netzach', 'tiferet', 
                     'gevurah', 'chesed', 'binah', 'chokmah', 'keter']
        
        return cycle_map[cycle_position]
    
    def analyze_test_results(self, test_results: List[Dict]) -> Dict[str, float]:
        """
        Analiza resultados de tests clínicos y asigna intensidad a Sefirot.
        
        ⚠️ ADVERTENCIA: NO interpreta, solo mapea síntomas a energías simbólicas.
        Las correspondencias son educativas, no diagnósticas.
        
        Args:
            test_results: Lista de resultados de tests con 'test_id' y 'clinical_diagnosis'
            
        Returns:
            Diccionario de intensidades por Sefirá (0.0 a 1.0)
        """
        sefira_intensities = {s: 0.0 for s in self.SEFIROT.keys()}
        
        for test in test_results:
            severity = str(test.get('clinical_diagnosis', '')).lower()
            score = test.get('score', 0)
            
            # Normalizar score a 0-1 si es posible
            intensity = min(1.0, max(0.0, score / 100.0)) if score else 0.3
            
            # Mapeo síntoma→Sefirá (solo estructural, no interpretativo)
            if 'depresi' in severity or 'depres' in severity:
                sefira_intensities['tiferet'] += 0.3 * intensity
                sefira_intensities['chesed'] += 0.2 * intensity
                
            if 'ansiedad' in severity or 'anxiety' in severity:
                sefira_intensities['hod'] += 0.4 * intensity
                sefira_intensities['gevurah'] += 0.2 * intensity
                
            if 'estrés' in severity or 'stress' in severity or 'burnout' in severity:
                sefira_intensities['netzach'] += 0.3 * intensity
                sefira_intensities['malkuth'] += 0.2 * intensity
                
            if 'trauma' in severity or 'ptsd' in severity:
                sefira_intensities['yesod'] += 0.4 * intensity
                sefira_intensities['binah'] += 0.2 * intensity
                
            if 'adicc' in severity or 'addiction' in severity:
                sefira_intensities['yesod'] += 0.3 * intensity
                sefira_intensities['netzach'] += 0.3 * intensity
                
            if 'relacion' in severity or 'interpersonal' in severity:
                sefira_intensities['chesed'] += 0.3 * intensity
                sefira_intensities['gevurah'] += 0.2 * intensity
        
        # Normalizar intensidades a máximo 1.0
        max_intensity = max(sefira_intensities.values()) if sefira_intensities else 1.0
        if max_intensity > 1.0:
            sefira_intensities = {k: v / max_intensity for k, v in sefira_intensities.items()}
        
        return sefira_intensities
    
    def generate_soul_map(
        self, 
        birth_date: date,
        full_name: str,
        test_results: Optional[List[Dict]] = None,
        target_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Genera mapa completo del alma.
        
        Retorna estructura de datos, NO interpretación.
        El terapeuta es responsable de toda interpretación.
        
        Args:
            birth_date: Fecha de nacimiento
            full_name: Nombre completo
            test_results: Resultados de tests clínicos (opcional)
            target_date: Fecha para cálculos de ciclo (default: hoy)
            
        Returns:
            Diccionario con mapa del alma estructurado
        """
        if target_date is None:
            target_date = date.today()
        
        life_path_sefira = self.calculate_life_path_sefira(birth_date)
        name_sefira = self.calculate_name_sefira(full_name)
        cycle_sefira = self.calculate_current_cycle_sefira(birth_date, target_date)
        
        sefira_intensities = {}
        if test_results:
            sefira_intensities = self.analyze_test_results(test_results)
        
        age = self._calculate_age(birth_date, target_date)
        
        return {
            'meta': {
                'birth_date': birth_date.isoformat(),
                'full_name': full_name,
                'analysis_date': target_date.isoformat(),
                'generated_at': datetime.now().isoformat(),
                'age': age
            },
            'primary_sefirot': {
                'life_path': {
                    'sefira': life_path_sefira,
                    'details': self.SEFIROT.get(life_path_sefira, {}),
                    'description': 'Sefirá del camino de vida basada en fecha de nacimiento'
                },
                'name_essence': {
                    'sefira': name_sefira,
                    'details': self.SEFIROT.get(name_sefira, {}),
                    'description': 'Sefirá asociada a la esencia del nombre'
                },
                'current_cycle': {
                    'sefira': cycle_sefira,
                    'details': self.SEFIROT.get(cycle_sefira, {}),
                    'description': f'Sefirá del ciclo actual (edad {age})'
                }
            },
            'sefira_intensities': sefira_intensities,
            'synchronicities': self._find_synchronicities(life_path_sefira, name_sefira, cycle_sefira),
            'disclaimer': (
                'Este mapa es una representación simbólica. '
                'No constituye diagnóstico ni predicción. '
                'Requiere interpretación profesional.'
            )
        }
    
    def _sum_digits(self, n: int) -> int:
        """Suma los dígitos de un número."""
        return sum(int(d) for d in str(abs(n)))
    
    def _calculate_age(self, birth_date: date, target_date: date) -> int:
        """Calcula edad exacta."""
        age = target_date.year - birth_date.year
        if (target_date.month, target_date.day) < (birth_date.month, birth_date.day):
            age -= 1
        return max(0, age)
    
    def _find_synchronicities(self, life_path: str, name: str, cycle: str) -> List[str]:
        """
        Identifica coincidencias entre Sefirot primarias.
        Solo señala coincidencias, no interpreta.
        """
        syncs = []
        
        if life_path == name:
            syncs.append(f"Camino de vida y esencia del nombre comparten Sefirá: {life_path}")
        
        if life_path == cycle:
            syncs.append(f"Camino de vida y ciclo actual comparten Sefirá: {life_path}")
        
        if name == cycle:
            syncs.append(f"Esencia del nombre y ciclo actual comparten Sefirá: {name}")
        
        if life_path == name == cycle:
            syncs.append(f"Triple sincronicidad: las tres Sefirot primarias son {life_path}")
        
        return syncs


# Singleton instance for convenience
soul_map_calculator = SoulMapCalculator()
