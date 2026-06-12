'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { getCurrentUser } from '@/lib/api';
import {
  fetchTherapistOnboarding,
  type TherapistOnboardingResponse,
} from '@/lib/therapist-onboarding-api';
import {
  dismissTherapistOnboarding,
  hasSeenTherapistLearningLanding,
  isTherapistOnboardingDismissed,
  queueTherapistLearningAutotour,
} from '@/lib/therapistOnboarding';

type Status = 'idle' | 'loading' | 'success' | 'error';

export interface OnboardingStepState {
  id: 'profile' | 'patient' | 'tree_analysis' | 'learning';
  done: boolean;
}

export interface UseTherapistOnboardingResult {
  steps: OnboardingStepState[];
  pendingCount: number;
  allComplete: boolean;
  shouldShow: boolean;
  status: Status;
  error: string | null;
  dismiss: () => void;
  refetch: () => void;
}

function buildSteps(
  data: TherapistOnboardingResponse | null,
  learningSeen: boolean,
): OnboardingStepState[] {
  const backend = data?.steps;

  return [
    { id: 'profile', done: backend?.profile_complete ?? false },
    { id: 'patient', done: backend?.has_patient ?? false },
    { id: 'tree_analysis', done: backend?.has_tree_analysis ?? false },
    { id: 'learning', done: learningSeen },
  ];
}

export function useTherapistOnboarding(): UseTherapistOnboardingResult {
  const [data, setData] = useState<TherapistOnboardingResponse | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [learningSeen, setLearningSeen] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!cancelled) {
          setUserId(user.id);
          setDismissed(isTherapistOnboardingDismissed(user.id));
        }
      } catch {
        if (!cancelled) {
          setUserId(null);
        }
      }
    };

    void loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setLearningSeen(hasSeenTherapistLearningLanding());
  }, [tick]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    fetchTherapistOnboarding()
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setStatus('success');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar onboarding');
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const steps = useMemo(() => buildSteps(data, learningSeen), [data, learningSeen]);

  const pendingCount = useMemo(
    () => steps.filter((step) => !step.done).length,
    [steps],
  );

  const allComplete = pendingCount === 0;

  const shouldShow = status === 'success' && !dismissed && pendingCount > 0;

  const dismiss = useCallback(() => {
    if (userId != null) {
      dismissTherapistOnboarding(userId);
    }
    setDismissed(true);
  }, [userId]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return {
    steps,
    pendingCount,
    allComplete,
    shouldShow,
    status,
    error,
    dismiss,
    refetch,
  };
}

export function queueLearningAutotourOnNavigate(): void {
  queueTherapistLearningAutotour();
}