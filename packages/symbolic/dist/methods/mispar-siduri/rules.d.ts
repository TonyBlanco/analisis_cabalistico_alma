import type { MisparSiduriInput } from './types';
/**
 * Calcula Mispar Siduri (Ordinal)
 * Posición en el alfabeto: א=1, ב=2, ... ת=22
 */
export declare function calcularAnalisisMisparSiduri(input: MisparSiduriInput): {
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
            valueSiduri: number;
            valueStandard: number;
            reducedSiduri: {
                original: number;
                reduced: number;
                isMaster: boolean;
            };
            letterBreakdown: {
                letter: string;
                position: number;
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