'use client';

import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  Stethoscope,
} from 'lucide-react';
import type { ProcessTimelineItem, ProcessTimelineStatus } from '@/lib/patientProcess';

function formatTimelineDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function StatusIcon({ status, kind }: { status: ProcessTimelineStatus; kind: ProcessTimelineItem['kind'] }) {
  if (kind === 'therapist_activity') {
    return <Stethoscope className="w-5 h-5 text-violet-600" aria-hidden />;
  }
  if (status === 'completed') {
    return <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden />;
  }
  if (status === 'in_progress') {
    return <Clock3 className="w-5 h-5 text-amber-600" aria-hidden />;
  }
  return <Circle className="w-5 h-5 text-blue-500" aria-hidden />;
}

function statusLabel(status: ProcessTimelineStatus, kind: ProcessTimelineItem['kind']): string {
  if (kind === 'therapist_activity' && status === 'in_progress') {
    return 'En curso';
  }
  if (kind === 'therapist_activity') {
    return 'Actividad de tu terapeuta';
  }
  if (status === 'completed') return 'Completado';
  if (status === 'pending') return 'Pendiente';
  if (status === 'in_progress') return 'En curso';
  return 'Asignado';
}

type PatientProcessTimelineProps = {
  items: ProcessTimelineItem[];
  loading?: boolean;
};

export default function PatientProcessTimeline({ items, loading }: PatientProcessTimelineProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Cargando tu proceso…
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <ol className="relative border-l border-gray-200 ml-3 space-y-8">
      {items.map((item) => {
        const dateLabel = formatTimelineDate(item.date);
        return (
          <li key={item.id} className="ml-6">
            <span className="absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200">
              <StatusIcon status={item.status} kind={item.kind} />
            </span>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {statusLabel(item.status, item.kind)}
                </span>
                {dateLabel ? (
                  <span className="text-xs text-gray-400">{dateLabel}</span>
                ) : null}
              </div>
              <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
              {item.subtitle ? (
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.subtitle}</p>
              ) : null}
              {item.ctaHref && item.ctaLabel ? (
                <div className="mt-3">
                  <Link
                    href={item.ctaHref}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors"
                  >
                    {item.ctaLabel}
                  </Link>
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}