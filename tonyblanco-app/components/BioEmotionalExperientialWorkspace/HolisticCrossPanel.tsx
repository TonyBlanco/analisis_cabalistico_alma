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
    <div className="bio-card-glass rounded-2xl p-6 space-y-4 bio-animate-slide-in-up">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">🔮 Cruces holísticos internos</h4>
        <p className="text-xs text-gray-600">
          Correlaciones orientativas entre señales bio, trans y árbol. No deciden ni diagnostican.
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="bio-skeleton h-20 rounded-lg"></div>
          <div className="bio-skeleton h-20 rounded-lg"></div>
        </div>
      ) : correlations.length === 0 ? (
        <p className="text-xs text-gray-500 italic">No hay correlaciones suficientes para mostrar.</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto bio-scrollbar">
          {correlations.map((correlation, idx) => (
            <div key={idx} className="bio-glass rounded-lg p-4 text-xs text-gray-700 space-y-2 bio-animate-slide-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{correlation.title}</p>
                  <p className="text-[11px] text-gray-500">{correlation.rationale}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMarked(correlation.title)}
                  disabled={isReadOnly}
                  className={`text-[11px] font-medium transition-colors ${marked[correlation.title] ? 'text-purple-600' : 'text-gray-400 hover:text-purple-600'}`}
                >
                  {marked[correlation.title] ? '★ Marcado' : '☆ Marcar como relevante'}
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
                  className="bio-btn bio-btn-ghost text-xs px-2 py-1"
                >
                  🔍 Copiar a hipótesis
                </button>
                <button
                  type="button"
                  onClick={() => onCopyToSynthesis(buildCorrelationText(correlation))}
                  disabled={isReadOnly}
                  className="bio-btn bio-btn-ghost text-xs px-2 py-1"
                >
                  ✨ Copiar a síntesis
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
        className="bio-btn bio-btn-primary disabled:opacity-50"
      >
        🤖 Explicar correlaciones (IA)
      </button>

      {aiOutput && (
        <div className="bio-card-glass rounded-xl p-4 text-xs text-gray-700 bio-animate-scale-in">
          <p className="font-medium text-gray-800 flex items-center gap-2 mb-2">🤖 Explicación AI (solo lectura)</p>
          <p className="whitespace-pre-line">{aiOutput}</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bio-glass border border-red-200/50 p-3 text-xs text-red-700 bio-animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
}
