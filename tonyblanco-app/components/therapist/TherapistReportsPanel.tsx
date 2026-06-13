'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ClipboardCopy,
  ClipboardList,
  Clock,
  Download,
  Users,
} from 'lucide-react';
import { GuidedBlock } from '@/components/ui/guided-block';
import type { TherapistReportsSummary } from '@/lib/types/therapist-reports';
import {
  copyTherapistReportsSummary,
  downloadTherapistReportsCsv,
} from '@/lib/therapistReportsExport';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return 'Sin actividad';
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return formatDate(iso);
}

interface PortfolioCardsProps {
  portfolio: TherapistReportsSummary['portfolio'];
  alertsOpen: number;
}

function PortfolioCards({ portfolio, alertsOpen }: PortfolioCardsProps) {
  const cards = [
    {
      label: 'Consultantes activos',
      total: portfolio.total.patients_active ?? 0,
      window: null,
      icon: Users,
    },
    {
      label: 'Tests asignados',
      total: portfolio.total.tests_assigned,
      window: portfolio.last_30_days.tests_assigned,
      icon: ClipboardList,
    },
    {
      label: 'Pendientes',
      total: portfolio.total.tests_pending,
      window: portfolio.last_30_days.tests_pending,
      icon: Clock,
    },
    {
      label: 'Completados',
      total: portfolio.total.tests_completed,
      window: portfolio.last_30_days.tests_completed,
      icon: CheckCircle2,
    },
    {
      label: 'Alertas',
      total: alertsOpen,
      window: null,
      icon: AlertTriangle,
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      aria-label="Resumen de cartera"
    >
      {cards.map(({ label, total, window, icon: Icon }) => (
        <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </div>
          <p className="text-xl font-semibold text-gray-900">{total}</p>
          {window !== null && (
            <p className="mt-0.5 text-xs text-gray-500">{window} en 30 días</p>
          )}
        </div>
      ))}
    </div>
  );
}

function RecentResultsTable({ rows }: { rows: TherapistReportsSummary['recent_results'] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-gray-500">Aún no hay resultados registrados en tu cartera.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label="Resultados recientes">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500">
            <th scope="col" className="pb-3 pr-4">Consultante</th>
            <th scope="col" className="pb-3 pr-4">Test</th>
            <th scope="col" className="pb-3 pr-4">Fecha</th>
            <th scope="col" className="pb-3 pr-4">Banda / severidad</th>
            <th scope="col" className="pb-3">Alerta</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50/80">
              <td className="py-3 pr-4">
                {row.patient_id ? (
                  <Link
                    href={`/dashboard/therapist/patients/${row.patient_id}`}
                    className="font-medium text-gray-900 hover:text-indigo-700"
                  >
                    {row.patient_display_name}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-900">{row.patient_display_name}</span>
                )}
              </td>
              <td className="py-3 pr-4">
                <Link
                  href={row.href}
                  className="text-indigo-700 hover:text-indigo-900 underline"
                >
                  {row.test_name}
                </Link>
                {row.test_code && (
                  <span className="ml-1 text-xs text-gray-400">({row.test_code})</span>
                )}
              </td>
              <td className="py-3 pr-4 text-gray-600">{formatDate(row.completed_at)}</td>
              <td className="py-3 pr-4 text-gray-600">{row.severity_label || '—'}</td>
              <td className="py-3">
                {row.alert ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                    <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                    {row.referral_recommended ? 'Derivación' : 'Severidad alta'}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PatientMetricsTable({ patients }: { patients: TherapistReportsSummary['patients'] }) {
  if (patients.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label="Métricas por consultante">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500">
            <th scope="col" className="pb-3 pr-4">Consultante</th>
            <th scope="col" className="pb-3 pr-4">Tests</th>
            <th scope="col" className="pb-3 pr-4">Alertas</th>
            <th scope="col" className="pb-3 pr-4">Sesiones</th>
            <th scope="col" className="pb-3">Última actividad</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-gray-50/80">
              <td className="py-3 pr-4">
                <Link
                  href={patient.href}
                  className="font-medium text-gray-900 hover:text-indigo-700"
                >
                  {patient.display_name}
                </Link>
                <p className="text-xs text-gray-500 capitalize">{patient.therapy_status}</p>
              </td>
              <td className="py-3 pr-4">
                <div className="flex flex-wrap gap-1 text-xs">
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-800">
                    {patient.tests.assigned} asig.
                  </span>
                  <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-yellow-800">
                    {patient.tests.pending} pend.
                  </span>
                  <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-800">
                    {patient.tests.completed} compl.
                  </span>
                </div>
              </td>
              <td className="py-3 pr-4">
                {patient.alerts_open > 0 ? (
                  <span className="text-xs font-medium text-amber-800">{patient.alerts_open}</span>
                ) : (
                  <span className="text-xs text-gray-400">0</span>
                )}
              </td>
              <td className="py-3 pr-4 text-gray-600">{patient.sessions_count}</td>
              <td className="py-3 text-gray-600">{formatRelative(patient.last_activity_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SessionsBlock({ sessions }: { sessions: TherapistReportsSummary['sessions'] }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <span>
          <span className="font-medium text-gray-900">{sessions.total}</span> sesiones registradas
        </span>
        <span>
          <span className="font-medium text-gray-900">{sessions.last_30_days}</span> en los últimos 30 días
        </span>
      </div>
      {sessions.recent.length > 0 ? (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
          {sessions.recent.map((session) => (
            <li key={session.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <div>
                {session.href ? (
                  <Link href={session.href} className="font-medium text-gray-900 hover:text-indigo-700">
                    {session.patient_display_name}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-900">{session.patient_display_name}</span>
                )}
                <p className="text-xs text-gray-500">
                  {session.session_type || 'Sesión'}
                  {session.duration_minutes ? ` · ${session.duration_minutes} min` : ''}
                </p>
              </div>
              <span className="shrink-0 text-xs text-gray-500">{formatDate(session.session_date)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">Sin sesiones registradas aún.</p>
      )}
    </div>
  );
}

interface TherapistReportsPanelProps {
  data: TherapistReportsSummary;
}

export default function TherapistReportsPanel({ data }: TherapistReportsPanelProps) {
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const handleCsv = () => {
    downloadTherapistReportsCsv(data);
    setExportMsg('CSV descargado.');
  };

  const handleCopy = async () => {
    try {
      await copyTherapistReportsSummary(data);
      setExportMsg('Resumen copiado al portapapeles.');
    } catch {
      setExportMsg('No se pudo copiar el resumen.');
    }
  };

  return (
    <div className="space-y-6" id="therapist-reports-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Reportes</h1>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Visión agregada de tu cartera, resultados y actividad clínica.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Actualizado: {formatDate(data.generated_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCsv}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
            Copiar resumen
          </button>
        </div>
      </div>

      {exportMsg && (
        <p className="text-xs text-green-700" role="status">
          {exportMsg}
        </p>
      )}

      <div className="rounded-lg border border-amber-100 bg-amber-50/60 px-4 py-3 text-xs text-amber-900">
        {data.disclaimer}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Resumen de cartera</h2>
        <PortfolioCards portfolio={data.portfolio} alertsOpen={data.alerts_open} />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Resultados recientes</h2>
        <RecentResultsTable rows={data.recent_results} />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Métricas por consultante</h2>
        <PatientMetricsTable patients={data.patients} />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" aria-hidden="true" />
          <h2 className="text-base font-semibold text-gray-900">Actividad / sesiones</h2>
        </div>
        <SessionsBlock sessions={data.sessions} />
      </section>
    </div>
  );
}

export function TherapistReportsEmpty() {
  return (
    <GuidedBlock
      variant="info"
      role="therapist"
      title="Sin datos de reporte aún"
      description="Cuando tengas consultantes con tests o sesiones registradas, aquí verás el resumen agregado de tu actividad."
      steps={[
        { label: 'Crea o activa consultantes en tu cartera' },
        { label: 'Asigna tests modulares desde el catálogo' },
        { label: 'Registra sesiones desde la ficha del consultante' },
      ]}
      actions={[
        { label: 'Ver consultantes', href: '/dashboard/therapist/patients', variant: 'primary' },
        { label: 'Ir al dashboard', href: '/dashboard/therapist', variant: 'secondary' },
      ]}
      icon={BarChart3}
    />
  );
}

export function TherapistReportsSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Cargando reportes">
      <div className="h-10 w-64 rounded bg-gray-100" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-gray-100" />
        ))}
      </div>
      <div className="h-48 rounded-xl bg-gray-100" />
      <div className="h-64 rounded-xl bg-gray-100" />
    </div>
  );
}