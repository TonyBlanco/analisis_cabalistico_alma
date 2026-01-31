import type { MiluiInput } from './types';
import { 
  latinToHebrew, 
  calcMilui,
  calcGematriaStandard,
  reduceToSingleDigit,
  findKnownWords,
  numberToSefira,
  MILUI_NAMES,
  GEMATRIA_STANDARD
} from '../../utils/hebrew-gematria';

/**
 * Calcula Milui (Expansión/Relleno)
 * Cada letra se expande a su nombre completo (א → אלף)
 */
export function calcularAnalisisMilui(input: MiluiInput) {
  const name = input.nombreCompleto || '';
  const dateStr = `${input.fechaNacimiento.anio}-${input.fechaNacimiento.mes}-${input.fechaNacimiento.dia}`;
  
  const hebrewName = latinToHebrew(name);
  const words = name.split(/\s+/).filter(w => w.length > 0);
  const hebrewWords = words.map(w => latinToHebrew(w));
  
  const wordValues = hebrewWords.map((hw, idx) => {
    const milui = calcMilui(hw);
    const valueSimple = calcGematriaStandard(hw);
    
    return {
      original: words[idx],
      hebrew: hw,
      expanded: milui.expanded,
      valueMilui: milui.value,
      valueSimple,
      difference: milui.value - valueSimple,
      reducedMilui: reduceToSingleDigit(milui.value),
      letterBreakdown: hw.split('').map(l => ({ 
        letter: l, 
        expansion: MILUI_NAMES[l] || l,
        valueExpanded: calcGematriaStandard(MILUI_NAMES[l] || ''),
        valueSimple: GEMATRIA_STANDARD[l] || 0
      }))
    };
  });
  
  const totalMilui = wordValues.reduce((sum, w) => sum + w.valueMilui, 0);
  const totalSimple = wordValues.reduce((sum, w) => sum + w.valueSimple, 0);
  const totalMiluiReduced = reduceToSingleDigit(totalMilui);
  
  const { dia, mes, anio } = input.fechaNacimiento;
  const dateSum = dia + mes + anio;
  const caminoVida = reduceToSingleDigit(dateSum);
  
  const relatedWords = findKnownWords(totalMilui);
  
  const casasInclusion: Record<number, { numero: number; conteo: number; letras: string[] }> = {};
  for (let i = 1; i <= 9; i++) {
    casasInclusion[i] = { numero: i, conteo: 0, letras: [] };
  }
  
  // Contar frecuencias en el texto expandido
  wordValues.forEach(w => {
    w.expanded.split('').forEach(letter => {
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
  
  const ausencias = Object.keys(casasInclusion).filter(k => casasInclusion[Number(k)].conteo === 0).map(k => Number(k));
  const maxConteo = Math.max(...Object.values(casasInclusion).map(c => c.conteo));
  const dominantes = Object.keys(casasInclusion).filter(k => casasInclusion[Number(k)].conteo === maxConteo && maxConteo > 0).map(k => Number(k));
  
  const sefira = numberToSefira(totalMiluiReduced.reduced);
  
  return {
    identidad: {
      nombreCompleto: name,
      hebrewOriginal: hebrewName,
      hebrewExpanded: wordValues.map(w => w.expanded).join(' '),
      fechaNacimiento: dateStr,
    },
    calculo: {
      metodo: 'Milui (Expansión)',
      descripcion: 'Cada letra se expande a su nombre completo: א→אלף, ב→בית, etc.',
      explicacion: 'El Milui revela el significado interno de cada letra y su potencial completo de manifestación.',
      palabras: wordValues,
      valorMilui: totalMilui,
      valorSimple: totalSimple,
      diferencia: totalMilui - totalSimple,
      valorReducido: totalMiluiReduced,
      palabrasRelacionadas: relatedWords,
    },
    numeros: {
      esencia: { original: totalMilui, reducido: totalMiluiReduced.reduced, esMaestro: totalMiluiReduced.isMaster },
      expresion: { original: wordValues[0]?.valueMilui || 0, reducido: wordValues[0]?.reducedMilui.reduced || 1, esMaestro: false },
      herencia: { original: wordValues[wordValues.length - 1]?.valueMilui || 0, reducido: wordValues[wordValues.length - 1]?.reducedMilui.reduced || 1, esMaestro: false },
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
      metodo: 'milui',
      sistema: 'milui',
      alfabeto: 'hebrew',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  };
}
