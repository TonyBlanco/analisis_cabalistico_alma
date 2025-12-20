'use client';

import { useCallback, useEffect, useState } from 'react';
import { getActivePatient } from '@/lib/active-patient';
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
    const activePatient = getActivePatient();
    if (!activePatient) {
      setContext({
        patientId: null,
        patientName: null,
        biologicalSex: 'unknown',
        sessionLabel: 'Sesion actual: sin registro',
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const profile = await getPatientProfileSummary(activePatient.id);
      setContext({
        patientId: activePatient.id,
        patientName: activePatient.name || `Paciente #${activePatient.id}`,
        biologicalSex: normalizeBiologicalSex(profile?.biologicalSex),
        sessionLabel: 'Sesion actual: activa',
      });
    } catch (err) {
      console.error('Error loading experiential context', err);
      setError('No se pudo cargar el contexto del paciente.');
      setContext({
        patientId: activePatient.id,
        patientName: activePatient.name || `Paciente #${activePatient.id}`,
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
    window.addEventListener('activePatientChanged', handleChange);
    window.addEventListener('storage', handleChange);
    return () => {
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
