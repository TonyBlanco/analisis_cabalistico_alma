/**
 * Pitagoras Method - Type Definitions
 *
 * Contrato de datos para el método numerológico pitagórico
 * Sin lógica, solo tipos puros
 */
/**
 * Entrada mínima requerida para el cálculo pitagórico
 */
export interface PitagorasInput {
    /** Nombre completo del sujeto */
    nombreCompleto: string;
    /** Fecha de nacimiento */
    fechaNacimiento: {
        dia: number;
        mes: number;
        anio: number;
    };
}
/**
 * Número con su valor reducido
 */
export interface NumeroReducido {
    /** Valor original sin reducir */
    original: number;
    /** Valor reducido (1-9 o maestro 11, 22, 33) */
    reducido: number;
    /** Es número maestro (11, 22, 33) */
    esMaestro: boolean;
}
/**
 * Significado simbólico de un número
 */
export interface PitagorasNumberMeaning {
    /** Número (1-9 o maestro) */
    numero: number;
    /** Título descriptivo neutro */
    titulo: string;
    /** Cualidad principal */
    cualidad: string;
    /** Descripción simbólica (no diagnóstica) */
    descripcion: string;
    /** Arquetipos asociados */
    arquetipos?: string[];
    /** Polaridad (activo/receptivo/neutro) */
    polaridad?: 'activo' | 'receptivo' | 'neutro';
}
/**
 * Resultado completo del análisis pitagórico
 */
export interface PitagorasResult {
    /** Identidad del sujeto */
    identidad: {
        nombreCompleto: string;
        fechaNacimiento: string;
    };
    /** Números principales calculados */
    numeros: {
        /** Esencia/Alma (suma de vocales) */
        esencia: NumeroReducido & {
            significado: PitagorasNumberMeaning;
        };
        /** Expresión/Personalidad (suma de consonantes) */
        expresion: NumeroReducido & {
            significado: PitagorasNumberMeaning;
        };
        /** Herencia/Destino (suma total del nombre) */
        herencia: NumeroReducido & {
            significado: PitagorasNumberMeaning;
        };
        /** Camino de Vida (suma de fecha de nacimiento) */
        caminoVida: NumeroReducido & {
            significado: PitagorasNumberMeaning;
            /** Edad de transformación (valor sin reducir) */
            edadTransformacion: number;
        };
    };
    /** Inclusión: distribución de letras en casas 1-9 */
    inclusion: {
        /** Casas numerológicas (1-9) con conteo de letras */
        casas: Record<number, {
            numero: number;
            conteo: number;
            letras: string[];
            significado: PitagorasNumberMeaning;
        }>;
        /** Casas vacías (ausencias) */
        ausencias: number[];
        /** Casas dominantes (mayor frecuencia) */
        dominantes: number[];
    };
    /** Metadatos del método */
    metadatos: {
        metodo: 'pitagoras';
        sistema: 'pitagorico';
        alfabeto: 'pitagorico';
        version: string;
        timestamp: string;
    };
}
/**
 * Estado simbólico normalizado para el Visual Core
 */
export interface PitagorasSymbolicState {
    /** ID del método */
    methodId: 'pitagoras';
    /** Nombre del método */
    methodName: 'Método Pitagórico';
    /** Números principales con pesos */
    primaryNumbers: Array<{
        key: string;
        label: string;
        value: number;
        weight: number;
        meaning: PitagorasNumberMeaning;
    }>;
    /** Inclusión como mapa de frecuencias */
    inclusionMap: Record<number, {
        frequency: number;
        isAbsent: boolean;
        isDominant: boolean;
    }>;
    /** Datos crudos completos */
    rawData: PitagorasResult;
}
//# sourceMappingURL=pitagoras.types.d.ts.map