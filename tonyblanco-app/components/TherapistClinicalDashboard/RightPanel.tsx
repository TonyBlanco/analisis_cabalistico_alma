'use client';

import React from 'react';
import AssignedTestsSection from '@/components/AssignedTestsSection';
import { bodyRegions } from '@/components/BodySoulVisualization/data/bodyRegions';
import {
  sefirotBodyCorrespondences,
  sefirotDefinitions,
} from '@/components/BodySoulVisualization/data/sefirotCorrespondences';
import type { VisualizationState } from '@/components/BodySoulVisualization/types';
import type { ContextSectionId, IntegrativeNote } from './types';
import { usePanelManager } from '@/components/TherapistWorkspace/PanelManagerContext';

interface RightPanelProps {
  activeSection: ContextSectionId;
  visualizationState: VisualizationState | null;
  integrativeNotes: IntegrativeNote[];
  onAddNote: (text: string) => void;
}

const resolveRegion = (id: string | null) =>
  bodyRegions.find((region) => region.id === id) || null;

const resolveSefirah = (id: string | null) =>
  sefirotDefinitions.find((sefirah) => sefirah.id === id) || null;

export default function RightPanel({
  activeSection,
  visualizationState,
  integrativeNotes,
  onAddNote,
}: RightPanelProps) {
  const { openPanel } = usePanelManager();
  const selectedRegion = resolveRegion(visualizationState?.selectedBodyRegionId || null);
  const selectedSefirah = resolveSefirah(visualizationState?.selectedSefirahId || null);

  const correspondences = sefirotBodyCorrespondences.filter((item) => {
    if (selectedRegion) return item.bodyRegionId === selectedRegion.id;
    if (selectedSefirah) return item.sefirahId === selectedSefirah.id;
    return false;
  });

  return (
    <div className="space-y-4">
      {activeSection === 'overview' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Overview</h3>
          <p className="text-xs text-gray-500">
            Situational awareness panel. No automated conclusions.
          </p>
          <div className="rounded-md border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
            <p>
              Focused region: {selectedRegion ? selectedRegion.label : 'None'}
            </p>
            <p>
              Focused sefirah: {selectedSefirah ? selectedSefirah.spanishName : 'None'}
            </p>
            <p>
              Active layers:{' '}
              {visualizationState?.activeLayers.length
                ? visualizationState.activeLayers.join(', ')
                : 'None'}
            </p>
          </div>
          <p className="text-xs text-gray-500">
            The therapist observes before acting.
          </p>
        </div>
      )}

      {activeSection === 'clinical-history' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Clinical history</h3>
          <p className="text-xs text-gray-500">
            Contextual background for longitudinal observation.
          </p>
          <div className="rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-500">
            No structured history loaded in this view. Use the patient profile and session
            records for deeper context.
          </div>
        </div>
      )}

      {activeSection === 'bioemotional' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Bio-Emotional</h3>
          <p className="text-xs text-gray-500">
            Consultive view for symbolic and relational observations.
          </p>
          <div className="rounded-md border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
            Use the Bio-Emotional module to review the dictionary, hypotheses, and symbolic notes.
          </div>
          <button
            type="button"
            onClick={() => openPanel('bioemotional')}
            className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            Open Bio-Emotional panel
          </button>
        </div>
      )}

      {activeSection === 'visualization' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Visualization context</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <p>
              Active layers:{' '}
              {visualizationState?.activeLayers.length
                ? visualizationState.activeLayers.join(', ')
                : 'None'}
            </p>
            <p>Side: {visualizationState?.side || 'front'}</p>
            <p>
              Focus: {selectedRegion?.label || selectedSefirah?.spanishName || 'None'}
            </p>
          </div>
          {correspondences.length > 0 && (
            <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
              <p className="font-medium text-gray-700">Symbolic correspondence</p>
              {correspondences.map((item) => (
                <p key={`${item.sefirahId}-${item.bodyRegionId}`}>{item.note}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'evaluations' && (
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Evaluations</h3>
            <p className="text-xs text-gray-500">
              Read-only view of assigned tests. No automated metrics here.
            </p>
          </div>
          <AssignedTestsSection />
        </div>
      )}

      {activeSection === 'integrative-notes' && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Integrative notes</h3>
          <p className="text-xs text-gray-500">
            Human notes only. No automation or interpretation.
          </p>
          <IntegrativeNotesForm onAddNote={onAddNote} />
          <div className="space-y-2">
            {integrativeNotes.length === 0 && (
              <p className="text-xs text-gray-500">
                No notes recorded yet.
              </p>
            )}
            {integrativeNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-md border border-gray-100 bg-gray-50 p-3 text-xs text-gray-700"
              >
                <p className="whitespace-pre-line">{note.text}</p>
                <p className="mt-2 text-[11px] text-gray-500">
                  {new Date(note.createdAt).toLocaleString('es-ES')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IntegrativeNotesForm({ onAddNote }: { onAddNote: (text: string) => void }) {
  const [text, setText] = React.useState('');

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        placeholder="Write a consultive observation."
      />
      <button
        type="button"
        onClick={() => {
          const trimmed = text.trim();
          if (!trimmed) return;
          onAddNote(trimmed);
          setText('');
        }}
        className="px-3 py-2 text-xs font-medium text-white rounded-md hover:opacity-90"
        style={{ backgroundColor: 'var(--accent-color)' }}
      >
        Save note
      </button>
    </div>
  );
}
