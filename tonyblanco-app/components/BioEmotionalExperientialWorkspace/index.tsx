'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import ExperientialSidebar from './ExperientialSidebar';
import ExperientialToolPanels from './ExperientialToolPanels';
import ExperientialVisualCore from './ExperientialVisualCore';
import { useExperientialContext } from './hooks/useExperientialContext';
import { useBodySelection } from './hooks/useBodySelection';
import { GenericAIAssistantPanel } from '@/components/ai';
import type { WorkspaceState, WorkspaceProgress } from './types';
import type { BioEmotionalSynthesis } from '@/lib/api/bioemotional-clinical';
import AssignBioEmotionalModal from '@/components/AssignBioEmotionalModal';

// Import design system
import './design-tokens.css';
import './utilities.css';

export default function BioEmotionalExperientialWorkspace() {
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>('observation');
  const { context, loading, error } = useExperientialContext();
  const { selectedRegionId, selectedRegion, selectRegion, clearSelection } = useBodySelection();
  const [synthesisRecord, setSynthesisRecord] = useState<BioEmotionalSynthesis | null>(null);
  const [observationInsert, setObservationInsert] = useState<string | null>(null);
  const [hypothesisInsert, setHypothesisInsert] = useState<string | null>(null);
  const [synthesisInsert, setSynthesisInsert] = useState<string | null>(null);
  const [referenceSnippets, setReferenceSnippets] = useState<string[]>([]);
  
  // Assignment modal state
  const [showAssignBioEmotionalModal, setShowAssignBioEmotionalModal] = useState(false);

  const isReadOnly = workspaceState === 'closure' || Boolean(synthesisRecord?.is_closed);

  // Calculate progress for each phase
  const progress = useMemo<WorkspaceProgress>(() => {
    const hasPatient = Boolean(context.patientId);
    const hasRegion = Boolean(selectedRegion);
    const hasSynthesis = Boolean(synthesisRecord);
    const isClosed = Boolean(synthesisRecord?.is_closed);

    return {
      observation: hasPatient ? (hasRegion ? 100 : 50) : 0,
      analysis: hasRegion ? (referenceSnippets.length > 0 ? 100 : 50) : 0,
      synthesis: hasSynthesis ? 100 : (referenceSnippets.length > 0 ? 30 : 0),
      closure: isClosed ? 100 : (hasSynthesis ? 50 : 0),
      evolution: hasPatient ? 100 : 0, // Evolution is always available with patient
    };
  }, [context.patientId, selectedRegion, synthesisRecord, referenceSnippets.length]);

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
      {/* Header con gradiente */}
      <div className="flex border-b border-gray-200 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="flex-1 px-6 py-6">
          <p className="text-xs uppercase tracking-wide text-white/80 font-medium">
            Bio-Emoción Experiencial Profunda
          </p>
          <h1 className="text-3xl font-bold text-white mt-1">
            Workspace Especializado
          </h1>
          <p className="text-sm text-white/90 mt-2">
            Espacio consultivo de alta densidad. No diagnóstico ni automatizado.
          </p>
        </div>
        <div className="px-6 py-6 flex items-center">
          <Link
            href="/dashboard/therapist"
            className="bio-btn bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-sm"
          >
            ← Volver al espacio clínico
          </Link>
        </div>
      </div>

      {/* Banner de disclaimer */}
      <div className="sticky top-0 z-50 bio-disclaimer bio-animate-slide-in-up">
        <svg className="bio-disclaimer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="bio-disclaimer-text">
          Este espacio es consultivo y exploratorio. NO sustituye diagnóstico médico profesional.
        </span>
      </div>

      <div className="flex">
        <ExperientialSidebar
          state={workspaceState}
          onStateChange={setWorkspaceState}
          progress={progress}
        />

        <main className="flex-1 px-6 py-6">
          {/* Contexto del paciente con glassmorphism */}
          <div className="mb-6 flex flex-wrap items-center gap-3 bio-animate-fade-in">
            <div className="bio-card-glass px-4 py-2 text-sm text-gray-700">
              {loading ? (
                <div className="bio-skeleton h-4 w-48" />
              ) : (
                'Contexto heredado del workspace clínico'
              )}
            </div>
            {error && (
              <div className="bio-badge bio-badge-danger">
                {error}
              </div>
            )}
            <div className="bio-card-glass px-4 py-2 text-sm font-medium text-gray-900">
              👤 {context.patientName || 'Sin seleccionar'}
            </div>
            <div className="bio-card-glass px-4 py-2 text-sm text-gray-700">
              📅 {context.sessionLabel}
            </div>
            {selectedRegion && (
              <div className="bio-card-glass px-4 py-2 text-sm font-semibold text-indigo-700 border-2 border-indigo-300 bio-animate-slide-in-right">
                📍 Región: {selectedRegion.label}
              </div>
            )}
            
            {/* Assignment Actions - visible when patient is loaded */}
            {context.patientId && (
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setShowAssignBioEmotionalModal(true)}
                  className="bio-btn bio-btn-sm bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                  title="Asignar Bio-Emocional (22 ítems)"
                >
                  🌿 Bio-Emocional
                </button>
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
            <div className="col-span-1">
              <ExperientialToolPanels
                state={workspaceState}
                hasPatient={Boolean(context.patientId)}
                patientId={context.patientId}
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
            <div className="col-span-1">
              {/* Panel de IA Bio-Emocional */}
              <GenericAIAssistantPanel
                moduleType="bioemocional"
                moduleTitle="Bio-Emocional"
                consultanteId={context.patientId ?? undefined}
                context={{
                  consultante_name: context.patientName,
                  selected_region: selectedRegion?.label,
                  workspace_state: workspaceState,
                  module: 'bioemotional-experiential',
                }}
              />
            </div>
          </div>
        </main>
      </div>
      
      {/* Assignment Modal */}
      {context.patientId && (
        <AssignBioEmotionalModal
          isOpen={showAssignBioEmotionalModal}
          onClose={() => setShowAssignBioEmotionalModal(false)}
          patientId={context.patientId}
          patientUserId={18} // Luis Antonio Blanco Fontela user_id from DB
          patientName={context.patientName || 'Paciente'}
        />
      )}
    </div>
  );
}
