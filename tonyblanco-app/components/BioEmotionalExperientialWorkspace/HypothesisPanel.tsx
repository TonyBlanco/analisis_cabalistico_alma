'use client';

import { useEffect, useState } from 'react';
import type { AnatomicalRegion } from './data/anatomicalRegions';
import { useExperientialContext } from './hooks/useExperientialContext';
import {
  createHypothesis,
  listHypotheses,
  updateHypothesis,
  type BioEmotionalHypothesis,
  type HypothesisStatus,
} from '@/lib/api/bioemotional-clinical';

interface HypothesisPanelProps {
  selectedRegion: AnatomicalRegion | null;
}

const statusLabels: Record<HypothesisStatus, string> = {
  open: 'Abierta',
  in_review: 'En revision',
  discarded: 'Descartada',
};

export default function HypothesisPanel({ selectedRegion }: HypothesisPanelProps) {
  const { context } = useExperientialContext();
  const patientId = context.patientId;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dictionaryTerm, setDictionaryTerm] = useState('');
  const [linkRegion, setLinkRegion] = useState(false);
  const [status, setStatus] = useState<HypothesisStatus>('open');
  const [hypotheses, setHypotheses] = useState<BioEmotionalHypothesis[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!patientId) {
        setHypotheses([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await listHypotheses(patientId);
        setHypotheses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las hipotesis.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDictionaryTerm('');
    setLinkRegion(false);
    setStatus('open');
    setSelectedId(null);
  };

  const handleSave = async () => {
    if (!patientId) {
      setError('Selecciona un paciente antes de guardar una hipotesis.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError('Titulo y descripcion son obligatorios.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        patient_id: patientId,
        title: title.trim(),
        description: description.trim(),
        related_region_id: linkRegion && selectedRegion ? selectedRegion.id : null,
        related_dictionary_term: dictionaryTerm.trim() ? dictionaryTerm.trim() : null,
        status,
      };

      if (selectedId) {
        const updated = await updateHypothesis(selectedId, payload);
        setHypotheses((prev) => prev.map((item) => (item.id === selectedId ? updated : item)));
        setSuccess('Hipotesis actualizada.');
      } else {
        const created = await createHypothesis(payload);
        setHypotheses((prev) => [created, ...prev]);
        setSuccess('Hipotesis guardada.');
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la hipotesis.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: BioEmotionalHypothesis) => {
    setSelectedId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setDictionaryTerm(item.related_dictionary_term || '');
    setLinkRegion(Boolean(item.related_region_id));
    setStatus(item.status);
    setSuccess(null);
    setError(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Hipotesis bio-emocionales</h4>
        <p className="text-xs text-gray-600">
          Hipotesis de trabajo consultivas. No son diagnosticos ni conclusiones automaticas.
        </p>
      </div>

      {selectedRegion && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-2 text-xs text-blue-700">
          <p className="font-medium">Region seleccionada: {selectedRegion.label}</p>
        </div>
      )}

      <div className="space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titulo de la hipotesis"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={saving}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe la hipotesis de forma neutral..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={saving}
        />

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <input
            id="link-region-hypo"
            type="checkbox"
            checked={linkRegion}
            onChange={(e) => setLinkRegion(e.target.checked)}
            disabled={!selectedRegion || saving}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="link-region-hypo">Vincular region seleccionada</label>
        </div>

        <input
          type="text"
          value={dictionaryTerm}
          onChange={(e) => setDictionaryTerm(e.target.value)}
          placeholder="Vincular termino del diccionario (opcional)"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={saving}
        />

        <div>
          <label className="text-xs font-medium text-gray-700">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as HypothesisStatus)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={saving}
          >
            <option value="open">Abierta</option>
            <option value="in_review">En revision</option>
            <option value="discarded">Descartada</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !title.trim() || !description.trim()}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Guardando...' : selectedId ? 'Actualizar hipotesis' : 'Guardar hipotesis'}
          </button>
          {selectedId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
        </div>
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

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700">Hipotesis registradas</p>
        {loading ? (
          <p className="text-xs text-gray-500">Cargando hipotesis...</p>
        ) : hypotheses.length === 0 ? (
          <p className="text-xs text-gray-500">Sin hipotesis registradas.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {hypotheses.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-gray-200 p-2 text-xs text-gray-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-[11px] text-gray-500">
                      {statusLabels[item.status]} · {new Date(item.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Editar
                  </button>
                </div>
                <p className="mt-1 text-gray-600 line-clamp-2">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
