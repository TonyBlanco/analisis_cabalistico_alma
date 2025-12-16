'use client';

import { useState } from 'react';
import { Menu, Sparkles, FileText, Calendar, TestTube } from 'lucide-react';
import ContextualSlideMenu from '@/components/ContextualSlideMenu';

/**
 * Análisis - Panel Terapeuta
 * 
 * Vista principal: Tarjetas de categorías
 * Slide contextual: Tipos específicos de análisis por categoría
 */
export default function TherapistAnalysesPage() {
  const [slideOpen, setSlideOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'clinical',
      title: 'Clínicos',
      description: 'Tests y evaluaciones clínicas',
      icon: <TestTube className="h-8 w-8" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      items: [
        { id: 'scdf', label: 'SCDF', href: '/dashboard/therapist/analyses/clinical/scdf' },
        { id: 'pai', label: 'PAI', href: '/dashboard/therapist/analyses/clinical/pai' },
        { id: 'scl90', label: 'SCL-90', href: '/dashboard/therapist/analyses/clinical/scl90' },
        { id: 'integrative', label: 'Entrevista Integrativa', href: '/dashboard/therapist/analyses/clinical/integrative' },
      ],
    },
    {
      id: 'kabbalah',
      title: 'Cabalísticos',
      description: 'Análisis cabalísticos del alma',
      icon: <Sparkles className="h-8 w-8" />,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      items: [
        { id: 'name', label: 'Nombre', href: '/dashboard/therapist/analyses/kabbalah/name' },
        { id: 'tree', label: 'Árbol del Alma', href: '/dashboard/therapist/analyses/kabbalah/tree' },
        { id: 'tikun', label: 'Tikún', href: '/dashboard/therapist/analyses/kabbalah/tikun' },
        { id: 'compatibility', label: 'Compatibilidades', href: '/dashboard/therapist/analyses/kabbalah/compatibility' },
      ],
    },
    {
      id: 'astrology',
      title: 'Astrológicos',
      description: 'Análisis astrológicos con Kerykeion',
      icon: <Calendar className="h-8 w-8" />,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      items: [
        { id: 'natal', label: 'Carta Natal', href: '/dashboard/therapist/analyses/astrology/natal' },
        { id: 'transits', label: 'Tránsitos', href: '/dashboard/therapist/analyses/astrology/transits' },
        { id: 'synastry', label: 'Sinastría', href: '/dashboard/therapist/analyses/astrology/synastry' },
      ],
    },
    {
      id: 'legacy',
      title: 'Legacy',
      description: 'Análisis tradicionales',
      icon: <FileText className="h-8 w-8" />,
      color: 'bg-gray-50 border-gray-200 text-gray-700',
      items: [
        { id: 'numerology', label: 'Numerología', href: '/dashboard/therapist/analyses/legacy/numerology' },
        { id: 'tarot', label: 'Tarot', href: '/dashboard/therapist/analyses/legacy/tarot' },
      ],
    },
  ];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSlideOpen(true);
  };

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Análisis
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Ejecuta análisis clínicos, cabalísticos y astrológicos
            </p>
          </div>
          <button
            onClick={() => {
              // En móvil, abrir slide menu
              setSlideOpen(true);
            }}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`${category.color} border-2 rounded-lg p-6 text-left hover:shadow-md transition-shadow`}
          >
            <div className="mb-3">{category.icon}</div>
            <h3 className="text-lg font-semibold mb-1">{category.title}</h3>
            <p className="text-sm opacity-75">{category.description}</p>
          </button>
        ))}
      </div>

      {/* Contextual Slide Menu */}
      {selectedCategoryData && (
        <ContextualSlideMenu
          isOpen={slideOpen}
          onClose={() => {
            setSlideOpen(false);
            setSelectedCategory(null);
          }}
          title={selectedCategoryData.title}
          items={selectedCategoryData.items.map((item) => ({
            id: item.id,
            label: item.label,
            href: item.href,
          }))}
        />
      )}
    </div>
  );
}
