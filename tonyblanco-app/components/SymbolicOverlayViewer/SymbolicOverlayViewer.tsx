'use client';

import { useMemo, useState } from 'react';
import type { CrossPattern, SymbolicOverlayData } from './types';
import TarotHighlightsLayer from './layers/TarotHighlightsLayer';
import TreeHighlightsLayer from './layers/TreeHighlightsLayer';
import AstrologyHighlightsLayer from './layers/AstrologyHighlightsLayer';
import Legend from './Legend';
import ProvenancePanel from './ProvenancePanel';

interface SymbolicOverlayViewerProps {
  data: SymbolicOverlayData;
}

export default function SymbolicOverlayViewer({ data }: SymbolicOverlayViewerProps) {
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(
    data.patterns[0]?.id ?? null
  );

  const selectedPattern = useMemo(
    () => data.patterns.find((pattern) => pattern.id === selectedPatternId) || null,
    [data.patterns, selectedPatternId]
  );

  const tarotCards = useMemo(() => {
    const cards = data.events.flatMap((event) => event.symbols.cards ?? []);
    return Array.from(new Set(cards));
  }, [data.events]);

  const sefirot = useMemo(() => {
    const items = data.events.flatMap((event) => event.symbols.sefirot ?? []);
    return Array.from(new Set(items));
  }, [data.events]);

  const paths = useMemo(() => {
    const items = data.events.flatMap((event) => event.symbols.paths ?? []);
    return Array.from(new Set(items));
  }, [data.events]);

  const dates = useMemo(
    () => data.events.map((event) => event.date.split('T')[0]),
    [data.events]
  );

  const tokens = useMemo(() => {
    const letters = data.events.flatMap((event) => event.symbols.letters ?? []);
    return Array.from(new Set(letters));
  }, [data.events]);

  const highlighted = useMemo(() => {
    if (!selectedPattern) {
      return {
        cards: [],
        sefirot: [],
        paths: [],
        dates: [],
      };
    }
    const symbols = selectedPattern.evidence.flatMap((item) => item.symbols);
    return {
      cards: symbols.filter((symbol) => tarotCards.includes(symbol)),
      sefirot: symbols.filter((symbol) => sefirot.includes(symbol)),
      paths: symbols.filter((symbol) => paths.includes(symbol)),
      dates: selectedPattern.evidence.map((item) => item.date.split('T')[0]),
    };
  }, [paths, tarotCards, sefirot, selectedPattern]);

  return (
    <section className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Visual Comparative Overlay
          </h1>
          <p className="text-sm text-gray-500">
            Visualizacion de patrones simbolicos sin interpretacion.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Tarot
            </div>
            <div className="mt-3">
              <TarotHighlightsLayer cards={tarotCards} highlighted={highlighted.cards} />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Arbol de la Vida
            </div>
            <div className="mt-3">
              <TreeHighlightsLayer
                sefirot={sefirot}
                paths={paths}
                highlightedSefirot={highlighted.sefirot}
                highlightedPaths={highlighted.paths}
              />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Astrologia
            </div>
            <div className="mt-3">
              <AstrologyHighlightsLayer
                dates={dates}
                highlightedDates={highlighted.dates}
                tokens={tokens}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Patrones disponibles
            </div>
            <div className="mt-3 space-y-2">
              {data.patterns.map((pattern) => (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => setSelectedPatternId(pattern.id)}
                  className={`w-full rounded-md border px-3 py-2 text-left text-xs ${
                    selectedPatternId === pattern.id
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{pattern.label}</div>
                  <div className="text-[11px] text-gray-500">
                    Sistemas: {pattern.systems.join(', ')} · Ventana: {pattern.window}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Legend />
            <ProvenancePanel pattern={selectedPattern} />
          </div>
        </div>
      </div>
    </section>
  );
}
