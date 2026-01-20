/**
 * Pitagoras Method - Symbolic Adapter
 *
 * Adaptador al sistema simbólico
 * Traduce salida matemática → estado simbólico estándar compatible con Visual Core
 *
 * NO persiste, NO interpreta, NO cruza con otros métodos
 */
import type { PitagorasInput, PitagorasResult, PitagorasSymbolicState } from './pitagoras.types';
/**
 * Generar análisis pitagórico completo
 * @param input - Datos de entrada (nombre y fecha)
 * @returns Resultado completo con significados simbólicos
 */
export declare function generarAnalisisPitagorico(input: PitagorasInput): PitagorasResult;
/**
 * Adaptar resultado pitagórico a estado simbólico normalizado
 * Compatible con Visual Core del sistema cabalístico
 * @param resultado - Resultado pitagórico completo
 * @returns Estado simbólico normalizado
 */
export declare function adaptarAEstadoSimbolico(resultado: PitagorasResult): PitagorasSymbolicState;
/**
 * Pipeline completo: input → cálculo → adaptación
 * Esta es la función pública principal del adaptador
 * @param input - Datos de entrada
 * @returns Estado simbólico normalizado listo para consumir
 */
export declare function ejecutarMetodoPitagorico(input: PitagorasInput): PitagorasSymbolicState;
//# sourceMappingURL=pitagoras.adapter.d.ts.map