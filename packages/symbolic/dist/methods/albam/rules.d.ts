import type { AlbamInput } from './types';
/**
 * Calcula Albam - Primera mitad ↔ Segunda mitad del alfabeto
 * א↔ל, ב↔מ, ג↔נ, etc. (offset de 11 posiciones)
 */
export declare function calcularAnalisisAlbam(input: AlbamInput): {
    identidad: {
        nombreCompleto: string;
        hebrewOriginal: string;
        hebrewTransformed: string;
        fechaNacimiento: string;
    };
    calculo: {
        metodo: string;
        descripcion: string;
        explicacion: string;
        palabras: {
            original: string;
            hebrewOriginal: string;
            hebrewTransformed: string;
            originalValue: number;
            transformedValue: number;
            letterMapping: {
                original: string;
                transformed: string;
                originalVal: number;
                transformedVal: number;
            }[];
        }[];
        valorOriginal: number;
        valorTransformado: number;
        reducidoOriginal: {
            original: number;
            reduced: number;
            isMaster: boolean;
        };
        reducidoTransformado: {
            original: number;
            reduced: number;
            isMaster: boolean;
        };
        palabrasRelacionadasOriginal: string[];
        palabrasRelacionadasTransformado: string[];
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
    correspondencia: {
        sefiraOriginal: string;
        sefiraTransformada: string;
        cambioEnergetico: string;
    };
    casasInclusion: Record<number, {
        numero: number;
        conteo: number;
        letras: string[];
    }>;
    ausencias: number[];
    dominantes: number[];
    metadatos: {
        metodo: string;
        sistema: string;
        alfabeto: string;
        version: string;
        timestamp: string;
    };
};
//# sourceMappingURL=rules.d.ts.map