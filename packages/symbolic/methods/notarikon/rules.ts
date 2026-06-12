import type { NotarikonInput } from './types';
import {
	normalizarHebreo,
	notarikonIniciales,
	notarikonFinales,
	analizarConValores,
	valorPorTabla,
	MISPAR_HECHRACHI,
	crearMetadatos,
} from '../../cabala/gematria-core';
import { interpretarAnalisis } from '../../cabala/interpretacion';

export function calcularAnalisisNotarikon(input: NotarikonInput) {
	const hebreo = normalizarHebreo(input.nombreCompleto || '');
	const iniciales = notarikonIniciales(hebreo);
	const finales = notarikonFinales(hebreo);
	const DESCRIPCION = `Notarikon: rashei tevot (iniciales) -> "${iniciales}"; sofei tevot (finales) -> "${finales}". Gematria estandar de las iniciales.`;
	const analisis = analizarConValores({
		entrada: { nombreCompleto: input.nombreCompleto || '', fechaNacimiento: input.fechaNacimiento },
		textoHebreoOriginal: hebreo,
		textoEvaluado: iniciales,
		textoTransformado: iniciales,
		valorDeLetra: valorPorTabla(MISPAR_HECHRACHI),
	});
	return {
		...analisis,
		rasheiTevot: iniciales,
		sofeiTevot: finales,
		metadatos: crearMetadatos('notarikon', 'notarikon', DESCRIPCION),
		interpretacion: interpretarAnalisis(analisis, 'notarikon', DESCRIPCION),
	};
}
