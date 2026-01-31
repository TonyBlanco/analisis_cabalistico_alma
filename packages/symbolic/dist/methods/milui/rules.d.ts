import type { MiluiInput } from './types';
/**
 * Calcula Milui (Expansión/Relleno)
 * Cada letra se expande a su nombre completo (א → אלף)
 */
export declare function calcularAnalisisMilui(input: MiluiInput): {
    identidad: {
        nombreCompleto: string;
        hebrewOriginal: string;
        hebrewExpanded: string;
        fechaNacimiento: string;
    };
    calculo: {
        metodo: string;
        descripcion: string;
        explicacion: string;
        palabras: {
            original: string;
            hebrew: string;
            expanded: string;
            valueMilui: number;
            valueSimple: number;
            difference: number;
            reducedMilui: {
                original: number;
                reduced: number;
                isMaster: boolean;
            };
            letterBreakdown: {
                letter: string;
                expansion: string;
                valueExpanded: number;
                valueSimple: number;
            }[];
        }[];
        valorMilui: number;
        valorSimple: number;
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