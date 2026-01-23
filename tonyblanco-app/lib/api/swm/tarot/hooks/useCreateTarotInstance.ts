/**
 * Hook for creating a Tarot workspace instance
 * 
 * Usage:
 * const { createInstance, isLoading, error, instance } = useCreateTarotInstance();
 * await createInstance({ subject_user_id: patientId, spread_type: 'free', tarot_system: 'thoth' });
 */

'use client';

import { useState, useCallback } from 'react';
import { swmTarotApi } from '../client';
import type { CreateInstanceRequest, WorkspaceInstance } from '../types';

interface UseCreateTarotInstanceReturn {
  createInstance: (data: CreateInstanceRequest) => Promise<WorkspaceInstance>;
  isLoading: boolean;
  error: string | null;
  instance: WorkspaceInstance | null;
  reset: () => void;
}

export function useCreateTarotInstance(): UseCreateTarotInstanceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<WorkspaceInstance | null>(null);

  const createInstance = useCallback(async (data: CreateInstanceRequest): Promise<WorkspaceInstance> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await swmTarotApi.createInstance(data);
      setInstance(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating instance';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setInstance(null);
  }, []);

  return {
    createInstance,
    isLoading,
    error,
    instance,
    reset,
  };
}
