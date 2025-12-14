'use client';

import { useState, useEffect } from 'react';
import { getAdminUsers, AdminUser } from '@/lib/admin-api';
import { Activity, Award, Users } from 'lucide-react';

/**
 * Sección de Gestión de Terapeutas y Licencias
 */
export default function AdminTherapistsGovernance() {
  const [therapists, setTherapists] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      setLoading(true);
      const allUsers = await getAdminUsers();
      const therapistsData = allUsers.filter((u) => u.profile.user_type === 'therapist');
      setTherapists(therapistsData);
    } catch (error) {
      console.error('Error loading therapists:', error);
      alert('Error al cargar terapeutas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Cargando terapeutas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Terapeutas y Licencias</h2>
        <div className="text-sm text-gray-600">
          Total: {therapists.length} terapeuta{therapists.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Terapeutas Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {therapists.filter((t) => t.is_active).length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Con Membresía Activa</p>
              <p className="text-2xl font-bold text-gray-900">
                {therapists.filter((t) => t.profile.membership_active).length}
              </p>
            </div>
            <Award className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Plan Profesional</p>
              <p className="text-2xl font-bold text-gray-900">
                {therapists.filter((t) => t.profile.subscription_plan === 'professional').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Lista de Terapeutas */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Terapeuta
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Licencia
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Fecha Registro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {therapists.length > 0 ? (
                therapists.map((therapist) => (
                  <tr key={therapist.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{therapist.profile.full_name}</p>
                      <p className="text-sm text-gray-500">@{therapist.username}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{therapist.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {therapist.profile.license_number || 'No registrada'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {therapist.profile.subscription_plan || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          therapist.is_active && therapist.profile.membership_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {therapist.is_active && therapist.profile.membership_active
                          ? 'Activo'
                          : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(therapist.date_joined).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No hay terapeutas registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> La validación de licencias profesionales se gestiona desde Django
          Admin. Para verificar o actualizar licencias, accede al panel de administración de Django.
        </p>
      </div>
    </div>
  );
}
