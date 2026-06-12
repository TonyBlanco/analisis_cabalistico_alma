/**
 * gematria-core.ts
 * ---------------------------------------------------------------------------
 * Motor REAL de gematria hebrea. Fuente de verdad UNICA para:
 *   - Valores de letras: Mispar Hechrachi (estandar), Gadol, Siduri (ordinal),
 *     Katan (digito), Milui (deletreo).
 *   - Temurot (cifrados): Atbash, Albam, Avgad, Atbach.
 *   - Reducciones teosoficas (con numeros maestros 11/22/33).
 *   - Transliteracion ES/EN -> hebreo (misma convencion que
 *     tonyblanco-app/lib/gematria-engine.ts, para coherencia en toda la app).
 *
 * NOTA CABALISTICA / READ-ONLY:
 *   Este modulo SOLO calcula (valores, casas, ausencias, dominantes). NO
 *   interpreta, NO diagnostica y NO "concluye" (SWM v1). Los deletreos de Milui
 *   y la temurah elegida (Atbach) son variantes documentadas y editables aqui;
 *   un cabalista puede ajustarlas en un solo lugar.
 * ---------------------------------------------------------------------------
 */

// 22 letras en orden canonico
export const LETRAS_BASE = [
	'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ',
	'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת',
] as const;

// Finales -> su letra base
export const FINAL_A_BASE: Record<string, string> = {
	'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ',
};

// --- Mispar Hechrachi (valor absoluto estandar) ---
export const MISPAR_HECHRACHI: Record<string, number> = {
	'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
	'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
	'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
	'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90,
};

// --- Mispar Gadol (finales 500-900; convención canónica del repo) ---
// ך=500, ם=600, ן=700, ף=800, ץ=900 — alineado con cabala tradicional y tests.
export const MISPAR_GADOL: Record<string, number> = {
	...MISPAR_HECHRACHI,
	'ך': 500, 'ם': 600, 'ן': 700, 'ף': 800, 'ץ': 900,
};

// --- Mispar Siduri (ordinal 1-22; finales = ordinal de su base) ---
export const MISPAR_SIDURI: Record<string, number> = (() => {
	const m: Record<string, number> = {};
	LETRAS_BASE.forEach((l, i) => { m[l] = i + 1; });
	for (const [f, b] of Object.entries(FINAL_A_BASE)) m[f] = m[b];
	return m;
})();

// Primer digito significativo (regla del Mispar Katan por letra): 10->1, 400->4...
export function digitoKatan(valor: number): number {
	let v = Math.abs(valor);
	while (v >= 10) v = Math.floor(v / 10);
	return v;
}

// --- Mispar Katan (cada letra reducida a 1-9) ---
export const MISPAR_KATAN: Record<string, number> = (() => {
	const m: Record<string, number> = {};
	for (const [l, v] of Object.entries(MISPAR_HECHRACHI)) m[l] = digitoKatan(v);
	return m;
})();

// --- Milui: deletreo de cada letra (variante comun, documentada y editable) ---
export const MILUI_DELETREO: Record<string, string> = {
	'א': 'אלפ', 'ב': 'בית', 'ג': 'גימל', 'ד': 'דלת', 'ה': 'הא',
	'ו': 'וו', 'ז': 'זין', 'ח': 'חית', 'ט': 'טית', 'י': 'יוד',
	'כ': 'כף', 'ל': 'למד', 'מ': 'מם', 'נ': 'נון', 'ס': 'סמך',
	'ע': 'עין', 'פ': 'פא', 'צ': 'צדי', 'ק': 'קוף', 'ר': 'ריש',
	'ש': 'שין', 'ת': 'תו',
};

export function valorMilui(letra: string): number {
	const base = FINAL_A_BASE[letra] ?? letra;
	const deletreo = MILUI_DELETREO[base];
	if (!deletreo) return 0;
	return [...deletreo].reduce((s, ch) => s + (MISPAR_HECHRACHI[ch] ?? 0), 0);
}

export const MISPAR_MILUI: Record<string, number> = (() => {
	const m: Record<string, number> = {};
	for (const l of LETRAS_BASE) m[l] = valorMilui(l);
	for (const [f, b] of Object.entries(FINAL_A_BASE)) m[f] = m[b];
	return m;
})();

// ---------------------------------------------------------------------------
// Temurot (cifrados de sustitucion)
// ---------------------------------------------------------------------------

// Atbash: inversion del alfabeto (alef<->tav, bet<->shin...)
export const ATBASH: Record<string, string> = (() => {
	const m: Record<string, string> = {};
	LETRAS_BASE.forEach((l, i) => { m[l] = LETRAS_BASE[LETRAS_BASE.length - 1 - i]; });
	for (const [f, b] of Object.entries(FINAL_A_BASE)) m[f] = m[b];
	return m;
})();

// Albam: intercambia las dos mitades de 11 letras (alef<->lamed...)
export const ALBAM: Record<string, string> = (() => {
	const m: Record<string, string> = {};
	for (let i = 0; i < 11; i++) {
		const a = LETRAS_BASE[i];
		const b = LETRAS_BASE[i + 11];
		m[a] = b; m[b] = a;
	}
	for (const [f, b] of Object.entries(FINAL_A_BASE)) m[f] = m[b];
	return m;
})();

// Avgad: cada letra -> la siguiente (ciclico, tav -> alef)
export const AVGAD: Record<string, string> = (() => {
	const m: Record<string, string> = {};
	LETRAS_BASE.forEach((l, i) => { m[l] = LETRAS_BASE[(i + 1) % LETRAS_BASE.length]; });
	for (const [f, b] of Object.entries(FINAL_A_BASE)) m[f] = m[b];
	return m;
})();

// Atbach (temurah por complemento a 10/100/1000). Mapea algunas letras a finales
// (centenas altas), por lo que el resultado se valora con Mispar Gadol.
export const ATBACH: Record<string, string> = {
	'א': 'ט', 'ט': 'א', 'ב': 'ח', 'ח': 'ב', 'ג': 'ז', 'ז': 'ג', 'ד': 'ו', 'ו': 'ד', 'ה': 'ה',
	'י': 'צ', 'צ': 'י', 'כ': 'פ', 'פ': 'כ', 'ל': 'ע', 'ע': 'ל', 'מ': 'ס', 'ס': 'מ', 'נ': 'נ',
	'ק': 'ץ', 'ץ': 'ק', 'ר': 'ף', 'ף': 'ר', 'ש': 'ן', 'ן': 'ש', 'ת': 'ם', 'ם': 'ת', 'ך': 'ך',
};

// ---------------------------------------------------------------------------
// Transliteracion ES/EN -> hebreo (coherente con gematria-engine.ts)
// ---------------------------------------------------------------------------
export const TRANSLITERACION: Record<string, string> = {
	'a': 'א', 'b': 'ב', 'c': 'ק', 'd': 'ד', 'e': 'ה', 'f': 'פ', 'g': 'ג', 'h': 'ה', 'i': 'י',
	'j': 'ח', 'k': 'ק', 'l': 'ל', 'm': 'מ', 'n': 'נ', 'ñ': 'ני', 'o': 'ו', 'p': 'פ', 'q': 'ק',
	'r': 'ר', 's': 'ס', 't': 'ט', 'u': 'ו', 'v': 'ב', 'w': 'ו', 'x': 'קס', 'y': 'י', 'z': 'ז',
};
const DIGRAFOS: Record<string, string> = {
	'ph': 'פ', 'ch': 'ח', 'sh': 'ש', 'th': 'ת', 'tz': 'צ', 'ts': 'צ', 'kh': 'ח', 'gh': 'ג',
};

export function esHebreo(texto: string): boolean {
	return /[\u0590-\u05FF]/.test(texto);
}

export function transliterarAHebreo(texto: string): string {
	if (!texto) return '';
	const t = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	let result = '';
	let i = 0;
	while (i < t.length) {
		let matched = false;
		for (const [pat, heb] of Object.entries(DIGRAFOS)) {
			if (t.substr(i, pat.length) === pat) { result += heb; i += pat.length; matched = true; break; }
		}
		if (!matched) {
			const ch = t[i];
			result += TRANSLITERACION[ch] ?? ch; // conserva espacios/digitos/otros
			i++;
		}
	}
	return result;
}

export function normalizarHebreo(texto: string): string {
	if (!texto) return '';
	return esHebreo(texto) ? texto : transliterarAHebreo(texto);
}

// ---------------------------------------------------------------------------
// Reducciones
// ---------------------------------------------------------------------------
export const NUMEROS_MAESTROS = new Set([11, 22, 33]);

export function reducirTeosofica(n: number): number {
	let v = Math.abs(Math.trunc(n));
	while (v > 9) v = String(v).split('').reduce((s, d) => s + parseInt(d, 10), 0);
	return v;
}

export interface NumeroReducido { original: number; reducido: number; esMaestro: boolean; }

export function reducirMaestros(valor: number): NumeroReducido {
	const original = Math.abs(Math.trunc(valor));
	if (original >= 1 && original <= 9) return { original, reducido: original, esMaestro: false };
	if (NUMEROS_MAESTROS.has(original)) return { original, reducido: original, esMaestro: true };
	let t = original;
	while (t > 9 && !NUMEROS_MAESTROS.has(t)) {
		t = String(t).split('').reduce((s, d) => s + parseInt(d, 10), 0);
	}
	return { original, reducido: t, esMaestro: NUMEROS_MAESTROS.has(t) };
}

// Casa (1-9) de un valor de letra: raiz digital teosofica.
function casaDe(valor: number): number {
	if (!valor || valor <= 0) return 0;
	return reducirTeosofica(valor);
}

// Matres lectionis (letras que funcionan como vocales en hebreo)
export const LETRAS_VOCALICAS = new Set(['א', 'ה', 'ו', 'י']);
export function esVocalHebrea(letra: string): boolean {
	const base = FINAL_A_BASE[letra] ?? letra;
	return LETRAS_VOCALICAS.has(base);
}

// ---------------------------------------------------------------------------
// Tipos de salida (contrato consumido por adapters y CabalAppliedVisualCore)
// ---------------------------------------------------------------------------
export interface EntradaCalculo {
	nombreCompleto: string;
	fechaNacimiento: { dia: number; mes: number; anio: number };
}

export interface CasaInclusion { numero: number; conteo: number; letras: string[]; }
export interface LetraAnalizada { letra: string; valor: number; casa: number; esVocal: boolean; }
export interface CaminoVida extends NumeroReducido { edadTransformacion: number; }

export interface AnalisisGematrico {
	identidad: { nombreCompleto: string; fechaNacimiento: string };
	textoHebreo: string;
	textoEvaluado: string;
	textoTransformado?: string;
	valorTotal: number;
	valorReducido: number;
	numeros: {
		esencia: NumeroReducido;
		expresion: NumeroReducido;
		herencia: NumeroReducido;
		caminoVida: CaminoVida;
	};
	casasInclusion: Record<number, CasaInclusion>;
	ausencias: number[];
	dominantes: number[];
	letrasAnalizadas: LetraAnalizada[];
}

export function valorPorTabla(tabla: Record<string, number>): (ch: string) => number {
	return (ch: string) => tabla[ch] ?? 0;
}

export function aplicarCifrado(textoHebreo: string, mapa: Record<string, string>): string {
	return [...textoHebreo].map((ch) => mapa[ch] ?? ch).join('');
}

export function notarikonIniciales(textoHebreo: string): string {
	return textoHebreo.split(/\s+/).filter(Boolean).map((w) => [...w][0]).join('');
}
export function notarikonFinales(textoHebreo: string): string {
	return textoHebreo.split(/\s+/).filter(Boolean).map((w) => { const a = [...w]; return a[a.length - 1]; }).join('');
}

export function calcularCaminoVida(dia: number, mes: number, anio: number): CaminoVida {
	const sumaAnio = String(Math.abs(Math.trunc(anio))).split('').reduce((s, d) => s + parseInt(d, 10), 0);
	const suma = reducirTeosofica(dia) + reducirTeosofica(mes) + sumaAnio;
	const cv = reducirMaestros(suma);
	return { ...cv, edadTransformacion: suma };
}

export function crearMetadatos(metodo: string, sistema: string, descripcionCalculo: string, alfabeto = 'hebrew') {
	return { metodo, sistema, alfabeto, version: '2.0.0', timestamp: new Date().toISOString(), descripcionCalculo };
}

/**
 * Construye el analisis real a partir del texto a valorar y la funcion de valor
 * de cada letra. Comun a los 10 metodos.
 */
export function analizarConValores(params: {
	entrada: EntradaCalculo;
	textoHebreoOriginal: string;
	textoEvaluado: string;
	valorDeLetra: (ch: string) => number;
	textoTransformado?: string;
}): AnalisisGematrico {
	const { entrada, textoHebreoOriginal, textoEvaluado, valorDeLetra, textoTransformado } = params;

	const casas: Record<number, CasaInclusion> = {};
	for (let i = 1; i <= 9; i++) casas[i] = { numero: i, conteo: 0, letras: [] };

	const letras: LetraAnalizada[] = [];
	let total = 0;
	let sumaVocales = 0;
	let sumaConsonantes = 0;

	for (const ch of textoEvaluado) {
		const v = valorDeLetra(ch);
		if (!v || v <= 0) continue;
		const vocal = esVocalHebrea(ch);
		const casa = casaDe(v);
		letras.push({ letra: ch, valor: v, casa, esVocal: vocal });
		total += v;
		if (vocal) sumaVocales += v; else sumaConsonantes += v;
		if (casa >= 1 && casa <= 9) {
			casas[casa].conteo++;
			casas[casa].letras.push(ch);
		}
	}

	const valores = Object.values(casas);
	const ausencias = valores.filter((c) => c.conteo === 0).map((c) => c.numero);
	const maxConteo = valores.reduce((m, c) => Math.max(m, c.conteo), 0);
	const dominantes = maxConteo > 0 ? valores.filter((c) => c.conteo === maxConteo).map((c) => c.numero) : [];

	const caminoVida = calcularCaminoVida(
		entrada.fechaNacimiento.dia,
		entrada.fechaNacimiento.mes,
		entrada.fechaNacimiento.anio,
	);

	return {
		identidad: {
			nombreCompleto: entrada.nombreCompleto,
			fechaNacimiento: `${entrada.fechaNacimiento.anio}-${entrada.fechaNacimiento.mes}-${entrada.fechaNacimiento.dia}`,
		},
		textoHebreo: textoHebreoOriginal,
		textoEvaluado,
		textoTransformado,
		valorTotal: total,
		valorReducido: reducirMaestros(total).reducido,
		numeros: {
			esencia: reducirMaestros(sumaVocales),
			expresion: reducirMaestros(sumaConsonantes),
			herencia: reducirMaestros(total),
			caminoVida,
		},
		casasInclusion: casas,
		ausencias,
		dominantes,
		letrasAnalizadas: letras,
	};
}
