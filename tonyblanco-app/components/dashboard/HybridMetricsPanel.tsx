'use client';

import { useHybridMetrics } from '@/hooks/useHybridMetrics';
import type { HybridModeKPI } from '@/lib/types/hybrid-metrics';

// ── helpers ──────────────────────────────────────────────────────────────────

const WORKSPACE_LABELS: Record<string, string> = {
  generic: 'General',
  astrologia: 'Astrologia / Tarot',
  astrologia_tarot: 'Astrologia / Tarot',
  cabala_aplicada: 'Cabala aplicada',
  transgeneracional: 'Transgeneracional',
};

function workspaceLabel(key: string): string {
  return WORKSPACE_LABELS[key] ?? key.replace(/_/g, ' ');
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-');
  const date = new Date(Number(y), Number(m) - 1);
  return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
}

// ── small building blocks ─────────────────────────────────────────────────────

interface KpiTileProps {
  label: string;
  monthValue: number;
  totalValue: number;
  color: string;
  emphasis?: boolean;
}

function KpiTile({ label, monthValue, totalValue, color, emphasis }: KpiTileProps) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        emphasis ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'
      }`}
      aria-label={`${label}: ${monthValue} este mes, ${totalValue} en total`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{monthValue}</p>
      <p className="mt-0.5 text-xs text-gray-400">{totalValue} en total</p>
    </div>
  );
}

interface BarRowProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function BarRow({ label, value, max, color }: BarRowProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3" aria-label={`${label}: ${value}`}>
      <span className="w-32 shrink-0 truncate text-xs text-gray-600" title={label}>
        {label}
      </span>
      <span className="h-2 flex-1 overflow-hidden rounded bg-gray-100">
        <span className={`block h-full rounded ${color}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="w-8 shrink-0 text-right text-xs font-medium text-gray-700">{value}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-4 text-center text-sm text-gray-400" role="status">
      {message}
    </p>
  );
}

// ── main panel ─────────────────────────────────────────────────────────────────

export default function HybridMetricsPanel() {
  const { data, status, error, refetch } = useHybridMetrics();

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Modo Interactivo Asistido</h2>
        <p className="py-6 text-center text-sm text-gray-400" role="status">
          Cargando metricas...
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-red-700">Modo Interactivo Asistido</h2>
        <p className="text-sm text-red-600">{error ?? 'No se pudieron cargar las metricas.'}</p>
        <button
          type="button"
          onClick={refetch}
          className="mt-3 rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { kpi, kpi_this_month, events_by_month, by_workspace, role_breakdown } = data;

  const kpiTiles: Array<{
    key: keyof HybridModeKPI;
    label: string;
    color: string;
    emphasis?: boolean;
  }> = [
    { key: 'sessions_started', label: 'Sesiones iniciadas', color: 'text-indigo-600' },
    { key: 'interpretations_generated', label: 'Interpretaciones', color: 'text-violet-600' },
    { key: 'interpretations_accepted', label: 'Aceptadas', color: 'text-emerald-600' },
    { key: 'exercises_completed', label: 'Ejercicios', color: 'text-sky-600' },
    { key: 'notes_created', label: 'Fichas de sesion', color: 'text-purple-600' },
    { key: 'anti_fraud_blocks', label: 'Bloqueos anti-fraude', color: 'text-amber-600', emphasis: true },
  ];

  const maxMonth = Math.max(1, ...events_by_month.map((e) => e.count));
  const workspaceEntries = Object.entries(by_workspace).sort((a, b) => b[1] - a[1]);
  const maxWorkspace = Math.max(1, ...workspaceEntries.map(([, v]) => v));
  const totalRole = role_breakdown.observational + role_breakdown.clinical;

  const hasAny = totalRole > 0 || events_by_month.length > 0;

  return (
    <section
      aria-label="Metricas del Modo Interactivo Asistido (Hibrido)"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Modo Interactivo Asistido &mdash; actividad simbolica
        </h2>
        <button
          type="button"
          onClick={refetch}
          className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
        >
          Actualizar
        </button>
      </div>

      {!hasAny ? (
        <p
          className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 shadow-sm"
          role="status"
        >
          Aun no hay actividad registrada del modo hibrido.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {kpiTiles.map((t) => (
              <KpiTile
                key={t.key}
                label={t.label}
                monthValue={kpi_this_month[t.key]}
                totalValue={kpi[t.key]}
                color={t.color}
                emphasis={t.emphasis}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-700">Eventos por mes</h3>
              {events_by_month.length > 0 ? (
                <div className="flex h-40 items-end gap-2">
                  {events_by_month.map((e) => (
                    <div
                      key={e.month}
                      className="flex flex-1 flex-col items-center justify-end gap-1"
                    >
                      <span className="text-[10px] text-gray-400">{e.count}</span>
                      <span
                        className="w-full rounded-t bg-indigo-400"
                        style={{ height: `${Math.round((e.count / maxMonth) * 100)}%` }}
                        aria-label={`${monthLabel(e.month)}: ${e.count} eventos`}
                      />
                      <span className="text-[10px] text-gray-500">{monthLabel(e.month)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="Sin eventos registrados" />
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">Por workspace</h3>
                {workspaceEntries.length > 0 ? (
                  <div className="space-y-2">
                    {workspaceEntries.map(([key, value]) => (
                      <BarRow
                        key={key}
                        label={workspaceLabel(key)}
                        value={value}
                        max={maxWorkspace}
                        color="bg-violet-400"
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Sin datos por workspace" />
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-1 text-sm font-semibold text-gray-700">Rol de la sesion</h3>
                <p className="mb-3 text-xs text-gray-400">
                  El rol lo determina el servidor segun el perfil verificado.
                </p>
                {totalRole > 0 ? (
                  <div className="space-y-2">
                    <BarRow
                      label="Observacional"
                      value={role_breakdown.observational}
                      max={totalRole}
                      color="bg-sky-400"
                    />
                    <BarRow
                      label="Clinico verificado"
                      value={role_breakdown.clinical}
                      max={totalRole}
                      color="bg-emerald-500"
                    />
                  </div>
                ) : (
                  <EmptyState message="Sin sesiones registradas" />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
