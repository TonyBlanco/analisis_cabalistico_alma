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
import { interpretarAnalisis } from '../../cabala/interpretacion';

const DESCRIPCION = 'Temurah (Atbach): sustitucion por complemento a 10/100/1000; luego gematria con finales (Gadol).';

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
		metadatos: crearMetadatos('temurah', 'temurah', DESCRIPCION),
		interpretacion: interpretarAnalisis(analisis, 'temurah', DESCRIPCION),
	};
}
