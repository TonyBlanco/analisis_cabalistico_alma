import { describe, it, expect } from 'vitest';
import {
  analizarConValores,
  valorPorTabla,
  MISPAR_HECHRACHI,
  MISPAR_GADOL,
  MISPAR_KATAN,
  MISPAR_SIDURI,
  valorMilui,
  ATBASH,
  ALBAM,
  AVGAD,
  ATBACH,
  notarikonIniciales,
  aplicarCifrado,
  normalizarHebreo,
} from '../gematria-core';
import { interpretarAnalisis, UTILIDAD_METODO } from '../interpretacion';

const fecha = { dia: 15, mes: 6, anio: 1985 };
const nombre = 'Maria Lopez';

const METODOS = [
  'gematria-standard',
  'gematria-katan',
  'mispar-gadol',
  'mispar-siduri',
  'milui',
  'atbash',
  'albam',
  'avgad',
  'temurah',
  'notarikon',
] as const;

function analisisParaMetodo(metodoId: (typeof METODOS)[number]) {
  const hebreo = normalizarHebreo(nombre);
  const entrada = { nombreCompleto: nombre, fechaNacimiento: fecha };

  switch (metodoId) {
    case 'gematria-standard':
      return analizarConValores({
        entrada,
        textoHebreoOriginal: hebreo,
        textoEvaluado: hebreo,
        valorDeLetra: valorPorTabla(MISPAR_HECHRACHI),
      });
    case 'gematria-katan':
      return analizarConValores({
        entrada,
        textoHebreoOriginal: hebreo,
        textoEvaluado: hebreo,
        valorDeLetra: valorPorTabla(MISPAR_KATAN),
      });
    case 'mispar-gadol':
      return analizarConValores({
        entrada,
        textoHebreoOriginal: hebreo,
        textoEvaluado: hebreo,
        valorDeLetra: valorPorTabla(MISPAR_GADOL),
      });
    case 'mispar-siduri':
      return analizarConValores({
        entrada,
        textoHebreoOriginal: hebreo,
        textoEvaluado: hebreo,
        valorDeLetra: valorPorTabla(MISPAR_SIDURI),
      });
    case 'milui':
      return analizarConValores({
        entrada,
        textoHebreoOriginal: hebreo,
        textoEvaluado: hebreo,
        valorDeLetra: (l) => valorMilui(l),
      });
    case 'atbash':
      return analizarConValores({
        entrada,
        textoHebreoOriginal: hebreo,
        textoEvaluado: aplicarCifrado(hebreo, ATBASH),
        valorDeLetra: valorPorTabla(MISPAR_HECHRACHI),
        textoTransformado: aplicarCifrado(hebreo, ATBASH),
      });
    case 'albam':
      return analizarConValores({
        entrada,
        textoHebreoOriginal: hebreo,
        textoEvaluado: aplicarCifrado(hebreo, ALBAM),
        valorDeLetra: valorPorTabla(MISPAR_HECHRACHI),
        textoTransformado: aplicarCifrado(hebreo, ALBAM),
      });
    case 'avgad':
      return analizarConValores({
        entrada,
        textoHebreoOriginal: hebreo,
        textoEvaluado: aplicarCifrado(hebreo, AVGAD),
        valorDeLetra: valorPorTabla(MISPAR_HECHRACHI),
        textoTransformado: aplicarCifrado(hebreo, AVGAD),
      });
    case 'temurah':
      return analizarConValores({
        entrada,
        textoHebreoOriginal: hebreo,
        textoEvaluado: aplicarCifrado(hebreo, ATBACH),
        valorDeLetra: valorPorTabla(MISPAR_HECHRACHI),
        textoTransformado: aplicarCifrado(hebreo, ATBACH),
      });
    case 'notarikon': {
      const transformado = notarikonIniciales(hebreo);
      return analizarConValores({
        entrada,
        textoHebreoOriginal: hebreo,
        textoEvaluado: transformado || hebreo,
        valorDeLetra: valorPorTabla(MISPAR_HECHRACHI),
        textoTransformado: transformado,
      });
    }
    default:
      throw new Error(`Metodo no soportado: ${metodoId}`);
  }
}

describe('interpretarAnalisis — utilidadTerapeutica', () => {
  it('define UTILIDAD_METODO para los 10 metodos', () => {
    for (const id of METODOS) {
      expect(UTILIDAD_METODO[id]?.trim().length).toBeGreaterThan(20);
    }
  });

  for (const metodoId of METODOS) {
    it(`${metodoId} devuelve utilidadTerapeutica no vacia`, () => {
      const analisis = analisisParaMetodo(metodoId);
      const interp = interpretarAnalisis(analisis, metodoId, 'Descripcion de prueba');
      expect(interp.utilidadTerapeutica.trim().length).toBeGreaterThan(20);
      expect(interp.metodo).toBe(metodoId);
      expect(interp.avisos.length).toBeGreaterThan(0);
    });
  }
});