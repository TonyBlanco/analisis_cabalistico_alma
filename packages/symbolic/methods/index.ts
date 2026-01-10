/**
 * Symbolic Methods Registry
 * 
 * Registro centralizado de métodos simbólicos disponibles
 * Cada método es un módulo declarativo consumible por el sistema cabalístico
 * 
 * NO modificar sin revisar SWM v1
 * NO añadir interpretación automática
 * NO tocar backend o SCDF
 */

/**
 * Definición de un método simbólico
 */
export interface SymbolicMethodDefinition {
  /** ID único del método */
  id: string;
  
  /** Dominio al que pertenece */
  domain: 'cabala' | 'tarot' | 'astrology' | 'bioemotion' | 'other';
  
  /** Familia del método */
  family: 'numerologia' | 'gematria' | 'tree-of-life' | 'divination' | 'other';
  
  /** Tipo de método */
  type: 'symbolic_method' | 'calculation_engine' | 'correspondence_map';
  
  /** Modo de ejecución */
  execution: 'manual' | 'automatic' | 'on_demand';
  
  /** Visibilidad (quién puede consumirlo) */
  visibility: Array<'therapist' | 'personal' | 'admin' | 'public'>;
  
  /** Es método clínico (diagnóstico) */
  clinical: boolean;
  
  /** Descripción breve (opcional) */
  description?: string;
  
  /** Versión (opcional) */
  version?: string;
}

/**
 * Registro de métodos simbólicos
 */
export const SYMBOLIC_METHODS: Record<string, SymbolicMethodDefinition> = {
  /**
   * Método Pitagórico
   * Numerología occidental clásica
   */
  pitagoras: {
    id: 'pitagoras',
    domain: 'cabala',
    family: 'numerologia',
    type: 'symbolic_method',
    execution: 'manual',
    visibility: ['therapist', 'personal'],
    clinical: false,
    description: 'Numerología occidental clásica basada en el sistema pitagórico (A=1...I=9, ciclo)',
    version: '1.0.0',
  },
  
  // Placeholder para futuros métodos
  // gematria: { ... },
  // tree_of_life: { ... },
  // tarot_celtic_cross: { ... },
  // etc.
};

/**
 * Obtener método por ID
 */
export function getSymbolicMethod(id: string): SymbolicMethodDefinition | undefined {
  return SYMBOLIC_METHODS[id];
}

/**
 * Listar métodos por dominio
 */
export function getMethodsByDomain(domain: SymbolicMethodDefinition['domain']): SymbolicMethodDefinition[] {
  return Object.values(SYMBOLIC_METHODS).filter(method => method.domain === domain);
}

/**
 * Listar métodos por familia
 */
export function getMethodsByFamily(family: SymbolicMethodDefinition['family']): SymbolicMethodDefinition[] {
  return Object.values(SYMBOLIC_METHODS).filter(method => method.family === family);
}

/**
 * Listar métodos disponibles para un rol
 */
export function getMethodsByVisibility(role: 'therapist' | 'personal' | 'admin' | 'public'): SymbolicMethodDefinition[] {
  return Object.values(SYMBOLIC_METHODS).filter(method => method.visibility.includes(role));
}

/**
 * Verificar si un método es clínico
 */
export function isMethodClinical(id: string): boolean {
  const method = getSymbolicMethod(id);
  return method?.clinical ?? false;
}
