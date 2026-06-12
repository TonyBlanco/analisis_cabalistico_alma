/**
 * interpretacion.ts
 * ---------------------------------------------------------------------------
 * Capa de INTERPRETACION + EXPLICACION para los metodos de gematria.
 *
 * Por que existe: estos 10 metodos (Mispar Gadol/Siduri/Katan, Milui, Atbash,
 * Albam, Avgad, Temurah, Notarikon) son poco conocidos por muchos cabalistas y
 * necesitan que la herramienta EXPLIQUE que son y QUE significan los resultados.
 *
 * Diseno:
 *  - Reutiliza SIGNIFICADOS_PITAGORICOS / SIGNIFICADOS_MAESTROS (numeros 1-9 y
 *    maestros) para NO duplicar otra fuente de verdad de significados.
 *  - Anade explicacion por metodo (que es / como se calcula).
 *  - "Verifica" por equivalencias gematricas: si un valor coincide con palabras
 *    clave hebreas (YHVH=26, Echad/Ahavah=13, Shalom=376, Chai=18...).
 *  - compararAnalisis(): primitiva de verificacion CRUZADA entre metodos.
 *
 * Marco: lectura simbolica y educativa. No es diagnostico medico ni psicologico.
 * ---------------------------------------------------------------------------
 */

import type { AnalisisGematrico, NumeroReducido } from './gematria-core';
import {
  SIGNIFICADOS_PITAGORICOS,
  SIGNIFICADOS_MAESTROS,
  obtenerSignificado,
} from '../methods/pitagoras/pitagoras.tables';
import type { PitagorasNumberMeaning } from '../methods/pitagoras/pitagoras.types';

// Re-export por conveniencia (mismo significado de numeros en todos los metodos)
export { SIGNIFICADOS_PITAGORICOS, SIGNIFICADOS_MAESTROS, obtenerSignificado };

// --- Diccionario de equivalencias gematricas (verificacion). Editable. ---
export interface PalabraClave {
  palabra: string;
  transliteracion: string;
  significado: string;
  valor: number; // Mispar Hechrachi
  categoria: string;
}

export const PALABRAS_CLAVE: PalabraClave[] = [
  { palabra: 'יהוה', transliteracion: 'YHVH', significado: 'Tetragramaton (Nombre inefable)', valor: 26, categoria: 'Divino' },
  { palabra: 'אלהים', transliteracion: 'Elohim', significado: 'Dios', valor: 86, categoria: 'Divino' },
  { palabra: 'אחד', transliteracion: 'Echad', significado: 'Uno / unidad', valor: 13, categoria: 'Divino' },
  { palabra: 'אהבה', transliteracion: 'Ahavah', significado: 'Amor', valor: 13, categoria: 'Emocion' },
  { palabra: 'חי', transliteracion: 'Chai', significado: 'Vida (18)', valor: 18, categoria: 'Vida' },
  { palabra: 'חיים', transliteracion: 'Chaim', significado: 'Vida (plural)', valor: 68, categoria: 'Vida' },
  { palabra: 'נשמה', transliteracion: 'Neshamah', significado: 'Alma', valor: 395, categoria: 'Alma' },
  { palabra: 'רוח', transliteracion: 'Ruach', significado: 'Espiritu / aliento', valor: 214, categoria: 'Alma' },
  { palabra: 'אור', transliteracion: 'Or', significado: 'Luz', valor: 207, categoria: 'Espiritual' },
  { palabra: 'שלום', transliteracion: 'Shalom', significado: 'Paz / completitud', valor: 376, categoria: 'Espiritual' },
  { palabra: 'אמת', transliteracion: 'Emet', significado: 'Verdad', valor: 441, categoria: 'Valor' },
  { palabra: 'צדק', transliteracion: 'Tzedek', significado: 'Justicia', valor: 194, categoria: 'Valor' },
  { palabra: 'טוב', transliteracion: 'Tov', significado: 'Bueno', valor: 17, categoria: 'Valor' },
  { palabra: 'חכמה', transliteracion: 'Chochmah', significado: 'Sabiduria (sefira)', valor: 73, categoria: 'Sefira' },
  { palabra: 'בינה', transliteracion: 'Binah', significado: 'Entendimiento (sefira)', valor: 67, categoria: 'Sefira' },
  { palabra: 'חסד', transliteracion: 'Chesed', significado: 'Bondad (sefira)', valor: 72, categoria: 'Sefira' },
  { palabra: 'גבורה', transliteracion: 'Gevurah', significado: 'Fuerza / juicio (sefira)', valor: 216, categoria: 'Sefira' },
  { palabra: 'משיח', transliteracion: 'Mashiach', significado: 'Mesias / ungido', valor: 358, categoria: 'Mesianico' },
  { palabra: 'תורה', transliteracion: 'Torah', significado: 'Ley / ensenanza', valor: 611, categoria: 'Tora' },
];

export function buscarEquivalencias(valor: number): PalabraClave[] {
  return PALABRAS_CLAVE.filter((p) => p.valor === valor);
}

// --- Explicacion de cada metodo (son poco conocidos) ---
export const NOMBRE_METODO: Record<string, string> = {
  'gematria-standard': 'Gematria Estandar (Mispar Hechrachi)',
  'gematria-katan': 'Gematria Pequena (Mispar Katan)',
  'mispar-gadol': 'Mispar Gadol',
  'mispar-siduri': 'Mispar Siduri (Ordinal)',
  'milui': 'Milui (Relleno)',
  'atbash': 'Atbash',
  'albam': 'Albam',
  'avgad': 'Avgad',
  'temurah': 'Temura (Atbach)',
  'notarikon': 'Notarikon',
};

export const EXPLICACION_METODO: Record<string, string> = {
  'gematria-standard': 'La gematria estandar (Mispar Hechrachi) asigna a cada letra hebrea su valor tradicional (alef=1 ... tav=400) y suma el nombre. Es la base de toda lectura gematrica.',
  'gematria-katan': 'El Mispar Katan reduce cada letra a un solo digito (10->1, 400->4). Revela la raiz o vibracion esencial del nombre, sin la magnitud de los valores grandes.',
  'mispar-gadol': 'El Mispar Gadol da a las letras finales valores ampliados (500-900). Resalta lo que se expande o culmina al final de una palabra; util para ver potenciales latentes.',
  'mispar-siduri': 'El Mispar Siduri usa la posicion ordinal de la letra (1-22) en lugar de su valor. Muestra en que etapa de la secuencia del alfabeto se situa cada fuerza.',
  'milui': 'El Milui (relleno) sustituye cada letra por la gematria de su nombre completo deletreado (alef -> alef-lamed-pe = 111). Abre el contenido interior u oculto de cada letra.',
  'atbash': 'Atbash es una temura (sustitucion) que invierte el alfabeto (alef<->tav, bet<->shin). Revela el reflejo o la cara oculta del nombre.',
  'albam': 'Albam intercambia las dos mitades del alfabeto (alef<->lamed, bet<->mem...). Es una temura que muestra el par complementario de cada letra.',
  'avgad': 'Avgad desplaza cada letra a la siguiente (alef->bet... tav->alef). Es una lectura del paso siguiente o impulso evolutivo del nombre.',
  'temurah': 'Temura por complemento (Atbach): empareja letras cuyos valores completan 10/100/1000. Muestra la fuerza que equilibra o completa a cada letra.',
  'notarikon': 'Notarikon trabaja con las iniciales (rashei tevot) y finales (sofei tevot) de las palabras del nombre, formando una palabra oculta. Es el mensaje condensado del nombre.',
};

// --- Tipos de salida de la interpretacion ---
export interface LecturaNumero {
  valor: number;
  esMaestro: boolean;
  titulo: string;
  cualidad: string;
  descripcion: string;
  arquetipos: string[];
  texto: string;
}

export interface EquivalenciaGematrica {
  contexto: string;
  valor: number;
  palabra: string;
  transliteracion: string;
  significado: string;
}

export interface InterpretacionGematrica {
  metodo: string;
  nombreMetodo: string;
  queEs: string;
  comoSeCalcula: string;
  lecturaNumeros: {
    esencia: LecturaNumero;
    expresion: LecturaNumero;
    herencia: LecturaNumero;
    caminoVida: LecturaNumero;
  };
  lecturaCasas: { dominantes: string; ausencias: string; detalle: string };
  equivalencias: EquivalenciaGematrica[];
  sintesis: string;
  avisos: string[];
}

function lecturaDeNumero(n: NumeroReducido, etiqueta: string): LecturaNumero {
  const s: PitagorasNumberMeaning = obtenerSignificado(n.reducido);
  return {
    valor: n.reducido,
    esMaestro: n.esMaestro,
    titulo: s.titulo,
    cualidad: s.cualidad,
    descripcion: s.descripcion,
    arquetipos: s.arquetipos ?? [],
    texto: `${etiqueta}: ${n.reducido}${n.esMaestro ? ' (maestro)' : ''} — ${s.titulo} (${s.cualidad}). ${s.descripcion}`,
  };
}

/**
 * Interpreta un analisis gematrico: explica el metodo, lee los numeros y casas,
 * y verifica por equivalencias gematricas.
 */
export function interpretarAnalisis(
  analisis: AnalisisGematrico,
  metodoId: string,
  comoSeCalcula = '',
): InterpretacionGematrica {
  const nombreMetodo = NOMBRE_METODO[metodoId] ?? metodoId;
  const queEs = EXPLICACION_METODO[metodoId] ?? 'Metodo gematrico.';

  const esencia = lecturaDeNumero(analisis.numeros.esencia, 'Esencia (vocales)');
  const expresion = lecturaDeNumero(analisis.numeros.expresion, 'Expresion (consonantes)');
  const herencia = lecturaDeNumero(analisis.numeros.herencia, 'Herencia / destino (total)');
  const caminoVida = lecturaDeNumero(analisis.numeros.caminoVida, 'Camino de vida (fecha)');

  // Verificacion por equivalencias gematricas
  const equivalencias: EquivalenciaGematrica[] = [];
  const checks = [
    { contexto: 'Valor total (herencia)', valor: analisis.valorTotal },
    { contexto: 'Esencia (vocales)', valor: analisis.numeros.esencia.original },
    { contexto: 'Expresion (consonantes)', valor: analisis.numeros.expresion.original },
  ];
  for (const c of checks) {
    for (const p of buscarEquivalencias(c.valor)) {
      equivalencias.push({
        contexto: c.contexto,
        valor: p.valor,
        palabra: p.palabra,
        transliteracion: p.transliteracion,
        significado: p.significado,
      });
    }
  }

  const dom = analisis.dominantes;
  const aus = analisis.ausencias;
  const lecturaCasas = {
    dominantes: dom.length
      ? `Casas dominantes: ${dom.join(', ')} (${dom.map((d) => obtenerSignificado(d).titulo).join(', ')}). Energias mas presentes en el nombre.`
      : 'Sin casa claramente dominante.',
    ausencias: aus.length
      ? `Casas ausentes: ${aus.join(', ')} (${aus.map((a) => obtenerSignificado(a).titulo).join(', ')}). Cualidades a desarrollar conscientemente.`
      : 'No hay casas ausentes: distribucion equilibrada.',
    detalle: Object.values(analisis.casasInclusion).map((c) => `${c.numero}:${c.conteo}`).join(' · '),
  };

  const transformada =
    analisis.textoTransformado && analisis.textoTransformado !== analisis.textoHebreo
      ? ` y se transforma en ${analisis.textoTransformado}`
      : '';

  const sintesis =
    `En ${nombreMetodo}, "${analisis.identidad.nombreCompleto}" se escribe en hebreo como ${analisis.textoHebreo}${transformada}, ` +
    `con un valor de ${analisis.valorTotal} (reducido a ${herencia.valor}, ${herencia.titulo}). ` +
    `La esencia (${esencia.titulo}) describe el impulso interior; la expresion (${expresion.titulo}) como se muestra al mundo; ` +
    `la herencia/destino (${herencia.titulo}) la direccion de fondo; y el camino de vida (${caminoVida.titulo}) la ruta marcada por la fecha de nacimiento.` +
    (dom.length ? ` Destacan las casas ${dom.join(', ')}.` : '') +
    (equivalencias.length ? ` Comparte valor con: ${equivalencias.map((x) => x.transliteracion).join(', ')}.` : '');

  const avisos = [
    'Lectura simbolica y educativa; orienta la reflexion y no constituye diagnostico medico ni psicologico.',
    'Estos metodos son poco difundidos: la explicacion busca hacerlos accesibles, no dogmatizar. El terapeuta contrasta con el contexto del consultante.',
  ];

  return {
    metodo: metodoId,
    nombreMetodo,
    queEs,
    comoSeCalcula,
    lecturaNumeros: { esencia, expresion, herencia, caminoVida },
    lecturaCasas,
    equivalencias,
    sintesis,
    avisos,
  };
}

// --- Verificacion CRUZADA entre metodos (fase mas compleja; primitiva base) ---
export interface ComparacionMetodos {
  coincidenciasHerencia: Array<{ reducido: number; metodos: string[] }>;
  coincidenciasCaminoVida: Array<{ reducido: number; metodos: string[] }>;
  notas: string[];
}

function agruparPorReducido(
  entradas: Array<{ metodo: string; analisis: AnalisisGematrico }>,
  selector: (a: AnalisisGematrico) => number,
): Array<{ reducido: number; metodos: string[] }> {
  const porValor: Record<number, string[]> = {};
  for (const e of entradas) {
    const r = selector(e.analisis);
    (porValor[r] = porValor[r] ?? []).push(e.metodo);
  }
  return Object.entries(porValor)
    .filter(([, m]) => m.length > 1)
    .map(([v, m]) => ({ reducido: Number(v), metodos: m }));
}

/**
 * Compara varios analisis (de distintos metodos) sobre la MISMA persona y
 * reporta donde coinciden las reducciones (senal reforzada). La verificacion
 * clinica plena es una fase posterior mas compleja.
 */
export function compararAnalisis(
  entradas: Array<{ metodo: string; analisis: AnalisisGematrico }>,
): ComparacionMetodos {
  const coincidenciasHerencia = agruparPorReducido(entradas, (a) => a.numeros.herencia.reducido);
  const coincidenciasCaminoVida = agruparPorReducido(entradas, (a) => a.numeros.caminoVida.reducido);
  const notas: string[] = [];
  if (coincidenciasHerencia.length) {
    notas.push(
      `Herencia reforzada: ${coincidenciasHerencia.map((c) => `${c.metodos.join('/')} -> ${c.reducido}`).join('; ')}.`,
    );
  } else {
    notas.push('Sin coincidencias de herencia entre los metodos comparados.');
  }
  return { coincidenciasHerencia, coincidenciasCaminoVida, notas };
}
