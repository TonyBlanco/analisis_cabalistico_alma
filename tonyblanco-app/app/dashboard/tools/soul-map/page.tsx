'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft } from 'lucide-react';
import TherapistRoute from '@/components/TherapistRoute';

export default function SoulMapPage() {
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
                <h1 className="text-2xl font-semibold text-gray-900">Mapa del Alma</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Análisis profundo de las Sefirot y el diseño energético del paciente
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 mb-6">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mapa del Alma</h2>
            <p className="text-lg text-gray-600 mb-2">
              Módulo Avanzado: Próximamente integración del motor de cálculo
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Este módulo mostrará el análisis completo de las Sefirot, los bloqueos energéticos
              y el diseño cabalístico del alma del paciente.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-purple-900 mb-3">Funcionalidades planificadas:</h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Visualización interactiva del Árbol de la Vida con las Sefirot activas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Análisis de bloqueos y desequilibrios energéticos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Recomendaciones de meditación y trabajo espiritual</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Historial de evolución del mapa del alma</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </TherapistRoute>
  );
}

