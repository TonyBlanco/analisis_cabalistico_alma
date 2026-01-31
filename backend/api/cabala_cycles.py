"""
cabala_cycles.py - P2.2 Tikun Cycles Calculator

Calcula ciclos de tikún (corrección) basados en numerología cabalística.
Este módulo es OBSERVACIONAL - NO predictivo, solo mapeo de ciclos simbólicos.

⚠️ ADVERTENCIA: Los ciclos son mapas simbólicos del tiempo.
No determinan eventos ni predicen resultados.
Son herramientas de reflexión consciente.
"""

from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any


class TikunCycleCalculator:
    """
    Calcula ciclos de tikún (corrección) basados en fecha de nacimiento.
    
    Tipos de ciclos:
    - Anual: Ciclo de 9/10 años
    - Lunar: Ciclo de 28 días
    - Semanal: Ciclo de 7 días
    
    NO predictivo, solo mapeo de ciclos simbólicos.
    """
    
    CYCLE_TYPES = {
        'yearly': {
            'duration_days': 365,
            'name': 'Ciclo Anual',
            'description': 'Ciclo de 9 años que se repite'
        },
        'monthly': {
            'duration_days': 28,  # Ciclo lunar promedio
            'name': 'Ciclo Lunar',
            'description': 'Ciclo mensual de 28 días'
        },
        'weekly': {
            'duration_days': 7,
            'name': 'Ciclo Semanal',
            'description': 'Ciclo de 7 días (Sefirot inferiores)'
        }
    }
    
    # Ciclo de Sefirot para año/mes
    SEFIROT_CYCLE = [
        'malkuth',   # Posición 0/1
        'yesod',     # Posición 2
        'hod',       # Posición 3
        'netzach',   # Posición 4
        'tiferet',   # Posición 5
        'gevurah',   # Posición 6
        'chesed',    # Posición 7
        'binah',     # Posición 8
        'chokmah'    # Posición 9
        # Keter se alcanza en año 10 (reinicio)
    ]
    
    # Mapeo de día de semana a Sefirá
    WEEKLY_SEFIROT = {
        0: {'sefira': 'gevurah', 'day': 'Lunes'},      # Monday
        1: {'sefira': 'tiferet', 'day': 'Martes'},     # Tuesday
        2: {'sefira': 'netzach', 'day': 'Miércoles'},  # Wednesday
        3: {'sefira': 'hod', 'day': 'Jueves'},         # Thursday
        4: {'sefira': 'yesod', 'day': 'Viernes'},      # Friday
        5: {'sefira': 'malkuth', 'day': 'Sábado'},     # Saturday (Shabat)
        6: {'sefira': 'chesed', 'day': 'Domingo'}      # Sunday
    }
    
    # Información de Sefirot para reportes
    SEFIRA_INFO = {
        'keter': {'name': 'Keter', 'meaning': 'Corona', 'quality': 'Voluntad divina'},
        'chokmah': {'name': 'Chokmah', 'meaning': 'Sabiduría', 'quality': 'Intuición'},
        'binah': {'name': 'Binah', 'meaning': 'Entendimiento', 'quality': 'Comprensión'},
        'chesed': {'name': 'Chesed', 'meaning': 'Misericordia', 'quality': 'Amor expansivo'},
        'gevurah': {'name': 'Gevurah', 'meaning': 'Rigor', 'quality': 'Límites'},
        'tiferet': {'name': 'Tiferet', 'meaning': 'Belleza', 'quality': 'Armonía'},
        'netzach': {'name': 'Netzach', 'meaning': 'Victoria', 'quality': 'Persistencia'},
        'hod': {'name': 'Hod', 'meaning': 'Esplendor', 'quality': 'Comunicación'},
        'yesod': {'name': 'Yesod', 'meaning': 'Fundamento', 'quality': 'Identidad'},
        'malkuth': {'name': 'Malkuth', 'meaning': 'Reino', 'quality': 'Manifestación'}
    }
    
    def calculate_yearly_cycle(
        self, 
        birth_date: date,
        target_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Calcula en qué año del ciclo de 9 se encuentra la persona.
        
        Args:
            birth_date: Fecha de nacimiento
            target_date: Fecha para calcular (default: hoy)
            
        Returns:
            Información del ciclo anual
        """
        if target_date is None:
            target_date = date.today()
        
        # Edad actual
        age = self._calculate_age(birth_date, target_date)
        
        # Posición en el ciclo de 9 (0-8)
        cycle_position = age % 9
        
        # Keter se alcanza en múltiplos de 10
        if age > 0 and age % 10 == 0:
            current_sefira = 'keter'
            cycle_year = 10
        else:
            current_sefira = self.SEFIROT_CYCLE[cycle_position]
            cycle_year = cycle_position if cycle_position > 0 else 9
        
        # Próximo cumpleaños
        next_birthday = birth_date.replace(year=target_date.year)
        if next_birthday <= target_date:
            next_birthday = birth_date.replace(year=target_date.year + 1)
        
        # Días desde último cumpleaños
        last_birthday = birth_date.replace(year=target_date.year)
        if last_birthday > target_date:
            last_birthday = birth_date.replace(year=target_date.year - 1)
        days_in_cycle = (target_date - last_birthday).days
        
        # Próxima Sefirá
        next_cycle_position = (cycle_position + 1) % 9
        next_sefira = self.SEFIROT_CYCLE[next_cycle_position]
        
        return {
            'cycle_type': 'yearly',
            'current_age': age,
            'cycle_year': cycle_year,
            'current_sefira': current_sefira,
            'current_sefira_info': self.SEFIRA_INFO.get(current_sefira, {}),
            'days_in_cycle': days_in_cycle,
            'days_until_transition': (next_birthday - target_date).days,
            'next_sefira': next_sefira,
            'next_sefira_info': self.SEFIRA_INFO.get(next_sefira, {}),
            'transition_date': next_birthday.isoformat(),
            'progress_percent': round((days_in_cycle / 365) * 100, 1)
        }
    
    def calculate_lunar_cycle(
        self,
        birth_date: date,
        target_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Calcula ciclo lunar de 28 días.
        Mapea a las 7 Sefirot inferiores (4 días por Sefirá).
        
        Args:
            birth_date: Fecha de nacimiento
            target_date: Fecha para calcular (default: hoy)
            
        Returns:
            Información del ciclo lunar
        """
        if target_date is None:
            target_date = date.today()
        
        # Días desde el último cumpleaños
        last_birthday = birth_date.replace(year=target_date.year)
        if last_birthday > target_date:
            last_birthday = birth_date.replace(year=target_date.year - 1)
        
        days_since_birthday = (target_date - last_birthday).days
        
        # Posición en el ciclo lunar de 28 días (0-27)
        lunar_day = days_since_birthday % 28
        
        # Mapear a Sefirot (0-3: Malkuth, 4-7: Yesod, etc.)
        lower_sefirot = self.SEFIROT_CYCLE[:7]  # Solo las 7 inferiores
        sefira_index = lunar_day // 4
        current_sefira = lower_sefirot[sefira_index]
        
        # Día dentro de la Sefirá actual (1-4)
        sefira_day = (lunar_day % 4) + 1
        
        # Días hasta próxima Sefirá
        days_until_next = 4 - (lunar_day % 4)
        next_sefira_index = (sefira_index + 1) % 7
        next_sefira = lower_sefirot[next_sefira_index]
        
        return {
            'cycle_type': 'monthly',
            'lunar_day': lunar_day + 1,  # 1-28
            'current_sefira': current_sefira,
            'current_sefira_info': self.SEFIRA_INFO.get(current_sefira, {}),
            'sefira_day': sefira_day,  # 1-4 dentro de la Sefirá
            'days_until_transition': days_until_next,
            'next_sefira': next_sefira,
            'next_sefira_info': self.SEFIRA_INFO.get(next_sefira, {}),
            'progress_percent': round((lunar_day / 28) * 100, 1)
        }
    
    def calculate_weekly_cycle(
        self,
        target_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Calcula ciclo semanal de 7 días.
        Mapea día de la semana a Sefirá correspondiente.
        
        Args:
            target_date: Fecha para calcular (default: hoy)
            
        Returns:
            Información del ciclo semanal
        """
        if target_date is None:
            target_date = date.today()
        
        # 0=Lunes, 6=Domingo
        weekday = target_date.weekday()
        
        current_info = self.WEEKLY_SEFIROT[weekday]
        current_sefira = current_info['sefira']
        weekday_name = current_info['day']
        
        # Próximo día
        next_weekday = (weekday + 1) % 7
        next_info = self.WEEKLY_SEFIROT[next_weekday]
        next_sefira = next_info['sefira']
        
        return {
            'cycle_type': 'weekly',
            'weekday': weekday,
            'weekday_name': weekday_name,
            'current_sefira': current_sefira,
            'current_sefira_info': self.SEFIRA_INFO.get(current_sefira, {}),
            'next_sefira': next_sefira,
            'next_sefira_info': self.SEFIRA_INFO.get(next_sefira, {}),
            'days_until_transition': 1,
            'tomorrow_name': self.WEEKLY_SEFIROT[next_weekday]['day']
        }
    
    def generate_cycle_report(
        self,
        birth_date: date,
        target_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Genera reporte completo de todos los ciclos.
        
        Args:
            birth_date: Fecha de nacimiento
            target_date: Fecha para calcular (default: hoy)
            
        Returns:
            Reporte completo con todos los ciclos
        """
        if target_date is None:
            target_date = date.today()
        
        yearly = self.calculate_yearly_cycle(birth_date, target_date)
        monthly = self.calculate_lunar_cycle(birth_date, target_date)
        weekly = self.calculate_weekly_cycle(target_date)
        
        synchronicities = self.find_synchronicities(yearly, monthly, weekly)
        
        return {
            'meta': {
                'birth_date': birth_date.isoformat(),
                'analysis_date': target_date.isoformat(),
                'generated_at': datetime.now().isoformat()
            },
            'cycles': {
                'yearly': yearly,
                'monthly': monthly,
                'weekly': weekly
            },
            'synchronicities': synchronicities,
            'summary': self._generate_summary(yearly, monthly, weekly),
            'disclaimer': (
                'Los ciclos son mapas simbólicos del tiempo. '
                'No determinan eventos ni predicen resultados. '
                'Son herramientas de reflexión consciente.'
            )
        }
    
    def find_synchronicities(
        self,
        yearly: Dict,
        monthly: Dict,
        weekly: Dict
    ) -> List[Dict[str, Any]]:
        """
        Identifica si hay Sefirot compartidas entre ciclos.
        No interpreta, solo señala coincidencias.
        
        Returns:
            Lista de sincronicidades detectadas
        """
        syncs = []
        
        y_sefira = yearly.get('current_sefira', '')
        m_sefira = monthly.get('current_sefira', '')
        w_sefira = weekly.get('current_sefira', '')
        
        if y_sefira == m_sefira:
            syncs.append({
                'type': 'year_month',
                'sefira': y_sefira,
                'description': f'Sincronicidad año-mes: {y_sefira}',
                'significance': 'Los ciclos anual y lunar comparten la misma Sefirá'
            })
        
        if y_sefira == w_sefira:
            syncs.append({
                'type': 'year_week',
                'sefira': y_sefira,
                'description': f'Sincronicidad año-semana: {y_sefira}',
                'significance': 'Los ciclos anual y semanal comparten la misma Sefirá'
            })
        
        if m_sefira == w_sefira:
            syncs.append({
                'type': 'month_week',
                'sefira': m_sefira,
                'description': f'Sincronicidad mes-semana: {m_sefira}',
                'significance': 'Los ciclos lunar y semanal comparten la misma Sefirá'
            })
        
        if y_sefira == m_sefira == w_sefira:
            syncs.append({
                'type': 'triple',
                'sefira': y_sefira,
                'description': f'¡Triple sincronicidad!: {y_sefira}',
                'significance': 'Los tres ciclos convergen en la misma Sefirá - momento de intensidad'
            })
        
        return syncs
    
    def _calculate_age(self, birth_date: date, target_date: date) -> int:
        """Calcula edad exacta."""
        age = target_date.year - birth_date.year
        if (target_date.month, target_date.day) < (birth_date.month, birth_date.day):
            age -= 1
        return max(0, age)
    
    def _generate_summary(
        self,
        yearly: Dict,
        monthly: Dict,
        weekly: Dict
    ) -> Dict[str, Any]:
        """Genera resumen de todos los ciclos."""
        return {
            'dominant_sefira': self._find_dominant_sefira(yearly, monthly, weekly),
            'total_synchronicities': len(self.find_synchronicities(yearly, monthly, weekly)),
            'yearly_progress': yearly.get('progress_percent', 0),
            'monthly_progress': monthly.get('progress_percent', 0),
            'next_transitions': {
                'yearly': {
                    'days': yearly.get('days_until_transition', 0),
                    'to_sefira': yearly.get('next_sefira', '')
                },
                'monthly': {
                    'days': monthly.get('days_until_transition', 0),
                    'to_sefira': monthly.get('next_sefira', '')
                },
                'weekly': {
                    'days': 1,
                    'to_sefira': weekly.get('next_sefira', '')
                }
            }
        }
    
    def _find_dominant_sefira(
        self,
        yearly: Dict,
        monthly: Dict,
        weekly: Dict
    ) -> Optional[str]:
        """
        Encuentra si hay una Sefirá dominante (presente en 2+ ciclos).
        """
        sefirot = [
            yearly.get('current_sefira', ''),
            monthly.get('current_sefira', ''),
            weekly.get('current_sefira', '')
        ]
        
        # Contar ocurrencias
        counts = {}
        for s in sefirot:
            if s:
                counts[s] = counts.get(s, 0) + 1
        
        # Buscar dominante (2+)
        for sefira, count in counts.items():
            if count >= 2:
                return sefira
        
        return None


# Singleton instance for convenience
tikun_cycle_calculator = TikunCycleCalculator()
