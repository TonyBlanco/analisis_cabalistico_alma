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
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Cierre consciente</h4>
        <p className="text-xs text-gray-600">
          Cierre manual del espacio. El contenido quedara congelado.
        </p>
      </div>

      {loading ? (
        <p className="text-xs text-gray-500">Cargando resumen...</p>
      ) : (
        <div className="space-y-2 text-xs text-gray-700">
          <div className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2">
            <span>Observaciones registradas</span>
            <span className="font-medium">{observationCount}</span>
          </div>
          <div className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2">
            <span>Hipotesis registradas</span>
            <span className="font-medium">{hypothesisCount}</span>
          </div>
          <div className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2">
            <span>Sintesis presente</span>
            <span className="font-medium">{synthesisRecord?.text ? 'Si' : 'No'}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={isReadOnly || loading}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Cerrar sesion clinica
      </button>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {confirmOpen && (
        <div className="rounded-md border border-gray-300 bg-white p-4 text-xs text-gray-700 space-y-3">
          <p className="font-medium">¿Deseas cerrar este espacio de trabajo?</p>
          <p>El contenido quedara congelado.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
            >
              Confirmar cierre
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
