/**
 * Pitagoras Method - Public Exports
 *
 * Export público del método pitagórico
 * Punto de entrada único para el módulo de Cábala
 */
export type { PitagorasInput, PitagorasResult, PitagorasSymbolicState, PitagorasNumberMeaning, NumeroReducido, } from './pitagoras.types';
export { ejecutarMetodoPitagorico, generarAnalisisPitagorico, adaptarAEstadoSimbolico, } from './pitagoras.adapter';
export { ALFABETO_PITAGORICO, VOCALES, NUMEROS_MAESTROS, SIGNIFICADOS_PITAGORICOS, SIGNIFICADOS_MAESTROS, PITAGORAS_METADATA, obtenerSignificado, } from './pitagoras.tables';
export { reducirTeosofica, reducirPitagorica, calcularValoresNombre, calcularCaminoDestino, calcularInclusion, calcularAnalisisPitagorico, } from './pitagoras.rules';
export declare const PITAGORAS_METHOD_INFO: {
    readonly id: "pitagoras";
    readonly name: "Método Pitagórico";
    readonly version: "1.0.0";
    readonly description: "Numerología occidental clásica basada en el sistema pitagórico";
    readonly type: "symbolic-method";
    readonly category: "numerology";
    /**
     * Capacidades del método
     */
    readonly capabilities: {
        readonly calculateFromName: true;
        readonly calculateFromBirthDate: true;
        readonly calculateInclusion: true;
        readonly supportsMasterNumbers: true;
        readonly supportsKarma: false;
        readonly supportsTransgenerational: false;
    };
    /**
     * Requisitos de entrada
     */
    readonly requiredInput: {
        readonly nombreCompleto: "string";
        readonly fechaNacimiento: {
            readonly dia: "number (1-31)";
            readonly mes: "number (1-12)";
            readonly anio: "number (YYYY)";
        };
    };
    /**
     * Estructura de salida
     */
    readonly outputStructure: {
        readonly primaryNumbers: readonly ["esencia", "expresion", "herencia", "caminoVida"];
        readonly inclusion: "casas 1-9 con frecuencias";
        readonly symbolicMeanings: "significados 1-9 + maestros 11, 22, 33";
    };
};
//# sourceMappingURL=index.d.ts.map