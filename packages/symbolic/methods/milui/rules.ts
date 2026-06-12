import type { MiluiInput } from './types';
import {
	normalizarHebreo,
	analizarConValores,
	valorPorTabla,
	MISPAR_MILUI,
	crearMetadatos,
} from '../../cabala/gematria-core';

/**
 * Mispar Milui: cada letra vale la gematria de su nombre completo deletreado
 * (alef=alef-lamed-pe=111, bet=bet-yod-tav=412 ...). Deletreos en gematria-core.
 */
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
		metadatos: crearMetadatos(
			'milui',
			'milui',
			'Mispar Milui: cada letra vale la gematria de su nombre deletreado (variante estandar documentada).',
		),
	};
}
