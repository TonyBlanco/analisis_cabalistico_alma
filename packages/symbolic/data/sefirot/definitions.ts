export type SefiraId =
  | 'keter' | 'chokmah' | 'binah'
  | 'chesed' | 'gevurah' | 'tiferet'
  | 'netzach' | 'hod' | 'yesod' | 'malchut';

export interface SefiraDefinition {
  id: SefiraId;
  name: string;
  hebrew?: string;
  essence: string;
}

export const SEFIROT_DEFINITIONS: SefiraDefinition[] = [
  {
    id: 'keter',
    name: 'Keter',
    essence: 'Keter es la Corona de la Vida. Representa la conexi¢n directa con la fuente divina, el Padre celestial, la conciencia c¢smica. Es el retorno al origen.'
  },
  {
    id: 'chokmah',
    name: 'Jokhmah',
    essence: 'Jokhmah es el B£ho de la sabidur¡a. La biblioteca c¢smica, el conocimiento intuitivo, las epifan¡as y los chispazos de conciencia.'
  },
  {
    id: 'binah',
    name: 'Binah',
    essence: 'Binah es el Espejo que da forma. La Gran Madre C¢smica que convierte la sabidur¡a en acci¢n creativa y f‚rtil.'
  },
  {
    id: 'chesed',
    name: 'Jesed',
    essence: 'Jesed es el Coraz¢n divino. Representa entregar tu vida a tu vocaci¢n verdadera, ser co-creador con Dios y servir a la humanidad.'
  },
  {
    id: 'gevurah',
    name: 'Guevurah',
    essence: 'Guevurah es la Espada de la verdad. El poder espiritual ejercido con impecabilidad, la fuerza para vivir tu verdad con valent¡a.'
  },
  {
    id: 'tiferet',
    name: 'Tiferet',
    essence: 'Tiferet es el Sol radiante, el centro del Arbol. Tu identidad verdadera, el Cristo interno, el Alma reconoci‚ndose a s¡ misma.'
  },
  {
    id: 'netzach',
    name: 'Netsaj',
    essence: 'Netsaj es la Rosa de la armon¡a. Santificar las emociones, vivir en coherencia con tu prop¢sito para alcanzar la paz interior.'
  },
  {
    id: 'hod',
    name: 'Hod',
    essence: 'Hod son los Pies Alados de Hermes. La inteligencia al servicio del bien com£n, trabajar por la humanidad con ‚tica e impecabilidad.'
  },
  {
    id: 'yesod',
    name: 'Yesod',
    essence: 'Yesod es la Luna del subconsciente. El ego como maestro, las creencias del inconsciente que deben ser sanadas y purificadas.'
  },
  {
    id: 'malchut',
    name: 'Malkuth',
    essence: 'Malkuth es la Tierra, el Reino manifestado. La materia como escuela de evoluci¢n, donde el esp¡ritu se hace carne para crecer.'
  }
];
