// src/types.ts

// Definimos los datos del Árbol (Sefirot/Senderos)
export interface DatosArbol {
  tipo: string;       // "sefira" o "sendero"
  id: string;         // ej: "chesed"
  nombre_es: string;  // ej: "Misericordia"
  nombre_he: string;  // ej: "חסד"
  arcangel?: string;
  planeta?: string;
  chakra?: string;
  color?: string;
  orden_angelica?: string;
}

// Definimos la estructura de un Número (Esencia, Destino...)
export interface NumeroCabalistico {
  valor: string;      // ej: "4/4"
  numero: number;     // ej: 4
  tipo: string;
  arbol?: DatosArbol; // Conexión con los datos de arriba
}

// El objeto principal que recibes del Backend
export interface FichaNumerologica {
  identidad: {
    nombre: string;
    fecha_nacimiento: string;
  };
  numeros_principales: {
    esencia: NumeroCabalistico;
    expresion?: NumeroCabalistico;
    herencia?: NumeroCabalistico;
    destino?: NumeroCabalistico;
  };
  // Puedes agregar más secciones aquí (inclusión, etc.)
}