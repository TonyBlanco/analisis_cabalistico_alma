/**
 * Qliphoth Data - Las Cáscaras/Sombras del Árbol de la Vida
 * 
 * En la Cábala, cada Sefirá tiene su contraparte sombría (Qliphah).
 * Este módulo es EDUCATIVO - no diagnóstico.
 */

export interface Qliphah {
  id: string;
  hebrewName: string;
  englishName: string;
  spanishName: string;
  meaning: string;
  correspondingSefira: string;
  archetype: string;
  shadowExpression: string;
  integrationPath: string;
  keywords: string[];
  demon?: string; // Traditional attribution (educational)
  planetaryShadow?: string;
}

export const QLIPHOTH: Record<string, Qliphah> = {
  thaumiel: {
    id: 'thaumiel',
    hebrewName: 'תאומיאל',
    englishName: 'Thaumiel',
    spanishName: 'Thaumiel',
    meaning: 'Los Gemelos de Dios / Dualidad en Conflicto',
    correspondingSefira: 'keter',
    archetype: 'El Ego Dividido',
    shadowExpression: 'División interna, incapacidad de unificar, dualidad conflictiva, dos voluntades en guerra.',
    integrationPath: 'Reconocer que la dualidad aparente es parte de una unidad mayor. Trabajo de integración de opuestos internos.',
    keywords: ['dualidad', 'división', 'conflicto interno', 'ego fragmentado', 'identidad dividida'],
    demon: 'Satán/Moloch',
    planetaryShadow: 'Neptuno distorsionado',
  },
  ghagiel: {
    id: 'ghagiel',
    hebrewName: 'עוגיאל',
    englishName: 'Ghagiel',
    spanishName: 'Ghagiel',
    meaning: 'Los Obstaculizadores',
    correspondingSefira: 'chokmah',
    archetype: 'El Caos Destructivo',
    shadowExpression: 'Sabiduría usada para manipular, caos sin propósito, confusión mental, ideas destructivas.',
    integrationPath: 'Canalizar la energía creativa hacia propósitos constructivos. Ordenar el caos interno.',
    keywords: ['confusión', 'caos', 'manipulación', 'ideas obsesivas', 'paranoia'],
    demon: 'Beelzebub',
    planetaryShadow: 'Urano distorsionado',
  },
  satariel: {
    id: 'satariel',
    hebrewName: 'סתריאל',
    englishName: 'Satariel',
    spanishName: 'Satariel',
    meaning: 'Los Ocultadores',
    correspondingSefira: 'binah',
    archetype: 'El Velo de Ignorancia',
    shadowExpression: 'Ocultamiento de la verdad, negación, incapacidad de ver claramente, secretos destructivos.',
    integrationPath: 'Desarrollar el coraje para ver la verdad. Iluminar lo que está oculto con compasión.',
    keywords: ['negación', 'ocultamiento', 'ceguera', 'secretos', 'autoengaño'],
    demon: 'Lucifuge',
    planetaryShadow: 'Saturno distorsionado',
  },
  gamchicoth: {
    id: 'gamchicoth',
    hebrewName: 'גמכיכות',
    englishName: 'Gamchicoth',
    spanishName: 'Gamchicoth',
    meaning: 'Los Devoradores',
    correspondingSefira: 'chesed',
    archetype: 'La Generosidad Devoradora',
    shadowExpression: 'Dar para controlar, generosidad con expectativas, amor posesivo, absorción del otro.',
    integrationPath: 'Aprender a dar sin expectativas. Desarrollar amor incondicional verdadero.',
    keywords: ['posesividad', 'control', 'dependencia', 'codependencia', 'absorción'],
    demon: 'Astaroth',
    planetaryShadow: 'Júpiter distorsionado',
  },
  golachab: {
    id: 'golachab',
    hebrewName: 'גולכב',
    englishName: 'Golachab',
    spanishName: 'Golachab',
    meaning: 'Los Incendiarios',
    correspondingSefira: 'gevurah',
    archetype: 'La Ira Destructiva',
    shadowExpression: 'Crueldad, violencia, ira descontrolada, juicio despiadado, destrucción sin propósito.',
    integrationPath: 'Transformar la ira en acción justa. Desarrollar fuerza con compasión.',
    keywords: ['ira', 'crueldad', 'violencia', 'juicio', 'destrucción'],
    demon: 'Asmodeus',
    planetaryShadow: 'Marte distorsionado',
  },
  thagirion: {
    id: 'thagirion',
    hebrewName: 'תגריון',
    englishName: 'Thagirion',
    spanishName: 'Thagirion',
    meaning: 'Los Disputadores',
    correspondingSefira: 'tiferet',
    archetype: 'La Belleza Corrupta',
    shadowExpression: 'Vanidad, narcisismo, belleza superficial, ego inflado, falsa armonía.',
    integrationPath: 'Desarrollar belleza interior genuina. Encontrar el centro verdadero más allá del ego.',
    keywords: ['vanidad', 'narcisismo', 'superficialidad', 'ego', 'falsedad'],
    demon: 'Belphegor',
    planetaryShadow: 'Sol distorsionado',
  },
  arab_zaraq: {
    id: 'arab_zaraq',
    hebrewName: 'ערב זרק',
    englishName: "A'arab Zaraq",
    spanishName: 'Arav Zaraq',
    meaning: 'Los Cuervos de Dispersión',
    correspondingSefira: 'netzach',
    archetype: 'El Deseo Insaciable',
    shadowExpression: 'Lujuria, adicción, deseos descontrolados, búsqueda compulsiva de placer, dispersión emocional.',
    integrationPath: 'Canalizar la pasión hacia el amor verdadero. Transmutar deseo en devoción.',
    keywords: ['lujuria', 'adicción', 'deseo', 'compulsión', 'dispersión'],
    demon: 'Baal',
    planetaryShadow: 'Venus distorsionada',
  },
  samael: {
    id: 'samael',
    hebrewName: 'סמאל',
    englishName: 'Samael',
    spanishName: 'Samael',
    meaning: 'Veneno de Dios',
    correspondingSefira: 'hod',
    archetype: 'El Intelecto Venenoso',
    shadowExpression: 'Mentira, engaño intelectual, racionalización del mal, pensamiento tóxico, cinismo.',
    integrationPath: 'Usar el intelecto al servicio de la verdad. Desarrollar discernimiento honesto.',
    keywords: ['mentira', 'engaño', 'cinismo', 'racionalización', 'toxicidad mental'],
    demon: 'Adrammelech',
    planetaryShadow: 'Mercurio distorsionado',
  },
  gamaliel: {
    id: 'gamaliel',
    hebrewName: 'גמליאל',
    englishName: 'Gamaliel',
    spanishName: 'Gamaliel',
    meaning: 'Los Obscenos',
    correspondingSefira: 'yesod',
    archetype: 'El Fundamento Corrompido',
    shadowExpression: 'Instintos desviados, sexualidad distorsionada, sueños perturbadores, fundamentos falsos.',
    integrationPath: 'Purificar los fundamentos del ser. Integrar la sexualidad de forma sagrada.',
    keywords: ['instintos', 'sexualidad', 'sueños oscuros', 'perversión', 'corrupción'],
    demon: 'Lilith',
    planetaryShadow: 'Luna distorsionada',
  },
  lilith: {
    id: 'lilith',
    hebrewName: 'לילית',
    englishName: 'Lilith',
    spanishName: 'Lilith',
    meaning: 'Reina de la Noche',
    correspondingSefira: 'malkuth',
    archetype: 'El Mundo Material Corrupto',
    shadowExpression: 'Materialismo excesivo, desconexión de lo espiritual, inercia, estancamiento en lo mundano.',
    integrationPath: 'Sacralizar la vida cotidiana. Encontrar lo divino en lo material.',
    keywords: ['materialismo', 'inercia', 'desconexión', 'estancamiento', 'mundanidad'],
    demon: 'Nahemah',
    planetaryShadow: 'Tierra distorsionada',
  },
};

// Mapping from Sefira ID to Qliphah
export const SEFIRA_TO_QLIPHAH: Record<string, string> = {
  keter: 'thaumiel',
  chokmah: 'ghagiel',
  binah: 'satariel',
  chesed: 'gamchicoth',
  gevurah: 'golachab',
  tiferet: 'thagirion',
  netzach: 'arab_zaraq',
  hod: 'samael',
  yesod: 'gamaliel',
  malkuth: 'lilith',
};

export function getQliphahForSefira(sefiraId: string): Qliphah | null {
  const qliphahId = SEFIRA_TO_QLIPHAH[sefiraId.toLowerCase()];
  return qliphahId ? QLIPHOTH[qliphahId] : null;
}
