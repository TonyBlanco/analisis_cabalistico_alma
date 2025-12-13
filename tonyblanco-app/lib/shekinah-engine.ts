/**
 * Motor de Cálculo: Análisis Shejinah Moderno Pitagórico V3
 * Basado en el Método Atlantis - Integración Holística Completa
 */

import { calculateCosmicDecomposition, type CosmicDecomposition } from './shekinah-cosmic-calc';
import { AXIS_FLOW_MAP, EXCLUDED_SHIELDS, SHIELD_DEFINITIONS, PORTAL_NAMES } from './shekinah-shields';

const GEMATRIA_TABLE: Record<string, number> = {
  'SCH': 18, 'CH': 8, 'PH': 17, 'SH': 18, 'TS': 18, 'TZ': 18, 'TH': 22, 'SS': 42,
  'A': 1, 'Á': 1, 'B': 2, 'G': 3, 'D': 4, 'E': 5, 'É': 5, 'U': 6, 'Ú': 6, 'Ü': 6, 'V': 6, 'W': 6,
  'Z': 7, 'H': 8, 'T': 9, 'I': 10, 'Í': 10, 'J': 10, 'Y': 10, 'C': 11, 'K': 11, 'Ç': 11,
  'L': 12, 'M': 13, 'N': 14, 'Ñ': 14, 'X': 15, 'O': 16, 'Ó': 16, 'P': 17, 'F': 17, 'Q': 19, 'R': 20, 'S': 21
};

const DATE_CONVERSION = {
  SOUL_IMAGE: { 1: 7, 2: 8, 3: 9 }, 
  ENERGETIC_STRUCTURE: { 0: 7, 1: 6, 2: 5 }
};

export interface ShekinahResult {
  identity: { 
    gematriaTotal: number; 
    scf: number; 
    pin: number; 
    et: number; 
  };
  vibrations: { 
    spirit: number; 
    soul: number; 
    body: number; 
    healingEffect: number; 
    today: number; 
  };
  otd: { 
    to: number; 
    pt: number; 
    td: number; 
  };
  shields: { 
    active: boolean; 
    list: Array<{
      origin: number;
      portal: number;
      name: string;
      symptoms: string;
      psychology: string;
    }>; 
  };
  soulImage: { 
    active: boolean; 
    portals: Array<{
      id: number;
      name: string;
      belief: string;
    }>; 
  };
  karmic: { 
    openAccounts: Array<{ 
      number: number; 
      decomp: CosmicDecomposition 
    }>; 
    archaic: Array<{ 
      number: number; 
      decomp: CosmicDecomposition 
    }>;
    pending: number[];
  };
  portals: Array<{
    id: number;
    name: string;
    number: number;
    status: string;
  }>;
}

const sumDigits = (n: number): number => 
  n.toString().split('').reduce((a, c) => a + parseInt(c, 10), 0);

const reduceToArcana = (n: number): number => { 
  let v = n; 
  while (v > 21) { 
    v = sumDigits(v); 
  } 
  return v; 
};

const calculatePathAlgorithm = (val: number): number => 
  reduceToArcana(((val - sumDigits(val)) / 9) + 1);

const transformDateDigits = (dateStr: string, map: Record<number, number>): number => 
  dateStr.split('').reduce((sum, char) => sum + (map[parseInt(char, 10)] ?? parseInt(char, 10)), 0);

export const calculateShekinahProfile = (
  fullName: string, 
  birthDate: string
): ShekinahResult => {
  // A. GEMATRÍA
  let cleanName = fullName.toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^A-ZÑÇ\s]/g, '');
  let tempName = cleanName.replace(/\s+/g, '');
  let gematriaTotal = 0;
  const sortedKeys = Object.keys(GEMATRIA_TABLE).sort((a, b) => b.length - a.length);
  let i = 0;
  while (i < tempName.length) {
    let match = false;
    for (const key of sortedKeys) { 
      if (tempName.substring(i, i + key.length) === key) { 
        gematriaTotal += GEMATRIA_TABLE[key]; 
        i += key.length; 
        match = true; 
        break; 
      } 
    }
    if (!match) i++; 
  }

  // B. FECHAS
  const dateStr = birthDate.replace(/[^0-9]/g, '');
  const vibSpirit = dateStr.split('').reduce((a, c) => a + parseInt(c, 10), 0);
  const vibSoul = transformDateDigits(dateStr, DATE_CONVERSION.SOUL_IMAGE);
  const vibBody = transformDateDigits(dateStr, DATE_CONVERSION.ENERGETIC_STRUCTURE);
  const healingEffect = vibSpirit + vibSoul + vibBody;

  // C. OTD
  const scf = vibSpirit;
  const pin = gematriaTotal + scf;
  const to = calculatePathAlgorithm(gematriaTotal);
  const pt = reduceToArcana(scf);
  const td = calculatePathAlgorithm(pin);

  // D. ESCUDOS (Estructura Energética - 0->7)
  const shieldsList: Array<{
    origin: number;
    portal: number;
    name: string;
    symptoms: string;
    psychology: string;
  }> = [];
  const eeDigits = dateStr.split('').map(d => 
    DATE_CONVERSION.ENERGETIC_STRUCTURE[parseInt(d, 10)] ?? parseInt(d, 10)
  );
  [...new Set(eeDigits)].forEach(origin => {
    const dest = AXIS_FLOW_MAP[origin];
    if (dest && !EXCLUDED_SHIELDS.includes(dest) && SHIELD_DEFINITIONS[dest]) {
      shieldsList.push({ 
        origin, 
        portal: dest, 
        ...SHIELD_DEFINITIONS[dest], 
        name: PORTAL_NAMES[dest] 
      });
    }
  });

  // E. IMAGEN DEL ALMA (Planos - 1->7)
  const iaDigits = dateStr.split('').map(d => 
    DATE_CONVERSION.SOUL_IMAGE[parseInt(d, 10)] ?? parseInt(d, 10)
  );
  const soulPortals = [...new Set(iaDigits)]
    .filter(p => p >= 4)
    .map(p => ({
      id: p, 
      name: PORTAL_NAMES[p] || `Portal ${p}`, 
      belief: "Bloqueo de creencia limitante." // Placeholder texto
    }));

  // F. RAZONES KÁRMICAS & CÓSMICAS
  const openAccounts = [vibSpirit, vibSoul, vibBody].map(n => ({ 
    number: n, 
    decomp: calculateCosmicDecomposition(n) 
  }));
  const archaic = openAccounts.map(oa => ({ 
    number: oa.decomp.L, 
    decomp: calculateCosmicDecomposition(oa.decomp.L) 
  }));
  
  // Portales Visuales (EE)
  const portals = Array.from({length: 10}, (_, i) => i + 1).map(id => ({
    id, 
    name: PORTAL_NAMES[id] || `Portal ${id}`, 
    number: id === 1 ? reduceToArcana(pin) : 0, 
    status: eeDigits.includes(id) ? 'Tarea' : 'Libre'
  }));

  // Vibración "Hoy"
  const today = new Date();
  const vibToday = reduceToArcana(vibSpirit + today.getDate());

  return {
    identity: { 
      gematriaTotal, 
      scf, 
      pin, 
      et: scf 
    },
    vibrations: { 
      spirit: vibSpirit, 
      soul: vibSoul, 
      body: vibBody, 
      healingEffect, 
      today: vibToday 
    },
    otd: { 
      to, 
      pt, 
      td 
    },
    shields: { 
      active: shieldsList.length > 0, 
      list: shieldsList 
    },
    soulImage: { 
      active: soulPortals.length > 0, 
      portals: soulPortals 
    },
    karmic: { 
      openAccounts, 
      archaic, 
      pending: [28, 29] // Ejemplo Pending
    },
    portals
  };
};

/**
 * Valida que el nombre y fecha sean válidos
 */
export const validateShekinahInput = (
  fullName: string,
  birthDate: string
): { valid: boolean; error?: string } => {
  if (!fullName || fullName.trim().length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }
  
  if (!birthDate) {
    return { valid: false, error: 'La fecha de nacimiento es requerida' };
  }
  
  // Validar formato de fecha YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(birthDate)) {
    return { valid: false, error: 'La fecha debe estar en formato YYYY-MM-DD' };
  }
  
  const date = new Date(birthDate);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Fecha inválida' };
  }
  
  // Validar que no sea futura
  if (date > new Date()) {
    return { valid: false, error: 'La fecha de nacimiento no puede ser futura' };
  }
  
  return { valid: true };
};
