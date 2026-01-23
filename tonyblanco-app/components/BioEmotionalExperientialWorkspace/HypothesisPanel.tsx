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
  insertText?: string | null;
  onInsertApplied?: () => void;
  isReadOnly?: boolean;
}

const statusLabels: Record<HypothesisStatus, string> = {
  open: 'Abierta',
  in_review: 'En revision',
  discarded: 'Descartada',
};

export default function HypothesisPanel({
  selectedRegion,
  insertText,
  onInsertApplied,
  isReadOnly = false,
}: HypothesisPanelProps) {
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

  useEffect(() => {
    if (!insertText) {
      return;
    }
    setDescription((prev) => (prev ? `${prev}\n\n${insertText}` : insertText));
    if (onInsertApplied) {
      onInsertApplied();
    }
  }, [insertText, onInsertApplied]);

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
    <div className="bio-card-glass rounded-2xl p-6 space-y-4 bio-animate-slide-in-up">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">🔍 Hipotesis bio-emocionales</h4>
        <p className="text-xs text-gray-600">
          Hipotesis de trabajo consultivas. No son diagnosticos ni conclusiones automaticas.
        </p>
      </div>

      {selectedRegion && (
        <div className="bio-glass rounded-lg p-2 text-xs">
          <p className="font-medium flex items-center gap-2">🎯 Region seleccionada: <span className="bio-badge bio-badge-info">{selectedRegion.label}</span></p>
        </div>
      )}

      <div className="space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titulo de la hipotesis"
          className="w-full rounded-lg bio-glass border-0 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all"
          disabled={saving || isReadOnly}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe la hipotesis de forma neutral..."
          className="w-full rounded-lg bio-glass border-0 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all resize-none"
          disabled={saving || isReadOnly}
        />

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <input
            id="link-region-hypo"
            type="checkbox"
            checked={linkRegion}
            onChange={(e) => setLinkRegion(e.target.checked)}
            disabled={!selectedRegion || saving || isReadOnly}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="link-region-hypo">Vincular region seleccionada</label>
        </div>

        <input
          type="text"
          value={dictionaryTerm}
          onChange={(e) => setDictionaryTerm(e.target.value)}
          placeholder="Vincular termino del diccionario (opcional)"
          className="w-full rounded-lg bio-glass border-0 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all"
          disabled={saving || isReadOnly}
        />

        <div>
          <label className="text-xs font-medium text-gray-700">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as HypothesisStatus)}
            className="mt-1 w-full rounded-lg bio-glass border-0 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all"
            disabled={saving || isReadOnly}
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
            disabled={saving || isReadOnly || !title.trim() || !description.trim()}
            className="flex-1 bio-btn bio-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '⏳ Guardando...' : selectedId ? '📝 Actualizar hipotesis' : '💾 Guardar hipotesis'}
          </button>
          {selectedId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={isReadOnly}
              className="bio-btn bio-btn-ghost"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bio-glass border border-red-200/50 p-3 text-xs text-red-700 bio-animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bio-glass border border-emerald-200/50 p-3 text-xs text-emerald-700 bio-animate-fade-in">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700">📚 Hipotesis registradas</p>
        {loading ? (
          <div className="space-y-2">
            <div className="bio-skeleton h-16 rounded-lg"></div>
            <div className="bio-skeleton h-16 rounded-lg"></div>
          </div>
        ) : hypotheses.length === 0 ? (
          <p className="text-xs text-gray-500 italic">Sin hipotesis registradas.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto bio-scrollbar">
            {hypotheses.map((item, index) => (
              <div
                key={item.id}
                className="bio-glass rounded-lg p-3 text-xs text-gray-700 bio-animate-slide-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-[11px] text-gray-500 flex items-center gap-2">
                      <span className={`bio-badge ${item.status === 'open' ? 'bio-badge-success' : item.status === 'discarded' ? 'bio-badge-warning' : 'bio-badge-info'}`}>{statusLabels[item.status]}</span>
                      <span>{new Date(item.updated_at).toLocaleString()}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    ✏️ Editar
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
