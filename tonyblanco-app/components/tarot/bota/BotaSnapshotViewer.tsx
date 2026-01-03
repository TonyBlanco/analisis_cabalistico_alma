"use client";

import { getBotaVisualStructure } from '../../../../src/symbolic/tarot/bota/botaVisualMapper';
import { resolveBotaIdentity } from '../../../../src/symbolic/tarot/bota/botaIdentityResolver';
import React from 'react';

type CardSnapshot = {
  id: string;
  position: { id: string; nameSpanish: string };
  symbolic_reading?: any;
};

type Snapshot = {
  summary?: string;
  caution?: string;
  cards?: CardSnapshot[];
};

export default function BotaSnapshotViewer({ snapshot }: { snapshot: Snapshot }) {
  const cards = Array.isArray(snapshot?.cards) ? snapshot.cards : [];

  return (
    <section className="p-4">
      <div className="rounded-md border border-slate-200 bg-yellow-50 p-3 mb-4">
        <div className="text-sm font-semibold">Lectura simbólica observacional. No diagnóstica. No clínica. Registro histórico no editable.</div>
      </div>

      <div className="mb-4 text-sm text-slate-700">{snapshot?.summary}</div>

      <div className="space-y-4">
        {cards.map((c) => {
          const identity = resolveBotaIdentity({ id: c.id, name: c.id, nameSpanish: c.id, symbols: c.symbols || {}, imageUrl: null });
          const visual = identity?.id ? getBotaVisualStructure(identity.id) : null;
          const power = identity?.consciousness?.power ?? null;
          const aspect = identity?.consciousness?.aspect ?? null;
          const humanFaculty = identity?.consciousness?.humanFaculty ?? null;
          const cabalisticIntelligence = identity?.cabalisticIntelligence ?? null;

          return (
            <div key={c.id} className="rounded-md border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-4">
                {visual?.imagePath ? (
                  <img src={visual.imagePath} alt={c.id} className="w-20 h-20 object-contain rounded-md" />
                ) : (
                  <div className="w-20 h-20 bg-gray-50 rounded-md flex items-center justify-center text-xs text-slate-400">{c.id}</div>
                )}

                <div className="flex-1">
                  <div className="text-sm font-semibold">{identity?.displayName || c.id}</div>
                  <div className="text-xs text-slate-600">Posición: {c.position?.nameSpanish || c.position?.id || '—'}</div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
                    <div>
                      <div className="text-xs text-slate-500">Poder</div>
                      <div className="font-medium">{power ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Aspecto</div>
                      <div className="font-medium">{aspect ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Facultad humana</div>
                      <div className="font-medium">{humanFaculty ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Inteligencia cabalística</div>
                      <div className="font-medium">{cabalisticIntelligence ?? '—'}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">
                    {c.symbolic_reading && c.symbolic_reading.symbolic_reading && c.symbolic_reading.symbolic_reading.system_frame
                      ? c.symbolic_reading.symbolic_reading.system_frame
                      : ''}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
