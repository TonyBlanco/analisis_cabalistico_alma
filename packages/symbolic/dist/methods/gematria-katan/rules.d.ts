import type { GematriaKatanInput } from './types';
/**
 * Calcula Gematría Katan (Pequeña)
 * Cada letra se reduce a un valor de 1-9
 */
export declare function calcularAnalisisGematriaKatan(input: GematriaKatanInput): {
    identidad: {
        nombreCompleto: string;
        hebrewTransliteration: string;
        fechaNacimiento: string;
    };
    calculo: {
        metodo: string;
        descripcion: string;
        explicacion: string;
        palabras: {
            original: string;
            hebrew: string;
            valueKatan: number;
            valueStandard: number;
            reducedKatan: {
                original: number;
                reduced: number;
                isMaster: boolean;
            };
            letterBreakdown: {
                letter: string;
                valueKatan: number;
                valueStandard: number;
            }[];
        }[];
        valorTotal: number;
        valorReducido: {
            original: number;
            reduced: number;
            isMaster: boolean;
        };
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