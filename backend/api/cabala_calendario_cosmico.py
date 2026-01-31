"""
cabala_calendario_cosmico.py - Conexión con Calendario Lunar/Solar Real

INNOVACIÓN 15: Sincronizar ciclos cabalísticos con:
- Fases de la luna (real, no simbólica)
- Equinoccios/solsticios
- Eclipses
- Ciclos naturales verificables

La Cábala se hace "astronómica" no solo simbólica.
Conexión con ritmos naturales observables.

⚠️ USA motores de astrología existentes del proyecto.
"""

from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any, Tuple
from decimal import Decimal
import logging
import math

logger = logging.getLogger(__name__)

# Intentar importar Swiss Ephemeris
try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False
    logger.warning("Swiss Ephemeris no disponible. Usando cálculos aproximados.")


class CalendarioCosmicoCabala:
    """
    Integra ciclos cabalísticos con astronomía real.
    
    Conecta:
    1. Fases lunares → Sefirot/Qliphoth
    2. Estaciones → Pilares del Árbol
    3. Eclipses → Momentos de transformación
    4. Retrogradaciones → Trabajo interno
    """
    
    # Mapeo Fase Lunar → Sefirá
    LUNAR_PHASE_SEFIRA = {
        'new_moon': {
            'sefira': 'binah',
            'quality': 'Oscuridad fértil',
            'work': 'Introspección, gestación de intenciones',
            'qliphah_risk': 'satariel',
            'qliphah_warning': 'Riesgo de ocultamiento excesivo'
        },
        'waxing_crescent': {
            'sefira': 'chesed',
            'quality': 'Expansión inicial',
            'work': 'Plantar semillas, iniciar proyectos',
            'qliphah_risk': 'gamchicoth',
            'qliphah_warning': 'Cuidado con dar demasiado pronto'
        },
        'first_quarter': {
            'sefira': 'gevurah',
            'quality': 'Acción y decisión',
            'work': 'Establecer límites, tomar decisiones',
            'qliphah_risk': 'golachab',
            'qliphah_warning': 'Cuidado con la acción impulsiva'
        },
        'waxing_gibbous': {
            'sefira': 'tiferet',
            'quality': 'Refinamiento',
            'work': 'Ajustar, perfeccionar, equilibrar',
            'qliphah_risk': 'thagirion',
            'qliphah_warning': 'Cuidado con el perfeccionismo'
        },
        'full_moon': {
            'sefira': 'keter',
            'quality': 'Plenitud y revelación',
            'work': 'Celebrar logros, recibir insights',
            'qliphah_risk': 'thaumiel',
            'qliphah_warning': 'Cuidado con la inflación del ego'
        },
        'waning_gibbous': {
            'sefira': 'chokmah',
            'quality': 'Compartir sabiduría',
            'work': 'Enseñar, transmitir lo aprendido',
            'qliphah_risk': 'ghagiel',
            'qliphah_warning': 'Cuidado con imponer tu verdad'
        },
        'last_quarter': {
            'sefira': 'hod',
            'quality': 'Análisis y release',
            'work': 'Soltar lo que no sirve, analizar',
            'qliphah_risk': 'samael',
            'qliphah_warning': 'Cuidado con la crítica excesiva'
        },
        'waning_crescent': {
            'sefira': 'yesod',
            'quality': 'Descanso y sueños',
            'work': 'Soñar, descansar, preparar el siguiente ciclo',
            'qliphah_risk': 'gamaliel',
            'qliphah_warning': 'Cuidado con escapar a la fantasía'
        }
    }
    
    # Mapeo Estación → Pilar del Árbol
    SEASON_PILLAR = {
        'spring_equinox': {
            'pillar': 'right',
            'sefirot': ['chokmah', 'chesed', 'netzach'],
            'quality': 'Expansión y crecimiento',
            'kabbalistic_meaning': 'El Pilar de la Misericordia se activa',
            'practices': ['Iniciar nuevos proyectos', 'Expandir relaciones', 'Cultivar generosidad']
        },
        'summer_solstice': {
            'pillar': 'middle',
            'sefirot': ['keter', 'tiferet', 'yesod', 'malkuth'],
            'quality': 'Plenitud y equilibrio',
            'kabbalistic_meaning': 'El Pilar del Equilibrio en máxima luz',
            'practices': ['Celebrar logros', 'Encontrar el centro', 'Integrar opuestos']
        },
        'fall_equinox': {
            'pillar': 'left',
            'sefirot': ['binah', 'gevurah', 'hod'],
            'quality': 'Cosecha y restricción',
            'kabbalistic_meaning': 'El Pilar de la Severidad se activa',
            'practices': ['Evaluar el año', 'Establecer límites', 'Soltar lo innecesario']
        },
        'winter_solstice': {
            'pillar': 'middle',
            'sefirot': ['keter', 'tiferet', 'yesod', 'malkuth'],
            'quality': 'Oscuridad fértil',
            'kabbalistic_meaning': 'El Pilar del Equilibrio en máxima oscuridad (luz oculta)',
            'practices': ['Introspección profunda', 'Plantar semillas de luz', 'Renovar intenciones']
        }
    }
    
    # Correspondencias planetarias cabalísticas
    PLANET_SEFIRA = {
        'sun': 'tiferet',
        'moon': 'yesod',
        'mercury': 'hod',
        'venus': 'netzach',
        'mars': 'gevurah',
        'jupiter': 'chesed',
        'saturn': 'binah',
        'uranus': 'chokmah',  # Moderno
        'neptune': 'keter',   # Moderno
        'pluto': 'malkuth'    # Moderno (transformación de lo material)
    }
    
    def __init__(self):
        """Inicializa el calendario cósmico"""
        if SWISSEPH_AVAILABLE:
            # Configurar Swiss Ephemeris
            try:
                swe.set_ephe_path(None)  # Usar ephemeris integrado
            except Exception as e:
                logger.warning(f"Error configurando Swiss Ephemeris: {e}")
    
    def get_cosmic_context(
        self,
        target_date: date,
        birth_date: Optional[date] = None,
        location: Optional[Tuple[float, float]] = None
    ) -> Dict[str, Any]:
        """
        Obtiene el contexto cósmico completo para una fecha.
        
        Args:
            target_date: Fecha a analizar
            birth_date: Fecha de nacimiento (opcional, para ciclos personales)
            location: (latitud, longitud) para cálculos locales
            
        Returns:
            Contexto cósmico con correspondencias cabalísticas
        """
        context = {
            'date': target_date.isoformat(),
            'generated_at': datetime.now().isoformat(),
            
            # Fase lunar
            'lunar_phase': self._get_lunar_phase(target_date),
            
            # Estación
            'season': self._get_season(target_date),
            
            # Posiciones planetarias básicas
            'planetary_influences': self._get_planetary_positions(target_date),
            
            # Eventos especiales cercanos
            'upcoming_events': self._get_upcoming_cosmic_events(target_date),
            
            # Síntesis cabalística
            'kabbalistic_synthesis': None,  # Se genera después
            
            # Prácticas recomendadas
            'recommended_practices': [],
            
            # Advertencias sombra
            'shadow_warnings': []
        }
        
        # Agregar contexto personal si hay fecha de nacimiento
        if birth_date:
            context['personal_cycle'] = self._get_personal_cosmic_cycle(birth_date, target_date)
        
        # Generar síntesis
        context['kabbalistic_synthesis'] = self._generate_synthesis(context)
        context['recommended_practices'] = self._generate_practices(context)
        context['shadow_warnings'] = self._generate_shadow_warnings(context)
        
        return context
    
    def get_lunar_sefirotic_calendar(
        self,
        start_date: date,
        months: int = 1
    ) -> List[Dict]:
        """
        Genera calendario lunar-sefirótico para un período.
        
        Returns:
            Lista de días con correspondencias
        """
        calendar = []
        current = start_date
        end_date = start_date + timedelta(days=months * 30)
        
        while current <= end_date:
            lunar_phase = self._get_lunar_phase(current)
            phase_info = self.LUNAR_PHASE_SEFIRA.get(lunar_phase['phase'], {})
            
            calendar.append({
                'date': current.isoformat(),
                'day_of_week': current.strftime('%A'),
                'lunar_phase': lunar_phase['phase'],
                'lunar_percent': lunar_phase['illumination'],
                'sefira': phase_info.get('sefira', 'unknown'),
                'quality': phase_info.get('quality', ''),
                'work': phase_info.get('work', ''),
                'shadow_risk': phase_info.get('qliphah_risk', '')
            })
            
            current += timedelta(days=1)
        
        return calendar
    
    def get_annual_cosmic_map(
        self,
        year: int,
        birth_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Genera mapa cósmico anual con todos los eventos significativos.
        """
        events = []
        
        # Equinoccios y solsticios
        events.extend(self._get_year_cardinal_points(year))
        
        # Lunas llenas y nuevas
        events.extend(self._get_year_significant_moons(year))
        
        # Eclipses (si hay datos)
        events.extend(self._get_year_eclipses(year))
        
        # Retrogradaciones principales
        events.extend(self._get_year_retrogrades(year))
        
        # Ordenar por fecha
        events.sort(key=lambda x: x['date'])
        
        # Agregar correspondencias personales si hay birth_date
        if birth_date:
            events = self._add_personal_context(events, birth_date)
        
        return {
            'year': year,
            'events': events,
            'summary': self._generate_year_summary(events),
            'kabbalistic_themes': self._identify_year_themes(events)
        }
    
    def analyze_event_cosmic_context(
        self,
        event_date: date,
        event_type: str,
        birth_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Analiza el contexto cósmico de un evento específico.
        
        Útil para entender por qué ciertos eventos ocurrieron
        cuando ocurrieron.
        """
        context = self.get_cosmic_context(event_date, birth_date)
        
        return {
            'event_date': event_date.isoformat(),
            'event_type': event_type,
            'cosmic_context': context,
            'interpretation': self._interpret_event_context(event_type, context),
            'learning': self._extract_cosmic_learning(event_type, context)
        }
    
    # ==================== CÁLCULOS LUNARES ====================
    
    def _get_lunar_phase(self, target_date: date) -> Dict:
        """Calcula la fase lunar para una fecha"""
        if SWISSEPH_AVAILABLE:
            return self._get_lunar_phase_swisseph(target_date)
        else:
            return self._get_lunar_phase_approximate(target_date)
    
    def _get_lunar_phase_swisseph(self, target_date: date) -> Dict:
        """Cálculo preciso con Swiss Ephemeris"""
        try:
            dt = datetime.combine(target_date, datetime.min.time())
            jd = swe.julday(dt.year, dt.month, dt.day, 0.0)
            
            # Posición del Sol y la Luna
            sun_pos = swe.calc_ut(jd, swe.SUN)[0]
            moon_pos = swe.calc_ut(jd, swe.MOON)[0]
            
            # Elongación (diferencia entre Luna y Sol)
            elongation = (moon_pos[0] - sun_pos[0]) % 360
            
            # Determinar fase
            phase = self._elongation_to_phase(elongation)
            illumination = self._calculate_illumination(elongation)
            
            return {
                'phase': phase,
                'elongation': elongation,
                'illumination': illumination,
                'moon_sign': self._longitude_to_sign(moon_pos[0]),
                'precise': True
            }
        except Exception as e:
            logger.error(f"Error en cálculo lunar Swiss Ephemeris: {e}")
            return self._get_lunar_phase_approximate(target_date)
    
    def _get_lunar_phase_approximate(self, target_date: date) -> Dict:
        """Cálculo aproximado sin Swiss Ephemeris"""
        # Fecha de referencia de luna nueva conocida
        reference_new_moon = date(2024, 1, 11)  # Luna nueva conocida
        
        # Ciclo lunar promedio
        lunar_cycle = 29.530588853
        
        # Días desde la referencia
        days_since = (target_date - reference_new_moon).days
        
        # Posición en el ciclo (0-1)
        cycle_position = (days_since % lunar_cycle) / lunar_cycle
        
        # Determinar fase
        if cycle_position < 0.0625:
            phase = 'new_moon'
        elif cycle_position < 0.1875:
            phase = 'waxing_crescent'
        elif cycle_position < 0.3125:
            phase = 'first_quarter'
        elif cycle_position < 0.4375:
            phase = 'waxing_gibbous'
        elif cycle_position < 0.5625:
            phase = 'full_moon'
        elif cycle_position < 0.6875:
            phase = 'waning_gibbous'
        elif cycle_position < 0.8125:
            phase = 'last_quarter'
        else:
            phase = 'waning_crescent'
        
        # Iluminación aproximada
        illumination = abs(math.cos(cycle_position * 2 * math.pi)) * 100
        if cycle_position > 0.5:
            illumination = 100 - illumination
        
        return {
            'phase': phase,
            'elongation': cycle_position * 360,
            'illumination': round(illumination, 1),
            'moon_sign': 'unknown',
            'precise': False
        }
    
    def _elongation_to_phase(self, elongation: float) -> str:
        """Convierte elongación a nombre de fase"""
        if elongation < 22.5 or elongation >= 337.5:
            return 'new_moon'
        elif elongation < 67.5:
            return 'waxing_crescent'
        elif elongation < 112.5:
            return 'first_quarter'
        elif elongation < 157.5:
            return 'waxing_gibbous'
        elif elongation < 202.5:
            return 'full_moon'
        elif elongation < 247.5:
            return 'waning_gibbous'
        elif elongation < 292.5:
            return 'last_quarter'
        else:
            return 'waning_crescent'
    
    def _calculate_illumination(self, elongation: float) -> float:
        """Calcula porcentaje de iluminación"""
        return round((1 - math.cos(math.radians(elongation))) / 2 * 100, 1)
    
    def _longitude_to_sign(self, longitude: float) -> str:
        """Convierte longitud eclíptica a signo zodiacal"""
        signs = [
            'aries', 'taurus', 'gemini', 'cancer',
            'leo', 'virgo', 'libra', 'scorpio',
            'sagittarius', 'capricorn', 'aquarius', 'pisces'
        ]
        index = int(longitude / 30) % 12
        return signs[index]
    
    # ==================== CÁLCULOS ESTACIONALES ====================
    
    def _get_season(self, target_date: date) -> Dict:
        """Determina la estación y punto cardinal más cercano"""
        year = target_date.year
        
        # Fechas aproximadas de puntos cardinales
        spring_eq = date(year, 3, 20)
        summer_sol = date(year, 6, 21)
        fall_eq = date(year, 9, 22)
        winter_sol = date(year, 12, 21)
        
        # Determinar estación actual
        if target_date < spring_eq:
            season = 'winter'
            nearest_cardinal = ('winter_solstice', date(year - 1, 12, 21))
            next_cardinal = ('spring_equinox', spring_eq)
        elif target_date < summer_sol:
            season = 'spring'
            nearest_cardinal = ('spring_equinox', spring_eq)
            next_cardinal = ('summer_solstice', summer_sol)
        elif target_date < fall_eq:
            season = 'summer'
            nearest_cardinal = ('summer_solstice', summer_sol)
            next_cardinal = ('fall_equinox', fall_eq)
        elif target_date < winter_sol:
            season = 'fall'
            nearest_cardinal = ('fall_equinox', fall_eq)
            next_cardinal = ('winter_solstice', winter_sol)
        else:
            season = 'winter'
            nearest_cardinal = ('winter_solstice', winter_sol)
            next_cardinal = ('spring_equinox', date(year + 1, 3, 20))
        
        # Info del pilar activo
        pillar_info = self.SEASON_PILLAR.get(nearest_cardinal[0], {})
        
        return {
            'season': season,
            'nearest_cardinal': {
                'name': nearest_cardinal[0],
                'date': nearest_cardinal[1].isoformat(),
                'days_since': (target_date - nearest_cardinal[1]).days
            },
            'next_cardinal': {
                'name': next_cardinal[0],
                'date': next_cardinal[1].isoformat(),
                'days_until': (next_cardinal[1] - target_date).days
            },
            'active_pillar': pillar_info.get('pillar', 'middle'),
            'pillar_sefirot': pillar_info.get('sefirot', []),
            'seasonal_quality': pillar_info.get('quality', ''),
            'kabbalistic_meaning': pillar_info.get('kabbalistic_meaning', '')
        }
    
    # ==================== POSICIONES PLANETARIAS ====================
    
    def _get_planetary_positions(self, target_date: date) -> Dict:
        """Obtiene posiciones planetarias básicas"""
        if SWISSEPH_AVAILABLE:
            return self._get_planetary_swisseph(target_date)
        else:
            return self._get_planetary_approximate(target_date)
    
    def _get_planetary_swisseph(self, target_date: date) -> Dict:
        """Posiciones precisas con Swiss Ephemeris"""
        try:
            dt = datetime.combine(target_date, datetime.min.time())
            jd = swe.julday(dt.year, dt.month, dt.day, 12.0)  # Mediodía
            
            planets = {}
            planet_ids = {
                'sun': swe.SUN,
                'moon': swe.MOON,
                'mercury': swe.MERCURY,
                'venus': swe.VENUS,
                'mars': swe.MARS,
                'jupiter': swe.JUPITER,
                'saturn': swe.SATURN
            }
            
            for name, planet_id in planet_ids.items():
                try:
                    pos = swe.calc_ut(jd, planet_id)[0]
                    sign = self._longitude_to_sign(pos[0])
                    sefira = self.PLANET_SEFIRA.get(name, 'unknown')
                    
                    # Verificar retrogradación
                    speed = pos[3] if len(pos) > 3 else 0
                    is_retrograde = speed < 0
                    
                    planets[name] = {
                        'sign': sign,
                        'longitude': round(pos[0], 2),
                        'sefira': sefira,
                        'retrograde': is_retrograde,
                        'influence': self._get_planet_influence(name, sign, is_retrograde)
                    }
                except Exception as e:
                    logger.warning(f"Error calculando {name}: {e}")
            
            return planets
            
        except Exception as e:
            logger.error(f"Error en cálculos planetarios: {e}")
            return self._get_planetary_approximate(target_date)
    
    def _get_planetary_approximate(self, target_date: date) -> Dict:
        """Posiciones aproximadas sin Swiss Ephemeris"""
        # Retorna solo correspondencias genéricas
        return {
            'sun': {
                'sign': self._get_sun_sign_approximate(target_date),
                'sefira': 'tiferet',
                'retrograde': False,
                'influence': 'Vitalidad y consciencia central'
            },
            'moon': {
                'sign': 'varies',
                'sefira': 'yesod',
                'retrograde': False,
                'influence': 'Emociones y subconsciente'
            },
            'note': 'Posiciones aproximadas. Para precisión, instalar Swiss Ephemeris.'
        }
    
    def _get_sun_sign_approximate(self, target_date: date) -> str:
        """Signo solar aproximado por fecha"""
        month_day = (target_date.month, target_date.day)
        
        if month_day >= (3, 21) and month_day < (4, 20):
            return 'aries'
        elif month_day >= (4, 20) and month_day < (5, 21):
            return 'taurus'
        elif month_day >= (5, 21) and month_day < (6, 21):
            return 'gemini'
        elif month_day >= (6, 21) and month_day < (7, 23):
            return 'cancer'
        elif month_day >= (7, 23) and month_day < (8, 23):
            return 'leo'
        elif month_day >= (8, 23) and month_day < (9, 23):
            return 'virgo'
        elif month_day >= (9, 23) and month_day < (10, 23):
            return 'libra'
        elif month_day >= (10, 23) and month_day < (11, 22):
            return 'scorpio'
        elif month_day >= (11, 22) and month_day < (12, 22):
            return 'sagittarius'
        elif month_day >= (12, 22) or month_day < (1, 20):
            return 'capricorn'
        elif month_day >= (1, 20) and month_day < (2, 19):
            return 'aquarius'
        else:
            return 'pisces'
    
    def _get_planet_influence(self, planet: str, sign: str, retrograde: bool) -> str:
        """Genera descripción de influencia planetaria"""
        base_influences = {
            'sun': 'Vitalidad, identidad, consciencia',
            'moon': 'Emociones, intuición, nutrición',
            'mercury': 'Comunicación, pensamiento, aprendizaje',
            'venus': 'Amor, belleza, valores',
            'mars': 'Acción, deseo, coraje',
            'jupiter': 'Expansión, sabiduría, abundancia',
            'saturn': 'Estructura, límites, responsabilidad'
        }
        
        influence = base_influences.get(planet, 'Influencia desconocida')
        
        if retrograde:
            influence += ' (RETROGRADO: revisión interna)'
        
        return influence
    
    # ==================== EVENTOS CÓSMICOS ====================
    
    def _get_upcoming_cosmic_events(self, target_date: date, days_ahead: int = 30) -> List[Dict]:
        """Lista eventos cósmicos próximos"""
        events = []
        
        # Próximas lunas significativas
        events.extend(self._find_next_moon_phases(target_date, days_ahead))
        
        # Punto cardinal próximo
        season_info = self._get_season(target_date)
        if season_info['next_cardinal']['days_until'] <= days_ahead:
            cardinal = season_info['next_cardinal']
            pillar_info = self.SEASON_PILLAR.get(cardinal['name'], {})
            events.append({
                'type': 'cardinal_point',
                'name': cardinal['name'],
                'date': cardinal['date'],
                'days_until': cardinal['days_until'],
                'significance': pillar_info.get('kabbalistic_meaning', ''),
                'pillar': pillar_info.get('pillar', 'middle')
            })
        
        events.sort(key=lambda x: x.get('days_until', 999))
        return events[:10]
    
    def _find_next_moon_phases(self, start_date: date, days_ahead: int) -> List[Dict]:
        """Encuentra próximas fases lunares significativas"""
        events = []
        current = start_date
        end = start_date + timedelta(days=days_ahead)
        
        prev_phase = None
        while current <= end:
            phase_info = self._get_lunar_phase(current)
            phase = phase_info['phase']
            
            # Detectar cambio de fase
            if phase != prev_phase and phase in ['new_moon', 'full_moon', 'first_quarter', 'last_quarter']:
                sefira_info = self.LUNAR_PHASE_SEFIRA.get(phase, {})
                events.append({
                    'type': 'lunar_phase',
                    'name': phase,
                    'date': current.isoformat(),
                    'days_until': (current - start_date).days,
                    'sefira': sefira_info.get('sefira', ''),
                    'work': sefira_info.get('work', ''),
                    'illumination': phase_info['illumination']
                })
            
            prev_phase = phase
            current += timedelta(days=1)
        
        return events
    
    def _get_year_cardinal_points(self, year: int) -> List[Dict]:
        """Obtiene puntos cardinales del año"""
        points = [
            ('spring_equinox', date(year, 3, 20)),
            ('summer_solstice', date(year, 6, 21)),
            ('fall_equinox', date(year, 9, 22)),
            ('winter_solstice', date(year, 12, 21))
        ]
        
        events = []
        for name, event_date in points:
            pillar_info = self.SEASON_PILLAR.get(name, {})
            events.append({
                'type': 'cardinal_point',
                'name': name,
                'date': event_date.isoformat(),
                'pillar': pillar_info.get('pillar', ''),
                'sefirot': pillar_info.get('sefirot', []),
                'quality': pillar_info.get('quality', ''),
                'practices': pillar_info.get('practices', [])
            })
        
        return events
    
    def _get_year_significant_moons(self, year: int) -> List[Dict]:
        """Lista lunas nuevas y llenas del año"""
        events = []
        current = date(year, 1, 1)
        end = date(year, 12, 31)
        
        prev_phase = None
        while current <= end:
            phase_info = self._get_lunar_phase(current)
            phase = phase_info['phase']
            
            if phase != prev_phase and phase in ['new_moon', 'full_moon']:
                sefira_info = self.LUNAR_PHASE_SEFIRA.get(phase, {})
                events.append({
                    'type': 'lunar',
                    'name': phase,
                    'date': current.isoformat(),
                    'sefira': sefira_info.get('sefira', ''),
                    'quality': sefira_info.get('quality', '')
                })
            
            prev_phase = phase
            current += timedelta(days=1)
        
        return events
    
    def _get_year_eclipses(self, year: int) -> List[Dict]:
        """Lista eclipses del año (datos estáticos conocidos)"""
        # Eclipses conocidos 2024-2027
        known_eclipses = {
            2024: [
                {'date': '2024-03-25', 'type': 'lunar_penumbral'},
                {'date': '2024-04-08', 'type': 'solar_total'},
                {'date': '2024-09-18', 'type': 'lunar_partial'},
                {'date': '2024-10-02', 'type': 'solar_annular'}
            ],
            2025: [
                {'date': '2025-03-14', 'type': 'lunar_total'},
                {'date': '2025-03-29', 'type': 'solar_partial'},
                {'date': '2025-09-07', 'type': 'lunar_total'},
                {'date': '2025-09-21', 'type': 'solar_partial'}
            ],
            2026: [
                {'date': '2026-02-17', 'type': 'solar_annular'},
                {'date': '2026-03-03', 'type': 'lunar_total'},
                {'date': '2026-08-12', 'type': 'solar_total'},
                {'date': '2026-08-28', 'type': 'lunar_partial'}
            ]
        }
        
        year_eclipses = known_eclipses.get(year, [])
        
        return [
            {
                'type': 'eclipse',
                'eclipse_type': e['type'],
                'date': e['date'],
                'kabbalistic_meaning': self._get_eclipse_meaning(e['type']),
                'shadow_work': 'Los eclipses son portales de transformación. Excelente para trabajo de sombra profundo.'
            }
            for e in year_eclipses
        ]
    
    def _get_eclipse_meaning(self, eclipse_type: str) -> str:
        """Significado cabalístico del eclipse"""
        meanings = {
            'solar_total': 'Eclipse solar total: Tiferet oscurecido. Momento de introspección sobre identidad.',
            'solar_annular': 'Eclipse solar anular: Anillo de luz. Lo oculto rodea lo visible.',
            'solar_partial': 'Eclipse solar parcial: Parcial oscurecimiento del ego. Revisión suave.',
            'lunar_total': 'Eclipse lunar total: Yesod transformado. Los sueños revelan verdades profundas.',
            'lunar_partial': 'Eclipse lunar parcial: Emociones parcialmente iluminadas.',
            'lunar_penumbral': 'Eclipse lunar penumbral: Sombra sutil sobre lo inconsciente.'
        }
        return meanings.get(eclipse_type, 'Momento de transformación cósmica.')
    
    def _get_year_retrogrades(self, year: int) -> List[Dict]:
        """Lista retrogradaciones principales del año"""
        # Mercurio retrograda ~3-4 veces al año, ~3 semanas cada vez
        # Esto es aproximado - para precisión se necesita Swiss Ephemeris
        
        return [
            {
                'type': 'retrograde',
                'planet': 'mercury',
                'approximate_periods': f'{year}: Aproximadamente 3-4 períodos de ~3 semanas',
                'sefira_affected': 'hod',
                'meaning': 'Revisión de comunicación, pensamiento y acuerdos.',
                'practice': 'Revisar, no iniciar. Completar pendientes. Comunicar con cuidado.'
            }
        ]
    
    # ==================== SÍNTESIS Y PRÁCTICAS ====================
    
    def _generate_synthesis(self, context: Dict) -> str:
        """Genera síntesis cabalística del contexto"""
        lunar = context.get('lunar_phase', {})
        season = context.get('season', {})
        
        phase_info = self.LUNAR_PHASE_SEFIRA.get(lunar.get('phase', ''), {})
        
        synthesis = f"Hoy la Luna en fase {lunar.get('phase', 'desconocida')} "
        synthesis += f"({lunar.get('illumination', 0)}% iluminada) "
        synthesis += f"activa la energía de {phase_info.get('sefira', 'Sefirá').upper()}. "
        synthesis += f"Estamos en {season.get('season', 'transición')} "
        synthesis += f"con el Pilar {season.get('active_pillar', 'Central').upper()} activo. "
        synthesis += f"Cualidad del día: {phase_info.get('quality', 'Transformación')}."
        
        return synthesis
    
    def _generate_practices(self, context: Dict) -> List[Dict]:
        """Genera prácticas recomendadas"""
        practices = []
        
        # Práctica lunar
        lunar = context.get('lunar_phase', {})
        phase_info = self.LUNAR_PHASE_SEFIRA.get(lunar.get('phase', ''), {})
        if phase_info:
            practices.append({
                'type': 'lunar',
                'title': f"Práctica de {phase_info.get('sefira', 'Sefirá').capitalize()}",
                'description': phase_info.get('work', ''),
                'timing': 'Ideal para hoy'
            })
        
        # Práctica estacional
        season = context.get('season', {})
        pillar_practices = self.SEASON_PILLAR.get(
            season.get('nearest_cardinal', {}).get('name', ''), 
            {}
        ).get('practices', [])
        
        for practice in pillar_practices:
            practices.append({
                'type': 'seasonal',
                'title': practice,
                'description': f"Práctica del Pilar {season.get('active_pillar', 'Central')}",
                'timing': f"Durante {season.get('season', 'esta estación')}"
            })
        
        return practices
    
    def _generate_shadow_warnings(self, context: Dict) -> List[Dict]:
        """Genera advertencias de sombra"""
        warnings = []
        
        lunar = context.get('lunar_phase', {})
        phase_info = self.LUNAR_PHASE_SEFIRA.get(lunar.get('phase', ''), {})
        
        if phase_info.get('qliphah_risk'):
            warnings.append({
                'source': 'lunar_phase',
                'qliphah': phase_info.get('qliphah_risk'),
                'warning': phase_info.get('qliphah_warning', ''),
                'prevention': 'Consciencia y moderación.'
            })
        
        return warnings
    
    def _get_personal_cosmic_cycle(self, birth_date: date, target_date: date) -> Dict:
        """Calcula ciclo cósmico personal"""
        age = self._calculate_age(birth_date, target_date)
        
        # Ciclo Sefirótico (10 años)
        sefirotic_cycle = (age % 10) + 1
        sefirot_order = ['malkuth', 'yesod', 'hod', 'netzach', 'tiferet',
                        'gevurah', 'chesed', 'binah', 'chokmah', 'keter']
        current_sefira = sefirot_order[sefirotic_cycle - 1] if sefirotic_cycle <= 10 else 'malkuth'
        
        # Próximo cumpleaños
        next_birthday = birth_date.replace(year=target_date.year)
        if next_birthday <= target_date:
            next_birthday = birth_date.replace(year=target_date.year + 1)
        
        return {
            'age': age,
            'sefirotic_cycle_year': sefirotic_cycle,
            'current_sefira': current_sefira,
            'total_cycles_completed': age // 10,
            'days_until_next_birthday': (next_birthday - target_date).days,
            'next_sefira': sefirot_order[sefirotic_cycle % 10]
        }
    
    def _add_personal_context(self, events: List[Dict], birth_date: date) -> List[Dict]:
        """Agrega contexto personal a eventos"""
        for event in events:
            event_date = self._parse_date(event.get('date'))
            if event_date:
                personal = self._get_personal_cosmic_cycle(birth_date, event_date)
                event['personal_sefira'] = personal['current_sefira']
                event['personal_age'] = personal['age']
        return events
    
    def _interpret_event_context(self, event_type: str, context: Dict) -> str:
        """Interpreta el contexto cósmico de un evento"""
        lunar = context.get('lunar_phase', {})
        season = context.get('season', {})
        
        interpretation = f"Este evento de tipo '{event_type}' ocurrió durante "
        interpretation += f"luna {lunar.get('phase', 'desconocida')} "
        interpretation += f"en {season.get('season', 'transición')}. "
        
        phase_info = self.LUNAR_PHASE_SEFIRA.get(lunar.get('phase', ''), {})
        if phase_info:
            interpretation += f"La energía de {phase_info.get('sefira', 'Sefirá')} estaba activa, "
            interpretation += f"con cualidad de '{phase_info.get('quality', '')}'."
        
        return interpretation
    
    def _extract_cosmic_learning(self, event_type: str, context: Dict) -> str:
        """Extrae aprendizaje del contexto cósmico"""
        return (
            "Los eventos de nuestra vida no son aleatorios. "
            "Ocurren en contextos cósmicos que pueden revelar significados más profundos. "
            "No determinismo, sino sincronicidad."
        )
    
    def _generate_year_summary(self, events: List[Dict]) -> Dict:
        """Genera resumen del año"""
        return {
            'total_events': len(events),
            'eclipses': sum(1 for e in events if e.get('type') == 'eclipse'),
            'cardinal_points': sum(1 for e in events if e.get('type') == 'cardinal_point'),
            'significant_moons': sum(1 for e in events if e.get('type') == 'lunar')
        }
    
    def _identify_year_themes(self, events: List[Dict]) -> List[str]:
        """Identifica temas cabalísticos del año"""
        themes = []
        
        eclipses = [e for e in events if e.get('type') == 'eclipse']
        if len(eclipses) >= 4:
            themes.append("Año de transformación profunda (múltiples eclipses)")
        
        return themes if themes else ["Año de crecimiento gradual"]
    
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
