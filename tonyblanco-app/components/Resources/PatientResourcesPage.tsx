'use client';

import { useState, useEffect } from 'react';
import { getResources, Resource } from '@/lib/resources-api';
import ResourceCard from './ResourceCard';

/**
 * Patient Resources Page
 * 
 * Allows patients to:
 * - View free resources
 * - View assigned resources
 * - Access resources (read-only)
 */
export default function PatientResourcesPage() {
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);

    try {
      // Backend should filter: free + assigned to current patient
      const data = await getResources();
      setAllResources(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar recursos';
      setError(errorMessage);
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter: free resources + assigned resources
  const visibleResources = allResources.filter(
    (resource) => resource.access_level === 'free' || resource.access_level === 'assigned'
  );

  // Separate free and assigned
  const freeResources = visibleResources.filter((r) => r.access_level === 'free');
  const assignedResources = visibleResources.filter((r) => r.access_level === 'assigned');

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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Mis Recursos
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Recursos gratuitos y asignados por tu terapeuta
        </p>
      </div>

      {/* Assigned Resources Section */}
      {assignedResources.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recursos asignados por tu terapeuta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                therapistNotes={resource.therapist_notes || undefined}
                readOnly={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Free Resources Section */}
      {freeResources.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recursos gratuitos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                readOnly={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {visibleResources.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-sm mb-2">
            No tienes recursos disponibles
          </p>
          <p className="text-gray-400 text-xs">
            Tu terapeuta puede asignarte recursos que aparecerán aquí
          </p>
        </div>
      )}
    </div>
  );
}
