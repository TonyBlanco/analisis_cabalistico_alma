import type { GematriaStandardInput } from './types';
/**
 * Calcula Gematría Estándar (Mispar Hechrachi)
 * Suma directa de valores tradicionales de letras hebreas
 */
export declare function calcularAnalisisGematriaStandard(input: GematriaStandardInput): {
    identidad: {
        nombreCompleto: string;
        hebrewTransliteration: string;
        fechaNacimiento: string;
    };
    calculo: {
        metodo: string;
        descripcion: string;
        palabras: {
            original: string;
            hebrew: string;
            value: number;
            reduced: {
                original: number;
                reduced: number;
                isMaster: boolean;
            };
            letterBreakdown: {
                letter: string;
                value: number;
            }[];
        }[];
        valorTotal: number;
        valorReducido: {
            original: number;
            reduced: number;
            isMaster: boolean;
        };
        palabrasRelacionadas: string[];
    };
    numeros: {
        esencia: {
            original: number;
            reducido: number;
            esMaestro: boolean;
        };
        expresion: {
            original: number;
            reducido: number;
            esMaestro: boolean;
        };
        herencia: {
            original: number;
            reducido: number;
            esMaestro: boolean;
        };
        caminoVida: {
            original: number;
            reducido: number;
            esMaestro: boolean;
            edadTransformacion: number;
        };
    };
    casasInclusion: Record<number, {
        numero: number;
        conteo: number;
        letras: string[];
    }>;
    ausencias: number[];
    dominantes: number[];
    correspondencia: {
        sefira: string;
        sefirahHebrew: string;
        sefirahMeaning: string;
    };
    metadatos: {
        metodo: string;
        sistema: string;
        alfabeto: string;
        version: string;
        timestamp: string;
    };
};
//# sourceMappingURL=rules.d.ts.map