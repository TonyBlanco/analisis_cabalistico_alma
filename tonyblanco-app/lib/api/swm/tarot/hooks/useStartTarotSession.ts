/**
 * Hook for starting a Tarot workspace session
 * 
 * Usage:
 * const { startSession, isLoading, error, session } = useStartTarotSession();
 * await startSession(instanceId);
 */

'use client';

import { useState, useCallback } from 'react';
import { swmTarotApi } from '../client';
import type { WorkspaceSession } from '../types';

interface UseStartTarotSessionReturn {
  startSession: (instanceId: string) => Promise<WorkspaceSession>;
  isLoading: boolean;
  error: string | null;
  session: WorkspaceSession | null;
  reset: () => void;
}

export function useStartTarotSession(): UseStartTarotSessionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<WorkspaceSession | null>(null);

  const startSession = useCallback(async (instanceId: string): Promise<WorkspaceSession> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await swmTarotApi.startSession({ instance_id: instanceId });
      setSession(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error starting session';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setSession(null);
  }, []);

  return {
    startSession,
    isLoading,
    error,
    session,
    reset,
  };
}
