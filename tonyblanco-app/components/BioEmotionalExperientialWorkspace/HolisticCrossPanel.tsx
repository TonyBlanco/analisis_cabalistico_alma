'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AnatomicalRegion } from './data/anatomicalRegions';
import { useExperientialContext } from './hooks/useExperientialContext';
import { listHypotheses, listObservations } from '@/lib/api/bioemotional-clinical';
import { generateWithGemini } from '@/lib/gemini-config';

type Signal = {
  domain: 'bio' | 'trans' | 'tree';
  key: string;
  label: string;
  evidence: string;
  strength?: number;
  sourceRef: { type: string; id: string };
};

type Correlation = {
  title: string;
  rationale: string;
  signals: Signal[];
  confidence: 'low' | 'medium' | 'high';
  therapistAction: 'review' | 'note' | 'hypothesis';
};

interface HolisticCrossPanelProps {
  selectedRegion: AnatomicalRegion | null;
  referenceSnippets: string[];
  onCopyToHypothesis: (text: string) => void;
  onCopyToSynthesis: (text: string) => void;
  isReadOnly: boolean;
}

const TREE_REFERENCES: Record<string, { label: string; evidence: string }> = {
  head: { label: 'Keter', evidence: 'Correspondencia referencial: Keter (corona)' },
  throat: { label: "Da'at", evidence: "Correspondencia referencial: Da'at (expresión)" },
  chest: { label: 'Tiferet', evidence: 'Correspondencia referencial: Tiferet (corazón)' },
  'solar-plexus': { label: 'Gevurah', evidence: 'Correspondencia referencial: Gevurah (fuerza)' },
  abdomen: { label: 'Yesod', evidence: 'Correspondencia referencial: Yesod (base)' },
  pelvis: { label: 'Malkuth', evidence: 'Correspondencia referencial: Malkuth (raíz)' },
};

const EXPLAINER_PROMPT =
  'Explica en tono consultivo por qué estas señales podrían estar relacionadas. No diagnostiques. No inventes. Propón preguntas para explorar.';

const normalizeTags = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 3);

export default function HolisticCrossPanel({
  selectedRegion,
  referenceSnippets,
  onCopyToHypothesis,
  onCopyToSynthesis,
  isReadOnly,
}: HolisticCrossPanelProps) {
  const { context } = useExperientialContext();
  const patientId = context.patientId;
  const [observations, setObservations] = useState<Array<{ id: string; note_text: string }>>([]);
  const [hypotheses, setHypotheses] = useState<
    Array<{ id: string; title: string; description: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!patientId) {
        setObservations([]);
        setHypotheses([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [obs, hyps] = await Promise.all([
          listObservations(patientId),
          listHypotheses(patientId),
        ]);
        setObservations(obs.map((item) => ({ id: item.id, note_text: item.note_text })));
        setHypotheses(
          hyps.map((item) => ({ id: item.id, title: item.title, description: item.description }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar señales.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  const signals = useMemo(() => {
    const items: Signal[] = [];
    if (selectedRegion) {
      items.push({
        domain: 'bio',
        key: selectedRegion.id,
        label: selectedRegion.label,
        evidence: 'Región seleccionada en la sesión.',
        sourceRef: { type: 'region', id: selectedRegion.id },
      });
    }
    observations.forEach((obs) => {
      items.push({
        domain: 'bio',
        key: `obs-${obs.id}`,
        label: 'Observación clínica',
        evidence: obs.note_text,
        sourceRef: { type: 'observation', id: obs.id },
      });
    });
    hypotheses.forEach((hyp) => {
      const text = `${hyp.title} ${hyp.description}`.toLowerCase();
      const keywords = ['aniversario', 'doble', 'repeticion', 'patron', 'linaje'];
      keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          items.push({
            domain: 'trans',
            key: `${keyword}-${hyp.id}`,
            label: `Patrón ${keyword}`,
            evidence: hyp.description,
            sourceRef: { type: 'hypothesis', id: hyp.id },
          });
        }
      });
    });
    referenceSnippets.forEach((snippet, idx) => {
      items.push({
        domain: 'bio',
        key: `quote-${idx + 1}`,
        label: 'Cita de diccionario',
        evidence: snippet,
        sourceRef: { type: 'dictionary_quote', id: String(idx + 1) },
      });
    });
    if (selectedRegion && TREE_REFERENCES[selectedRegion.id]) {
      const tree = TREE_REFERENCES[selectedRegion.id];
      items.push({
        domain: 'tree',
        key: `${selectedRegion.id}-tree`,
        label: tree.label,
        evidence: tree.evidence,
        sourceRef: { type: 'tree', id: selectedRegion.id },
      });
    }
    return items;
  }, [selectedRegion, observations, hypotheses, referenceSnippets]);

  const correlations = useMemo(() => {
    const tagMap = new Map<string, Signal[]>();
    signals.forEach((signal) => {
      const tags = new Set<string>();
      normalizeTags(signal.label).forEach((tag) => tags.add(tag));
      normalizeTags(signal.evidence).forEach((tag) => tags.add(tag));
      tags.forEach((tag) => {
        const list = tagMap.get(tag) || [];
        list.push(signal);
        tagMap.set(tag, list);
      });
    });

    const results: Correlation[] = [];
    tagMap.forEach((items, tag) => {
      if (items.length < 2) {
        return;
      }
      const domains = Array.from(new Set(items.map((item) => item.domain)));
      const confidence = items.length >= 4 ? 'high' : items.length >= 3 ? 'medium' : 'low';
      results.push({
        title: `Convergencia: ${tag}`,
        rationale: `Se observan señales relacionadas con "${tag}" en dominios: ${domains.join(', ')}.`,
        signals: items,
        confidence,
        therapistAction: 'review',
      });
    });
    return results;
  }, [signals]);

  const toggleMarked = (key: string) => {
    setMarked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const buildCorrelationText = (correlation: Correlation) => {
    const lines = [
      `Hipótesis exploratoria: ${correlation.title}`,
      `Rationale: ${correlation.rationale}`,
      ...correlation.signals.map(
        (signal) => `- [${signal.domain}] ${signal.label}: ${signal.evidence}`
      ),
    ];
    return lines.join('\n');
  };

  const handleExplain = async () => {
    if (!correlations.length) {
      setError('No hay correlaciones para explicar.');
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const payload = correlations
        .map((corr) => `${corr.title}\n${corr.rationale}\n${corr.signals.map((s) => `- ${s.label}: ${s.evidence}`).join('\n')}`)
        .join('\n\n');
      const output = await generateWithGemini(`${EXPLAINER_PROMPT}\n\n${payload}`);
      setAiOutput(output || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar la explicación.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Cruces holísticos internos</h4>
        <p className="text-xs text-gray-600">
          Correlaciones orientativas entre señales bio, trans y árbol. No deciden ni diagnostican.
        </p>
      </div>

      {loading ? (
        <p className="text-xs text-gray-500">Cargando señales...</p>
      ) : correlations.length === 0 ? (
        <p className="text-xs text-gray-500">No hay correlaciones suficientes para mostrar.</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {correlations.map((correlation, idx) => (
            <div key={idx} className="rounded-md border border-gray-200 p-3 text-xs text-gray-700 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{correlation.title}</p>
                  <p className="text-[11px] text-gray-500">{correlation.rationale}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMarked(correlation.title)}
                  disabled={isReadOnly}
                  className="text-[11px] text-blue-600 hover:text-blue-700"
                >
                  {marked[correlation.title] ? 'Marcado' : 'Marcar como relevante'}
                </button>
              </div>
              <div className="space-y-1">
                {correlation.signals.map((signal) => (
                  <p key={`${signal.domain}-${signal.key}`} className="text-[11px] text-gray-600">
                    [{signal.domain}] {signal.label}: {signal.evidence}
                  </p>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onCopyToHypothesis(buildCorrelationText(correlation))}
                  disabled={isReadOnly}
                  className="px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50"
                >
                  Copiar a hipótesis
                </button>
                <button
                  type="button"
                  onClick={() => onCopyToSynthesis(buildCorrelationText(correlation))}
                  disabled={isReadOnly}
                  className="px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50"
                >
                  Copiar a síntesis
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleExplain}
        disabled={aiLoading || isReadOnly}
        className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Explicar correlaciones (IA)
      </button>

      {aiOutput && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
          <p className="font-medium text-gray-800">Explicación AI (solo lectura)</p>
          <p className="whitespace-pre-line">{aiOutput}</p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
