"""
Tree of Life Calculator Service.

Provides calculations and transformations for the Etz Chaim (Tree of Life).
This service can be extended to integrate with @holistica/symbolic package.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


# ============================================================================
# SEFIROT STRUCTURE
# ============================================================================

SEFIROT_STRUCTURE = {
    'keter': {
        'name': 'Keter',
        'translation': 'Corona',
        'position': {'x': 0.5, 'y': 0.0},
        'pillar': 'middle',
        'world': 'atziluth',
        'color': '#FFFFFF',
        'planet': 'Neptune/Primum Mobile',
        'element': None,
        'body_part': 'Crown of head',
        'virtue': 'Attainment/Completion',
        'vice': None,
    },
    'chokhmah': {
        'name': 'Chokhmah',
        'translation': 'Sabiduría',
        'position': {'x': 0.8, 'y': 0.15},
        'pillar': 'right',
        'world': 'atziluth',
        'color': '#808080',
        'planet': 'Uranus/Zodiac',
        'element': None,
        'body_part': 'Left brain',
        'virtue': 'Devotion',
        'vice': None,
    },
    'binah': {
        'name': 'Binah',
        'translation': 'Entendimiento',
        'position': {'x': 0.2, 'y': 0.15},
        'pillar': 'left',
        'world': 'atziluth',
        'color': '#000000',
        'planet': 'Saturn',
        'element': None,
        'body_part': 'Right brain',
        'virtue': 'Silence',
        'vice': 'Avarice',
    },
    'chesed': {
        'name': 'Chesed',
        'translation': 'Misericordia',
        'position': {'x': 0.8, 'y': 0.35},
        'pillar': 'right',
        'world': 'briah',
        'color': '#0000FF',
        'planet': 'Jupiter',
        'element': 'Water',
        'body_part': 'Left arm',
        'virtue': 'Obedience',
        'vice': 'Bigotry/Tyranny',
    },
    'gevurah': {
        'name': 'Gevurah',
        'translation': 'Severidad',
        'position': {'x': 0.2, 'y': 0.35},
        'pillar': 'left',
        'world': 'briah',
        'color': '#FF0000',
        'planet': 'Mars',
        'element': 'Fire',
        'body_part': 'Right arm',
        'virtue': 'Courage/Energy',
        'vice': 'Cruelty/Destruction',
    },
    'tiferet': {
        'name': 'Tiferet',
        'translation': 'Belleza',
        'position': {'x': 0.5, 'y': 0.45},
        'pillar': 'middle',
        'world': 'briah',
        'color': '#FFD700',
        'planet': 'Sun',
        'element': 'Air',
        'body_part': 'Heart/Chest',
        'virtue': 'Devotion to Great Work',
        'vice': 'Pride',
    },
    'netzach': {
        'name': 'Netzach',
        'translation': 'Victoria',
        'position': {'x': 0.8, 'y': 0.6},
        'pillar': 'right',
        'world': 'yetzirah',
        'color': '#00FF00',
        'planet': 'Venus',
        'element': 'Fire',
        'body_part': 'Left leg/hip',
        'virtue': 'Unselfishness',
        'vice': 'Unchastity/Lust',
    },
    'hod': {
        'name': 'Hod',
        'translation': 'Esplendor',
        'position': {'x': 0.2, 'y': 0.6},
        'pillar': 'left',
        'world': 'yetzirah',
        'color': '#FFA500',
        'planet': 'Mercury',
        'element': 'Water',
        'body_part': 'Right leg/hip',
        'virtue': 'Truthfulness',
        'vice': 'Falsehood/Dishonesty',
    },
    'yesod': {
        'name': 'Yesod',
        'translation': 'Fundamento',
        'position': {'x': 0.5, 'y': 0.75},
        'pillar': 'middle',
        'world': 'yetzirah',
        'color': '#800080',
        'planet': 'Moon',
        'element': 'Air',
        'body_part': 'Reproductive organs',
        'virtue': 'Independence',
        'vice': 'Idleness',
    },
    'malkhut': {
        'name': 'Malkhut',
        'translation': 'Reino',
        'position': {'x': 0.5, 'y': 1.0},
        'pillar': 'middle',
        'world': 'assiah',
        'color': '#8B4513',
        'planet': 'Earth',
        'element': 'Earth',
        'body_part': 'Feet/Physical body',
        'virtue': 'Discrimination',
        'vice': 'Avarice/Inertia',
    },
    'daat': {
        'name': "Da'at",
        'translation': 'Conocimiento',
        'position': {'x': 0.5, 'y': 0.25},
        'pillar': 'middle',
        'world': 'atziluth',
        'color': '#C0C0C0',
        'planet': 'Pluto/Sirius',
        'element': None,
        'body_part': 'Throat/Neck',
        'virtue': 'Detachment',
        'vice': 'Doubt',
    },
}


# ============================================================================
# PATHS STRUCTURE (22 Paths)
# ============================================================================

PATHS_STRUCTURE = [
    {'index': 0, 'letter': 'Aleph', 'from': 'keter', 'to': 'chokhmah', 'tarot': 'The Fool'},
    {'index': 1, 'letter': 'Beth', 'from': 'keter', 'to': 'binah', 'tarot': 'The Magician'},
    {'index': 2, 'letter': 'Gimel', 'from': 'keter', 'to': 'tiferet', 'tarot': 'The High Priestess'},
    {'index': 3, 'letter': 'Daleth', 'from': 'chokhmah', 'to': 'binah', 'tarot': 'The Empress'},
    {'index': 4, 'letter': 'Heh', 'from': 'chokhmah', 'to': 'tiferet', 'tarot': 'The Emperor'},
    {'index': 5, 'letter': 'Vav', 'from': 'chokhmah', 'to': 'chesed', 'tarot': 'The Hierophant'},
    {'index': 6, 'letter': 'Zayin', 'from': 'binah', 'to': 'tiferet', 'tarot': 'The Lovers'},
    {'index': 7, 'letter': 'Cheth', 'from': 'binah', 'to': 'gevurah', 'tarot': 'The Chariot'},
    {'index': 8, 'letter': 'Teth', 'from': 'chesed', 'to': 'gevurah', 'tarot': 'Strength'},
    {'index': 9, 'letter': 'Yod', 'from': 'chesed', 'to': 'tiferet', 'tarot': 'The Hermit'},
    {'index': 10, 'letter': 'Kaph', 'from': 'chesed', 'to': 'netzach', 'tarot': 'Wheel of Fortune'},
    {'index': 11, 'letter': 'Lamed', 'from': 'gevurah', 'to': 'tiferet', 'tarot': 'Justice'},
    {'index': 12, 'letter': 'Mem', 'from': 'gevurah', 'to': 'hod', 'tarot': 'The Hanged Man'},
    {'index': 13, 'letter': 'Nun', 'from': 'tiferet', 'to': 'netzach', 'tarot': 'Death'},
    {'index': 14, 'letter': 'Samekh', 'from': 'tiferet', 'to': 'yesod', 'tarot': 'Temperance'},
    {'index': 15, 'letter': 'Ayin', 'from': 'tiferet', 'to': 'hod', 'tarot': 'The Devil'},
    {'index': 16, 'letter': 'Peh', 'from': 'netzach', 'to': 'hod', 'tarot': 'The Tower'},
    {'index': 17, 'letter': 'Tzaddi', 'from': 'netzach', 'to': 'yesod', 'tarot': 'The Star'},
    {'index': 18, 'letter': 'Qoph', 'from': 'netzach', 'to': 'malkhut', 'tarot': 'The Moon'},
    {'index': 19, 'letter': 'Resh', 'from': 'hod', 'to': 'yesod', 'tarot': 'The Sun'},
    {'index': 20, 'letter': 'Shin', 'from': 'hod', 'to': 'malkhut', 'tarot': 'Judgement'},
    {'index': 21, 'letter': 'Tav', 'from': 'yesod', 'to': 'malkhut', 'tarot': 'The World'},
]


@dataclass
class TreeStructuralState:
    """
    Represents the structural state of the Tree of Life.
    
    This can be serialized to JSON for frontend visualization.
    """
    sefirot_states: Dict[str, Dict[str, Any]]
    path_states: Dict[int, Dict[str, Any]]
    active_pillar: Optional[str] = None
    focus_world: Optional[str] = None
    
    def to_dict(self) -> Dict:
        return {
            'sefirot_states': self.sefirot_states,
            'path_states': self.path_states,
            'active_pillar': self.active_pillar,
            'focus_world': self.focus_world,
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'TreeStructuralState':
        return cls(
            sefirot_states=data.get('sefirot_states', {}),
            path_states=data.get('path_states', {}),
            active_pillar=data.get('active_pillar'),
            focus_world=data.get('focus_world'),
        )


class TreeCalculator:
    """
    Calculator service for Tree of Life operations.
    
    Provides methods for:
    - Generating initial tree state
    - Calculating pillar balance
    - Computing path activation patterns
    - Integration with bioemotional mappings
    """
    
    @staticmethod
    def get_initial_state() -> Dict:
        """
        Generate an initial tree state with all sefirot and paths.
        """
        sefirot_states = {}
        for name, data in SEFIROT_STRUCTURE.items():
            sefirot_states[name] = {
                **data,
                'intensity': 0,
                'is_blocked': False,
                'is_activated': False,
                'observation': '',
                'emotion_type': None,
            }
        
        path_states = {}
        for path in PATHS_STRUCTURE:
            path_states[path['index']] = {
                **path,
                'flow_direction': 'balanced',
                'is_blocked': False,
                'is_active': False,
                'observation': '',
            }
        
        return {
            'sefirot_states': sefirot_states,
            'path_states': path_states,
            'active_pillar': None,
            'focus_world': None,
        }
    
    @staticmethod
    def calculate_pillar_balance(sefirot_states: Dict) -> Dict:
        """
        Calculate the balance between the three pillars.
        
        Returns scores for:
        - Right Pillar (Chesed side): Mercy, Expansion
        - Left Pillar (Gevurah side): Severity, Restriction  
        - Middle Pillar: Balance, Integration
        """
        pillars = {
            'right': ['chokhmah', 'chesed', 'netzach'],
            'left': ['binah', 'gevurah', 'hod'],
            'middle': ['keter', 'tiferet', 'yesod', 'malkhut', 'daat'],
        }
        
        scores = {}
        for pillar_name, sefirot in pillars.items():
            total_intensity = 0
            blocked_count = 0
            activated_count = 0
            
            for sefirah in sefirot:
                if sefirah in sefirot_states:
                    state = sefirot_states[sefirah]
                    total_intensity += state.get('intensity', 0)
                    if state.get('is_blocked'):
                        blocked_count += 1
                    if state.get('is_activated'):
                        activated_count += 1
            
            scores[pillar_name] = {
                'total_intensity': total_intensity,
                'average_intensity': total_intensity / len(sefirot) if sefirot else 0,
                'blocked_count': blocked_count,
                'activated_count': activated_count,
                'sefirot_count': len(sefirot),
            }
        
        # Calculate overall balance
        right_score = scores['right']['average_intensity']
        left_score = scores['left']['average_intensity']
        
        if right_score > left_score * 1.5:
            balance = 'excess_mercy'
        elif left_score > right_score * 1.5:
            balance = 'excess_severity'
        else:
            balance = 'balanced'
        
        scores['overall_balance'] = balance
        
        return scores
    
    @staticmethod
    def get_sefirah_info(sefirah_name: str) -> Optional[Dict]:
        """
        Get detailed information about a specific sefirah.
        """
        return SEFIROT_STRUCTURE.get(sefirah_name)
    
    @staticmethod
    def get_path_info(path_index: int) -> Optional[Dict]:
        """
        Get detailed information about a specific path.
        """
        for path in PATHS_STRUCTURE:
            if path['index'] == path_index:
                return path
        return None
    
    @staticmethod
    def get_paths_for_sefirah(sefirah_name: str) -> List[Dict]:
        """
        Get all paths connected to a specific sefirah.
        """
        connected = []
        for path in PATHS_STRUCTURE:
            if path['from'] == sefirah_name or path['to'] == sefirah_name:
                connected.append(path)
        return connected
    
    @staticmethod
    def calculate_world_focus(sefirot_states: Dict) -> str:
        """
        Determine which world (Atziluth, Briah, Yetzirah, Assiah) 
        has the most activity.
        """
        worlds = {
            'atziluth': ['keter', 'chokhmah', 'binah', 'daat'],
            'briah': ['chesed', 'gevurah', 'tiferet'],
            'yetzirah': ['netzach', 'hod', 'yesod'],
            'assiah': ['malkhut'],
        }
        
        world_scores = {}
        for world, sefirot in worlds.items():
            total = 0
            for sefirah in sefirot:
                if sefirah in sefirot_states:
                    state = sefirot_states[sefirah]
                    total += state.get('intensity', 0)
                    if state.get('is_activated'):
                        total += 5
            world_scores[world] = total
        
        # Return the world with highest score
        return max(world_scores, key=world_scores.get)
    
    @staticmethod
    def map_emotion_to_sefirah(emotion: str) -> List[str]:
        """
        Map an emotion type to potentially related sefirot.
        
        This is a simplified mapping for therapeutic exploration.
        """
        emotion_mappings = {
            'joy': ['chesed', 'tiferet', 'netzach'],
            'sadness': ['binah', 'gevurah', 'malkhut'],
            'anger': ['gevurah', 'mars'],
            'fear': ['hod', 'yesod'],
            'love': ['chesed', 'tiferet', 'netzach'],
            'guilt': ['gevurah', 'hod'],
            'shame': ['malkhut', 'yesod'],
            'peace': ['keter', 'tiferet'],
            'anxiety': ['hod', 'netzach', 'yesod'],
            'grief': ['binah', 'gevurah'],
            'hope': ['chesed', 'netzach', 'tiferet'],
            'despair': ['malkhut', 'gevurah'],
        }
        
        return emotion_mappings.get(emotion, ['tiferet'])
    
    @staticmethod
    def get_tarot_correspondence(path_index: int) -> Optional[str]:
        """
        Get the Tarot Major Arcana card for a path.
        """
        for path in PATHS_STRUCTURE:
            if path['index'] == path_index:
                return path.get('tarot')
        return None
