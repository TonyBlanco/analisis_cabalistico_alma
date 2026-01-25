// components/inquiry/hooks/useInquiryGaps.ts
import { useState, useEffect, useCallback } from 'react';
import { fetchInquiryGaps } from '../../../lib/api/inquiry';
import type { 
  KnowledgeGap, 
  ModuleCode, 
  GapCounts,
  WidgetState 
} from '../InquiryWidget.types';

interface UseInquiryGapsResult {
  gaps: KnowledgeGap[];
  counts: GapCounts;
  status: WidgetState;
  error: string | null;
  refetch: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook para gestionar la carga de gaps de conocimiento
 */
export function useInquiryGaps(
  patientId: number,
  moduleCode: ModuleCode
): UseInquiryGapsResult {
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [status, setStatus] = useState<WidgetState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadGaps = useCallback(async () => {
    if (!patientId || !moduleCode) {
      setStatus('empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchInquiryGaps(patientId, moduleCode);
      
      if (!data.gaps || data.gaps.length === 0) {
        if (data.resolved_count > 0) {
          setStatus('all_resolved');
        } else {
          setStatus('empty');
        }
        setGaps([]);
      } else {
        setStatus('has_gaps');
        setGaps(data.gaps);
      }
    } catch (err) {
      console.error('Error loading inquiry gaps:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStatus('error');
      setGaps([]);
    } finally {
      setIsLoading(false);
    }
  }, [patientId, moduleCode]);

  useEffect(() => {
    loadGaps();
  }, [loadGaps]);

  const counts: GapCounts = {
    critical: gaps.filter(g => g.priority === 'critical').length,
    important: gaps.filter(g => g.priority === 'important').length,
    optional: gaps.filter(g => g.priority === 'optional').length,
    total: gaps.length,
  };

  return {
    gaps,
    counts,
    status,
    error,
    refetch: loadGaps,
    isLoading,
  };
}
