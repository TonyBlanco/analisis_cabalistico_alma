'use client';

import { useEffect, useMemo, useState } from 'react';
import SymbolicCrossView from './SymbolicCrossView';
import { mockCrossDataset } from './mock';
import type { SymbolicCrossEvent, SymbolicCrossDataset } from './types';
import type { SymbolicTimelineEvent } from '../SymbolicTimeline/types';
import { subscribeSymbolicTimeline } from '../SymbolicTimeline/store';

interface SymbolicCrossWorkspaceProps {
  patientId?: string | null;
}

function mapTimelineEvent(event: SymbolicTimelineEvent, index: number): SymbolicCrossEvent {
  const symbols = [
    ...(event.symbols.cards ?? []),
    ...(event.symbols.letters ?? []),
    ...(event.symbols.sefirot ?? []),
    ...(event.symbols.paths ?? []),
  ];

  return {
    id: `cross-${index}`,
    date: event.date,
    system: 'tarot',
    symbols,
    sourceEventId: `${event.workspace}-${event.date}-${index}`,
    notes: event.notes,
  };
}

export default function SymbolicCrossWorkspace({ patientId }: SymbolicCrossWorkspaceProps) {
  const [timelineEvents, setTimelineEvents] = useState<SymbolicTimelineEvent[]>([]);

  useEffect(() => subscribeSymbolicTimeline(setTimelineEvents), []);

  const filteredTimeline = useMemo(() => {
    if (!patientId) return [];
    return timelineEvents.filter((event) => event.patientId === patientId);
  }, [timelineEvents, patientId]);

  const crossEvents = useMemo(
    () => filteredTimeline.map(mapTimelineEvent),
    [filteredTimeline]
  );

  const dataset: SymbolicCrossDataset = useMemo(
    () => ({
      ...mockCrossDataset,
      patientId: patientId || mockCrossDataset.patientId,
      events: crossEvents,
    }),
    [crossEvents, patientId]
  );

  return (
    <section className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">
            Symbolic Cross Workspace
          </h1>
          <p className="text-sm text-gray-500">
            Cruce observacional entre Tarot, Arbol y Astrologia.
          </p>
        </header>
        <SymbolicCrossView dataset={dataset} events={crossEvents} />
      </div>
    </section>
  );
}
