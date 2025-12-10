/**
 * Traducciones al español y meditaciones de los 72 Ángeles
 * Sistema completo de contenido en español
 */

export interface AngelTranslation {
  name: {
    he: string;
    en: string;
    es: string;
  };
  attribute: {
    en: string;
    es: string;
  };
  description: {
    es: string;
  };
  meditation: {
    es: string;
  };
  invocation: {
    es: string;
  };
  qualities: string[];
  audioUrl?: string;
}

export const ANGELS_SPANISH: Record<string, AngelTranslation> = {
  'Vehuiah': {
    name: {
      he: 'והויה',
      en: 'Vehuiah',
      es: 'Vehuiah'
    },
    attribute: {
      en: 'God is High and Exalted above all things.',
      es: 'Dios Altísimo y Exaltado sobre todas las cosas'
    },
    description: {
      es: 'Vehuiah es el primer ángel del Shem ha-Mephorash, perteneciente al coro de los Serafines. Gobierna los primeros rayos del Este en primavera. Este genio protege a quienes nacen bajo su influencia con gran sagacidad, pasión por las ciencias y las artes, capaz de emprender las cosas más difíciles. Otorga energía de acción y protección contra el fuego. Ayuda a iluminarse con el espíritu de Dios.'
    },
    meditation: {
      es: 'Cierro mis ojos y visualizo una luz dorada descendiendo desde el cielo. Respiro profundamente tres veces. Pronuncio mentalmente: Vehuiah (Ve-hu-iah). Siento cómo la energía divina llena mi coronilla, despertando mi sabiduría interior. "Soy uno con la Luz Suprema. Mi voluntad se alinea con lo Divino. Tengo el poder de comenzar, de crear, de manifestar." Permanezco en silencio, sintiendo la presencia del ángel durante 3-5 minutos.'
    },
    invocation: {
      es: 'Vehuiah, primer nombre sagrado, te invoco en este momento de necesidad. Ilumina mi mente con tu sabiduría divina. Dame la fuerza para comenzar nuevos proyectos y la claridad para ver el camino. Protégeme del fuego de la ira y enciende en mí el fuego de la inspiración. Que tu luz guíe cada uno de mis pasos. Amén.'
    },
    qualities: ['Sabiduría', 'Iluminación', 'Voluntad divina', 'Nuevos comienzos', 'Energía creadora'],
    audioUrl: '/audio/angels/vehuiah.mp3'
  },
  'Jeliel': {
    name: {
      he: 'יליאל',
      en: 'Jeliel',
      es: 'Jeliel'
    },
    attribute: {
      en: 'Helpful God',
      es: 'Dios Bondadoso'
    },
    description: {
      es: 'Jeliel es el segundo ángel, también del orden de los Serafines. Se invoca para apaciguar sediciones y obtener victoria sobre quienes nos atacan injustamente. Domina sobre reyes y príncipes, mantiene a los súbditos en obediencia. Influye en la generación de todos los seres del reino animal. Restaura la paz entre esposos y la fidelidad conyugal. Quienes nacen bajo su influencia tienen espíritu alegre, modales agradables y galantes.'
    },
    meditation: {
      es: 'Me siento en un lugar tranquilo. Respiro en calma y repito: Jeliel (Ye-li-el). Visualizo una luz verde esmeralda rodeando mi corazón. Esta luz disuelve conflictos, calma las aguas turbulentas de las relaciones. "Soy un canal de paz. Donde hay discordia, llevo armonía. Mi presencia calma y reconcilia." Permito que la energía de Jeliel suavice las tensiones en mi vida.'
    },
    invocation: {
      es: 'Jeliel, ángel de la paz y la justicia, acudo a ti en busca de armonía. Calma las tormentas en mis relaciones. Dame la sabiduría para resolver conflictos con amor. Restaura la fidelidad donde ha sido rota. Que tu influencia traiga alegría a mi espíritu y gracia a mis acciones. Bendice mis vínculos con paz duradera. Amén.'
    },
    qualities: ['Paz', 'Armonía', 'Justicia', 'Fidelidad', 'Alegría'],
    audioUrl: '/audio/angels/jeliel.mp3'
  },
  'Sitael': {
    name: {
      he: 'סיטאל',
      en: 'Sitael',
      es: 'Sitael'
    },
    attribute: {
      en: 'God, the hope of all creatures.',
      es: 'Dios, esperanza de todas las criaturas'
    },
    description: {
      es: 'Sitael es el tercer ángel, del coro de los Serafines bajo la influencia del Sol. Se invoca contra las adversidades. Domina sobre la nobleza, magnanimidad y grandes empresas. Protege contra armas y bestias feroces. Quien nace bajo su influencia ama la verdad, cumple su palabra y es feliz ayudando a quienes necesitan sus servicios.'
    },
    meditation: {
      es: 'Respiro hondo y pronuncio: Sitael (Si-ta-el). Visualizo un sol dorado brillando en mi plexo solar. Esta luz solar disuelve la oscuridad de la desesperanza. "Soy portador de esperanza. Mi palabra es mi poder. La verdad me hace libre y mi generosidad me eleva." Siento cómo la nobleza de espíritu crece en mi interior con cada respiración.'
    },
    invocation: {
      es: 'Sitael, esperanza divina de todas las criaturas, te llamo en este momento. Protégeme de las adversidades que acechan mi camino. Dame magnanimidad ante los desafíos. Fortalece mi integridad y mi palabra. Que mi vida sea un reflejo de la nobleza del espíritu. Ayúdame a ser luz para otros en sus momentos oscuros. Amén.'
    },
    qualities: ['Esperanza', 'Nobleza', 'Verdad', 'Magnanimidad', 'Protección'],
    audioUrl: '/audio/angels/sitael.mp3'
  }
};

// Funciones auxiliares
export function getAngelSpanish(angelName: string): AngelTranslation | undefined {
  return ANGELS_SPANISH[angelName];
}

export function getAngelMeditation(angelName: string, language: 'es' | 'en' = 'es'): string {
  const angel = ANGELS_SPANISH[angelName];
  if (!angel) return '';
  return language === 'es' ? angel.meditation.es : '';
}

export function getAngelInvocation(angelName: string, language: 'es' | 'en' = 'es'): string {
  const angel = ANGELS_SPANISH[angelName];
  if (!angel) return '';
  return language === 'es' ? angel.invocation.es : '';
}

export function getAngelDescription(angelName: string, language: 'es' | 'en' = 'es'): string {
  const angel = ANGELS_SPANISH[angelName];
  if (!angel) return '';
  return language === 'es' ? angel.description.es : '';
}
