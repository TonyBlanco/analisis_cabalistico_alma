import { describe, it, expect } from 'vitest';
import { normalizeSCID5Correlation } from '@/lib/api/bioemotional-clinical';

describe('normalizeSCID5Correlation', () => {
  it('maps backend regions_matched to matched_regions for UI', () => {
    const result = normalizeSCID5Correlation({
      section_key: 'emotional_vitality',
      correlation_strength: 'high',
      regions_matched: ['chest_center', 'heart_area'],
      suggested_notes: 'Nota sugerida',
      confidence_score: 0.9,
    });

    expect(result.matched_regions).toEqual([
      { region: 'chest_center', count: 1 },
      { region: 'heart_area', count: 1 },
    ]);
    expect(result.correlation_strength).toBe(0.9);
    expect(result.clinical_notes).toBe('Nota sugerida');
  });

  it('handles empty regions without throwing', () => {
    const result = normalizeSCID5Correlation({
      section_key: 'anxiety_calm',
      correlation_strength: 'low',
      regions_matched: [],
      suggested_notes: '',
      confidence_score: 0.2,
    });

    expect(result.matched_regions).toEqual([]);
    expect(result.correlation_strength).toBe(0.3);
  });
});