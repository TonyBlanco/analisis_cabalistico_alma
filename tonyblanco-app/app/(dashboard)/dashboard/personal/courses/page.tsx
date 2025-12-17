'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { useRoleGuard } from '@/lib/role-guards';
import { BookOpen, Lock } from 'lucide-react';

/**
 * Personal Courses Page
 * 
 * Shows available courses for personal users (locked placeholder).
 */
export default function PersonalCoursesPage() {
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

  // Placeholder courses
  const courses = [
    {
      id: 1,
      title: 'Fundamentos de la numerología cabalística',
      description: 'Aprende los conceptos básicos y avanza en tu comprensión',
      level: 'Principiante',
      duration: '4 semanas',
    },
    {
      id: 2,
      title: 'Los 72 ángeles: Guía práctica',
      description: 'Explora el significado y aplicación de los ángeles cabalísticos',
      level: 'Intermedio',
      duration: '6 semanas',
    },
    {
      id: 3,
      title: 'Autoconocimiento profundo',
      description: 'Técnicas avanzadas para el crecimiento personal',
      level: 'Avanzado',
      duration: '8 semanas',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Cursos
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Cursos estructurados para profundizar en tu conocimiento cabalístico
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="border border-gray-300 rounded-lg p-5 bg-gray-50 opacity-75"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{course.level}</span>
                  <span>•</span>
                  <span>{course.duration}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lock className="w-4 h-4" />
                <span>Disponible con acompañamiento profesional</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

