import { calcularAnalisisGematriaKatan } from './rules';
import { GEMATRIA_KATAN_METADATA } from './tables';
import type { GematriaKatanInput } from './types';
export function generarAnalisisGematriaKatan(input:GematriaKatanInput) {
	const res = calcularAnalisisGematriaKatan(input);
	return res as any;
}

export function adaptarAEstadoSimbolicoGematriaKatan(res: any): any {
	const pk = [
		{ key: 'esencia', label: 'Esencia', value: res.numeros.esencia.reducido, weight: 1, meaning: { numero: res.numeros.esencia.reducido, titulo: 'Esencia', cualidad: '', descripcion: '' } },
		{ key: 'expresion', label: 'Expresión', value: res.numeros.expresion.reducido, weight: 0.9, meaning: { numero: res.numeros.expresion.reducido, titulo: 'Expresión', cualidad: '', descripcion: '' } },
		{ key: 'herencia', label: 'Herencia', value: res.numeros.herencia.reducido, weight: 0.85, meaning: { numero: res.numeros.herencia.reducido, titulo: 'Herencia', cualidad: '', descripcion: '' } },
		{ key: 'caminoVida', label: 'Camino de Vida', value: res.numeros.caminoVida.reducido, weight: 0.8, meaning: { numero: res.numeros.caminoVida.reducido, titulo: 'Camino', cualidad: '', descripcion: '' } },
	];
	const inclusionMap: any = {};
	for (let i = 1; i <= 9; i++) {
		const c = res.casasInclusion?.[i] ?? { conteo: 0 };
		inclusionMap[i] = { frequency: c.conteo, isAbsent: (res.ausencias || []).includes(i), isDominant: (res.dominantes || []).includes(i) };
	}
	return { methodId: GEMATRIA_KATAN_METADATA.id, methodName: GEMATRIA_KATAN_METADATA.name, primaryNumbers: pk, inclusionMap, rawData: res };
}

export function ejecutarMetodoGematriaKatan(input: GematriaKatanInput) {
	const r = generarAnalisisGematriaKatan(input);
	return adaptarAEstadoSimbolicoGematriaKatan(r);
}
