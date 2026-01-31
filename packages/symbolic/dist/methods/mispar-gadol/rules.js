import { latinToHebrew, calcMisparGadol, calcGematriaStandard, reduceToSingleDigit, findKnownWords, numberToSefira, MISPAR_GADOL, GEMATRIA_STANDARD } from '../../utils/hebrew-gematria';
/**
 * Calcula Mispar Gadol (Grande)
 * Las letras finales (sofit) tienen valores especiales: ך=500, ם=600, ן=700, ף=800, ץ=900
 */
export function calcularAnalisisMisparGadol(input) {
    const name = input.nombreCompleto || '';
    const dateStr = `${input.fechaNacimiento.anio}-${input.fechaNacimiento.mes}-${input.fechaNacimiento.dia}`;
    const hebrewName = latinToHebrew(name);
    const words = name.split(/\s+/).filter(w => w.length > 0);
    const hebrewWords = words.map(w => latinToHebrew(w));
    const wordValues = hebrewWords.map((hw, idx) => {
        const valueGadol = calcMisparGadol(hw);
        const valueStandard = calcGematriaStandard(hw);
        return {
            original: words[idx],
            hebrew: hw,
            valueGadol,
            valueStandard,
            difference: valueGadol - valueStandard,
            reducedGadol: reduceToSingleDigit(valueGadol),
            letterBreakdown: hw.split('').map(l => ({
                letter: l,
                valueGadol: MISPAR_GADOL[l] || 0,
                valueStandard: GEMATRIA_STANDARD[l] || 0,
                isFinal: ['ך', 'ם', 'ן', 'ף', 'ץ'].includes(l)
            }))
        };
    });
    const totalGadol = wordValues.reduce((sum, w) => sum + w.valueGadol, 0);
    const totalStandard = wordValues.reduce((sum, w) => sum + w.valueStandard, 0);
    const totalGadolReduced = reduceToSingleDigit(totalGadol);
    const { dia, mes, anio } = input.fechaNacimiento;
    const dateSum = dia + mes + anio;
    const caminoVida = reduceToSingleDigit(dateSum);
    const relatedWords = findKnownWords(totalGadol);
    const casasInclusion = {};
    for (let i = 1; i <= 9; i++) {
        casasInclusion[i] = { numero: i, conteo: 0, letras: [] };
    }
    hebrewWords.forEach(hw => {
        hw.split('').forEach(letter => {
            const val = MISPAR_GADOL[letter];
            if (val) {
                const reduced = reduceToSingleDigit(val).reduced;
                if (reduced >= 1 && reduced <= 9) {
                    casasInclusion[reduced].conteo++;
                    casasInclusion[reduced].letras.push(letter);
                }
            }
        });
    });
    const ausencias = Object.keys(casasInclusion).filter(k => casasInclusion[Number(k)].conteo === 0).map(k => Number(k));
    const maxConteo = Math.max(...Object.values(casasInclusion).map(c => c.conteo));
    const dominantes = Object.keys(casasInclusion).filter(k => casasInclusion[Number(k)].conteo === maxConteo && maxConteo > 0).map(k => Number(k));
    const sefira = numberToSefira(totalGadolReduced.reduced);
    return {
        identidad: {
            nombreCompleto: name,
            hebrewTransliteration: hebrewName,
            fechaNacimiento: dateStr,
        },
        calculo: {
            metodo: 'Mispar Gadol (Grande)',
            descripcion: 'Las letras finales (sofit) tienen valores expandidos: ך=500, ם=600, ן=700, ף=800, ץ=900',
            explicacion: 'El Mispar Gadol asigna valores mayores a las letras finales, representando potencial oculto o manifestación completa.',
            palabras: wordValues,
            valorGadol: totalGadol,
            valorStandard: totalStandard,
            diferencia: totalGadol - totalStandard,
            valorReducido: totalGadolReduced,
            palabrasRelacionadas: relatedWords,
        },
        numeros: {
            esencia: { original: totalGadol, reducido: totalGadolReduced.reduced, esMaestro: totalGadolReduced.isMaster },
            expresion: { original: wordValues[0]?.valueGadol || 0, reducido: wordValues[0]?.reducedGadol.reduced || 1, esMaestro: false },
            herencia: { original: wordValues[wordValues.length - 1]?.valueGadol || 0, reducido: wordValues[wordValues.length - 1]?.reducedGadol.reduced || 1, esMaestro: false },
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
            metodo: 'mispar-gadol',
            sistema: 'mispar',
            alfabeto: 'hebrew',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
        },
    };
}
