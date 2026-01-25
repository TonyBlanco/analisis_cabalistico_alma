// components/inquiry/hooks/useInquiryResponse.ts
import { useState, useCallback } from 'react';
import { saveInquiryResponse } from '../../../lib/api/inquiry';
import type { 
  GapResponse, 
  SaveResponseRequest 
} from '../InquiryWidget.types';

interface UseInquiryResponseResult {
  saveResponse: (
    patientId: number,
    gapCode: string,
    value: any,
    notes?: string
  ) => Promise<void>;
  isSaving: boolean;
  error: string | null;
}

/**
 * Hook para guardar respuestas de inquiries
 */
export function useInquiryResponse(
  onSuccess?: (gapCode: string, response: GapResponse) => void
): UseInquiryResponseResult {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveResponse = useCallback(
    async (
      patientId: number,
      gapCode: string,
      value: any,
      notes?: string
    ) => {
      setIsSaving(true);
      setError(null);

      try {
        const request: SaveResponseRequest = {
          patient_id: patientId,
          inquiry_code: gapCode,
          response_value: value,
          collected_by: 'therapist_session',
          notes,
        };

        await saveInquiryResponse(request);

        const response: GapResponse = {
          gapCode,
          value,
          collectedAt: new Date().toISOString(),
          collectedBy: 'therapist_session',
          notes,
        };

        onSuccess?.(gapCode, response);
      } catch (err) {
        console.error('Error saving inquiry response:', err);
        const errorMsg = err instanceof Error ? err.message : 'Error al guardar respuesta';
        setError(errorMsg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [onSuccess]
  );

  return {
    saveResponse,
    isSaving,
    error,
  };
}
