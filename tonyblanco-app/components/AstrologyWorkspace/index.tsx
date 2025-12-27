'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Telescope } from 'lucide-react';
import AstrologySidebar from './AstrologySidebar';
import AstrologyVisualCore from './AstrologyVisualCore';
import AstrologyTrainingInterpretationPanel from './AstrologyTrainingInterpretationPanel';
import type { AstrologyViewMode, AstrologyWorkspaceMode } from './types';
import { getActivePatientId } from '@/lib/active-patient';

function subscribeToActivePatient(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handler: EventListener = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener('activePatientChanged', handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('activePatientChanged', handler);
  };
}

export default function AstrologyWorkspace() {
  const [activeView, setActiveView] = useState<AstrologyViewMode>('visual');
  const [workspaceMode, setWorkspaceMode] = useState<AstrologyWorkspaceMode>('observational');
  const [houseSystem, setHouseSystem] = useState<string>('P');
  const [zodiacType, setZodiacType] = useState<string>('tropical');

  const activePatientId = useSyncExternalStore(subscribeToActivePatient, getActivePatientId, () => null);

  const handleSetWorkspaceMode = (mode: AstrologyWorkspaceMode) => {
    setWorkspaceMode(mode);
    if (mode === 'observational') {
      setActiveView('visual');
    } else if (mode === 'training') {
      setActiveView('training');
    }
  };

  const renderContent = () => {
    if (!activePatientId) {
      return (
        <section className="flex-1 bg-white border border-gray-200 rounded-xl p-12 shadow-sm text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-6">
              <Telescope className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Selecciona un consultante</h2>
          <p className="text-gray-600 mb-6">
            Para ver la carta natal, primero selecciona un consultante activo desde el dashboard.
          </p>
          <Link
            href="/dashboard/therapist"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Ir al Dashboard
          </Link>
        </section>
      );
    }

    if (activeView === 'visual') {
      return <AstrologyVisualCore patientId={activePatientId} houseSystem={houseSystem} zodiacType={zodiacType} />;
    }

    if (activeView === 'training') {
      if (workspaceMode !== 'training') {
        return (
          <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <p className="text-gray-700 font-medium">Interpretación disponible solo en Modo Training / Interpretativa.</p>
          </section>
        );
      }
      return (
        <AstrologyTrainingInterpretationPanel
          patientId={activePatientId.toString()}
          houseSystem={houseSystem}
          zodiacType={zodiacType}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <Telescope className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbólico</p>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">Astrología</h1>
              {workspaceMode === 'training' ? (
                <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
                  Modo Training / Interpretativa
                </span>
              ) : (
                <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-700">
                  Modo Observacional
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          href="/dashboard/therapist"
          className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200"
        >
          Volver al espacio principal
        </Link>
      </header>

      <div className="flex">
        <AstrologySidebar
          activeView={activeView}
          onViewChange={setActiveView}
          workspaceMode={workspaceMode}
          setWorkspaceMode={handleSetWorkspaceMode}
          houseSystem={houseSystem}
          setHouseSystem={setHouseSystem}
          zodiacType={zodiacType}
          setZodiacType={setZodiacType}
        />

        <main className="flex-1 px-6 py-6">
          {workspaceMode === 'training' ? (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="font-semibold">Modo Training / Interpretativa:</span> Interpretación simbólica estructurada con fines formativos.
              <span className="ml-2 inline-flex items-center rounded-md border border-amber-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                Uso educativo / no médico
              </span>
            </div>
          ) : (
            <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
              Modo Observacional: observación visual. Sin interpretación estructurada. No médico.
            </div>
          )}

          <div className="flex gap-6 items-start">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
