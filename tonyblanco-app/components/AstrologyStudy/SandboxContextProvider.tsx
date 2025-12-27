'use client';

import { createContext, useContext, useMemo, useState } from 'react';

export type SandboxScenario = {
  id: string;
  label: string;
  datetime: string;
  location: { lat: number; lon: number };
  technique: 'natal' | 'transits' | 'solar_return' | 'progressions';
  isSimulated: boolean;
};

type SandboxContextValue = {
  scenarios: SandboxScenario[];
  current: SandboxScenario;
  setCurrentById: (id: string) => void;
};

const SandboxContext = createContext<SandboxContextValue | null>(null);

const SCENARIOS: SandboxScenario[] = [
  {
    id: 'sbx-001',
    label: 'Sim 001 — Madrid 1980-01-01',
    datetime: '1980-01-01T00:00:00Z',
    location: { lat: 40.4168, lon: -3.7038 },
    technique: 'natal',
    isSimulated: true,
  },
  {
    id: 'sbx-002',
    label: 'Sim 002 — Buenos Aires 1990-06-15',
    datetime: '1990-06-15T12:00:00Z',
    location: { lat: -34.6037, lon: -58.3816 },
    technique: 'transits',
    isSimulated: true,
  },
];

export function SandboxContextProvider({
  children,
  patientContext,
}: {
  children: React.ReactNode;
  patientContext?: unknown;
}) {
  if (patientContext) {
    throw new Error('SandboxContextProvider: patient context is not allowed in Study/Lab space.');
  }

  const [currentId, setCurrentId] = useState<string>(SCENARIOS[0].id);

  const value = useMemo<SandboxContextValue>(() => {
    const current = SCENARIOS.find((s) => s.id === currentId) || SCENARIOS[0];
    return {
      scenarios: SCENARIOS,
      current,
      setCurrentById: (id: string) => setCurrentId(id),
    };
  }, [currentId]);

  return <SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>;
}

export function useSandboxContext() {
  const ctx = useContext(SandboxContext);
  if (!ctx) throw new Error('useSandboxContext must be used within SandboxContextProvider');
  return ctx;
}
