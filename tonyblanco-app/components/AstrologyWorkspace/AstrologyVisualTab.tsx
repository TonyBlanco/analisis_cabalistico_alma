'use client';

import { useNatalChart } from '@/hooks/useNatalChart';
import NatalChartWheel from './NatalChartWheel';
import PlanetsTable from './PlanetsTable';
import HousesTable from './HousesTable';
import AspectsTable from './AspectsTable';
import { AlertCircle, Loader2 } from 'lucide-react';

interface AstrologyVisualTabProps {
  patientId: string | undefined;
}

/**
 * Tab Visual del workspace de Astrología.
 * 
 * ESTADOS:
 * 1. LOADING: Cargando datos
 * 2. EMPTY: Sin carta calculada (404)
 * 3. READY: Carta disponible con visualización
 * 4. ERROR: Error al cargar o calcular
 * 
 * COMPORTAMIENTO:
 * - GET automático al montar
 * - Botón para calcular (POST) si no hay carta
 * - Validación de campos faltantes con mensaje claro
 */
export default function AstrologyVisualTab({ patientId }: AstrologyVisualTabProps) {
  const { chart, loading, error, missingFields, calculateChart } = useNatalChart(patientId);

  // ESTADO 1: LOADING
  if (loading) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          <p className="text-gray-600">Cargando carta natal…</p>
        </div>
      </section>
    );
  }

  // ESTADO 4: ERROR
  if (error && !missingFields) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="text-center">
            <p className="text-red-600 font-medium mb-2">Error al cargar carta natal</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // ESTADO 2: EMPTY (sin carta calculada)
  if (!chart && !loading) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Astrología (Visual)</h3>
            <p className="text-xs text-gray-500">
              Representación astrológica observacional. No constituye diagnóstico ni predicción.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          {missingFields && missingFields.length > 0 ? (
            // Error de campos faltantes
            <>
              <AlertCircle className="h-12 w-12 text-amber-500" />
              <div className="text-center max-w-md">
                <p className="text-gray-900 font-medium mb-2">
                  Faltan datos en el perfil del paciente
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Los siguientes campos son requeridos para calcular la carta natal:
                </p>
                <ul className="text-sm text-left space-y-1 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  {missingFields.map((field) => (
                    <li key={field} className="text-amber-800">
                      • {field}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-4">
                  Completa el perfil del paciente antes de calcular la carta natal
                </p>
              </div>
            </>
          ) : (
            // Estado inicial sin carta
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium mb-2">
                  Este paciente aún no tiene una carta natal calculada
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Calcula la carta natal a partir de los datos del perfil del paciente
                </p>
              </div>
              
              <button
                onClick={calculateChart}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Calculando…' : 'Calcular carta natal'}
              </button>
            </>
          )}
        </div>
      </section>
    );
  }

  // ESTADO 3: READY (carta disponible)
  if (!chart) {
    return null;
  }

  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Astrología (Visual)</h3>
          <p className="text-xs text-gray-500">
            Representación astrológica observacional. No constituye diagnóstico ni predicción.
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>Calculada: {chart.metadatos?.calculated_at ? new Date(chart.metadatos.calculated_at).toLocaleString('es-ES') : '—'}</p>
          <p>Sistema: {chart.metadatos?.sistema_casas || '—'}</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Rueda de carta natal */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Carta Natal</h4>
          <NatalChartWheel chart={chart} />
        </div>

        {/* Tabla de planetas */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">
              Planetas ({chart.planetas.length})
            </h4>
          </div>
          <PlanetsTable planetas={chart.planetas} />
        </div>

        {/* Tabla de casas */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">
              Casas ({chart.casas.length})
            </h4>
          </div>
          <HousesTable casas={chart.casas} />
        </div>

        {/* Tabla de aspectos */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">
              Aspectos ({chart.aspectos.length})
            </h4>
          </div>
          <AspectsTable aspectos={chart.aspectos} />
        </div>
      </div>

      {/* Mensaje de gobernanza (obligatorio) */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900 text-center">
          Representación astrológica observacional.<br />
          No constituye diagnóstico ni predicción.
        </p>
      </div>
    </section>
  );
}
