'use client';

import { useState, useEffect } from 'react';
import { 
  getResources, 
  assignResourceToPatient, 
  unassignResourceFromPatient,
  Resource 
} from '@/lib/resources-api';
import { getActivePatient } from '@/lib/active-patient';
import ResourceCard from './ResourceCard';
import AssignResourceModal from './AssignResourceModal';

/**
 * Therapist Resources Page
 * 
 * Allows therapist to:
 * - View all resources
 * - Assign resources to patients
 * - See assigned resources with notes
 * - Manage resource assignments
 */
export default function TherapistResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [activePatient] = useState(() => getActivePatient());

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getResources();
      setResources(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar recursos';
      setError(errorMessage);
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (resourceId: number) => {
    const resource = resources.find((r) => r.id === resourceId);
    if (resource) {
      setSelectedResource(resource);
      setAssignModalOpen(true);
    }
  };

  const handleAssignConfirm = async (patientId: number, notes: string) => {
    if (!selectedResource) return;

    try {
      await assignResourceToPatient(selectedResource.id, patientId, notes);
      // Refresh resources list
      await fetchResources();
      setAssignModalOpen(false);
      setSelectedResource(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al asignar recurso';
      alert(errorMessage);
      console.error('Error assigning resource:', err);
    }
  };

  const handleUnassign = async (resourceId: number) => {
    if (!activePatient) {
      alert('Debes seleccionar un paciente activo primero');
      return;
    }

    if (!confirm('¿Desasignar este recurso del paciente?')) {
      return;
    }

    try {
      await unassignResourceFromPatient(resourceId, activePatient.id);
      await fetchResources();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al desasignar recurso';
      alert(errorMessage);
      console.error('Error unassigning resource:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando recursos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ El módulo de recursos está en desarrollo. Los endpoints del backend aún no están disponibles.
            </p>
            <p className="text-xs text-yellow-700 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter resources for active patient assignment view
  const assignedToActivePatient = activePatient
    ? resources.filter((r) => r.assigned_to?.includes(activePatient.id))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Recursos
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Gestiona y asigna recursos educativos a tus pacientes
            </p>
          </div>
        </div>
        {activePatient && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Paciente activo: <span className="font-medium text-gray-900">{activePatient.name}</span>
            </p>
            {assignedToActivePatient.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {assignedToActivePatient.length} recurso(s) asignado(s) a este paciente
              </p>
            )}
          </div>
        )}
      </div>

      {/* Resources List */}
      {resources.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-sm mb-2">
            No hay recursos disponibles
          </p>
          <p className="text-gray-400 text-xs">
            Los recursos aparecerán aquí una vez que estén disponibles
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => {
            const isAssignedToActive = activePatient
              ? resource.assigned_to?.includes(activePatient.id)
              : false;

            return (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onAssign={handleAssignClick}
                onUnassign={isAssignedToActive ? handleUnassign : undefined}
                showAssignButton={true}
                showUnassignButton={isAssignedToActive}
                therapistNotes={
                  isAssignedToActive && resource.therapist_notes
                    ? resource.therapist_notes
                    : undefined
                }
              />
            );
          })}
        </div>
      )}

      {/* Assign Resource Modal */}
      {selectedResource && (
        <AssignResourceModal
          open={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedResource(null);
          }}
          onConfirm={handleAssignConfirm}
          resourceTitle={selectedResource.title}
        />
      )}
    </div>
  );
}
