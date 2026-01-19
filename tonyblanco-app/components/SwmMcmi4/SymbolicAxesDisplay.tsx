/**
 * SymbolicAxesDisplay - Read-only display of computed symbolic axes
 * 
 * Shows the 5 symbolic dimensions derived from mcmi4-signal TestResult.
 * Axes are computed backend-side and stored as workspace artifact.
 */

import type { SymbolicAxis } from '@/lib/api/swm-mcmi4-api';

interface SymbolicAxesDisplayProps {
  axes: SymbolicAxis[] | null;
  loading?: boolean;
  error?: string | null;
  onCompute?: () => void;
}

const levelColors = {
  bajo: 'bg-blue-50 text-blue-700 border-blue-200',
  medio: 'bg-amber-50 text-amber-700 border-amber-200',
  alto: 'bg-rose-50 text-rose-700 border-rose-200',
};

const levelLabels = {
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
};

export default function SymbolicAxesDisplay({
  axes,
  loading,
  error,
  onCompute,
}: SymbolicAxesDisplayProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">Cargando ejes simbólicos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-700">{error}</p>
        {onCompute && (
          <button
            onClick={onCompute}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (!axes || axes.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Ejes Simbólicos</p>
            <p className="text-sm text-gray-600">No se han computado los ejes simbólicos.</p>
          </div>
          {onCompute && (
            <button
              onClick={onCompute}
              className="px-3 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              Computar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Ejes Simbólicos</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Derivados de señal mcmi4-signal</p>
          </div>
          {onCompute && (
            <button
              onClick={onCompute}
              className="text-xs font-medium text-gray-600 hover:text-gray-800"
              title="Recomputar ejes"
            >
              ↻
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {axes.map((axis, idx) => (
          <div key={idx} className="px-4 py-3">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{axis.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">{axis.description}</p>
              </div>
              <span
                className={`flex-shrink-0 px-2 py-0.5 text-[11px] font-medium rounded-full border ${
                  levelColors[axis.level]
                }`}
              >
                {levelLabels[axis.level]}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${axis.value * 100}%`,
                  backgroundColor:
                    axis.level === 'bajo'
                      ? '#3b82f6'
                      : axis.level === 'medio'
                      ? '#f59e0b'
                      : '#f43f5e',
                }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1 text-right">
              {(axis.value * 100).toFixed(0)}%
            </p>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-[10px] text-gray-500">
          ℹ️ Ejes simbólicos interpretativos. No diagnósticos.
        </p>
      </div>
    </div>
  );
}
