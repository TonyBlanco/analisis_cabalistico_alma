import { describe, it, expect } from 'vitest';
import { buildSoulMapData } from '@/lib/buildSoulMapData';
import { extractLetrasDelAlma } from '@/lib/letras-sagradas';
import { calculateShekinahProfile, sumDigits } from '@/lib/shekinah-engine';

// ── Casos de validación canónicos ──────────────────────────────────────────
describe('buildSoulMapData — identidad Shekinah', () => {
  it('Luis Antonio Blanco Fontela / 01-08-1959: gematría=259, SCF=33, PIN=292, ET=33', () => {
    const data = buildSoulMapData('Luis Antonio Blanco Fontela', '1959-08-01');
    expect(data.gematria.total).toBe(259);
    expect(data.gematria.scf).toBe(33);
    expect(data.gematria.pin).toBe(292);
    expect(data.gematria.et).toBe(33);
  });

  it('Armando Ledesma Machado / 23-06-1966: PIN=206, ET=33', () => {
    const data = buildSoulMapData('Armando Ledesma Machado', '1966-06-23');
    expect(data.gematria.pin).toBe(206);
    expect(data.gematria.et).toBe(33);
  });
});

// ── OTD para Armando ────────────────────────────────────────────────────────
describe('buildSoulMapData — OTD Armando Ledesma Machado', () => {
  it('Origen=19 (El Sol), Transformación=6 (Los Enamorados), Destino=5 (El Sumo Sacerdote)', () => {
    const data = buildSoulMapData('Armando Ledesma Machado', '1966-06-23');
    expect(data.arcanos.origen).toBe(19);
    expect(data.arcanos.transformacion).toBe(6);
    expect(data.arcanos.destino).toBe(5);
  });
});

// ── Días fuerza ─────────────────────────────────────────────────────────────
describe('buildSoulMapData — días de fuerza', () => {
  it('Armando: PIN=206 → raíz digital=8 → días fuerza [8,17,26]', () => {
    const data = buildSoulMapData('Armando Ledesma Machado', '1966-06-23');
    expect(data.vibraciones.diasFuerza).toEqual([8, 17, 26]);
  });

  it('Días fuerza son siempre ≤31 y tienen la misma raíz digital que el PIN', () => {
    const data = buildSoulMapData('Luis Antonio Blanco Fontela', '1959-08-01');
    const root = sumDigits(data.gematria.pin);
    for (const d of data.vibraciones.diasFuerza) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(31);
      expect(sumDigits(d)).toBe(root);
    }
  });
});

// ── Letras del Alma ──────────────────────────────────────────────────────────
describe('extractLetrasDelAlma — determinismo y unicidad', () => {
  it('mismo nombre → mismo conjunto de letras (determinista)', () => {
    const r1 = extractLetrasDelAlma('Armando Ledesma Machado');
    const r2 = extractLetrasDelAlma('Armando Ledesma Machado');
    expect(r1.map(l => l.hebreo)).toEqual(r2.map(l => l.hebreo));
  });

  it('nombres diferentes → conjuntos de letras diferentes', () => {
    const armando = extractLetrasDelAlma('Armando Ledesma Machado').map(l => l.hebreo);
    const luis = extractLetrasDelAlma('Luis Antonio Blanco Fontela').map(l => l.hebreo);
    // No deben ser idénticos
    expect(armando).not.toEqual(luis);
  });

  it('Armando contiene letras ausentes en Luis y viceversa', () => {
    const armando = new Set(extractLetrasDelAlma('Armando Ledesma Machado').map(l => l.hebreo));
    const luis = new Set(extractLetrasDelAlma('Luis Antonio Blanco Fontela').map(l => l.hebreo));
    // Armando tiene Resh (ר) que Luis no tiene
    expect(armando.has('ר')).toBe(true);
    expect(luis.has('ר')).toBe(false);
    // Luis tiene Vav (ו) — solo aparece como U en LUIS
    expect(luis.has('ו')).toBe(true);
  });

  it('letras son únicas dentro de un nombre (sin duplicados)', () => {
    const letras = extractLetrasDelAlma('Armando Ledesma Machado');
    const hebreas = letras.map(l => l.hebreo);
    const uniq = [...new Set(hebreas)];
    expect(hebreas).toEqual(uniq);
  });

  it('cada LetraInfo tiene los campos obligatorios', () => {
    const letras = extractLetrasDelAlma('Maria Lopez Garcia');
    for (const l of letras) {
      expect(l.nombre).toBeTruthy();
      expect(l.hebreo).toBeTruthy();
      expect(l.significado).toBeTruthy();
      expect(l.tipo).toMatch(/^(Madre|Simple|Doble)$/);
      expect(l.meditacion).toBeTruthy();
    }
  });
});

// ── Estructura completa del JSON ─────────────────────────────────────────────
describe('buildSoulMapData — estructura del JSON', () => {
  it('contiene todos los campos raíz requeridos', () => {
    const data = buildSoulMapData('Luis Antonio Blanco Fontela', '1959-08-01');
    expect(data).toHaveProperty('identidad');
    expect(data).toHaveProperty('arcanos');
    expect(data).toHaveProperty('gematria');
    expect(data).toHaveProperty('vibraciones');
    expect(data).toHaveProperty('cuentasPendientes');
    expect(data).toHaveProperty('letrasDelAlma');
    expect(data).toHaveProperty('karmas');
  });

  it('cuentasPendientes tiene valores entre 1 y 7', () => {
    const data = buildSoulMapData('Armando Ledesma Machado', '1966-06-23');
    for (const v of Object.values(data.cuentasPendientes)) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(7);
    }
  });
});
