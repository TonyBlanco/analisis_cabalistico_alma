'use client';

import { Suspense } from 'react';
import MSHEClinicalModule from '@/components/clinical/MSHEClinicalModule';

export default function MSHEPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Motor de Síntesis Holística Evaluativa
          </h1>
          <p className="mt-2 text-gray-600">
            Evaluación simbólica automática · IA asistida · No clínica
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-8">Cargando...</div>}>
          <MSHEClinicalModule />
        </Suspense>
      </div>
    </div>
  );
}