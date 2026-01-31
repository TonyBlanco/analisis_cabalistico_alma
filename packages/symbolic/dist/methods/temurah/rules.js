import { latinToHebrew, atbashTransform, albamTransform, avgadTransform, ayakBakarTransform, calcGematriaStandard, reduceToSingleDigit, findKnownWords, numberToSefira, GEMATRIA_STANDARD } from '../../utils/hebrew-gematria';
/**
 * Calcula Temurah - Sistema completo de transformaciones
 * Incluye: Atbash, Albam, Avgad, Ayak Bakar
 */
export function calcularAnalisisTemurah(input) {
    const name = input.nombreCompleto || '';
    const dateStr = `${input.fechaNacimiento.anio}-${input.fechaNacimiento.mes}-${input.fechaNacimiento.dia}`;
    const hebrewName = latinToHebrew(name);
    const words = name.split(/\s+/).filter(w => w.length > 0);
    const hebrewWords = words.map(w => latinToHebrew(w));
    const fullHebrew = hebrewWords.join('');
    // Aplicar todas las transformaciones
    const transformations = {
        original: {
            text: fullHebrew,
            value: calcGematriaStandard(fullHebrew),
            reduced: reduceToSingleDigit(calcGematriaStandard(fullHebrew))
        },
        atbash: {
            text: fullHebrew.split('').map(atbashTransform).join(''),
            value: 0,
            reduced: { original: 0, reduced: 0, isMaster: false },
            description: 'Inversión del alfabeto: א↔ת'
        },
        albam: {
            text: fullHebrew.split('').map(albamTransform).join(''),
            value: 0,
            reduced: { original: 0, reduced: 0, isMaster: false },
            description: 'Intercambio de mitades: א↔ל'
        },
        avgad: {
            text: fullHebrew.split('').map(avgadTransform).join(''),
            value: 0,
            reduced: { original: 0, reduced: 0, isMaster: false },
            description: 'Avance de una posición: א→ב'
        },
        ayakBakar: {
            text: fullHebrew.split('').map(ayakBakarTransform).join(''),
            value: 0,
            reduced: { original: 0, reduced: 0, isMaster: false },
            description: 'Grupos de 9: unidades↔decenas↔centenas'
        }
    };
    // Calcular valores para cada transformación
    ['atbash', 'albam', 'avgad', 'ayakBakar'].forEach(key => {
        transformations[key].value = calcGematriaStandard(transformations[key].text);
        transformations[key].reduced = reduceToSingleDigit(transformations[key].value);
    });
    const { dia, mes, anio } = input.fechaNacimiento;
    const dateSum = dia + mes + anio;
    const caminoVida = reduceToSingleDigit(dateSum);
    // Encontrar palabras relacionadas
    const relatedWords = {
        original: findKnownWords(transformations.original.value),
        atbash: findKnownWords(transformations.atbash.value),
        albam: findKnownWords(transformations.albam.value),
        avgad: findKnownWords(transformations.avgad.value),
        ayakBakar: findKnownWords(transformations.ayakBakar.value),
    };
    // Casas de inclusión del original
    const casasInclusion = {};
    for (let i = 1; i <= 9; i++) {
        casasInclusion[i] = { numero: i, conteo: 0, letras: [] };
    }
    fullHebrew.split('').forEach(letter => {
        const val = GEMATRIA_STANDARD[letter];
        if (val) {
            const reduced = reduceToSingleDigit(val).reduced;
            if (reduced >= 1 && reduced <= 9) {
                casasInclusion[reduced].conteo++;
                casasInclusion[reduced].letras.push(letter);
            }
        }
    });
    const ausencias = Object.keys(casasInclusion).filter(k => casasInclusion[Number(k)].conteo === 0).map(k => Number(k));
    const maxConteo = Math.max(...Object.values(casasInclusion).map(c => c.conteo));
    const dominantes = Object.keys(casasInclusion).filter(k => casasInclusion[Number(k)].conteo === maxConteo && maxConteo > 0).map(k => Number(k));
    // Correspondencias sefiróticas
    const sefiraOriginal = numberToSefira(transformations.original.reduced.reduced);
    const sefiraAtbash = numberToSefira(transformations.atbash.reduced.reduced);
    return {
        identidad: {
            nombreCompleto: name,
            hebrewOriginal: hebrewWords.join(' '),
            fechaNacimiento: dateStr,
        },
        calculo: {
            metodo: 'Temurah (Permutación)',
            descripcion: 'Sistema de cifrados y permutaciones del alfabeto hebreo',
            explicacion: 'Temurah revela significados ocultos mediante diferentes sistemas de sustitución de letras.',
            transformaciones: transformations,
            palabrasRelacionadas: relatedWords,
        },
        numeros: {
            esencia: { original: transformations.original.value, reducido: transformations.original.reduced.reduced, esMaestro: transformations.original.reduced.isMaster },
            expresion: { original: transformations.atbash.value, reducido: transformations.atbash.reduced.reduced, esMaestro: transformations.atbash.reduced.isMaster },
            herencia: { original: transformations.albam.value, reducido: transformations.albam.reduced.reduced, esMaestro: transformations.albam.reduced.isMaster },
            caminoVida: { original: dateSum, reducido: caminoVida.reduced, esMaestro: caminoVida.isMaster, edadTransformacion: 0 },
        },
        correspondencia: {
            sefiraOriginal: sefiraOriginal.name,
            sefirahOriginalHebrew: sefiraOriginal.hebrew,
            sefirahOriginalMeaning: sefiraOriginal.meaning,
            sefiraAtbash: sefiraAtbash.name,
            cambioEnergetico: sefiraOriginal.name !== sefiraAtbash.name
                ? `De ${sefiraOriginal.meaning} a ${sefiraAtbash.meaning}`
                : 'Sin cambio de correspondencia',
        },
        casasInclusion,
        ausencias,
        dominantes,
        metadatos: {
            metodo: 'temurah',
            sistema: 'temurah',
            alfabeto: 'hebrew',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
        },
    };
}
