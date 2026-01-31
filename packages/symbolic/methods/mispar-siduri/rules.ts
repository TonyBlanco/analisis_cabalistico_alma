import type { MisparSiduriInput } from './types';
import { 
  latinToHebrew, 
  calcMisparSiduri,
  reduceToSingleDigit,
  numberToSefira,
  MISPAR_SIDURI,
  GEMATRIA_STANDARD
} from '../../utils/hebrew-gematria';

/**
 * Calcula Mispar Siduri (Ordinal)
 * Posición en el alfabeto: א=1, ב=2, ... ת=22
 */
export function calcularAnalisisMisparSiduri(input: MisparSiduriInput) {
  const name = input.nombreCompleto || '';
  const dateStr = `${input.fechaNacimiento.anio}-${input.fechaNacimiento.mes}-${input.fechaNacimiento.dia}`;
  
  const hebrewName = latinToHebrew(name);
  const words = name.split(/\s+/).filter(w => w.length > 0);
  const hebrewWords = words.map(w => latinToHebrew(w));
  
  const wordValues = hebrewWords.map((hw, idx) => {
    const valueSiduri = calcMisparSiduri(hw);
    const valueStandard = hw.split('').reduce((sum, l) => sum + (GEMATRIA_STANDARD[l] || 0), 0);
    
    return {
      original: words[idx],
      hebrew: hw,
      valueSiduri,
      valueStandard,
      reducedSiduri: reduceToSingleDigit(valueSiduri),
      letterBreakdown: hw.split('').map(l => ({ 
        letter: l, 
        position: MISPAR_SIDURI[l] || 0,
        valueStandard: GEMATRIA_STANDARD[l] || 0
      }))
    };
  });
  
  const totalSiduri = wordValues.reduce((sum, w) => sum + w.valueSiduri, 0);
  const totalSiduriReduced = reduceToSingleDigit(totalSiduri);
  
  const { dia, mes, anio } = input.fechaNacimiento;
  const dateSum = dia + mes + anio;
  const caminoVida = reduceToSingleDigit(dateSum);
  
  const casasInclusion: Record<number, { numero: number; conteo: number; letras: string[] }> = {};
  for (let i = 1; i <= 9; i++) {
    casasInclusion[i] = { numero: i, conteo: 0, letras: [] };
  }
  
  hebrewWords.forEach(hw => {
    hw.split('').forEach(letter => {
      const pos = MISPAR_SIDURI[letter];
      if (pos) {
        const reduced = reduceToSingleDigit(pos).reduced;
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
  
  const sefira = numberToSefira(totalSiduriReduced.reduced);
  
  return {
    identidad: {
      nombreCompleto: name,
      hebrewTransliteration: hebrewName,
      fechaNacimiento: dateStr,
    },
    calculo: {
      metodo: 'Mispar Siduri (Ordinal)',
      descripcion: 'Usa la posición de cada letra en el alfabeto: א=1, ב=2, ... ת=22',
      explicacion: 'El Mispar Siduri revela el orden y secuencia inherente en las letras, conectando con el proceso de creación.',
      palabras: wordValues,
      valorTotal: totalSiduri,
      valorReducido: totalSiduriReduced,
    },
    numeros: {
      esencia: { original: totalSiduri, reducido: totalSiduriReduced.reduced, esMaestro: totalSiduriReduced.isMaster },
      expresion: { original: wordValues[0]?.valueSiduri || 0, reducido: wordValues[0]?.reducedSiduri.reduced || 1, esMaestro: false },
      herencia: { original: wordValues[wordValues.length - 1]?.valueSiduri || 0, reducido: wordValues[wordValues.length - 1]?.reducedSiduri.reduced || 1, esMaestro: false },
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
      metodo: 'mispar-siduri',
      sistema: 'mispar',
      alfabeto: 'hebrew',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  };
}
