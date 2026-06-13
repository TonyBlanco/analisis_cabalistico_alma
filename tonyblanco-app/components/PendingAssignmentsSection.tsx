/**
 * PendingAssignmentsSection
 *
 * Shows pending patient tests using the same source of truth as the Tests tab:
 * UserTestAccess (has_special_access) minus completed results.
 */

'use client';

import { Clock, CheckCircle, Loader2, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePatientPendingTests } from '@/lib/usePatientPendingTests';

export default function PendingAssignmentsSection() {
  const router = useRouter();
  const { pendingTests, loading, error, refresh } = usePatientPendingTests();

  const handleStartTest = (route: string | null) => {
    if (route) {
      router.push(route);
      return;
    }
    router.push('/dashboard/patient/tests');
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Tests Pendientes</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Tests Pendientes</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={refresh}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (pendingTests.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Tests Pendientes</h2>
        </div>
        <p className="text-sm text-gray-600">No tienes tests pendientes en este momento.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Tests Pendientes ({pendingTests.length})
        </h2>
      </div>

      <div className="space-y-3">
        {pendingTests.map((test) => (
          <div
            key={`${test.id}-${test.code}`}
            className="border border-gray-200 rounded-md p-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium text-gray-900">{test.name}</h3>
                </div>
                {test.description ? (
                  <p className="text-sm text-gray-600">{test.description}</p>
                ) : null}
              </div>

              <button
                onClick={() => handleStartTest(test.route)}
                className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                Comenzar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}