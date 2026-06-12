import type { GematriaStandardInput } from './types';
import {
	normalizarHebreo,
	analizarConValores,
	valorPorTabla,
	MISPAR_HECHRACHI,
	crearMetadatos,
} from '../../cabala/gematria-core';

/**
 * Gematria estandar (Mispar Hechrachi / Ragil).
 * Suma el valor absoluto de cada letra hebrea del nombre.
 */
export function calcularAnalisisGematriaStandard(input: GematriaStandardInput) {
	const hebreo = normalizarHebreo(input.nombreCompleto || '');
	const analisis = analizarConValores({
		entrada: { nombreCompleto: input.nombreCompleto || '', fechaNacimiento: input.fechaNacimiento },
		textoHebreoOriginal: hebreo,
		textoEvaluado: hebreo,
		valorDeLetra: valorPorTabla(MISPAR_HECHRACHI),
	});
	return {
		...analisis,
		metadatos: crearMetadatos(
			'gematria-standard',
			'mispar',
			'Mispar Hechrachi: valor absoluto estandar de cada letra (alef=1 ... tav=400).',
		),
	};
}
