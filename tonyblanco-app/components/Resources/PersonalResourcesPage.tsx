'use client';

import { useState, useEffect } from 'react';
import { getResources, Resource } from '@/lib/resources-api';
import ResourceCard from './ResourceCard';

/**
 * Personal Resources Page
 * 
 * Allows personal users to:
 * - View free resources only
 * - Access resources (read-only)
 */
export default function PersonalResourcesPage() {
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
      // Backend should filter: free resources only
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

  // Filter: only free resources
  const freeResources = allResources.filter((resource) => resource.access_level === 'free');

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
          Recursos
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Accede a recursos educativos gratuitos
        </p>
      </div>

      {/* Resources List */}
      {freeResources.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-sm mb-2">
            No hay recursos gratuitos disponibles
          </p>
          <p className="text-gray-400 text-xs">
            Los recursos aparecerán aquí una vez que estén disponibles
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freeResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              readOnly={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
