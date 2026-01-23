'use client';

import { useEffect, useState } from 'react';
import type { AnatomicalRegion } from './data/anatomicalRegions';
import { useExperientialContext } from './hooks/useExperientialContext';
import {
  createObservation,
  listObservations,
  type BioEmotionalObservation,
} from '@/lib/api/bioemotional-clinical';

interface ObservationPanelProps {
  selectedRegion: AnatomicalRegion | null;
  insertText?: string | null;
  onInsertApplied?: () => void;
  isReadOnly?: boolean;
}

export default function ObservationPanel({
  selectedRegion,
  insertText,
  onInsertApplied,
  isReadOnly = false,
}: ObservationPanelProps) {
  const { context } = useExperientialContext();
  const patientId = context.patientId;
  const [noteText, setNoteText] = useState('');
  const [dictionaryTerm, setDictionaryTerm] = useState('');
  const [linkRegion, setLinkRegion] = useState(false);
  const [observations, setObservations] = useState<BioEmotionalObservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!patientId) {
        setObservations([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await listObservations(patientId);
        setObservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las observaciones.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  useEffect(() => {
    if (!insertText) {
      return;
    }
    setNoteText((prev) => (prev ? `${prev}\n\n${insertText}` : insertText));
    if (onInsertApplied) {
      onInsertApplied();
    }
  }, [insertText, onInsertApplied]);

  const handleSave = async () => {
    if (!patientId) {
      setError('Selecciona un paciente antes de guardar una observacion.');
      return;
    }
    if (!noteText.trim()) {
      setError('La observacion no puede estar vacia.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        patient_id: patientId,
        note_text: noteText.trim(),
        region_id: linkRegion && selectedRegion ? selectedRegion.id : null,
        dictionary_term_slug: dictionaryTerm.trim() ? dictionaryTerm.trim() : null,
      };
      const created = await createObservation(payload);
      setObservations((prev) => [created, ...prev]);
      setNoteText('');
      setDictionaryTerm('');
      setLinkRegion(false);
      setSuccess('Observacion guardada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la observacion.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bio-card-glass rounded-2xl p-6 space-y-4 bio-animate-slide-in-up">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Observaciones clínicas</h4>
        <p className="text-xs text-gray-600">Observación clínica. No es diagnóstico.</p>
      </div>

      {selectedRegion && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-2 text-xs text-blue-700">
          <p className="font-medium">Region seleccionada: {selectedRegion.label}</p>
        </div>
      )}

      <div className="space-y-2">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={4}
          placeholder="Escribe una observacion clinica (sin conclusiones)..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={saving || isReadOnly}
        />

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <input
            id="link-region"
            type="checkbox"
            checked={linkRegion}
            onChange={(e) => setLinkRegion(e.target.checked)}
            disabled={!selectedRegion || saving || isReadOnly}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="link-region">
            Vincular region seleccionada
          </label>
        </div>

        <input
          type="text"
          value={dictionaryTerm}
          onChange={(e) => setDictionaryTerm(e.target.value)}
          placeholder="Vincular termino del diccionario (opcional)"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={saving || isReadOnly}
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || isReadOnly || !noteText.trim()}
          className="w-full bio-btn bio-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar observación'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 bio-animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 bio-animate-fade-in">
          ✅ {success}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700">Observaciones recientes</p>
        {loading ? (
          <div className="space-y-2">
            <div className="bio-skeleton h-12 w-full" />
            <div className="bio-skeleton h-12 w-full" />
          </div>
        ) : observations.length === 0 ? (
          <p className="text-xs text-gray-500">Sin observaciones registradas.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {observations.map((obs) => (
              <div key={obs.id} className="rounded-md border border-gray-200 p-2 text-xs text-gray-700">
                <p className="text-[11px] text-gray-500">
                  {new Date(obs.created_at).toLocaleString()}
                </p>
                <p className="mt-1">{obs.note_text}</p>
                {(obs.region_id || obs.dictionary_term_slug) && (
                  <p className="mt-1 text-[11px] text-gray-500">
                    {obs.region_id ? `Region: ${obs.region_id}` : null}
                    {obs.region_id && obs.dictionary_term_slug ? ' · ' : null}
                    {obs.dictionary_term_slug ? `Termino: ${obs.dictionary_term_slug}` : null}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
