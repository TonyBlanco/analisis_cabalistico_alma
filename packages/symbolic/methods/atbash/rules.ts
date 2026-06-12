import type { AtbashInput } from './types';
import {
	normalizarHebreo,
	aplicarCifrado,
	ATBASH,
	analizarConValores,
	valorPorTabla,
	MISPAR_HECHRACHI,
	crearMetadatos,
} from '../../cabala/gematria-core';

/**
 * Atbash: cifrado por inversion del alfabeto (alef<->tav, bet<->shin ...);
 * luego gematria estandar del texto transformado.
 */
export function calcularAnalisisAtbash(input: AtbashInput) {
	const hebreo = normalizarHebreo(input.nombreCompleto || '');
	const transformado = aplicarCifrado(hebreo, ATBASH);
	const analisis = analizarConValores({
		entrada: { nombreCompleto: input.nombreCompleto || '', fechaNacimiento: input.fechaNacimiento },
		textoHebreoOriginal: hebreo,
		textoEvaluado: transformado,
		textoTransformado: transformado,
		valorDeLetra: valorPorTabla(MISPAR_HECHRACHI),
	});
	return {
		...analisis,
		metadatos: crearMetadatos(
			'atbash',
			'temurah',
			'Atbash: inversion del alfabeto (alef<->tav, bet<->shin ...); luego gematria estandar.',
		),
	};
}
