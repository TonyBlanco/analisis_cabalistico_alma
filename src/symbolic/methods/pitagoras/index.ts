/**
 * Pitagoras Method - Public Exports
 * 
 * Export público del método pitagórico
 * Punto de entrada único para el módulo de Cábala
 */

// ============================================================================
// TYPES
// ============================================================================
export type {
  PitagorasInput,
  PitagorasResult,
  PitagorasSymbolicState,
  PitagorasNumberMeaning,
  NumeroReducido,
} from './pitagoras.types';

// ============================================================================
// ADAPTER (Función Principal)
// ============================================================================
export {
  ejecutarMetodoPitagorico,
  generarAnalisisPitagorico,
  adaptarAEstadoSimbolico,
} from './pitagoras.adapter';

// ============================================================================
// TABLES (Para consulta externa si necesario)
// ============================================================================
export {
  ALFABETO_PITAGORICO,
  VOCALES,
  NUMEROS_MAESTROS,
  SIGNIFICADOS_PITAGORICOS,
  SIGNIFICADOS_MAESTROS,
  PITAGORAS_METADATA,
  obtenerSignificado,
} from './pitagoras.tables';

// ============================================================================
// RULES (Opcional: exponer cálculos puros para testing)
// ============================================================================
export {
  reducirTeosofica,
  reducirPitagorica,
  calcularValoresNombre,
  calcularCaminoDestino,
  calcularInclusion,
  calcularAnalisisPitagorico,
} from './pitagoras.rules';

// ============================================================================
// METADATA (Información del método)
// ============================================================================
export const PITAGORAS_METHOD_INFO = {
  id: 'pitagoras',
  name: 'Método Pitagórico',
  version: '1.0.0',
  description: 'Numerología occidental clásica basada en el sistema pitagórico',
  type: 'symbolic-method',
  category: 'numerology',
  
  /**
   * Capacidades del método
   */
  capabilities: {
    calculateFromName: true,
    calculateFromBirthDate: true,
    calculateInclusion: true,
    supportsMasterNumbers: true,
    supportsKarma: false, // No implementado en versión básica
    supportsTransgenerational: false, // No es parte del método pitagórico
  },
  
  /**
   * Requisitos de entrada
   */
  requiredInput: {
    nombreCompleto: 'string',
    fechaNacimiento: {
      dia: 'number (1-31)',
      mes: 'number (1-12)',
      anio: 'number (YYYY)',
    },
  },
  
  /**
   * Estructura de salida
   */
  outputStructure: {
    primaryNumbers: ['esencia', 'expresion', 'herencia', 'caminoVida'],
    inclusion: 'casas 1-9 con frecuencias',
    symbolicMeanings: 'significados 1-9 + maestros 11, 22, 33',
  },
} as const;
