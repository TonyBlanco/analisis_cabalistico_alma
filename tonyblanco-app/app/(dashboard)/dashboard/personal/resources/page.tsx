'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';
import { Book, Music, Video, FileText, Lock } from 'lucide-react';

/**
 * Personal Resources Page
 * 
 * Central hub for all resources (audios, videos, PDFs, etc.).
 */
export default function PersonalResourcesPage() {
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

  const resourceCategories = [
    {
      id: 'audios',
      title: 'Audios',
      description: 'Meditaciones, afirmaciones y contenido de audio',
      icon: Music,
      href: '/dashboard/personal/audios',
      count: 4,
      color: 'blue',
    },
    {
      id: 'videos',
      title: 'Videos',
      description: 'Contenido educativo y guías prácticas',
      icon: Video,
      href: '/dashboard/personal/videos',
      count: 4,
      color: 'red',
    },
    {
      id: 'courses',
      title: 'Cursos',
      description: 'Cursos estructurados de profundización',
      icon: Book,
      href: '/dashboard/personal/courses',
      count: 3,
      color: 'purple',
      locked: true,
    },
    {
      id: 'documents',
      title: 'Documentos',
      description: 'Guías, e-books y material de lectura',
      icon: FileText,
      href: '#',
      count: 0,
      color: 'gray',
      locked: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Recursos
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Explora nuestro catálogo de contenido para tu crecimiento personal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resourceCategories.map((category) => {
          const Icon = category.icon;
          const isLocked = category.locked;

          return (
            <div
              key={category.id}
              onClick={() => !isLocked && router.push(category.href)}
              className={`border rounded-lg p-6 transition-all ${
                isLocked
                  ? 'border-gray-300 bg-gray-50 opacity-75 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    category.color === 'blue'
                      ? 'bg-blue-100'
                      : category.color === 'red'
                      ? 'bg-red-100'
                      : category.color === 'purple'
                      ? 'bg-purple-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      category.color === 'blue'
                        ? 'text-blue-600'
                        : category.color === 'red'
                        ? 'text-red-600'
                        : category.color === 'purple'
                        ? 'text-purple-600'
                        : 'text-gray-600'
                    }`}
                  />
                </div>
                {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{category.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>

              <div className="flex items-center justify-between text-sm">
                {!isLocked ? (
                  <>
                    <span className="text-gray-500">{category.count} recursos</span>
                    <span className="text-indigo-600 font-medium">Ver todos →</span>
                  </>
                ) : (
                  <span className="text-gray-500 text-xs">Disponible con acompañamiento</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
