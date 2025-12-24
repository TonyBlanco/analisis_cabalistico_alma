import type { NatalChartPayload } from '@/hooks/useNatalChart';

interface AspectsTableProps {
  aspectos: NatalChartPayload['aspectos'];
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

const ASPECT_NAMES: Record<string, string> = {
  conjunction: 'Conjunción',
  opposition: 'Oposición',
  trine: 'Trígono',
  square: 'Cuadratura',
  sextile: 'Sextil',
  quincunx: 'Quincuncio',
  semisextile: 'Semisextil',
  semisquare: 'Semicuadratura',
  sesquiquadrate: 'Sesquicuadratura',
};

/**
 * Tabla de aspectos planetarios.
 * Datos provenientes directamente del backend.
 */
export default function AspectsTable({ aspectos }: AspectsTableProps) {
  // Mostrar solo primeros 20 aspectos para no saturar la vista
  const displayedAspects = aspectos.slice(0, 20);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Planeta 1
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Aspecto
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Planeta 2
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Orbe
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Tipo
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayedAspects.map((aspecto, idx) => (
            <tr key={`${aspecto.planeta1}-${aspecto.planeta2}-${idx}`} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                {PLANET_NAMES[aspecto.planeta1] || aspecto.planeta1}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {ASPECT_NAMES[aspecto.tipo] || aspecto.tipo}
              </td>
              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                {PLANET_NAMES[aspecto.planeta2] || aspecto.planeta2}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {aspecto.orbe.toFixed(2)}°
              </td>
              <td className="px-4 py-2 text-sm">
                {aspecto.es_aplicativo ? (
                  <span className="text-blue-600">Aplicativo</span>
                ) : (
                  <span className="text-gray-400">Separativo</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {aspectos.length > 20 && (
        <div className="px-4 py-2 text-xs text-gray-500 text-center bg-gray-50">
          Mostrando 20 de {aspectos.length} aspectos
        </div>
      )}
    </div>
  );
}
