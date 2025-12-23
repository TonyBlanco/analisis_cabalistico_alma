/**
 * Pitagoras Method - Calculation Rules
 * 
 * Motor matemático PURO
 * Funciones deterministas, sin efectos secundarios, sin dependencias externas
 */

import { ALFABETO_PITAGORICO, VOCALES, NUMEROS_MAESTROS } from './pitagoras.tables';
import type { NumeroReducido, PitagorasInput } from './pitagoras.types';

/**
 * Reducción teosófica: reduce un número a 1-9 sumando sus dígitos iterativamente
 * @param n - Número a reducir
 * @returns Número reducido (1-9)
 */
export function reducirTeosofica(n: number): number {
  if (n === 0) return 0;
  if (n < 0) n = Math.abs(n);
  
  while (n > 9) {
    n = String(n)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  
  return n;
}

/**
 * Reducción pitagórica: reduce a 1-9 manteniendo números maestros (11, 22, 33)
 * @param valor - Número a reducir
 * @returns Objeto con valor original, reducido y flag de número maestro
 */
export function reducirPitagorica(valor: number): NumeroReducido {
  const original = valor;
  
  // Si ya es 1-9, no reducir
  if (valor >= 1 && valor <= 9) {
    return {
      original,
      reducido: valor,
      esMaestro: false,
    };
  }
  
  // Si es número maestro, mantenerlo
  if (NUMEROS_MAESTROS.has(valor)) {
    return {
      original,
      reducido: valor,
      esMaestro: true,
    };
  }
  
  // Reducción iterativa manteniendo maestros
  let temp = valor;
  while (temp > 9 && !NUMEROS_MAESTROS.has(temp)) {
    temp = reducirTeosofica(temp);
    
    // Si en el proceso aparece un maestro, mantenerlo
    if (NUMEROS_MAESTROS.has(temp)) {
      return {
        original,
        reducido: temp,
        esMaestro: true,
      };
    }
  }
  
  return {
    original,
    reducido: temp,
    esMaestro: false,
  };
}

/**
 * Calcular valor numérico de una letra según alfabeto pitagórico
 * @param letra - Letra a evaluar
 * @returns Valor numérico (1-9) o 0 si no es letra
 */
export function calcularValorLetra(letra: string): number {
  const letraUpper = letra.toUpperCase();
  return ALFABETO_PITAGORICO[letraUpper] || 0;
}

/**
 * Verificar si una letra es vocal
 * @param letra - Letra a verificar
 * @returns true si es vocal
 */
export function esVocal(letra: string): boolean {
  return VOCALES.has(letra.toUpperCase());
}

/**
 * Limpiar nombre: remover caracteres no alfabéticos
 * @param nombre - Nombre a limpiar
 * @returns Nombre solo con letras
 */
export function limpiarNombre(nombre: string): string {
  return nombre.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
}

/**
 * Calcular valores del nombre: Esencia (vocales), Expresión (consonantes), Herencia (total)
 * @param nombreCompleto - Nombre completo del sujeto
 * @returns Objeto con sumas y valores reducidos
 */
export function calcularValoresNombre(nombreCompleto: string): {
  esencia: NumeroReducido;
  expresion: NumeroReducido;
  herencia: NumeroReducido;
  letras: Array<{ letra: string; valor: number; esVocal: boolean }>;
} {
  const nombreLimpio = limpiarNombre(nombreCompleto);
  
  let sumaVocales = 0;
  let sumaConsonantes = 0;
  let sumaTotal = 0;
  
  const letras: Array<{ letra: string; valor: number; esVocal: boolean }> = [];
  
  for (const letra of nombreLimpio) {
    const valor = calcularValorLetra(letra);
    const vocal = esVocal(letra);
    
    if (valor > 0) {
      letras.push({ letra: letra.toUpperCase(), valor, esVocal: vocal });
      sumaTotal += valor;
      
      if (vocal) {
        sumaVocales += valor;
      } else {
        sumaConsonantes += valor;
      }
    }
  }
  
  return {
    esencia: reducirPitagorica(sumaVocales),
    expresion: reducirPitagorica(sumaConsonantes),
    herencia: reducirPitagorica(sumaTotal),
    letras,
  };
}

/**
 * Calcular Camino de Vida y Destino desde fecha de nacimiento
 * @param dia - Día de nacimiento (1-31)
 * @param mes - Mes de nacimiento (1-12)
 * @param anio - Año de nacimiento (ej: 1985)
 * @returns Camino de Vida (edad de transformación) y Destino (reducido)
 */
export function calcularCaminoDestino(dia: number, mes: number, anio: number): {
  caminoVida: NumeroReducido;
  edadTransformacion: number;
} {
  // Suma todos los dígitos de la fecha
  const sumaTotal = 
    reducirTeosofica(dia) +
    reducirTeosofica(mes) +
    String(anio).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
  
  // La suma total sin reducir es la "edad de transformación"
  const edadTransformacion = sumaTotal;
  
  // El Camino de Vida es la reducción pitagórica de esa suma
  const caminoVida = reducirPitagorica(sumaTotal);
  
  return {
    caminoVida,
    edadTransformacion,
  };
}

/**
 * Calcular inclusión: distribución de letras en casas 1-9
 * @param letras - Array de letras con sus valores
 * @returns Mapa de casas con conteo de letras por valor
 */
export function calcularInclusion(
  letras: Array<{ letra: string; valor: number }>
): Record<number, { conteo: number; letras: string[] }> {
  const casas: Record<number, { conteo: number; letras: string[] }> = {};
  
  // Inicializar casas 1-9
  for (let i = 1; i <= 9; i++) {
    casas[i] = { conteo: 0, letras: [] };
  }
  
  // Distribuir letras en casas según su valor
  for (const { letra, valor } of letras) {
    if (valor >= 1 && valor <= 9) {
      casas[valor].conteo++;
      casas[valor].letras.push(letra);
    }
  }
  
  return casas;
}

/**
 * Identificar casas ausentes (sin letras)
 * @param casas - Mapa de casas con conteo
 * @returns Array de números de casas vacías
 */
export function identificarAusencias(
  casas: Record<number, { conteo: number }>
): number[] {
  return Object.entries(casas)
    .filter(([_, data]) => data.conteo === 0)
    .map(([num]) => parseInt(num, 10));
}

/**
 * Identificar casas dominantes (mayor frecuencia)
 * @param casas - Mapa de casas con conteo
 * @returns Array de números de casas dominantes
 */
export function identificarDominantes(
  casas: Record<number, { conteo: number }>
): number[] {
  const maxConteo = Math.max(...Object.values(casas).map(c => c.conteo));
  
  if (maxConteo === 0) return [];
  
  return Object.entries(casas)
    .filter(([_, data]) => data.conteo === maxConteo && data.conteo > 0)
    .map(([num]) => parseInt(num, 10));
}

/**
 * Calcular análisis pitagórico completo
 * @param input - Datos de entrada (nombre y fecha)
 * @returns Objeto con todos los cálculos
 */
export function calcularAnalisisPitagorico(input: PitagorasInput) {
  const { nombreCompleto, fechaNacimiento } = input;
  const { dia, mes, anio } = fechaNacimiento;
  
  // Cálculos del nombre
  const valoresNombre = calcularValoresNombre(nombreCompleto);
  
  // Cálculos de la fecha
  const { caminoVida, edadTransformacion } = calcularCaminoDestino(dia, mes, anio);
  
  // Inclusión
  const casasInclusion = calcularInclusion(valoresNombre.letras);
  const ausencias = identificarAusencias(casasInclusion);
  const dominantes = identificarDominantes(casasInclusion);
  
  return {
    esencia: valoresNombre.esencia,
    expresion: valoresNombre.expresion,
    herencia: valoresNombre.herencia,
    caminoVida,
    edadTransformacion,
    casasInclusion,
    ausencias,
    dominantes,
    letrasAnalizadas: valoresNombre.letras,
  };
}
