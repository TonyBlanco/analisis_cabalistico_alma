'use client';

import { useEffect, useMemo, useState } from 'react';
import { useExperientialContext } from './hooks/useExperientialContext';
import {
  createAssistedDiagnosis as createGuidedExploration,
  listAssistedDiagnosis as listGuidedExploration,
  listHypotheses,
  listObservations,
  validateAssistedDiagnosis as validateGuidedExploration,
  type AssistedDiagnosisBasedOn as GuidedExplorationBasedOn,
  type AssistedDiagnosisRecord as GuidedExplorationRecord,
  type BioEmotionalSynthesis,
} from '@/lib/api/bioemotional-clinical';
import { generateWithGemini } from '@/lib/gemini-config';

interface GuidedExplorationPanelProps {
  synthesisRecord: BioEmotionalSynthesis | null;
  referenceSnippets: string[];
  onInsertToSynthesis: (text: string) => void;
  isReadOnly: boolean;
}

const PROMPT_EXPLORATION =
  'Elabora una lectura exploratoria orientativa e integrativa basada EXCLUSIVAMENTE en el texto provisto. No inventes datos. No generes diagnósticos. Usa tono neutral y consultivo. Indica explícitamente que requiere validación humana. Salida: 1–2 párrafos en español.';

const PROMPT_REFORMULATE =
  'Reformula el texto para mayor claridad y neutralidad. No agregues información nueva. No diagnostiques. Salida: texto continuo en español.';

const PROMPT_SUMMARY =
  'Resume el texto en tono neutral y consultivo. No agregues información nueva. Salida: 3–5 frases en español.';

export default function GuidedExplorationPanel({
  synthesisRecord,
  referenceSnippets,
  onInsertToSynthesis,
  isReadOnly,
}: GuidedExplorationPanelProps) {
  const { context } = useExperientialContext();
  const patientId = context.patientId;
  const [observations, setObservations] = useState<{ id: string; note_text: string }[]>([]);
  const [hypotheses, setHypotheses] = useState<{ id: string; title: string; description: string }[]>([]);
  const [savedRecords, setSavedRecords] = useState<GuidedExplorationRecord[]>([]);
  const [selectedSources, setSelectedSources] = useState<Record<string, boolean>>({});
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [promptVersion, setPromptVersion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!patientId) {
        setObservations([]);
        setHypotheses([]);
        setSavedRecords([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [obs, hyps, records] = await Promise.all([
          listObservations(patientId),
          listHypotheses(patientId),
          listGuidedExploration(patientId),
        ]);
        setObservations(obs.map((item) => ({ id: item.id, note_text: item.note_text })));
        setHypotheses(
          hyps.map((item) => ({ id: item.id, title: item.title, description: item.description }))
        );
        setSavedRecords(records);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la informacion.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  const dictionaryItems = useMemo(
    () =>
      referenceSnippets.map((text, index) => ({
        id: `quote-${index + 1}`,
        text,
      })),
    [referenceSnippets]
  );

  const buildBasedOn = (): GuidedExplorationBasedOn[] => {
    const basedOn: GuidedExplorationBasedOn[] = [];
    observations.forEach((item) => {
      if (selectedSources[`observation-${item.id}`]) {
        basedOn.push({ type: 'observation', id: item.id });
      }
    });
    hypotheses.forEach((item) => {
      if (selectedSources[`hypothesis-${item.id}`]) {
        basedOn.push({ type: 'hypothesis', id: item.id });
      }
    });
    if (synthesisRecord?.id && selectedSources[`synthesis-${synthesisRecord.id}`]) {
      basedOn.push({ type: 'synthesis', id: synthesisRecord.id });
    }
    dictionaryItems.forEach((item) => {
      if (selectedSources[`dictionary-${item.id}`]) {
        basedOn.push({ type: 'dictionary_quote', id: item.id });
      }
    });
    return basedOn;
  };

  const buildSourceText = () => {
    const sections: string[] = [];
    observations.forEach((item) => {
      if (selectedSources[`observation-${item.id}`]) {
        sections.push(`Observacion: ${item.note_text}`);
      }
    });
    hypotheses.forEach((item) => {
      if (selectedSources[`hypothesis-${item.id}`]) {
        sections.push(`Hipotesis: ${item.title} - ${item.description}`);
      }
    });
    if (synthesisRecord?.text && selectedSources[`synthesis-${synthesisRecord.id}`]) {
      sections.push(`Sintesis: ${synthesisRecord.text}`);
    }
    dictionaryItems.forEach((item) => {
      if (selectedSources[`dictionary-${item.id}`]) {
        sections.push(`Cita diccionario: ${item.text}`);
      }
    });
    return sections.join('\n');
  };

  const ensureSources = () => {
    const basedOn = buildBasedOn();
    if (basedOn.length === 0) {
      setError('Selecciona al menos una fuente.');
      return null;
    }
    return basedOn;
  };

  const runAi = async (mode: 'exploration' | 'reformulate' | 'summary') => {
    if (!patientId) {
      setError('Selecciona un paciente antes de usar la exploración guiada.');
      return;
    }
    const basedOn = ensureSources();
    if (!basedOn) {
      return;
    }
    const sourceText = mode === 'reformulate' && aiOutput ? aiOutput : buildSourceText();
    if (!sourceText.trim()) {
      setError('Las fuentes seleccionadas no tienen contenido.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let prompt = '';
      let version = '';
      if (mode === 'exploration') {
        prompt = `${PROMPT_EXPLORATION}\n\nTexto:\n${sourceText}`;
        version = 'F4-GE-v1-A';
      } else if (mode === 'reformulate') {
        prompt = `${PROMPT_REFORMULATE}\n\nTexto:\n${sourceText}`;
        version = 'F4-GE-v1-B';
      } else {
        prompt = `${PROMPT_SUMMARY}\n\nTexto:\n${sourceText}`;
        version = 'F4-GE-v1-C';
      }
      const output = await generateWithGemini(prompt);
      setAiOutput(output || null);
      setPromptVersion(version);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar la lectura.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!patientId) {
      setError('Selecciona un paciente antes de guardar.');
      return;
    }
    const basedOn = ensureSources();
    if (!basedOn) {
      return;
    }
    if (!aiOutput || !promptVersion) {
      setError('Genera una exploración guiada antes de guardar.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const record = await createGuidedExploration({
        patient_id: patientId,
        content: aiOutput,
        based_on: basedOn,
        prompt_version: promptVersion,
      });
      setSavedRecords((prev) => [record, ...prev]);
      setSuccess('Exploración guiada guardada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la exploración guiada.');
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async (record: GuidedExplorationRecord) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await validateGuidedExploration(record.id);
      setSavedRecords((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSuccess('Exploración validada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo validar la exploración.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!aiOutput) {
      return;
    }
    try {
      await navigator.clipboard.writeText(aiOutput);
      setSuccess('Copiado al portapapeles.');
    } catch (err) {
      setError('No se pudo copiar al portapapeles.');
    }
  };

  const toggleSource = (key: string) => {
    setSelectedSources((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Exploración Guiada (IA)</h4>
        <p className="text-xs text-gray-600">Exploración orientativa asistida por IA.</p>
        <p className="text-xs text-gray-600">No es diagnóstico clínico ni definitivo.</p>
        <p className="text-xs text-gray-500">Requiere validación humana.</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700">Fuentes seleccionadas</p>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {observations.map((item) => (
            <label key={item.id} className="flex items-start gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(selectedSources[`observation-${item.id}`])}
                onChange={() => toggleSource(`observation-${item.id}`)}
                disabled={isReadOnly}
                className="mt-0.5 h-4 w-4"
              />
            <span>Observación #{item.id.slice(0, 6)}: {item.note_text.slice(0, 80)}...</span>
            </label>
          ))}
          {hypotheses.map((item) => (
            <label key={item.id} className="flex items-start gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(selectedSources[`hypothesis-${item.id}`])}
                onChange={() => toggleSource(`hypothesis-${item.id}`)}
                disabled={isReadOnly}
                className="mt-0.5 h-4 w-4"
              />
              <span>Hipotesis: {item.title}</span>
            </label>
          ))}
          {synthesisRecord && (
            <label className="flex items-start gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(selectedSources[`synthesis-${synthesisRecord.id}`])}
                onChange={() => toggleSource(`synthesis-${synthesisRecord.id}`)}
                disabled={isReadOnly}
                className="mt-0.5 h-4 w-4"
              />
              <span>Sintesis guardada</span>
            </label>
          )}
          {dictionaryItems.map((item) => (
            <label key={item.id} className="flex items-start gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(selectedSources[`dictionary-${item.id}`])}
                onChange={() => toggleSource(`dictionary-${item.id}`)}
                disabled={isReadOnly}
                className="mt-0.5 h-4 w-4"
              />
              <span>Cita diccionario: {item.text.slice(0, 80)}...</span>
            </label>
          ))}
          {observations.length === 0 && hypotheses.length === 0 && !synthesisRecord && dictionaryItems.length === 0 && (
            <p className="text-xs text-gray-500">No hay fuentes disponibles.</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runAi('exploration')}
            disabled={loading || isReadOnly}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Generar exploración orientativa (IA)
          </button>
        <button
          type="button"
          onClick={() => runAi('reformulate')}
          disabled={loading || isReadOnly || !aiOutput}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Reformular exploración
        </button>
          <button
            type="button"
            onClick={() => runAi('summary')}
            disabled={loading || isReadOnly}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Resumir exploración
          </button>
      </div>

      {aiOutput && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 space-y-2">
          <p className="font-medium text-gray-800">Vista previa (no insertada)</p>
          <p className="whitespace-pre-line">{aiOutput}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-2 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Copiar al portapapeles
            </button>
            <button
              type="button"
              onClick={() => onInsertToSynthesis(aiOutput)}
              disabled={isReadOnly}
              className="px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50"
            >
              Insertar en sintesis
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isReadOnly || saving}
              className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            >
              Guardar como exploración guiada
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700">Exploraciones guardadas</p>
        {loading ? (
          <p className="text-xs text-gray-500">Cargando exploraciones...</p>
        ) : savedRecords.length === 0 ? (
          <p className="text-xs text-gray-500">Sin exploraciones guardadas.</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {savedRecords.map((record) => (
              <div key={record.id} className="rounded-md border border-gray-200 p-2 text-xs text-gray-700">
                <p className="text-[11px] text-gray-500">
                  {new Date(record.created_at).toLocaleString()} · {record.prompt_version}
                </p>
                <p className="mt-1 line-clamp-3">{record.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">
                    Validada: {record.is_validated ? 'Si' : 'No'}
                  </span>
                  {!record.is_validated && (
                    <button
                      type="button"
                      onClick={() => handleValidate(record)}
                      disabled={isReadOnly || saving}
                      className="px-2 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Validar (firmar por terapeuta)
                    </button>
                  )}
                </div>
              </div>
            ))}
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
