'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Sparkles } from 'lucide-react';
import CabalAppliedSidebar from './CabalAppliedSidebar';
import CabalAppliedVisualCore from './CabalAppliedVisualCore';
import type { CabalSectionId } from './types';
import CabalAppliedToolsPanel, { type CabalaToolsTabId } from './CabalAppliedToolsPanel';
import type { CabalaAplicadaWorkspaceExportState } from './CabalAppliedVisualCore';

export default function CabalAppliedWorkspace() {
  const [activeSection, setActiveSection] = useState<CabalSectionId>('tree');
  const [activeTool, setActiveTool] = useState<CabalaToolsTabId>('history');
  const [workspaceState, setWorkspaceState] = useState<CabalaAplicadaWorkspaceExportState>({
    patientId: null,
    patientName: null,
    patientBirthDate: null,
    selectedMethodId: null,
    treeState: null,
    backendStructuralState: null,
    pdfSummary: {
      sefirotActivas: [],
      senderosActivos: [],
      repeticiones: [],
    },
  });
  const [lastSnapshotRecordId, setLastSnapshotRecordId] = useState<string | null>(null);

  const handleWorkspaceStateChange = useCallback((next: CabalaAplicadaWorkspaceExportState) => {
    setWorkspaceState(next);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workspace especializado</p>
            <h1 className="text-2xl font-semibold text-gray-900">Cabala Aplicada</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTool('history')}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Historial
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('snapshot')}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Snapshot
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('interpretation')}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Interpretación
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('pdf')}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            PDF
          </button>

          <Link
            href="/dashboard/therapist"
            className="ml-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200"
          >
            Volver al espacio clinico
          </Link>
        </div>
      </header>

      <div className="flex">
        <CabalAppliedSidebar activeSection={activeSection} onChange={setActiveSection} />
        <main className="flex-1 px-6 py-6">
          <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            Observacional. Sin interpretacion, sin automatizacion, sin diagnostico.
          </div>
          <div className="flex gap-6 items-start">
            <CabalAppliedVisualCore
              activeSection={activeSection}
              onWorkspaceStateChange={handleWorkspaceStateChange}
              onSnapshotSaved={(id) => setLastSnapshotRecordId(id)}
            />
            <CabalAppliedToolsPanel
              activeTab={activeTool}
              onChangeTab={setActiveTool}
              workspaceState={workspaceState}
              lastSnapshotRecordId={lastSnapshotRecordId}
              onSnapshotSaved={(id) => setLastSnapshotRecordId(id)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
