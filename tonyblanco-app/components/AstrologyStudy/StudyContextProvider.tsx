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
    { nombre: 'sun', signo: 'Capricornio', casa: 10, longitud_ecliptica: 279.7, velocidad: 1 },
    { nombre: 'moon', signo: 'Géminis', casa: 3, longitud_ecliptica: 83.1, velocidad: 13 },
    { nombre: 'saturn', signo: 'Virgo', casa: 6, longitud_ecliptica: 176.9, velocidad: 0.05 },
    { nombre: 'venus', signo: 'Acuario', casa: 11, longitud_ecliptica: 310.3, velocidad: 1.2 },
  ],
  casas: Array.from({ length: 12 }, (_, i) => ({
    numero: i + 1,
    signo: ['Cap', 'Acu', 'Pis', 'Ari', 'Tau', 'Gémi', 'Cán', 'Leo', 'Vir', 'Lib', 'Esc', 'Sag'][i] || '',
    cuspide: i * 30,
  })),
  aspectos: [
    { planeta1: 'sun', planeta2: 'moon', tipo: 'trine', orbe: 3.5 },
    { planeta1: 'sun', planeta2: 'saturn', tipo: 'trine', orbe: 2.2 },
    { planeta1: 'venus', planeta2: 'mars', tipo: 'square', orbe: 4.1 },
  ],
  metadatos: {
    sistema_casas: 'P',
    zodiac_type: 'tropical',
    fuente: 'kerykeion/swisseph',
    version_engine: '1.x',
    ephemeris_path: 'local (sim)',
    calculated_at: new Date().toISOString(),
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
