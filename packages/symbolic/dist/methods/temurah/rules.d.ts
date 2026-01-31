import type { TemurahInput } from './types';
/**
 * Calcula Temurah - Sistema completo de transformaciones
 * Incluye: Atbash, Albam, Avgad, Ayak Bakar
 */
export declare function calcularAnalisisTemurah(input: TemurahInput): {
    identidad: {
        nombreCompleto: string;
        hebrewOriginal: string;
        fechaNacimiento: string;
    };
    calculo: {
        metodo: string;
        descripcion: string;
        explicacion: string;
        transformaciones: {
            original: {
                text: string;
                value: number;
                reduced: {
                    original: number;
                    reduced: number;
                    isMaster: boolean;
                };
            };
            atbash: {
                text: string;
                value: number;
                reduced: {
                    original: number;
                    reduced: number;
                    isMaster: boolean;
                };
                description: string;
            };
            albam: {
                text: string;
                value: number;
                reduced: {
                    original: number;
                    reduced: number;
                    isMaster: boolean;
                };
                description: string;
            };
            avgad: {
                text: string;
                value: number;
                reduced: {
                    original: number;
                    reduced: number;
                    isMaster: boolean;
                };
                description: string;
            };
            ayakBakar: {
                text: string;
                value: number;
                reduced: {
                    original: number;
                    reduced: number;
                    isMaster: boolean;
                };
                description: string;
            };
        };
        palabrasRelacionadas: Record<string, string[]>;
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
        sefirahOriginalHebrew: string;
        sefirahOriginalMeaning: string;
        sefiraAtbash: string;
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