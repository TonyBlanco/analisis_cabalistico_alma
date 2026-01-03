"use client";

import React from "react";
import { getBotaVisualStructure } from "../../../../src/symbolic/tarot/bota/botaVisualMapper";
import { resolveBotaIdentity } from "../../../../src/symbolic/tarot/bota/botaIdentityResolver";

type CardSnapshot = {
  id: string;
  position?: { id?: string; nameSpanish?: string };
  symbolic_reading?: any;
  symbols?: any;
  name?: string;
  nameSpanish?: string;
};

type Snapshot = {
  content?: {
    cards?: CardSnapshot[];
    summary?: string;
    caution?: string;
    symbolic_reading?: any;
    system?: { id?: string; label?: string };
  };
  cards?: CardSnapshot[];
  summary?: string;
  caution?: string;
};

function extractText(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const parts = value.map(extractText).filter(Boolean);
    return parts.join("\n");
  }
  if (typeof value === "object") {
    const candidates = [
      value.text,
      value.value,
      value.content,
      value.description,
      value.summary,
      value.synthesis,
    ];
    for (const c of candidates) {
      const t = extractText(c);
      if (t) return t;
    }
  }
  return "";
}

function normalizeReading(sr: any): any {
  if (!sr || typeof sr !== "object") return null;
  if (sr.symbolic_reading && typeof sr.symbolic_reading === "object") return sr.symbolic_reading;
  return sr;
}

export default function BotaSnapshotViewer({ snapshot }: { snapshot: Snapshot }) {
  const content: any = snapshot?.content || snapshot;
  const cards: CardSnapshot[] = Array.isArray(content?.cards) ? content.cards : [];
  const summary = content?.summary || "";
  const caution = content?.caution || "";

  const systemLabel =
    (cards[0] as any)?.symbolic_reading?.system?.label ||
    content?.symbolic_reading?.system?.label ||
    content?.system?.label ||
    "B.O.T.A. Tarot";

  return (
    <section className="p-4">
      <div className="mb-4 rounded-md border border-slate-200 bg-yellow-50 p-3">
        <div className="text-sm font-semibold">
          Lectura simbólica observacional. No diagnóstica. No clínica.
        </div>
        <div className="text-xs text-slate-700">Tipo de sistema: {systemLabel}</div>
      </div>

      {summary ? (
        <div className="mb-4 whitespace-pre-wrap text-sm text-slate-700">{summary}</div>
      ) : null}

      <div className="space-y-4">
        {cards.map((card, idx) => {
          const identity = resolveBotaIdentity({
            id: card.id,
            name: card.name || card.id,
            nameSpanish: card.nameSpanish || card.id,
            symbols: card.symbols && typeof card.symbols === "object" ? card.symbols : {},
            imageUrl: null,
          });
          const visual = identity?.id ? getBotaVisualStructure(identity.id) : null;

          const sr: any = (card as any).symbolic_reading;
          const normalized = normalizeReading(sr);

          const system = sr?.system?.label || systemLabel;
          const positionLabel = card.position?.nameSpanish || card.position?.id || "";

          const consciousnessText =
            extractText(sr?.consciousness) || extractText(normalized?.consciousness);
          const correspondencesText =
            extractText(sr?.correspondences) || extractText(normalized?.correspondences);
          const synthesisText = extractText(sr?.synthesis) || extractText(normalized?.synthesis);

          const coreMeaning = extractText(normalized?.core_meaning);
          const positionMeaning = extractText(normalized?.position_meaning);
          const contextualMeaning = extractText(normalized?.contextual_meaning);
          const systemFrame = extractText(normalized?.system_frame);

          const kabbalistic =
            card.symbols?.kabbalistic && typeof card.symbols.kabbalistic === "object"
              ? card.symbols.kabbalistic
              : null;
          const rawPairs: Array<[string, string]> = [
            ["Letra hebrea", extractText(kabbalistic?.hebrewLetter)],
            ["Sendero", extractText(kabbalistic?.path)],
            [
              "Sefirot",
              Array.isArray(kabbalistic?.sefirot)
                ? kabbalistic.sefirot.join(" · ")
                : extractText(kabbalistic?.sefirot),
            ],
            ["Elemento", extractText(kabbalistic?.element)],
            ["Planeta", extractText(kabbalistic?.planet)],
            ["Signo", extractText(kabbalistic?.sign)],
            ["Decanato", extractText(kabbalistic?.decan)],
          ];
          const kabbalisticPairs = rawPairs.filter((pair) => Boolean(pair[1]));

          return (
            <div key={`${card.id}-${idx}`} className="rounded-md border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-4">
                {visual?.imagePath ? (
                  <img
                    src={visual.imagePath}
                    alt={identity?.nameSpanish || card.id}
                    className="h-20 w-20 rounded-md bg-gray-50 object-contain"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-md bg-gray-50 text-xs text-slate-400">
                    {card.id}
                  </div>
                )}

                <div className="flex-1">
                  <div className="text-sm font-semibold">
                    {identity?.nameSpanish || card.nameSpanish || card.name || card.id}
                  </div>
                  {positionLabel ? (
                    <div className="text-xs text-slate-600">Posición: {positionLabel}</div>
                  ) : null}
                  {system ? <div className="mt-1 text-[11px] text-slate-500">Sistema: {system}</div> : null}

                  {kabbalisticPairs.length ? (
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
                      {kabbalisticPairs.map(([label, value]) => (
                        <div key={label}>
                          <div className="text-xs text-slate-500">{label}</div>
                          <div className="font-medium">{value}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {consciousnessText ? (
                    <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                      <div className="text-xs font-semibold text-slate-600">Conciencia</div>
                      <div className="mt-1">{consciousnessText}</div>
                    </div>
                  ) : null}

                  {correspondencesText ? (
                    <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                      <div className="text-xs font-semibold text-slate-600">Correspondencias</div>
                      <div className="mt-1">{correspondencesText}</div>
                    </div>
                  ) : null}

                  {coreMeaning ? (
                    <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                      <div className="text-xs font-semibold text-slate-600">Lectura simbólica</div>
                      <div className="mt-1">{coreMeaning}</div>
                    </div>
                  ) : null}

                  {positionMeaning ? (
                    <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                      <div className="text-xs font-semibold text-slate-600">Sentido por posición</div>
                      <div className="mt-1">{positionMeaning}</div>
                    </div>
                  ) : null}

                  {contextualMeaning ? (
                    <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                      <div className="text-xs font-semibold text-slate-600">Contexto</div>
                      <div className="mt-1">{contextualMeaning}</div>
                    </div>
                  ) : null}

                  {synthesisText ? (
                    <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                      <div className="text-xs font-semibold text-slate-600">Síntesis</div>
                      <div className="mt-1">{synthesisText}</div>
                    </div>
                  ) : null}

                  {systemFrame ? (
                    <div className="mt-3 whitespace-pre-wrap text-xs text-slate-500">{systemFrame}</div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {caution ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {caution}
        </div>
      ) : null}
    </section>
  );
}
