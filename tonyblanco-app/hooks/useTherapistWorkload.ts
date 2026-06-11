'use client';

import { useEffect, useState } from 'react';
import { apiUrl, getAuthHeaders } from '@/lib/api';
import type { TherapistDashboardResponse, TherapistWorkload } from '@/lib/types/therapist-workload';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface UseTherapistWorkloadResult {
  workload: TherapistWorkload | null;
  status: Status;
  error: string | null;
  isEmpty: boolean;
  refetch: () => void;
}

export function useTherapistWorkload(): UseTherapistWorkloadResult {
  const [workload, setWorkload] = useState<TherapistWorkload | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    fetch(apiUrl('therapist/dashboard/'), {
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText);
          throw new Error(`Error ${res.status}: ${text}`);
        }
        return res.json() as Promise<TherapistDashboardResponse>;
      })
      .then((json) => {
        if (!cancelled) {
          setWorkload(json.workload ?? null);
          setStatus('success');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar trabajo en curso');
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const isEmpty =
    status === 'success' && workload !== null && workload.patients.length === 0;

  return {
    workload,
    status,
    error,
    isEmpty,
    refetch: () => setTick((t) => t + 1),
  };
}