import type { GematriaStandardInput } from './types';
import {
	normalizarHebreo,
	analizarConValores,
	valorPorTabla,
	MISPAR_HECHRACHI,
	crearMetadatos,
} from '../../cabala/gematria-core';
import { interpretarAnalisis } from '../../cabala/interpretacion';

const DESCRIPCION = 'Mispar Hechrachi: valor absoluto estandar de cada letra (alef=1 ... tav=400).';

/**
 * Gematria estandar (Mispar Hechrachi / Ragil): suma el valor absoluto de cada
 * letra hebrea del nombre, mas interpretacion y explicacion del metodo.
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
		metadatos: crearMetadatos('gematria-standard', 'mispar', DESCRIPCION),
		interpretacion: interpretarAnalisis(analisis, 'gematria-standard', DESCRIPCION),
	};
}
