'use client';

import { useEffect, useState } from 'react';
import { Headphones, Video, BookOpen, Sparkles, Lock } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: 'audio' | 'video' | 'course' | 'meditation';
  access: 'free' | 'assigned' | 'purchased';
  thumbnail?: string;
}

export default function PatientResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch resources from backend (GET /api/resources/my/)
    // Placeholder data
    setResources([
      {
        id: '1',
        title: 'Meditación para el Alma',
        type: 'audio',
        access: 'free',
      },
      {
        id: '2',
        title: 'Introducción a la Cábala',
        type: 'video',
        access: 'assigned',
      },
      {
        id: '3',
        title: 'Curso de Desarrollo Personal',
        type: 'course',
        access: 'purchased',
      },
      {
        id: '4',
        title: 'Meditación Guiada Avanzada',
        type: 'meditation',
        access: 'free',
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-gray-500">Cargando recursos...</p>
        </div>
      </div>
    );
  }

  const categories = [
    { type: 'audio', label: 'Audios', icon: Headphones, color: 'blue' },
    { type: 'video', label: 'Videos', icon: Video, color: 'red' },
    { type: 'course', label: 'Cursos', icon: BookOpen, color: 'purple' },
    { type: 'meditation', label: 'Meditaciones', icon: Sparkles, color: 'violet' },
  ];

  const getAccessBadge = (access: string) => {
    switch (access) {
      case 'free':
        return <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Gratis</span>;
      case 'assigned':
        return <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Recomendado</span>;
      case 'purchased':
        return <span className="px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-700 rounded-full">Adquirido</span>;
      default:
        return null;
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'red': return 'text-red-600';
      case 'purple': return 'text-purple-600';
      case 'violet': return 'text-violet-600';
      default: return 'text-gray-600';
    }
  };

  const getBgColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100';
      case 'red': return 'bg-red-100';
      case 'purple': return 'bg-purple-100';
      case 'violet': return 'bg-violet-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Mis recursos</h1>
        <p className="text-gray-600">
          Accede a audios, videos, meditaciones y cursos de tu proceso personal
        </p>
      </div>

      {/* Categorías */}
      {categories.map((category) => {
        const categoryResources = resources.filter(r => r.type === category.type);
        const Icon = category.icon;

        if (categoryResources.length === 0) return null;

        return (
          <div key={category.type} className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${getIconColor(category.color)}`} />
              <h2 className="text-lg font-semibold text-gray-900">{category.label}</h2>
              <span className="text-sm text-gray-500">({categoryResources.length})</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryResources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:border-violet-300 transition-colors cursor-pointer"
                  onClick={() => {
                    // TODO: Open resource
                    console.log('Open resource:', resource.id);
                  }}
                >
                  <div className={`w-12 h-12 ${getBgColor(category.color)} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${getIconColor(category.color)}`} />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{resource.title}</h3>
                  <div className="flex items-center justify-between">
                    {getAccessBadge(resource.access)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Estado vacío */}
      {resources.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No hay recursos disponibles
          </h3>
          <p className="text-gray-500 text-sm">
            Los recursos aparecerán aquí cuando tu terapeuta te los asigne o los adquieras
          </p>
        </div>
      )}
    </div>
  );
}
