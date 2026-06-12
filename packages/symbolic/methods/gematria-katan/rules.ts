import type { GematriaKatanInput } from './types';
import {
	normalizarHebreo,
	analizarConValores,
	valorPorTabla,
	MISPAR_KATAN,
	crearMetadatos,
} from '../../cabala/gematria-core';

/**
 * Mispar Katan: cada letra reducida a su digito significativo (10->1, 20->2, 400->4).
 */
export function calcularAnalisisGematriaKatan(input: GematriaKatanInput) {
	const hebreo = normalizarHebreo(input.nombreCompleto || '');
	const analisis = analizarConValores({
		entrada: { nombreCompleto: input.nombreCompleto || '', fechaNacimiento: input.fechaNacimiento },
		textoHebreoOriginal: hebreo,
		textoEvaluado: hebreo,
		valorDeLetra: valorPorTabla(MISPAR_KATAN),
	});
	return {
		...analisis,
		metadatos: crearMetadatos(
			'gematria-katan',
			'mispar',
			'Mispar Katan: cada letra reducida a su digito significativo (10->1, 20->2, 400->4).',
		),
	};
}
