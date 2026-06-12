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
import { interpretarAnalisis } from '../../cabala/interpretacion';

const DESCRIPCION = 'Avgad: cada letra -> la siguiente (alef->bet ... tav->alef); luego gematria estandar.';

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
		metadatos: crearMetadatos('avgad', 'temurah', DESCRIPCION),
		interpretacion: interpretarAnalisis(analisis, 'avgad', DESCRIPCION),
	};
}
