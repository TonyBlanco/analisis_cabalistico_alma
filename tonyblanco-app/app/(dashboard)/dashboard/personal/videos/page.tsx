'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';
import { Video, Lock, Play } from 'lucide-react';

/**
 * Personal Videos Page
 * 
 * Shows available video resources for personal users.
 */
export default function PersonalVideosPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      setLoading(false);
      if (userRole && userRole !== 'personal' && userRole !== 'admin') {
        router.replace('/login');
      }
    });
  }, [router]);

  useRoleGuard({
    currentUserRole: role as 'admin' | 'therapist' | 'personal' | 'patient' | null,
    allowedRoles: ['personal', 'admin'],
    redirectTo: '/login',
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (role !== 'personal' && role !== 'admin') {
    return null;
  }

  // Placeholder video resources
  const videoResources = [
    {
      id: 1,
      title: 'Introducción a la numerología cabalística',
      description: 'Aprende los fundamentos de la numerología desde la perspectiva cabalística',
      duration: '20 min',
      isFree: true,
    },
    {
      id: 2,
      title: 'Cómo interpretar tu mapa personal',
      description: 'Guía paso a paso para entender tu análisis cabalístico',
      duration: '15 min',
      isFree: true,
    },
    {
      id: 3,
      title: 'Los 72 ángeles: Guía completa',
      description: 'Exploración profunda de los ángeles cabalísticos y su significado',
      duration: '60 min',
      isFree: false,
    },
    {
      id: 4,
      title: 'Técnicas avanzadas de autoconocimiento',
      description: 'Herramientas prácticas para profundizar en tu crecimiento personal',
      duration: '45 min',
      isFree: false,
    },
  ];

  const handleVideoClick = (video: typeof videoResources[0]) => {
    if (video.isFree) {
      // TODO: Implement video playback
      alert(`Reproduciendo: ${video.title}`);
    } else {
      alert('Disponible con acompañamiento profesional');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Videos
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Contenido educativo y guías prácticas para tu crecimiento personal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videoResources.map((video) => (
          <div
            key={video.id}
            className={`border rounded-lg p-5 transition-all ${
              video.isFree
                ? 'border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer bg-white'
                : 'border-gray-300 bg-gray-50 opacity-75'
            }`}
            onClick={() => handleVideoClick(video)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Video className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-1">{video.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Play className="w-3 h-3" />
                  <span>{video.duration}</span>
                </div>
              </div>
            </div>
            {!video.isFree && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Disponible con acompañamiento profesional</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

