import { latinToHebrew, calcGematriaStandard, reduceToSingleDigit, findKnownWords, numberToSefira, GEMATRIA_STANDARD } from '../../utils/hebrew-gematria';
/**
 * Calcula Gematría Estándar (Mispar Hechrachi)
 * Suma directa de valores tradicionales de letras hebreas
 */
export function calcularAnalisisGematriaStandard(input) {
    const name = input.nombreCompleto || '';
    const dateStr = `${input.fechaNacimiento.anio}-${input.fechaNacimiento.mes}-${input.fechaNacimiento.dia}`;
    // Convertir nombre a hebreo (aproximación fonética)
    const hebrewName = latinToHebrew(name);
    const words = name.split(/\s+/).filter(w => w.length > 0);
    const hebrewWords = words.map(w => latinToHebrew(w));
    // Calcular valores para cada palabra y total
    const wordValues = hebrewWords.map((hw, idx) => ({
        original: words[idx],
        hebrew: hw,
        value: calcGematriaStandard(hw),
        reduced: reduceToSingleDigit(calcGematriaStandard(hw)),
        letterBreakdown: hw.split('').map(l => ({ letter: l, value: GEMATRIA_STANDARD[l] || 0 }))
    }));
    const totalValue = wordValues.reduce((sum, w) => sum + w.value, 0);
    const totalReduced = reduceToSingleDigit(totalValue);
    // Números fundamentales (basados en fechas)
    const { dia, mes, anio } = input.fechaNacimiento;
    const dateSum = dia + mes + anio;
    const caminoVida = reduceToSingleDigit(dateSum);
    // Número del día
    const diaReduced = reduceToSingleDigit(dia);
    // Número del mes
    const mesReduced = reduceToSingleDigit(mes);
    // Número del año
    const anioReduced = reduceToSingleDigit(anio);
    // Casas de inclusión (frecuencia de cada dígito 1-9)
    const casasInclusion = {};
    for (let i = 1; i <= 9; i++) {
        casasInclusion[i] = { numero: i, conteo: 0, letras: [] };
    }
    // Contar frecuencias de los valores reducidos
    hebrewWords.forEach(hw => {
        hw.split('').forEach(letter => {
            const val = GEMATRIA_STANDARD[letter];
            if (val) {
                const reduced = reduceToSingleDigit(val).reduced;
                if (reduced >= 1 && reduced <= 9) {
                    casasInclusion[reduced].conteo++;
                    casasInclusion[reduced].letras.push(letter);
                }
            }
        });
    });
    // Identificar ausencias y dominantes
    const ausencias = Object.keys(casasInclusion)
        .filter(k => casasInclusion[Number(k)].conteo === 0)
        .map(k => Number(k));
    const maxConteo = Math.max(...Object.values(casasInclusion).map(c => c.conteo));
    const dominantes = Object.keys(casasInclusion)
        .filter(k => casasInclusion[Number(k)].conteo === maxConteo && maxConteo > 0)
        .map(k => Number(k));
    // Palabras conocidas con mismo valor
    const relatedWords = findKnownWords(totalValue);
    // Correspondencia sefirótica
    const sefira = numberToSefira(totalReduced.reduced);
    return {
        identidad: {
            nombreCompleto: name,
            hebrewTransliteration: hebrewName,
            fechaNacimiento: dateStr,
        },
        calculo: {
            metodo: 'Gematría Estándar (Mispar Hechrachi)',
            descripcion: 'Suma directa de valores tradicionales de letras hebreas',
            palabras: wordValues,
            valorTotal: totalValue,
            valorReducido: totalReduced,
            palabrasRelacionadas: relatedWords,
        },
        numeros: {
            esencia: { original: totalValue, reducido: totalReduced.reduced, esMaestro: totalReduced.isMaster },
            expresion: { original: wordValues[0]?.value || 0, reducido: wordValues[0]?.reduced.reduced || 1, esMaestro: wordValues[0]?.reduced.isMaster || false },
            herencia: { original: wordValues[wordValues.length - 1]?.value || 0, reducido: wordValues[wordValues.length - 1]?.reduced.reduced || 1, esMaestro: false },
            caminoVida: { original: dateSum, reducido: caminoVida.reduced, esMaestro: caminoVida.isMaster, edadTransformacion: 0 },
        },
        casasInclusion,
        ausencias,
        dominantes,
        correspondencia: {
            sefira: sefira.name,
            sefirahHebrew: sefira.hebrew,
            sefirahMeaning: sefira.meaning,
        },
        metadatos: {
            metodo: 'gematria-standard',
            sistema: 'gematria',
            alfabeto: 'hebrew-classic',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
        },
    };
}
