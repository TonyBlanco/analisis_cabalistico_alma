// ============================================================================
// SISTEMA INTEGRADO COMPLETO: TAROT + CÁBALA + ASTROLOGÍA
// ============================================================================

// ---------------------------------------------------------------------------
// 1. TIPOS Y ESTRUCTURAS DE DATOS
// ---------------------------------------------------------------------------

export type TarotSuit = 'copas' | 'oros' | 'espadas' | 'bastos';
export type TarotType = 'arcano_mayor' | 'arcano_menor';
export type Element = 'fuego' | 'agua' | 'aire' | 'tierra';
export type ZodiacSign = 
  | 'aries' | 'tauro' | 'geminis' | 'cancer' 
  | 'leo' | 'virgo' | 'libra' | 'escorpio' 
  | 'sagitario' | 'capricornio' | 'acuario' | 'piscis';

export interface TarotCard {
  id: string;
  number: number;
  name: string;
  spanishName: string;
  type: TarotType;
  suit?: TarotSuit;
  
  sefirah?: string;
  hebrewLetter?: string;
  path?: number;
  
  planet?: string;
  zodiacSign?: ZodiacSign;
  element?: Element;
  
  keywords: string[];
  upright: string;
  reversed: string;
  
  therapeuticTheme: string;
  bodyCorrespondence?: string[];
}

export interface DrawnCard {
  card: TarotCard;
  position: number;
  reversed: boolean;
  positionMeaning: string;
}

export interface TarotReading {
  id: string;
  patientId: string;
  date: Date;
  spread: 'tree_of_life';
  cards: DrawnCard[];
  interpretation: string;
  therapeuticNotes: string;
  dominantSefirot: string[];
  energyBalance: {
    pillarSeverity: number;
    pillarMercy: number;
    pillarEquilibrium: number;
  };
}

// ---------------------------------------------------------------------------
// 2. BASE DE DATOS COMPLETA DE TAROT (78 CARTAS)
// ---------------------------------------------------------------------------

// ARCANOS MAYORES (22 cartas)
export const ARCANOS_MAYORES: TarotCard[] = [
  {
    id: 'fool', number: 0, name: 'The Fool', spanishName: 'El Loco',
    type: 'arcano_mayor', hebrewLetter: 'א (Aleph)', path: 11,
    element: 'aire', planet: 'Urano', zodiacSign: 'acuario',
    keywords: ['nuevo comienzo', 'inocencia', 'espontaneidad', 'fe'],
    upright: 'Nuevos comienzos, aventura, potencial ilimitado',
    reversed: 'Imprudencia, riesgos innecesarios, ingenuidad',
    therapeuticTheme: 'Liberación del miedo al cambio',
    bodyCorrespondence: ['head', 'crown'],
  },
  {
    id: 'magician', number: 1, name: 'The Magician', spanishName: 'El Mago',
    type: 'arcano_mayor', sefirah: 'keter', hebrewLetter: 'ב (Beth)', path: 12,
    planet: 'Mercurio', element: 'aire',
    keywords: ['manifestación', 'poder', 'acción', 'recursos'],
    upright: 'Poder de manifestación, recursos disponibles',
    reversed: 'Manipulación, mal uso del poder',
    therapeuticTheme: 'Activación del poder personal',
    bodyCorrespondence: ['throat', 'hands'],
  },
  {
    id: 'high_priestess', number: 2, name: 'The High Priestess', spanishName: 'La Sacerdotisa',
    type: 'arcano_mayor', sefirah: 'binah', hebrewLetter: 'ג (Gimel)', path: 13,
    planet: 'Luna', zodiacSign: 'cancer', element: 'agua',
    keywords: ['intuición', 'misterio', 'sabiduría interior', 'subconsciente'],
    upright: 'Intuición, conocimiento oculto, subconsciente',
    reversed: 'Secretos, información oculta, desconexión',
    therapeuticTheme: 'Conexión con la sabiduría interior',
    bodyCorrespondence: ['third-eye', 'womb'],
  },
  {
    id: 'empress', number: 3, name: 'The Empress', spanishName: 'La Emperatriz',
    type: 'arcano_mayor', sefirah: 'binah', hebrewLetter: 'ד (Daleth)', path: 14,
    planet: 'Venus', zodiacSign: 'tauro', element: 'tierra',
    keywords: ['abundancia', 'naturaleza', 'fertilidad', 'nutrición'],
    upright: 'Abundancia, naturaleza, creatividad femenina',
    reversed: 'Dependencia, sofocación, vacío creativo',
    therapeuticTheme: 'Nutrición y autocuidado',
    bodyCorrespondence: ['heart', 'womb', 'breasts'],
  },
  {
    id: 'emperor', number: 4, name: 'The Emperor', spanishName: 'El Emperador',
    type: 'arcano_mayor', sefirah: 'chokmah', hebrewLetter: 'ה (Heh)', path: 15,
    planet: 'Marte', zodiacSign: 'aries', element: 'fuego',
    keywords: ['autoridad', 'estructura', 'control', 'padre'],
    upright: 'Autoridad, estructura, control, estabilidad',
    reversed: 'Tiranía, rigidez, dominación',
    therapeuticTheme: 'Establecimiento de límites saludables',
    bodyCorrespondence: ['shoulders', 'spine'],
  },
  {
    id: 'hierophant', number: 5, name: 'The Hierophant', spanishName: 'El Sumo Sacerdote',
    type: 'arcano_mayor', sefirah: 'chesed', hebrewLetter: 'ו (Vav)', path: 16,
    zodiacSign: 'tauro', element: 'tierra',
    keywords: ['tradición', 'enseñanza', 'espiritualidad'],
    upright: 'Tradición, educación, creencias',
    reversed: 'Rebelión, subversión, nuevos enfoques',
    therapeuticTheme: 'Integración de valores personales',
    bodyCorrespondence: ['throat', 'ears'],
  },
  {
    id: 'lovers', number: 6, name: 'The Lovers', spanishName: 'Los Enamorados',
    type: 'arcano_mayor', sefirah: 'tiferet', hebrewLetter: 'ז (Zayin)', path: 17,
    zodiacSign: 'geminis', element: 'aire',
    keywords: ['amor', 'unión', 'elección', 'valores'],
    upright: 'Amor, unión, valores, elecciones',
    reversed: 'Desalineación, conflicto de valores',
    therapeuticTheme: 'Relaciones y elecciones conscientes',
    bodyCorrespondence: ['heart', 'lungs'],
  },
  {
    id: 'chariot', number: 7, name: 'The Chariot', spanishName: 'El Carro',
    type: 'arcano_mayor', sefirah: 'netzach', hebrewLetter: 'ח (Cheth)', path: 18,
    zodiacSign: 'cancer', element: 'agua',
    keywords: ['victoria', 'control', 'determinación'],
    upright: 'Control, voluntad, victoria',
    reversed: 'Falta de control, falta de dirección',
    therapeuticTheme: 'Dirección y fuerza de voluntad',
    bodyCorrespondence: ['solar-plexus', 'legs'],
  },
  {
    id: 'strength', number: 8, name: 'Strength', spanishName: 'La Fuerza',
    type: 'arcano_mayor', sefirah: 'gevurah', hebrewLetter: 'ט (Teth)', path: 19,
    zodiacSign: 'leo', element: 'fuego',
    keywords: ['coraje', 'paciencia', 'compasión'],
    upright: 'Fuerza interior, coraje, paciencia',
    reversed: 'Inseguridad, duda, falta de autocontrol',
    therapeuticTheme: 'Fortaleza interior y autodominio',
    bodyCorrespondence: ['heart', 'solar-plexus'],
  },
  {
    id: 'hermit', number: 9, name: 'The Hermit', spanishName: 'El Ermitaño',
    type: 'arcano_mayor', sefirah: 'yesod', hebrewLetter: 'י (Yod)', path: 20,
    zodiacSign: 'virgo', element: 'tierra',
    keywords: ['introspección', 'soledad', 'guía interior'],
    upright: 'Introspección, búsqueda, guía interior',
    reversed: 'Aislamiento, soledad, retraimiento',
    therapeuticTheme: 'Búsqueda interior y autoconocimiento',
    bodyCorrespondence: ['third-eye', 'crown'],
  },
  {
    id: 'wheel', number: 10, name: 'Wheel of Fortune', spanishName: 'La Rueda de la Fortuna',
    type: 'arcano_mayor', sefirah: 'chesed', hebrewLetter: 'כ (Kaph)', path: 21,
    planet: 'Júpiter', element: 'fuego',
    keywords: ['destino', 'cambio', 'ciclos', 'karma'],
    upright: 'Cambio, ciclos, destino inevitable',
    reversed: 'Mala suerte, resistencia al cambio',
    therapeuticTheme: 'Aceptación de ciclos vitales',
    bodyCorrespondence: ['navel', 'center'],
  },
  {
    id: 'justice', number: 11, name: 'Justice', spanishName: 'La Justicia',
    type: 'arcano_mayor', sefirah: 'tiferet', hebrewLetter: 'ל (Lamed)', path: 22,
    zodiacSign: 'libra', element: 'aire',
    keywords: ['equilibrio', 'verdad', 'causa y efecto'],
    upright: 'Justicia, verdad, causa y efecto',
    reversed: 'Injusticia, deshonestidad, desequilibrio',
    therapeuticTheme: 'Equilibrio y responsabilidad',
    bodyCorrespondence: ['heart', 'kidneys'],
  },
  {
    id: 'hanged', number: 12, name: 'The Hanged Man', spanishName: 'El Colgado',
    type: 'arcano_mayor', sefirah: 'hod', hebrewLetter: 'מ (Mem)', path: 23,
    planet: 'Neptuno', element: 'agua',
    keywords: ['sacrificio', 'perspectiva', 'suspensión'],
    upright: 'Pausa, rendición, nueva perspectiva',
    reversed: 'Retraso, resistencia, estancamiento',
    therapeuticTheme: 'Soltar el control',
    bodyCorrespondence: ['feet', 'ankles'],
  },
  {
    id: 'death', number: 13, name: 'Death', spanishName: 'La Muerte',
    type: 'arcano_mayor', sefirah: 'netzach', hebrewLetter: 'נ (Nun)', path: 24,
    zodiacSign: 'escorpio', element: 'agua',
    keywords: ['transformación', 'final', 'renacimiento'],
    upright: 'Transformación, final, transición',
    reversed: 'Resistencia al cambio, estancamiento',
    therapeuticTheme: 'Transformación y renacimiento',
    bodyCorrespondence: ['genitals', 'reproductive'],
  },
  {
    id: 'temperance', number: 14, name: 'Temperance', spanishName: 'La Templanza',
    type: 'arcano_mayor', sefirah: 'yesod', hebrewLetter: 'ס (Samekh)', path: 25,
    zodiacSign: 'sagitario', element: 'fuego',
    keywords: ['balance', 'moderación', 'paciencia'],
    upright: 'Balance, moderación, paciencia',
    reversed: 'Desequilibrio, exceso, impaciencia',
    therapeuticTheme: 'Integración y balance',
    bodyCorrespondence: ['hips', 'thighs'],
  },
  {
    id: 'devil', number: 15, name: 'The Devil', spanishName: 'El Diablo',
    type: 'arcano_mayor', sefirah: 'hod', hebrewLetter: 'ע (Ayin)', path: 26,
    zodiacSign: 'capricornio', element: 'tierra',
    keywords: ['atadura', 'adicción', 'materialismo'],
    upright: 'Atadura, adicción, materialismo',
    reversed: 'Liberación, desapego, revelación',
    therapeuticTheme: 'Liberación de ataduras',
    bodyCorrespondence: ['knees', 'bones'],
  },
  {
    id: 'tower', number: 16, name: 'The Tower', spanishName: 'La Torre',
    type: 'arcano_mayor', sefirah: 'netzach', hebrewLetter: 'פ (Peh)', path: 27,
    planet: 'Marte', element: 'fuego',
    keywords: ['destrucción', 'revelación', 'liberación'],
    upright: 'Destrucción súbita, revelación',
    reversed: 'Evitar el desastre, resistencia',
    therapeuticTheme: 'Crisis transformadora',
    bodyCorrespondence: ['head', 'nervous-system'],
  },
  {
    id: 'star', number: 17, name: 'The Star', spanishName: 'La Estrella',
    type: 'arcano_mayor', sefirah: 'chokmah', hebrewLetter: 'צ (Tzaddi)', path: 28,
    zodiacSign: 'acuario', element: 'aire',
    keywords: ['esperanza', 'inspiración', 'serenidad'],
    upright: 'Esperanza, fe, renovación',
    reversed: 'Desesperanza, falta de fe',
    therapeuticTheme: 'Renovación y esperanza',
    bodyCorrespondence: ['ankles', 'circulation'],
  },
  {
    id: 'moon', number: 18, name: 'The Moon', spanishName: 'La Luna',
    type: 'arcano_mayor', sefirah: 'malkuth', hebrewLetter: 'ק (Qoph)', path: 29,
    zodiacSign: 'piscis', element: 'agua',
    keywords: ['ilusión', 'miedo', 'subconsciente'],
    upright: 'Ilusión, miedo, intuición',
    reversed: 'Liberación del miedo, claridad',
    therapeuticTheme: 'Confrontación de miedos',
    bodyCorrespondence: ['feet', 'lymphatic'],
  },
  {
    id: 'sun', number: 19, name: 'The Sun', spanishName: 'El Sol',
    type: 'arcano_mayor', sefirah: 'tiferet', hebrewLetter: 'ר (Resh)', path: 30,
    planet: 'Sol', element: 'fuego',
    keywords: ['alegría', 'éxito', 'vitalidad'],
    upright: 'Alegría, éxito, vitalidad',
    reversed: 'Tristeza temporal, falta de claridad',
    therapeuticTheme: 'Alegría y vitalidad',
    bodyCorrespondence: ['heart', 'solar-plexus'],
  },
  {
    id: 'judgement', number: 20, name: 'Judgement', spanishName: 'El Juicio',
    type: 'arcano_mayor', sefirah: 'malkuth', hebrewLetter: 'ש (Shin)', path: 31,
    planet: 'Plutón', element: 'fuego',
    keywords: ['renacimiento', 'juicio', 'absolución'],
    upright: 'Juicio, renacimiento, llamado interior',
    reversed: 'Duda, autocrítica, juicio erróneo',
    therapeuticTheme: 'Renacimiento y perdón',
    bodyCorrespondence: ['whole-body', 'spine'],
  },
  {
    id: 'world', number: 21, name: 'The World', spanishName: 'El Mundo',
    type: 'arcano_mayor', sefirah: 'malkuth', hebrewLetter: 'ת (Tav)', path: 32,
    planet: 'Saturno', element: 'tierra',
    keywords: ['completitud', 'logro', 'integración'],
    upright: 'Completitud, logro, integración',
    reversed: 'Incompletitud, falta de cierre',
    therapeuticTheme: 'Integración y completitud',
    bodyCorrespondence: ['whole-body', 'skeleton'],
  },
];

// ARCANOS MENORES - COPAS (Agua, Emociones)
export const COPAS: TarotCard[] = [
  {
    id: 'ace_cups', number: 1, name: 'Ace of Cups', spanishName: 'As de Copas',
    type: 'arcano_menor', suit: 'copas', element: 'agua', sefirah: 'keter',
    keywords: ['amor nuevo', 'compasión', 'creatividad emocional'],
    upright: 'Nuevos sentimientos, amor, compasión',
    reversed: 'Emociones bloqueadas, rechazo',
    therapeuticTheme: 'Apertura emocional',
    bodyCorrespondence: ['heart', 'chest'],
  },
  {
    id: 'two_cups', number: 2, name: 'Two of Cups', spanishName: 'Dos de Copas',
    type: 'arcano_menor', suit: 'copas', element: 'agua', sefirah: 'chokmah',
    keywords: ['unión', 'sociedad', 'atracción mutua'],
    upright: 'Asociación, amor, armonía',
    reversed: 'Desbalance, ruptura, malentendido',
    therapeuticTheme: 'Relaciones equilibradas',
    bodyCorrespondence: ['heart'],
  },
  {
    id: 'three_cups', number: 3, name: 'Three of Cups', spanishName: 'Tres de Copas',
    type: 'arcano_menor', suit: 'copas', element: 'agua', sefirah: 'binah',
    keywords: ['celebración', 'amistad', 'comunidad'],
    upright: 'Celebración, amistad, creatividad',
    reversed: 'Exceso, aislamiento, gossip',
    therapeuticTheme: 'Conexión social',
    bodyCorrespondence: ['heart', 'throat'],
  },
  // ... Continuar hasta el Rey de Copas
];

// ARCANOS MENORES - OROS (Tierra, Material)
export const OROS: TarotCard[] = [
  {
    id: 'ace_pentacles', number: 1, name: 'Ace of Pentacles', spanishName: 'As de Oros',
    type: 'arcano_menor', suit: 'oros', element: 'tierra', sefirah: 'keter',
    keywords: ['oportunidad', 'prosperidad', 'manifestación'],
    upright: 'Nueva oportunidad financiera, prosperidad',
    reversed: 'Oportunidad perdida, mala planificación',
    therapeuticTheme: 'Manifestación material',
    bodyCorrespondence: ['root', 'legs'],
  },
  // ... Continuar hasta el Rey de Oros
];

// ARCANOS MENORES - ESPADAS (Aire, Mente)
export const ESPADAS: TarotCard[] = [
  {
    id: 'ace_swords', number: 1, name: 'Ace of Swords', spanishName: 'As de Espadas',
    type: 'arcano_menor', suit: 'espadas', element: 'aire', sefirah: 'keter',
    keywords: ['claridad', 'verdad', 'decisión'],
    upright: 'Claridad mental, verdad, decisión',
    reversed: 'Confusión, información incorrecta',
    therapeuticTheme: 'Claridad mental',
    bodyCorrespondence: ['head', 'brain'],
  },
  // ... Continuar hasta el Rey de Espadas
];

// ARCANOS MENORES - BASTOS (Fuego, Acción)
export const BASTOS: TarotCard[] = [
  {
    id: 'ace_wands', number: 1, name: 'Ace of Wands', spanishName: 'As de Bastos',
    type: 'arcano_menor', suit: 'bastos', element: 'fuego', sefirah: 'keter',
    keywords: ['inspiración', 'crecimiento', 'potencial'],
    upright: 'Inspiración, nuevos proyectos, crecimiento',
    reversed: 'Falta de dirección, retrasos',
    therapeuticTheme: 'Iniciativa y acción',
    bodyCorrespondence: ['solar-plexus', 'spine'],
  },
  // ... Continuar hasta el Rey de Bastos
];

// Baraja completa
export const FULL_DECK: TarotCard[] = [
  ...ARCANOS_MAYORES,
  ...COPAS,
  ...OROS,
  ...ESPADAS,
  ...BASTOS,
];

// ---------------------------------------------------------------------------
// 3. CALCULADORA Y MOTOR DE LECTURAS
// ---------------------------------------------------------------------------

export class TarotEngine {
  /**
   * Baraja y extrae cartas para una lectura
   */
  static shuffleAndDraw(count: number, includeReversed: boolean = true): DrawnCard[] {
    const shuffled = [...FULL_DECK].sort(() => Math.random() - 0.5);
    const drawn = shuffled.slice(0, count);
    
    return drawn.map((card, index) => ({
      card,
      position: index + 1,
      reversed: includeReversed ? Math.random() > 0.5 : false,
      positionMeaning: '',
    }));
  }
  
  /**
   * Tirada del Árbol de la Vida
   */
  static treeOfLifeReading(): DrawnCard[] {
    const positions = [
      { sefirah: 'malkuth', meaning: 'Situación física actual' },
      { sefirah: 'yesod', meaning: 'Emociones y fundamentos' },
      { sefirah: 'hod', meaning: 'Mente y comunicación' },
      { sefirah: 'netzach', meaning: 'Deseos y relaciones' },
      { sefirah: 'tiferet', meaning: 'Corazón y equilibrio' },
      { sefirah: 'gevurah', meaning: 'Límites y disciplina' },
      { sefirah: 'chesed', meaning: 'Abundancia y expansión' },
      { sefirah: 'binah', meaning: 'Comprensión profunda' },
      { sefirah: 'chokmah', meaning: 'Sabiduría y visión' },
      { sefirah: 'keter', meaning: 'Propósito superior' },
    ];
    
    const cards = this.shuffleAndDraw(10, true);
    
    return cards.map((card, index) => ({
      ...card,
      positionMeaning: positions[index].meaning,
    }));
  }
  
  /**
   * Analiza balance energético
   */
  static analyzeBalance(cards: DrawnCard[]): {
    pillarSeverity: number;
    pillarMercy: number;
    pillarEquilibrium: number;
  } {
    const severitySefirot = ['binah', 'gevurah', 'hod'];
    const mercySefirot = ['chokmah', 'chesed', 'netzach'];
    const equilibriumSefirot = ['keter', 'tiferet', 'yesod', 'malkuth'];
    
    let severity = 0, mercy = 0, equilibrium = 0;
    
    cards.forEach(drawn => {
      const sefirah = drawn.card.sefirah;
      if (sefirah) {
        if (severitySefirot.includes(sefirah)) severity++;
        else if (mercySefirot.includes(sefirah)) mercy++;
        else if (equilibriumSefirot.includes(sefirah)) equilibrium++;
      }
    });
    
    const total = severity + mercy + equilibrium || 1;
    
    return {
      pillarSeverity: Math.round((severity / total) * 100),
      pillarMercy: Math.round((mercy / total) * 100),
      pillarEquilibrium: Math.round((equilibrium / total) * 100),
    };
  }
}