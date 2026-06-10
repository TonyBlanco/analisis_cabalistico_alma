'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import type { TherapistMetrics, MonthlyCount } from '@/lib/types/metrics';
import HybridMetricsPanel from './HybridMetricsPanel';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// ── helpers ──────────────────────────────────────────────────────────────────

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-');
  const date = new Date(Number(y), Number(m) - 1);
  return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
}

function buildLineSeries(series: MonthlyCount[]) {
  return {
    labels: series.map((e) => monthLabel(e.month)),
    datasets: [
      {
        label: 'Sesiones',
        data: series.map((e) => e.count),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.15)',
        tension: 0.35,
        fill: true,
        pointRadius: 4,
      },
    ],
  };
}

function buildBarSeries(
  sessions: MonthlyCount[],
  fichas: MonthlyCount[]
): { labels: string[]; datasets: ReturnType<typeof buildLineSeries>['datasets'][number][] } {
  const allMonths = Array.from(
    new Set([...sessions.map((e) => e.month), ...fichas.map((e) => e.month)])
  ).sort();

  const sMap = Object.fromEntries(sessions.map((e) => [e.month, e.count]));
  const fMap = Object.fromEntries(fichas.map((e) => [e.month, e.count]));

  return {
    labels: allMonths.map(monthLabel),
    datasets: [
      {
        label: 'Sesiones',
        data: allMonths.map((m) => sMap[m] ?? 0),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.75)',
        tension: 0,
        fill: false,
        pointRadius: 0,
      },
      {
        label: 'Fichas',
        data: allMonths.map((m) => fMap[m] ?? 0),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.75)',
        tension: 0,
        fill: false,
        pointRadius: 0,
      },
    ],
  };
}

const CHART_OPTS_BASE = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
} as const;

// ── KPI card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number | string;
  color: string;
}

function KpiCard({ label, value, color }: KpiCardProps) {
  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      aria-label={`${label}: ${value}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

interface MetricsDashboardProps {
  metrics: TherapistMetrics;
}

export default function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  const { kpi, sessions_by_month, fichas_by_month, therapy_status_breakdown, consent_breakdown } =
    metrics;

  const statusLabels: Record<string, string> = {
    active: 'Activos',
    paused: 'Pausados',
    inactive: 'Inactivos',
    archived: 'Archivados',
  };
  const statusColors = ['#6366f1', '#f59e0b', '#94a3b8', '#64748b'];
  const statusKeys = Object.keys(therapy_status_breakdown);
  const doughnutData = {
    labels: statusKeys.map((k) => statusLabels[k] ?? k),
    datasets: [
      {
        data: statusKeys.map((k) => therapy_status_breakdown[k] ?? 0),
        backgroundColor: statusColors,
        borderWidth: 2,
      },
    ],
  };

  const consentData = {
    labels: ['Con consentimiento', 'Sin consentimiento'],
    datasets: [
      {
        data: [consent_breakdown.with_consent, consent_breakdown.without_consent],
        backgroundColor: ['#22c55e', '#e2e8f0'],
        borderWidth: 2,
      },
    ],
  };

  const hasSessionSeries = sessions_by_month.length > 0;
  const hasBarSeries = sessions_by_month.length > 0 || fichas_by_month.length > 0;

  return (
    <section aria-label="Panel de metricas del terapeuta" className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Pacientes totales"    value={kpi.total_patients}       color="text-indigo-600" />
        <KpiCard label="Activos 30 d"         value={kpi.active_patients_30d}   color="text-emerald-600" />
        <KpiCard label="Sesiones este mes"    value={kpi.sessions_this_month}   color="text-violet-600" />
        <KpiCard label="Fichas este mes"      value={kpi.fichas_this_month}     color="text-purple-600" />
        <KpiCard label="Nuevos (30 d)"        value={kpi.new_patients_30d}      color="text-sky-600" />
      </div>

      {/* Session trend */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Sesiones por mes</h2>
        {hasSessionSeries ? (
          <div className="h-48">
            <Line
              data={buildLineSeries(sessions_by_month)}
              options={{
                ...CHART_OPTS_BASE,
                plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
              }}
              aria-label="Grafica de sesiones por mes"
            />
          </div>
        ) : (
          <EmptyState message="Sin sesiones en los ultimos 12 meses" />
        )}
      </div>

      {/* Sessions + fichas grouped bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-gray-700">Sesiones y fichas por mes</h2>
        <div className="mb-3 flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded bg-indigo-500" />
            Sesiones
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded bg-violet-400" />
            Fichas
          </span>
        </div>
        {hasBarSeries ? (
          <div className="h-48">
            <Bar
              data={buildBarSeries(sessions_by_month, fichas_by_month)}
              options={{
                ...CHART_OPTS_BASE,
                plugins: {
                  legend: { display: false },
                  tooltip: { mode: 'index' },
                },
              }}
              aria-label="Grafica de sesiones y fichas por mes"
            />
          </div>
        ) : (
          <EmptyState message="Sin datos en los ultimos 12 meses" />
        )}
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Estado terapeutico</h2>
          {statusKeys.length > 0 ? (
            <div className="mx-auto h-44 w-44">
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                }}
                aria-label="Distribucion por estado terapeutico"
              />
            </div>
          ) : (
            <EmptyState message="Sin pacientes registrados" />
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Consentimiento</h2>
          {consent_breakdown.with_consent + consent_breakdown.without_consent > 0 ? (
            <div className="mx-auto h-44 w-44">
              <Doughnut
                data={consentData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                }}
                aria-label="Distribucion de consentimiento de pacientes"
              />
            </div>
          ) : (
            <EmptyState message="Sin datos de consentimiento" />
          )}
        </div>
      </div>

      {/* Modo Interactivo Asistido (Hibrido) — observabilidad D6 */}
      <div className="border-t border-gray-100 pt-6">
        <HybridMetricsPanel />
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-8 text-center text-sm text-gray-400" role="status">
      {message}
    </p>
  );
}
