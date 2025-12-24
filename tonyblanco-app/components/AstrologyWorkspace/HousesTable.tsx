import type { NatalChartPayload } from '@/hooks/useNatalChart';

interface HousesTableProps {
  casas: NatalChartPayload['casas'];
}

/**
 * Tabla de casas astrológicas con sus cúspides.
 * Datos provenientes directamente del backend.
 */
export default function HousesTable({ casas }: HousesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Casa
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Signo
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Cúspide (grados)
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Longitud eclíptica
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {casas.map((casa) => (
            <tr key={casa.numero} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                Casa {casa.numero}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {casa.signo}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {casa.cuspide_grados.toFixed(2)}°
              </td>
              <td className="px-4 py-2 text-sm text-gray-500">
                {casa.cuspide_longitud.toFixed(2)}°
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
