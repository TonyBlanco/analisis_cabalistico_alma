import { describe, it, expect } from 'vitest';
import { apiUrl } from '@/lib/api';

describe('hybrid-metrics API URL', () => {
  it('apiUrl joins base and path with a single slash', () => {
    const url = apiUrl('therapist/hybrid-metrics/');
    expect(url).toMatch(/\/api\/therapist\/hybrid-metrics\/$/);
    expect(url).not.toContain('/apitherapist/');
  });
});