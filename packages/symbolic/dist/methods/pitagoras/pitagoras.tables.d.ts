/**
 * Pitagoras Method - Symbolic Tables
 *
 * Tablas de correspondencias simbólicas
 * Solo constantes, no lógica
 */
import type { PitagorasNumberMeaning } from './pitagoras.types';
/**
 * Alfabeto Pitagórico (numerología occidental clásica)
 * A=1, B=2, ..., I=9, J=1, K=2, ...
 */
export declare const ALFABETO_PITAGORICO: Record<string, number>;
/**
 * Vocales para cálculo de Esencia/Alma
 */
export declare const VOCALES: Set<string>;
/**
 * Números maestros (no se reducen teosóficamente)
 */
export declare const NUMEROS_MAESTROS: Set<number>;
/**
 * Significados simbólicos de números 1-9
 * Lenguaje neutro, no diagnóstico, consultivo
 */
export declare const SIGNIFICADOS_PITAGORICOS: Record<number, PitagorasNumberMeaning>;
/**
 * Significados de números maestros
 */
export declare const SIGNIFICADOS_MAESTROS: Record<number, PitagorasNumberMeaning>;
/**
 * Obtener significado de un número (1-9 o maestro)
 */
export declare function obtenerSignificado(numero: number): PitagorasNumberMeaning;
/**
 * Metadatos del método
 */
export declare const PITAGORAS_METADATA: {
    readonly id: "pitagoras";
    readonly name: "Método Pitagórico";
    readonly sistema: "pitagorico";
    readonly alfabeto: "pitagorico";
    readonly version: "1.0.0";
    readonly description: "Numerología occidental clásica basada en el sistema pitagórico (A=1 ... I=9, ciclo repetido).";
    readonly author: "Sistema Integrado de Numerología Cabalística";
};
//# sourceMappingURL=pitagoras.tables.d.ts.map