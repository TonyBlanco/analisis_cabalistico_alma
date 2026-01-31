"""
cabala_meditaciones_personalizadas.py - Generador de Meditaciones Personalizadas

Genera meditaciones guiadas adaptadas a:
- Sefirá del ciclo actual
- Sefirá deficiente (según tests)
- Sefirá objetivo (según proceso terapéutico)

Valor terapéutico: Tarea inter-sesión concreta,
texto para llevar a casa, refuerza trabajo terapéutico.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


# ==============================================================================
# SEFIROT DATA
# ==============================================================================

SEFIROT_MEDITATION_DATA = {
    'keter': {
        'name': 'Kéter',
        'english': 'Crown',
        'quality': 'Voluntad divina, conexión con lo infinito',
        'color': 'blanco brillante',
        'element': 'éter',
        'body_area': 'corona de la cabeza',
        'archetype': 'La Fuente',
        'balancing_sefira': 'malkuth',
        'affirmations': [
            "Soy uno con la voluntad divina.",
            "Mi propósito se revela con claridad.",
            "Confío en la sabiduría que me guía."
        ],
        'visualization_base': (
            "Visualiza una luz blanca brillante sobre tu cabeza, "
            "como una corona de luz pura. Esta luz representa tu conexión "
            "con lo más elevado de ti mismo. Siente cómo desciende suavemente, "
            "llenando cada célula de tu ser con propósito y claridad."
        ),
        'best_time': 'Al amanecer o antes de medianoche',
        'practice_tips': [
            "Practica en silencio absoluto",
            "Mantén los ojos cerrados durante toda la meditación",
            "Deja ir todas las expectativas"
        ]
    },
    'chokmah': {
        'name': 'Jojmá',
        'english': 'Wisdom',
        'quality': 'Sabiduría primordial, intuición pura',
        'color': 'gris plateado',
        'element': 'fuego primordial',
        'body_area': 'hemisferio derecho del cerebro',
        'archetype': 'El Padre Cósmico',
        'balancing_sefira': 'binah',
        'affirmations': [
            "Mi intuición me guía con precisión.",
            "Recibo sabiduría del universo.",
            "Confío en los destellos de comprensión que llegan a mí."
        ],
        'visualization_base': (
            "Visualiza un destello de luz plateada, como un relámpago "
            "silencioso que ilumina tu mente. Este destello trae sabiduría "
            "instantánea, sin palabras. Permite que estas intuiciones "
            "se asienten en tu conciencia como semillas de comprensión."
        ),
        'best_time': 'Al despertar, en el momento liminal entre sueño y vigilia',
        'practice_tips': [
            "No intentes analizar lo que recibas",
            "Ten un cuaderno cerca para anotar después",
            "Confía en las imágenes que surjan"
        ]
    },
    'binah': {
        'name': 'Biná',
        'english': 'Understanding',
        'quality': 'Entendimiento profundo, receptividad',
        'color': 'negro o azul muy oscuro',
        'element': 'agua primordial',
        'body_area': 'hemisferio izquierdo del cerebro',
        'archetype': 'La Madre Cósmica',
        'balancing_sefira': 'chokmah',
        'affirmations': [
            "Comprendo lo que necesito comprender.",
            "Mi mente procesa con claridad y profundidad.",
            "Soy receptiva/o a la comprensión que necesito."
        ],
        'visualization_base': (
            "Visualiza un océano oscuro y profundo, infinitamente tranquilo. "
            "Tú flotas en su superficie, sostenido/a con total seguridad. "
            "Este mar representa el entendimiento: todo lo que necesitas "
            "comprender ya está contenido en sus profundidades."
        ),
        'best_time': 'Por la noche, en quietud',
        'practice_tips': [
            "Ideal para procesar experiencias difíciles",
            "Permite que surjan emociones sin juzgarlas",
            "La comprensión llegará en su momento"
        ]
    },
    'chesed': {
        'name': 'Jésed',
        'english': 'Mercy/Loving-kindness',
        'quality': 'Amor incondicional, expansión, generosidad',
        'color': 'azul brillante',
        'element': 'agua',
        'body_area': 'brazo derecho y hombro',
        'archetype': 'El Rey Benevolente',
        'balancing_sefira': 'gevurah',
        'affirmations': [
            "Me amo y me acepto completamente.",
            "Mi corazón se expande con amor incondicional.",
            "Doy y recibo amor con facilidad."
        ],
        'visualization_base': (
            "Visualiza una esfera de luz azul brillante en tu pecho, "
            "expandiéndose con cada respiración. Este azul es el color "
            "del amor incondicional. Siente cómo se extiende más allá "
            "de tu cuerpo, abrazando a todos los seres con compasión."
        ),
        'best_time': 'Por la mañana, para comenzar el día con apertura',
        'practice_tips': [
            "Coloca una mano en el corazón",
            "Sonríe suavemente durante la práctica",
            "Envía amor a alguien específico al final"
        ]
    },
    'gevurah': {
        'name': 'Gevurá',
        'english': 'Strength/Judgment',
        'quality': 'Límites sanos, disciplina, fortaleza',
        'color': 'rojo brillante',
        'element': 'fuego',
        'body_area': 'brazo izquierdo y hombro',
        'archetype': 'El Guerrero Justo',
        'balancing_sefira': 'chesed',
        'affirmations': [
            "Establezco límites con amor y firmeza.",
            "Mi fortaleza interior me protege.",
            "Soy capaz de decir no cuando es necesario."
        ],
        'visualization_base': (
            "Visualiza un fuego controlado, como una llama en un altar. "
            "Este fuego tiene el poder de transformar, pero está contenido "
            "con sabiduría. Siente cómo esta llama quema lo que ya no "
            "te sirve, dejando solo lo esencial y verdadero."
        ),
        'best_time': 'Cuando necesites tomar decisiones difíciles',
        'practice_tips': [
            "Mantén la espalda recta y firme",
            "Respira con fuerza pero controladamente",
            "Visualiza un escudo protector a tu alrededor"
        ]
    },
    'tiferet': {
        'name': 'Tiféret',
        'english': 'Beauty/Harmony',
        'quality': 'Belleza, armonía, equilibrio, compasión',
        'color': 'amarillo dorado',
        'element': 'aire',
        'body_area': 'centro del pecho, corazón',
        'archetype': 'El Sol Interior',
        'balancing_sefira': 'yesod',
        'affirmations': [
            "Soy el centro armonioso de mi vida.",
            "La belleza y el equilibrio fluyen a través de mí.",
            "Mi verdadero yo brilla con luz propia."
        ],
        'visualization_base': (
            "Visualiza un sol dorado brillando en el centro de tu pecho. "
            "Este sol es tu verdadero yo, tu esencia más auténtica. "
            "Sus rayos alcanzan todas las partes de tu ser, "
            "armonizando, equilibrando, integrando todo lo que eres."
        ),
        'best_time': 'Al mediodía o cuando el sol está alto',
        'practice_tips': [
            "Meditación ideal para integrar polaridades",
            "Respira hacia el centro del pecho",
            "Siente el equilibrio entre dar y recibir"
        ]
    },
    'netzach': {
        'name': 'Nétzaj',
        'english': 'Victory/Eternity',
        'quality': 'Victoria, perseverancia, emoción, arte',
        'color': 'verde esmeralda',
        'element': 'fuego (emocional)',
        'body_area': 'cadera derecha y pierna',
        'archetype': 'El Artista Apasionado',
        'balancing_sefira': 'hod',
        'affirmations': [
            "Mis emociones son mi fuerza.",
            "Persevero con pasión hacia mis metas.",
            "Expreso mi creatividad libremente."
        ],
        'visualization_base': (
            "Visualiza un bosque verde y exuberante, lleno de vida. "
            "Caminas por senderos donde cada paso es una victoria pequeña. "
            "Las plantas crecen a tu alrededor, representando tu capacidad "
            "de florecer, de persistir, de crear belleza en el mundo."
        ),
        'best_time': 'Antes de proyectos creativos o desafíos',
        'practice_tips': [
            "Permite que surjan emociones",
            "Mueve el cuerpo suavemente si lo necesitas",
            "Conecta con tu deseo más profundo"
        ]
    },
    'hod': {
        'name': 'Hod',
        'english': 'Glory/Splendor',
        'quality': 'Gloria, intelecto, comunicación, análisis',
        'color': 'naranja',
        'element': 'agua (mental)',
        'body_area': 'cadera izquierda y pierna',
        'archetype': 'El Escriba Sabio',
        'balancing_sefira': 'netzach',
        'affirmations': [
            "Mi mente es clara y enfocada.",
            "Comunico con precisión y gracia.",
            "Proceso la información con facilidad."
        ],
        'visualization_base': (
            "Visualiza una biblioteca infinita, con libros que contienen "
            "toda la sabiduría. Tú puedes acceder a cualquier conocimiento "
            "que necesites. Los pensamientos fluyen como agua clara, "
            "ordenándose naturalmente en comprensión útil."
        ),
        'best_time': 'Antes de estudiar, escribir o comunicar',
        'practice_tips': [
            "Ideal para calmar la mente hiperactiva",
            "Observa los pensamientos sin engancharte",
            "Usa un mantra si la mente divaga mucho"
        ]
    },
    'yesod': {
        'name': 'Yesod',
        'english': 'Foundation',
        'quality': 'Fundamento, conexión, sueños, vitalidad',
        'color': 'violeta o púrpura',
        'element': 'éter (lunar)',
        'body_area': 'área pélvica, órganos reproductivos',
        'archetype': 'El Soñador Conectado',
        'balancing_sefira': 'tiferet',
        'affirmations': [
            "Estoy firmemente conectado/a con mi fundamento.",
            "Mis sueños me revelan verdades profundas.",
            "Mi energía vital fluye libremente."
        ],
        'visualization_base': (
            "Visualiza raíces de luz púrpura que descienden desde tu base "
            "hacia las profundidades de la tierra. Estas raíces te anclan, "
            "te nutren, te conectan con el inconsciente fértil donde "
            "nacen los sueños y las intuiciones más profundas."
        ),
        'best_time': 'Antes de dormir o durante la luna llena',
        'practice_tips': [
            "Mantén los pies en contacto con el suelo",
            "Presta atención a los sueños después",
            "Ideal para trabajar con el inconsciente"
        ]
    },
    'malkuth': {
        'name': 'Maljut',
        'english': 'Kingdom',
        'quality': 'Reino, manifestación, cuerpo, tierra',
        'color': 'marrón o multicolor (los 4 elementos)',
        'element': 'tierra',
        'body_area': 'pies y todo el cuerpo físico',
        'archetype': 'La Reina de la Tierra',
        'balancing_sefira': 'keter',
        'affirmations': [
            "Mi cuerpo es un templo sagrado.",
            "Estoy presente aquí y ahora.",
            "Manifiesto mis intenciones en la realidad."
        ],
        'visualization_base': (
            "Visualiza tus pies firmemente plantados en la tierra. "
            "Siente el peso de tu cuerpo, la realidad de tu presencia. "
            "El suelo te sostiene, la gravedad te abraza. Eres materia "
            "consciente, espíritu encarnado, milagro viviente en este momento."
        ),
        'best_time': 'Cuando te sientas desconectado/a o ansioso/a',
        'practice_tips': [
            "Practica descalzo/a si es posible",
            "Siente cada parte del cuerpo conscientemente",
            "Termina con gratitud por tu forma física"
        ]
    }
}

MEDITATION_TYPES = {
    'equilibrio': {
        'name': 'Equilibrio',
        'description': 'Balancear la energía de la Sefirá con su par opuesto',
        'intro_template': (
            "Esta meditación de equilibrio te ayudará a balancear la energía de {sefira_name} "
            "con su complemento {balancing_name}. Cuando una energía está en exceso o defecto, "
            "su opuesto nos ayuda a encontrar el centro."
        ),
        'closing_template': (
            "Permite que estas dos energías - {sefira_name} y {balancing_name} - "
            "se equilibren naturalmente en tu interior. No hay prisa. El equilibrio "
            "es un proceso continuo, no un destino. Agradece a ambas fuerzas por "
            "su presencia en tu vida."
        )
    },
    'fortalecimiento': {
        'name': 'Fortalecimiento',
        'description': 'Potenciar las cualidades de la Sefirá',
        'intro_template': (
            "Esta meditación de fortalecimiento activará las cualidades de {sefira_name} "
            "en tu vida. Cada Sefirá contiene dones específicos que, al ser cultivados, "
            "enriquecen nuestra experiencia de ser humanos."
        ),
        'closing_template': (
            "Las cualidades de {sefira_name} - {quality} - ahora están más activas "
            "en tu campo energético. Confía en que estas fuerzas trabajarán "
            "a tu favor en los días siguientes. Ábrele espacio en tu vida cotidiana."
        )
    },
    'sanacion': {
        'name': 'Sanación',
        'description': 'Sanar bloqueos o heridas relacionadas con la Sefirá',
        'intro_template': (
            "Esta meditación de sanación trabajará con cualquier bloqueo o herida "
            "relacionada con {sefira_name}. A veces, ciertas energías se estancan "
            "o se dañan por experiencias difíciles. Hoy les daremos atención amorosa."
        ),
        'closing_template': (
            "Cualquier herida relacionada con {sefira_name} ahora comienza "
            "su proceso de sanación. No necesitas forzar nada. La luz que has "
            "invocado seguirá trabajando suavemente. Sé gentil contigo mismo/a."
        )
    },
    'integracion': {
        'name': 'Integración',
        'description': 'Integrar luz y sombra de la Sefirá',
        'intro_template': (
            "Esta meditación de integración te ayudará a reconocer tanto la luz "
            "como la sombra de {sefira_name}. Cada energía tiene un aspecto luminoso "
            "y uno oscuro. La integración no rechaza ninguno, sino que los abraza ambos."
        ),
        'closing_template': (
            "Has comenzado a integrar los aspectos de luz y sombra de {sefira_name}. "
            "Recuerda: la sombra no es tu enemiga, es una parte de ti que pide "
            "ser comprendida. Continúa este diálogo interno con compasión."
        )
    }
}


class MeditacionesPersonalizadas:
    """Generador de meditaciones personalizadas por Sefirá."""
    
    def generate_meditation(
        self,
        target_sefira: str,
        meditation_type: str,
        duration_minutes: int = 10,
        include_breathing: bool = True,
        include_visualization: bool = True,
        personal_intention: Optional[str] = None,
        consultant_name: str = "Consultante"
    ) -> Dict[str, Any]:
        """
        Genera una meditación personalizada.
        
        Args:
            target_sefira: Sefirá objetivo (keter, chokmah, etc.)
            meditation_type: Tipo (equilibrio, fortalecimiento, sanacion, integracion)
            duration_minutes: Duración estimada
            include_breathing: Incluir ejercicio de respiración
            include_visualization: Incluir visualización
            personal_intention: Intención personal del consultante
            consultant_name: Nombre del consultante
            
        Returns:
            Dict con contenido completo de la meditación
        """
        try:
            sefira_data = SEFIROT_MEDITATION_DATA.get(target_sefira)
            type_data = MEDITATION_TYPES.get(meditation_type)
            
            if not sefira_data or not type_data:
                raise ValueError(f"Sefirá o tipo inválido: {target_sefira}, {meditation_type}")
            
            # Obtener Sefirá de balance
            balancing_sefira = sefira_data['balancing_sefira']
            balancing_data = SEFIROT_MEDITATION_DATA.get(balancing_sefira, {})
            
            # Construir título
            title = f"Meditación de {type_data['name']} para {sefira_data['name']}"
            
            # Construir introducción
            introduction = self._build_introduction(
                sefira_data, 
                type_data, 
                balancing_data,
                personal_intention
            )
            
            # Ejercicio de respiración
            breathing_exercise = None
            if include_breathing:
                breathing_exercise = self._build_breathing_exercise(sefira_data, duration_minutes)
            
            # Visualización
            visualization = ""
            if include_visualization:
                visualization = self._build_visualization(
                    sefira_data, 
                    meditation_type, 
                    personal_intention
                )
            
            # Afirmaciones
            affirmations = self._customize_affirmations(
                sefira_data['affirmations'],
                consultant_name,
                personal_intention
            )
            
            # Cierre
            closing = self._build_closing(
                sefira_data,
                type_data,
                balancing_data
            )
            
            # Tips de práctica
            practice_tips = sefira_data.get('practice_tips', [])
            if personal_intention:
                practice_tips = practice_tips + [
                    f"Mantén presente tu intención: '{personal_intention[:50]}...'" if len(personal_intention) > 50 else f"Mantén presente tu intención: '{personal_intention}'"
                ]
            
            return {
                'title': title,
                'sefira': target_sefira,
                'duration_minutes': duration_minutes,
                'type': meditation_type,
                'introduction': introduction,
                'breathing_exercise': breathing_exercise,
                'visualization': visualization,
                'affirmations': affirmations,
                'closing': closing,
                'practice_tips': practice_tips,
                'best_time': sefira_data.get('best_time', 'En cualquier momento tranquilo'),
                'frequency_recommendation': self._get_frequency_recommendation(meditation_type)
            }
            
        except Exception as e:
            logger.error(f"Error generando meditación: {str(e)}")
            raise
    
    def _build_introduction(
        self, 
        sefira_data: Dict, 
        type_data: Dict,
        balancing_data: Dict,
        personal_intention: Optional[str]
    ) -> str:
        """Construye la introducción de la meditación."""
        intro = type_data['intro_template'].format(
            sefira_name=sefira_data['name'],
            balancing_name=balancing_data.get('name', 'su complemento'),
            quality=sefira_data['quality']
        )
        
        intro += (
            f"\n\nSiéntate cómodamente, con la espalda recta pero relajada. "
            f"Cierra los ojos suavemente. Toma tres respiraciones profundas, "
            f"dejando ir cualquier tensión con cada exhalación."
        )
        
        if personal_intention:
            intro += f"\n\nHoy trabajas con la intención: \"{personal_intention}\". Mantén esto presente."
        
        return intro
    
    def _build_breathing_exercise(self, sefira_data: Dict, duration: int) -> str:
        """Construye el ejercicio de respiración."""
        color = sefira_data['color']
        area = sefira_data['body_area']
        
        cycles = min(duration // 2, 5)
        
        return (
            f"Respira profundamente, imaginando que inhalas luz de color {color}. "
            f"Dirige esta luz hacia {area}, sintiendo cómo esta área se ilumina. "
            f"\n\nMantén un ritmo de 4-4-4: inhala contando hasta 4, "
            f"retén contando hasta 4, exhala contando hasta 4. "
            f"Repite este ciclo {cycles} veces."
        )
    
    def _build_visualization(
        self, 
        sefira_data: Dict, 
        meditation_type: str,
        personal_intention: Optional[str]
    ) -> str:
        """Construye la visualización guiada."""
        base_viz = sefira_data['visualization_base']
        color = sefira_data['color']
        
        # Agregar elementos según el tipo
        if meditation_type == 'sanacion':
            base_viz += (
                f"\n\nAhora visualiza una luz sanadora de color {color} "
                f"entrando en cualquier área de dolor o bloqueo. Esta luz "
                f"no fuerza nada - simplemente ofrece su presencia curativa. "
                f"Donde hay oscuridad, ofrece iluminación suave."
            )
        elif meditation_type == 'integracion':
            base_viz += (
                f"\n\nMientras sostienes esta imagen, permite que emerjan "
                f"también los aspectos menos cómodos de esta energía. "
                f"No los rechaces. Observa cómo luz y sombra son dos caras "
                f"de la misma moneda, ambas necesarias para tu completud."
            )
        elif meditation_type == 'equilibrio':
            balancing = sefira_data['balancing_sefira']
            balancing_data = SEFIROT_MEDITATION_DATA.get(balancing, {})
            balancing_color = balancing_data.get('color', 'complementario')
            base_viz += (
                f"\n\nAhora visualiza también una luz de color {balancing_color} "
                f"emergiendo para equilibrar. Observa cómo estas dos luces "
                f"danzan juntas, encontrando un punto medio perfecto. "
                f"Ni demasiado de una, ni demasiado de otra."
            )
        
        return base_viz
    
    def _customize_affirmations(
        self, 
        affirmations: List[str],
        name: str,
        intention: Optional[str]
    ) -> List[str]:
        """Personaliza las afirmaciones."""
        customized = affirmations.copy()
        
        # Agregar afirmación personalizada si hay intención
        if intention:
            # Convertir intención en afirmación
            if intention.startswith("Quiero"):
                intention_aff = intention.replace("Quiero", "Puedo y elijo")
            elif intention.startswith("Necesito"):
                intention_aff = intention.replace("Necesito", "Merezco y recibo")
            else:
                intention_aff = f"Mi intención se manifiesta: {intention}"
            
            customized.append(intention_aff)
        
        return customized
    
    def _build_closing(
        self, 
        sefira_data: Dict,
        type_data: Dict,
        balancing_data: Dict
    ) -> str:
        """Construye el cierre de la meditación."""
        closing = type_data['closing_template'].format(
            sefira_name=sefira_data['name'],
            balancing_name=balancing_data.get('name', 'su complemento'),
            quality=sefira_data['quality']
        )
        
        closing += (
            f"\n\nCuando estés listo/a, comienza a tomar consciencia de tu cuerpo. "
            f"Mueve suavemente los dedos de manos y pies. Respira profundamente. "
            f"Abre los ojos lentamente, trayendo contigo la paz de esta práctica."
        )
        
        return closing
    
    def _get_frequency_recommendation(self, meditation_type: str) -> str:
        """Obtiene recomendación de frecuencia según el tipo."""
        recommendations = {
            'equilibrio': 'Diariamente durante una semana, luego según necesidad',
            'fortalecimiento': '3-4 veces por semana durante 21 días',
            'sanacion': 'Diariamente hasta sentir mejoría, con descansos si es intenso',
            'integracion': '2-3 veces por semana, con tiempo para procesar entre sesiones'
        }
        return recommendations.get(meditation_type, 'Según te sientas guiado/a')
