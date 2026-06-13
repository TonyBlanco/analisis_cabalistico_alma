'use client';

import { useEffect, useState } from 'react';
import { apiUrl, getAuthHeaders } from '@/lib/api';
import type { TherapistReportsSummary } from '@/lib/types/therapist-reports';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface UseTherapistReportsResult {
  data: TherapistReportsSummary | null;
  status: Status;
  error: string | null;
  isEmpty: boolean;
  refetch: () => void;
}

export function useTherapistReports(): UseTherapistReportsResult {
  const [data, setData] = useState<TherapistReportsSummary | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    fetch(apiUrl('therapist/reports/summary/'), {
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText);
          throw new Error(`Error ${res.status}: ${text}`);
        }
        return res.json() as Promise<TherapistReportsSummary>;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setStatus('success');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar reportes');
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const isEmpty =
    status === 'success' &&
    data !== null &&
    data.patients.length === 0 &&
    data.recent_results.length === 0;

  return {
    data,
    status,
    error,
    isEmpty,
    refetch: () => setTick((t) => t + 1),
  };
}