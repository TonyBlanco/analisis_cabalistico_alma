'use client';

import { AlertCircle } from 'lucide-react';
import { useTherapistReports } from '@/hooks/useTherapistReports';
import TherapistReportsPanel, {
  TherapistReportsEmpty,
  TherapistReportsSkeleton,
} from '@/components/therapist/TherapistReportsPanel';

export default function TherapistReportsPage() {
  const { data, status, error, isEmpty, refetch } = useTherapistReports();

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TherapistReportsSkeleton />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>No se pudieron cargar los reportes: {error}</span>
          <button
            type="button"
            onClick={refetch}
            className="ml-auto rounded-md border border-red-300 px-3 py-1 text-xs hover:bg-red-100"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (isEmpty || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TherapistReportsEmpty />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TherapistReportsPanel data={data} />
    </div>
  );
}