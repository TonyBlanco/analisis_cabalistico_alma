import { describe, it, expect } from 'vitest';
import {
  buildPastLivesOpenReflection,
  pastLivesDefinition,
} from '@/app/(dashboard)/dashboard/patient/tests/past-lives/past-lives.config';

describe('past-lives config expansion', () => {
  it('defines 11 sections and 55 Likert items', () => {
    expect(pastLivesDefinition.sections).toHaveLength(11);
    expect(pastLivesDefinition.questions).toHaveLength(55);
    expect(pastLivesDefinition.estimated_time_minutes).toBe(20);
  });

  it('includes guided reflection fields and intro copy', () => {
    expect(pastLivesDefinition.guidedReflection.length).toBeGreaterThanOrEqual(3);
    expect(pastLivesDefinition.intro.paragraphs.length).toBeGreaterThanOrEqual(2);
    expect(pastLivesDefinition.disclaimer).toMatch(/no constituye diagnóstico/i);
  });

  it('buildPastLivesOpenReflection supports legacy single string', () => {
    const out = buildPastLivesOpenReflection({
      recurring_scene: 'Solo una escena.',
    });
    expect(out).toBe('Solo una escena.');
  });

  it('buildPastLivesOpenReflection bundles multiple guided fields', () => {
    const out = buildPastLivesOpenReflection({
      recurring_scene: 'Escena A',
      familiar_person_place: 'Lugar B',
    });
    expect(out).toEqual({
      recurring_scene: 'Escena A',
      familiar_person_place: 'Lugar B',
    });
  });
});