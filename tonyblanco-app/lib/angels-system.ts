/**
 * Sistema de los 72 Ángeles de la Cábala
 * Basado en el Shem ha-Mephorash (Nombre de 72 letras)
 */

export interface Angel {
  name: {
    he: string;
    en: string;
  };
  attribute: {
    en: string;
    es?: string;
  };
  godName: string;
  angelicOrderId: string;
  presidesOver: [number, number][]; // [mes, día]
  text: {
    en: string;
    es?: string;
  };
}

export interface AngelicOrder {
  id: string;
  name: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  choir: number; // 1-9
}

// Órdenes Angélicas según la jerarquía celestial
export const ANGELIC_ORDERS: Record<string, AngelicOrder> = {
  seraphim: {
    id: 'seraphim',
    name: { en: 'Seraphim', es: 'Serafines' },
    description: {
      en: 'The highest order, closest to God, burning with divine love',
      es: 'El orden más elevado, cercano a Dios, ardiendo en amor divino'
    },
    choir: 1
  },
  cherubim: {
    id: 'cherubim',
    name: { en: 'Cherubim', es: 'Querubines' },
    description: {
      en: 'Guardians of divine wisdom and light',
      es: 'Guardianes de la sabiduría divina y la luz'
    },
    choir: 2
  },
  thrones: {
    id: 'thrones',
    name: { en: 'Thrones', es: 'Tronos' },
    description: {
      en: 'Living symbols of divine justice and authority',
      es: 'Símbolos vivientes de la justicia y autoridad divina'
    },
    choir: 3
  },
  dominions: {
    id: 'dominions',
    name: { en: 'Dominions', es: 'Dominaciones' },
    description: {
      en: 'Regulate the duties of lower angels',
      es: 'Regulan los deberes de los ángeles inferiores'
    },
    choir: 4
  },
  virtues: {
    id: 'virtues',
    name: { en: 'Virtues', es: 'Virtudes' },
    description: {
      en: 'Bestow grace and valor, govern nature',
      es: 'Otorgan gracia y valor, gobiernan la naturaleza'
    },
    choir: 5
  },
  powers: {
    id: 'powers',
    name: { en: 'Powers', es: 'Potestades' },
    description: {
      en: 'Warrior angels who fight against evil',
      es: 'Ángeles guerreros que luchan contra el mal'
    },
    choir: 6
  },
  principalities: {
    id: 'principalities',
    name: { en: 'Principalities', es: 'Principados' },
    description: {
      en: 'Guide and protect nations and institutions',
      es: 'Guían y protegen naciones e instituciones'
    },
    choir: 7
  },
  archangels: {
    id: 'archangels',
    name: { en: 'Archangels', es: 'Arcángeles' },
    description: {
      en: 'Messengers of important divine revelations',
      es: 'Mensajeros de importantes revelaciones divinas'
    },
    choir: 8
  },
  angels: {
    id: 'angels',
    name: { en: 'Angels', es: 'Ángeles' },
    description: {
      en: 'Guardian angels closest to humanity',
      es: 'Ángeles guardianes más cercanos a la humanidad'
    },
    choir: 9
  }
};

/**
 * Calcula el ángel guardián según la fecha de nacimiento
 * Los 72 ángeles presiden sobre períodos de 5 días cada uno (72 x 5 = 360 días)
 */
export function calculateGuardianAngel(birthDate: Date, angels: Angel[]): Angel | null {
  const month = birthDate.getMonth() + 1; // 1-12
  const day = birthDate.getDate();

  // Buscar el ángel que preside sobre esta fecha
  for (const angel of angels) {
    for (const [m, d] of angel.presidesOver) {
      if (m === month && d === day) {
        return angel;
      }
    }
  }

  return null;
}

/**
 * Obtiene el nombre del ángel en el idioma preferido
 */
export function getAngelName(angel: Angel, language: 'en' | 'es' | 'he' = 'en'): string {
  if (language === 'he') return angel.name.he;
  return angel.name.en;
}

/**
 * Obtiene el atributo del ángel en el idioma preferido
 */
export function getAngelAttribute(angel: Angel, language: 'en' | 'es' = 'en'): string {
  if (language === 'es' && angel.attribute.es) {
    return angel.attribute.es;
  }
  return angel.attribute.en;
}

/**
 * Formatea las fechas de presidencia del ángel
 */
export function formatPresidingDates(dates: [number, number][]): string[] {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return dates.map(([month, day]) => `${day} de ${monthNames[month - 1]}`);
}

/**
 * Obtiene los ángeles por orden angélico
 */
export function getAngelsByOrder(angels: Angel[], orderId: string): Angel[] {
  return angels.filter(angel => angel.angelicOrderId === orderId);
}

/**
 * Busca un ángel por nombre (en inglés o hebreo)
 */
export function findAngelByName(angels: Angel[], name: string): Angel | undefined {
  const normalizedName = name.toLowerCase().trim();
  return angels.find(
    angel =>
      angel.name.en.toLowerCase() === normalizedName ||
      angel.name.he === name
  );
}

/**
 * Calcula el período actual del año angélico (1-72)
 */
export function getCurrentAngelPeriod(date: Date = new Date()): number {
  const startOfYear = new Date(date.getFullYear(), 2, 20); // 20 de marzo
  const diffTime = date.getTime() - startOfYear.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Cada ángel rige 5 días
  const period = Math.floor(diffDays / 5) + 1;
  
  // Asegurar que esté en el rango 1-72
  return Math.max(1, Math.min(72, period));
}

/**
 * Obtiene el ángel que rige el período actual
 */
export function getCurrentAngel(angels: Angel[]): Angel | null {
  const today = new Date();
  return calculateGuardianAngel(today, angels);
}

/**
 * Traduce el nombre de Dios al español
 */
export function translateGodName(godName: string): string {
  const translations: Record<string, string> = {
    'Jehovah': 'Jehová',
    'Aydy': 'Aydy',
    'Elohim': 'Elohim',
    'El': 'El',
    'Adonai': 'Adonai',
    'YHVH': 'YHVH'
  };
  
  return translations[godName] || godName;
}

/**
 * Extrae invocaciones y salmos del texto del ángel
 */
export function extractInvocationInfo(text: string): {
  psalm?: string;
  hour?: string;
  invocation?: string;
} {
  const info: { psalm?: string; hour?: string; invocation?: string } = {};
  
  // Buscar referencias a salmos
  const psalmMatch = text.match(/psalm\s+(\d+)/i);
  if (psalmMatch) {
    info.psalm = psalmMatch[1];
  }
  
  // Buscar horas de invocación
  const hourMatch = text.match(/midnight\s+(\d+)\s+minutes?/i);
  if (hourMatch) {
    info.hour = `00:${hourMatch[1].padStart(2, '0')}`;
  }
  
  return info;
}
