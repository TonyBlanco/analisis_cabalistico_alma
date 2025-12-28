'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';
import { getTherapistPatients, Patient } from '@/lib/patient-api';
import CreatePatientModal from '@/components/CreatePatientModal';

/**
 * Therapist Patients Management Page
 * 
 * A) Patient Creation (Therapist Only)
 * - Lists patients assigned to therapist
 * - Button: "Crear Consultante"
 */
export default function TherapistPatientsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      setLoading(false);
      
      if (!userRole || (userRole !== 'therapist' && userRole !== 'admin')) {
        router.replace('/dashboard');
      }
    });
  }, [router]);

  useEffect(() => {
    if (role === 'therapist' || role === 'admin') {
      fetchPatients();
    }
  }, [role]);

  useRoleGuard({
    currentUserRole: role as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['therapist', 'admin'],
    redirectTo: '/dashboard',
  });

  const fetchPatients = async () => {
    setLoadingPatients(true);
    setError(null);

    try {
      const data = await getTherapistPatients();
      setPatients(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar consultantes';
      setError(errorMessage);
      console.error('Error fetching patients:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handlePatientCreated = () => {
    // Refresh patient list
    fetchPatients();
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (role !== 'therapist' && role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Gestión de Consultantes
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Administra los consultantes asignados a tu cuenta
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity shadow-sm"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            Crear Consultante
          </button>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Consultantes</h2>

        {loadingPatients ? (
          <div className="text-center py-12">
            <div className="inline-block animate-pulse">
              <div className="h-2 w-32 bg-gray-200 rounded mb-2"></div>
              <p className="text-sm text-gray-500 mt-2">Cargando consultantes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={fetchPatients}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Reintentar
            </button>
          </div>
        ) : patients.length === 0 ? (
          <div className="border border-gray-200 border-dashed rounded-lg p-12 text-center">
            <p className="text-gray-500 text-sm">
              No tienes consultantes registrados aún.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Haz clic en "Crear Consultante" para comenzar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => router.push(`/dashboard/therapist/patients/${patient.id}`)}
                className="cursor-pointer border border-gray-200 rounded-md p-4 hover:border-gray-300 hover:shadow-sm hover:bg-gray-50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{patient.full_name}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">{patient.email}</p>
                      {patient.phone && (
                        <p className="text-sm text-gray-600">{patient.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {patient.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Patient Modal */}
      <CreatePatientModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handlePatientCreated}
      />
    </div>
  );
}
