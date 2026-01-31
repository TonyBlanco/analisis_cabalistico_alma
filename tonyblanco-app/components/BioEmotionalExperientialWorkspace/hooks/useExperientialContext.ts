'use client';

import { useCallback, useEffect, useState } from 'react';
// Use new Consultante system with backward compatibility
import { getActiveConsultante, type ActiveConsultante } from '@/lib/active-consultante';
import { getPatientProfileSummary } from '@/lib/patient-api';
import type { BodyAnatomy, ExperientialContext } from '../types';

const normalizeBiologicalSex = (value?: string | null): BodyAnatomy => {
  if (value === 'male' || value === 'female' || value === 'intersex') {
    return value;
  }
  return 'unknown';
};

export const useExperientialContext = () => {
  const [context, setContext] = useState<ExperientialContext>({
    patientId: null,
    patientName: null,
    biologicalSex: 'unknown',
    sessionLabel: 'Sesion actual: sin registro',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContext = useCallback(async () => {
    // Use new Consultante system (falls back to legacy if needed)
    const activeConsultante = getActiveConsultante();
    if (!activeConsultante) {
      setContext({
        patientId: null,
        patientName: null,
        // NEW: consultante-specific fields
        consultanteId: null,
        consultanteUserId: null,
        consultanteName: null,
        biologicalSex: 'unknown',
        sessionLabel: 'Sesion actual: sin registro',
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use user_id (integer) for API calls - this is CRITICAL for assignments
      const profile = await getPatientProfileSummary(activeConsultante.id);
      setContext({
        // Legacy compatibility fields
        patientId: activeConsultante.id,
        patientName: activeConsultante.name || `Consultante #${activeConsultante.id}`,
        // NEW: Consultante-specific fields (always available)
        consultanteId: activeConsultante.id,
        consultanteUserId: activeConsultante.id,  // CRITICAL for assignments!
        consultanteName: activeConsultante.name,
        consultanteUuid: activeConsultante.uuid,
        biologicalSex: normalizeBiologicalSex(profile?.biologicalSex),
        sessionLabel: 'Sesion actual: activa',
      });
    } catch (err) {
      console.error('Error loading experiential context', err);
      setError('No se pudo cargar el contexto del consultante.');
      setContext({
        patientId: activeConsultante.id,
        patientName: activeConsultante.name || `Consultante #${activeConsultante.id}`,
        consultanteId: activeConsultante.id,
        consultanteUserId: activeConsultante.id,
        consultanteName: activeConsultante.name,
        consultanteUuid: activeConsultante.uuid,
        biologicalSex: 'unknown',
        sessionLabel: 'Sesion actual: sin registro',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContext();
    const handleChange = () => loadContext();
    // Listen to both old and new events for compatibility
    window.addEventListener('activeConsultanteChanged', handleChange);
    window.addEventListener('activePatientChanged', handleChange);
    window.addEventListener('storage', handleChange);
    return () => {
      window.removeEventListener('activeConsultanteChanged', handleChange);
      window.removeEventListener('activePatientChanged', handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, [loadContext]);

  return {
    context,
    loading,
    error,
  };
};
