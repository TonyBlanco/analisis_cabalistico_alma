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
export declare const SYMBOLIC_METHODS: Record<string, SymbolicMethodDefinition>;
/**
 * Obtener método por ID
 */
export declare function getSymbolicMethod(id: string): SymbolicMethodDefinition | undefined;
/**
 * Listar métodos por dominio
 */
export declare function getMethodsByDomain(domain: SymbolicMethodDefinition['domain']): SymbolicMethodDefinition[];
/**
 * Listar métodos por familia
 */
export declare function getMethodsByFamily(family: SymbolicMethodDefinition['family']): SymbolicMethodDefinition[];
/**
 * Listar métodos disponibles para un rol
 */
export declare function getMethodsByVisibility(role: 'therapist' | 'personal' | 'admin' | 'public'): SymbolicMethodDefinition[];
/**
 * Verificar si un método es clínico
 */
export declare function isMethodClinical(id: string): boolean;
//# sourceMappingURL=index.d.ts.map