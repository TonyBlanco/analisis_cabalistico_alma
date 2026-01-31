import type { GematriaKatanInput } from './types';
import { 
  latinToHebrew, 
  calcGematriaKatan,
  reduceToSingleDigit,
  findKnownWords,
  numberToSefira,
  GEMATRIA_KATAN,
  GEMATRIA_STANDARD
} from '../../utils/hebrew-gematria';

/**
 * Calcula Gematría Katan (Pequeña)
 * Cada letra se reduce a un valor de 1-9
 */
export function calcularAnalisisGematriaKatan(input: GematriaKatanInput) {
  const name = input.nombreCompleto || '';
  const dateStr = `${input.fechaNacimiento.anio}-${input.fechaNacimiento.mes}-${input.fechaNacimiento.dia}`;
  
  const hebrewName = latinToHebrew(name);
  const words = name.split(/\s+/).filter(w => w.length > 0);
  const hebrewWords = words.map(w => latinToHebrew(w));
  
  const wordValues = hebrewWords.map((hw, idx) => {
    const valueKatan = calcGematriaKatan(hw);
    const valueStandard = hw.split('').reduce((sum, l) => sum + (GEMATRIA_STANDARD[l] || 0), 0);
    
    return {
      original: words[idx],
      hebrew: hw,
      valueKatan,
      valueStandard,
      reducedKatan: reduceToSingleDigit(valueKatan),
      letterBreakdown: hw.split('').map(l => ({ 
        letter: l, 
        valueKatan: GEMATRIA_KATAN[l] || 0,
        valueStandard: GEMATRIA_STANDARD[l] || 0
      }))
    };
  });
  
  const totalKatan = wordValues.reduce((sum, w) => sum + w.valueKatan, 0);
  const totalKatanReduced = reduceToSingleDigit(totalKatan);
  
  const { dia, mes, anio } = input.fechaNacimiento;
  const dateSum = dia + mes + anio;
  const caminoVida = reduceToSingleDigit(dateSum);
  
  const casasInclusion: Record<number, { numero: number; conteo: number; letras: string[] }> = {};
  for (let i = 1; i <= 9; i++) {
    casasInclusion[i] = { numero: i, conteo: 0, letras: [] };
  }
  
  hebrewWords.forEach(hw => {
    hw.split('').forEach(letter => {
      const val = GEMATRIA_KATAN[letter];
      if (val && val >= 1 && val <= 9) {
        casasInclusion[val].conteo++;
        casasInclusion[val].letras.push(letter);
      }
    });
  });
  
  const ausencias = Object.keys(casasInclusion).filter(k => casasInclusion[Number(k)].conteo === 0).map(k => Number(k));
  const maxConteo = Math.max(...Object.values(casasInclusion).map(c => c.conteo));
  const dominantes = Object.keys(casasInclusion).filter(k => casasInclusion[Number(k)].conteo === maxConteo && maxConteo > 0).map(k => Number(k));
  
  const sefira = numberToSefira(totalKatanReduced.reduced);
  
  return {
    identidad: {
      nombreCompleto: name,
      hebrewTransliteration: hebrewName,
      fechaNacimiento: dateStr,
    },
    calculo: {
      metodo: 'Gematría Katan (Pequeña)',
      descripcion: 'Reduce cada letra a un solo dígito (1-9), revelando esencias numéricas fundamentales.',
      explicacion: 'La Gematría Katan simplifica los valores para revelar patrones básicos y conexiones ocultas entre palabras.',
      palabras: wordValues,
      valorTotal: totalKatan,
      valorReducido: totalKatanReduced,
    },
    numeros: {
      esencia: { original: totalKatan, reducido: totalKatanReduced.reduced, esMaestro: totalKatanReduced.isMaster },
      expresion: { original: wordValues[0]?.valueKatan || 0, reducido: wordValues[0]?.reducedKatan.reduced || 1, esMaestro: false },
      herencia: { original: wordValues[wordValues.length - 1]?.valueKatan || 0, reducido: wordValues[wordValues.length - 1]?.reducedKatan.reduced || 1, esMaestro: false },
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
      metodo: 'gematria-katan',
      sistema: 'gematria-katan',
      alfabeto: 'hebrew-katan',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  };
}
