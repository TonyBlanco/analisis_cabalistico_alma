import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  dismissTherapistOnboarding,
  hasSeenTherapistLearningLanding,
  isLearningCenterPath,
  isTherapistOnboardingDismissed,
  markTherapistLearningLandingSeen,
} from '@/lib/therapistOnboarding';

function installLocalStorageMock() {
  const store = new Map<string, string>();

  const localStorageMock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };

  vi.stubGlobal('localStorage', localStorageMock);
  vi.stubGlobal('window', { localStorage: localStorageMock });
}

describe('therapist onboarding helpers', () => {
  beforeEach(() => {
    installLocalStorageMock();
  });

  it('detecta las rutas válidas del centro de aprendizaje', () => {
    expect(isLearningCenterPath('/learn')).toBe(true);
    expect(isLearningCenterPath('/dashboard/therapist/learn')).toBe(true);
    expect(isLearningCenterPath('/dashboard/therapist')).toBe(false);
    expect(isLearningCenterPath('/dashboard/therapist/patients')).toBe(false);
  });

  it('marca y detecta la visita al centro de aprendizaje', () => {
    expect(hasSeenTherapistLearningLanding()).toBe(false);
    markTherapistLearningLandingSeen();
    expect(hasSeenTherapistLearningLanding()).toBe(true);
  });

  it('persiste el descarte del checklist por usuario', () => {
    expect(isTherapistOnboardingDismissed(42)).toBe(false);
    dismissTherapistOnboarding(42);
    expect(isTherapistOnboardingDismissed(42)).toBe(true);
    expect(isTherapistOnboardingDismissed(99)).toBe(false);
  });
});