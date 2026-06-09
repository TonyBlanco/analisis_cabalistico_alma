'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';
import type { SystemId } from '@holistica/symbolic/tree/symbolic-interpreter.types';
import type {
  CorrespondenceEntryV1,
  CorrespondencesResponseV1,
  CorrespondencePathDataV1,
  CorrespondenceSefirahDataV1,
} from '@holistica/symbolic/api';
import { fetchCorrespondencesViaApi } from '@/lib/api/symbolic-api-client';

interface CorrespondencesPanelProps {
  systemId: SystemId;
  onSystemChange: (systemId: SystemId) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatValue(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return value.join(', ');
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

function labeledRows(
  rows: Array<{ label: string; value: unknown }>,
): Array<{ label: string; value: string }> {
  return rows
    .map((row) => {
      const value = formatValue(row.value);
      return value ? { label: row.label, value } : null;
    })
    .filter((row): row is { label: string; value: string } => row !== null);
}

function renderHermeticSefirah(data: Record<string, unknown>) {
  return labeledRows([
    { label: 'Planeta', value: data.planet },
    { label: 'Elemento', value: data.element },
    { label: 'Color (King Scale)', value: data.kingScaleColor },
    { label: 'Arcanos mayores', value: data.tarotArcanaNumbers },
  ]);
}

function renderJewishSefirah(data: Record<string, unknown>) {
  return labeledRows([
    { label: 'Nombre divino (hebreo)', value: data.divineNameHebrew },
    { label: 'Nombre divino (translit.)', value: data.divineNameTranslit },
    { label: 'Arcángel', value: data.archangel },
    { label: 'Coro angélico', value: data.angelicChoir },
    { label: 'Olam', value: data.olam },
  ]);
}

function renderSefirahFields(
  systemId: SystemId,
  data: CorrespondenceSefirahDataV1,
): Array<{ label: string; value: string }> {
  if (!isRecord(data)) return [];
  if (systemId === 'jewish-traditional') {
    return renderJewishSefirah(data);
  }
  return renderHermeticSefirah(data);
}

function renderHermeticPath(data: Record<string, unknown>) {
  return labeledRows([
    { label: 'Letra hebrea', value: data.hebrewLetter },
    { label: 'Nº sendero', value: data.pathNumber },
    { label: 'Arcano mayor', value: data.tarotArcanum },
    { label: 'Planeta', value: data.planet },
    { label: 'Elemento', value: data.element },
  ]);
}

function renderJewishPath(data: Record<string, unknown>) {
  return labeledRows([
    { label: 'Letra hebrea', value: data.hebrewLetter },
    { label: 'Clase (Yetzirah)', value: data.letterClass },
    { label: 'Atribución', value: data.attribution },
  ]);
}

function renderPathFields(
  systemId: SystemId,
  data: CorrespondencePathDataV1,
): Array<{ label: string; value: string }> {
  if (!isRecord(data)) return [];
  if (systemId === 'jewish-traditional') {
    return renderJewishPath(data);
  }
  return renderHermeticPath(data);
}

function CorrespondenceFieldList({
  fields,
}: {
  fields: Array<{ label: string; value: string }>;
}) {
  if (fields.length === 0) {
    return <p className="mt-1 text-[10px] text-gray-400">Sin datos para este sistema.</p>;
  }
  return (
    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[10px] text-gray-600">
      {fields.map((field) => (
        <div key={field.label} className="contents">
          <dt className="font-medium text-gray-500">{field.label}</dt>
          <dd className="text-gray-700">{field.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SefirahEntry({
  entry,
  systemId,
}: {
  entry: CorrespondenceEntryV1<CorrespondenceSefirahDataV1>;
  systemId: SystemId;
}) {
  const fields = renderSefirahFields(systemId, entry.data);
  return (
    <div className="rounded-md border border-gray-100 bg-white px-3 py-2 text-xs text-gray-700">
      <span className="font-semibold capitalize">{entry.id}</span>
      <CorrespondenceFieldList fields={fields} />
    </div>
  );
}

function PathEntry({
  entry,
  systemId,
}: {
  entry: CorrespondenceEntryV1<CorrespondencePathDataV1>;
  systemId: SystemId;
}) {
  const fields = renderPathFields(systemId, entry.data);
  return (
    <div className="rounded-md border border-gray-100 bg-gray-50 px-2 py-1.5 text-[10px] text-gray-600">
      <span className="font-semibold text-gray-700">{entry.id}</span>
      <CorrespondenceFieldList fields={fields} />
    </div>
  );
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
        <div
          className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 text-xs"
          role="group"
          aria-label="Sistema de correspondencias"
        >
          <button
            type="button"
            onClick={() => onSystemChange('hermetic-golden-dawn')}
            aria-pressed={systemId === 'hermetic-golden-dawn'}
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
            aria-pressed={systemId === 'jewish-traditional'}
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
        <div
          className="flex items-center gap-2 text-sm text-gray-600 py-6 justify-center"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Cargando correspondencias…
        </div>
      )}

      {error && !loading && (
        <div
          className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="self-start rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && !data && (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-xs text-gray-500" role="status">
          No hay correspondencias disponibles para este sistema.
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
                <SefirahEntry key={entry.id} entry={entry} systemId={data.systemId} />
              ))}
            </div>
          </section>
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Senderos ({data.paths.length})
            </h4>
            <div className="grid gap-1">
              {data.paths.slice(0, 8).map((entry) => (
                <PathEntry key={entry.id} entry={entry} systemId={data.systemId} />
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