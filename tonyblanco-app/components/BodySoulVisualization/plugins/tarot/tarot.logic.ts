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
  {
    id: 'four_cups', number: 4, name: 'Four of Cups', spanishName: 'Cuatro de Copas',
    type: 'arcano_menor', suit: 'copas', element: 'agua', sefirah: 'chesed',
    keywords: ['introspección', 'apatía', 'contemplación'],
    upright: 'Meditación, ensimismamiento, nuevas perspectivas',
    reversed: 'Acción, salir del estancamiento',
    therapeuticTheme: 'Integración emocional',
    bodyCorrespondence: ['heart', 'solar-plexus'],
  },
  {
    id: 'five_cups', number: 5, name: 'Five of Cups', spanishName: 'Cinco de Copas',
    type: 'arcano_menor', suit: 'copas', element: 'agua', sefirah: 'gevurah',
    keywords: ['pérdida', 'duelo', 'resignación'],
    upright: 'Pérdida, duelo, foco en lo negativo',
    reversed: 'Aceptación, recuperación, seguir adelante',
    therapeuticTheme: 'Elaboración del duelo',
    bodyCorrespondence: ['chest', 'throat'],
  },
  {
    id: 'six_cups', number: 6, name: 'Six of Cups', spanishName: 'Seis de Copas',
    type: 'arcano_menor', suit: 'copas', element: 'agua', sefirah: 'tiferet',
    keywords: ['nostalgia', 'inocencia', 'generosidad'],
    upright: 'Nostalgia, infancia, dar sin esperar',
    reversed: 'Aferrarse al pasado, ingenuidad',
    therapeuticTheme: 'Sanar al niño interior',
    bodyCorrespondence: ['heart', 'womb'],
  },
  {
    id: 'seven_cups', number: 7, name: 'Seven of Cups', spanishName: 'Siete de Copas',
    type: 'arcano_menor', suit: 'copas', element: 'agua', sefirah: 'netzach',
    keywords: ['ilusión', 'elecciones', 'fantasía'],
    upright: 'Imaginación, múltiples opciones, ilusión',
    reversed: 'Claridad, decisión, realismo',
    therapeuticTheme: 'Discriminación emocional',
    bodyCorrespondence: ['third-eye', 'head'],
  },
  {
    id: 'eight_cups', number: 8, name: 'Eight of Cups', spanishName: 'Ocho de Copas',
    type: 'arcano_menor', suit: 'copas', element: 'agua', sefirah: 'hod',
    keywords: ['abandono', 'búsqueda', 'desencantos'],
    upright: 'Alejarse, buscar mayor significado',
    reversed: 'Estancamiento, miedo al cambio',
    therapeuticTheme: 'Soltar vínculos que no nutren',
    bodyCorrespondence: ['legs', 'feet'],
  },
  {
    id: 'nine_cups', number: 9, name: 'Nine of Cups', spanishName: 'Nueve de Copas',
    type: 'arcano_menor', suit: 'copas', element: 'agua', sefirah: 'yesod',
    keywords: ['satisfacción', 'deseo cumplido', 'gratitud'],
    upright: 'Deseos cumplidos, contento, bienestar',
    reversed: 'Insatisfacción, materialismo, vacío',
    therapeuticTheme: 'Gratitud y plenitud',
    bodyCorrespondence: ['heart', 'belly'],
  },
  {
    id: 'ten_cups', number: 10, name: 'Ten of Cups', spanishName: 'Diez de Copas',
    type: 'arcano_menor', suit: 'copas', element: 'agua', sefirah: 'malkuth',
    keywords: ['armonía familiar', 'alegría', 'realización'],
    upright: 'Alegría duradera, familia, armonía',
    reversed: 'Conflicto familiar, disfunción, ilusión',
    therapeuticTheme: 'Armonía familiar y pertenencia',
    bodyCorrespondence: ['heart', 'whole-body'],
  },
  {
    id: 'page_cups', number: 11, name: 'Page of Cups', spanishName: 'Sota de Copas',
    type: 'arcano_menor', suit: 'copas', element: 'agua',
    keywords: ['creatividad', 'intuición', 'mensajes del alma'],
    upright: 'Creatividad, mensajes intuitivos, curiosidad',
    reversed: 'Inmadurez emocional, escapismo',
    therapeuticTheme: 'Escuchar la voz interior',
    bodyCorrespondence: ['heart', 'throat'],
  },
  {
    id: 'knight_cups', number: 12, name: 'Knight of Cups', spanishName: 'Caballo de Copas',
    type: 'arcano_menor', suit: 'copas', element: 'agua',
    keywords: ['romance', 'encanto', 'seguir el corazón'],
    upright: 'Romanticismo, creatividad, propuestas',
    reversed: 'Inconsistencia, moodiness, escapismo',
    therapeuticTheme: 'Expresión emocional auténtica',
    bodyCorrespondence: ['heart', 'hips'],
  },
  {
    id: 'queen_cups', number: 13, name: 'Queen of Cups', spanishName: 'Reina de Copas',
    type: 'arcano_menor', suit: 'copas', element: 'agua',
    keywords: ['compasión', 'cuidado', 'intuición profunda'],
    upright: 'Compasión, cuidado emocional, intuición',
    reversed: 'Dependencia emocional, inseguridad',
    therapeuticTheme: 'Nutrición emocional y autocompasión',
    bodyCorrespondence: ['heart', 'womb'],
  },
  {
    id: 'king_cups', number: 14, name: 'King of Cups', spanishName: 'Rey de Copas',
    type: 'arcano_menor', suit: 'copas', element: 'agua',
    keywords: ['sabiduría emocional', 'diplomacia', 'equilibrio'],
    upright: 'Madurez emocional, liderazgo compasivo',
    reversed: 'Manipulación emocional, frialdad',
    therapeuticTheme: 'Sabiduría emocional madura',
    bodyCorrespondence: ['heart', 'chest'],
  },
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
  {
    id: 'two_pentacles', number: 2, name: 'Two of Pentacles', spanishName: 'Dos de Oros',
    type: 'arcano_menor', suit: 'oros', element: 'tierra', sefirah: 'chokmah',
    keywords: ['adaptabilidad', 'malabarismo', 'equilibrio'],
    upright: 'Equilibrio, adaptabilidad, manejar múltiples demandas',
    reversed: 'Desorganización, exceso de compromisos',
    therapeuticTheme: 'Gestión del equilibrio vital',
    bodyCorrespondence: ['hands', 'lower-back'],
  },
  {
    id: 'three_pentacles', number: 3, name: 'Three of Pentacles', spanishName: 'Tres de Oros',
    type: 'arcano_menor', suit: 'oros', element: 'tierra', sefirah: 'binah',
    keywords: ['colaboración', 'habilidad', 'aprendizaje'],
    upright: 'Trabajo en equipo, dominio, reconocimiento',
    reversed: 'Falta de cooperación, mediocridad',
    therapeuticTheme: 'Colaboración y maestría profesional',
    bodyCorrespondence: ['hands', 'shoulders'],
  },
  {
    id: 'four_pentacles', number: 4, name: 'Four of Pentacles', spanishName: 'Cuatro de Oros',
    type: 'arcano_menor', suit: 'oros', element: 'tierra', sefirah: 'chesed',
    keywords: ['seguridad', 'posesividad', 'control'],
    upright: 'Estabilidad, ahorro, conservación',
    reversed: 'Avaricia, miedo a perder, materialismo',
    therapeuticTheme: 'Relación sana con la abundancia',
    bodyCorrespondence: ['root', 'belly'],
  },
  {
    id: 'five_pentacles', number: 5, name: 'Five of Pentacles', spanishName: 'Cinco de Oros',
    type: 'arcano_menor', suit: 'oros', element: 'tierra', sefirah: 'gevurah',
    keywords: ['penuria', 'aislamiento', 'necesidad'],
    upright: 'Dificultades financieras, soledad, adversidad',
    reversed: 'Recuperación, nueva fe, ayuda recibida',
    therapeuticTheme: 'Resiliencia ante la adversidad',
    bodyCorrespondence: ['root', 'feet'],
  },
  {
    id: 'six_pentacles', number: 6, name: 'Six of Pentacles', spanishName: 'Seis de Oros',
    type: 'arcano_menor', suit: 'oros', element: 'tierra', sefirah: 'tiferet',
    keywords: ['generosidad', 'dar y recibir', 'caridad'],
    upright: 'Generosidad, compartir, equilibrio en el dar',
    reversed: 'Deuda, dependencia, dar condicionalmente',
    therapeuticTheme: 'Reciprocidad y generosidad sana',
    bodyCorrespondence: ['hands', 'heart'],
  },
  {
    id: 'seven_pentacles', number: 7, name: 'Seven of Pentacles', spanishName: 'Siete de Oros',
    type: 'arcano_menor', suit: 'oros', element: 'tierra', sefirah: 'netzach',
    keywords: ['evaluación', 'paciencia', 'inversión'],
    upright: 'Persistencia, cosecha, visión a largo plazo',
    reversed: 'Impaciencia, falta de recompensa, frustración',
    therapeuticTheme: 'Paciencia y visión de largo plazo',
    bodyCorrespondence: ['root', 'knees'],
  },
  {
    id: 'eight_pentacles', number: 8, name: 'Eight of Pentacles', spanishName: 'Ocho de Oros',
    type: 'arcano_menor', suit: 'oros', element: 'tierra', sefirah: 'hod',
    keywords: ['diligencia', 'habilidad', 'aprendizaje'],
    upright: 'Dedicación, aprendizaje del oficio, mejora',
    reversed: 'Falta de motivación, perfeccionismo tóxico',
    therapeuticTheme: 'Desarrollo de habilidades y maestría',
    bodyCorrespondence: ['hands', 'spine'],
  },
  {
    id: 'nine_pentacles', number: 9, name: 'Nine of Pentacles', spanishName: 'Nueve de Oros',
    type: 'arcano_menor', suit: 'oros', element: 'tierra', sefirah: 'yesod',
    keywords: ['abundancia', 'independencia', 'autosuficiencia'],
    upright: 'Prosperidad, independencia, lujo merecido',
    reversed: 'Dependencia financiera, pérdida material',
    therapeuticTheme: 'Autosuficiencia y merecimiento',
    bodyCorrespondence: ['root', 'belly'],
  },
  {
    id: 'ten_pentacles', number: 10, name: 'Ten of Pentacles', spanishName: 'Diez de Oros',
    type: 'arcano_menor', suit: 'oros', element: 'tierra', sefirah: 'malkuth',
    keywords: ['legado', 'riqueza familiar', 'estabilidad duradera'],
    upright: 'Riqueza generacional, seguridad, tradición familiar',
    reversed: 'Conflictos familiares, pérdida de herencia',
    therapeuticTheme: 'Legado y pertenencia familiar',
    bodyCorrespondence: ['root', 'whole-body'],
  },
  {
    id: 'page_pentacles', number: 11, name: 'Page of Pentacles', spanishName: 'Sota de Oros',
    type: 'arcano_menor', suit: 'oros', element: 'tierra',
    keywords: ['aprendizaje', 'nuevas oportunidades', 'habilidades prácticas'],
    upright: 'Nuevas habilidades, estudio, ambición práctica',
    reversed: 'Falta de foco, procrastinación',
    therapeuticTheme: 'Apertura al aprendizaje',
    bodyCorrespondence: ['hands', 'root'],
  },
  {
    id: 'knight_pentacles', number: 12, name: 'Knight of Pentacles', spanishName: 'Caballo de Oros',
    type: 'arcano_menor', suit: 'oros', element: 'tierra',
    keywords: ['metodología', 'diligencia', 'responsabilidad'],
    upright: 'Trabajo duro, rutina, fiabilidad',
    reversed: 'Aburrimiento, estancamiento, perfeccionismo',
    therapeuticTheme: 'Responsabilidad y constancia',
    bodyCorrespondence: ['spine', 'legs'],
  },
  {
    id: 'queen_pentacles', number: 13, name: 'Queen of Pentacles', spanishName: 'Reina de Oros',
    type: 'arcano_menor', suit: 'oros', element: 'tierra',
    keywords: ['nutrición', 'abundancia práctica', 'seguridad'],
    upright: 'Prosperidad práctica, cuidado, conexión a la tierra',
    reversed: 'Trabajo excesivo, descuido propio, dependencia',
    therapeuticTheme: 'Maternidad práctica y autocuidado',
    bodyCorrespondence: ['root', 'womb'],
  },
  {
    id: 'king_pentacles', number: 14, name: 'King of Pentacles', spanishName: 'Rey de Oros',
    type: 'arcano_menor', suit: 'oros', element: 'tierra',
    keywords: ['éxito material', 'liderazgo', 'estabilidad'],
    upright: 'Abundancia, liderazgo práctico, seguridad',
    reversed: 'Obsesión material, corrupción, inflexibilidad',
    therapeuticTheme: 'Liderazgo sano y provisión',
    bodyCorrespondence: ['root', 'shoulders'],
  },
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
  {
    id: 'two_swords', number: 2, name: 'Two of Swords', spanishName: 'Dos de Espadas',
    type: 'arcano_menor', suit: 'espadas', element: 'aire', sefirah: 'chokmah',
    keywords: ['indecisión', 'bloqueo', 'punto muerto'],
    upright: 'Bloqueo, evitación, decisión difícil',
    reversed: 'Decisión tomada, información revelada',
    therapeuticTheme: 'Tomar decisiones difíciles',
    bodyCorrespondence: ['shoulders', 'throat'],
  },
  {
    id: 'three_swords', number: 3, name: 'Three of Swords', spanishName: 'Tres de Espadas',
    type: 'arcano_menor', suit: 'espadas', element: 'aire', sefirah: 'binah',
    keywords: ['dolor', 'tristeza', 'traición'],
    upright: 'Pena, separación, corazón roto',
    reversed: 'Recuperación del dolor, liberación',
    therapeuticTheme: 'Sanar el dolor emocional profundo',
    bodyCorrespondence: ['heart', 'chest'],
  },
  {
    id: 'four_swords', number: 4, name: 'Four of Swords', spanishName: 'Cuatro de Espadas',
    type: 'arcano_menor', suit: 'espadas', element: 'aire', sefirah: 'chesed',
    keywords: ['descanso', 'recuperación', 'contemplación'],
    upright: 'Reposo, restauración, meditación',
    reversed: 'Inquietud, agotamiento, regreso a la acción',
    therapeuticTheme: 'El valor del descanso',
    bodyCorrespondence: ['head', 'nervous-system'],
  },
  {
    id: 'five_swords', number: 5, name: 'Five of Swords', spanishName: 'Cinco de Espadas',
    type: 'arcano_menor', suit: 'espadas', element: 'aire', sefirah: 'gevurah',
    keywords: ['conflicto', 'derrota', 'deshonra'],
    upright: 'Conflicto, victoria vacía, pérdida',
    reversed: 'Reconciliación, rendición del ego',
    therapeuticTheme: 'Conflictos y sus consecuencias',
    bodyCorrespondence: ['shoulders', 'jaw'],
  },
  {
    id: 'six_swords', number: 6, name: 'Six of Swords', spanishName: 'Seis de Espadas',
    type: 'arcano_menor', suit: 'espadas', element: 'aire', sefirah: 'tiferet',
    keywords: ['transición', 'calma', 'alejarse'],
    upright: 'Transición, alejarse de la tormenta, sanación',
    reversed: 'Resistencia al cambio, resentimiento',
    therapeuticTheme: 'Transiciones vitales y duelo',
    bodyCorrespondence: ['legs', 'lungs'],
  },
  {
    id: 'seven_swords', number: 7, name: 'Seven of Swords', spanishName: 'Siete de Espadas',
    type: 'arcano_menor', suit: 'espadas', element: 'aire', sefirah: 'netzach',
    keywords: ['engaño', 'estrategia', 'evasión'],
    upright: 'Engaño, deshonestidad, actuar solo',
    reversed: 'Confesión, conciencia, deshonestidad descubierta',
    therapeuticTheme: 'Honestidad y autenticidad',
    bodyCorrespondence: ['throat', 'head'],
  },
  {
    id: 'eight_swords', number: 8, name: 'Eight of Swords', spanishName: 'Ocho de Espadas',
    type: 'arcano_menor', suit: 'espadas', element: 'aire', sefirah: 'hod',
    keywords: ['restricción', 'victimismo', 'autoimprisión'],
    upright: 'Sentirse atrapado, limitaciones autoimpuestas',
    reversed: 'Liberación, empowerment, nueva perspectiva',
    therapeuticTheme: 'Creencias limitantes y liberación',
    bodyCorrespondence: ['throat', 'shoulders'],
  },
  {
    id: 'nine_swords', number: 9, name: 'Nine of Swords', spanishName: 'Nueve de Espadas',
    type: 'arcano_menor', suit: 'espadas', element: 'aire', sefirah: 'yesod',
    keywords: ['ansiedad', 'pesadillas', 'miedo'],
    upright: 'Ansiedad, preocupación, catastrofismo',
    reversed: 'Esperanza, hacer frente a los miedos',
    therapeuticTheme: 'Manejo de la ansiedad y el miedo',
    bodyCorrespondence: ['head', 'nervous-system'],
  },
  {
    id: 'ten_swords', number: 10, name: 'Ten of Swords', spanishName: 'Diez de Espadas',
    type: 'arcano_menor', suit: 'espadas', element: 'aire', sefirah: 'malkuth',
    keywords: ['derrota', 'final de ciclo', 'traición'],
    upright: 'Derrota total, fin doloroso, traición',
    reversed: 'Recuperación, resurrección, punto mínimo',
    therapeuticTheme: 'Cierre de ciclos y renacimiento',
    bodyCorrespondence: ['spine', 'back'],
  },
  {
    id: 'page_swords', number: 11, name: 'Page of Swords', spanishName: 'Sota de Espadas',
    type: 'arcano_menor', suit: 'espadas', element: 'aire',
    keywords: ['curiosidad', 'comunicación', 'agilidad mental'],
    upright: 'Vigilancia, curiosidad intelectual, mensajes',
    reversed: 'Chismorreo, falta de tacto, dispersión',
    therapeuticTheme: 'Comunicación consciente',
    bodyCorrespondence: ['throat', 'head'],
  },
  {
    id: 'knight_swords', number: 12, name: 'Knight of Swords', spanishName: 'Caballo de Espadas',
    type: 'arcano_menor', suit: 'espadas', element: 'aire',
    keywords: ['acción rápida', 'ambición', 'impulsividad'],
    upright: 'Acción directa, coraje, determinación',
    reversed: 'Impulsividad, agresión, decisiones apresuradas',
    therapeuticTheme: 'Acción con discernimiento',
    bodyCorrespondence: ['head', 'shoulders'],
  },
  {
    id: 'queen_swords', number: 13, name: 'Queen of Swords', spanishName: 'Reina de Espadas',
    type: 'arcano_menor', suit: 'espadas', element: 'aire',
    keywords: ['independencia', 'mente clara', 'comunicación directa'],
    upright: 'Claridad, independencia, comunicación honesta',
    reversed: 'Frialdad, amargura, crueldad',
    therapeuticTheme: 'Claridad emocional e integridad',
    bodyCorrespondence: ['throat', 'head'],
  },
  {
    id: 'king_swords', number: 14, name: 'King of Swords', spanishName: 'Rey de Espadas',
    type: 'arcano_menor', suit: 'espadas', element: 'aire',
    keywords: ['autoridad intelectual', 'verdad', 'justicia'],
    upright: 'Intelecto, autoridad, verdad clara',
    reversed: 'Abuso de poder, manipulación, tiranía',
    therapeuticTheme: 'Liderazgo desde la integridad',
    bodyCorrespondence: ['head', 'throat'],
  },
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
  {
    id: 'two_wands', number: 2, name: 'Two of Wands', spanishName: 'Dos de Bastos',
    type: 'arcano_menor', suit: 'bastos', element: 'fuego', sefirah: 'chokmah',
    keywords: ['planificación', 'descubrimiento', 'visión futura'],
    upright: 'Planeación, expansión, mirar al futuro',
    reversed: 'Miedo al cambio, falta de planificación',
    therapeuticTheme: 'Visión y proyección vital',
    bodyCorrespondence: ['solar-plexus', 'eyes'],
  },
  {
    id: 'three_wands', number: 3, name: 'Three of Wands', spanishName: 'Tres de Bastos',
    type: 'arcano_menor', suit: 'bastos', element: 'fuego', sefirah: 'binah',
    keywords: ['expansión', 'previsión', 'oportunidades'],
    upright: 'Expansión, exploración, esfuerzo que rinde frutos',
    reversed: 'Obstáculos, retrasos, falta de previsión',
    therapeuticTheme: 'Expansión y crecimiento personal',
    bodyCorrespondence: ['spine', 'solar-plexus'],
  },
  {
    id: 'four_wands', number: 4, name: 'Four of Wands', spanishName: 'Cuatro de Bastos',
    type: 'arcano_menor', suit: 'bastos', element: 'fuego', sefirah: 'chesed',
    keywords: ['celebración', 'estabilidad', 'hogar'],
    upright: 'Celebración, cosecha, comunidad, estabilidad',
    reversed: 'Conflicto doméstico, falta de armonía',
    therapeuticTheme: 'Celebración y gratitud',
    bodyCorrespondence: ['root', 'solar-plexus'],
  },
  {
    id: 'five_wands', number: 5, name: 'Five of Wands', spanishName: 'Cinco de Bastos',
    type: 'arcano_menor', suit: 'bastos', element: 'fuego', sefirah: 'gevurah',
    keywords: ['conflicto', 'competencia', 'tensión'],
    upright: 'Conflicto, rivalidad, tensión creativa',
    reversed: 'Acuerdo, resolución, evitar conflictos',
    therapeuticTheme: 'Conflicto constructivo',
    bodyCorrespondence: ['solar-plexus', 'arms'],
  },
  {
    id: 'six_wands', number: 6, name: 'Six of Wands', spanishName: 'Seis de Bastos',
    type: 'arcano_menor', suit: 'bastos', element: 'fuego', sefirah: 'tiferet',
    keywords: ['victoria', 'reconocimiento', 'confianza'],
    upright: 'Éxito, reconocimiento público, liderazgo',
    reversed: 'Falta de reconocimiento, ego inflado',
    therapeuticTheme: 'Reconocimiento y autoestima',
    bodyCorrespondence: ['solar-plexus', 'heart'],
  },
  {
    id: 'seven_wands', number: 7, name: 'Seven of Wands', spanishName: 'Siete de Bastos',
    type: 'arcano_menor', suit: 'bastos', element: 'fuego', sefirah: 'netzach',
    keywords: ['defensa', 'perseverancia', 'reto'],
    upright: 'Desafío, coraje, mantener posición',
    reversed: 'Rendición, sentirse abrumado',
    therapeuticTheme: 'Perseverancia ante los desafíos',
    bodyCorrespondence: ['solar-plexus', 'legs'],
  },
  {
    id: 'eight_wands', number: 8, name: 'Eight of Wands', spanishName: 'Ocho de Bastos',
    type: 'arcano_menor', suit: 'bastos', element: 'fuego', sefirah: 'hod',
    keywords: ['movimiento rápido', 'acción', 'progreso'],
    upright: 'Velocidad, acción rápida, progreso',
    reversed: 'Retrasos, obstáculos, dispersión',
    therapeuticTheme: 'Energía dirigida y flujo',
    bodyCorrespondence: ['solar-plexus', 'spine'],
  },
  {
    id: 'nine_wands', number: 9, name: 'Nine of Wands', spanishName: 'Nueve de Bastos',
    type: 'arcano_menor', suit: 'bastos', element: 'fuego', sefirah: 'yesod',
    keywords: ['resiliencia', 'perseverancia', 'guardia'],
    upright: 'Resistencia, coraje, casi en la meta',
    reversed: 'Agotamiento, paranoia, rigidez',
    therapeuticTheme: 'Resiliencia y fuerza interior',
    bodyCorrespondence: ['spine', 'solar-plexus'],
  },
  {
    id: 'ten_wands', number: 10, name: 'Ten of Wands', spanishName: 'Diez de Bastos',
    type: 'arcano_menor', suit: 'bastos', element: 'fuego', sefirah: 'malkuth',
    keywords: ['carga', 'responsabilidad', 'agotamiento'],
    upright: 'Sobrecarga, demasiada responsabilidad, fatiga',
    reversed: 'Delegar, liberar cargas, alivio',
    therapeuticTheme: 'Límites y sobrecarga energética',
    bodyCorrespondence: ['spine', 'shoulders'],
  },
  {
    id: 'page_wands', number: 11, name: 'Page of Wands', spanishName: 'Sota de Bastos',
    type: 'arcano_menor', suit: 'bastos', element: 'fuego',
    keywords: ['entusiasmo', 'exploración', 'energía joven'],
    upright: 'Entusiasmo, creatividad, descubrimiento',
    reversed: 'Precipitación, falta de dirección',
    therapeuticTheme: 'Energía creativa y entusiasmo',
    bodyCorrespondence: ['solar-plexus', 'root'],
  },
  {
    id: 'knight_wands', number: 12, name: 'Knight of Wands', spanishName: 'Caballo de Bastos',
    type: 'arcano_menor', suit: 'bastos', element: 'fuego',
    keywords: ['energía', 'pasión', 'aventura'],
    upright: 'Acción audaz, energía, aventura, liderazgo',
    reversed: 'Impulsividad, arrogancia, falta de dirección',
    therapeuticTheme: 'Pasión y acción enfocada',
    bodyCorrespondence: ['solar-plexus', 'hips'],
  },
  {
    id: 'queen_wands', number: 13, name: 'Queen of Wands', spanishName: 'Reina de Bastos',
    type: 'arcano_menor', suit: 'bastos', element: 'fuego',
    keywords: ['coraje', 'determinación', 'liderazgo vibrante'],
    upright: 'Confianza, carisma, liderazgo apasionado',
    reversed: 'Inseguridad, egocentrismo, dominancia',
    therapeuticTheme: 'Liderazgo y confianza en sí misma',
    bodyCorrespondence: ['solar-plexus', 'heart'],
  },
  {
    id: 'king_wands', number: 14, name: 'King of Wands', spanishName: 'Rey de Bastos',
    type: 'arcano_menor', suit: 'bastos', element: 'fuego',
    keywords: ['visión', 'liderazgo', 'emprendimiento'],
    upright: 'Visión, liderazgo inspirador, emprendimiento',
    reversed: 'Impulsividad, arrogancia, expectativas infladas',
    therapeuticTheme: 'Visión y poder creativo masculino',
    bodyCorrespondence: ['solar-plexus', 'spine'],
  },
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
// 3. PRNG DETERMINISTA (mulberry32 + Fisher-Yates)
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

export function buildTarotSeed(consultantName: string, birthDate: string, spreadType: string): number {
  return hashStr([consultantName, birthDate, spreadType].join('|'));
}

// ---------------------------------------------------------------------------
// 4. CALCULADORA Y MOTOR DE LECTURAS
// ---------------------------------------------------------------------------

export class TarotEngine {
  /**
   * Baraja y extrae cartas usando PRNG determinista.
   * Requiere seed para cálculos simbólicos (usa buildTarotSeed).
   */
  static shuffleAndDraw(count: number, includeReversed: boolean = true, seed?: number): DrawnCard[] {
    const rng = mulberry32(seed !== undefined ? seed : hashStr(Date.now().toString()));
    const shuffled = seededShuffle(FULL_DECK, rng);
    const drawn = shuffled.slice(0, count);

    return drawn.map((card, index) => ({
      card,
      position: index + 1,
      reversed: includeReversed ? rng() > 0.5 : false,
      positionMeaning: '',
    }));
  }

  /**
   * Tirada del Árbol de la Vida
   */
  static treeOfLifeReading(seed?: number): DrawnCard[] {
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
    
    const cards = this.shuffleAndDraw(10, true, seed);
    
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