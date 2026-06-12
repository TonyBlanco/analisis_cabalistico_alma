import type { MisparGadolInput } from './types';
import {
	normalizarHebreo,
	analizarConValores,
	valorPorTabla,
	MISPAR_GADOL,
	crearMetadatos,
} from '../../cabala/gematria-core';
import { interpretarAnalisis } from '../../cabala/interpretacion';

const DESCRIPCION = 'Mispar Gadol: estandar con finales 500-900 (kaf=500, mem=600, nun=700, pe=800, tsadi=900).';

export function calcularAnalisisMisparGadol(input: MisparGadolInput) {
	const hebreo = normalizarHebreo(input.nombreCompleto || '');
	const analisis = analizarConValores({
		entrada: { nombreCompleto: input.nombreCompleto || '', fechaNacimiento: input.fechaNacimiento },
		textoHebreoOriginal: hebreo,
		textoEvaluado: hebreo,
		valorDeLetra: valorPorTabla(MISPAR_GADOL),
	});
	return {
		...analisis,
		metadatos: crearMetadatos('mispar-gadol', 'mispar', DESCRIPCION),
		interpretacion: interpretarAnalisis(analisis, 'mispar-gadol', DESCRIPCION),
	};
}
