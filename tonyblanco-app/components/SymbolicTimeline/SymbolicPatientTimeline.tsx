'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SymbolicTimelineEvent } from './types';
import { subscribeSymbolicTimeline } from './store';

interface SymbolicPatientTimelineProps {
  patientId?: string | null;
  title?: string;
}

function groupEventsByDate(events: SymbolicTimelineEvent[]) {
  return events.reduce<Record<string, SymbolicTimelineEvent[]>>((acc, event) => {
    const dateKey = event.date.split('T')[0] || event.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {});
}

export default function SymbolicPatientTimeline({
  patientId,
  title = 'Historial Simbolico del Paciente',
}: SymbolicPatientTimelineProps) {
  const [events, setEvents] = useState<SymbolicTimelineEvent[]>([]);

  useEffect(() => subscribeSymbolicTimeline(setEvents), []);

  const filteredEvents = useMemo(() => {
    if (!patientId) return [];
    return events.filter((event) => event.patientId === patientId);
  }, [events, patientId]);

  const grouped = useMemo(() => groupEventsByDate(filteredEvents), [filteredEvents]);
  const dateKeys = useMemo(
    () => Object.keys(grouped).sort((a, b) => b.localeCompare(a)),
    [grouped]
  );

  if (!patientId) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        <div className="text-xs uppercase tracking-wide text-gray-500">{title}</div>
        <p className="mt-2">Paciente no seleccionado.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
      <div className="text-xs uppercase tracking-wide text-gray-500">{title}</div>
      {dateKeys.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">
          No hay eventos simbolicos registrados.
        </p>
      ) : (
        <div className="mt-4 space-y-6">
          {dateKeys.map((dateKey) => (
            <div key={dateKey} className="space-y-3">
              <div className="text-xs font-semibold text-gray-500">
                {dateKey}
              </div>
              <div className="border-l border-gray-200 pl-4 space-y-3">
                {grouped[dateKey].map((event, index) => (
                  <div key={`${event.date}-${index}`} className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="rounded-full bg-gray-100 px-2 py-1">
                        {event.workspace}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-1">
                        {event.system}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-1">
                        {event.source}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {event.symbols.cards?.length ? (
                        <div>
                          <span className="font-medium">Cartas:</span>{' '}
                          {event.symbols.cards.join(', ')}
                        </div>
                      ) : null}
                      {event.symbols.letters?.length ? (
                        <div>
                          <span className="font-medium">Letras:</span>{' '}
                          {event.symbols.letters.join(', ')}
                        </div>
                      ) : null}
                      {event.symbols.sefirot?.length ? (
                        <div>
                          <span className="font-medium">Sefirot:</span>{' '}
                          {event.symbols.sefirot.join(', ')}
                        </div>
                      ) : null}
                      {event.symbols.paths?.length ? (
                        <div>
                          <span className="font-medium">Senderos:</span>{' '}
                          {event.symbols.paths.join(', ')}
                        </div>
                      ) : null}
                      {event.notes ? (
                        <div>
                          <span className="font-medium">Notas:</span>{' '}
                          {event.notes}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
