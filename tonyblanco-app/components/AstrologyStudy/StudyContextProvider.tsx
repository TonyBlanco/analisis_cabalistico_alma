'use client';

import { createContext, useContext, useMemo } from 'react';
import type { NatalChartPayload } from '@/hooks/useNatalChart';

type StudyContextValue = {
  charts: Array<{ id: string; label: string; chart: NatalChartPayload }>;
  defaultChart: NatalChartPayload;
  researchDataset: Array<Record<string, unknown>>;
};

const StudyContext = createContext<StudyContextValue | null>(null);

const SAMPLE_CHART: NatalChartPayload = {
  planetas: [
    { nombre: 'sun', signo: 'Capricornio', grados: 279.7, longitud_ecliptica: 279.7, casa: 10, es_retrogrado: false },
    { nombre: 'moon', signo: 'Géminis', grados: 83.1, longitud_ecliptica: 83.1, casa: 3, es_retrogrado: false },
    { nombre: 'saturn', signo: 'Virgo', grados: 176.9, longitud_ecliptica: 176.9, casa: 6, es_retrogrado: false },
    { nombre: 'venus', signo: 'Acuario', grados: 310.3, longitud_ecliptica: 310.3, casa: 11, es_retrogrado: false },
  ],
  casas: Array.from({ length: 12 }, (_, i) => ({
    numero: i + 1,
    signo: ['Capricornio', 'Acuario', 'Piscis', 'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario'][i] || '',
    cuspide_grados: i * 30,
    cuspide_longitud: i * 30,
  })),
  aspectos: [
    { planeta1: 'sun', planeta2: 'moon', tipo: 'trine', orbe: 3.5, es_aplicativo: false },
    { planeta1: 'sun', planeta2: 'saturn', tipo: 'trine', orbe: 2.2, es_aplicativo: false },
    { planeta1: 'venus', planeta2: 'mars', tipo: 'square', orbe: 4.1, es_aplicativo: false },
  ],
  metadatos: {
    sistema_casas: 'P',
    zodiac_type: 'tropical',
    fuente: 'kerykeion/swisseph',
    version_engine: '1.x',
    calculated_at: new Date().toISOString(),
    input_snapshot: null,
  },
};

export function StudyContextProvider({ children, patientId }: { children: React.ReactNode; patientId?: string }) {
  if (patientId) {
    throw new Error('StudyContextProvider: patient context is not allowed in Study/Lab space.');
  }

  const value = useMemo<StudyContextValue>(() => {
    const charts = [{ id: 'study-sample-1', label: 'Carta de estudio (simulada)', chart: SAMPLE_CHART }];
    const researchDataset = [
      { id: 'res-1', note: 'Dataset simulado para Research Lab', planets: SAMPLE_CHART.planetas },
    ];
    return { charts, defaultChart: SAMPLE_CHART, researchDataset };
  }, []);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudyContext() {
  const ctx = useContext(StudyContext);
  if (!ctx) {
    throw new Error('useStudyContext must be used within StudyContextProvider');
  }
  return ctx;
}
