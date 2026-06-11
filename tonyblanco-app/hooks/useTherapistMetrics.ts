'use client';

import { useEffect, useState } from 'react';
import { apiUrl, getAuthHeaders } from '@/lib/api';
import type { TherapistMetrics } from '@/lib/types/metrics';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface UseTherapistMetricsResult {
  data: TherapistMetrics | null;
  status: Status;
  error: string | null;
  refetch: () => void;
}

export function useTherapistMetrics(): UseTherapistMetricsResult {
  const [data, setData] = useState<TherapistMetrics | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    fetch(apiUrl('therapist/metrics/'), {
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText);
          throw new Error(`Error ${res.status}: ${text}`);
        }
        return res.json() as Promise<TherapistMetrics>;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setStatus('success');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar métricas');
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { data, status, error, refetch: () => setTick((t) => t + 1) };
}
