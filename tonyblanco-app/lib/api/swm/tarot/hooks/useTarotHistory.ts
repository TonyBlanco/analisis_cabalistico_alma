/**
 * Hook for loading Tarot workspace history (list of instances)
 * 
 * Usage:
 * const { history, isLoading, error, refresh } = useTarotHistory(patientId);
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { swmTarotApi } from '../client';
import type { WorkspaceInstanceList, WorkspaceStatus } from '../types';

interface UseTarotHistoryOptions {
  patientId?: number;
  status?: WorkspaceStatus;
  autoLoad?: boolean;
}

interface UseTarotHistoryReturn {
  history: WorkspaceInstanceList[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTarotHistory(options: UseTarotHistoryOptions = {}): UseTarotHistoryReturn {
  const { patientId, status, autoLoad = true } = options;
  
  const [history, setHistory] = useState<WorkspaceInstanceList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await swmTarotApi.listWorkspaces({
        subject_user_id: patientId,
        status,
      });
      setHistory(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading history';
      setError(message);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [patientId, status]);

  // Auto-load on mount and when patientId changes
  useEffect(() => {
    if (autoLoad && patientId) {
      loadHistory();
    }
  }, [autoLoad, patientId, loadHistory]);

  return {
    history,
    isLoading,
    error,
    refresh: loadHistory,
  };
}
