'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import type { TherapistAIUsageSummary } from '@/lib/types/ai-usage';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface UseTherapistAIUsageResult {
  data: TherapistAIUsageSummary | null;
  status: Status;
  error: string | null;
  refetch: () => void;
}

export function useTherapistAIUsage(): UseTherapistAIUsageResult {
  const [data, setData] = useState<TherapistAIUsageSummary | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    fetch(`${API_BASE_URL}therapist/ai-usage/`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText);
          throw new Error(`Error ${res.status}: ${text}`);
        }
        return res.json() as Promise<TherapistAIUsageSummary>;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setStatus('success');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar consumo IA');
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { data, status, error, refetch: () => setTick((t) => t + 1) };
}