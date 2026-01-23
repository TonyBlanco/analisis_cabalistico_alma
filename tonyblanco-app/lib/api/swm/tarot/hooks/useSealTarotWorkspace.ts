/**
 * Hook for sealing a Tarot workspace
 * 
 * Usage:
 * const { sealWorkspace, isLoading, error } = useSealTarotWorkspace();
 * await sealWorkspace(instanceId);
 */

'use client';

import { useState, useCallback } from 'react';
import { swmTarotApi } from '../client';
import type { WorkspaceInstance } from '../types';

interface UseSealTarotWorkspaceReturn {
  sealWorkspace: (instanceId: string) => Promise<WorkspaceInstance>;
  isLoading: boolean;
  error: string | null;
  sealedInstance: WorkspaceInstance | null;
  reset: () => void;
}

export function useSealTarotWorkspace(): UseSealTarotWorkspaceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sealedInstance, setSealedInstance] = useState<WorkspaceInstance | null>(null);

  const sealWorkspace = useCallback(async (instanceId: string): Promise<WorkspaceInstance> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await swmTarotApi.sealWorkspace({ instance_id: instanceId });
      setSealedInstance(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error sealing workspace';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setSealedInstance(null);
  }, []);

  return {
    sealWorkspace,
    isLoading,
    error,
    sealedInstance,
    reset,
  };
}
