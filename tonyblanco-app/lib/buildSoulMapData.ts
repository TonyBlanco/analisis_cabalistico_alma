import { calculateShekinahProfile, sumDigits } from './shekinah-engine';
import { extractLetrasDelAlma, type LetraInfo } from './letras-sagradas';

export interface SoulMapData {
  identidad: {
    nombre: string;
    fechaNacimiento: string;
  };
  arcanos: {
    origen: number;        // TO  — Tema Origen
    transformacion: number; // PT  — Principio Transformación
    destino: number;       // TD  — Tema Destino
  };
  gematria: {
    total: number;  // Gematría Atlantis
    scf: number;    // Suma Cifras Fecha (todos los dígitos)
    pin: number;    // Número del Corazón = total + scf
    et: number;     // Edad Transformación = scf
  };
  vibraciones: {
    alma: number;       // dia + mes + sumDigits(año)
    diasFuerza: number[]; // días del mes con misma raíz digital que PIN
  };
  cuentasPendientes: Record<string, number>; // karmas 1-7 por número kármico
  letrasDelAlma: LetraInfo[];
  karmas: {
    pending: number[];
    axes: string[];
  };
}

const KARMIC_NUMBERS = [11, 12, 13, 15, 19, 22, 23, 26, 29, 31, 33, 37, 43, 49, 61, 63, 73, 97];

function calcularCuentasDeterministas(
  gematria: number,
  scf: number,
  pin: number
): Record<string, number> {
  const seed = ((gematria * 100003 + scf * 1009 + pin) >>> 0);
  const result: Record<string, number> = {};

  for (const k of KARMIC_NUMBERS) {
    let h = ((seed ^ (k * 2654435761)) >>> 0);
    // Keep h unsigned: XOR operator returns int32, so force back to uint32
    h = (((((h ^ (h >>> 16)) * 0x45d9f3b) >>> 0) ^ (h >>> 16)) >>> 0);
    result[String(k)] = (h % 7) + 1;
  }

  return result;
}

/**
 * Construye el JSON maestro del Mapa del Alma.
 * Todo determinista: misma entrada → mismo output SIEMPRE.
 *
 * @param fullName  Nombre completo del consultante
 * @param birthDate Fecha en formato YYYY-MM-DD
 */
export function buildSoulMapData(fullName: string, birthDate: string): SoulMapData {
  const shekinah = calculateShekinahProfile(fullName, birthDate);
  const [yearStr, monthStr, dayStr] = birthDate.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Alma = dia + mes + sumDigits(año completo)
  const alma = day + month + sumDigits(year);

  // Días fuerza: todos los días 1-31 que comparten la raíz digital del PIN
  const pinRoot = sumDigits(shekinah.identity.pin);
  const diasFuerza = Array.from({ length: 31 }, (_, i) => i + 1)
    .filter(d => sumDigits(d) === pinRoot);

  const cuentasPendientes = calcularCuentasDeterministas(
    shekinah.identity.gematriaTotal,
    shekinah.identity.scf,
    shekinah.identity.pin
  );

  const letrasDelAlma = extractLetrasDelAlma(fullName);

  return {
    identidad: {
      nombre: fullName,
      fechaNacimiento: birthDate
    },
    arcanos: {
      origen: shekinah.otd.to,
      transformacion: shekinah.otd.pt,
      destino: shekinah.otd.td
    },
    gematria: {
      total: shekinah.identity.gematriaTotal,
      scf: shekinah.identity.scf,
      pin: shekinah.identity.pin,
      et: shekinah.identity.et
    },
    vibraciones: {
      alma,
      diasFuerza
    },
    cuentasPendientes,
    letrasDelAlma,
    karmas: shekinah.karmas
  };
}
