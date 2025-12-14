'use client';

import { useRouter } from 'next/navigation';
import { Hexagon, ArrowLeft } from 'lucide-react';
import TherapistRoute from '@/components/TherapistRoute';

export default function TikunPage() {
  const router = useRouter();

  return (
    <TherapistRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/therapist')}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Análisis de Tikún</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Identificación de la corrección del alma y misión de vida
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 mb-6">
                <Hexagon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Análisis de Tikún</h2>
            <p className="text-lg text-gray-600 mb-2">
              Módulo Avanzado: Próximamente integración del motor de cálculo
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Este módulo identificará el Tikún (corrección) específico del alma del paciente,
              revelando su misión de vida y los desafíos espirituales que debe superar.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-emerald-900 mb-3">Funcionalidades planificadas:</h3>
              <ul className="space-y-2 text-sm text-emerald-800">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>Identificación del Tikún del alma basado en datos personales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>Análisis de la misión de vida y propósito espiritual</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>Recomendaciones de trabajo espiritual y corrección</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>Seguimiento del progreso en el camino de corrección</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </TherapistRoute>
  );
}

