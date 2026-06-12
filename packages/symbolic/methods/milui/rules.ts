import type { MiluiInput } from './types';
import {
	normalizarHebreo,
	analizarConValores,
	valorPorTabla,
	MISPAR_MILUI,
	crearMetadatos,
} from '../../cabala/gematria-core';
import { interpretarAnalisis } from '../../cabala/interpretacion';

const DESCRIPCION = 'Mispar Milui: cada letra vale la gematria de su nombre deletreado (variante estandar documentada).';

export function calcularAnalisisMilui(input: MiluiInput) {
	const hebreo = normalizarHebreo(input.nombreCompleto || '');
	const analisis = analizarConValores({
		entrada: { nombreCompleto: input.nombreCompleto || '', fechaNacimiento: input.fechaNacimiento },
		textoHebreoOriginal: hebreo,
		textoEvaluado: hebreo,
		valorDeLetra: valorPorTabla(MISPAR_MILUI),
	});
	return {
		...analisis,
		metadatos: crearMetadatos('milui', 'milui', DESCRIPCION),
		interpretacion: interpretarAnalisis(analisis, 'milui', DESCRIPCION),
	};
}
