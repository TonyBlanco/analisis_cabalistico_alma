/**
 * Pitagoras Method - Calculation Rules
 *
 * Motor matemático PURO
 * Funciones deterministas, sin efectos secundarios, sin dependencias externas
 */
import type { NumeroReducido, PitagorasInput } from './pitagoras.types';
/**
 * Reducción teosófica: reduce un número a 1-9 sumando sus dígitos iterativamente
 * @param n - Número a reducir
 * @returns Número reducido (1-9)
 */
export declare function reducirTeosofica(n: number): number;
/**
 * Reducción pitagórica: reduce a 1-9 manteniendo números maestros (11, 22, 33)
 * @param valor - Número a reducir
 * @returns Objeto con valor original, reducido y flag de número maestro
 */
export declare function reducirPitagorica(valor: number): NumeroReducido;
/**
 * Calcular valor numérico de una letra según alfabeto pitagórico
 * @param letra - Letra a evaluar
 * @returns Valor numérico (1-9) o 0 si no es letra
 */
export declare function calcularValorLetra(letra: string): number;
/**
 * Verificar si una letra es vocal
 * @param letra - Letra a verificar
 * @returns true si es vocal
 */
export declare function esVocal(letra: string): boolean;
/**
 * Limpiar nombre: remover caracteres no alfabéticos
 * @param nombre - Nombre a limpiar
 * @returns Nombre solo con letras
 */
export declare function limpiarNombre(nombre: string): string;
/**
 * Calcular valores del nombre: Esencia (vocales), Expresión (consonantes), Herencia (total)
 * @param nombreCompleto - Nombre completo del sujeto
 * @returns Objeto con sumas y valores reducidos
 */
export declare function calcularValoresNombre(nombreCompleto: string): {
    esencia: NumeroReducido;
    expresion: NumeroReducido;
    herencia: NumeroReducido;
    letras: Array<{
        letra: string;
        valor: number;
        esVocal: boolean;
    }>;
};
/**
 * Calcular Camino de Vida y Destino desde fecha de nacimiento
 * @param dia - Día de nacimiento (1-31)
 * @param mes - Mes de nacimiento (1-12)
 * @param anio - Año de nacimiento (ej: 1985)
 * @returns Camino de Vida (edad de transformación) y Destino (reducido)
 */
export declare function calcularCaminoDestino(dia: number, mes: number, anio: number): {
    caminoVida: NumeroReducido;
    edadTransformacion: number;
};
/**
 * Calcular inclusión: distribución de letras en casas 1-9
 * @param letras - Array de letras con sus valores
 * @returns Mapa de casas con conteo de letras por valor
 */
export declare function calcularInclusion(letras: Array<{
    letra: string;
    valor: number;
}>): Record<number, {
    conteo: number;
    letras: string[];
}>;
/**
 * Identificar casas ausentes (sin letras)
 * @param casas - Mapa de casas con conteo
 * @returns Array de números de casas vacías
 */
export declare function identificarAusencias(casas: Record<number, {
    conteo: number;
}>): number[];
/**
 * Identificar casas dominantes (mayor frecuencia)
 * @param casas - Mapa de casas con conteo
 * @returns Array de números de casas dominantes
 */
export declare function identificarDominantes(casas: Record<number, {
    conteo: number;
}>): number[];
/**
 * Calcular análisis pitagórico completo
 * @param input - Datos de entrada (nombre y fecha)
 * @returns Objeto con todos los cálculos
 */
export declare function calcularAnalisisPitagorico(input: PitagorasInput): {
    esencia: NumeroReducido;
    expresion: NumeroReducido;
    herencia: NumeroReducido;
    caminoVida: NumeroReducido;
    edadTransformacion: number;
    casasInclusion: Record<number, {
        conteo: number;
        letras: string[];
    }>;
    ausencias: number[];
    dominantes: number[];
    letrasAnalizadas: {
        letra: string;
        valor: number;
        esVocal: boolean;
    }[];
};
//# sourceMappingURL=pitagoras.rules.d.ts.map