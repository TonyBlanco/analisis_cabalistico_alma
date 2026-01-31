"""
cabala_sincronias_biograficas.py - Detector de Sincronías Biográficas

INNOVACIÓN 7: Detector automático de "coincidencias significativas" entre:
- Fechas importantes de vida ↔ Ciclos cabalísticos
- Fechas de crisis/logros ↔ Aniversarios ocultos

⚠️ ADVERTENCIA ÉTICA: Solo muestra correlaciones históricas, NO predice.
Herramienta de reflexión para trabajo terapéutico consciente.
"""

from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any, Tuple
from collections import defaultdict
import logging
import math

logger = logging.getLogger(__name__)


class SincroniaBiograficaDetector:
    """
    Detecta patrones de sincronicidad en la biografía del consultante.
    
    Busca:
    1. Ciclos de 9/10 años (cabalísticos)
    2. Ciclos de 7 años (psicológicos)
    3. Aniversarios ocultos (fechas que riman)
    4. Transiciones Sefiróticas recurrentes
    """
    
    # Ciclos significativos a buscar
    CYCLE_PATTERNS = {
        'cabalistico_9': {'years': 9, 'name': 'Ciclo Sefirótico Completo', 'significance': 'Completitud de las 9 Sefirot inferiores'},
        'cabalistico_10': {'years': 10, 'name': 'Ciclo Qliphótico Completo', 'significance': 'Vuelta completa de las 10 Qliphoth'},
        'psicologico_7': {'years': 7, 'name': 'Ciclo de Desarrollo', 'significance': 'Ciclo de transformación psicológica'},
        'saturno_29': {'years': 29, 'name': 'Retorno de Saturno', 'significance': 'Madurez y reestructuración vital'},
        'nodo_18': {'years': 18, 'name': 'Ciclo Nodal', 'significance': 'Retorno del destino kármico'},
        'jupiter_12': {'years': 12, 'name': 'Ciclo de Expansión', 'significance': 'Oportunidades y crecimiento'},
    }
    
    # Mapeo Transición Sefirá → Significado
    SEFIRA_TRANSITIONS = {
        ('malkuth', 'yesod'): 'De lo material a lo emocional-lunar',
        ('yesod', 'hod'): 'De lo emocional a lo mental',
        ('hod', 'netzach'): 'Del pensamiento al sentimiento',
        ('netzach', 'tiferet'): 'De la emoción al centro del ser',
        ('tiferet', 'gevurah'): 'Del centro a la disciplina',
        ('gevurah', 'chesed'): 'De la disciplina a la expansión',
        ('chesed', 'binah'): 'De la expansión a la comprensión',
        ('binah', 'chokmah'): 'De la comprensión a la sabiduría',
        ('chokmah', 'keter'): 'De la sabiduría a la unidad',
        ('keter', 'malkuth'): 'Vuelta a comenzar: de lo divino a lo material',
    }
    
    def __init__(self):
        self.qliphoth_calculator = None
        
    def _get_qliphoth_calculator(self):
        """Lazy load del calculador de ciclos"""
        if self.qliphoth_calculator is None:
            from api.cabala_qliphoth_cycles import QliphothCycleCalculator
            self.qliphoth_calculator = QliphothCycleCalculator()
        return self.qliphoth_calculator
    
    def detect_sincronias(
        self, 
        birth_date: date,
        life_events: List[Dict],
        include_future_awareness: bool = False
    ) -> Dict[str, Any]:
        """
        Detecta sincronías biográficas significativas.
        
        Args:
            birth_date: Fecha de nacimiento
            life_events: Lista de eventos de vida [{date, type, description, severity}]
            include_future_awareness: Si incluir consciencia de fechas próximas (ético)
            
        Returns:
            Análisis completo de sincronías detectadas
        """
        results = {
            'birth_date': birth_date.isoformat(),
            'analysis_date': date.today().isoformat(),
            'cycle_alignments': [],
            'hidden_anniversaries': [],
            'transition_patterns': [],
            'soul_calendar': [],
            'summary': {},
            'ethical_disclaimer': self._get_ethical_disclaimer()
        }
        
        if not life_events:
            results['summary'] = {'message': 'Sin eventos para analizar'}
            return results
        
        # 1. Detectar alineaciones de ciclos
        results['cycle_alignments'] = self._detect_cycle_alignments(birth_date, life_events)
        
        # 2. Detectar aniversarios ocultos
        results['hidden_anniversaries'] = self._detect_hidden_anniversaries(birth_date, life_events)
        
        # 3. Detectar patrones de transición Sefirótica
        results['transition_patterns'] = self._detect_transition_patterns(birth_date, life_events)
        
        # 4. Generar "Calendario del Alma" (fechas significativas)
        results['soul_calendar'] = self._generate_soul_calendar(birth_date, life_events)
        
        # 5. Consciencia preventiva (si se solicita)
        if include_future_awareness:
            results['preventive_awareness'] = self._generate_preventive_awareness(
                birth_date, life_events
            )
        
        # Generar resumen
        results['summary'] = self._generate_summary(results)
        
        return results
    
    def _detect_cycle_alignments(
        self, 
        birth_date: date, 
        events: List[Dict]
    ) -> List[Dict]:
        """
        Detecta eventos que ocurren en alineaciones de ciclos significativos.
        
        Ejemplo: "Hace 9 años, 18 años y 27 años hubo pérdidas"
        """
        alignments = []
        
        # Agrupar eventos por tipo
        events_by_type = defaultdict(list)
        for event in events:
            event_type = event.get('type', 'unknown')
            events_by_type[event_type].append(event)
        
        # Buscar patrones de ciclo
        for event_type, type_events in events_by_type.items():
            if len(type_events) < 2:
                continue
            
            # Calcular edades de cada evento
            events_with_age = []
            for event in type_events:
                event_date = self._parse_date(event.get('date'))
                if event_date:
                    age = self._calculate_age(birth_date, event_date)
                    events_with_age.append({
                        **event,
                        'age': age,
                        'event_date': event_date
                    })
            
            # Buscar diferencias de ciclo entre eventos
            for i, event1 in enumerate(events_with_age):
                for event2 in events_with_age[i+1:]:
                    age_diff = abs(event2['age'] - event1['age'])
                    
                    # Verificar si coincide con algún ciclo conocido
                    for cycle_id, cycle_info in self.CYCLE_PATTERNS.items():
                        if age_diff % cycle_info['years'] == 0:
                            cycles = age_diff // cycle_info['years']
                            if cycles > 0:
                                alignments.append({
                                    'cycle_type': cycle_id,
                                    'cycle_name': cycle_info['name'],
                                    'significance': cycle_info['significance'],
                                    'events': [
                                        {
                                            'date': event1['event_date'].isoformat(),
                                            'age': event1['age'],
                                            'description': event1.get('description', '')
                                        },
                                        {
                                            'date': event2['event_date'].isoformat(),
                                            'age': event2['age'],
                                            'description': event2.get('description', '')
                                        }
                                    ],
                                    'years_apart': age_diff,
                                    'cycles_apart': cycles,
                                    'event_type': event_type,
                                    'insight': self._generate_cycle_insight(
                                        cycle_id, event_type, cycles
                                    )
                                })
        
        # Ordenar por significancia (más ciclos = más significativo)
        alignments.sort(key=lambda x: x['cycles_apart'], reverse=True)
        
        return alignments[:20]  # Limitar a los 20 más significativos
    
    def _detect_hidden_anniversaries(
        self, 
        birth_date: date, 
        events: List[Dict]
    ) -> List[Dict]:
        """
        Detecta "aniversarios ocultos" - fechas que riman entre sí.
        
        Busca:
        - Misma fecha (día/mes) en diferentes años
        - Fechas cercanas (±3 días) que forman patrones
        - Correlaciones con ciclos lunares/solares
        """
        anniversaries = []
        
        # Agrupar eventos por día del año (mes-día)
        events_by_day = defaultdict(list)
        for event in events:
            event_date = self._parse_date(event.get('date'))
            if event_date:
                day_key = (event_date.month, event_date.day)
                events_by_day[day_key].append({
                    **event,
                    'event_date': event_date,
                    'age': self._calculate_age(birth_date, event_date)
                })
        
        # Encontrar fechas que se repiten
        for day_key, day_events in events_by_day.items():
            if len(day_events) >= 2:
                month, day = day_key
                anniversaries.append({
                    'type': 'exact_date_match',
                    'date_pattern': f"{day:02d}/{month:02d}",
                    'occurrences': len(day_events),
                    'events': [
                        {
                            'year': e['event_date'].year,
                            'age': e['age'],
                            'description': e.get('description', ''),
                            'type': e.get('type', 'unknown')
                        }
                        for e in day_events
                    ],
                    'insight': f"El {day} de {self._month_name(month)} ha sido fecha significativa {len(day_events)} veces en tu vida.",
                    'therapeutic_question': f"¿Qué representa para ti esta fecha? ¿Hay algo que tu alma quiere recordar cada año en este momento?"
                })
        
        # Buscar fechas cercanas (±3 días) que formen patrones
        all_events_sorted = []
        for event in events:
            event_date = self._parse_date(event.get('date'))
            if event_date:
                all_events_sorted.append({
                    **event,
                    'event_date': event_date,
                    'day_of_year': event_date.timetuple().tm_yday
                })
        
        all_events_sorted.sort(key=lambda x: x['day_of_year'])
        
        # Detectar clusters de fechas cercanas
        clusters = self._find_date_clusters(all_events_sorted, tolerance_days=3)
        for cluster in clusters:
            if len(cluster) >= 2:
                avg_day = sum(e['day_of_year'] for e in cluster) // len(cluster)
                anniversaries.append({
                    'type': 'date_cluster',
                    'approximate_day_of_year': avg_day,
                    'approximate_date': self._day_of_year_to_date(avg_day),
                    'events_count': len(cluster),
                    'events': [
                        {
                            'date': e['event_date'].isoformat(),
                            'type': e.get('type', 'unknown'),
                            'description': e.get('description', '')
                        }
                        for e in cluster
                    ],
                    'insight': f"Alrededor del día {avg_day} del año, múltiples eventos han ocurrido.",
                    'therapeutic_question': "¿Qué energía o tema parece activarse en esta época del año?"
                })
        
        # Detectar aniversarios respecto al cumpleaños
        birth_day_of_year = birth_date.timetuple().tm_yday
        for event in events:
            event_date = self._parse_date(event.get('date'))
            if event_date:
                event_day = event_date.timetuple().tm_yday
                days_from_birthday = abs(event_day - birth_day_of_year)
                
                # Eventos cercanos al cumpleaños (±7 días)
                if days_from_birthday <= 7 or days_from_birthday >= 358:
                    anniversaries.append({
                        'type': 'birthday_proximity',
                        'date': event_date.isoformat(),
                        'days_from_birthday': min(days_from_birthday, 365 - days_from_birthday),
                        'event_description': event.get('description', ''),
                        'insight': "Este evento ocurrió muy cerca de tu cumpleaños.",
                        'therapeutic_question': "¿Qué significado tiene que esto haya ocurrido en tu 'año nuevo personal'?"
                    })
                
                # Eventos en el "anti-cumpleaños" (6 meses después)
                anti_birthday = (birth_day_of_year + 182) % 365
                if abs(event_day - anti_birthday) <= 7:
                    anniversaries.append({
                        'type': 'anti_birthday',
                        'date': event_date.isoformat(),
                        'event_description': event.get('description', ''),
                        'insight': "Este evento ocurrió en tu 'anti-cumpleaños' (punto opuesto del año).",
                        'therapeutic_question': "El punto medio del año personal suele traer crisis o revelaciones. ¿Qué se reveló aquí?"
                    })
        
        return anniversaries
    
    def _detect_transition_patterns(
        self, 
        birth_date: date, 
        events: List[Dict]
    ) -> List[Dict]:
        """
        Detecta patrones en las transiciones Sefiróticas.
        
        Ejemplo del usuario:
        "Cada 9 años pierde algo cuando se le pide pasar de Tiferet (centro) a Netzach (emoción)"
        """
        patterns = []
        calculator = self._get_qliphoth_calculator()
        
        # Agrupar eventos por transición Sefirótica
        events_by_transition = defaultdict(list)
        
        for event in events:
            event_date = self._parse_date(event.get('date'))
            if not event_date:
                continue
            
            # Calcular Sefirá/Qliphah en la fecha del evento
            current_info = calculator.calculate_current_qliphoth(birth_date, event_date)
            sefira = current_info['corresponding_sefira']
            
            # Determinar transición (de qué a qué)
            cycle_year = current_info['cycle_year']
            if cycle_year > 1:
                prev_cycle = cycle_year - 2
                prev_info = calculator.SEFIRA_TO_QLIPHAH_CYCLE.get(prev_cycle, {})
                prev_sefira = prev_info.get('sefira', 'unknown')
                transition = (prev_sefira, sefira)
            else:
                transition = ('keter', sefira)  # Inicio de nuevo ciclo
            
            events_by_transition[transition].append({
                **event,
                'event_date': event_date,
                'age': self._calculate_age(birth_date, event_date),
                'sefira': sefira,
                'cycle_year': cycle_year
            })
        
        # Buscar transiciones problemáticas recurrentes
        for transition, trans_events in events_by_transition.items():
            if len(trans_events) >= 2:
                # Verificar si hay eventos de crisis en esta transición
                crisis_events = [e for e in trans_events if e.get('severity') in ['Alto', 'Severo', 'Crítico', 'high', 'severe']]
                
                if crisis_events:
                    from_sefira, to_sefira = transition
                    transition_meaning = self.SEFIRA_TRANSITIONS.get(transition, 'Transición significativa')
                    
                    patterns.append({
                        'transition': f"{from_sefira} → {to_sefira}",
                        'meaning': transition_meaning,
                        'total_events': len(trans_events),
                        'crisis_events': len(crisis_events),
                        'ages': [e['age'] for e in trans_events],
                        'years': [e['event_date'].year for e in trans_events],
                        'insight': f"Has tenido {len(crisis_events)} eventos difíciles durante la transición de {from_sefira.capitalize()} a {to_sefira.capitalize()}.",
                        'therapeutic_question': f"¿Qué significa para ti pasar de {from_sefira.capitalize()} ({self._sefira_quality(from_sefira)}) a {to_sefira.capitalize()} ({self._sefira_quality(to_sefira)})?",
                        'pattern_description': self._describe_transition_pattern(from_sefira, to_sefira, crisis_events)
                    })
        
        return patterns
    
    def _generate_soul_calendar(
        self, 
        birth_date: date, 
        events: List[Dict]
    ) -> List[Dict]:
        """
        Genera un "Calendario del Alma" con las fechas significativas del consultante.
        """
        soul_dates = []
        
        # 1. Cumpleaños y aniversarios de ciclos
        today = date.today()
        current_age = self._calculate_age(birth_date, today)
        
        # Próximo cumpleaños
        next_birthday = birth_date.replace(year=today.year)
        if next_birthday <= today:
            next_birthday = birth_date.replace(year=today.year + 1)
        
        soul_dates.append({
            'type': 'birthday',
            'date': next_birthday.isoformat(),
            'significance': f'Cumpleaños {current_age + 1}',
            'cycle_info': self._get_cycle_significance(current_age + 1)
        })
        
        # 2. Fechas de eventos pasados significativos
        for event in events:
            event_date = self._parse_date(event.get('date'))
            if event_date and event.get('severity') in ['Alto', 'Severo', 'high', 'severe']:
                # Aniversario de este evento
                anniversary = event_date.replace(year=today.year)
                if anniversary < today:
                    anniversary = event_date.replace(year=today.year + 1)
                
                soul_dates.append({
                    'type': 'event_anniversary',
                    'date': anniversary.isoformat(),
                    'original_date': event_date.isoformat(),
                    'years_since': today.year - event_date.year,
                    'significance': f"Aniversario de: {event.get('description', 'evento significativo')[:50]}",
                    'reflection': "Fecha para reflexionar sobre lo aprendido y honrar el proceso."
                })
        
        # Ordenar por fecha
        soul_dates.sort(key=lambda x: x['date'])
        
        return soul_dates[:12]  # Los próximos 12 eventos del calendario del alma
    
    def _generate_preventive_awareness(
        self, 
        birth_date: date, 
        events: List[Dict]
    ) -> List[Dict]:
        """
        Genera alertas de consciencia preventiva basadas en patrones históricos.
        
        ⚠️ ÉTICO: Basado solo en historia propia, no adivinación.
        """
        awareness = []
        today = date.today()
        
        # 1. Aniversarios de eventos difíciles que se acercan
        for event in events:
            event_date = self._parse_date(event.get('date'))
            if not event_date:
                continue
            
            if event.get('severity') not in ['Alto', 'Severo', 'high', 'severe']:
                continue
            
            # Calcular próximo aniversario
            anniversary = event_date.replace(year=today.year)
            if anniversary < today:
                anniversary = event_date.replace(year=today.year + 1)
            
            days_until = (anniversary - today).days
            
            # Si está dentro de los próximos 90 días
            if 0 < days_until <= 90:
                awareness.append({
                    'type': 'anniversary_approaching',
                    'date': anniversary.isoformat(),
                    'days_until': days_until,
                    'original_event': event.get('description', 'evento significativo'),
                    'years_since': today.year - event_date.year,
                    'message': f"En {days_until} días será el aniversario de un evento significativo.",
                    'suggestion': "Considera planificar apoyo o espacios de reflexión para esta fecha.",
                    'ethical_note': "Esto NO es predicción. Es consciencia de tu calendario emocional personal."
                })
        
        # 2. Patrones estacionales detectados
        month_patterns = self._detect_monthly_patterns(events)
        current_month = today.month
        
        for month, pattern in month_patterns.items():
            if pattern['crisis_count'] >= 2:
                # Si el mes problemático está en los próximos 3 meses
                months_until = (month - current_month) % 12
                if 0 < months_until <= 3:
                    awareness.append({
                        'type': 'seasonal_pattern',
                        'month': self._month_name(month),
                        'months_until': months_until,
                        'historical_events': pattern['crisis_count'],
                        'message': f"Históricamente, {self._month_name(month)} ha sido un mes con {pattern['crisis_count']} eventos difíciles.",
                        'suggestion': f"Sugerencia: Planificar apoyo extra durante {self._month_name(month)}.",
                        'ethical_note': "Basado en TU historia, no en predicción astrológica."
                    })
        
        return awareness
    
    # ==================== MÉTODOS AUXILIARES ====================
    
    def _calculate_age(self, birth_date: date, target_date: date) -> int:
        """Calcula la edad en una fecha específica"""
        age = target_date.year - birth_date.year
        if (target_date.month, target_date.day) < (birth_date.month, birth_date.day):
            age -= 1
        return age
    
    def _parse_date(self, date_value) -> Optional[date]:
        """Convierte string o date a date"""
        if isinstance(date_value, date):
            return date_value
        if isinstance(date_value, datetime):
            return date_value.date()
        if isinstance(date_value, str):
            try:
                return datetime.fromisoformat(date_value.replace('Z', '+00:00')).date()
            except:
                try:
                    return datetime.strptime(date_value, '%Y-%m-%d').date()
                except:
                    return None
        return None
    
    def _month_name(self, month: int) -> str:
        """Nombre del mes en español"""
        months = {
            1: 'enero', 2: 'febrero', 3: 'marzo', 4: 'abril',
            5: 'mayo', 6: 'junio', 7: 'julio', 8: 'agosto',
            9: 'septiembre', 10: 'octubre', 11: 'noviembre', 12: 'diciembre'
        }
        return months.get(month, str(month))
    
    def _day_of_year_to_date(self, day_of_year: int) -> str:
        """Convierte día del año a fecha aproximada"""
        ref_date = date(2024, 1, 1) + timedelta(days=day_of_year - 1)
        return f"{ref_date.day} de {self._month_name(ref_date.month)}"
    
    def _find_date_clusters(self, events: List[Dict], tolerance_days: int = 3) -> List[List[Dict]]:
        """Encuentra clusters de eventos cercanos en fecha"""
        if not events:
            return []
        
        clusters = []
        current_cluster = [events[0]]
        
        for event in events[1:]:
            last_day = current_cluster[-1]['day_of_year']
            curr_day = event['day_of_year']
            
            if abs(curr_day - last_day) <= tolerance_days:
                current_cluster.append(event)
            else:
                if len(current_cluster) >= 2:
                    clusters.append(current_cluster)
                current_cluster = [event]
        
        if len(current_cluster) >= 2:
            clusters.append(current_cluster)
        
        return clusters
    
    def _sefira_quality(self, sefira: str) -> str:
        """Retorna la cualidad principal de una Sefirá"""
        qualities = {
            'keter': 'unidad divina',
            'chokmah': 'sabiduría',
            'binah': 'comprensión',
            'chesed': 'amor expansivo',
            'gevurah': 'disciplina',
            'tiferet': 'belleza/centro',
            'netzach': 'emoción/victoria',
            'hod': 'intelecto/esplendor',
            'yesod': 'fundamento/sueños',
            'malkuth': 'manifestación material'
        }
        return qualities.get(sefira, sefira)
    
    def _get_cycle_significance(self, age: int) -> str:
        """Retorna significado del ciclo según la edad"""
        cycle_position = age % 10
        significances = {
            0: 'Inicio de nuevo ciclo de 10 años',
            1: 'Año de fundamentos',
            2: 'Año de comunicación',
            3: 'Año de emoción',
            4: 'Año de equilibrio central',
            5: 'Año de disciplina',
            6: 'Año de expansión',
            7: 'Año de comprensión',
            8: 'Año de sabiduría',
            9: 'Año de completitud',
        }
        return significances.get(cycle_position, '')
    
    def _generate_cycle_insight(self, cycle_type: str, event_type: str, cycles: int) -> str:
        """Genera insight sobre el patrón de ciclo detectado"""
        cycle_info = self.CYCLE_PATTERNS.get(cycle_type, {})
        cycle_name = cycle_info.get('name', cycle_type)
        
        return f"Eventos de tipo '{event_type}' se repiten cada {cycles} {cycle_name}(s). Este patrón de {cycles * cycle_info.get('years', 1)} años sugiere un tema recurrente en tu proceso vital."
    
    def _describe_transition_pattern(self, from_sefira: str, to_sefira: str, crisis_events: List) -> str:
        """Describe el patrón de transición detectado"""
        ages = [e['age'] for e in crisis_events]
        return f"A las edades {', '.join(map(str, ages))}, durante el paso de {from_sefira} a {to_sefira}, surgieron desafíos. Este es un punto de crecimiento potencial."
    
    def _detect_monthly_patterns(self, events: List[Dict]) -> Dict[int, Dict]:
        """Detecta patrones por mes del año"""
        monthly = defaultdict(lambda: {'total': 0, 'crisis_count': 0})
        
        for event in events:
            event_date = self._parse_date(event.get('date'))
            if event_date:
                month = event_date.month
                monthly[month]['total'] += 1
                if event.get('severity') in ['Alto', 'Severo', 'high', 'severe']:
                    monthly[month]['crisis_count'] += 1
        
        return dict(monthly)
    
    def _generate_summary(self, results: Dict) -> Dict:
        """Genera resumen del análisis"""
        return {
            'total_cycle_alignments': len(results.get('cycle_alignments', [])),
            'total_hidden_anniversaries': len(results.get('hidden_anniversaries', [])),
            'total_transition_patterns': len(results.get('transition_patterns', [])),
            'most_significant_pattern': self._find_most_significant(results),
            'key_insight': self._generate_key_insight(results)
        }
    
    def _find_most_significant(self, results: Dict) -> Optional[str]:
        """Encuentra el patrón más significativo"""
        patterns = results.get('transition_patterns', [])
        if patterns:
            # El patrón con más crisis es el más significativo
            most_sig = max(patterns, key=lambda x: x.get('crisis_events', 0))
            return most_sig.get('insight', '')
        return None
    
    def _generate_key_insight(self, results: Dict) -> str:
        """Genera insight clave del análisis"""
        alignments = len(results.get('cycle_alignments', []))
        anniversaries = len(results.get('hidden_anniversaries', []))
        patterns = len(results.get('transition_patterns', []))
        
        if alignments + anniversaries + patterns == 0:
            return "No se detectaron sincronías significativas con los datos disponibles."
        
        return f"Se detectaron {alignments} alineaciones de ciclo, {anniversaries} aniversarios ocultos y {patterns} patrones de transición. Tu biografía tiene ritmos significativos que merecen exploración."
    
    def _get_ethical_disclaimer(self) -> str:
        """Retorna disclaimer ético obligatorio"""
        return (
            "⚠️ AVISO ÉTICO: Este análisis muestra correlaciones históricas en TU biografía. "
            "NO predice eventos futuros ni determina tu destino. "
            "Es una herramienta de reflexión para trabajo terapéutico consciente. "
            "Las 'fechas significativas' son invitaciones a la consciencia, no profecías."
        )
