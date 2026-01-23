'use client';

import { useEffect, useState } from 'react';
import { useExperientialContext } from './hooks/useExperientialContext';
import {
  closeSynthesis,
  listHypotheses,
  listObservations,
  type BioEmotionalSynthesis,
} from '@/lib/api/bioemotional-clinical';

interface ClosurePanelProps {
  synthesisRecord: BioEmotionalSynthesis | null;
  onClosed: (record: BioEmotionalSynthesis) => void;
  isReadOnly: boolean;
}

export default function ClosurePanel({ synthesisRecord, onClosed, isReadOnly }: ClosurePanelProps) {
  const { context } = useExperientialContext();
  const patientId = context.patientId;
  const [observationCount, setObservationCount] = useState<number>(0);
  const [hypothesisCount, setHypothesisCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!patientId) {
        setObservationCount(0);
        setHypothesisCount(0);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [observations, hypotheses] = await Promise.all([
          listObservations(patientId),
          listHypotheses(patientId),
        ]);
        setObservationCount(observations.length);
        setHypothesisCount(hypotheses.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el resumen.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  const handleClose = async () => {
    if (!synthesisRecord) {
      setError('Necesitas guardar una sintesis antes de cerrar.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const record = await closeSynthesis(synthesisRecord.id);
      onClosed(record);
      setConfirmOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cerrar la sesion clinica.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bio-card-glass rounded-2xl p-6 space-y-4 bio-animate-slide-in-up">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">🔒 Cierre consciente</h4>
        <p className="text-xs text-gray-600">
          Cierre manual del espacio. El contenido quedara congelado.
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="bio-skeleton h-10 rounded-lg"></div>
          <div className="bio-skeleton h-10 rounded-lg"></div>
          <div className="bio-skeleton h-10 rounded-lg"></div>
        </div>
      ) : (
        <div className="space-y-2 text-xs text-gray-700">
          <div className="flex items-center justify-between bio-glass rounded-lg px-3 py-2">
            <span className="flex items-center gap-2">👁️ Observaciones registradas</span>
            <span className="bio-badge bio-badge-info">{observationCount}</span>
          </div>
          <div className="flex items-center justify-between bio-glass rounded-lg px-3 py-2">
            <span className="flex items-center gap-2">🔍 Hipotesis registradas</span>
            <span className="bio-badge bio-badge-info">{hypothesisCount}</span>
          </div>
          <div className="flex items-center justify-between bio-glass rounded-lg px-3 py-2">
            <span className="flex items-center gap-2">✨ Sintesis presente</span>
            <span className={`bio-badge ${synthesisRecord?.text ? 'bio-badge-success' : 'bio-badge-warning'}`}>{synthesisRecord?.text ? 'Si' : 'No'}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={isReadOnly || loading}
        className="w-full bio-btn bio-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🔒 Cerrar sesion clinica
      </button>

      {error && (
        <div className="rounded-lg bio-glass border border-red-200/50 p-3 text-xs text-red-700 bio-animate-fade-in">
          {error}
        </div>
      )}

      {confirmOpen && (
        <div className="bio-card-glass rounded-xl p-4 text-xs text-gray-700 space-y-3 bio-animate-scale-in">
          <p className="font-medium">¿Deseas cerrar este espacio de trabajo?</p>
          <p className="text-gray-500">El contenido quedara congelado e inmutable.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="bio-btn bio-btn-secondary text-xs px-3 py-1.5"
            >
              ✓ Confirmar cierre
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="bio-btn bio-btn-ghost text-xs px-3 py-1.5"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
