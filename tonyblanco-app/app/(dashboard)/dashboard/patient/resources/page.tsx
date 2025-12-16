'use client';

import { useEffect, useState } from 'react';
import { useRoleGuard } from '@/lib/role-guards';
import { Music, Video, Headphones, GraduationCap, Sparkles, BookOpen, Lock } from 'lucide-react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  locked?: boolean;
}

const CATEGORIES: ResourceCategory[] = [
  {
    id: 'audios',
    name: 'Audios',
    description: 'Meditaciones guiadas y audios terapéuticos',
    icon: Music,
    color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
  },
  {
    id: 'videos',
    name: 'Videos',
    description: 'Contenido educativo y tutoriales',
    icon: Video,
    color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
  },
  {
    id: 'meditaciones',
    name: 'Meditaciones',
    description: 'Sesiones de meditación y mindfulness',
    icon: Headphones,
    color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
  },
  {
    id: 'cursos',
    name: 'Cursos',
    description: 'Cursos de desarrollo personal y espiritual',
    icon: GraduationCap,
    color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
    locked: true,
  },
  {
    id: 'cabala',
    name: 'Cábala',
    description: 'Recursos sobre cábala aplicada',
    icon: Sparkles,
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
  },
  {
    id: 'desarrollo-personal',
    name: 'Desarrollo Personal',
    description: 'Materiales para crecimiento personal',
    icon: BookOpen,
    color: 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100',
  },
];

/**
 * Patient Resources Page
 *
 * Route: /dashboard/patient/resources
 *
 * Shows patient's assigned resources in a category grid.
 * Patient-only access.
 * Visual gating only (no payments implemented).
 */
export default function PatientResourcesPage() {
  const { role, loading: roleLoading, authorized } = useRoleGuard({
    allowedRoles: ['patient'],
    redirectTo: '/login',
  });

  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authorized && role === 'patient') {
      fetchResources();
    }
  }, [authorized, role]);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        throw new Error('No autenticado');
      }

      // Try to fetch resources from backend (if endpoint exists)
      const response = await fetch(`${API_URL}/resources/my/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || data || []);
      } else if (response.status === 404) {
        // Endpoint doesn't exist yet - that's okay, show empty state
        setResources([]);
      } else {
        // Other error - log but don't break
        console.warn('Error fetching resources:', response.status);
        setResources([]);
      }
    } catch (err) {
      // Network error or endpoint doesn't exist - that's okay
      console.warn('Resources endpoint not available:', err);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: ResourceCategory) => {
    if (category.locked) {
      alert('Esta categoría estará disponible próximamente.');
      return;
    }

    // For now, just show a message
    // In the future, this would navigate to category detail or filter view
    alert(`Accediendo a recursos de ${category.name}. Esta funcionalidad estará disponible próximamente.`);
  };

  if (roleLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cargando recursos...</p>
        </div>
      </div>
    );
  }

  if (!authorized || role !== 'patient') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm text-red-500">No tienes acceso a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">Recursos</h1>
        <p className="text-sm text-gray-600">
          Recursos asignados por tu terapeuta y materiales educativos disponibles.
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isLocked = category.locked === true;

          return (
            <div
              key={category.id}
              onClick={() => !isLocked && handleCategoryClick(category)}
              className={`
                ${category.color}
                border-2 rounded-lg p-6 cursor-pointer transition-all duration-200
                ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md'}
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${isLocked ? 'bg-gray-200' : 'bg-white/50'}`}>
                    <Icon className={`w-6 h-6 ${isLocked ? 'text-gray-500' : ''}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    {isLocked && (
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Lock className="w-3 h-3" />
                        Próximamente
                      </span>
                    )}
                  </div>
                </div>
                {isLocked && (
                  <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm opacity-80">{category.description}</p>
            </div>
          );
        })}
      </div>

      {/* Resources List (if any) */}
      {resources.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recursos Asignados</h2>
          <div className="space-y-3">
            {resources.map((resource: any) => (
              <div
                key={resource.id}
                className="border border-gray-200 rounded-md p-4 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <h3 className="font-medium text-gray-900">{resource.title || resource.name}</h3>
                {resource.description && (
                  <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state (if no resources and no categories are available) */}
      {resources.length === 0 && !loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-sm">
            Selecciona una categoría para explorar los recursos disponibles.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Tu terapeuta puede asignarte recursos específicos que aparecerán aquí.
          </p>
        </div>
      )}
    </div>
  );
}
