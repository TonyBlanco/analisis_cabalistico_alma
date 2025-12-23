'use client';

import Link from 'next/link';
import { useState } from 'react';
import ExperientialSidebar from './ExperientialSidebar';
import ExperientialToolPanels from './ExperientialToolPanels';
import ExperientialVisualCore from './ExperientialVisualCore';
import { useExperientialContext } from './hooks/useExperientialContext';
import { useBodySelection } from './hooks/useBodySelection';
import type { WorkspaceState } from './types';
import type { BioEmotionalSynthesis } from '@/lib/api/bioemotional-clinical';

export default function BioEmotionalExperientialWorkspace() {
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>('observation');
  const { context, loading, error } = useExperientialContext();
  const { selectedRegionId, selectedRegion, selectRegion, clearSelection } = useBodySelection();
  const [synthesisRecord, setSynthesisRecord] = useState<BioEmotionalSynthesis | null>(null);
  const [observationInsert, setObservationInsert] = useState<string | null>(null);
  const [hypothesisInsert, setHypothesisInsert] = useState<string | null>(null);
  const [synthesisInsert, setSynthesisInsert] = useState<string | null>(null);
  const [referenceSnippets, setReferenceSnippets] = useState<string[]>([]);

  const isReadOnly = workspaceState === 'closure' || Boolean(synthesisRecord?.is_closed);

  const registerReference = (text: string) => {
    setReferenceSnippets((prev) => [text, ...prev].slice(0, 10));
  };

  const handleCopyToObservation = (text: string) => {
    registerReference(text);
    setObservationInsert(text);
  };

  const handleCopyToHypothesis = (text: string) => {
    registerReference(text);
    setHypothesisInsert(text);
  };

  const handleCopyToSynthesis = (text: string) => {
    registerReference(text);
    setSynthesisInsert(text);
  };

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
            {selectedRegion && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 font-medium">
                Región: {selectedRegion.label}
              </div>
            )}
          </div>

          <div className="grid grid-cols-[minmax(0,34%)_minmax(0,42%)_minmax(0,24%)] gap-6 items-start">
            <ExperientialVisualCore
              anatomy={context.biologicalSex}
              state={workspaceState}
              selectedRegionId={selectedRegionId}
              onRegionSelect={selectRegion}
              selectedRegion={selectedRegion}
              onClearSelection={clearSelection}
            />
            <div className="col-span-2">
              <ExperientialToolPanels
                state={workspaceState}
                hasPatient={Boolean(context.patientId)}
                selectedRegion={selectedRegion}
                synthesisRecord={synthesisRecord}
                onSynthesisSaved={setSynthesisRecord}
                onSynthesisClosed={setSynthesisRecord}
                observationInsert={observationInsert}
                onObservationInsertApplied={() => setObservationInsert(null)}
                hypothesisInsert={hypothesisInsert}
                onHypothesisInsertApplied={() => setHypothesisInsert(null)}
                synthesisInsert={synthesisInsert}
                onSynthesisInsertApplied={() => setSynthesisInsert(null)}
                onCopyToObservation={handleCopyToObservation}
                onCopyToHypothesis={handleCopyToHypothesis}
                onCopyToSynthesis={handleCopyToSynthesis}
                onInsertToSynthesis={(text) => setSynthesisInsert(text)}
                isReadOnly={isReadOnly}
                referenceSnippets={referenceSnippets}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
