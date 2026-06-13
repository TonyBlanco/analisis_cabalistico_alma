'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  loadPatientProcessSnapshot,
  type PatientProcessSnapshot,
} from '@/lib/patientProcess';

export function usePatientProcess() {
  const [snapshot, setSnapshot] = useState<PatientProcessSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadPatientProcessSnapshot();
      setSnapshot(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pudimos cargar tu proceso';
      setError(message);
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { snapshot, loading, error, refresh };
}