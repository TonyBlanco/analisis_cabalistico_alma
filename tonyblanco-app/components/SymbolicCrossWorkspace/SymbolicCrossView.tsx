'use client';

import type { SymbolicCrossDataset } from './types';
import { deriveCrossPatterns, deriveSystemDominance, deriveTemporalAlignment } from './rules';
import CrossPatterns from './sections/CrossPatterns';
import TemporalAlignmentSection from './sections/TemporalAlignment';
import SystemDominanceSection from './sections/SystemDominance';
import Notes from './sections/Notes';

interface SymbolicCrossViewProps {
  dataset: SymbolicCrossDataset;
}

export default function SymbolicCrossView({ dataset }: SymbolicCrossViewProps) {
  const patterns = dataset.patterns.length
    ? dataset.patterns
    : deriveCrossPatterns(dataset.events);
  const temporal = dataset.temporal.length
    ? dataset.temporal
    : deriveTemporalAlignment(dataset.events);
  const dominance = dataset.dominance.length
    ? dataset.dominance
    : deriveSystemDominance(dataset.events);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          Historial Simbolico del Paciente
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="rounded-full bg-gray-100 px-2 py-1">
            Paciente: {dataset.patientId}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-1">
            Eventos: {dataset.events.length}
          </span>
        </div>
      </div>
      <CrossPatterns patterns={patterns} />
      <TemporalAlignmentSection alignments={temporal} />
      <SystemDominanceSection dominance={dominance} />
      <Notes notes={dataset.notes} />
    </div>
  );
}
