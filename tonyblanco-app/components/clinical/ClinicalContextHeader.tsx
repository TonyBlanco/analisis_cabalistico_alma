'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getActivePatient } from '@/lib/active-patient';

interface ActivePatientSummary {
  id: number;
  name: string | null;
}

const WORKSPACE_LABELS: Record<string, string> = {
  'astrologia-tarot': 'Astrologia Tarot',
  astrologia: 'Astrologia',
  'cabala-aplicada': 'Cabala Aplicada',
  cabala: 'Cabala',
  'bioemotional-experiencial-profunda': 'Bioemocional Experiencial',
  bioemotional: 'Bioemocional',
  'transgeneracional-profundo': 'Transgeneracional Profundo',
  scdf: 'SCDF',
  tests: 'Tests',
  patients: 'Pacientes',
};

function formatWorkspaceLabel(pathname: string | null): string {
  if (!pathname) return 'Workspace clinico';
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  return WORKSPACE_LABELS[last] ?? 'Workspace clinico';
}

export default function ClinicalContextHeader() {
  const pathname = usePathname();
  const [activePatient, setActivePatient] = useState<ActivePatientSummary | null>(
    null
  );

  useEffect(() => {
    const load = () => {
      const patient = getActivePatient();
      setActivePatient(patient);
    };

    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const workspaceLabel = useMemo(
    () => formatWorkspaceLabel(pathname),
    [pathname]
  );

  return (
    <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm text-gray-700">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] uppercase tracking-wide text-gray-500">
            Contexto clinico
          </span>
          <span className="font-medium text-gray-900">{workspaceLabel}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span className="font-medium text-gray-900">
            {activePatient?.name || 'Paciente no seleccionado'}
          </span>
          <span>ID: {activePatient?.id ?? '—'}</span>
          <span>Fecha de nacimiento: —</span>
        </div>
      </div>
    </div>
  );
}
