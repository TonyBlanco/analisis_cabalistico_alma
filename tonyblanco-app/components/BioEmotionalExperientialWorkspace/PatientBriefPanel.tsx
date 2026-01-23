'use client';

import { useEffect, useState } from 'react';
import { useExperientialContext } from './hooks/useExperientialContext';
import {
  createPatientBrief,
  listAssistedDiagnosis as listGuidedExploration,
  listHypotheses,
  listObservations,
  listPatientBriefs,
  publishPatientBrief,
  type BioEmotionalPatientBrief,
  type BioEmotionalSynthesis,
} from '@/lib/api/bioemotional-clinical';

interface PatientBriefPanelProps {
  synthesisRecord: BioEmotionalSynthesis | null;
  referenceSnippets: string[];
  isReadOnly: boolean;
}

export default function PatientBriefPanel({
  synthesisRecord,
  referenceSnippets,
  isReadOnly,
}: PatientBriefPanelProps) {
  const { context } = useExperientialContext();
  const patientId = context.patientId;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [records, setRecords] = useState<BioEmotionalPatientBrief[]>([]);
  const [selectedSources, setSelectedSources] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [observations, setObservations] = useState<{ id: string; note_text: string }[]>([]);
  const [hypotheses, setHypotheses] = useState<{ id: string; title: string }[]>([]);
  const [assisted, setAssisted] = useState<{ id: string; content: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!patientId) {
        setRecords([]);
        setObservations([]);
        setHypotheses([]);
        setAssisted([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [briefs, obs, hyps, assistedList] = await Promise.all([
          listPatientBriefs(patientId),
          listObservations(patientId),
          listHypotheses(patientId),
          listGuidedExploration(patientId),
        ]);
        setRecords(briefs);
        setObservations(obs.map((item) => ({ id: item.id, note_text: item.note_text })));
        setHypotheses(hyps.map((item) => ({ id: item.id, title: item.title })));
        setAssisted(assistedList.map((item) => ({ id: item.id, content: item.content })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar los resúmenes.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  const handleSave = async () => {
    if (!patientId) {
      setError('Selecciona un paciente antes de guardar el resumen.');
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError('Título y contenido son obligatorios.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const sources = Object.keys(selectedSources)
        .filter((key) => selectedSources[key])
        .map((key) => {
          const [type, id] = key.split(':');
          return { type, id };
        });
      const record = await createPatientBrief({
        patient_id: patientId,
        title: title.trim(),
        content: content.trim(),
        sources,
      });
      setRecords((prev) => [record, ...prev]);
      setTitle('');
      setContent('');
      setSelectedSources({});
      setSuccess('Resumen guardado (no publicado).');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el resumen.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (record: BioEmotionalPatientBrief) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await publishPatientBrief(record.id);
      setRecords((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSuccess('Resumen publicado.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar el resumen.');
    } finally {
      setSaving(false);
    }
  };

  const insertFromSynthesis = () => {
    if (synthesisRecord?.text) {
      setContent((prev) => (prev ? `${prev}\n\n${synthesisRecord.text}` : synthesisRecord.text));
    }
  };

  const insertFromAssisted = (text: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${text}` : text));
  };

  const toggleSource = (key: string) => {
    setSelectedSources((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Publicar resumen para paciente</h4>
        <p className="text-xs text-gray-600">
          Este contenido será visible para el paciente.
        </p>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del resumen"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={saving || isReadOnly}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Resumen simplificado (lenguaje neutral, no diagnóstico)..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={saving || isReadOnly}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={insertFromSynthesis}
            disabled={isReadOnly || !synthesisRecord?.text}
            className="px-2 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-60"
          >
            Usar síntesis actual
          </button>
          {assisted.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => insertFromAssisted(item.content)}
              disabled={isReadOnly}
              className="px-2 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Usar lectura asistida #{item.id.slice(0, 6)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700">Fuentes internas (no visibles al paciente)</p>
        <div className="space-y-1 max-h-32 overflow-y-auto text-xs text-gray-600">
          {observations.map((item) => (
            <label key={item.id} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={Boolean(selectedSources[`observation:${item.id}`])}
                onChange={() => toggleSource(`observation:${item.id}`)}
                disabled={isReadOnly}
                className="mt-0.5 h-4 w-4"
              />
              <span>Observación #{item.id.slice(0, 6)}: {item.note_text.slice(0, 60)}...</span>
            </label>
          ))}
          {hypotheses.map((item) => (
            <label key={item.id} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={Boolean(selectedSources[`hypothesis:${item.id}`])}
                onChange={() => toggleSource(`hypothesis:${item.id}`)}
                disabled={isReadOnly}
                className="mt-0.5 h-4 w-4"
              />
              <span>Hipótesis: {item.title}</span>
            </label>
          ))}
          {synthesisRecord && (
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={Boolean(selectedSources[`synthesis:${synthesisRecord.id}`])}
                onChange={() => toggleSource(`synthesis:${synthesisRecord.id}`)}
                disabled={isReadOnly}
                className="mt-0.5 h-4 w-4"
              />
              <span>Síntesis actual</span>
            </label>
          )}
          {referenceSnippets.map((snippet, idx) => (
            <label key={idx} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={Boolean(selectedSources[`dictionary:${idx}`])}
                onChange={() => toggleSource(`dictionary:${idx}`)}
                disabled={isReadOnly}
                className="mt-0.5 h-4 w-4"
              />
              <span>Cita diccionario: {snippet.slice(0, 60)}...</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || isReadOnly}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300"
      >
        Guardar resumen (borrador)
      </button>

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

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700">Resúmenes creados</p>
        {loading ? (
          <p className="text-xs text-gray-500">Cargando resúmenes...</p>
        ) : records.length === 0 ? (
          <p className="text-xs text-gray-500">Sin resúmenes guardados.</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {records.map((record) => (
              <div key={record.id} className="rounded-md border border-gray-200 p-2 text-xs text-gray-700">
                <p className="font-medium">{record.title}</p>
                <p className="text-[11px] text-gray-500">
                  Publicado: {record.is_published ? 'Sí' : 'No'}
                </p>
                <p className="mt-1 line-clamp-2">{record.content}</p>
                {!record.is_published && (
                  <button
                    type="button"
                    onClick={() => handlePublish(record)}
                    disabled={isReadOnly || saving}
                    className="mt-2 px-2 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Publicar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
