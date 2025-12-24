import type { NatalChartPayload } from '@/hooks/useNatalChart';

interface PlanetsTableProps {
  planetas: NatalChartPayload['planetas'];
}

const PLANET_NAMES: Record<string, string> = {
  sun: 'Sol',
  moon: 'Luna',
  mercury: 'Mercurio',
  venus: 'Venus',
  mars: 'Marte',
  jupiter: 'Júpiter',
  saturn: 'Saturno',
  uranus: 'Urano',
  neptune: 'Neptuno',
  pluto: 'Plutón',
};

/**
 * Tabla de planetas con sus posiciones.
 * Datos provenientes directamente del backend.
 */
export default function PlanetsTable({ planetas }: PlanetsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Planeta
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Signo
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Grados
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Casa
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {planetas.map((planeta) => (
            <tr key={planeta.nombre} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                {PLANET_NAMES[planeta.nombre] || planeta.nombre}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {planeta.signo}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {planeta.grados.toFixed(2)}°
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                Casa {planeta.casa}
              </td>
              <td className="px-4 py-2 text-sm">
                {planeta.es_retrogrado ? (
                  <span className="text-red-600 font-medium">Retrógrado</span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
