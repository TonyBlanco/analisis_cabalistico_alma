'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  loadPatientPendingTests,
  type PatientPendingTest,
} from '@/lib/patientPendingTests';

export function usePatientPendingTests() {
  const [pendingTests, setPendingTests] = useState<PatientPendingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pending = await loadPatientPendingTests();
      setPendingTests(pending);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar tests pendientes';
      setError(message);
      setPendingTests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { pendingTests, loading, error, refresh };
}