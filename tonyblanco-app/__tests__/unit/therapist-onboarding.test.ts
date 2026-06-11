import { describe, expect, it } from 'vitest';

import { isLearningCenterPath } from '@/lib/therapistOnboarding';

describe('therapist onboarding helpers', () => {
  it('detecta las rutas válidas del centro de aprendizaje', () => {
    expect(isLearningCenterPath('/learn')).toBe(true);
    expect(isLearningCenterPath('/dashboard/therapist/learn')).toBe(true);
    expect(isLearningCenterPath('/dashboard/therapist')).toBe(false);
    expect(isLearningCenterPath('/dashboard/therapist/patients')).toBe(false);
  });
});
