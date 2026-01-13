import type { GematriaStandardInput } from './types';
/** Deterministic lightweight analysis used for UI-only presentation. */
export declare function calcularAnalisisGematriaStandard(input: GematriaStandardInput): {
    identidad: {
        nombreCompleto: string;
        fechaNacimiento: string;
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
            edadTransformacion: number;
            original: number;
            reducido: number;
            esMaestro: boolean;
        };
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