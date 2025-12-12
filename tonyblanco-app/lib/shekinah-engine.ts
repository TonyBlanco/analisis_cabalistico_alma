/**
 * Motor de Cálculo: Análisis Shejinah Moderno Pitagórico
 * Basado en el Método Atlantis
 * 
 * Implementa:
 * - Gematría de dos cifras (Método Atlantis)
 * - Algoritmo de Sendero OTD (Origen, Transformación, Destino)
 * - Detección de Karmas
 * - Ciclo Anual
 */

// 1. TABLA DE CONVERSIÓN EXACTA (Método Atlantis / Shekinah)
// Prioridad a letras compuestas (SCH, SS, etc.)
const GEMATRIA_TABLE: Record<string, number> = {
  // Letras compuestas (prioridad alta - ordenar por longitud descendente)
  'SCH': 18,
  'CH': 8,
  'PH': 17,
  'SH': 18,
  'TS': 18,
  'TZ': 18,
  'TH': 22,
  'SS': 42,
  
  // Letras simples
  'A': 1, 'Á': 1,
  'B': 2,
  'G': 3,
  'D': 4,
  'E': 5, 'É': 5,
  'U': 6, 'Ú': 6, 'Ü': 6, 'V': 6, 'W': 6,
  'Z': 7,
  'H': 8,
  'T': 9,
  'I': 10, 'Í': 10, 'J': 10, 'Y': 10,
  'C': 11, 'K': 11, 'Ç': 11,
  'L': 12,
  'M': 13,
  'N': 14, 'Ñ': 14,
  'X': 15,
  'O': 16, 'Ó': 16,
  'P': 17, 'F': 17,
  'Q': 19,
  'R': 20,
  'S': 21
};

export interface ShekinahResult {
  identity: {
    gematriaTotal: number;
    scf: number; // Suma Cifras Fecha
    pin: number; // Número del Corazón (PIN)
    et: number;  // Edad Transformación
  };
  otd: {
    to: number; // Origen (Tema Origen)
    pt: number; // Transformación (Principio Transformación)
    td: number; // Destino (Tema Destino)
  };
  karmas: {
    pending: number[];
    axes: string[]; // Ejes de tensión (ej: "3-9")
  };
  yearlyCycle: {
    currentYear: number;
    vibration: number;
  };
  metadata: {
    calculatedAt: string;
    method: string;
  };
}

/**
 * Suma simple de dígitos de un número
 */
const sumDigits = (n: number): number => {
  return n.toString()
    .split('')
    .reduce((acc, curr) => acc + parseInt(curr, 10), 0);
};

/**
 * Reducción a Arcano (0-21)
 * Si es 0, retorna 0 (El Loco)
 * Si es mayor a 21, reduce sumando dígitos hasta que sea <= 21
 */
const reduceToArcana = (n: number): number => {
  if (n === 0) return 0;
  if (n >= 1 && n <= 21) return n;
  
  let v = n;
  while (v > 21) {
    v = sumDigits(v);
  }
  
  return v;
};

/**
 * Algoritmo del Sendero (Método Atlantis)
 * Fórmula: (Valor - Suma de Dígitos) / 9 + 1
 * Luego se reduce a Arcano (0-21)
 */
const calculatePathAlgorithm = (value: number): number => {
  const sumOfDigits = sumDigits(value);
  const subtraction = value - sumOfDigits;
  const division = subtraction / 9;
  const result = Math.floor(division) + 1;
  return reduceToArcana(result);
};

/**
 * Calcula el perfil completo de Shejinah
 * @param fullName Nombre completo del paciente
 * @param birthDate Fecha de nacimiento en formato YYYY-MM-DD
 * @returns Objeto ShekinahResult con todos los cálculos
 */
export const calculateShekinahProfile = (
  fullName: string,
  birthDate: string
): ShekinahResult => {
  // 1. GEMATRÍA DEL NOMBRE (Tokenización inteligente)
  // Limpiar y normalizar el nombre
  let cleanName = fullName.toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^A-ZÑÇ\s]/g, ''); // Solo letras y espacios
  
  // Remover espacios para el cálculo
  let tempName = cleanName.replace(/\s+/g, '');
  let gematriaTotal = 0;
  
  // Ordenar claves por longitud descendente para detectar SCH antes que S
  const sortedKeys = Object.keys(GEMATRIA_TABLE).sort((a, b) => b.length - a.length);
  
  // Tokenización inteligente: buscar coincidencias más largas primero
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
    if (!match) {
      // Si no hay coincidencia, saltar el carácter (no debería pasar con nombres válidos)
      console.warn(`Carácter no reconocido en posición ${i}: ${tempName[i]}`);
      i++;
    }
  }

  // 2. FECHA: SCF (Suma Cifras Fecha) y ET (Edad Transformación)
  // Extraer todos los dígitos de la fecha (YYYYMMDD)
  const dateDigits = birthDate.replace(/[^0-9]/g, '');
  const scf = dateDigits.split('').reduce((acc, curr) => acc + parseInt(curr, 10), 0);
  const et = scf; // Edad de Transformación = SCF

  // 3. PIN (Número del Corazón): Gematría + SCF
  const pin = gematriaTotal + scf;

  // 4. OTD (Origen, Transformación, Destino)
  // Origen (TO): Algoritmo de Sendero aplicado a Gematría
  const to = calculatePathAlgorithm(gematriaTotal);
  
  // Transformación (PT): Reducción directa de SCF a Arcano
  const pt = reduceToArcana(scf);
  
  // Destino (TD): Algoritmo de Sendero aplicado a PIN
  const td = calculatePathAlgorithm(pin);

  // 5. CÁLCULO DE CICLO ANUAL
  const currentYear = new Date().getFullYear();
  const birthYear = parseInt(birthDate.split('-')[0]);
  const yearsSinceBirth = currentYear - birthYear;
  
  // Vibración anual = SCF + años transcurridos, reducido a Arcano
  const baseVibration = reduceToArcana(scf);
  const currentVibration = reduceToArcana(baseVibration + yearsSinceBirth);

  // 6. DETECCIÓN DE KARMAS (Simplificado para MVP)
  const pending: number[] = [];
  const axes: string[] = [];
  
  // Si Origen y Destino son iguales, es un karma pendiente
  if (to === td) {
    pending.push(to);
  }
  
  // Detectar ejes de tensión (números opuestos en el Árbol)
  // Por ejemplo: 3-9, 4-8, 5-7 (simplificado)
  const oppositePairs: [number, number][] = [
    [3, 9], [4, 8], [5, 7], [1, 10], [2, 11]
  ];
  
  for (const [a, b] of oppositePairs) {
    if ((to === a && td === b) || (to === b && td === a)) {
      axes.push(`${a}-${b}`);
    }
  }

  return {
    identity: {
      gematriaTotal,
      scf,
      pin,
      et
    },
    otd: {
      to,
      pt,
      td
    },
    karmas: {
      pending,
      axes
    },
    yearlyCycle: {
      currentYear,
      vibration: currentVibration
    },
    metadata: {
      calculatedAt: new Date().toISOString(),
      method: 'Atlantis - Shejinah Moderno Pitagórico'
    }
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

