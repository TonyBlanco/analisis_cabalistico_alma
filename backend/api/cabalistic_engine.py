"""
Engine de cálculos cabalísticos y numerológicos
"""
from datetime import datetime
from typing import Dict, Tuple
import unicodedata


class CabbalisticCalculator:
    """Motor de cálculos cabalísticos y numerológicos"""
    
    # Tabla de conversión de letras a números (Pitagórica)
    LETTER_VALUES = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
        'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8,
        # Vocales
        'Á': 1, 'É': 5, 'Í': 9, 'Ó': 6, 'Ú': 3,
        'Ä': 1, 'Ë': 5, 'Ï': 9, 'Ö': 6, 'Ü': 3,
        'À': 1, 'È': 5, 'Ì': 9, 'Ò': 6, 'Ù': 3,
        'Ñ': 5,
    }
    
    VOWELS = set('AEIOUÁÉÍÓÚÄËÏÖÜÀÈÌÒÙ')
    
    @classmethod
    def normalize_text(cls, text: str) -> str:
        """Normaliza el texto removiendo acentos y convirtiéndolo a mayúsculas"""
        text = ''.join(c for c in unicodedata.normalize('NFD', text) 
                      if unicodedata.category(c) != 'Mn')
        return text.upper()
    
    @classmethod
    def reduce_to_single_digit(cls, number: int, keep_master: bool = True) -> int:
        """
        Reduce un número a un solo dígito
        Mantiene números maestros (11, 22, 33) si keep_master es True
        """
        if keep_master and number in (11, 22, 33):
            return number
        
        while number > 9:
            number = sum(int(digit) for digit in str(number))
            if keep_master and number in (11, 22, 33):
                return number
        
        return number
    
    @classmethod
    def calculate_name_number(cls, name: str) -> int:
        """Calcula el número de un nombre (suma de todas las letras)"""
        name = cls.normalize_text(name)
        total = sum(cls.LETTER_VALUES.get(char, 0) for char in name if char.isalpha())
        return cls.reduce_to_single_digit(total)
    
    @classmethod
    def calculate_soul_number(cls, name: str) -> int:
        """Número del Alma - suma de las vocales"""
        name = cls.normalize_text(name)
        total = sum(cls.LETTER_VALUES.get(char, 0) 
                   for char in name if char in cls.VOWELS)
        return cls.reduce_to_single_digit(total)
    
    @classmethod
    def calculate_personality_number(cls, name: str) -> int:
        """Número de Personalidad - suma de las consonantes"""
        name = cls.normalize_text(name)
        total = sum(cls.LETTER_VALUES.get(char, 0) 
                   for char in name if char.isalpha() and char not in cls.VOWELS)
        return cls.reduce_to_single_digit(total)
    
    @classmethod
    def calculate_destiny_number(cls, birth_date: str) -> int:
        """
        Número del Destino - suma de la fecha de nacimiento
        Formato esperado: YYYY-MM-DD o DD/MM/YYYY
        """
        # Normalizar formato
        birth_date = birth_date.replace('/', '-')
        
        try:
            # Intentar parsear
            if '-' in birth_date:
                parts = birth_date.split('-')
                if len(parts[0]) == 4:  # YYYY-MM-DD
                    year, month, day = parts
                else:  # DD-MM-YYYY
                    day, month, year = parts
            else:
                raise ValueError("Formato de fecha inválido")
            
            # Sumar todos los dígitos
            total = sum(int(digit) for digit in day + month + year)
            return cls.reduce_to_single_digit(total)
            
        except Exception as e:
            print(f"Error parseando fecha {birth_date}: {e}")
            return 0
    
    @classmethod
    def calculate_life_path_number(cls, birth_date: str) -> int:
        """Alias para el número del destino"""
        return cls.calculate_destiny_number(birth_date)
    
    @classmethod
    def calculate_expression_number(cls, full_name: str) -> int:
        """Número de Expresión - suma completa del nombre"""
        return cls.calculate_name_number(full_name)
    
    @classmethod
    def calculate_maturity_number(cls, name_number: int, destiny_number: int) -> int:
        """Número de Madurez - suma del número de expresión y destino"""
        total = name_number + destiny_number
        return cls.reduce_to_single_digit(total)
    
    @classmethod
    def calculate_karmic_debt(cls, birth_date: str) -> Tuple[bool, int]:
        """
        Verifica si hay deuda kármica (13, 14, 16, 19)
        Retorna (tiene_deuda, número_karmico)
        """
        destiny = cls.calculate_destiny_number(birth_date)
        karmic_numbers = {13, 14, 16, 19}
        
        # Verificar en el cálculo sin reducir
        birth_date = birth_date.replace('/', '-')
        parts = birth_date.split('-')
        if len(parts[0]) == 4:
            year, month, day = parts
        else:
            day, month, year = parts
        
        total = sum(int(digit) for digit in day + month + year)
        
        if total in karmic_numbers:
            return True, total
        return False, 0
    
    @classmethod
    def calculate_personal_year(cls, birth_date: str, current_year: int = None) -> int:
        """Calcula el año personal numerológico"""
        if current_year is None:
            current_year = datetime.now().year
        
        # Extraer día y mes de nacimiento
        birth_date = birth_date.replace('/', '-')
        parts = birth_date.split('-')
        if len(parts[0]) == 4:
            year, month, day = parts
        else:
            day, month, year = parts
        
        # Sumar día + mes + año actual
        total = sum(int(d) for d in day + month + str(current_year))
        return cls.reduce_to_single_digit(total)
    
    @classmethod
    def calculate_full_profile(cls, full_name: str, birth_date: str) -> Dict[str, any]:
        """
        Calcula el perfil numerológico completo de una persona
        
        Returns:
            Diccionario con todos los números calculados
        """
        # Números básicos
        expression = cls.calculate_expression_number(full_name)
        soul = cls.calculate_soul_number(full_name)
        personality = cls.calculate_personality_number(full_name)
        destiny = cls.calculate_destiny_number(birth_date)
        
        # Números derivados
        maturity = cls.calculate_maturity_number(expression, destiny)
        personal_year = cls.calculate_personal_year(birth_date)
        has_karmic, karmic_number = cls.calculate_karmic_debt(birth_date)
        
        return {
            'expresion': expression,
            'alma': soul,
            'personalidad': personality,
            'destino': destiny,
            'madurez': maturity,
            'año_personal': personal_year,
            'tiene_deuda_karmica': has_karmic,
            'numero_karmico': karmic_number if has_karmic else None,
        }
    
    @classmethod
    def calculate_compatibility(
        cls,
        person1_name: str,
        person1_birthdate: str,
        person2_name: str,
        person2_birthdate: str
    ) -> Dict[str, any]:
        """
        Calcula la compatibilidad entre dos personas
        
        Returns:
            Diccionario con análisis de compatibilidad
        """
        # Perfiles individuales
        profile1 = cls.calculate_full_profile(person1_name, person1_birthdate)
        profile2 = cls.calculate_full_profile(person2_name, person2_birthdate)
        
        # Comparar números clave
        destiny_diff = abs(profile1['destino'] - profile2['destino'])
        soul_diff = abs(profile1['alma'] - profile2['alma'])
        personality_diff = abs(profile1['personalidad'] - profile2['personalidad'])
        
        # Calcular score de compatibilidad (0-100)
        # Menor diferencia = mayor compatibilidad
        destiny_score = (9 - destiny_diff) / 9 * 40  # 40% peso
        soul_score = (9 - soul_diff) / 9 * 35  # 35% peso
        personality_score = (9 - personality_diff) / 9 * 25  # 25% peso
        
        total_score = destiny_score + soul_score + personality_score
        
        return {
            'persona1': {
                'nombre': person1_name,
                'perfil': profile1
            },
            'persona2': {
                'nombre': person2_name,
                'perfil': profile2
            },
            'compatibilidad': {
                'score_total': round(total_score, 1),
                'destino': {
                    'persona1': profile1['destino'],
                    'persona2': profile2['destino'],
                    'diferencia': destiny_diff,
                    'score': round(destiny_score, 1)
                },
                'alma': {
                    'persona1': profile1['alma'],
                    'persona2': profile2['alma'],
                    'diferencia': soul_diff,
                    'score': round(soul_score, 1)
                },
                'personalidad': {
                    'persona1': profile1['personalidad'],
                    'persona2': profile2['personalidad'],
                    'diferencia': personality_diff,
                    'score': round(personality_score, 1)
                }
            }
        }


# Instancia global
calculator = CabbalisticCalculator()
