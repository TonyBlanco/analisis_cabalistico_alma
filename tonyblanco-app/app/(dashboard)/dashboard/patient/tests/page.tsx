'use client';

import PatientAssignedTestsSection from '@/components/PatientAssignedTestsSection';

export default function PatientTestsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Tests asignados</h1>
        <p className="text-gray-600">Completa los tests que tu terapeuta ha preparado para ti.</p>
      </div>

      <PatientAssignedTestsSection />
    </div>
  );
}
