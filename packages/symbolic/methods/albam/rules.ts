import type { AlbamInput } from './types';
import {
	normalizarHebreo,
	aplicarCifrado,
	ALBAM,
	analizarConValores,
	valorPorTabla,
	MISPAR_HECHRACHI,
	crearMetadatos,
} from '../../cabala/gematria-core';
import { interpretarAnalisis } from '../../cabala/interpretacion';

const DESCRIPCION = 'Albam: intercambio de las dos mitades del alfabeto (alef<->lamed ...); luego gematria estandar.';

export function calcularAnalisisAlbam(input: AlbamInput) {
	const hebreo = normalizarHebreo(input.nombreCompleto || '');
	const transformado = aplicarCifrado(hebreo, ALBAM);
	const analisis = analizarConValores({
		entrada: { nombreCompleto: input.nombreCompleto || '', fechaNacimiento: input.fechaNacimiento },
		textoHebreoOriginal: hebreo,
		textoEvaluado: transformado,
		textoTransformado: transformado,
		valorDeLetra: valorPorTabla(MISPAR_HECHRACHI),
	});
	return {
		...analisis,
		metadatos: crearMetadatos('albam', 'temurah', DESCRIPCION),
		interpretacion: interpretarAnalisis(analisis, 'albam', DESCRIPCION),
	};
}
