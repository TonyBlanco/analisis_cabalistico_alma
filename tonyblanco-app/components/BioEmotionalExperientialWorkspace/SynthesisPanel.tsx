'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AnatomicalRegion } from './data/anatomicalRegions';
import { useExperientialContext } from './hooks/useExperientialContext';
import {
  createSynthesis,
  listObservations,
  listHypotheses,
  type BioEmotionalSynthesis,
} from '@/lib/api/bioemotional-clinical';
import { generateWithGemini } from '@/lib/gemini-config';

interface SynthesisPanelProps {
  selectedRegion: AnatomicalRegion | null;
  insertText?: string | null;
  onInsertApplied?: () => void;
  synthesisRecord: BioEmotionalSynthesis | null;
  onSaved: (record: BioEmotionalSynthesis) => void;
  isReadOnly: boolean;
  referenceSnippets: string[];
}

const PROMPT_DRAFT =
  'Redacta una sintesis clinica de trabajo en tono neutral y consultivo, sin diagnosticos, ' +
  'usando solo las observaciones e hipotesis provistas. No inventes datos ni conclusiones. ' +
  'Salida: un unico parrafo en espanol.';

const PROMPT_REPHRASE =
  'Reformula el texto para que sea mas claro y neutral, manteniendo el sentido original. ' +
  'No agregues informacion nueva ni diagnosticos. Salida: texto continuo en espanol.';

const PROMPT_SUMMARIZE =
  'Resume las observaciones clinicas en tono neutral y consultivo. ' +
  'No agregues informacion nueva ni diagnosticos. Salida: 3-5 frases en espanol.';

export default function SynthesisPanel({
  selectedRegion,
  insertText,
  onInsertApplied,
  synthesisRecord,
  onSaved,
  isReadOnly,
  referenceSnippets,
}: SynthesisPanelProps) {
  const { context } = useExperientialContext();
  const patientId = context.patientId;
  const [text, setText] = useState(synthesisRecord?.text || '');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setText(synthesisRecord?.text || '');
  }, [synthesisRecord?.id]);

  useEffect(() => {
    if (!insertText) {
      return;
    }
    setText((prev) => (prev ? `${prev}\n\n${insertText}` : insertText));
    if (onInsertApplied) {
      onInsertApplied();
    }
  }, [insertText, onInsertApplied]);

  const handleSave = async () => {
    if (!patientId) {
      setError('Selecciona un paciente antes de guardar la sintesis.');
      return;
    }
    if (!text.trim()) {
      setError('La sintesis no puede estar vacia.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const record = await createSynthesis({ patient_id: patientId, text: text.trim() });
      onSaved(record);
      setSuccess('Sintesis guardada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la sintesis.');
    } finally {
      setSaving(false);
    }
  };

  const aiContext = useMemo(() => {
    const regionLine = selectedRegion ? `Region seleccionada: ${selectedRegion.label}` : null;
    const refs = referenceSnippets.length ? `Referencias de diccionario:\n${referenceSnippets.join('\n\n')}` : null;
    return [regionLine, refs].filter(Boolean).join('\n');
  }, [selectedRegion, referenceSnippets]);

  const buildNotesPayload = async () => {
    if (!patientId) {
      return { observations: [], hypotheses: [] };
    }
    const [observations, hypotheses] = await Promise.all([
      listObservations(patientId),
      listHypotheses(patientId),
    ]);
    return { observations, hypotheses };
  };

  const runAi = async (mode: 'draft' | 'rephrase' | 'summarize') => {
    if (!patientId) {
      setError('Selecciona un paciente antes de usar la ayuda AI.');
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const { observations, hypotheses } = await buildNotesPayload();
      const observationText = observations.map((item) => `- ${item.note_text}`).join('\n');
      const hypothesisText = hypotheses
        .map((item) => `- ${item.title}: ${item.description}`)
        .join('\n');

      let prompt = '';
      if (mode === 'draft') {
        prompt = `${PROMPT_DRAFT}\n\nObservaciones:\n${observationText || 'Sin observaciones.'}\n\nHipotesis:\n${hypothesisText || 'Sin hipotesis.'}\n\n${aiContext}`;
      } else if (mode === 'rephrase') {
        prompt = `${PROMPT_REPHRASE}\n\nTexto original:\n${text || 'Sin texto.'}`;
      } else {
        prompt = `${PROMPT_SUMMARIZE}\n\nObservaciones:\n${observationText || 'Sin observaciones.'}\n\n${aiContext}`;
      }

      const result = await generateWithGemini(prompt);
      setAiSuggestion(result || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar la sugerencia.');
    } finally {
      setAiLoading(false);
    }
  };

  const applySuggestion = () => {
    if (!aiSuggestion) {
      return;
    }
    setText((prev) => (prev ? `${prev}\n\n${aiSuggestion}` : aiSuggestion));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Sintesis clinica</h4>
        <p className="text-xs text-gray-600">Sintesis clinica de trabajo. No es diagnostico.</p>
      </div>

      {selectedRegion && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-2 text-xs text-blue-700">
          <p className="font-medium">Region seleccionada: {selectedRegion.label}</p>
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Sintesis clinica (redactada por el terapeuta)..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        disabled={saving || isReadOnly}
      />

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || isReadOnly || !text.trim()}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? 'Guardando...' : 'Guardar sintesis'}
      </button>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <p className="text-xs font-medium text-gray-700">Ayuda AI (opcional, bajo demanda)</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runAi('draft')}
            disabled={aiLoading || isReadOnly}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Redactar sintesis a partir de mis notas
          </button>
          <button
            type="button"
            onClick={() => runAi('rephrase')}
            disabled={aiLoading || isReadOnly || !text.trim()}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Reformular texto
          </button>
          <button
            type="button"
            onClick={() => runAi('summarize')}
            disabled={aiLoading || isReadOnly}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Resumir observaciones
          </button>
        </div>

        {aiSuggestion && (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 space-y-2">
            <p className="font-medium text-gray-800">Sugerencia AI (no insertada)</p>
            <p className="whitespace-pre-line">{aiSuggestion}</p>
            <button
              type="button"
              onClick={applySuggestion}
              disabled={isReadOnly}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            >
              Insertar en sintesis
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
          {success}
        </div>
      )}
    </div>
  );
}
