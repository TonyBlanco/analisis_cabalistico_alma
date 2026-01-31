"""
cabala_qliphoth_cycles.py - Calculadora de Ciclos de Sombra Personal (Qliphoth)

Calcula ciclos de sombra basados en correspondencias inversas a las Sefirot.
Este módulo es EDUCATIVO y ÉTICO - NO predictivo, solo mapeo de patrones históricos.

⚠️ ADVERTENCIA ÉTICA: Los ciclos son mapas simbólicos del tiempo.
No determinan eventos ni predicen crisis futuras.
Solo señalan correlaciones históricas para consciencia preventiva.
"""

from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any
import logging
from django.db import models

logger = logging.getLogger(__name__)


class QliphothCycleCalculator:
    """
    Calcula ciclos de sombra personal basados en correspondencias inversas de Sefirot.
    
    PRINCIPIO: Cada año de ciclo Sefirótico tiene su correspondencia sombría.
    USO ÉTICO: Mapear crisis pasadas, NO predecir eventos futuros.
    OBJETIVO: Consciencia preventiva basada en patrones históricos propios.
    """
    
    # Mapeo Sefirá → Qliphah (espejo inverso del ciclo de 9 años)
    SEFIRA_TO_QLIPHAH_CYCLE = {
        0: {'sefira': 'malkuth', 'qliphah': 'lilith'},    # Año 1 del ciclo
        1: {'sefira': 'yesod', 'qliphah': 'gamaliel'},   # Año 2 del ciclo
        2: {'sefira': 'hod', 'qliphah': 'samael'},       # Año 3 del ciclo
        3: {'sefira': 'netzach', 'qliphah': 'arab_zaraq'}, # Año 4 del ciclo
        4: {'sefira': 'tiferet', 'qliphah': 'thagirion'}, # Año 5 del ciclo
        5: {'sefira': 'gevurah', 'qliphah': 'golachab'},  # Año 6 del ciclo
        6: {'sefira': 'chesed', 'qliphah': 'gamchicoth'}, # Año 7 del ciclo
        7: {'sefira': 'binah', 'qliphah': 'satariel'},    # Año 8 del ciclo
        8: {'sefira': 'chokmah', 'qliphah': 'ghagiel'},   # Año 9 del ciclo
        9: {'sefira': 'keter', 'qliphah': 'thaumiel'},    # Año 10 del ciclo (master)
    }
    
    # Información detallada de cada Qliphah
    QLIPHOTH_INFO = {
        'lilith': {
            'hebrewName': 'לילית',
            'spanishName': 'Lilith',
            'meaning': 'Reina de la Noche',
            'archetype': 'El Mundo Material Corrupto',
            'shadowExpression': 'Materialismo excesivo, desconexión de lo espiritual, inercia',
            'integrationPath': 'Sacralizar la vida cotidiana. Encontrar lo divino en lo material.',
            'keywords': ['materialismo', 'inercia', 'desconexión', 'estancamiento'],
            'correspondingSefira': 'malkuth'
        },
        'gamaliel': {
            'hebrewName': 'גמליאל',
            'spanishName': 'Gamaliel',
            'meaning': 'Los Obscenos',
            'archetype': 'El Fundamento Corrompido',
            'shadowExpression': 'Instintos desviados, sueños perturbadores, fundamentos falsos',
            'integrationPath': 'Purificar los fundamentos del ser. Integrar la sexualidad de forma sagrada.',
            'keywords': ['instintos', 'sexualidad', 'sueños oscuros', 'corrupción'],
            'correspondingSefira': 'yesod'
        },
        'samael': {
            'hebrewName': 'סמאל',
            'spanishName': 'Samael',
            'meaning': 'Veneno de Dios',
            'archetype': 'El Intelecto Venenoso',
            'shadowExpression': 'Mentira, engaño intelectual, racionalización, pensamiento tóxico',
            'integrationPath': 'Usar el intelecto al servicio de la verdad. Desarrollar discernimiento honesto.',
            'keywords': ['mentira', 'engaño', 'cinismo', 'racionalización'],
            'correspondingSefira': 'hod'
        },
        'arab_zaraq': {
            'hebrewName': 'ערב זרק',
            'spanishName': 'Arav Zaraq',
            'meaning': 'Los Cuervos de Dispersión',
            'archetype': 'El Deseo Insaciable',
            'shadowExpression': 'Lujuria, adicción, deseos descontrolados, búsqueda compulsiva',
            'integrationPath': 'Canalizar la pasión hacia el amor verdadero. Transmutar deseo en devoción.',
            'keywords': ['lujuria', 'adicción', 'deseo', 'compulsión'],
            'correspondingSefira': 'netzach'
        },
        'thagirion': {
            'hebrewName': 'תגריון',
            'spanishName': 'Thagirion',
            'meaning': 'Los Disputadores',
            'archetype': 'La Belleza Corrupta',
            'shadowExpression': 'Vanidad, narcisismo, belleza superficial, ego inflado',
            'integrationPath': 'Desarrollar belleza interior genuina. Encontrar el centro verdadero.',
            'keywords': ['vanidad', 'narcisismo', 'superficialidad', 'ego'],
            'correspondingSefira': 'tiferet'
        },
        'golachab': {
            'hebrewName': 'גולכב',
            'spanishName': 'Golachab',
            'meaning': 'Los Incendiarios',
            'archetype': 'La Ira Destructiva',
            'shadowExpression': 'Crueldad, violencia, ira descontrolada, juicio despiadado',
            'integrationPath': 'Transformar la ira en acción justa. Desarrollar fuerza con compasión.',
            'keywords': ['ira', 'crueldad', 'violencia', 'juicio'],
            'correspondingSefira': 'gevurah'
        },
        'gamchicoth': {
            'hebrewName': 'גמכיכות',
            'spanishName': 'Gamchicoth',
            'meaning': 'Los Devoradores',
            'archetype': 'La Generosidad Devoradora',
            'shadowExpression': 'Dar para controlar, generosidad con expectativas, amor posesivo',
            'integrationPath': 'Aprender a dar sin expectativas. Desarrollar amor incondicional.',
            'keywords': ['posesividad', 'control', 'dependencia', 'codependencia'],
            'correspondingSefira': 'chesed'
        },
        'satariel': {
            'hebrewName': 'סתריאל',
            'spanishName': 'Satariel',
            'meaning': 'Los Ocultadores',
            'archetype': 'El Velo de Ignorancia',
            'shadowExpression': 'Ocultamiento de la verdad, negación, incapacidad de ver claramente',
            'integrationPath': 'Desarrollar el coraje para ver la verdad. Iluminar lo oculto.',
            'keywords': ['negación', 'ocultamiento', 'ceguera', 'autoengaño'],
            'correspondingSefira': 'binah'
        },
        'ghagiel': {
            'hebrewName': 'עוגיאל',
            'spanishName': 'Ghagiel',
            'meaning': 'Los Obstaculizadores',
            'archetype': 'El Caos Destructivo',
            'shadowExpression': 'Sabiduría usada para manipular, caos sin propósito, confusión mental',
            'integrationPath': 'Canalizar la energía creativa hacia propósitos constructivos.',
            'keywords': ['confusión', 'caos', 'manipulación', 'ideas obsesivas'],
            'correspondingSefira': 'chokmah'
        },
        'thaumiel': {
            'hebrewName': 'תאומיאל',
            'spanishName': 'Thaumiel',
            'meaning': 'Los Gemelos de Dios',
            'archetype': 'El Ego Dividido',
            'shadowExpression': 'División interna, incapacidad de unificar, dualidad conflictiva',
            'integrationPath': 'Reconocer que la dualidad aparente es parte de una unidad mayor.',
            'keywords': ['dualidad', 'división', 'conflicto interno', 'fragmentación'],
            'correspondingSefira': 'keter'
        }
    }
    
    def calculate_current_qliphoth(self, birth_date: date, target_date: Optional[date] = None) -> Dict[str, Any]:
        """
        Calcula la Qliphah activa actual basada en el ciclo de edad.
        
        Args:
            birth_date: Fecha de nacimiento
            target_date: Fecha para calcular (default: hoy)
            
        Returns:
            Información de la Qliphah actual
        """
        if target_date is None:
            target_date = date.today()
        
        # Calcular edad
        age = self._calculate_age(birth_date, target_date)
        
        # Posición en el ciclo de 10 (0-9)
        cycle_position = age % 10
        
        # Obtener Qliphah correspondiente
        cycle_info = self.SEFIRA_TO_QLIPHAH_CYCLE[cycle_position]
        current_qliphah = cycle_info['qliphah']
        corresponding_sefira = cycle_info['sefira']
        
        # Información detallada
        qliphah_info = self.QLIPHOTH_INFO.get(current_qliphah, {})
        
        # Calcular días en el año actual del ciclo
        last_birthday = birth_date.replace(year=target_date.year)
        if last_birthday > target_date:
            last_birthday = birth_date.replace(year=target_date.year - 1)
        days_in_cycle = (target_date - last_birthday).days
        
        # Próximo cumpleaños y transición
        next_birthday = birth_date.replace(year=target_date.year)
        if next_birthday <= target_date:
            next_birthday = birth_date.replace(year=target_date.year + 1)
        
        # Próxima Qliphah
        next_cycle_position = (cycle_position + 1) % 10
        next_cycle_info = self.SEFIRA_TO_QLIPHAH_CYCLE[next_cycle_position]
        next_qliphah = next_cycle_info['qliphah']
        
        return {
            'current_qliphoth': current_qliphah,
            'cycle_year': cycle_position + 1,  # 1-10
            'corresponding_sefira': corresponding_sefira,
            'shadow_manifestation': qliphah_info.get('shadowExpression', ''),
            'integration_path': qliphah_info.get('integrationPath', ''),
            'qliphah_info': qliphah_info,
            'current_age': age,
            'days_in_cycle': days_in_cycle,
            'days_until_transition': (next_birthday - target_date).days,
            'next_qliphoth': next_qliphah,
            'next_qliphah_info': self.QLIPHOTH_INFO.get(next_qliphah, {}),
            'transition_date': next_birthday.isoformat(),
            'progress_percent': round((days_in_cycle / 365) * 100, 1)
        }
    
    def map_events_to_qliphoth(self, consultante_uuid: str, birth_date: date) -> List[Dict]:
        """
        Mapea eventos históricos del consultante a las Qliphoth activas en esos momentos.
        
        ÉTICO: Solo mapea eventos YA OCURRIDOS, nunca predice.
        
        Args:
            consultante_uuid: UUID del consultante
            birth_date: Fecha de nacimiento del consultante
            
        Returns:
            Lista de eventos mapeados con sus Qliphoth correspondientes
        """
        from api.models import Patient
        from api.test_models import TestResult
        
        try:
            # Buscar paciente por ID o relacionado con usuario
            patient = None
            try:
                patient = Patient.objects.get(id=consultante_uuid)
            except (Patient.DoesNotExist, ValueError):
                # Si no es ID directo, buscar por usuario relacionado
                from django.contrib.auth.models import User
                try:
                    user = User.objects.get(id=consultante_uuid)
                    patient = getattr(user, 'patient_profile', None)
                except (User.DoesNotExist, ValueError):
                    pass
            
            if not patient:
                logger.warning(f"No patient found for consultante_uuid: {consultante_uuid}")
                return []
            
            # Obtener resultados de tests (crisis registradas)
            test_results = TestResult.objects.filter(patient=patient).order_by('created_at')
            
            biographical_shadow_map = []
            
            for result in test_results:
                event_date = result.created_at.date()
                
                # Calcular Qliphah activa en esa fecha
                qliphoth_info = self.calculate_current_qliphoth(birth_date, event_date)
                
                # Determinar si fue una "crisis" basada en severidad
                is_crisis = self._is_crisis_event(result)
                
                event_data = {
                    'year': event_date.year,
                    'date': event_date.isoformat(),
                    'age': self._calculate_age(birth_date, event_date),
                    'qliphoth': qliphoth_info['current_qliphoth'],
                    'corresponding_sefira': qliphoth_info['corresponding_sefira'],
                    'events': [{
                        'type': 'clinical_test',
                        'name': getattr(result.test_module, 'name', 'Test'),
                        'code': getattr(result.test_module, 'code', 'unknown'),
                        'severity': result.clinical_severity or 'Normal',
                        'score': result.score,
                        'date': event_date.isoformat(),
                        'is_crisis': is_crisis
                    }],
                    'detected_pattern': self._detect_event_pattern(
                        qliphoth_info['current_qliphoth'],
                        result
                    )
                }
                
                biographical_shadow_map.append(event_data)
            
            return biographical_shadow_map
            
        except Exception as e:
            logger.error(f"Error mapping events to qliphoth for {consultante_uuid}: {e}")
            return []
    
    def detect_shadow_patterns(self, events: List[Dict]) -> Dict[str, Any]:
        """
        Detecta patrones en los eventos mapeados a Qliphoth.
        
        ÉTICO: Solo detecta correlaciones históricas, NO predice futuro.
        
        Args:
            events: Lista de eventos ya mapeados
            
        Returns:
            Análisis de patrones detectados
        """
        if len(events) < 2:
            return {
                'qliphoth_crisis_correlation': {},
                'cycle_repetition': [],
                'insufficient_data': True,
                'message': 'Se necesitan al menos 2 eventos para detectar patrones.'
            }
        
        # Contar crisis por Qliphah
        qliphoth_crisis_count = {}
        cycle_repetitions = {}
        
        for event in events:
            qliphoth = event['qliphoth']
            has_crisis = any(e.get('is_crisis', False) for e in event['events'])
            
            if has_crisis:
                qliphoth_crisis_count[qliphoth] = qliphoth_crisis_count.get(qliphoth, 0) + 1
            
            # Detectar repeticiones en ciclos (cada 10 años)
            age = event['age']
            cycle_year = (age % 10) + 1
            
            if qliphoth not in cycle_repetitions:
                cycle_repetitions[qliphoth] = []
            cycle_repetitions[qliphoth].append({
                'year': event['year'],
                'age': age,
                'cycle_year': cycle_year
            })
        
        # Buscar patrones de repetición (mismo Qliphoth en diferentes ciclos)
        repetition_patterns = []
        for qliphoth, occurrences in cycle_repetitions.items():
            if len(occurrences) >= 2:
                years = [occ['year'] for occ in occurrences]
                pattern_description = self._describe_repetition_pattern(qliphoth, years)
                repetition_patterns.append({
                    'qliphoth': qliphoth,
                    'years': years,
                    'pattern': pattern_description
                })
        
        return {
            'qliphoth_crisis_correlation': qliphoth_crisis_count,
            'cycle_repetition': repetition_patterns,
            'total_events': len(events),
            'crisis_events': sum(
                1 for event in events 
                if any(e.get('is_crisis', False) for e in event['events'])
            ),
            'most_challenging_qliphoth': max(
                qliphoth_crisis_count.items(), 
                key=lambda x: x[1]
            )[0] if qliphoth_crisis_count else None
        }
    
    def generate_shadow_alerts(
        self, 
        patterns: Dict, 
        birth_date: date, 
        current_date: Optional[date] = None
    ) -> List[Dict]:
        """
        Genera alertas éticas basadas en patrones históricos.
        
        IMPORTANTE: NO predice crisis, solo señala patrones para consciencia preventiva.
        
        Args:
            patterns: Patrones detectados
            birth_date: Fecha de nacimiento
            current_date: Fecha actual
            
        Returns:
            Lista de alertas éticas
        """
        if current_date is None:
            current_date = date.today()
        
        alerts = []
        
        # Información actual
        current_qliphoth_info = self.calculate_current_qliphoth(birth_date, current_date)
        current_qliphoth = current_qliphoth_info['current_qliphoth']
        
        # Alerta por Qliphah históricamente desafiante
        most_challenging = patterns.get('most_challenging_qliphoth')
        if most_challenging and most_challenging != current_qliphoth:
            # Calcular próxima entrada a esa Qliphah
            next_entry = self._calculate_next_qliphoth_entry(
                birth_date, current_date, most_challenging
            )
            
            if next_entry:
                alerts.append({
                    'type': 'historical_pattern',
                    'qliphoth': most_challenging,
                    'next_entry_date': next_entry['date'].isoformat(),
                    'days_until': next_entry['days_until'],
                    'message': (
                        f"Próximo ciclo de {most_challenging} el {next_entry['date'].strftime('%d/%m/%Y')}. "
                        f"Se observaron {patterns['qliphoth_crisis_correlation'][most_challenging]} "
                        f"eventos significativos durante ciclos anteriores de esta Qliphah. Esto NO predice nada, "
                        f"solo invita a reflexión sobre patrones del pasado."
                    ),
                    'suggestion': f"Trabajo preventivo con {self.QLIPHOTH_INFO[most_challenging]['integrationPath']}"
                })
        
        # Alerta por repetición de ciclos
        repetitions = patterns.get('cycle_repetition', [])
        for repetition in repetitions:
            if len(repetition['years']) >= 2:
                qliphoth = repetition['qliphoth']
                if qliphoth != current_qliphoth:
                    next_entry = self._calculate_next_qliphoth_entry(
                        birth_date, current_date, qliphoth
                    )
                    
                    if next_entry and next_entry['days_until'] <= 365:  # Próximo año
                        alerts.append({
                            'type': 'cycle_repetition',
                            'qliphoth': qliphoth,
                            'next_entry_date': next_entry['date'].isoformat(),
                            'days_until': next_entry['days_until'],
                            'message': (
                                f"Se detectó patrón de repetición en {qliphoth} "
                                f"({', '.join(map(str, repetition['years']))}). "
                                f"Próxima entrada: {next_entry['date'].strftime('%d/%m/%Y')}. "
                                f"Esta observación es para consciencia, no determinismo."
                            ),
                            'suggestion': f"Reflexión preventiva: {self.QLIPHOTH_INFO[qliphoth]['integrationPath']}"
                        })
        
        # Alerta por Qliphah actual
        if patterns.get('qliphoth_crisis_correlation', {}).get(current_qliphoth, 0) > 0:
            alerts.append({
                'type': 'current_awareness',
                'qliphoth': current_qliphoth,
                'next_entry_date': current_date.isoformat(),
                'days_until': 0,
                'message': (
                    f"Actualmente en {current_qliphoth}. Se observaron "
                    f"{patterns['qliphoth_crisis_correlation'][current_qliphoth]} eventos "
                    f"durante ciclos anteriores de esta Qliphah. Mantén consciencia y aplica las herramientas de integración."
                ),
                'suggestion': f"Trabajo actual: {self.QLIPHOTH_INFO[current_qliphoth]['integrationPath']}"
            })
        
        return alerts
    
    def _calculate_age(self, birth_date: date, target_date: date) -> int:
        """Calcula edad exacta."""
        age = target_date.year - birth_date.year
        if (target_date.month, target_date.day) < (birth_date.month, birth_date.day):
            age -= 1
        return max(0, age)
    
    def _is_crisis_event(self, test_result) -> bool:
        """
        Determina si un resultado de test indica crisis.
        Basado en severidad clínica y score.
        """
        severity = getattr(test_result, 'clinical_severity', '').lower()
        crisis_indicators = ['severo', 'severe', 'alto', 'high', 'crítico', 'crisis']
        
        if any(indicator in severity for indicator in crisis_indicators):
            return True
        
        # También considerar scores muy altos (>80) como posible crisis
        score = getattr(test_result, 'score', 0)
        if isinstance(score, (int, float)) and score > 80:
            return True
        
        return False
    
    def _detect_event_pattern(self, qliphoth: str, test_result) -> str:
        """Detecta patrón específico para el evento en la Qliphah."""
        test_name = getattr(test_result.test_module, 'code', 'unknown').upper()
        severity = getattr(test_result, 'clinical_severity', 'normal').lower()
        
        qliphah_info = self.QLIPHOTH_INFO.get(qliphoth, {})
        archetype = qliphah_info.get('archetype', 'Sombra desconocida')
        
        if 'severo' in severity or 'alto' in severity:
            return f"Crisis durante {archetype} - {test_name}"
        else:
            return f"Evaluación durante {archetype} - {test_name}"
    
    def _describe_repetition_pattern(self, qliphoth: str, years: List[int]) -> str:
        """Describe el patrón de repetición detectado."""
        qliphah_info = self.QLIPHOTH_INFO.get(qliphoth, {})
        archetype = qliphah_info.get('archetype', 'Sombra')
        
        if len(years) == 2:
            year_diff = years[1] - years[0]
            if 9 <= year_diff <= 11:  # Aproximadamente cada 10 años
                return f"Patrón de {archetype} cada ~10 años"
        
        return f"Eventos recurrentes en {archetype}"
    
    def _calculate_next_qliphoth_entry(
        self, 
        birth_date: date, 
        current_date: date, 
        target_qliphoth: str
    ) -> Optional[Dict]:
        """
        Calcula la próxima entrada a una Qliphah específica.
        Solo para consciencia preventiva, NO predictiva.
        """
        # Encontrar posición de la Qliphah en el ciclo
        target_position = None
        for pos, info in self.SEFIRA_TO_QLIPHAH_CYCLE.items():
            if info['qliphah'] == target_qliphoth:
                target_position = pos
                break
        
        if target_position is None:
            return None
        
        current_age = self._calculate_age(birth_date, current_date)
        current_position = current_age % 10
        
        # Si ya estamos en esa Qliphah
        if current_position == target_position:
            next_birthday = birth_date.replace(year=current_date.year + 1)
            if birth_date.replace(year=current_date.year) > current_date:
                next_birthday = birth_date.replace(year=current_date.year)
            
            return {
                'date': next_birthday,
                'days_until': (next_birthday - current_date).days
            }
        
        # Calcular años hasta próxima entrada
        if target_position > current_position:
            years_to_add = target_position - current_position
        else:
            years_to_add = (10 - current_position) + target_position
        
        next_entry_age = current_age + years_to_add
        next_entry_year = birth_date.year + next_entry_age
        next_entry_date = birth_date.replace(year=next_entry_year)
        
        return {
            'date': next_entry_date,
            'days_until': (next_entry_date - current_date).days
        }


# Singleton instance para conveniencia
qliphoth_cycle_calculator = QliphothCycleCalculator()