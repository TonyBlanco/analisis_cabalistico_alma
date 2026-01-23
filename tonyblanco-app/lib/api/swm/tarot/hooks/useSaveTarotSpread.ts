/**
 * Hook for saving a Tarot spread
 * 
 * Usage:
 * const { saveSpread, isLoading, error, artifact } = useSaveTarotSpread();
 * await saveSpread({ instance_id, cards, therapist_notes });
 */

'use client';

import { useState, useCallback } from 'react';
import { swmTarotApi } from '../client';
import type { SaveSpreadRequest, WorkspaceArtifact } from '../types';

interface UseSaveTarotSpreadReturn {
  saveSpread: (data: SaveSpreadRequest) => Promise<WorkspaceArtifact>;
  isLoading: boolean;
  error: string | null;
  artifact: WorkspaceArtifact | null;
  reset: () => void;
}

export function useSaveTarotSpread(): UseSaveTarotSpreadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artifact, setArtifact] = useState<WorkspaceArtifact | null>(null);

  const saveSpread = useCallback(async (data: SaveSpreadRequest): Promise<WorkspaceArtifact> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await swmTarotApi.saveSpread(data);
      setArtifact(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error saving spread';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setArtifact(null);
  }, []);

  return {
    saveSpread,
    isLoading,
    error,
    artifact,
    reset,
  };
}
