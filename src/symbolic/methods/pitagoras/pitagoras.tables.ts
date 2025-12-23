/**
 * Pitagoras Method - Symbolic Tables
 * 
 * Tablas de correspondencias simbólicas
 * Solo constantes, no lógica
 */

import type { PitagorasNumberMeaning } from './pitagoras.types';

/**
 * Alfabeto Pitagórico (numerología occidental clásica)
 * A=1, B=2, ..., I=9, J=1, K=2, ...
 */
export const ALFABETO_PITAGORICO: Record<string, number> = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
  'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8,
};

/**
 * Vocales para cálculo de Esencia/Alma
 */
export const VOCALES = new Set(['A', 'E', 'I', 'O', 'U']);

/**
 * Números maestros (no se reducen teosóficamente)
 */
export const NUMEROS_MAESTROS = new Set([11, 22, 33]);

/**
 * Significados simbólicos de números 1-9
 * Lenguaje neutro, no diagnóstico, consultivo
 */
export const SIGNIFICADOS_PITAGORICOS: Record<number, PitagorasNumberMeaning> = {
  1: {
    numero: 1,
    titulo: 'El Iniciador',
    cualidad: 'Individualidad',
    descripcion: 'Principio de acción, liderazgo y autoafirmación. Representa el inicio, la voluntad individual y la capacidad de iniciar nuevos ciclos.',
    arquetipos: ['Pionero', 'Líder', 'Guerrero'],
    polaridad: 'activo',
  },
  2: {
    numero: 2,
    titulo: 'El Cooperador',
    cualidad: 'Receptividad',
    descripcion: 'Principio de dualidad, colaboración y sensibilidad. Representa la diplomacia, las relaciones y la capacidad de armonizar.',
    arquetipos: ['Mediador', 'Diplomático', 'Compañero'],
    polaridad: 'receptivo',
  },
  3: {
    numero: 3,
    titulo: 'El Creativo',
    cualidad: 'Expresión',
    descripcion: 'Principio de creatividad, comunicación y expansión. Representa la alegría, la sociabilidad y la expresión artística.',
    arquetipos: ['Artista', 'Comunicador', 'Optimista'],
    polaridad: 'activo',
  },
  4: {
    numero: 4,
    titulo: 'El Constructor',
    cualidad: 'Estabilidad',
    descripcion: 'Principio de estructura, orden y disciplina. Representa la base sólida, el trabajo metódico y la responsabilidad.',
    arquetipos: ['Arquitecto', 'Organizador', 'Guardián'],
    polaridad: 'receptivo',
  },
  5: {
    numero: 5,
    titulo: 'El Explorador',
    cualidad: 'Libertad',
    descripcion: 'Principio de cambio, adaptabilidad y experiencia. Representa la versatilidad, la curiosidad y el movimiento.',
    arquetipos: ['Aventurero', 'Viajero', 'Adaptador'],
    polaridad: 'activo',
  },
  6: {
    numero: 6,
    titulo: 'El Armonizador',
    cualidad: 'Servicio',
    descripcion: 'Principio de amor, responsabilidad y armonía. Representa el cuidado, el hogar y el equilibrio entre dar y recibir.',
    arquetipos: ['Sanador', 'Cuidador', 'Consejero'],
    polaridad: 'receptivo',
  },
  7: {
    numero: 7,
    titulo: 'El Buscador',
    cualidad: 'Sabiduría',
    descripcion: 'Principio de introspección, análisis y espiritualidad. Representa la búsqueda de verdad, el conocimiento profundo y la reflexión.',
    arquetipos: ['Sabio', 'Investigador', 'Místico'],
    polaridad: 'neutro',
  },
  8: {
    numero: 8,
    titulo: 'El Realizador',
    cualidad: 'Poder',
    descripcion: 'Principio de manifestación, autoridad y logro material. Representa la ambición constructiva, la gestión y el éxito tangible.',
    arquetipos: ['Ejecutivo', 'Gestor', 'Manifestador'],
    polaridad: 'activo',
  },
  9: {
    numero: 9,
    titulo: 'El Humanitario',
    cualidad: 'Compasión',
    descripcion: 'Principio de universalidad, finalización y servicio global. Representa la sabiduría acumulada, la generosidad y el altruismo.',
    arquetipos: ['Maestro', 'Filántropo', 'Sanador Universal'],
    polaridad: 'receptivo',
  },
};

/**
 * Significados de números maestros
 */
export const SIGNIFICADOS_MAESTROS: Record<number, PitagorasNumberMeaning> = {
  11: {
    numero: 11,
    titulo: 'El Iluminador',
    cualidad: 'Inspiración',
    descripcion: 'Número maestro de iluminación espiritual e intuición elevada. Representa la capacidad de canalizar visión superior y servir como faro de luz.',
    arquetipos: ['Visionario', 'Inspirador', 'Canal'],
    polaridad: 'activo',
  },
  22: {
    numero: 22,
    titulo: 'El Maestro Constructor',
    cualidad: 'Manifestación',
    descripcion: 'Número maestro de construcción a gran escala. Representa la capacidad de materializar visiones espirituales en estructuras concretas y duraderas.',
    arquetipos: ['Arquitecto Maestro', 'Visionario Práctico', 'Constructor de Legados'],
    polaridad: 'receptivo',
  },
  33: {
    numero: 33,
    titulo: 'El Maestro Sanador',
    cualidad: 'Servicio Universal',
    descripcion: 'Número maestro de servicio y sanación colectiva. Representa la devoción altruista, la enseñanza elevada y el amor incondicional.',
    arquetipos: ['Sanador Maestro', 'Maestro Espiritual', 'Servidor Universal'],
    polaridad: 'neutro',
  },
};

/**
 * Obtener significado de un número (1-9 o maestro)
 */
export function obtenerSignificado(numero: number): PitagorasNumberMeaning {
  // Primero buscar en maestros
  if (NUMEROS_MAESTROS.has(numero) && SIGNIFICADOS_MAESTROS[numero]) {
    return SIGNIFICADOS_MAESTROS[numero];
  }
  
  // Luego en números base (1-9)
  if (numero >= 1 && numero <= 9) {
    return SIGNIFICADOS_PITAGORICOS[numero];
  }
  
  // Fallback para números fuera de rango
  return {
    numero,
    titulo: `Número ${numero}`,
    cualidad: 'Indeterminado',
    descripcion: `Número fuera del rango estándar (1-9, 11, 22, 33).`,
  };
}

/**
 * Metadatos del método
 */
export const PITAGORAS_METADATA = {
  id: 'pitagoras',
  name: 'Método Pitagórico',
  sistema: 'pitagorico',
  alfabeto: 'pitagorico',
  version: '1.0.0',
  description: 'Numerología occidental clásica basada en el sistema pitagórico (A=1 ... I=9, ciclo repetido).',
  author: 'Sistema Integrado de Numerología Cabalística',
} as const;
