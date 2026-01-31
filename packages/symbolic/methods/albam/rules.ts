import type { AlbamInput } from './types';
import { 
  latinToHebrew, 
  albamTransform,
  calcGematriaStandard, 
  reduceToSingleDigit,
  findKnownWords,
  numberToSefira,
  GEMATRIA_STANDARD
} from '../../utils/hebrew-gematria';

/**
 * Calcula Albam - Primera mitad ↔ Segunda mitad del alfabeto
 * א↔ל, ב↔מ, ג↔נ, etc. (offset de 11 posiciones)
 */
export function calcularAnalisisAlbam(input: AlbamInput) {
  const name = input.nombreCompleto || '';
  const dateStr = `${input.fechaNacimiento.anio}-${input.fechaNacimiento.mes}-${input.fechaNacimiento.dia}`;
  
  const hebrewName = latinToHebrew(name);
  const words = name.split(/\s+/).filter(w => w.length > 0);
  const hebrewWords = words.map(w => latinToHebrew(w));
  
  const transformedWords = hebrewWords.map((hw, idx) => {
    const transformed = hw.split('').map(albamTransform).join('');
    const originalValue = calcGematriaStandard(hw);
    const transformedValue = calcGematriaStandard(transformed);
    
    return {
      original: words[idx],
      hebrewOriginal: hw,
      hebrewTransformed: transformed,
      originalValue,
      transformedValue,
      letterMapping: hw.split('').map((l, i) => ({
        original: l,
        transformed: transformed[i],
        originalVal: GEMATRIA_STANDARD[l] || 0,
        transformedVal: GEMATRIA_STANDARD[transformed[i]] || 0
      }))
    };
  });
  
  const totalOriginal = transformedWords.reduce((sum, w) => sum + w.originalValue, 0);
  const totalTransformed = transformedWords.reduce((sum, w) => sum + w.transformedValue, 0);
  const totalOriginalReduced = reduceToSingleDigit(totalOriginal);
  const totalTransformedReduced = reduceToSingleDigit(totalTransformed);
  
  const relatedOriginal = findKnownWords(totalOriginal);
  const relatedTransformed = findKnownWords(totalTransformed);
  
  const sefiraOriginal = numberToSefira(totalOriginalReduced.reduced);
  const sefiraTransformed = numberToSefira(totalTransformedReduced.reduced);
  
  const casasInclusion: Record<number, { numero: number; conteo: number; letras: string[] }> = {};
  for (let i = 1; i <= 9; i++) {
    casasInclusion[i] = { numero: i, conteo: 0, letras: [] };
  }
  
  transformedWords.forEach(tw => {
    tw.hebrewTransformed.split('').forEach(letter => {
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
  
  return {
    identidad: {
      nombreCompleto: name,
      hebrewOriginal: hebrewWords.join(' '),
      hebrewTransformed: transformedWords.map(w => w.hebrewTransformed).join(' '),
      fechaNacimiento: dateStr,
    },
    calculo: {
      metodo: 'Albam',
      descripcion: 'Cifrado por intercambio entre mitades del alfabeto: א↔ל, ב↔מ, etc.',
      explicacion: 'El Albam divide el alfabeto en dos mitades de 11 letras cada una e intercambia las posiciones equivalentes.',
      palabras: transformedWords,
      valorOriginal: totalOriginal,
      valorTransformado: totalTransformed,
      reducidoOriginal: totalOriginalReduced,
      reducidoTransformado: totalTransformedReduced,
      palabrasRelacionadasOriginal: relatedOriginal,
      palabrasRelacionadasTransformado: relatedTransformed,
    },
    numeros: {
      esencia: { original: totalTransformed, reducido: totalTransformedReduced.reduced, esMaestro: totalTransformedReduced.isMaster },
      expresion: { original: transformedWords[0]?.transformedValue || 0, reducido: reduceToSingleDigit(transformedWords[0]?.transformedValue || 1).reduced, esMaestro: false },
      herencia: { original: transformedWords[transformedWords.length - 1]?.transformedValue || 0, reducido: reduceToSingleDigit(transformedWords[transformedWords.length - 1]?.transformedValue || 1).reduced, esMaestro: false },
      caminoVida: { original: totalOriginal, reducido: totalOriginalReduced.reduced, esMaestro: totalOriginalReduced.isMaster, edadTransformacion: 0 },
    },
    correspondencia: {
      sefiraOriginal: sefiraOriginal.name,
      sefiraTransformada: sefiraTransformed.name,
      cambioEnergetico: sefiraOriginal.name !== sefiraTransformed.name 
        ? `De ${sefiraOriginal.meaning} a ${sefiraTransformed.meaning}`
        : 'Sin cambio de correspondencia',
    },
    casasInclusion,
    ausencias,
    dominantes,
    metadatos: {
      metodo: 'albam',
      sistema: 'temurah',
      alfabeto: 'hebrew',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  };
}
