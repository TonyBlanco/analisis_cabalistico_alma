'use client';

import Link from 'next/link';
import { useState } from 'react';
import ExperientialSidebar from './ExperientialSidebar';
import ExperientialToolPanels from './ExperientialToolPanels';
import ExperientialVisualCore from './ExperientialVisualCore';
import { useExperientialContext } from './hooks/useExperientialContext';
import type { WorkspaceState } from './types';

export default function BioEmotionalExperientialWorkspace() {
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>('observation');
  const { context, loading, error } = useExperientialContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex border-b border-gray-200 bg-white">
        <div className="flex-1 px-6 py-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Bio-Emocion Experiencial Profunda
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">Workspace especializado</h1>
          <p className="text-sm text-gray-600">
            Espacio consultivo de alta densidad. No diagnostico ni automatizado.
          </p>
        </div>
        <div className="px-6 py-4 flex items-center">
          <Link
            href="/dashboard/therapist"
            className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200"
          >
            Volver al espacio clinico
          </Link>
        </div>
      </div>

      <div className="flex">
        <ExperientialSidebar state={workspaceState} onStateChange={setWorkspaceState} />

        <main className="flex-1 px-6 py-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">
              {loading ? 'Cargando contexto del paciente...' : 'Contexto heredado del workspace clinico'}
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">
              {context.patientName ? `Paciente: ${context.patientName}` : 'Paciente: sin seleccionar'}
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">
              {context.sessionLabel}
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <ExperientialVisualCore anatomy={context.biologicalSex} state={workspaceState} />
            <ExperientialToolPanels
              state={workspaceState}
              hasPatient={Boolean(context.patientId)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
