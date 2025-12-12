/**
 * Los 22 Arcanos Mayores del Tarot y sus correspondencias con los Senderos del Árbol de la Vida
 * Basado en la tradición cabalística: cada sendero conecta dos Sefirot
 */

export interface TarotArcana {
  number: number;
  name: string;
  nameEs: string;
  hebrewLetter: string;
  sefirot: {
    from: string;
    fromName: string;
    to: string;
    toName: string;
  };
  meaning: string;
  therapeuticMessage: string;
  meditation: string;
  color: string;
}

export const TAROT_ARCANA: TarotArcana[] = [
  {
    number: 0,
    name: 'The Fool',
    nameEs: 'El Loco',
    hebrewLetter: 'א',
    sefirot: {
      from: 'Keter',
      fromName: 'Corona',
      to: 'Chokmah',
      toName: 'Sabiduría'
    },
    meaning: 'El inicio del viaje. Inocencia, potencial puro, salto de fe.',
    therapeuticMessage: 'Necesitas dar un salto de fe. Confía en el proceso y deja atrás el miedo al cambio.',
    meditation: 'Visualiza un nuevo comienzo. Respira y confía en que el universo te guiará.',
    color: 'yellow'
  },
  {
    number: 1,
    name: 'The Magician',
    nameEs: 'El Mago',
    hebrewLetter: 'ב',
    sefirot: {
      from: 'Keter',
      fromName: 'Corona',
      to: 'Binah',
      toName: 'Entendimiento'
    },
    meaning: 'Voluntad manifestada. Concentración, poder personal, acción consciente.',
    therapeuticMessage: 'Tienes todas las herramientas. Es momento de actuar con intención clara.',
    meditation: 'Conecta con tu poder personal. Visualiza tus herramientas y úsalas con propósito.',
    color: 'red'
  },
  {
    number: 2,
    name: 'The High Priestess',
    nameEs: 'La Sacerdotisa',
    hebrewLetter: 'ג',
    sefirot: {
      from: 'Keter',
      fromName: 'Corona',
      to: 'Tiferet',
      toName: 'Belleza'
    },
    meaning: 'Intuición, misterio, sabiduría oculta. El inconsciente y los secretos.',
    therapeuticMessage: 'Escucha tu voz interior. La respuesta está en tu intuición, no en la lógica.',
    meditation: 'Sumérgete en el silencio. Deja que la sabiduría interior se revele.',
    color: 'blue'
  },
  {
    number: 3,
    name: 'The Empress',
    nameEs: 'La Emperatriz',
    hebrewLetter: 'ד',
    sefirot: {
      from: 'Chokmah',
      fromName: 'Sabiduría',
      to: 'Binah',
      toName: 'Entendimiento'
    },
    meaning: 'Fertilidad, abundancia, naturaleza, creatividad. La Madre Divina.',
    therapeuticMessage: 'Nutre tu creatividad. Conecta con la naturaleza y permite que la abundancia fluya.',
    meditation: 'Siente la fertilidad de la tierra. Permite que tus proyectos crezcan y florezcan.',
    color: 'green'
  },
  {
    number: 4,
    name: 'The Emperor',
    nameEs: 'El Emperador',
    hebrewLetter: 'ה',
    sefirot: {
      from: 'Chokmah',
      fromName: 'Sabiduría',
      to: 'Tiferet',
      toName: 'Belleza'
    },
    meaning: 'Autoridad, estructura, orden, disciplina. El Padre Divino.',
    therapeuticMessage: 'Establece límites claros. La estructura y el orden te darán estabilidad.',
    meditation: 'Visualiza una estructura sólida. Construye los cimientos de tu vida con disciplina.',
    color: 'red'
  },
  {
    number: 5,
    name: 'The Hierophant',
    nameEs: 'El Hierofante',
    hebrewLetter: 'ו',
    sefirot: {
      from: 'Chokmah',
      fromName: 'Sabiduría',
      to: 'Chesed',
      toName: 'Misericordia'
    },
    meaning: 'Tradición, enseñanza, guía espiritual, conformidad.',
    therapeuticMessage: 'Busca un mentor o guía. Las tradiciones y enseñanzas te ayudarán a crecer.',
    meditation: 'Conecta con la sabiduría ancestral. Aprende de quienes han caminado antes que tú.',
    color: 'brown'
  },
  {
    number: 6,
    name: 'The Lovers',
    nameEs: 'Los Enamorados',
    hebrewLetter: 'ז',
    sefirot: {
      from: 'Binah',
      fromName: 'Entendimiento',
      to: 'Tiferet',
      toName: 'Belleza'
    },
    meaning: 'Amor, unión, elección, armonía. La integración de opuestos.',
    therapeuticMessage: 'Toma decisiones desde el corazón. El amor une los opuestos en armonía.',
    meditation: 'Visualiza la unión de los opuestos. Elige desde el amor, no desde el miedo.',
    color: 'pink'
  },
  {
    number: 7,
    name: 'The Chariot',
    nameEs: 'El Carro',
    hebrewLetter: 'ח',
    sefirot: {
      from: 'Binah',
      fromName: 'Entendimiento',
      to: 'Gevurah',
      toName: 'Severidad'
    },
    meaning: 'Victoria, control, determinación, voluntad dirigida.',
    therapeuticMessage: 'Mantén el control de tus emociones. La determinación te llevará a la victoria.',
    meditation: 'Visualiza un carro triunfante. Dirige tu voluntad hacia tu objetivo con determinación.',
    color: 'blue'
  },
  {
    number: 8,
    name: 'Strength',
    nameEs: 'La Fuerza',
    hebrewLetter: 'ט',
    sefirot: {
      from: 'Chesed',
      fromName: 'Misericordia',
      to: 'Gevurah',
      toName: 'Severidad'
    },
    meaning: 'Fuerza interior, paciencia, compasión, control suave.',
    therapeuticMessage: 'Tu fuerza viene de la compasión, no de la agresión. Sé paciente contigo mismo.',
    meditation: 'Siente la fuerza suave en tu interior. La verdadera fuerza es la compasión.',
    color: 'green'
  },
  {
    number: 9,
    name: 'The Hermit',
    nameEs: 'El Ermitaño',
    hebrewLetter: 'י',
    sefirot: {
      from: 'Chesed',
      fromName: 'Misericordia',
      to: 'Tiferet',
      toName: 'Belleza'
    },
    meaning: 'Búsqueda interior, guía, introspección, sabiduría solitaria.',
    therapeuticMessage: 'Tómate tiempo para la introspección. La respuesta está dentro de ti.',
    meditation: 'Retírate a tu interior. Busca la luz de tu propia sabiduría.',
    color: 'yellow'
  },
  {
    number: 10,
    name: 'Wheel of Fortune',
    nameEs: 'La Rueda de la Fortuna',
    hebrewLetter: 'כ',
    sefirot: {
      from: 'Chesed',
      fromName: 'Misericordia',
      to: 'Netzach',
      toName: 'Victoria'
    },
    meaning: 'Ciclos, destino, cambio, karma. El giro del destino.',
    therapeuticMessage: 'Acepta los ciclos de la vida. Todo cambia, y eso es parte del proceso.',
    meditation: 'Visualiza la rueda girando. Acepta que todo es cíclico y temporal.',
    color: 'purple'
  },
  {
    number: 11,
    name: 'Justice',
    nameEs: 'La Justicia',
    hebrewLetter: 'ל',
    sefirot: {
      from: 'Gevurah',
      fromName: 'Severidad',
      to: 'Tiferet',
      toName: 'Belleza'
    },
    meaning: 'Equilibrio, justicia, verdad, karma. Causa y efecto.',
    therapeuticMessage: 'Busca el equilibrio. Tus acciones tienen consecuencias, actúa con justicia.',
    meditation: 'Visualiza la balanza de la justicia. Equilibra tus acciones con tus valores.',
    color: 'green'
  },
  {
    number: 12,
    name: 'The Hanged Man',
    nameEs: 'El Colgado',
    hebrewLetter: 'מ',
    sefirot: {
      from: 'Gevurah',
      fromName: 'Severidad',
      to: 'Hod',
      toName: 'Gloria'
    },
    meaning: 'Sacrificio, renuncia, nueva perspectiva, suspensión.',
    therapeuticMessage: 'A veces necesitas soltar para avanzar. Una nueva perspectiva está llegando.',
    meditation: 'Suspende tu juicio. Mira las cosas desde un ángulo completamente nuevo.',
    color: 'blue'
  },
  {
    number: 13,
    name: 'Death',
    nameEs: 'La Muerte',
    hebrewLetter: 'נ',
    sefirot: {
      from: 'Tiferet',
      fromName: 'Belleza',
      to: 'Netzach',
      toName: 'Victoria'
    },
    meaning: 'Transformación, fin de ciclos, renacimiento, cambio inevitable.',
    therapeuticMessage: 'Deja morir lo que ya no te sirve. La transformación es necesaria para renacer.',
    meditation: 'Acepta el fin de un ciclo. Visualiza el renacimiento que viene después.',
    color: 'black'
  },
  {
    number: 14,
    name: 'Temperance',
    nameEs: 'La Templanza',
    hebrewLetter: 'ס',
    sefirot: {
      from: 'Tiferet',
      fromName: 'Belleza',
      to: 'Yesod',
      toName: 'Fundamento'
    },
    meaning: 'Moderación, equilibrio, mezcla, paciencia.',
    therapeuticMessage: 'Encuentra el equilibrio. La moderación y la paciencia te llevarán lejos.',
    meditation: 'Visualiza la mezcla perfecta. Equilibra los opuestos con paciencia.',
    color: 'blue'
  },
  {
    number: 15,
    name: 'The Devil',
    nameEs: 'El Diablo',
    hebrewLetter: 'ע',
    sefirot: {
      from: 'Tiferet',
      fromName: 'Belleza',
      to: 'Hod',
      toName: 'Gloria'
    },
    meaning: 'Atadura, materialismo, adicción, ilusión. Las cadenas que nos atan.',
    therapeuticMessage: 'Reconoce tus ataduras. Las cadenas son ilusorias, puedes liberarte.',
    meditation: 'Identifica tus ataduras. Visualiza cómo te liberas de ellas.',
    color: 'red'
  },
  {
    number: 16,
    name: 'The Tower',
    nameEs: 'La Torre',
    hebrewLetter: 'פ',
    sefirot: {
      from: 'Netzach',
      fromName: 'Victoria',
      to: 'Hod',
      toName: 'Gloria'
    },
    meaning: 'Destrucción, revelación, caída, iluminación repentina.',
    therapeuticMessage: 'A veces todo debe caer para reconstruir. La destrucción trae revelación.',
    meditation: 'Acepta la caída. Visualiza la reconstrucción sobre cimientos más sólidos.',
    color: 'red'
  },
  {
    number: 17,
    name: 'The Star',
    nameEs: 'La Estrella',
    hebrewLetter: 'צ',
    sefirot: {
      from: 'Netzach',
      fromName: 'Victoria',
      to: 'Yesod',
      toName: 'Fundamento'
    },
    meaning: 'Esperanza, inspiración, guía, sanación. La luz después de la tormenta.',
    therapeuticMessage: 'Mantén la esperanza. La luz de las estrellas te guía en la oscuridad.',
    meditation: 'Visualiza la estrella brillante. Deja que su luz te inspire y sane.',
    color: 'blue'
  },
  {
    number: 18,
    name: 'The Moon',
    nameEs: 'La Luna',
    hebrewLetter: 'ק',
    sefirot: {
      from: 'Netzach',
      fromName: 'Victoria',
      to: 'Malkuth',
      toName: 'Reino'
    },
    meaning: 'Ilusión, miedo, inconsciente, intuición. El lado oculto de la mente.',
    therapeuticMessage: 'Reconoce tus miedos. La luna ilumina lo que está oculto en tu inconsciente.',
    meditation: 'Mira bajo la luz de la luna. Confronta tus miedos y transforma las ilusiones.',
    color: 'silver'
  },
  {
    number: 19,
    name: 'The Sun',
    nameEs: 'El Sol',
    hebrewLetter: 'ר',
    sefirot: {
      from: 'Hod',
      fromName: 'Gloria',
      to: 'Yesod',
      toName: 'Fundamento'
    },
    meaning: 'Alegría, vitalidad, éxito, iluminación. La luz del día.',
    therapeuticMessage: 'Celebra tu éxito. La alegría y la vitalidad están contigo.',
    meditation: 'Báñate en la luz del sol. Siente la alegría y la vitalidad en cada célula.',
    color: 'yellow'
  },
  {
    number: 20,
    name: 'Judgement',
    nameEs: 'El Juicio',
    hebrewLetter: 'ש',
    sefirot: {
      from: 'Hod',
      fromName: 'Gloria',
      to: 'Malkuth',
      toName: 'Reino'
    },
    meaning: 'Renacimiento, evaluación, llamado, despertar. El despertar de la conciencia.',
    therapeuticMessage: 'Es momento de evaluar y renacer. Responde al llamado de tu alma.',
    meditation: 'Escucha el llamado. Visualiza tu renacimiento y despertar.',
    color: 'gold'
  },
  {
    number: 21,
    name: 'The World',
    nameEs: 'El Mundo',
    hebrewLetter: 'ת',
    sefirot: {
      from: 'Yesod',
      fromName: 'Fundamento',
      to: 'Malkuth',
      toName: 'Reino'
    },
    meaning: 'Completitud, realización, integración, éxito total. El fin del viaje.',
    therapeuticMessage: 'Has completado el ciclo. La integración y realización están aquí.',
    meditation: 'Visualiza la completitud. Siente la integración de todos los aspectos de tu ser.',
    color: 'rainbow'
  }
];

/**
 * Encuentra un arcano por su número
 */
export function getArcanaByNumber(number: number): TarotArcana | undefined {
  return TAROT_ARCANA.find(arcana => arcana.number === number);
}

/**
 * Encuentra un arcano por su letra hebrea
 */
export function getArcanaByHebrewLetter(letter: string): TarotArcana | undefined {
  return TAROT_ARCANA.find(arcana => arcana.hebrewLetter === letter);
}

/**
 * Encuentra un arcano por el sendero entre dos Sefirot
 */
export function getArcanaByPath(from: string, to: string): TarotArcana | undefined {
  return TAROT_ARCANA.find(arcana => 
    (arcana.sefirot.from === from && arcana.sefirot.to === to) ||
    (arcana.sefirot.from === to && arcana.sefirot.to === from)
  );
}

