import type { NotarikonInput } from './types';
import {
	normalizarHebreo,
	notarikonIniciales,
	notarikonFinales,
	analizarConValores,
	valorPorTabla,
	MISPAR_HECHRACHI,
	crearMetadatos,
} from '../../cabala/gematria-core';

/**
 * Notarikon: rashei tevot (iniciales de cada palabra) y sofei tevot (finales).
 * Se valora la cadena de iniciales con gematria estandar.
 */
export function calcularAnalisisNotarikon(input: NotarikonInput) {
	const hebreo = normalizarHebreo(input.nombreCompleto || '');
	const iniciales = notarikonIniciales(hebreo);
	const finales = notarikonFinales(hebreo);
	const analisis = analizarConValores({
		entrada: { nombreCompleto: input.nombreCompleto || '', fechaNacimiento: input.fechaNacimiento },
		textoHebreoOriginal: hebreo,
		textoEvaluado: iniciales,
		textoTransformado: iniciales,
		valorDeLetra: valorPorTabla(MISPAR_HECHRACHI),
	});
	return {
		...analisis,
		rasheiTevot: iniciales,
		sofeiTevot: finales,
		metadatos: crearMetadatos(
			'notarikon',
			'notarikon',
			`Notarikon: rashei tevot (iniciales) -> "${iniciales}"; sofei tevot (finales) -> "${finales}". Gematria estandar de las iniciales.`,
		),
	};
}
