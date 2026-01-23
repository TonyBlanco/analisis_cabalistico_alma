/**
 * Hook for loading Tarot workspace artifacts (spreads)
 * 
 * Usage:
 * const { artifacts, isLoading, error, refresh } = useTarotArtifacts(instanceId);
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { swmTarotApi } from '../client';
import type { WorkspaceArtifact } from '../types';

interface UseTarotArtifactsOptions {
  instanceId?: string;
  autoLoad?: boolean;
}

interface UseTarotArtifactsReturn {
  artifacts: WorkspaceArtifact[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTarotArtifacts(options: UseTarotArtifactsOptions = {}): UseTarotArtifactsReturn {
  const { instanceId, autoLoad = true } = options;
  
  const [artifacts, setArtifacts] = useState<WorkspaceArtifact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadArtifacts = useCallback(async () => {
    if (!instanceId) {
      setArtifacts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await swmTarotApi.getArtifacts(instanceId);
      setArtifacts(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading artifacts';
      setError(message);
      setArtifacts([]);
    } finally {
      setIsLoading(false);
    }
  }, [instanceId]);

  // Auto-load on mount and when instanceId changes
  useEffect(() => {
    if (autoLoad && instanceId) {
      loadArtifacts();
    }
  }, [autoLoad, instanceId, loadArtifacts]);

  return {
    artifacts,
    isLoading,
    error,
    refresh: loadArtifacts,
  };
}
