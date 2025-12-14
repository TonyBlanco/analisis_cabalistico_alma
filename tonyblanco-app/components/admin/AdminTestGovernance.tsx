'use client';

import { useState, useEffect } from 'react';
import { getTestModules, TestModule } from '@/lib/admin-api';
import { ClipboardList, CheckCircle, XCircle, Lock } from 'lucide-react';

/**
 * Sección de Gestión de Tests
 */
export default function AdminTestGovernance() {
  const [testModules, setTestModules] = useState<TestModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestModules();
  }, []);

  const loadTestModules = async () => {
    try {
      setLoading(true);
      const data = await getTestModules();
      setTestModules(data);
    } catch (error) {
      console.error('Error loading test modules:', error);
      alert('Error al cargar módulos de tests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Cargando módulos de tests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Gestión de Módulos de Tests</h2>
        <div className="text-sm text-gray-600">
          Total: {testModules.length} módulo{testModules.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tests Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {testModules.filter((t) => t.is_active).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Requieren Licencia</p>
              <p className="text-2xl font-bold text-gray-900">
                {testModules.filter((t) => t.requires_license).length}
              </p>
            </div>
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Para Terapeutas</p>
              <p className="text-2xl font-bold text-gray-900">
                {testModules.filter((t) => t.available_for_therapists).length}
              </p>
            </div>
            <ClipboardList className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Para Personales</p>
              <p className="text-2xl font-bold text-gray-900">
                {testModules.filter((t) => t.available_for_personal).length}
              </p>
            </div>
            <ClipboardList className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Lista de Tests */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Módulo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Acceso Requerido
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Disponibilidad
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {testModules.length > 0 ? (
                testModules.map((module) => (
                  <tr key={module.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{module.name}</p>
                      <p className="text-sm text-gray-500">{module.description}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{module.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{module.test_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {module.required_access_level}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {module.available_for_therapists && (
                          <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            Terapeutas
                          </span>
                        )}
                        {module.available_for_personal && (
                          <span className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                            Personales
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          module.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {module.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Inactivo
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No hay módulos de tests disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Gestión Completa:</strong> Para activar/desactivar módulos, cambiar límites de uso,
          o configurar accesos, utiliza el panel de administración de Django.
        </p>
      </div>
    </div>
  );
}
