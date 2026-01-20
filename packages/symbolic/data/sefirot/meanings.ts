import type { SefiraId } from './definitions';

export interface SefiraMeaning {
  id: SefiraId;
  light: string;
  shadow: string;
  tikkun: string;
}

export const SEFIROT_MEANINGS: SefiraMeaning[] = [
  {
    id: 'keter',
    light: 'Uni¢n con Dios, conexi¢n divina, fe absoluta, conciencia pura.',
    shadow: 'Negar a Dios, falta de fe, desamparo, soberbia espiritual.',
    tikkun: '"YO VENZO - YO SOY UNO"'
  },
  {
    id: 'chokmah',
    light: 'Sabidur¡a infinita, intuici¢n superior, revelaci¢n, certeza.',
    shadow: 'Rigidez mental, dogmatismo, control mental, fanatismo.',
    tikkun: '"YO S - YO CONFIO"'
  },
  {
    id: 'binah',
    light: 'Fertilidad activa, creatividad, compartir dones, positividad.',
    shadow: 'Bloqueo mental, negatividad, incapacidad de dar.',
    tikkun: '"YO ENTIENDO - YO DOY"'
  },
  {
    id: 'chesed',
    light: 'Amor incondicional, vocaci¢n, servicio, misericordia.',
    shadow: 'Autoridad mal ejercida, dogmatismo, hipocres¡a.',
    tikkun: '"YO AMO - YO SIRVO"'
  },
  {
    id: 'gevurah',
    light: 'Poder consciente, valent¡a, compromiso, rigor ‚tico.',
    shadow: 'Abuso de poder, ira, violencia, cobard¡a.',
    tikkun: '"YO PUEDO - YO REALIZO"'
  },
  {
    id: 'tiferet',
    light: 'Autoestima suprema, autorreconocimiento, identidad verdadera.',
    shadow: 'Crisis de identidad, baja autoestima, vivir una mentira.',
    tikkun: '"YO ME AMO - YO SOY"'
  },
  {
    id: 'netzach',
    light: 'Paz interior, armon¡a, salud emocional, prop¢sito.',
    shadow: 'Miedos, carencias, emociones tempestuosas.',
    tikkun: '"YO ME SANO - YO ME ARMONIZO"'
  },
  {
    id: 'hod',
    light: 'Inteligencia iluminada, servicio humanitario, ‚tica.',
    shadow: 'Ego¡smo, buscar poder, materialismo, injusticia.',
    tikkun: '"YO ME MUESTRO"'
  },
  {
    id: 'yesod',
    light: 'Ego santificado, subconsciente limpio, personalidad iluminada.',
    shadow: 'Ego cristalizado, creencias err¢neas, m scaras.',
    tikkun: '"YO ME FERTILIZO"'
  },
  {
    id: 'malchut',
    light: 'Evoluci¢n consciente, materia como medio, enraizamiento.',
    shadow: 'Negar evoluci¢n, zona de confort, negligencia.',
    tikkun: '"YO EVOLUCIONO - YO ME REALIZO"'
  }
];
