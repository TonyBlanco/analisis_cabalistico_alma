import type { AvgadInput } from './types';
import {
	normalizarHebreo,
	aplicarCifrado,
	AVGAD,
	analizarConValores,
	valorPorTabla,
	MISPAR_HECHRACHI,
	crearMetadatos,
} from '../../cabala/gematria-core';

/**
 * Avgad: cada letra se sustituye por la siguiente (alef->bet ... tav->alef);
 * luego gematria estandar del texto transformado.
 */
export function calcularAnalisisAvgad(input: AvgadInput) {
	const hebreo = normalizarHebreo(input.nombreCompleto || '');
	const transformado = aplicarCifrado(hebreo, AVGAD);
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
			'avgad',
			'temurah',
			'Avgad: cada letra -> la siguiente (alef->bet ... tav->alef); luego gematria estandar.',
		),
	};
}
