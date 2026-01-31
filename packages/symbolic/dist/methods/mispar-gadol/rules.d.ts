import type { MisparGadolInput } from './types';
/**
 * Calcula Mispar Gadol (Grande)
 * Las letras finales (sofit) tienen valores especiales: ך=500, ם=600, ן=700, ף=800, ץ=900
 */
export declare function calcularAnalisisMisparGadol(input: MisparGadolInput): {
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
            valueGadol: number;
            valueStandard: number;
            difference: number;
            reducedGadol: {
                original: number;
                reduced: number;
                isMaster: boolean;
            };
            letterBreakdown: {
                letter: string;
                valueGadol: number;
                valueStandard: number;
                isFinal: boolean;
            }[];
        }[];
        valorGadol: number;
        valorStandard: number;
        diferencia: number;
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