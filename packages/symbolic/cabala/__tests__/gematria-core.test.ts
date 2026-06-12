import { describe, it, expect } from 'vitest';
import {
  MISPAR_HECHRACHI,
  MISPAR_GADOL,
  MISPAR_SIDURI,
  MISPAR_KATAN,
  valorMilui,
  ATBASH,
  ALBAM,
  AVGAD,
  ATBACH,
  analizarConValores,
  valorPorTabla,
  normalizarHebreo,
  esHebreo,
  reducirMaestros,
  notarikonIniciales,
  aplicarCifrado,
} from '../gematria-core';
import { interpretarAnalisis, buscarEquivalencias, compararAnalisis } from '../interpretacion';

const fecha = { dia: 1, mes: 1, anio: 2000 };

function valorHechrachi(palabra: string): number {
  return analizarConValores({
    entrada: { nombreCompleto: palabra, fechaNacimiento: fecha },
    textoHebreoOriginal: palabra,
    textoEvaluado: palabra,
    valorDeLetra: valorPorTabla(MISPAR_HECHRACHI),
  }).valorTotal;
}

describe('Mispar Hechrachi (estandar) — valores canonicos', () => {
  it('coincide con valores gematricos conocidos', () => {
    expect(valorHechrachi('שלום')).toBe(376); // Shalom
    expect(valorHechrachi('אמת')).toBe(441); // Emet
    expect(valorHechrachi('יהוה')).toBe(26); // YHVH
    expect(valorHechrachi('אהבה')).toBe(13); // Ahavah
    expect(valorHechrachi('אחד')).toBe(13); // Echad
    expect(valorHechrachi('חי')).toBe(18); // Chai
    expect(valorHechrachi('אלהים')).toBe(86); // Elohim
    expect(valorHechrachi('אור')).toBe(207); // Or
    expect(valorHechrachi('תורה')).toBe(611); // Torah
  });
});

describe('Mispar Gadol — finales 500-900', () => {
  it('asigna valores ampliados a finales', () => {
    expect(MISPAR_GADOL['ך']).toBe(500);
    expect(MISPAR_GADOL['ם']).toBe(600);
    expect(MISPAR_GADOL['ן']).toBe(700);
    expect(MISPAR_GADOL['ף']).toBe(800);
    expect(MISPAR_GADOL['ץ']).toBe(900);
    expect(MISPAR_GADOL['א']).toBe(1);
  });
});

describe('Mispar Siduri — ordinal 1-22', () => {
  it('usa la posicion de la letra', () => {
    expect(MISPAR_SIDURI['א']).toBe(1);
    expect(MISPAR_SIDURI['י']).toBe(10);
    expect(MISPAR_SIDURI['ת']).toBe(22);
  });
});

describe('Mispar Katan — digito significativo', () => {
  it('reduce cada letra a 1-9', () => {
    expect(MISPAR_KATAN['י']).toBe(1); // 10
    expect(MISPAR_KATAN['ק']).toBe(1); // 100
    expect(MISPAR_KATAN['ת']).toBe(4); // 400
    expect(MISPAR_KATAN['ש']).toBe(3); // 300
    expect(MISPAR_KATAN['ה']).toBe(5); // 5
  });
});

describe('Milui — gematria del deletreo', () => {
  it('calcula el valor del nombre de la letra', () => {
    expect(valorMilui('א')).toBe(111); // alef-lamed-pe = 1+30+80
    expect(valorMilui('י')).toBe(20); // yod-vav-dalet = 10+6+4
    expect(valorMilui('ל')).toBe(74); // lamed-mem-dalet = 30+40+4
  });
});

describe('Temurot (cifrados)', () => {
  it('Atbash invierte el alfabeto', () => {
    expect(ATBASH['א']).toBe('ת');
    expect(ATBASH['ב']).toBe('ש');
    expect(aplicarCifrado('אבג', ATBASH)).toBe('תשר');
  });
  it('Albam intercambia mitades', () => {
    expect(ALBAM['א']).toBe('ל');
    expect(ALBAM['כ']).toBe('ת');
  });
  it('Avgad desplaza a la siguiente', () => {
    expect(AVGAD['א']).toBe('ב');
    expect(AVGAD['ת']).toBe('א');
  });
  it('Atbach empareja por complemento', () => {
    expect(ATBACH['א']).toBe('ט');
    expect(ATBACH['ה']).toBe('ה');
    expect(ATBACH['נ']).toBe('נ');
    expect(ATBACH['ק']).toBe('ץ');
  });
});

describe('Reduccion con numeros maestros', () => {
  it('mantiene 11/22/33 y reduce el resto', () => {
    expect(reducirMaestros(11).esMaestro).toBe(true);
    expect(reducirMaestros(38).reducido).toBe(11); // 3+8
    expect(reducirMaestros(38).esMaestro).toBe(true);
    expect(reducirMaestros(28).reducido).toBe(1); // 28->10->1
  });
});

describe('Transliteracion y deteccion de hebreo', () => {
  it('transvasa latino a hebreo y respeta hebreo existente', () => {
    expect(esHebreo(normalizarHebreo('Tony'))).toBe(true);
    expect(normalizarHebreo('שלום')).toBe('שלום');
  });
});

describe('Notarikon — iniciales', () => {
  it('toma la primera letra de cada palabra', () => {
    expect(notarikonIniciales('אבג דהו')).toBe('אד');
  });
});

describe('Interpretacion', () => {
  it('explica el metodo y verifica equivalencias', () => {
    const a = analizarConValores({
      entrada: { nombreCompleto: 'shalom', fechaNacimiento: fecha },
      textoHebreoOriginal: 'שלום',
      textoEvaluado: 'שלום',
      valorDeLetra: valorPorTabla(MISPAR_HECHRACHI),
    });
    const interp = interpretarAnalisis(a, 'gematria-standard', 'desc');
    expect(interp.queEs.length).toBeGreaterThan(0);
    expect(interp.lecturaNumeros.herencia.titulo.length).toBeGreaterThan(0);
    expect(interp.equivalencias.some((e) => e.transliteracion === 'Shalom')).toBe(true);
    expect(interp.avisos.length).toBeGreaterThan(0);
  });
});

describe('buscarEquivalencias', () => {
  it('26 corresponde a YHVH', () => {
    expect(buscarEquivalencias(26).some((p) => p.transliteracion === 'YHVH')).toBe(true);
  });
});

describe('compararAnalisis — verificacion cruzada', () => {
  it('detecta coincidencias de herencia entre metodos', () => {
    const base = (n: string) =>
      analizarConValores({
        entrada: { nombreCompleto: n, fechaNacimiento: fecha },
        textoHebreoOriginal: n,
        textoEvaluado: n,
        valorDeLetra: valorPorTabla(MISPAR_HECHRACHI),
      });
    // 'אחד' y 'אהבה' valen 13 -> reducen a 4
    const r = compararAnalisis([
      { metodo: 'm1', analisis: base('אחד') },
      { metodo: 'm2', analisis: base('אהבה') },
    ]);
    expect(r.coincidenciasHerencia.length).toBeGreaterThan(0);
    expect(r.coincidenciasHerencia[0].reducido).toBe(4);
  });
});
