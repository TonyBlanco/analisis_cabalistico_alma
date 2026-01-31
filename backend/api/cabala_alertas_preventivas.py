"""
cabala_alertas_preventivas.py - Sistema de Alertas Preventivas Éticas

Concepto: Sistema que avisa (sin predecir) cuándo se aproximan:
- Transiciones históricamente difíciles
- Aniversarios de pérdidas
- Fechas de crisis pasadas
- Periodos de vulnerabilidad conocida

⚠️ ADVERTENCIA ÉTICA: Es predictivo PERO basado en historia propia, NO adivinación.
Usa datos reales del consultante, no especulación.
"""

from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


class AlertasPreventivasManager:
    """
    Gestor de alertas preventivas basadas en historia personal.
    
    PRINCIPIOS ÉTICOS:
    1. Solo usa datos históricos del consultante
    2. No predice eventos, señala patrones
    3. Siempre incluye disclaimers claros
    4. Enfocado en prevención y apoyo, no en miedo
    """
    
    # Tipos de alerta y su prioridad
    ALERT_TYPES = {
        'anniversary_loss': {'priority': 1, 'icon': '🕯️', 'color': '#6B46C1'},
        'anniversary_crisis': {'priority': 2, 'icon': '⚠️', 'color': '#D97706'},
        'seasonal_pattern': {'priority': 3, 'icon': '🍂', 'color': '#059669'},
        'transition_sefirotica': {'priority': 4, 'icon': '🌀', 'color': '#2563EB'},
        'cycle_completion': {'priority': 5, 'icon': '♻️', 'color': '#7C3AED'},
        'birthday_proximity': {'priority': 6, 'icon': '🎂', 'color': '#EC4899'},
    }
    
    def __init__(self):
        self.qliphoth_calculator = None
        
    def _get_calculator(self):
        """Lazy load del calculador"""
        if self.qliphoth_calculator is None:
            from api.cabala_qliphoth_cycles import QliphothCycleCalculator
            self.qliphoth_calculator = QliphothCycleCalculator()
        return self.qliphoth_calculator
    
    def generate_alerts(
        self,
        birth_date: date,
        life_events: List[Dict],
        test_results: Optional[List[Dict]] = None,
        lookahead_days: int = 90,
        include_suggestions: bool = True
    ) -> Dict[str, Any]:
        """
        Genera alertas preventivas basadas en el historial del consultante.
        
        Args:
            birth_date: Fecha de nacimiento
            life_events: Eventos biográficos [{date, type, description, severity}]
            test_results: Resultados de tests clínicos (opcional)
            lookahead_days: Días hacia adelante para alertas
            include_suggestions: Si incluir sugerencias terapéuticas
            
        Returns:
            Diccionario con alertas organizadas por tipo y fecha
        """
        today = date.today()
        end_date = today + timedelta(days=lookahead_days)
        
        alerts = {
            'generated_at': datetime.now().isoformat(),
            'period': {
                'start': today.isoformat(),
                'end': end_date.isoformat(),
                'days': lookahead_days
            },
            'alerts': [],
            'calendar_view': {},
            'summary': {},
            'ethical_disclaimer': self._get_ethical_disclaimer()
        }
        
        # 1. Alertas por aniversarios de pérdidas/crisis
        alerts['alerts'].extend(
            self._generate_anniversary_alerts(birth_date, life_events, today, end_date)
        )
        
        # 2. Alertas por patrones estacionales
        alerts['alerts'].extend(
            self._generate_seasonal_alerts(life_events, today, end_date)
        )
        
        # 3. Alertas por transiciones Sefiróticas
        alerts['alerts'].extend(
            self._generate_transition_alerts(birth_date, today, end_date)
        )
        
        # 4. Alertas por completitud de ciclos
        alerts['alerts'].extend(
            self._generate_cycle_alerts(birth_date, life_events, today, end_date)
        )
        
        # 5. Alertas por tests clínicos (si hay datos)
        if test_results:
            alerts['alerts'].extend(
                self._generate_clinical_alerts(test_results, today, end_date)
            )
        
        # Agregar sugerencias si se solicita
        if include_suggestions:
            for alert in alerts['alerts']:
                alert['suggestions'] = self._generate_suggestions(alert)
        
        # Ordenar por fecha y prioridad
        alerts['alerts'].sort(key=lambda x: (x['date'], x.get('priority', 99)))
        
        # Generar vista de calendario
        alerts['calendar_view'] = self._generate_calendar_view(alerts['alerts'])
        
        # Generar resumen
        alerts['summary'] = self._generate_summary(alerts['alerts'])
        
        return alerts
    
    def _generate_anniversary_alerts(
        self,
        birth_date: date,
        events: List[Dict],
        start: date,
        end: date
    ) -> List[Dict]:
        """Genera alertas por aniversarios de eventos significativos"""
        alerts = []
        
        for event in events:
            event_date = self._parse_date(event.get('date'))
            if not event_date:
                continue
            
            severity = event.get('severity', '').lower()
            event_type = event.get('type', 'unknown')
            
            # Solo alertar para eventos significativos
            is_significant = severity in ['alto', 'severo', 'high', 'severe', 'crítico'] or \
                           event_type in ['loss', 'death', 'divorce', 'trauma', 'crisis']
            
            if not is_significant:
                continue
            
            # Calcular próximo aniversario
            anniversary = event_date.replace(year=start.year)
            if anniversary < start:
                anniversary = event_date.replace(year=start.year + 1)
            
            if start <= anniversary <= end:
                days_until = (anniversary - start).days
                years_since = anniversary.year - event_date.year
                
                # Determinar tipo de alerta
                if event_type in ['loss', 'death']:
                    alert_type = 'anniversary_loss'
                else:
                    alert_type = 'anniversary_crisis'
                
                type_info = self.ALERT_TYPES[alert_type]
                
                alerts.append({
                    'id': f"ann_{event_date.isoformat()}_{alert_type}",
                    'type': alert_type,
                    'date': anniversary.isoformat(),
                    'days_until': days_until,
                    'priority': type_info['priority'],
                    'icon': type_info['icon'],
                    'color': type_info['color'],
                    'title': f"Aniversario: {event.get('description', 'evento significativo')[:40]}",
                    'message': self._generate_anniversary_message(event, years_since),
                    'original_event': {
                        'date': event_date.isoformat(),
                        'type': event_type,
                        'description': event.get('description', ''),
                        'severity': severity
                    },
                    'years_since': years_since,
                    'ethical_note': "Este aviso está basado en tu historia personal, no en predicción."
                })
        
        return alerts
    
    def _generate_seasonal_alerts(
        self,
        events: List[Dict],
        start: date,
        end: date
    ) -> List[Dict]:
        """Genera alertas por patrones estacionales detectados"""
        alerts = []
        
        # Analizar patrones por mes
        monthly_crises = defaultdict(list)
        for event in events:
            event_date = self._parse_date(event.get('date'))
            if event_date and event.get('severity', '').lower() in ['alto', 'severo', 'high', 'severe']:
                monthly_crises[event_date.month].append({
                    'year': event_date.year,
                    'description': event.get('description', '')
                })
        
        # Crear alertas para meses con patrones
        current_month = start.month
        for month_offset in range(4):  # Próximos 4 meses
            check_month = ((current_month - 1 + month_offset) % 12) + 1
            check_year = start.year + ((current_month - 1 + month_offset) // 12)
            
            if check_month in monthly_crises and len(monthly_crises[check_month]) >= 2:
                # Hay un patrón en este mes
                first_day = date(check_year, check_month, 1)
                
                if start <= first_day <= end:
                    type_info = self.ALERT_TYPES['seasonal_pattern']
                    crises = monthly_crises[check_month]
                    years = [c['year'] for c in crises]
                    
                    alerts.append({
                        'id': f"seasonal_{check_year}_{check_month}",
                        'type': 'seasonal_pattern',
                        'date': first_day.isoformat(),
                        'days_until': (first_day - start).days,
                        'priority': type_info['priority'],
                        'icon': type_info['icon'],
                        'color': type_info['color'],
                        'title': f"Patrón estacional: {self._month_name(check_month)}",
                        'message': f"En los últimos años, durante {self._month_name(check_month)} has tenido {len(crises)} episodios difíciles (años: {', '.join(map(str, years))}). No es predicción, es patrón histórico.",
                        'historical_years': years,
                        'pattern_strength': len(crises),
                        'ethical_note': "Sugerencia: Planificar sesiones de apoyo durante este período."
                    })
        
        return alerts
    
    def _generate_transition_alerts(
        self,
        birth_date: date,
        start: date,
        end: date
    ) -> List[Dict]:
        """Genera alertas por transiciones Sefiróticas próximas"""
        alerts = []
        calculator = self._get_calculator()
        
        # Calcular próximo cumpleaños (transición de ciclo)
        next_birthday = birth_date.replace(year=start.year)
        if next_birthday <= start:
            next_birthday = birth_date.replace(year=start.year + 1)
        
        if start <= next_birthday <= end:
            current_age = self._calculate_age(birth_date, start)
            new_age = current_age + 1
            
            # Obtener info de ciclos
            current_info = calculator.calculate_current_qliphoth(birth_date, start)
            next_info = calculator.calculate_current_qliphoth(birth_date, next_birthday + timedelta(days=1))
            
            type_info = self.ALERT_TYPES['transition_sefirotica']
            
            alerts.append({
                'id': f"transition_{next_birthday.isoformat()}",
                'type': 'transition_sefirotica',
                'date': next_birthday.isoformat(),
                'days_until': (next_birthday - start).days,
                'priority': type_info['priority'],
                'icon': type_info['icon'],
                'color': type_info['color'],
                'title': f"Transición Sefirótica: Edad {new_age}",
                'message': f"En {(next_birthday - start).days} días pasarás de {current_info['corresponding_sefira'].capitalize()} a {next_info['corresponding_sefira'].capitalize()}. Momento de transición energética.",
                'from_sefira': current_info['corresponding_sefira'],
                'to_sefira': next_info['corresponding_sefira'],
                'from_qliphoth': current_info['current_qliphoth'],
                'to_qliphoth': next_info['current_qliphoth'],
                'new_age': new_age,
                'cycle_year': next_info['cycle_year'],
                'integration_path': next_info.get('integration_path', ''),
                'ethical_note': "Las transiciones son oportunidades de crecimiento, no predicciones de crisis."
            })
            
            # Alerta de proximidad al cumpleaños
            type_info_bday = self.ALERT_TYPES['birthday_proximity']
            
            alerts.append({
                'id': f"birthday_{next_birthday.isoformat()}",
                'type': 'birthday_proximity',
                'date': next_birthday.isoformat(),
                'days_until': (next_birthday - start).days,
                'priority': type_info_bday['priority'],
                'icon': type_info_bday['icon'],
                'color': type_info_bday['color'],
                'title': f"Cumpleaños {new_age}",
                'message': f"Tu cumpleaños {new_age} se aproxima. Momento de reflexión sobre el ciclo que termina.",
                'new_age': new_age
            })
        
        return alerts
    
    def _generate_cycle_alerts(
        self,
        birth_date: date,
        events: List[Dict],
        start: date,
        end: date
    ) -> List[Dict]:
        """Genera alertas por completitud de ciclos significativos"""
        alerts = []
        current_age = self._calculate_age(birth_date, start)
        
        # Ciclos significativos
        significant_cycles = {
            9: 'Ciclo Sefirótico Completo',
            10: 'Década de vida',
            18: 'Ciclo Nodal (destino)',
            29: 'Retorno de Saturno',
            36: 'Doble ciclo de 18',
            40: 'Cuarta década',
            50: 'Medio siglo',
        }
        
        for cycle_age, cycle_name in significant_cycles.items():
            if current_age < cycle_age <= current_age + 1:
                # Este ciclo se completará en el próximo cumpleaños
                cycle_birthday = birth_date.replace(year=birth_date.year + cycle_age)
                
                if start <= cycle_birthday <= end:
                    type_info = self.ALERT_TYPES['cycle_completion']
                    
                    alerts.append({
                        'id': f"cycle_{cycle_age}",
                        'type': 'cycle_completion',
                        'date': cycle_birthday.isoformat(),
                        'days_until': (cycle_birthday - start).days,
                        'priority': type_info['priority'],
                        'icon': type_info['icon'],
                        'color': type_info['color'],
                        'title': f"Completitud: {cycle_name}",
                        'message': f"Cumplirás {cycle_age} años, marcando la completitud del {cycle_name}. Momento de integración y cierre.",
                        'cycle_type': cycle_name,
                        'age': cycle_age,
                        'significance': self._get_cycle_significance(cycle_age)
                    })
        
        return alerts
    
    def _generate_clinical_alerts(
        self,
        test_results: List[Dict],
        start: date,
        end: date
    ) -> List[Dict]:
        """Genera alertas basadas en patrones de tests clínicos"""
        alerts = []
        
        # Agrupar tests por mes
        monthly_tests = defaultdict(list)
        for result in test_results:
            test_date = self._parse_date(result.get('date'))
            if test_date:
                monthly_tests[test_date.month].append(result)
        
        # Detectar meses con múltiples tests de alta severidad
        current_month = start.month
        for month_offset in range(4):
            check_month = ((current_month - 1 + month_offset) % 12) + 1
            check_year = start.year + ((current_month - 1 + month_offset) // 12)
            
            month_results = monthly_tests.get(check_month, [])
            severe_count = sum(1 for r in month_results if r.get('severity', '').lower() in ['alto', 'severo'])
            
            if severe_count >= 2:
                first_day = date(check_year, check_month, 1)
                if start <= first_day <= end:
                    alerts.append({
                        'id': f"clinical_{check_year}_{check_month}",
                        'type': 'seasonal_pattern',
                        'date': first_day.isoformat(),
                        'days_until': (first_day - start).days,
                        'priority': 2,
                        'icon': '📊',
                        'color': '#DC2626',
                        'title': f"Patrón clínico: {self._month_name(check_month)}",
                        'message': f"Tests clínicos muestran patrones de dificultad en {self._month_name(check_month)}. Considera evaluación preventiva.",
                        'historical_tests': severe_count,
                        'ethical_note': "Basado en historial clínico, no predicción."
                    })
        
        return alerts
    
    def _generate_suggestions(self, alert: Dict) -> List[Dict]:
        """Genera sugerencias terapéuticas para una alerta"""
        suggestions = []
        alert_type = alert.get('type', '')
        
        if alert_type == 'anniversary_loss':
            suggestions = [
                {'type': 'session', 'text': 'Programar sesión de duelo/memoria una semana antes'},
                {'type': 'ritual', 'text': 'Crear un ritual de honra (carta, vela, visita)'},
                {'type': 'support', 'text': 'Informar a red de apoyo sobre la fecha'},
                {'type': 'self_care', 'text': 'Planificar autocuidado extra ese día'}
            ]
        elif alert_type == 'anniversary_crisis':
            suggestions = [
                {'type': 'session', 'text': 'Sesión preventiva 2 semanas antes'},
                {'type': 'awareness', 'text': 'Revisar qué desencadenó la crisis original'},
                {'type': 'tools', 'text': 'Preparar herramientas de regulación emocional'},
                {'type': 'plan', 'text': 'Crear plan de acción si surgen síntomas'}
            ]
        elif alert_type == 'seasonal_pattern':
            suggestions = [
                {'type': 'frequency', 'text': 'Aumentar frecuencia de sesiones durante este período'},
                {'type': 'lifestyle', 'text': 'Ajustar rutinas de sueño y ejercicio'},
                {'type': 'social', 'text': 'Fortalecer conexiones sociales'},
                {'type': 'monitoring', 'text': 'Llevar diario de síntomas'}
            ]
        elif alert_type == 'transition_sefirotica':
            from_sefira = alert.get('from_sefira', '')
            to_sefira = alert.get('to_sefira', '')
            suggestions = [
                {'type': 'reflection', 'text': f'Reflexionar: ¿Qué aprendí en {from_sefira}?'},
                {'type': 'intention', 'text': f'Establecer intención para el año de {to_sefira}'},
                {'type': 'ritual', 'text': 'Ritual de transición en el cumpleaños'},
                {'type': 'integration', 'text': alert.get('integration_path', 'Trabajo de integración')}
            ]
        elif alert_type == 'cycle_completion':
            suggestions = [
                {'type': 'review', 'text': f"Revisión de vida: ¿Qué logré en este ciclo de {alert.get('age', '?')} años?"},
                {'type': 'closure', 'text': 'Identificar lo que necesita cierre'},
                {'type': 'celebration', 'text': 'Celebrar logros y aprendizajes'},
                {'type': 'vision', 'text': 'Crear visión para el próximo ciclo'}
            ]
        else:
            suggestions = [
                {'type': 'awareness', 'text': 'Mantener consciencia de esta fecha'},
                {'type': 'support', 'text': 'Considerar apoyo adicional si es necesario'}
            ]
        
        return suggestions
    
    def _generate_calendar_view(self, alerts: List[Dict]) -> Dict[str, List[Dict]]:
        """Genera vista de calendario organizada por semana/mes"""
        calendar = defaultdict(list)
        
        for alert in alerts:
            alert_date = self._parse_date(alert.get('date'))
            if alert_date:
                # Agrupar por mes
                month_key = alert_date.strftime('%Y-%m')
                calendar[month_key].append({
                    'day': alert_date.day,
                    'type': alert['type'],
                    'title': alert['title'],
                    'icon': alert['icon'],
                    'color': alert['color']
                })
        
        return dict(calendar)
    
    def _generate_summary(self, alerts: List[Dict]) -> Dict:
        """Genera resumen de alertas"""
        if not alerts:
            return {
                'total_alerts': 0,
                'message': 'No hay alertas significativas para el período consultado.',
                'recommendation': 'Continuar con plan terapéutico regular.'
            }
        
        # Contar por tipo
        by_type = defaultdict(int)
        for alert in alerts:
            by_type[alert['type']] += 1
        
        # Encontrar la más próxima
        next_alert = min(alerts, key=lambda x: x.get('days_until', 999))
        
        # Determinar nivel general
        high_priority = sum(1 for a in alerts if a.get('priority', 99) <= 2)
        
        if high_priority >= 3:
            level = 'alto'
            recommendation = 'Se recomienda revisión de plan terapéutico y aumento de frecuencia de sesiones.'
        elif high_priority >= 1:
            level = 'moderado'
            recommendation = 'Mantener seguimiento regular con atención especial a las fechas señaladas.'
        else:
            level = 'bajo'
            recommendation = 'Período tranquilo anticipado. Buen momento para trabajo profundo.'
        
        return {
            'total_alerts': len(alerts),
            'alerts_by_type': dict(by_type),
            'high_priority_count': high_priority,
            'attention_level': level,
            'next_alert': {
                'date': next_alert['date'],
                'days_until': next_alert['days_until'],
                'title': next_alert['title']
            },
            'recommendation': recommendation,
            'ethical_note': 'Estas alertas son herramientas de consciencia, no predicciones.'
        }
    
    def _generate_anniversary_message(self, event: Dict, years_since: int) -> str:
        """Genera mensaje para aniversario"""
        event_type = event.get('type', 'evento')
        description = event.get('description', '')[:50]
        
        if event_type in ['loss', 'death']:
            return f"Se cumplirán {years_since} años de '{description}'. Momento para honrar la memoria y procesar lo que sigue vivo."
        else:
            return f"Aniversario #{years_since} de '{description}'. Tu sistema puede reactivar memorias asociadas. Es natural y puede ser oportunidad de integración."
    
    def _calculate_age(self, birth_date: date, target_date: date) -> int:
        """Calcula la edad"""
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
                try:
                    return datetime.strptime(date_value, '%Y-%m-%d').date()
                except:
                    return None
        return None
    
    def _month_name(self, month: int) -> str:
        """Nombre del mes"""
        months = {
            1: 'enero', 2: 'febrero', 3: 'marzo', 4: 'abril',
            5: 'mayo', 6: 'junio', 7: 'julio', 8: 'agosto',
            9: 'septiembre', 10: 'octubre', 11: 'noviembre', 12: 'diciembre'
        }
        return months.get(month, str(month))
    
    def _get_cycle_significance(self, age: int) -> str:
        """Significado del ciclo por edad"""
        significances = {
            9: 'Primera completitud del ciclo Sefirótico. El niño ha recorrido todo el Árbol.',
            10: 'Primera década. Cierre de infancia temprana.',
            18: 'Ciclo nodal completo. Emergencia del destino personal.',
            29: 'Primer retorno de Saturno. Crisis de madurez y responsabilidad.',
            36: 'Doble ciclo nodal. Integración de propósito.',
            40: 'Cuarta década. Revisión de mitad de vida.',
            50: 'Medio siglo. Integración de sabiduría.',
            58: 'Segundo retorno de Saturno. Maestría y legado.',
        }
        return significances.get(age, 'Ciclo significativo de vida.')
    
    def _get_ethical_disclaimer(self) -> str:
        """Disclaimer ético"""
        return (
            "⚠️ AVISO ÉTICO IMPORTANTE:\n\n"
            "Este sistema de alertas está basado ÚNICAMENTE en tu historia personal documentada. "
            "NO predice el futuro ni determina tu destino.\n\n"
            "Las alertas son invitaciones a:\n"
            "• Consciencia preventiva\n"
            "• Planificación de apoyo\n"
            "• Reflexión sobre patrones propios\n\n"
            "NO son:\n"
            "• Predicciones de crisis\n"
            "• Diagnósticos\n"
            "• Determinismos\n\n"
            "Tu libre albedrío y las circunstancias actuales siempre prevalecen sobre cualquier patrón histórico."
        )
