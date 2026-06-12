import type { TemurahInput } from './types';
import {
	normalizarHebreo,
	aplicarCifrado,
	ATBACH,
	analizarConValores,
	valorPorTabla,
	MISPAR_GADOL,
	crearMetadatos,
} from '../../cabala/gematria-core';

/**
 * Temurah (Atbach / aleph-tet-bet-het): sustitucion por complemento a 10/100/1000.
 * Mapea letras a finales (centenas altas), por lo que se valora con Mispar Gadol.
 */
export function calcularAnalisisTemurah(input: TemurahInput) {
	const hebreo = normalizarHebreo(input.nombreCompleto || '');
	const transformado = aplicarCifrado(hebreo, ATBACH);
	const analisis = analizarConValores({
		entrada: { nombreCompleto: input.nombreCompleto || '', fechaNacimiento: input.fechaNacimiento },
		textoHebreoOriginal: hebreo,
		textoEvaluado: transformado,
		textoTransformado: transformado,
		valorDeLetra: valorPorTabla(MISPAR_GADOL),
	});
	return {
		...analisis,
		metadatos: crearMetadatos(
			'temurah',
			'temurah',
			'Temurah (Atbach): sustitucion por complemento a 10/100/1000; luego gematria con finales (Gadol).',
		),
	};
}
