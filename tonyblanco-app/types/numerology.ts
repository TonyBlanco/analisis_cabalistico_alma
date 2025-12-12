/**
 * Tipos TypeScript para el resultado de Numerología Completa
 */

export interface SefirotInfo {
  nombre_es: string;
  nombre_en: string;
  numero: number;
  color?: string;
  planeta?: string;
  elemento?: string;
}

export interface NumeroPrincipal {
  valor: number;
  reduccion?: number;
  arbol?: SefirotInfo;
  significado?: string;
  descripcion?: string;
}

export interface InclusionBase {
  dominantes: number[];
  ausentes: number[];
  equilibrados?: number[];
}

export interface RazonesKarmicas {
  numeros: number[];
  descripcion?: string;
  significado?: string;
}

export interface Familias {
  [key: string]: {
    total: number;
    miembros: Record<string, number>;
  };
}

export interface ImagenAlma {
  sefirot?: string[];
  descripcion?: string;
}

export interface NumerologyResult {
  numeros_principales: {
    destino?: NumeroPrincipal;
    alma?: NumeroPrincipal;
    personalidad?: NumeroPrincipal;
    madurez?: NumeroPrincipal;
    karma_1?: NumeroPrincipal;
    karma_2?: NumeroPrincipal;
    karma_3?: NumeroPrincipal;
    karma_4?: NumeroPrincipal;
    mision?: NumeroPrincipal;
    don?: NumeroPrincipal;
    desafio?: NumeroPrincipal;
    realizacion?: NumeroPrincipal;
    [key: string]: NumeroPrincipal | undefined;
  };
  inclusion_base?: InclusionBase;
  razones_karmicas?: RazonesKarmicas[];
  familias?: Familias;
  imagen_alma?: ImagenAlma;
  [key: string]: any; // Para campos adicionales que puedan venir del backend
}


