import type { MisparSiduriInput } from './types';
import {
	normalizarHebreo,
	analizarConValores,
	valorPorTabla,
	MISPAR_SIDURI,
	crearMetadatos,
} from '../../cabala/gematria-core';
import { interpretarAnalisis } from '../../cabala/interpretacion';

const DESCRIPCION = 'Mispar Siduri: valor ordinal de cada letra (alef=1 ... tav=22).';

export function calcularAnalisisMisparSiduri(input: MisparSiduriInput) {
	const hebreo = normalizarHebreo(input.nombreCompleto || '');
	const analisis = analizarConValores({
		entrada: { nombreCompleto: input.nombreCompleto || '', fechaNacimiento: input.fechaNacimiento },
		textoHebreoOriginal: hebreo,
		textoEvaluado: hebreo,
		valorDeLetra: valorPorTabla(MISPAR_SIDURI),
	});
	return {
		...analisis,
		metadatos: crearMetadatos('mispar-siduri', 'mispar', DESCRIPCION),
		interpretacion: interpretarAnalisis(analisis, 'mispar-siduri', DESCRIPCION),
	};
}
