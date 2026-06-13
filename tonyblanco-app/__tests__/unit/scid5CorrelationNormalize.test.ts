import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  API_BASE_URL: 'https://api.test',
  getAuthToken: vi.fn(() => 'token'),
}));

import { correlateSCID5 } from '@/lib/api/bioemotional-clinical';

describe('correlateSCID5 normalization', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          section_key: 'emotional_vitality',
          correlation_strength: 'high',
          regions_matched: ['chest_center', 'heart_area'],
          suggested_notes: 'Nota sugerida',
          confidence_score: 0.9,
        }),
      })) as unknown as typeof fetch,
    );
  });

  it('maps backend regions_matched to matched_regions and numeric strength', async () => {
    const result = await correlateSCID5({
      patient_id: 1,
      section_key: 'emotional_vitality',
    });

    expect(result.correlation_strength).toBe(0.9);
    expect(result.matched_regions).toEqual([
      { region: 'chest_center', count: 1 },
      { region: 'heart_area', count: 1 },
    ]);
    expect(result.matched_regions.length).toBe(2);
  });
});