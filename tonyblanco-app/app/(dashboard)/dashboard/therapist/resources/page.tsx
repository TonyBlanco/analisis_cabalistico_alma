'use client';

import { useState } from 'react';
import { Menu, Headphones, Play, BookOpen, GraduationCap, Sparkles } from 'lucide-react';
import ContextualSlideMenu from '@/components/ContextualSlideMenu';

/**
 * Recursos - Panel Terapeuta
 * 
 * Vista principal: Catálogo general
 * Slide contextual: Categorías de recursos
 */
export default function TherapistResourcesPage() {
  const [slideOpen, setSlideOpen] = useState(false);

  const resourceCategories = [
    {
      id: 'audios',
      label: 'Audios',
      icon: <Headphones className="h-4 w-4" />,
      href: '/dashboard/therapist/resources/audios',
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: <Play className="h-4 w-4" />,
      href: '/dashboard/therapist/resources/videos',
    },
    {
      id: 'courses',
      label: 'Cursos',
      icon: <GraduationCap className="h-4 w-4" />,
      href: '/dashboard/therapist/resources/courses',
    },
    {
      id: 'meditations',
      label: 'Meditaciones',
      icon: <Sparkles className="h-4 w-4" />,
      href: '/dashboard/therapist/resources/meditations',
    },
    {
      id: 'kabbalah',
      label: 'Cábala',
      icon: <BookOpen className="h-4 w-4" />,
      href: '/dashboard/therapist/resources/kabbalah',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Recursos
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Catálogo de recursos disponibles
            </p>
          </div>
          <button
            onClick={() => setSlideOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Resource Catalog */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">
            Catálogo de recursos (en desarrollo)
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Los recursos aparecerán aquí organizados por categoría
          </p>
        </div>
      </div>

      {/* Contextual Slide Menu - Categorías */}
      <ContextualSlideMenu
        isOpen={slideOpen}
        onClose={() => setSlideOpen(false)}
        title="Recursos"
        items={resourceCategories.map((cat) => ({
          id: cat.id,
          label: cat.label,
          icon: cat.icon,
          href: cat.href,
        }))}
      />
    </div>
  );
}
