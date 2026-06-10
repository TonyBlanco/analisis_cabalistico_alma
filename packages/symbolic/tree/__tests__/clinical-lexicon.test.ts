import { describe, it, expect } from 'vitest';
import {
  CLINICAL_LEXICON_TERMS,
  ANTI_FRAUD_TERMS,
  enforceAntiFraudRail,
  validateSafetyContentForRole,
} from '../clinical-lexicon';
import { SYMBOLIC_INTERPRETER_META } from '../symbolic-interpreter.types';

describe('clinical-lexicon — role-aware safety', () => {
  describe('CLINICAL_LEXICON_TERMS', () => {
    it('mirrors SYMBOLIC_INTERPRETER_META.prohibitedTerms', () => {
      expect([...CLINICAL_LEXICON_TERMS]).toEqual([...SYMBOLIC_INTERPRETER_META.prohibitedTerms]);
    });
  });

  describe('validateSafetyContentForRole — observational (default)', () => {
    it('blocks clinical lexicon terms', () => {
      for (const term of ['diagnóstico', 'trastorno', 'patología', 'debes', 'siempre', 'nunca']) {
        const res = validateSafetyContentForRole(`El consultante presenta un ${term} evidente.`);
        expect(res.passed).toBe(false);
        expect(res.warnings.join(' ')).toContain(term);
      }
    });

    it('defaults to observational when no role is given', () => {
      const res = validateSafetyContentForRole('Hay un diagnóstico claro.');
      expect(res.passed).toBe(false);
    });

    it('passes clean symbolic content', () => {
      const res = validateSafetyContentForRole('La estructura muestra un foco en Hod y Yesod.');
      expect(res.passed).toBe(true);
      expect(res.warnings).toHaveLength(0);
    });
  });

  describe('validateSafetyContentForRole — clinical (verified)', () => {
    it('lifts the clinical lexicon block', () => {
      const res = validateSafetyContentForRole(
        'Evaluación: el cuadro es compatible con un trastorno; el diagnóstico requiere seguimiento.',
        'clinical',
      );
      expect(res.passed).toBe(true);
      expect(res.warnings).toHaveLength(0);
    });

    it('still enforces the anti-fraud rail', () => {
      const res = validateSafetyContentForRole(
        'El diagnóstico es claro y te garantizo la cura milagrosa.',
        'clinical',
      );
      expect(res.passed).toBe(false);
      expect(res.warnings.some((w) => w.includes('Anti-fraud'))).toBe(true);
    });
  });

  describe('enforceAntiFraudRail — always enforced', () => {
    it('detects prescription / dosage phrases', () => {
      expect(enforceAntiFraudRail('te receto 20mg').passed).toBe(false);
      expect(enforceAntiFraudRail('vamos a ajustar la dosis').passed).toBe(false);
    });

    it('detects abandon-treatment phrases', () => {
      expect(enforceAntiFraudRail('deja la medicación de tu médico').passed).toBe(false);
    });

    it('detects guaranteed / miracle cure phrases', () => {
      expect(enforceAntiFraudRail('ofrezco una cura garantizada').passed).toBe(false);
      expect(enforceAntiFraudRail('this is a miracle cure').passed).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(enforceAntiFraudRail('CURA MILAGROSA total').passed).toBe(false);
    });

    it('passes clean clinical-but-honest content', () => {
      expect(
        enforceAntiFraudRail('Recomiendo continuar el seguimiento con su médico tratante.').passed,
      ).toBe(true);
    });

    it('handles empty / undefined content safely', () => {
      expect(enforceAntiFraudRail('').passed).toBe(true);
      expect(enforceAntiFraudRail(undefined as unknown as string).passed).toBe(true);
    });
  });

  describe('ANTI_FRAUD_TERMS — focused phrases', () => {
    it('does not flag legitimate descriptive clinical vocabulary', () => {
      expect(
        validateSafetyContentForRole('Toma un antidepresivo recetado por su médico.', 'clinical').passed,
      ).toBe(true);
      expect(ANTI_FRAUD_TERMS).not.toContain('antidepresivo');
    });
  });
});
