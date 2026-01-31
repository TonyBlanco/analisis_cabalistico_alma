"""
cabala_laboratorio_nombres.py - Motor del Laboratorio de Nombres

Analizador profundo de nombres (propio, padres, hijos, pareja) que cruza:
- Gematría de cada nombre
- Letras compartidas
- Valores numéricos relacionados
- Arquetipos asociados

Valor terapéutico: Explora vínculos desde lo simbólico.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


# ==============================================================================
# HEBREW LETTER MAPPINGS
# ==============================================================================

HEBREW_LETTERS = {
    'א': {'name': 'Alef', 'value': 1, 'meaning': 'Aliento divino, inicio, unidad'},
    'ב': {'name': 'Bet', 'value': 2, 'meaning': 'Casa, dualidad, bendición'},
    'ג': {'name': 'Guimel', 'value': 3, 'meaning': 'Camello, dar, proceso'},
    'ד': {'name': 'Dalet', 'value': 4, 'meaning': 'Puerta, pobreza, humildad'},
    'ה': {'name': 'Hei', 'value': 5, 'meaning': 'Ventana, revelación, gracia'},
    'ו': {'name': 'Vav', 'value': 6, 'meaning': 'Gancho, conexión, completud'},
    'ז': {'name': 'Zayin', 'value': 7, 'meaning': 'Espada, sustento, tiempo'},
    'ח': {'name': 'Jet', 'value': 8, 'meaning': 'Valla, vida, trascendencia'},
    'ט': {'name': 'Tet', 'value': 9, 'meaning': 'Serpiente, bondad oculta'},
    'י': {'name': 'Yud', 'value': 10, 'meaning': 'Mano, creación, punto'},
    'כ': {'name': 'Kaf', 'value': 20, 'meaning': 'Palma, potencial, corona'},
    'ל': {'name': 'Lamed', 'value': 30, 'meaning': 'Aguijón, aprendizaje, elevación'},
    'מ': {'name': 'Mem', 'value': 40, 'meaning': 'Agua, sabiduría, flujo'},
    'נ': {'name': 'Nun', 'value': 50, 'meaning': 'Pez, alma, fidelidad'},
    'ס': {'name': 'Samej', 'value': 60, 'meaning': 'Apoyo, confianza, ciclo'},
    'ע': {'name': 'Ayin', 'value': 70, 'meaning': 'Ojo, percepción, fuente'},
    'פ': {'name': 'Pei', 'value': 80, 'meaning': 'Boca, expresión, palabra'},
    'צ': {'name': 'Tzadi', 'value': 90, 'meaning': 'Anzuelo, justicia, rectitud'},
    'ק': {'name': 'Kuf', 'value': 100, 'meaning': 'Mono, santidad, evolución'},
    'ר': {'name': 'Resh', 'value': 200, 'meaning': 'Cabeza, principio, pobreza'},
    'ש': {'name': 'Shin', 'value': 300, 'meaning': 'Diente, fuego, transformación'},
    'ת': {'name': 'Tav', 'value': 400, 'meaning': 'Cruz, verdad, completud'}
}

# Transliteración español → hebreo aproximada
SPANISH_TO_HEBREW = {
    'a': 'א', 'b': 'ב', 'c': 'כ', 'd': 'ד', 'e': 'ה',
    'f': 'פ', 'g': 'ג', 'h': 'ה', 'i': 'י', 'j': 'י',
    'k': 'כ', 'l': 'ל', 'm': 'מ', 'n': 'נ', 'o': 'ו',
    'p': 'פ', 'q': 'ק', 'r': 'ר', 's': 'ס', 't': 'ת',
    'u': 'ו', 'v': 'ב', 'w': 'ו', 'x': 'כס', 'y': 'י', 'z': 'ז',
    'ñ': 'נ', 'á': 'א', 'é': 'ה', 'í': 'י', 'ó': 'ו', 'ú': 'ו'
}

# Sefirot por número reducido
SEFIRA_BY_NUMBER = {
    1: 'Kéter (Corona)',
    2: 'Jojmá (Sabiduría)',
    3: 'Biná (Entendimiento)',
    4: 'Jésed (Misericordia)',
    5: 'Gevurá (Rigor)',
    6: 'Tiféret (Belleza)',
    7: 'Nétzaj (Victoria)',
    8: 'Hod (Gloria)',
    9: 'Yesod (Fundamento)',
}

# Arquetipos por número reducido
ARCHETYPES = {
    1: 'El Líder, El Pionero',
    2: 'El Mediador, El Cooperador',
    3: 'El Comunicador, El Artista',
    4: 'El Constructor, El Estabilizador',
    5: 'El Aventurero, El Libre',
    6: 'El Cuidador, El Armonizador',
    7: 'El Buscador, El Místico',
    8: 'El Logrador, El Poderoso',
    9: 'El Humanitario, El Sabio',
}


class LaboratorioNombres:
    """Motor principal del Laboratorio de Nombres."""
    
    def analyze_names(self, members: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analiza un conjunto de nombres familiares.
        
        Args:
            members: Lista de dicts con 'name', 'relation', 'hebrew_name' (opcional)
            
        Returns:
            Dict con análisis completo
        """
        try:
            # 1. Análisis individual de cada nombre
            individual_analyses = []
            for member in members:
                analysis = self._analyze_single_name(
                    name=member['name'],
                    hebrew_name=member.get('hebrew_name')
                )
                individual_analyses.append(analysis)
            
            # 2. Detectar letras compartidas
            shared_letters = self._find_shared_letters(individual_analyses)
            
            # 3. Encontrar resonancias numéricas
            numerical_resonances = self._find_numerical_resonances(individual_analyses)
            
            # 4. Detectar patrones familiares
            family_patterns = self._detect_family_patterns(individual_analyses, members)
            
            # 5. Generar preguntas reflexivas
            generative_questions = self._generate_questions(
                individual_analyses, 
                shared_letters, 
                numerical_resonances,
                members
            )
            
            # 6. Síntesis narrativa
            synthesis = self._generate_synthesis(
                individual_analyses,
                shared_letters,
                family_patterns
            )
            
            return {
                'individual_analyses': individual_analyses,
                'shared_letters': shared_letters,
                'numerical_resonances': numerical_resonances,
                'family_patterns': family_patterns,
                'generative_questions': generative_questions,
                'synthesis': synthesis
            }
            
        except Exception as e:
            logger.error(f"Error en análisis de nombres: {str(e)}")
            raise
    
    def _analyze_single_name(self, name: str, hebrew_name: Optional[str] = None) -> Dict[str, Any]:
        """Analiza un nombre individual."""
        # Transliterar si no hay nombre hebreo
        if hebrew_name:
            hebrew = hebrew_name
        else:
            hebrew = self._transliterate_to_hebrew(name)
        
        # Calcular gematría
        gematria = self._calculate_gematria(hebrew)
        
        # Obtener letras únicas
        letters = list(set(hebrew))
        
        # Determinar arquetipo y Sefirá por número reducido
        reduced = gematria['reduced']
        archetype = ARCHETYPES.get(reduced, 'El Misterioso')
        sefira = SEFIRA_BY_NUMBER.get(reduced, 'Maljut (Reino)')
        
        # Significado numérico
        numerical_meaning = self._get_numerical_meaning(gematria['standard'], gematria['reduced'])
        
        return {
            'name': name,
            'hebrew_transliteration': hebrew,
            'gematria': gematria,
            'letters': letters,
            'archetype': archetype,
            'sefira_resonance': sefira,
            'numerical_meaning': numerical_meaning
        }
    
    def _transliterate_to_hebrew(self, name: str) -> str:
        """Transliteración aproximada de español a hebreo."""
        result = []
        for char in name.lower():
            if char in SPANISH_TO_HEBREW:
                result.append(SPANISH_TO_HEBREW[char])
        return ''.join(result)
    
    def _calculate_gematria(self, hebrew: str) -> Dict[str, int]:
        """Calcula valores de gematría."""
        standard = 0
        ordinal = 0
        
        for i, char in enumerate(hebrew):
            if char in HEBREW_LETTERS:
                standard += HEBREW_LETTERS[char]['value']
                ordinal += (i + 1)
        
        # Reducción teosófica
        reduced = self._reduce_number(standard)
        
        return {
            'standard': standard,
            'reduced': reduced,
            'ordinal': ordinal
        }
    
    def _reduce_number(self, n: int) -> int:
        """Reduce un número a un solo dígito (1-9)."""
        while n > 9:
            n = sum(int(d) for d in str(n))
        return n
    
    def _get_numerical_meaning(self, standard: int, reduced: int) -> str:
        """Genera interpretación del valor numérico."""
        meanings = {
            1: "Energía de inicio, liderazgo e independencia.",
            2: "Vibración de cooperación, sensibilidad y diplomacia.",
            3: "Frecuencia de expresión, creatividad y comunicación.",
            4: "Resonancia de estabilidad, trabajo y fundamento.",
            5: "Energía de cambio, libertad y aventura.",
            6: "Vibración de amor, responsabilidad y armonía.",
            7: "Frecuencia de introspección, espiritualidad y análisis.",
            8: "Resonancia de poder, abundancia y logro material.",
            9: "Energía de culminación, humanitarismo y sabiduría universal."
        }
        
        base_meaning = meanings.get(reduced, "Energía única en manifestación.")
        
        # Agregar significado del valor completo si es notable
        notable_numbers = {
            11: "Número maestro: intuición elevada y visión espiritual.",
            22: "Número maestro: capacidad de construir a gran escala.",
            33: "Número maestro: maestro sanador y enseñante.",
            18: "Chai (vida) en hebreo - bendición vital.",
            26: "Valor del Tetragramatón (YHVH) - conexión divina."
        }
        
        if standard in notable_numbers:
            return f"{base_meaning} {notable_numbers[standard]}"
        
        return base_meaning
    
    def _find_shared_letters(self, analyses: List[Dict]) -> List[Dict]:
        """Encuentra letras compartidas entre nombres."""
        # Recolectar todas las letras por nombre
        letter_to_names = {}
        
        for analysis in analyses:
            for letter in analysis['letters']:
                if letter not in letter_to_names:
                    letter_to_names[letter] = []
                letter_to_names[letter].append(analysis['name'])
        
        # Filtrar solo letras compartidas por 2+ personas
        shared = []
        for letter, names in letter_to_names.items():
            if len(names) >= 2 and letter in HEBREW_LETTERS:
                shared.append({
                    'letter': HEBREW_LETTERS[letter]['name'],
                    'hebrew_letter': letter,
                    'meaning': HEBREW_LETTERS[letter]['meaning'],
                    'shared_by': names
                })
        
        return shared
    
    def _find_numerical_resonances(self, analyses: List[Dict]) -> List[Dict]:
        """Encuentra resonancias numéricas entre nombres."""
        resonances = []
        
        # Buscar valores iguales (standard o reducido)
        value_to_names_standard = {}
        value_to_names_reduced = {}
        
        for analysis in analyses:
            std = analysis['gematria']['standard']
            red = analysis['gematria']['reduced']
            
            if std not in value_to_names_standard:
                value_to_names_standard[std] = []
            value_to_names_standard[std].append(analysis['name'])
            
            if red not in value_to_names_reduced:
                value_to_names_reduced[red] = []
            value_to_names_reduced[red].append(analysis['name'])
        
        # Resonancias de valor completo
        for value, names in value_to_names_standard.items():
            if len(names) >= 2:
                resonances.append({
                    'value': value,
                    'names_involved': names,
                    'interpretation': f"Comparten el mismo valor gematríco ({value})",
                    'combined_meaning': f"Una profunda conexión energética que sugiere propósitos compartidos."
                })
        
        # Resonancias de valor reducido
        for value, names in value_to_names_reduced.items():
            if len(names) >= 2:
                already_added = any(set(r['names_involved']) == set(names) for r in resonances)
                if not already_added:
                    resonances.append({
                        'value': value,
                        'names_involved': names,
                        'interpretation': f"Comparten el número esencial ({value})",
                        'combined_meaning': ARCHETYPES.get(value, "Vibración compartida") + " como tema común."
                    })
        
        # Buscar sumas significativas
        if len(analyses) >= 2:
            total = sum(a['gematria']['standard'] for a in analyses)
            reduced_total = self._reduce_number(total)
            resonances.append({
                'value': total,
                'names_involved': [a['name'] for a in analyses],
                'interpretation': f"Suma total: {total} (reduce a {reduced_total})",
                'combined_meaning': f"La energía combinada de la familia vibra en {ARCHETYPES.get(reduced_total, 'frecuencia única')}."
            })
        
        return resonances
    
    def _detect_family_patterns(self, analyses: List[Dict], members: List[Dict]) -> List[str]:
        """Detecta patrones familiares simbólicos."""
        patterns = []
        
        # Patrón: misma Sefirá predominante
        sefirot = [a['sefira_resonance'] for a in analyses]
        from collections import Counter
        sefira_counts = Counter(sefirot)
        most_common = sefira_counts.most_common(1)
        if most_common and most_common[0][1] >= 2:
            patterns.append(
                f"Tendencia familiar hacia {most_common[0][0]}: "
                f"{most_common[0][1]} miembros resuenan con esta Sefirá."
            )
        
        # Patrón: equilibrio pillares
        pillar_left = ['Biná', 'Gevurá', 'Hod']
        pillar_right = ['Jojmá', 'Jésed', 'Nétzaj']
        pillar_center = ['Kéter', 'Tiféret', 'Yesod']
        
        left_count = sum(1 for s in sefirot if any(p in s for p in pillar_left))
        right_count = sum(1 for s in sefirot if any(p in s for p in pillar_right))
        center_count = sum(1 for s in sefirot if any(p in s for p in pillar_center))
        
        if left_count > right_count + center_count:
            patterns.append("Predominio del Pilar Izquierdo (Rigor): familia orientada a límites, estructura, análisis.")
        elif right_count > left_count + center_count:
            patterns.append("Predominio del Pilar Derecho (Misericordia): familia orientada a expansión, amor, emoción.")
        elif center_count > left_count and center_count > right_count:
            patterns.append("Predominio del Pilar Central (Equilibrio): familia buscadora de armonía y síntesis.")
        
        # Patrón: números maestros
        master_numbers = [11, 22, 33]
        for analysis in analyses:
            if analysis['gematria']['standard'] in master_numbers:
                patterns.append(
                    f"{analysis['name']} porta un número maestro ({analysis['gematria']['standard']}): "
                    f"potencial de liderazgo espiritual en la familia."
                )
        
        return patterns
    
    def _generate_questions(
        self, 
        analyses: List[Dict], 
        shared_letters: List[Dict],
        resonances: List[Dict],
        members: List[Dict]
    ) -> List[Dict]:
        """Genera preguntas reflexivas basadas en el análisis."""
        questions = []
        
        # Pregunta sobre letras compartidas
        if shared_letters:
            most_shared = max(shared_letters, key=lambda x: len(x['shared_by']))
            questions.append({
                'question': f"La letra {most_shared['letter']} ({most_shared['hebrew_letter']}) "
                           f"significa '{most_shared['meaning']}'. "
                           f"¿Qué rol juega este tema en tu familia?",
                'context': f"Esta letra está presente en: {', '.join(most_shared['shared_by'])}",
                'names_involved': most_shared['shared_by']
            })
        
        # Pregunta sobre resonancias numéricas
        if resonances:
            questions.append({
                'question': f"Los nombres de tu familia suman {resonances[-1]['value']}. "
                           f"¿Cómo se manifiesta esta energía de '{ARCHETYPES.get(self._reduce_number(resonances[-1]['value']), 'unión')}' "
                           f"en el día a día familiar?",
                'context': resonances[-1]['combined_meaning'],
                'names_involved': resonances[-1]['names_involved']
            })
        
        # Pregunta sobre diferencias
        if len(analyses) >= 2:
            # Buscar la mayor diferencia numérica
            max_diff = 0
            pair = None
            for i, a1 in enumerate(analyses):
                for a2 in analyses[i+1:]:
                    diff = abs(a1['gematria']['standard'] - a2['gematria']['standard'])
                    if diff > max_diff:
                        max_diff = diff
                        pair = (a1, a2)
            
            if pair:
                questions.append({
                    'question': f"Entre {pair[0]['name']} ({pair[0]['gematria']['standard']}) y "
                               f"{pair[1]['name']} ({pair[1]['gematria']['standard']}) hay una diferencia de {max_diff}. "
                               f"¿Qué tensión creativa o complementariedad representa esto?",
                    'context': "Las diferencias numéricas revelan polaridades que pueden ser fuente de conflicto o crecimiento.",
                    'names_involved': [pair[0]['name'], pair[1]['name']]
                })
        
        # Pregunta sobre arquetipos
        archetypes_present = list(set(a['archetype'] for a in analyses))
        if len(archetypes_present) >= 2:
            questions.append({
                'question': f"Tu familia tiene los arquetipos: {', '.join(archetypes_present)}. "
                           f"¿Cómo se complementan o desafían mutuamente estos roles?",
                'context': "Los arquetipos familiares crean una dinámica que influye en cada miembro.",
                'names_involved': [a['name'] for a in analyses]
            })
        
        return questions
    
    def _generate_synthesis(
        self, 
        analyses: List[Dict],
        shared_letters: List[Dict],
        family_patterns: List[str]
    ) -> str:
        """Genera una síntesis narrativa del análisis."""
        names = [a['name'] for a in analyses]
        
        synthesis_parts = [
            f"El análisis de los nombres {', '.join(names)} revela un tejido simbólico único."
        ]
        
        if shared_letters:
            letter_themes = [sl['meaning'] for sl in shared_letters[:2]]
            synthesis_parts.append(
                f"Las letras compartidas hablan de temas como: {' y '.join(letter_themes)}."
            )
        
        if family_patterns:
            synthesis_parts.append(family_patterns[0])
        
        # Agregar observación final
        total_value = sum(a['gematria']['standard'] for a in analyses)
        synthesis_parts.append(
            f"El valor total de {total_value} sugiere que esta constelación familiar "
            f"tiene un propósito específico que se revela cuando se trabaja en armonía."
        )
        
        return " ".join(synthesis_parts)
