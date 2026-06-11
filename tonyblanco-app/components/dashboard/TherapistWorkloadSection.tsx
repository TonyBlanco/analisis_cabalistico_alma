'use client';

import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  UserPlus,
  Users,
} from 'lucide-react';
import { GuidedBlock } from '@/components/ui/guided-block';
import type {
  TherapistWorkload,
  TherapistWorkloadGlobalActionItem,
  TherapistWorkloadPatient,
  TherapistWorkloadTestRecent,
} from '@/lib/types/therapist-workload';

type WorkloadStatus = 'idle' | 'loading' | 'success' | 'error';

interface TherapistWorkloadSectionProps {
  workload: TherapistWorkload | null;
  status: WorkloadStatus;
  error: string | null;
  isEmpty: boolean;
  onRetry: () => void;
}

const THERAPY_STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  paused: 'Pausado',
  inactive: 'Inactivo',
  archived: 'Archivado',
};

const THERAPY_STATUS_CLASSES: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-amber-100 text-amber-800',
  inactive: 'bg-gray-100 text-gray-700',
  archived: 'bg-slate-100 text-slate-600',
};

const THERAPY_LEVEL_LABELS: Record<string, string> = {
  assiyah: 'Asiyah',
  yetzirah: 'Yetzirah',
  beriah: 'Beriah',
};

const TEST_STATUS_BADGES = {
  pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completado', className: 'bg-green-100 text-green-800' },
} as const;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatRelativeActivity(iso: string | null | undefined): string {
  if (!iso) return 'Sin actividad reciente';
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return formatDate(iso);
}

function TestCountBadges({ tests }: { tests: TherapistWorkloadPatient['tests'] }) {
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Resumen de tests">
      {tests.assigned > 0 && (
        <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
          {tests.assigned} asignado{tests.assigned !== 1 ? 's' : ''}
        </span>
      )}
      {tests.pending > 0 && (
        <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
          {tests.pending} pendiente{tests.pending !== 1 ? 's' : ''}
        </span>
      )}
      {tests.completed > 0 && (
        <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
          {tests.completed} completado{tests.completed !== 1 ? 's' : ''}
        </span>
      )}
      {tests.assigned === 0 && tests.pending === 0 && tests.completed === 0 && (
        <span className="text-xs text-gray-500">Sin tests</span>
      )}
    </div>
  );
}

function RecentTestBadge({ test }: { test: TherapistWorkloadTestRecent }) {
  const badge = TEST_STATUS_BADGES[test.status];
  const className = `inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${badge.className}`;

  if (test.status === 'completed' && test.result_id) {
    return (
      <Link
        href={`/dashboard/therapist/tests/results/${test.result_id}`}
        className={`${className} hover:opacity-90`}
        title={`${test.test_name} — ver resultado`}
        aria-label={`Ver resultado de ${test.test_name}`}
      >
        {test.test_code}
      </Link>
    );
  }

  return (
    <span
      className={className}
      title={test.test_name}
    >
      {test.test_code}
    </span>
  );
}

function RecentTestBadges({ tests }: { tests: TherapistWorkloadTestRecent[] }) {
  if (tests.length === 0) {
    return <span className="text-xs text-gray-500">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tests.slice(0, 3).map((test) => (
        <RecentTestBadge
          key={`${test.test_code}-${test.assignment_id ?? test.result_id}`}
          test={test}
        />
      ))}
      {tests.length > 3 && (
        <span className="text-xs text-gray-500">+{tests.length - 3}</span>
      )}
    </div>
  );
}

function PatientActionLinks({ items }: { items: TherapistWorkloadPatient['action_items'] }) {
  if (items.length === 0) {
    return <span className="text-xs text-gray-500">Al día</span>;
  }

  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={`${item.type}-${i}`}>
          <Link
            href={item.href}
            className="text-xs text-indigo-700 hover:text-indigo-900 underline"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function GlobalActionItems({ items }: { items: TherapistWorkloadGlobalActionItem[] }) {
  if (items.length === 0) return null;

  return (
    <div
      className="rounded-lg border border-indigo-200 bg-indigo-50 p-4"
      aria-label="Acciones pendientes de revisión"
    >
      <h3 className="mb-3 text-sm font-semibold text-indigo-900">Revisar resultados</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={`${item.type}-${item.result_id}`}>
            <Link
              href={item.href}
              className="flex items-center justify-between gap-3 rounded-md border border-indigo-100 bg-white px-3 py-2 text-sm text-gray-800 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <span>
                <span className="font-medium">{item.test_name}</span>
                <span className="text-gray-500"> · {item.patient_display_name}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummaryCards({ summary }: { summary: TherapistWorkload['summary'] }) {
  const cards = [
    { label: 'Consultantes activos', value: summary.patients_active, icon: Users },
    { label: 'Tests asignados', value: summary.tests_assigned_total, icon: ClipboardList },
    { label: 'Pendientes', value: summary.tests_pending_total, icon: Clock },
    { label: 'Completados', value: summary.tests_completed_total, icon: CheckCircle2 },
    { label: 'Acciones', value: summary.action_items_total, icon: AlertCircle },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      aria-label="Resumen de trabajo en curso"
    >
      {cards.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3"
        >
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </div>
          <p className="text-xl font-semibold text-gray-900">{value}</p>
        </div>
      ))}
    </div>
  );
}

function PatientCard({ patient }: { patient: TherapistWorkloadPatient }) {
  const levelLabel = patient.therapy_level
    ? THERAPY_LEVEL_LABELS[patient.therapy_level] ?? patient.therapy_level
    : 'Sin nivel';

  return (
    <article
      className="rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
      aria-label={`Consultante ${patient.display_name}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <Link
            href={`/dashboard/therapist/patients/${patient.id}`}
            className="font-medium text-gray-900 hover:text-indigo-700"
          >
            {patient.display_name}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium ${
                THERAPY_STATUS_CLASSES[patient.therapy_status] ?? 'bg-gray-100 text-gray-700'
              }`}
            >
              {THERAPY_STATUS_LABELS[patient.therapy_status] ?? patient.therapy_status}
            </span>
            <span className="text-xs text-gray-500">{levelLabel}</span>
          </div>
        </div>
        <Link
          href={`/dashboard/therapist/patients/${patient.id}`}
          className="shrink-0 text-xs text-indigo-700 hover:text-indigo-900 underline"
          aria-label={`Ver ficha de ${patient.display_name}`}
        >
          Ver ficha
        </Link>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="mb-1 text-xs font-medium text-gray-500">Tests</p>
          <TestCountBadges tests={patient.tests} />
        </div>

        {patient.tests_recent.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">Recientes</p>
            <RecentTestBadges tests={patient.tests_recent} />
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>{patient.progress.sessions_count} sesión{patient.progress.sessions_count !== 1 ? 'es' : ''}</span>
          <span>{formatRelativeActivity(patient.progress.last_activity_at)}</span>
        </div>

        {patient.action_items.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">Acciones</p>
            <PatientActionLinks items={patient.action_items} />
          </div>
        )}
      </div>
    </article>
  );
}

function PatientsTable({ patients }: { patients: TherapistWorkloadPatient[] }) {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full text-sm" aria-label="Lista de consultantes y trabajo en curso">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500">
            <th scope="col" className="pb-3 pr-4">Consultante</th>
            <th scope="col" className="pb-3 pr-4">Tests</th>
            <th scope="col" className="pb-3 pr-4">Recientes</th>
            <th scope="col" className="pb-3 pr-4">Progreso</th>
            <th scope="col" className="pb-3 pr-4">Acciones</th>
            <th scope="col" className="pb-3">Ficha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {patients.map((patient) => {
            const levelLabel = patient.therapy_level
              ? THERAPY_LEVEL_LABELS[patient.therapy_level] ?? patient.therapy_level
              : 'Sin nivel';

            return (
              <tr key={patient.id} className="hover:bg-gray-50/80">
                <td className="py-3 pr-4">
                  <Link
                    href={`/dashboard/therapist/patients/${patient.id}`}
                    className="font-medium text-gray-900 hover:text-indigo-700"
                  >
                    {patient.display_name}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        THERAPY_STATUS_CLASSES[patient.therapy_status] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {THERAPY_STATUS_LABELS[patient.therapy_status] ?? patient.therapy_status}
                    </span>
                    <span className="text-xs text-gray-500">{levelLabel}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <TestCountBadges tests={patient.tests} />
                </td>
                <td className="py-3 pr-4">
                  <RecentTestBadges tests={patient.tests_recent} />
                </td>
                <td className="py-3 pr-4 text-xs text-gray-600">
                  <div>{patient.progress.sessions_count} sesiones</div>
                  <div className="text-gray-500">
                    {formatRelativeActivity(patient.progress.last_activity_at)}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <PatientActionLinks items={patient.action_items} />
                </td>
                <td className="py-3">
                  <Link
                    href={`/dashboard/therapist/patients/${patient.id}`}
                    className="text-xs text-indigo-700 hover:text-indigo-900 underline"
                    aria-label={`Ver ficha de ${patient.display_name}`}
                  >
                    Ver ficha
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WorkloadSkeleton() {
  return (
    <div
      className="animate-pulse rounded-xl border border-gray-200 bg-white shadow-sm"
      aria-busy="true"
      aria-label="Cargando trabajo en curso"
    >
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="h-5 w-56 rounded bg-gray-100" />
        <div className="mt-2 h-4 w-72 rounded bg-gray-100" />
      </div>
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-100" />
          ))}
        </div>
        <div className="space-y-3 lg:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-gray-100" />
          ))}
        </div>
        <div className="hidden lg:block h-48 rounded-lg bg-gray-100" />
      </div>
    </div>
  );
}

function EmptyWorkload() {
  return (
    <GuidedBlock
      variant="missing"
      role="therapist"
      title="Aún no tienes consultantes"
      description="Crea tu primer consultante para empezar a asignar tests, registrar sesiones y hacer seguimiento del trabajo terapéutico."
      steps={[
        {
          label: 'Crear un consultante',
          description: 'Registra nombre y datos básicos desde la sección de consultantes.',
        },
        {
          label: 'Completar el perfil',
          description: 'Añade fecha y lugar de nacimiento para habilitar análisis y tests.',
        },
        {
          label: 'Asignar tests modulares',
          description: 'Envía cuestionarios de auto-evaluación desde el catálogo de tests.',
        },
      ]}
      actions={[
        {
          label: 'Crear consultante',
          href: '/dashboard/therapist/patients/create',
          variant: 'primary',
        },
        {
          label: 'Ver consultantes',
          href: '/dashboard/therapist/patients',
          variant: 'secondary',
        },
      ]}
      icon={UserPlus}
    />
  );
}

export default function TherapistWorkloadSection({
  workload,
  status,
  error,
  isEmpty,
  onRetry,
}: TherapistWorkloadSectionProps) {
  if (status === 'loading' || status === 'idle') {
    return <WorkloadSkeleton />;
  }

  if (status === 'error') {
    return (
      <div
        role="alert"
        className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        aria-label="Error al cargar trabajo en curso"
      >
        <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>No se pudo cargar el trabajo en curso: {error}</span>
        <button
          type="button"
          onClick={onRetry}
          className="ml-auto rounded-md border border-red-300 px-3 py-1 text-xs hover:bg-red-100"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (isEmpty || !workload) {
    return (
      <section
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
        aria-label="Mis consultantes y trabajo en curso"
      >
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Mis consultantes / Trabajo en curso
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Seguimiento operativo de consultantes, tests y acciones pendientes.
          </p>
        </div>
        <div className="p-6">
          <EmptyWorkload />
        </div>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border border-gray-200 bg-white shadow-sm"
      aria-label="Mis consultantes y trabajo en curso"
    >
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">
          Mis consultantes / Trabajo en curso
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Seguimiento operativo de consultantes, tests y acciones pendientes.
        </p>
      </div>

      <div className="space-y-6 p-6">
        <SummaryCards summary={workload.summary} />

        <GlobalActionItems items={workload.action_items} />

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Consultantes ({workload.patients.length})
          </h3>

          <div className="space-y-3 lg:hidden">
            {workload.patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>

          <PatientsTable patients={workload.patients} />
        </div>
      </div>
    </section>
  );
}