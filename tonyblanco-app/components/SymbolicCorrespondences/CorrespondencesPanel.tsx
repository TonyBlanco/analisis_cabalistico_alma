'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';
import type { SystemId } from '@holistica/symbolic/tree/symbolic-interpreter.types';
import type { CorrespondencesResponseV1 } from '@holistica/symbolic/api';
import { fetchCorrespondencesViaApi } from '@/lib/api/symbolic-api-client';

interface CorrespondencesPanelProps {
  systemId: SystemId;
  onSystemChange: (systemId: SystemId) => void;
}

export function CorrespondencesPanel({
  systemId,
  onSystemChange,
}: CorrespondencesPanelProps) {
  const [data, setData] = useState<CorrespondencesResponseV1 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchCorrespondencesViaApi(systemId);
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar correspondencias.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [systemId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-900">Correspondencias (solo lectura)</h3>
        </div>
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 text-xs">
          <button
            type="button"
            onClick={() => onSystemChange('hermetic-golden-dawn')}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              systemId === 'hermetic-golden-dawn'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Hermético
          </button>
          <button
            type="button"
            onClick={() => onSystemChange('jewish-traditional')}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              systemId === 'jewish-traditional'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Judío tradicional
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Tablas de referencia estructural-simbólica. Sin interpretación clínica ni consejo personal.
      </p>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-600 py-6 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando correspondencias…
        </div>
      )}

      {error && !loading && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Sefirot ({data.sefirot.length})
            </h4>
            <div className="space-y-1">
              {data.sefirot.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-md border border-gray-100 bg-white px-3 py-2 text-xs text-gray-700"
                >
                  <span className="font-semibold capitalize">{entry.id}</span>
                  <pre className="mt-1 whitespace-pre-wrap font-mono text-[10px] text-gray-600">
                    {JSON.stringify(entry.data, null, 0)}
                  </pre>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Senderos ({data.paths.length})
            </h4>
            <div className="grid gap-1">
              {data.paths.slice(0, 8).map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] font-mono text-gray-600"
                >
                  {entry.id}
                </div>
              ))}
              {data.paths.length > 8 && (
                <p className="text-[10px] text-gray-400 px-1">
                  +{data.paths.length - 8} senderos más
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}