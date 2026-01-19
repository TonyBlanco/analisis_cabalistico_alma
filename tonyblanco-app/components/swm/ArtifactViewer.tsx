/**
 * ArtifactViewer - Display workspace artifacts
 *
 * View progress snapshots, decisions, notes, and final synthesis
 */

import React, { useState } from 'react';
import { WorkspaceArtifact, ArtifactType } from '@/lib/api/swm-mcmi4-api';

interface ArtifactViewerProps {
  artifacts: WorkspaceArtifact[];
  onRefresh?: () => void;
}

const artifactTypeLabels: Partial<Record<ArtifactType, string>> = {
  progress_snapshot: 'Snapshot de Progreso',
  interpretation_note: 'Nota Interpretativa',
  decision_log: 'Log de Decisiones',
  final_synthesis: 'Sintesis Final',
  notes: 'Notas',
  'phase:discovery': 'Fase: Discovery',
  'phase:mapping': 'Fase: Mapping',
  'phase:interpretation': 'Fase: Interpretation',
  'phase:synthesis': 'Fase: Synthesis',
};

const artifactTypeColors: Partial<Record<ArtifactType, string>> = {
  progress_snapshot: 'bg-blue-100 text-blue-800',
  interpretation_note: 'bg-purple-100 text-purple-800',
  decision_log: 'bg-yellow-100 text-yellow-800',
  final_synthesis: 'bg-green-100 text-green-800',
  notes: 'bg-gray-100 text-gray-800',
  'phase:discovery': 'bg-indigo-100 text-indigo-800',
  'phase:mapping': 'bg-indigo-100 text-indigo-800',
  'phase:interpretation': 'bg-indigo-100 text-indigo-800',
  'phase:synthesis': 'bg-indigo-100 text-indigo-800',
};

export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({ artifacts, onRefresh }) => {
  const [selectedArtifact, setSelectedArtifact] = useState<WorkspaceArtifact | null>(null);
  const [filterType, setFilterType] = useState<ArtifactType | 'all'>('all');

  const filteredArtifacts =
    filterType === 'all' ? artifacts : artifacts.filter((a) => a.artifact_type === filterType);

  const sortedArtifacts = [...filteredArtifacts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Artefactos Generados</h3>
          {onRefresh && (
            <button onClick={onRefresh} className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700">
              Refrescar
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded text-sm ${
              filterType === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({artifacts.length})
          </button>
          {Object.entries(artifactTypeLabels).map(([type, label]) => {
            const count = artifacts.filter((a) => a.artifact_type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type as ArtifactType)}
                className={`px-3 py-1 rounded text-sm ${
                  filterType === type
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="divide-y max-h-96 overflow-y-auto">
        {sortedArtifacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay artefactos disponibles</div>
        ) : (
          sortedArtifacts.map((artifact) => (
            <div
              key={artifact.id}
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedArtifact(artifact)}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    artifactTypeColors[artifact.artifact_type] ?? 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {artifactTypeLabels[artifact.artifact_type] ?? artifact.artifact_type}
                </span>
                <span className="text-xs text-gray-500">{new Date(artifact.created_at).toLocaleString()}</span>
              </div>
              <div className="text-sm text-gray-600">
                {artifact.is_sealed && (
                  <span className="inline-flex items-center mr-2">
                    <span className="ml-1">Sellado</span>
                  </span>
                )}
                ID: {artifact.id.slice(0, 8)}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedArtifact && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedArtifact(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      artifactTypeColors[selectedArtifact.artifact_type] ?? 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {artifactTypeLabels[selectedArtifact.artifact_type] ?? selectedArtifact.artifact_type}
                  </span>
                  <p className="text-sm text-gray-600 mt-2">{new Date(selectedArtifact.created_at).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setSelectedArtifact(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  x
                </button>
              </div>

              <div className="bg-gray-50 rounded p-4">
                <pre className="text-sm whitespace-pre-wrap text-gray-800 font-mono">
                  {JSON.stringify(selectedArtifact.content, null, 2)}
                </pre>
              </div>

              {selectedArtifact.metadata && Object.keys(selectedArtifact.metadata).length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Metadata:</h4>
                  <pre className="text-xs bg-gray-50 rounded p-3 text-gray-700">
                    {JSON.stringify(selectedArtifact.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

