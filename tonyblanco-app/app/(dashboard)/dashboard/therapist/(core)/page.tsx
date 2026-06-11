'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AlertCircle, BarChart3, Calendar, ClipboardList, FileText, Plus, UserPlus } from 'lucide-react';
import { useTherapistMetrics } from '@/hooks/useTherapistMetrics';
import { useTherapistAIUsage } from '@/hooks/useTherapistAIUsage';
import { useTherapistWorkload } from '@/hooks/useTherapistWorkload';
import TherapistWorkloadSection from '@/components/dashboard/TherapistWorkloadSection';

// Lazy-load chart bundle — avoids SSR issues with Chart.js canvas
const MetricsDashboard = dynamic(() => import('@/components/dashboard/MetricsDashboard'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const TherapistAIUsagePanel = dynamic(
  () => import('@/components/dashboard/TherapistAIUsagePanel'),
  { ssr: false, loading: () => <AIUsageSkeleton /> }
);

export default function TherapistDashboardPage() {
  const router = useRouter();
  const { data, status, error, refetch } = useTherapistMetrics();
  const {
    data: aiUsage,
    status: aiUsageStatus,
    error: aiUsageError,
    refetch: refetchAIUsage,
  } = useTherapistAIUsage();
  const {
    workload,
    status: workloadStatus,
    error: workloadError,
    isEmpty: workloadEmpty,
    refetch: refetchWorkload,
  } = useTherapistWorkload();

  return (
    <div className="space-y-8">
      {/* Operational workload */}
      <TherapistWorkloadSection
        workload={workload}
        status={workloadStatus}
        error={workloadError}
        isEmpty={workloadEmpty}
        onRetry={refetchWorkload}
      />

      {/* AI usage */}
      {aiUsageStatus === 'loading' && <AIUsageSkeleton />}

      {aiUsageStatus === 'error' && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>No se pudo cargar el consumo IA: {aiUsageError}</span>
          <button
            type="button"
            onClick={refetchAIUsage}
            className="ml-auto rounded-md border border-amber-300 px-3 py-1 text-xs hover:bg-amber-100"
          >
            Reintentar
          </button>
        </div>
      )}

      {aiUsageStatus === 'success' && aiUsage && (
        <TherapistAIUsagePanel usage={aiUsage} onRefresh={refetchAIUsage} />
      )}

      {/* Metrics section */}
      {status === 'loading' && <ChartSkeleton />}

      {status === 'error' && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>No se pudieron cargar las métricas: {error}</span>
          <button
            type="button"
            onClick={refetch}
            className="ml-auto rounded-md border border-red-300 px-3 py-1 text-xs hover:bg-red-100"
          >
            Reintentar
          </button>
        </div>
      )}

      {status === 'success' && data && <MetricsDashboard metrics={data} />}

      {/* Quick actions */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Acciones rápidas</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            label="Tests modulares"
            icon={<ClipboardList className="h-5 w-5" />}
            colorClass="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            onClick={() => router.push('/tests')}
          />
          <QuickAction
            label="Nuevo paciente"
            icon={<UserPlus className="h-5 w-5" />}
            colorClass="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
            onClick={() => router.push('/dashboard/therapist/patients')}
          />
          <QuickAction
            label="Registrar sesión"
            icon={<Plus className="h-5 w-5" />}
            colorClass="border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            onClick={() => router.push('/dashboard/therapist/sessions/new')}
          />
          <QuickAction
            label="Nuevo análisis"
            icon={<FileText className="h-5 w-5" />}
            colorClass="border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            onClick={() => router.push('/dashboard/therapist/cabala')}
          />
        </div>
      </div>
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

interface QuickActionProps {
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  onClick: () => void;
}

function QuickAction({ label, icon, colorClass, onClick }: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-sm transition-all ${colorClass}`}
    >
      {icon}
      {label}
    </button>
  );
}

function AIUsageSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6" aria-busy="true">
      <div className="mb-4 h-5 w-40 rounded bg-gray-100" />
      <div className="mb-2 h-2.5 rounded-full bg-gray-100" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Cargando métricas">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-gray-100" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-56 rounded-xl bg-gray-100" />
        <div className="h-56 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}
