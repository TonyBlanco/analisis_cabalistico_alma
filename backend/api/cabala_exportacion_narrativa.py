"""
cabala_exportacion_narrativa.py - Exportación Narrativa Hermosa

En lugar de reportes técnicos, genera:
- "Carta del Alma" (documento narrativo hermoso)
- "Mapa del Viaje" (estructura visual del proceso)
- "Libro de tu Proceso" (compilación completa)

⚠️ NOTA: Los reportes técnicos son fríos. Este módulo crea documentos
"enmarcables" que el consultante puede valorar y compartir.
"""

from datetime import datetime, date
from typing import Dict, List, Optional, Any
import logging
import json

logger = logging.getLogger(__name__)


class ExportacionNarrativaGenerator:
    """
    Genera documentos narrativos hermosos del proceso terapéutico.
    
    Tipos de exportación:
    1. Carta del Alma - Documento narrativo personal
    2. Mapa del Viaje - Resumen visual del proceso
    3. Libro del Proceso - Compilación completa PDF-ready
    """
    
    # Plantillas poéticas por Sefirá
    SEFIRA_POETRY = {
        'keter': {
            'title': 'La Corona del Ser',
            'verse': 'En el silencio donde todo comienza, tu esencia espera ser recordada.',
            'color': '#FFFFFF',
            'element': 'Luz Pura'
        },
        'chokmah': {
            'title': 'El Destello de Sabiduría',
            'verse': 'Como el primer rayo de luz en la oscuridad, la sabiduría surge sin esfuerzo.',
            'color': '#808080',
            'element': 'El Punto'
        },
        'binah': {
            'title': 'El Vientre de Comprensión',
            'verse': 'En el silencio fértil del entendimiento, la forma encuentra su hogar.',
            'color': '#000000',
            'element': 'El Vacío Creador'
        },
        'chesed': {
            'title': 'El Abrazo Infinito',
            'verse': 'Como un río que no conoce orillas, el amor fluye sin pedir nada a cambio.',
            'color': '#0000FF',
            'element': 'Agua'
        },
        'gevurah': {
            'title': 'El Fuego del Discernimiento',
            'verse': 'En el crisol de la disciplina, el oro del alma se purifica.',
            'color': '#FF0000',
            'element': 'Fuego'
        },
        'tiferet': {
            'title': 'El Sol del Corazón',
            'verse': 'En el centro exacto de tu ser, belleza y verdad se encuentran.',
            'color': '#FFD700',
            'element': 'Sol'
        },
        'netzach': {
            'title': 'La Danza de la Victoria',
            'verse': 'El corazón que siente sin temor, conquista lo que el miedo esconde.',
            'color': '#00FF00',
            'element': 'Venus'
        },
        'hod': {
            'title': 'El Esplendor del Pensamiento',
            'verse': 'Cuando la mente sirve al corazón, las palabras se vuelven puentes.',
            'color': '#FFA500',
            'element': 'Mercurio'
        },
        'yesod': {
            'title': 'El Fundamento de los Sueños',
            'verse': 'En el espejo de la luna, el alma recuerda lo que la mente olvida.',
            'color': '#800080',
            'element': 'Luna'
        },
        'malkuth': {
            'title': 'El Reino Sagrado',
            'verse': 'Cada paso sobre la tierra es una oración, cada respiración un milagro.',
            'color': '#8B4513',
            'element': 'Tierra'
        }
    }
    
    # Arquetipos del viaje
    JOURNEY_ARCHETYPES = {
        'inicio': {
            'name': 'El Llamado',
            'description': 'Algo en ti supo que había más. Un susurro, una inquietud, un dolor que pedía ser escuchado.'
        },
        'descenso': {
            'name': 'El Descenso',
            'description': 'Miraste hacia adentro, hacia las sombras que todos evitan. Encontraste partes de ti que esperaban ser vistas.'
        },
        'encuentro': {
            'name': 'El Encuentro',
            'description': 'En lo profundo, algo antiguo te esperaba. No un enemigo, sino un maestro disfrazado.'
        },
        'transformacion': {
            'name': 'La Transformación',
            'description': 'Lo que eras ya no cabe en quien te estás convirtiendo. La crisálida se rompe.'
        },
        'integracion': {
            'name': 'La Integración',
            'description': 'Las piezas que parecían contradictorias encuentran su lugar. Eres más tú que nunca.'
        },
        'retorno': {
            'name': 'El Retorno',
            'description': 'Regresas al mundo, pero ya no eres el mismo. Lo ordinario se revela extraordinario.'
        }
    }
    
    def generate_soul_letter(
        self,
        consultante_name: str,
        birth_date: date,
        process_summary: Dict,
        life_events: List[Dict] = None,
        therapist_notes: str = None
    ) -> Dict[str, Any]:
        """
        Genera una "Carta del Alma" - documento narrativo hermoso.
        
        Args:
            consultante_name: Nombre del consultante
            birth_date: Fecha de nacimiento
            process_summary: Resumen del proceso terapéutico
            life_events: Eventos de vida significativos
            therapist_notes: Notas del terapeuta (opcional)
            
        Returns:
            Diccionario con la carta estructurada
        """
        today = date.today()
        age = self._calculate_age(birth_date, today)
        
        # Obtener Sefirá actual
        current_sefira = self._get_current_sefira(age)
        sefira_poetry = self.SEFIRA_POETRY.get(current_sefira, {})
        
        letter = {
            'type': 'soul_letter',
            'generated_at': datetime.now().isoformat(),
            'consultante': consultante_name,
            'title': f"Carta del Alma para {consultante_name}",
            'subtitle': f"Un mapa de tu viaje interior • {today.strftime('%d de %B de %Y')}",
            
            'opening': self._generate_opening(consultante_name, age, current_sefira),
            
            'current_chapter': {
                'title': sefira_poetry.get('title', current_sefira),
                'sefira': current_sefira,
                'age': age,
                'verse': sefira_poetry.get('verse', ''),
                'narrative': self._generate_current_narrative(current_sefira, age, process_summary)
            },
            
            'journey_so_far': self._generate_journey_narrative(birth_date, life_events),
            
            'patterns_revealed': self._generate_patterns_narrative(process_summary),
            
            'shadow_work': self._generate_shadow_narrative(process_summary),
            
            'gifts_discovered': self._generate_gifts_narrative(process_summary),
            
            'path_forward': self._generate_path_narrative(current_sefira, process_summary),
            
            'closing': self._generate_closing(consultante_name),
            
            'blessing': self._generate_blessing(current_sefira),
            
            'metadata': {
                'birth_date': birth_date.isoformat(),
                'current_age': age,
                'current_sefira': current_sefira,
                'export_format': 'soul_letter'
            }
        }
        
        if therapist_notes:
            letter['therapist_dedication'] = {
                'title': 'Palabras de tu Acompañante',
                'content': therapist_notes
            }
        
        return letter
    
    def generate_journey_map(
        self,
        consultante_name: str,
        birth_date: date,
        life_events: List[Dict],
        process_milestones: List[Dict] = None
    ) -> Dict[str, Any]:
        """
        Genera un "Mapa del Viaje" - estructura visual del proceso.
        
        Returns:
            Estructura lista para visualización
        """
        today = date.today()
        age = self._calculate_age(birth_date, today)
        
        journey_map = {
            'type': 'journey_map',
            'generated_at': datetime.now().isoformat(),
            'consultante': consultante_name,
            'title': f"Mapa del Viaje de {consultante_name}",
            
            'life_timeline': self._generate_life_timeline(birth_date, life_events, today),
            
            'sefirotic_journey': self._generate_sefirotic_journey(birth_date, age),
            
            'cycle_map': self._generate_cycle_map(birth_date, age),
            
            'shadow_terrain': self._generate_shadow_terrain(life_events),
            
            'light_peaks': self._generate_light_peaks(life_events),
            
            'current_position': {
                'age': age,
                'sefira': self._get_current_sefira(age),
                'cycle_year': (age % 10) + 1,
                'description': 'Tu posición actual en el mapa del alma'
            },
            
            'legend': self._generate_map_legend(),
            
            'visual_data': {
                'tree_of_life_positions': self._calculate_tree_positions(age),
                'timeline_events': self._format_timeline_events(birth_date, life_events)
            }
        }
        
        if process_milestones:
            journey_map['therapeutic_milestones'] = self._format_milestones(process_milestones)
        
        return journey_map
    
    def generate_process_book(
        self,
        consultante_name: str,
        birth_date: date,
        complete_analysis: Dict,
        life_events: List[Dict],
        test_results: List[Dict] = None,
        therapist_observations: List[Dict] = None
    ) -> Dict[str, Any]:
        """
        Genera el "Libro de tu Proceso" - compilación completa.
        
        Returns:
            Estructura completa lista para PDF
        """
        today = date.today()
        age = self._calculate_age(birth_date, today)
        current_sefira = self._get_current_sefira(age)
        
        book = {
            'type': 'process_book',
            'generated_at': datetime.now().isoformat(),
            'consultante': consultante_name,
            
            'cover': {
                'title': 'El Libro de Tu Alma',
                'subtitle': f'El Viaje de {consultante_name}',
                'date': today.strftime('%Y'),
                'sefira_symbol': self._get_sefira_symbol(current_sefira)
            },
            
            'dedication': {
                'text': f"Para {consultante_name},\nque tuvo el coraje de mirarse\ny la gracia de transformarse."
            },
            
            'table_of_contents': [
                {'chapter': 1, 'title': 'El Llamado', 'page': 1},
                {'chapter': 2, 'title': 'El Mapa del Alma', 'page': 5},
                {'chapter': 3, 'title': 'Los Ciclos de Tu Vida', 'page': 15},
                {'chapter': 4, 'title': 'Las Sombras Encontradas', 'page': 25},
                {'chapter': 5, 'title': 'Los Dones Descubiertos', 'page': 35},
                {'chapter': 6, 'title': 'El Camino que Sigue', 'page': 45},
                {'chapter': 7, 'title': 'Bendiciones y Cierre', 'page': 55}
            ],
            
            'chapters': [
                self._generate_chapter_calling(consultante_name),
                self._generate_chapter_soul_map(birth_date, age),
                self._generate_chapter_cycles(birth_date, life_events),
                self._generate_chapter_shadows(complete_analysis, life_events),
                self._generate_chapter_gifts(complete_analysis),
                self._generate_chapter_path(current_sefira, complete_analysis),
                self._generate_chapter_blessing(consultante_name, current_sefira)
            ],
            
            'appendices': {
                'tree_of_life': self._generate_tree_appendix(),
                'sefirotic_cycle': self._generate_cycle_appendix(),
                'glossary': self._generate_glossary()
            },
            
            'colophon': {
                'text': 'Este libro fue generado como parte del proceso terapéutico holístico.',
                'disclaimer': 'El contenido es simbólico y educativo, no constituye diagnóstico clínico.',
                'date': today.isoformat()
            }
        }
        
        # Agregar datos de tests si existen
        if test_results:
            book['appendices']['clinical_journey'] = self._format_test_journey(test_results)
        
        # Agregar observaciones del terapeuta
        if therapist_observations:
            book['therapist_notes'] = self._format_therapist_notes(therapist_observations)
        
        return book
    
    # ==================== GENERADORES DE NARRATIVA ====================
    
    def _generate_opening(self, name: str, age: int, sefira: str) -> Dict:
        """Genera la apertura de la carta"""
        sefira_info = self.SEFIRA_POETRY.get(sefira, {})
        
        return {
            'salutation': f"Querido/a {name},",
            'paragraph': (
                f"A tus {age} años, te encuentras en el territorio de {sefira_info.get('title', sefira)}. "
                f"Esta carta es un espejo de tu viaje interior, un mapa de los territorios que has atravesado "
                f"y de los que aún te esperan. No es un diagnóstico ni una predicción. Es un reconocimiento."
            )
        }
    
    def _generate_current_narrative(self, sefira: str, age: int, summary: Dict) -> str:
        """Genera narrativa del momento actual"""
        sefira_info = self.SEFIRA_POETRY.get(sefira, {})
        
        narratives = {
            'keter': f"A los {age} años, estás en un momento de conexión con lo más elevado de ti. La Corona te invita a soltar el control y confiar en el misterio.",
            'chokmah': f"Este es un tiempo de sabiduría espontánea. A los {age}, las respuestas llegan antes que las preguntas si permites el silencio.",
            'binah': f"El Vientre de la Comprensión te acoge a los {age}. Es tiempo de gestar, de dar forma a lo que viene, de entender en profundidad.",
            'chesed': f"A los {age} años, el Amor Infinito te llama. Es momento de expandir, de dar, de conectar con la abundancia del corazón.",
            'gevurah': f"El Fuego del Discernimiento arde a tus {age} años. Es tiempo de establecer límites sanos, de purificar lo que ya no sirve.",
            'tiferet': f"El Sol del Corazón brilla en tu centro a los {age}. Momento de integración, de encontrar belleza en la verdad y verdad en la belleza.",
            'netzach': f"La Victoria Emocional te espera a los {age}. Es tiempo de sentir plenamente, de dejarte mover por lo que amas.",
            'hod': f"El Esplendor del Pensamiento ilumina tus {age} años. Las palabras tienen poder ahora; úsalas para construir puentes.",
            'yesod': f"Los Sueños tienen mensajes para ti a los {age}. El Fundamento lunar te conecta con lo inconsciente que busca luz.",
            'malkuth': f"El Reino de lo concreto te recibe a los {age}. Es tiempo de encarnar, de hacer realidad, de honrar el cuerpo y la tierra."
        }
        
        return narratives.get(sefira, f"A los {age} años, continúas tu camino único de descubrimiento.")
    
    def _generate_journey_narrative(self, birth_date: date, events: List[Dict]) -> Dict:
        """Genera narrativa del viaje"""
        if not events:
            return {
                'title': 'El Camino Recorrido',
                'narrative': 'Tu historia está escribiéndose. Cada día añade un verso al poema de tu vida.'
            }
        
        # Clasificar eventos
        challenges = [e for e in events if e.get('severity', '').lower() in ['alto', 'severo', 'high', 'severe']]
        triumphs = [e for e in events if e.get('type', '').lower() in ['logro', 'triumph', 'achievement']]
        
        narrative = {
            'title': 'El Camino Recorrido',
            'intro': f"Has atravesado {len(events)} momentos significativos que conocemos.",
        }
        
        if challenges:
            narrative['challenges'] = {
                'count': len(challenges),
                'text': f"Has enfrentado {len(challenges)} desafíos que forjaron tu resiliencia. Cada uno fue un maestro disfrazado."
            }
        
        if triumphs:
            narrative['triumphs'] = {
                'count': len(triumphs),
                'text': f"Has celebrado {len(triumphs)} victorias que iluminaron tu camino. Son recordatorios de tu capacidad."
            }
        
        narrative['closing'] = "Y entre los momentos registrados, hay miles más que solo tú conoces. Todos cuentan."
        
        return narrative
    
    def _generate_patterns_narrative(self, summary: Dict) -> Dict:
        """Genera narrativa sobre patrones revelados"""
        patterns = summary.get('shadow_patterns', {})
        
        return {
            'title': 'Los Patrones Revelados',
            'intro': 'En el tapiz de tu vida, ciertos hilos se repiten. No son casualidad; son invitaciones.',
            'patterns': [
                {
                    'name': 'Ritmos Cíclicos',
                    'description': 'Tu vida sigue ritmos de aproximadamente 9-10 años. Cada ciclo es una vuelta en la espiral del crecimiento.'
                },
                {
                    'name': 'Temas Recurrentes',
                    'description': patterns.get('most_challenging_qliphoth', 'Ciertos temas') + ' aparecen repetidamente. Son las lecciones que tu alma eligió aprender.'
                }
            ],
            'insight': 'Ver el patrón es el primer paso para transformarlo. Lo que se hace consciente, se puede elegir.'
        }
    
    def _generate_shadow_narrative(self, summary: Dict) -> Dict:
        """Genera narrativa sobre trabajo de sombra"""
        return {
            'title': 'Las Sombras Encontradas',
            'epigraph': '"Lo que niegas te somete. Lo que aceptas te transforma." - C.G. Jung',
            'intro': 'En el trabajo de sombra, descubriste partes de ti que esperaban ser vistas sin juicio.',
            'discovery': 'No hay oscuridad en ti que no sea luz pidiendo ser reconocida.',
            'integration': 'Las sombras que integraste se convirtieron en fuentes de fuerza y compasión.',
            'ongoing': 'El trabajo de sombra nunca termina del todo. Es una danza continua de luz y oscuridad que crea profundidad.'
        }
    
    def _generate_gifts_narrative(self, summary: Dict) -> Dict:
        """Genera narrativa sobre dones descubiertos"""
        return {
            'title': 'Los Dones Descubiertos',
            'intro': 'Detrás de cada herida, había un don esperando. Detrás de cada miedo, una capacidad dormida.',
            'gifts': [
                {'name': 'Resiliencia', 'description': 'La capacidad de atravesar tormentas y salir más fuerte.'},
                {'name': 'Profundidad', 'description': 'La habilidad de ver más allá de las superficies.'},
                {'name': 'Compasión', 'description': 'El entendimiento nacido de tu propio dolor.'},
                {'name': 'Autenticidad', 'description': 'El coraje de ser quien realmente eres.'}
            ],
            'closing': 'Estos dones no te fueron dados; los forjaste. Son tuyo para siempre.'
        }
    
    def _generate_path_narrative(self, current_sefira: str, summary: Dict) -> Dict:
        """Genera narrativa sobre el camino adelante"""
        sefira_info = self.SEFIRA_POETRY.get(current_sefira, {})
        
        return {
            'title': 'El Camino que Sigue',
            'intro': f"Desde {sefira_info.get('title', current_sefira)}, el camino se abre ante ti.",
            'invitation': 'No te pido que veas el final del camino. Solo el próximo paso.',
            'practices': [
                'Continúa el trabajo de autoobservación sin juicio.',
                'Honra los ciclos de tu vida como maestros.',
                'Cultiva tanto la luz como la sombra.',
                'Recuerda: el viaje es el destino.'
            ],
            'promise': 'No puedo prometerte que será fácil. Pero puedo asegurarte que valdrá la pena.'
        }
    
    def _generate_closing(self, name: str) -> Dict:
        """Genera cierre de la carta"""
        return {
            'text': (
                f"Querido/a {name}, esta carta es solo un reflejo. Tú eres el original. "
                f"Confía en tu proceso. Confía en tu camino. Confía en ti."
            ),
            'signature': 'Con profundo respeto por tu viaje,'
        }
    
    def _generate_blessing(self, sefira: str) -> Dict:
        """Genera bendición final"""
        blessings = {
            'keter': 'Que la luz de la unidad ilumine cada paso de tu camino.',
            'chokmah': 'Que la sabiduría fluya hacia ti como el agua hacia el mar.',
            'binah': 'Que la comprensión te acoja como madre a su hijo.',
            'chesed': 'Que el amor infinito te rodee y fluya a través de ti.',
            'gevurah': 'Que la fuerza del discernimiento te guíe con precisión.',
            'tiferet': 'Que la belleza del equilibrio brille en tu corazón.',
            'netzach': 'Que la victoria del amor triunfe en cada desafío.',
            'hod': 'Que el esplendor de la claridad ilumine tu mente.',
            'yesod': 'Que los sueños te revelen lo que el día oculta.',
            'malkuth': 'Que cada paso en esta tierra sea una bendición.'
        }
        
        return {
            'title': 'Bendición',
            'text': blessings.get(sefira, 'Que la luz te acompañe en tu camino.'),
            'closing': '✡️'
        }
    
    # ==================== GENERADORES DE MAPA ====================
    
    def _generate_life_timeline(self, birth_date: date, events: List[Dict], today: date) -> List[Dict]:
        """Genera timeline de vida"""
        timeline = []
        
        # Nacimiento
        timeline.append({
            'date': birth_date.isoformat(),
            'age': 0,
            'type': 'birth',
            'title': 'Nacimiento',
            'description': 'El viaje comienza'
        })
        
        # Eventos de vida
        for event in (events or []):
            event_date = self._parse_date(event.get('date'))
            if event_date:
                timeline.append({
                    'date': event_date.isoformat(),
                    'age': self._calculate_age(birth_date, event_date),
                    'type': event.get('type', 'event'),
                    'title': event.get('description', 'Evento')[:50],
                    'severity': event.get('severity', 'normal')
                })
        
        # Hoy
        timeline.append({
            'date': today.isoformat(),
            'age': self._calculate_age(birth_date, today),
            'type': 'present',
            'title': 'Hoy',
            'description': 'Tu posición actual'
        })
        
        return sorted(timeline, key=lambda x: x['date'])
    
    def _generate_sefirotic_journey(self, birth_date: date, current_age: int) -> List[Dict]:
        """Genera viaje sefirótico completo"""
        journey = []
        
        for age in range(current_age + 1):
            cycle_year = (age % 10) + 1
            sefira = self._get_sefira_for_cycle_year(cycle_year)
            
            journey.append({
                'age': age,
                'cycle': age // 10 + 1,
                'cycle_year': cycle_year,
                'sefira': sefira,
                'sefira_title': self.SEFIRA_POETRY.get(sefira, {}).get('title', sefira)
            })
        
        return journey
    
    def _generate_cycle_map(self, birth_date: date, current_age: int) -> Dict:
        """Genera mapa de ciclos"""
        total_cycles = current_age // 10
        current_cycle_year = (current_age % 10) + 1
        
        return {
            'total_cycles_completed': total_cycles,
            'current_cycle_number': total_cycles + 1,
            'current_cycle_year': current_cycle_year,
            'years_to_cycle_completion': 10 - current_cycle_year + 1,
            'cycle_progress_percent': (current_cycle_year / 10) * 100
        }
    
    def _generate_shadow_terrain(self, events: List[Dict]) -> List[Dict]:
        """Genera terreno de sombras (eventos difíciles)"""
        return [
            {
                'date': e.get('date'),
                'type': e.get('type'),
                'description': e.get('description', '')[:30]
            }
            for e in (events or [])
            if e.get('severity', '').lower() in ['alto', 'severo', 'high', 'severe']
        ]
    
    def _generate_light_peaks(self, events: List[Dict]) -> List[Dict]:
        """Genera picos de luz (eventos positivos)"""
        return [
            {
                'date': e.get('date'),
                'type': e.get('type'),
                'description': e.get('description', '')[:30]
            }
            for e in (events or [])
            if e.get('type', '').lower() in ['logro', 'triumph', 'achievement', 'joy']
        ]
    
    def _generate_map_legend(self) -> Dict:
        """Genera leyenda del mapa"""
        return {
            'colors': {
                'gold': 'Momentos de luz y logro',
                'purple': 'Momentos de transformación profunda',
                'blue': 'Momentos de expansión',
                'red': 'Momentos de desafío y purificación',
                'green': 'Momentos de crecimiento'
            },
            'symbols': {
                '☀️': 'Tiferet - Centro/Equilibrio',
                '🌙': 'Yesod - Sueños/Fundamento',
                '⭐': 'Keter - Conexión divina',
                '🔥': 'Gevurah - Disciplina/Purificación',
                '💧': 'Chesed - Amor/Expansión'
            }
        }
    
    # ==================== GENERADORES DE CAPÍTULOS ====================
    
    def _generate_chapter_calling(self, name: str) -> Dict:
        """Capítulo 1: El Llamado"""
        archetype = self.JOURNEY_ARCHETYPES['inicio']
        return {
            'number': 1,
            'title': archetype['name'],
            'epigraph': '"El viaje de mil millas comienza con un solo paso." - Lao Tzu',
            'content': [
                f"Querido/a {name},",
                archetype['description'],
                "Este libro es el registro de tu respuesta a ese llamado.",
                "No es un libro de respuestas. Es un libro de preguntas que se volvieron caminos."
            ]
        }
    
    def _generate_chapter_soul_map(self, birth_date: date, age: int) -> Dict:
        """Capítulo 2: El Mapa del Alma"""
        current_sefira = self._get_current_sefira(age)
        
        return {
            'number': 2,
            'title': 'El Mapa del Alma',
            'epigraph': '"Como es arriba, es abajo." - Hermes Trismegisto',
            'content': [
                "El Árbol de la Vida es un mapa del cosmos y del alma.",
                f"Naciste el {birth_date.strftime('%d de %B de %Y')}.",
                f"Hoy tienes {age} años y te encuentras en {self.SEFIRA_POETRY.get(current_sefira, {}).get('title', current_sefira)}.",
                "Este mapa no dicta tu destino. Ilumina el territorio para que puedas elegir tu camino."
            ],
            'tree_diagram': self._generate_tree_description()
        }
    
    def _generate_chapter_cycles(self, birth_date: date, events: List[Dict]) -> Dict:
        """Capítulo 3: Los Ciclos"""
        return {
            'number': 3,
            'title': 'Los Ciclos de Tu Vida',
            'epigraph': '"Para todo hay un tiempo, y un momento para cada cosa bajo el cielo." - Eclesiastés 3:1',
            'content': [
                "Tu vida se mueve en ciclos de aproximadamente 9-10 años.",
                "Cada ciclo te lleva a través de las 10 Sefirot del Árbol.",
                "Los eventos de tu vida tienden a rimar con estos ritmos.",
                "Conocer tus ciclos te permite navegar con mayor consciencia."
            ],
            'cycle_summary': self._summarize_cycles(birth_date, events)
        }
    
    def _generate_chapter_shadows(self, analysis: Dict, events: List[Dict]) -> Dict:
        """Capítulo 4: Las Sombras"""
        archetype = self.JOURNEY_ARCHETYPES['descenso']
        
        return {
            'number': 4,
            'title': 'Las Sombras Encontradas',
            'epigraph': '"Lo que niegas te somete. Lo que aceptas te transforma." - C.G. Jung',
            'intro': archetype['description'],
            'content': [
                "El trabajo de sombra no es destruir lo oscuro, sino iluminarlo.",
                "Cada sombra que miraste de frente perdió su poder sobre ti.",
                "Lo que integraste se convirtió en fuerza."
            ],
            'shadow_summary': analysis.get('shadow_patterns', {})
        }
    
    def _generate_chapter_gifts(self, analysis: Dict) -> Dict:
        """Capítulo 5: Los Dones"""
        return {
            'number': 5,
            'title': 'Los Dones Descubiertos',
            'epigraph': '"La herida es el lugar por donde entra la luz." - Rumi',
            'content': [
                "Detrás de cada herida, esperaba un don.",
                "Tu resiliencia nació de lo que sobreviviste.",
                "Tu compasión nació de tu propio dolor.",
                "Tu profundidad nació de tu disposición a mirar.",
                "Estos dones no te fueron dados. Los forjaste."
            ]
        }
    
    def _generate_chapter_path(self, current_sefira: str, analysis: Dict) -> Dict:
        """Capítulo 6: El Camino"""
        archetype = self.JOURNEY_ARCHETYPES['retorno']
        sefira_info = self.SEFIRA_POETRY.get(current_sefira, {})
        
        return {
            'number': 6,
            'title': 'El Camino que Sigue',
            'epigraph': sefira_info.get('verse', ''),
            'intro': archetype['description'],
            'content': [
                f"Desde {sefira_info.get('title', current_sefira)}, nuevos horizontes se abren.",
                "No necesitas ver todo el camino. Solo el próximo paso.",
                "Confía en lo que has aprendido.",
                "Confía en lo que aún no sabes.",
                "El viaje continúa."
            ]
        }
    
    def _generate_chapter_blessing(self, name: str, current_sefira: str) -> Dict:
        """Capítulo 7: Bendiciones"""
        return {
            'number': 7,
            'title': 'Bendiciones y Cierre',
            'content': [
                f"Querido/a {name},",
                "Este libro llega a su fin, pero tu historia continúa.",
                "Que lo escrito aquí sea un recordatorio de tu viaje.",
                "Que sea un espejo de tu valentía.",
                "Que sea un mapa cuando pierdas el camino.",
                "",
                self._generate_blessing(current_sefira)['text']
            ],
            'final_symbol': '✡️'
        }
    
    # ==================== APÉNDICES ====================
    
    def _generate_tree_appendix(self) -> Dict:
        """Apéndice: El Árbol de la Vida"""
        return {
            'title': 'El Árbol de la Vida',
            'description': 'Mapa cabalístico de la creación y el alma',
            'sefirot': [
                {'name': 'Keter', 'meaning': 'Corona', 'position': 'Cima'},
                {'name': 'Chokmah', 'meaning': 'Sabiduría', 'position': 'Derecha superior'},
                {'name': 'Binah', 'meaning': 'Entendimiento', 'position': 'Izquierda superior'},
                {'name': 'Chesed', 'meaning': 'Misericordia', 'position': 'Derecha media'},
                {'name': 'Gevurah', 'meaning': 'Severidad', 'position': 'Izquierda media'},
                {'name': 'Tiferet', 'meaning': 'Belleza', 'position': 'Centro'},
                {'name': 'Netzach', 'meaning': 'Victoria', 'position': 'Derecha inferior'},
                {'name': 'Hod', 'meaning': 'Esplendor', 'position': 'Izquierda inferior'},
                {'name': 'Yesod', 'meaning': 'Fundamento', 'position': 'Centro inferior'},
                {'name': 'Malkuth', 'meaning': 'Reino', 'position': 'Base'}
            ]
        }
    
    def _generate_cycle_appendix(self) -> Dict:
        """Apéndice: Ciclos Sefiróticos"""
        return {
            'title': 'El Ciclo de 10 Años',
            'description': 'Cada año de tu vida corresponde a una Sefirá diferente',
            'cycle': [
                {'year': 1, 'sefira': 'Malkuth', 'theme': 'Manifestación y cuerpo'},
                {'year': 2, 'sefira': 'Yesod', 'theme': 'Sueños y fundamentos'},
                {'year': 3, 'sefira': 'Hod', 'theme': 'Comunicación y análisis'},
                {'year': 4, 'sefira': 'Netzach', 'theme': 'Emociones y creatividad'},
                {'year': 5, 'sefira': 'Tiferet', 'theme': 'Equilibrio y corazón'},
                {'year': 6, 'sefira': 'Gevurah', 'theme': 'Límites y disciplina'},
                {'year': 7, 'sefira': 'Chesed', 'theme': 'Expansión y amor'},
                {'year': 8, 'sefira': 'Binah', 'theme': 'Comprensión profunda'},
                {'year': 9, 'sefira': 'Chokmah', 'theme': 'Sabiduría espontánea'},
                {'year': 10, 'sefira': 'Keter', 'theme': 'Conexión con lo divino'}
            ]
        }
    
    def _generate_glossary(self) -> List[Dict]:
        """Glosario de términos"""
        return [
            {'term': 'Sefirá', 'definition': 'Emanación divina; esfera en el Árbol de la Vida'},
            {'term': 'Qliphah', 'definition': 'Cáscara o sombra de una Sefirá; aspecto no integrado'},
            {'term': 'Árbol de la Vida', 'definition': 'Mapa cabalístico del cosmos y la psique'},
            {'term': 'Ciclo Sefirótico', 'definition': 'Período de 10 años que recorre las Sefirot'},
            {'term': 'Trabajo de Sombra', 'definition': 'Integración consciente de aspectos rechazados del ser'},
            {'term': 'Tikkun', 'definition': 'Reparación del alma; trabajo de corrección personal'}
        ]
    
    # ==================== UTILIDADES ====================
    
    def _calculate_age(self, birth_date: date, target_date: date) -> int:
        """Calcula edad"""
        age = target_date.year - birth_date.year
        if (target_date.month, target_date.day) < (birth_date.month, birth_date.day):
            age -= 1
        return age
    
    def _parse_date(self, date_value) -> Optional[date]:
        """Parsea fecha"""
        if isinstance(date_value, date):
            return date_value
        if isinstance(date_value, datetime):
            return date_value.date()
        if isinstance(date_value, str):
            try:
                return datetime.fromisoformat(date_value.replace('Z', '+00:00')).date()
            except:
                return None
        return None
    
    def _get_current_sefira(self, age: int) -> str:
        """Obtiene Sefirá actual por edad"""
        cycle_year = (age % 10) + 1
        return self._get_sefira_for_cycle_year(cycle_year)
    
    def _get_sefira_for_cycle_year(self, cycle_year: int) -> str:
        """Mapea año del ciclo a Sefirá"""
        mapping = {
            1: 'malkuth', 2: 'yesod', 3: 'hod', 4: 'netzach', 5: 'tiferet',
            6: 'gevurah', 7: 'chesed', 8: 'binah', 9: 'chokmah', 10: 'keter'
        }
        return mapping.get(cycle_year, 'malkuth')
    
    def _get_sefira_symbol(self, sefira: str) -> str:
        """Símbolo de Sefirá"""
        symbols = {
            'keter': '👑', 'chokmah': '⚡', 'binah': '🌙', 'chesed': '💙',
            'gevurah': '🔥', 'tiferet': '☀️', 'netzach': '💚', 'hod': '🧡',
            'yesod': '💜', 'malkuth': '🌍'
        }
        return symbols.get(sefira, '✡️')
    
    def _generate_tree_description(self) -> str:
        """Descripción del árbol para el capítulo"""
        return (
            "El Árbol de la Vida tiene 10 esferas (Sefirot) conectadas por 22 senderos. "
            "Representa tanto la estructura del universo como el mapa del alma humana. "
            "Cada Sefirá es una cualidad divina que también existe en ti."
        )
    
    def _summarize_cycles(self, birth_date: date, events: List[Dict]) -> Dict:
        """Resume los ciclos vividos"""
        today = date.today()
        age = self._calculate_age(birth_date, today)
        
        return {
            'cycles_completed': age // 10,
            'current_cycle': (age // 10) + 1,
            'current_year_in_cycle': (age % 10) + 1,
            'events_per_cycle': self._count_events_per_cycle(birth_date, events)
        }
    
    def _count_events_per_cycle(self, birth_date: date, events: List[Dict]) -> Dict:
        """Cuenta eventos por ciclo"""
        counts = {}
        for event in (events or []):
            event_date = self._parse_date(event.get('date'))
            if event_date:
                age_at_event = self._calculate_age(birth_date, event_date)
                cycle = (age_at_event // 10) + 1
                counts[f'Ciclo {cycle}'] = counts.get(f'Ciclo {cycle}', 0) + 1
        return counts
    
    def _calculate_tree_positions(self, age: int) -> Dict:
        """Calcula posiciones en el árbol para visualización"""
        current_sefira = self._get_current_sefira(age)
        
        # Posiciones normalizadas (0-1) para visualización
        positions = {
            'keter': {'x': 0.5, 'y': 0.0},
            'chokmah': {'x': 0.75, 'y': 0.15},
            'binah': {'x': 0.25, 'y': 0.15},
            'chesed': {'x': 0.75, 'y': 0.4},
            'gevurah': {'x': 0.25, 'y': 0.4},
            'tiferet': {'x': 0.5, 'y': 0.5},
            'netzach': {'x': 0.75, 'y': 0.7},
            'hod': {'x': 0.25, 'y': 0.7},
            'yesod': {'x': 0.5, 'y': 0.85},
            'malkuth': {'x': 0.5, 'y': 1.0}
        }
        
        return {
            'all_positions': positions,
            'current': current_sefira,
            'current_position': positions.get(current_sefira, {'x': 0.5, 'y': 1.0})
        }
    
    def _format_timeline_events(self, birth_date: date, events: List[Dict]) -> List[Dict]:
        """Formatea eventos para timeline visual"""
        formatted = []
        for event in (events or []):
            event_date = self._parse_date(event.get('date'))
            if event_date:
                formatted.append({
                    'date': event_date.isoformat(),
                    'age': self._calculate_age(birth_date, event_date),
                    'type': event.get('type', 'event'),
                    'label': event.get('description', '')[:30],
                    'severity': event.get('severity', 'normal')
                })
        return formatted
    
    def _format_milestones(self, milestones: List[Dict]) -> List[Dict]:
        """Formatea hitos terapéuticos"""
        return [
            {
                'date': m.get('date'),
                'title': m.get('title', 'Hito'),
                'description': m.get('description', ''),
                'significance': m.get('significance', '')
            }
            for m in milestones
        ]
    
    def _format_test_journey(self, test_results: List[Dict]) -> Dict:
        """Formatea viaje clínico"""
        return {
            'title': 'Tu Viaje Clínico',
            'description': 'Registro de evaluaciones realizadas durante el proceso',
            'tests': [
                {
                    'date': r.get('date'),
                    'name': r.get('test_name', 'Test'),
                    'result': r.get('severity', 'Normal')
                }
                for r in test_results
            ]
        }
    
    def _format_therapist_notes(self, observations: List[Dict]) -> List[Dict]:
        """Formatea notas del terapeuta"""
        return [
            {
                'date': o.get('date'),
                'note': o.get('content', ''),
                'theme': o.get('theme', '')
            }
            for o in observations
        ]
