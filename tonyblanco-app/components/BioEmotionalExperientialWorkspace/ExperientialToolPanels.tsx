'use client';

import DictionaryPanel from './DictionaryPanel';
import ObservationPanel from './ObservationPanel';
import HypothesisPanel from './HypothesisPanel';
import SynthesisPanel from './SynthesisPanel';
import ClosurePanel from './ClosurePanel';
import AssistedDiagnosisPanel from './AssistedDiagnosisPanel';
import type { WorkspaceState } from './types';
import type { AnatomicalRegion } from './data/anatomicalRegions';
import type { BioEmotionalSynthesis } from '@/lib/api/bioemotional-clinical';

interface ExperientialToolPanelsProps {
  state: WorkspaceState;
  hasPatient: boolean;
  selectedRegion: AnatomicalRegion | null;
  synthesisRecord: BioEmotionalSynthesis | null;
  onSynthesisSaved: (record: BioEmotionalSynthesis) => void;
  onSynthesisClosed: (record: BioEmotionalSynthesis) => void;
  observationInsert: string | null;
  onObservationInsertApplied: () => void;
  hypothesisInsert: string | null;
  onHypothesisInsertApplied: () => void;
  synthesisInsert: string | null;
  onSynthesisInsertApplied: () => void;
  onCopyToObservation: (text: string) => void;
  onCopyToHypothesis: (text: string) => void;
  onCopyToSynthesis: (text: string) => void;
  onInsertToSynthesis: (text: string) => void;
  isReadOnly: boolean;
  referenceSnippets: string[];
}

export default function ExperientialToolPanels({
  state,
  hasPatient,
  selectedRegion,
  synthesisRecord,
  onSynthesisSaved,
  onSynthesisClosed,
  observationInsert,
  onObservationInsertApplied,
  hypothesisInsert,
  onHypothesisInsertApplied,
  synthesisInsert,
  onSynthesisInsertApplied,
  onCopyToObservation,
  onCopyToHypothesis,
  onCopyToSynthesis,
  onInsertToSynthesis,
  isReadOnly,
  referenceSnippets,
}: ExperientialToolPanelsProps) {
  return (
    <aside className="w-full flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900">Panel consultivo</h4>
        <p className="text-xs text-gray-600">
          Sin automatizacion ni diagnostico. Todo registro es humano y editable.
        </p>
      </div>

      {!hasPatient && (
        <div className="bg-white border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
          No hay paciente activo. Este workspace necesita contexto de paciente para operar.
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,65%)_minmax(0,35%)] gap-4 items-start">
        {state === 'observation' && (
          <>
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Observaciones inmediatas</h4>
                <p className="text-xs text-gray-600">
                  Captura notas humanas sobre sensaciones, lenguaje corporal y foco de atencion.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Referencias simbolicas</h4>
                <p className="text-xs text-gray-600">
                  Cruza cuerpo vivido, arbol y diccionario en modo consultivo.
                </p>
              </div>
            </div>
          </>
        )}

        {state === 'analysis' && (
          <>
            <div className="space-y-4">
              <ObservationPanel
                selectedRegion={selectedRegion}
                insertText={observationInsert}
                onInsertApplied={onObservationInsertApplied}
                isReadOnly={isReadOnly}
              />
              <HypothesisPanel
                selectedRegion={selectedRegion}
                insertText={hypothesisInsert}
                onInsertApplied={onHypothesisInsertApplied}
                isReadOnly={isReadOnly}
              />
            </div>
            <div className="space-y-4">
              {/* Dictionary Panel - Phase 2 Integration */}
              <DictionaryPanel
                selectedRegion={selectedRegion}
                onCopyToObservation={onCopyToObservation}
                onCopyToHypothesis={onCopyToHypothesis}
                onCopyToSynthesis={onCopyToSynthesis}
                isReadOnly={isReadOnly}
              />
            </div>
          </>
        )}

        {state === 'synthesis' && (
          <>
            <div className="space-y-4">
              <SynthesisPanel
                selectedRegion={selectedRegion}
                insertText={synthesisInsert}
                onInsertApplied={onSynthesisInsertApplied}
                synthesisRecord={synthesisRecord}
                onSaved={onSynthesisSaved}
                isReadOnly={isReadOnly}
                referenceSnippets={referenceSnippets}
              />
              <AssistedDiagnosisPanel
                synthesisRecord={synthesisRecord}
                referenceSnippets={referenceSnippets}
                onInsertToSynthesis={onInsertToSynthesis}
                isReadOnly={isReadOnly}
              />
            </div>
            <div className="space-y-4">
              <DictionaryPanel
                selectedRegion={selectedRegion}
                onCopyToSynthesis={onCopyToSynthesis}
                isReadOnly={isReadOnly}
              />
            </div>
          </>
        )}

        {state === 'closure' && (
          <>
            <div className="space-y-4">
              <ClosurePanel
                synthesisRecord={synthesisRecord}
                onClosed={onSynthesisClosed}
                isReadOnly={isReadOnly}
              />
            </div>
            <div className="space-y-4">
              <DictionaryPanel selectedRegion={selectedRegion} isReadOnly={true} />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
