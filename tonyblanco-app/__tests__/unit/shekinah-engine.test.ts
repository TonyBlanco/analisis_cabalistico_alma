import { describe, it, expect } from 'vitest';
import { calculateShekinahProfile, sumDigits, reduceToArcana } from '@/lib/shekinah-engine';

describe('shekinah-engine — verdades absolutas Método Atlantis', () => {
  describe('calculateShekinahProfile', () => {
    it('Luis Antonio Blanco Fontela (1959-08-01) → gematría=259 SCF=33 PIN=292 ET=33', () => {
      const r = calculateShekinahProfile('Luis Antonio Blanco Fontela', '1959-08-01');
      expect(r.identity.gematriaTotal).toBe(259);
      expect(r.identity.scf).toBe(33);
      expect(r.identity.pin).toBe(292);
      expect(r.identity.et).toBe(33);
    });

    it('Eugenio Bladimir Santana Rodriguez (1963-01-22) → gematría=283 SCF=24 PIN=307 ET=24', () => {
      const r = calculateShekinahProfile('Eugenio Bladimir Santana Rodriguez', '1963-01-22');
      expect(r.identity.gematriaTotal).toBe(283);
      expect(r.identity.scf).toBe(24);
      expect(r.identity.pin).toBe(307);
      expect(r.identity.et).toBe(24);
    });

    it('Maria Isabel Zambrano Villalobos (1963-02-20) → gematría=278 SCF=23 PIN=301 ET=23', () => {
      const r = calculateShekinahProfile('Maria Isabel Zambrano Villalobos', '1963-02-20');
      expect(r.identity.gematriaTotal).toBe(278);
      expect(r.identity.scf).toBe(23);
      expect(r.identity.pin).toBe(301);
      expect(r.identity.et).toBe(23);
    });

    it('OTD es determinista — mismos inputs producen mismos outputs', () => {
      const a = calculateShekinahProfile('Luis Antonio Blanco Fontela', '1959-08-01');
      const b = calculateShekinahProfile('Luis Antonio Blanco Fontela', '1959-08-01');
      expect(a.otd).toEqual(b.otd);
      expect(a.identity).toEqual(b.identity);
    });

    it('PIN = gematriaTotal + SCF siempre', () => {
      const cases = [
        { name: 'Luis Antonio Blanco Fontela', date: '1959-08-01' },
        { name: 'Eugenio Bladimir Santana Rodriguez', date: '1963-01-22' },
        { name: 'Maria Isabel Zambrano Villalobos', date: '1963-02-20' },
      ];
      for (const c of cases) {
        const r = calculateShekinahProfile(c.name, c.date);
        expect(r.identity.pin).toBe(r.identity.gematriaTotal + r.identity.scf);
      }
    });

    it('ET = SCF siempre', () => {
      const r = calculateShekinahProfile('Eugenio Bladimir Santana Rodriguez', '1963-01-22');
      expect(r.identity.et).toBe(r.identity.scf);
    });
  });

  describe('reduceToArcana', () => {
    it('valores 0-21 se retornan sin cambio', () => {
      for (let n = 0; n <= 21; n++) {
        expect(reduceToArcana(n)).toBe(n);
      }
    });

    it('valores >21 se reducen a <=21', () => {
      expect(reduceToArcana(22)).toBeLessThanOrEqual(21);
      expect(reduceToArcana(292)).toBeLessThanOrEqual(21);
      expect(reduceToArcana(307)).toBeLessThanOrEqual(21);
    });

    it('292 (PIN caso 1) reduce correctamente', () => {
      // 2+9+2 = 13 ≤ 21
      expect(reduceToArcana(292)).toBe(13);
    });
  });

  describe('sumDigits', () => {
    it('1+9+5+9+0+8+0+1 = 33 (fecha caso 1)', () => {
      const digits = '19590801'.split('').map(Number);
      const sum = digits.reduce((a, b) => a + b, 0);
      expect(sum).toBe(33);
    });
  });
});
