"""
cabala_arbol_vivo.py - Motor de Gamificación del Árbol de la Vida

Gestiona el progreso terapéutico como un árbol que crece:
- Cada Sefirá "florece" según el trabajo realizado
- Logros desbloqueables
- Sistema de racha de práctica
- Milestones de progreso

Valor terapéutico: Motivación visual, refuerzo positivo,
meta-cognición del progreso.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from enum import Enum
import logging

logger = logging.getLogger(__name__)


# ==============================================================================
# ENUMS Y CONSTANTES
# ==============================================================================

class TreeLevel(Enum):
    """Niveles del árbol según progreso general."""
    SEMILLA = "semilla"
    BROTE = "brote"
    ARBUSTO = "arbusto"
    ARBOL_JOVEN = "arbol_joven"
    ARBOL_MADURO = "arbol_maduro"
    ARBOL_SABIO = "arbol_sabio"
    ARBOL_LUMINOSO = "arbol_luminoso"


class SefiraState(Enum):
    """Estados de florecimiento de una Sefirá."""
    DORMANT = "dormant"        # No trabajada
    AWAKENING = "awakening"    # 1-2 interacciones
    GROWING = "growing"        # 3-5 interacciones
    FLOWERING = "flowering"    # 6-10 interacciones
    RADIANT = "radiant"        # 10+ interacciones


# XP por actividad
XP_VALUES = {
    'meditation_completed': 50,
    'test_completed': 100,
    'reflection_saved': 30,
    'carta_consulted': 20,
    'sincronía_recorded': 40,
    'session_attended': 150,
    'weekly_goal_met': 200,
    'daily_login': 10,
    'name_analysis': 35,
    'chakra_exercise': 45,
}

# Umbrales para niveles de árbol
TREE_LEVEL_THRESHOLDS = {
    TreeLevel.SEMILLA: 0,
    TreeLevel.BROTE: 100,
    TreeLevel.ARBUSTO: 300,
    TreeLevel.ARBOL_JOVEN: 700,
    TreeLevel.ARBOL_MADURO: 1500,
    TreeLevel.ARBOL_SABIO: 3000,
    TreeLevel.ARBOL_LUMINOSO: 6000,
}

# Logros disponibles
ACHIEVEMENTS = {
    'first_meditation': {
        'id': 'first_meditation',
        'name': 'Primera Luz',
        'description': 'Completaste tu primera meditación guiada',
        'icon': '🌟',
        'xp_reward': 50,
        'condition': {'meditation_count': 1}
    },
    'meditation_master': {
        'id': 'meditation_master',
        'name': 'Maestro de la Quietud',
        'description': 'Completaste 50 meditaciones',
        'icon': '🧘',
        'xp_reward': 500,
        'condition': {'meditation_count': 50}
    },
    'first_test': {
        'id': 'first_test',
        'name': 'Autoconocimiento',
        'description': 'Completaste tu primer test de evaluación',
        'icon': '📋',
        'xp_reward': 75,
        'condition': {'test_count': 1}
    },
    'test_explorer': {
        'id': 'test_explorer',
        'name': 'Explorador Interior',
        'description': 'Completaste 10 tests diferentes',
        'icon': '🔍',
        'xp_reward': 300,
        'condition': {'test_count': 10}
    },
    'streak_7': {
        'id': 'streak_7',
        'name': 'Constancia Semanal',
        'description': 'Mantuviste una racha de 7 días',
        'icon': '🔥',
        'xp_reward': 200,
        'condition': {'streak_days': 7}
    },
    'streak_30': {
        'id': 'streak_30',
        'name': 'Compromiso Mensual',
        'description': 'Mantuviste una racha de 30 días',
        'icon': '💫',
        'xp_reward': 1000,
        'condition': {'streak_days': 30}
    },
    'all_sefirot_touched': {
        'id': 'all_sefirot_touched',
        'name': 'Árbol Completo',
        'description': 'Trabajaste con las 10 Sefirot',
        'icon': '🌳',
        'xp_reward': 500,
        'condition': {'sefirot_touched': 10}
    },
    'sefira_radiant': {
        'id': 'sefira_radiant',
        'name': 'Sefirá Radiante',
        'description': 'Una Sefirá alcanzó estado radiante',
        'icon': '✨',
        'xp_reward': 300,
        'condition': {'sefira_radiant_count': 1}
    },
    'full_tree_radiant': {
        'id': 'full_tree_radiant',
        'name': 'Iluminación Total',
        'description': 'Las 10 Sefirot están radiantes',
        'icon': '👑',
        'xp_reward': 2000,
        'condition': {'sefira_radiant_count': 10}
    },
    'sincronía_hunter': {
        'id': 'sincronía_hunter',
        'name': 'Cazador de Sincronías',
        'description': 'Registraste 20 sincronías',
        'icon': '🎯',
        'xp_reward': 400,
        'condition': {'sincronia_count': 20}
    },
    'reflective_soul': {
        'id': 'reflective_soul',
        'name': 'Alma Reflexiva',
        'description': 'Guardaste 25 reflexiones personales',
        'icon': '📝',
        'xp_reward': 350,
        'condition': {'reflection_count': 25}
    },
    'tiferet_balance': {
        'id': 'tiferet_balance',
        'name': 'Balance de Tiféret',
        'description': 'Equilibraste perfectamente Jésed y Gevurá',
        'icon': '⚖️',
        'xp_reward': 500,
        'condition': {'balanced_pillars': True}
    }
}

# Milestones del árbol
MILESTONES = [
    {
        'id': 'milestone_1',
        'name': 'La Semilla Germina',
        'description': 'Tu viaje ha comenzado. La semilla del autoconocimiento está plantada.',
        'xp_required': 100,
        'message': 'Has dado el primer paso hacia tu transformación interior.'
    },
    {
        'id': 'milestone_2',
        'name': 'Primeras Raíces',
        'description': 'Tu árbol comienza a echar raíces en la práctica constante.',
        'xp_required': 300,
        'message': 'La constancia está fortaleciendo tu conexión con tu yo interior.'
    },
    {
        'id': 'milestone_3',
        'name': 'Brotes de Conciencia',
        'description': 'Nuevas percepciones emergen como brotes verdes.',
        'xp_required': 700,
        'message': 'Tu percepción se está expandiendo. Confía en tu intuición.'
    },
    {
        'id': 'milestone_4',
        'name': 'Ramas que Alcanzan',
        'description': 'Tu árbol extiende sus ramas hacia nuevas direcciones.',
        'xp_required': 1500,
        'message': 'Estás integrando múltiples aspectos de tu ser.'
    },
    {
        'id': 'milestone_5',
        'name': 'Primeras Flores',
        'description': 'La belleza de tu trabajo interno comienza a manifestarse.',
        'xp_required': 3000,
        'message': 'Tu transformación es visible. Otros pueden sentir tu luz.'
    },
    {
        'id': 'milestone_6',
        'name': 'Frutos de Sabiduría',
        'description': 'Tu árbol produce frutos que nutren a ti y a otros.',
        'xp_required': 6000,
        'message': 'Has alcanzado un nivel de maestría. Tu sabiduría puede guiar a otros.'
    }
]


class ArbolVivo:
    """Motor de gamificación del Árbol de la Vida."""
    
    def __init__(self):
        """Inicializa el motor."""
        self.sefirot_order = [
            'keter', 'chokmah', 'binah', 'chesed', 'gevurah',
            'tiferet', 'netzach', 'hod', 'yesod', 'malkuth'
        ]
    
    def initialize_tree_state(self, user_id: str) -> Dict[str, Any]:
        """
        Inicializa el estado del árbol para un usuario nuevo.
        
        Args:
            user_id: ID del usuario
            
        Returns:
            Estado inicial del árbol
        """
        now = datetime.utcnow()
        
        # Estado inicial de cada Sefirá
        sefirot_state = {}
        for sefira in self.sefirot_order:
            sefirot_state[sefira] = {
                'state': SefiraState.DORMANT.value,
                'interactions': 0,
                'last_interaction': None,
                'xp_earned': 0
            }
        
        return {
            'user_id': user_id,
            'created_at': now.isoformat(),
            'updated_at': now.isoformat(),
            'total_xp': 0,
            'tree_level': TreeLevel.SEMILLA.value,
            'current_streak': 0,
            'longest_streak': 0,
            'last_activity_date': None,
            'sefirot': sefirot_state,
            'unlocked_achievements': [],
            'reached_milestones': [],
            'activity_counts': {
                'meditation_count': 0,
                'test_count': 0,
                'reflection_count': 0,
                'sincronia_count': 0,
                'carta_count': 0,
                'name_analysis_count': 0,
                'session_count': 0
            }
        }
    
    def record_activity(
        self,
        tree_state: Dict[str, Any],
        activity_type: str,
        associated_sefira: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Registra una actividad y actualiza el árbol.
        
        Args:
            tree_state: Estado actual del árbol
            activity_type: Tipo de actividad (meditation_completed, test_completed, etc.)
            associated_sefira: Sefirá asociada a la actividad (si aplica)
            metadata: Datos adicionales de la actividad
            
        Returns:
            Estado actualizado con cambios destacados
        """
        now = datetime.utcnow()
        changes = {
            'xp_gained': 0,
            'new_achievements': [],
            'new_milestones': [],
            'level_up': False,
            'sefira_evolved': None,
            'streak_continued': False
        }
        
        # Calcular XP
        xp_gained = XP_VALUES.get(activity_type, 10)
        tree_state['total_xp'] += xp_gained
        changes['xp_gained'] = xp_gained
        
        # Actualizar contador de actividad
        count_key = self._activity_to_count_key(activity_type)
        if count_key and count_key in tree_state['activity_counts']:
            tree_state['activity_counts'][count_key] += 1
        
        # Actualizar racha
        changes['streak_continued'] = self._update_streak(tree_state, now)
        
        # Actualizar Sefirá si aplica
        if associated_sefira and associated_sefira in tree_state['sefirot']:
            evolution = self._update_sefira(
                tree_state['sefirot'][associated_sefira],
                xp_gained,
                now
            )
            if evolution:
                changes['sefira_evolved'] = {
                    'sefira': associated_sefira,
                    'new_state': evolution
                }
        
        # Verificar nivel del árbol
        old_level = tree_state['tree_level']
        new_level = self._calculate_tree_level(tree_state['total_xp'])
        if new_level != old_level:
            tree_state['tree_level'] = new_level
            changes['level_up'] = True
        
        # Verificar logros
        new_achievements = self._check_achievements(tree_state)
        if new_achievements:
            for ach_id in new_achievements:
                tree_state['unlocked_achievements'].append(ach_id)
                tree_state['total_xp'] += ACHIEVEMENTS[ach_id]['xp_reward']
            changes['new_achievements'] = [
                ACHIEVEMENTS[ach_id] for ach_id in new_achievements
            ]
        
        # Verificar milestones
        new_milestones = self._check_milestones(tree_state)
        if new_milestones:
            tree_state['reached_milestones'].extend(new_milestones)
            changes['new_milestones'] = new_milestones
        
        # Actualizar timestamp
        tree_state['updated_at'] = now.isoformat()
        tree_state['last_activity_date'] = now.date().isoformat()
        
        return {
            'tree_state': tree_state,
            'changes': changes
        }
    
    def get_tree_visualization_data(self, tree_state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Genera datos para visualización del árbol.
        
        Args:
            tree_state: Estado actual del árbol
            
        Returns:
            Datos formateados para visualización
        """
        # Calcular progreso hacia siguiente nivel
        current_xp = tree_state['total_xp']
        current_level = tree_state['tree_level']
        
        # Encontrar siguiente nivel
        levels = list(TREE_LEVEL_THRESHOLDS.items())
        current_threshold = 0
        next_threshold = float('inf')
        next_level = None
        
        for i, (level, threshold) in enumerate(levels):
            if level.value == current_level:
                current_threshold = threshold
                if i + 1 < len(levels):
                    next_level, next_threshold = levels[i + 1]
                break
        
        # Calcular progreso porcentual
        if next_threshold != float('inf'):
            progress_to_next = ((current_xp - current_threshold) / (next_threshold - current_threshold)) * 100
        else:
            progress_to_next = 100
        
        # Construir datos de sefirot para visualización
        sefirot_viz = []
        for sefira in self.sefirot_order:
            sefira_data = tree_state['sefirot'].get(sefira, {})
            sefirot_viz.append({
                'id': sefira,
                'state': sefira_data.get('state', SefiraState.DORMANT.value),
                'interactions': sefira_data.get('interactions', 0),
                'glow_intensity': self._calculate_glow(sefira_data.get('state', SefiraState.DORMANT.value))
            })
        
        return {
            'tree_level': current_level,
            'tree_level_name': self._get_level_name(current_level),
            'total_xp': current_xp,
            'xp_to_next_level': next_threshold - current_xp if next_threshold != float('inf') else 0,
            'progress_to_next_level': min(progress_to_next, 100),
            'next_level_name': self._get_level_name(next_level.value) if next_level else 'Máximo alcanzado',
            'current_streak': tree_state.get('current_streak', 0),
            'longest_streak': tree_state.get('longest_streak', 0),
            'sefirot': sefirot_viz,
            'achievement_count': len(tree_state.get('unlocked_achievements', [])),
            'total_achievements': len(ACHIEVEMENTS),
            'milestone_count': len(tree_state.get('reached_milestones', [])),
            'total_milestones': len(MILESTONES)
        }
    
    def get_available_achievements(
        self, 
        tree_state: Dict[str, Any],
        include_locked: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Obtiene lista de logros con estado.
        
        Args:
            tree_state: Estado del árbol
            include_locked: Incluir logros no desbloqueados
            
        Returns:
            Lista de logros con estado
        """
        unlocked = set(tree_state.get('unlocked_achievements', []))
        result = []
        
        for ach_id, ach_data in ACHIEVEMENTS.items():
            if ach_id in unlocked:
                result.append({
                    **ach_data,
                    'unlocked': True,
                    'progress': 100
                })
            elif include_locked:
                # Calcular progreso hacia el logro
                progress = self._calculate_achievement_progress(tree_state, ach_data['condition'])
                result.append({
                    **ach_data,
                    'unlocked': False,
                    'progress': progress
                })
        
        return result
    
    # ===========================================================================
    # MÉTODOS PRIVADOS
    # ===========================================================================
    
    def _activity_to_count_key(self, activity_type: str) -> Optional[str]:
        """Mapea tipo de actividad a clave de contador."""
        mapping = {
            'meditation_completed': 'meditation_count',
            'test_completed': 'test_count',
            'reflection_saved': 'reflection_count',
            'sincronía_recorded': 'sincronia_count',
            'carta_consulted': 'carta_count',
            'name_analysis': 'name_analysis_count',
            'session_attended': 'session_count'
        }
        return mapping.get(activity_type)
    
    def _update_streak(self, tree_state: Dict[str, Any], now: datetime) -> bool:
        """Actualiza la racha de actividad."""
        last_date_str = tree_state.get('last_activity_date')
        
        if not last_date_str:
            tree_state['current_streak'] = 1
            return True
        
        last_date = datetime.fromisoformat(last_date_str).date()
        today = now.date()
        
        diff = (today - last_date).days
        
        if diff == 0:
            # Mismo día, racha continúa
            return True
        elif diff == 1:
            # Día consecutivo
            tree_state['current_streak'] += 1
            if tree_state['current_streak'] > tree_state.get('longest_streak', 0):
                tree_state['longest_streak'] = tree_state['current_streak']
            return True
        else:
            # Racha rota
            tree_state['current_streak'] = 1
            return False
    
    def _update_sefira(
        self, 
        sefira_state: Dict[str, Any],
        xp_gained: int,
        now: datetime
    ) -> Optional[str]:
        """
        Actualiza el estado de una Sefirá.
        
        Returns:
            Nuevo estado si evolucionó, None si no
        """
        sefira_state['interactions'] += 1
        sefira_state['xp_earned'] = sefira_state.get('xp_earned', 0) + xp_gained
        sefira_state['last_interaction'] = now.isoformat()
        
        old_state = sefira_state['state']
        interactions = sefira_state['interactions']
        
        # Determinar nuevo estado
        if interactions >= 10:
            new_state = SefiraState.RADIANT.value
        elif interactions >= 6:
            new_state = SefiraState.FLOWERING.value
        elif interactions >= 3:
            new_state = SefiraState.GROWING.value
        elif interactions >= 1:
            new_state = SefiraState.AWAKENING.value
        else:
            new_state = SefiraState.DORMANT.value
        
        if new_state != old_state:
            sefira_state['state'] = new_state
            return new_state
        
        return None
    
    def _calculate_tree_level(self, total_xp: int) -> str:
        """Calcula el nivel del árbol basado en XP."""
        current_level = TreeLevel.SEMILLA
        for level, threshold in TREE_LEVEL_THRESHOLDS.items():
            if total_xp >= threshold:
                current_level = level
        return current_level.value
    
    def _check_achievements(self, tree_state: Dict[str, Any]) -> List[str]:
        """Verifica qué nuevos logros se han desbloqueado."""
        unlocked = set(tree_state.get('unlocked_achievements', []))
        new_achievements = []
        
        for ach_id, ach_data in ACHIEVEMENTS.items():
            if ach_id in unlocked:
                continue
            
            condition = ach_data['condition']
            if self._check_condition(tree_state, condition):
                new_achievements.append(ach_id)
        
        return new_achievements
    
    def _check_condition(self, tree_state: Dict[str, Any], condition: Dict) -> bool:
        """Verifica si una condición de logro se cumple."""
        counts = tree_state.get('activity_counts', {})
        
        for key, required_value in condition.items():
            if key == 'streak_days':
                if tree_state.get('current_streak', 0) < required_value:
                    return False
            elif key == 'sefirot_touched':
                touched = sum(
                    1 for s in tree_state.get('sefirot', {}).values()
                    if s.get('interactions', 0) > 0
                )
                if touched < required_value:
                    return False
            elif key == 'sefira_radiant_count':
                radiant = sum(
                    1 for s in tree_state.get('sefirot', {}).values()
                    if s.get('state') == SefiraState.RADIANT.value
                )
                if radiant < required_value:
                    return False
            elif key == 'balanced_pillars':
                # Jésed y Gevurá deben tener interactions similares
                sefirot = tree_state.get('sefirot', {})
                chesed_int = sefirot.get('chesed', {}).get('interactions', 0)
                gevurah_int = sefirot.get('gevurah', {}).get('interactions', 0)
                if abs(chesed_int - gevurah_int) > 2 or min(chesed_int, gevurah_int) < 5:
                    return False
            elif key.endswith('_count'):
                # Contador genérico
                actual = counts.get(key, 0)
                if actual < required_value:
                    return False
        
        return True
    
    def _check_milestones(self, tree_state: Dict[str, Any]) -> List[Dict]:
        """Verifica qué nuevos milestones se han alcanzado."""
        reached = set(m['id'] if isinstance(m, dict) else m 
                      for m in tree_state.get('reached_milestones', []))
        total_xp = tree_state.get('total_xp', 0)
        new_milestones = []
        
        for milestone in MILESTONES:
            if milestone['id'] not in reached and total_xp >= milestone['xp_required']:
                new_milestones.append(milestone)
        
        return new_milestones
    
    def _calculate_glow(self, state: str) -> float:
        """Calcula intensidad del brillo para visualización."""
        glow_map = {
            SefiraState.DORMANT.value: 0.0,
            SefiraState.AWAKENING.value: 0.25,
            SefiraState.GROWING.value: 0.5,
            SefiraState.FLOWERING.value: 0.75,
            SefiraState.RADIANT.value: 1.0
        }
        return glow_map.get(state, 0.0)
    
    def _get_level_name(self, level: str) -> str:
        """Obtiene nombre amigable del nivel."""
        names = {
            'semilla': '🌱 Semilla',
            'brote': '🌿 Brote',
            'arbusto': '🪴 Arbusto',
            'arbol_joven': '🌲 Árbol Joven',
            'arbol_maduro': '🌳 Árbol Maduro',
            'arbol_sabio': '🌴 Árbol Sabio',
            'arbol_luminoso': '✨ Árbol Luminoso'
        }
        return names.get(level, level)
    
    def _calculate_achievement_progress(self, tree_state: Dict, condition: Dict) -> int:
        """Calcula progreso porcentual hacia un logro."""
        counts = tree_state.get('activity_counts', {})
        progresses = []
        
        for key, required in condition.items():
            if key == 'streak_days':
                current = tree_state.get('current_streak', 0)
                progresses.append(min(100, int((current / required) * 100)))
            elif key == 'sefirot_touched':
                touched = sum(
                    1 for s in tree_state.get('sefirot', {}).values()
                    if s.get('interactions', 0) > 0
                )
                progresses.append(min(100, int((touched / required) * 100)))
            elif key == 'sefira_radiant_count':
                radiant = sum(
                    1 for s in tree_state.get('sefirot', {}).values()
                    if s.get('state') == SefiraState.RADIANT.value
                )
                progresses.append(min(100, int((radiant / required) * 100)))
            elif key == 'balanced_pillars':
                sefirot = tree_state.get('sefirot', {})
                chesed = sefirot.get('chesed', {}).get('interactions', 0)
                gevurah = sefirot.get('gevurah', {}).get('interactions', 0)
                if min(chesed, gevurah) >= 5 and abs(chesed - gevurah) <= 2:
                    progresses.append(100)
                else:
                    progresses.append(int(min(chesed, gevurah) / 5 * 50))
            elif key.endswith('_count'):
                current = counts.get(key, 0)
                progresses.append(min(100, int((current / required) * 100)))
        
        return int(sum(progresses) / len(progresses)) if progresses else 0
