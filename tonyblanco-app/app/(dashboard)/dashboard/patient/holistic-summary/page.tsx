'use client';

import { Suspense } from 'react';
import PatientHolisticSummary from '@/components/patient/PatientHolisticSummary';

export default function HolisticSummaryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Suspense fallback={<div className="text-center py-8">Cargando...</div>}>
          <PatientHolisticSummary />
        </Suspense>
      </div>
    </div>
  );
}