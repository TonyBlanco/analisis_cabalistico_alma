'use client';

import { useEffect } from 'react';
import { X, BookOpen, Lightbulb, Info, Sparkles } from 'lucide-react';

/**
 * Interfaz para una sección de contenido educativo
 */
export interface GuideSection {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  content: React.ReactNode | string;
  color?: 'blue' | 'purple' | 'amber' | 'indigo' | 'emerald' | 'rose';
  examples?: Array<{
    label: string;
    value: string | React.ReactNode;
  }>;
}

interface AnalysisGuideProps {
  /** Controla si el panel está abierto */
  isOpen: boolean;
  /** Función para cerrar el panel */
  onClose: () => void;
  /** Título principal de la guía */
  title: string;
  /** Subtítulo opcional */
  subtitle?: string;
  /** Contenido: puede ser ReactNode, string HTML, o array de secciones estructuradas */
  content: React.ReactNode | string | GuideSection[];
  /** Color de acento para la cabecera (por defecto: amber/dorado) */
  accentColor?: 'amber' | 'blue' | 'purple' | 'emerald' | 'rose';
  /** Ancho máximo del panel (por defecto: max-w-2xl) */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

/**
 * Componente universal para mostrar guías educativas
 * Diseñado para ser reutilizable en Gematria, Mapa del Alma, Tarot, etc.
 * 
 * @example
 * ```tsx
 * <AnalysisGuide
 *   isOpen={showGuide}
 *   onClose={() => setShowGuide(false)}
 *   title="Protocolo de Análisis Gematria"
 *   subtitle="Manual de Interpretación para Terapeutas"
 *   content={guideSections}
 *   accentColor="amber"
 * />
 * ```
 */
export default function AnalysisGuide({
  isOpen,
  onClose,
  title,
  subtitle,
  content,
  accentColor = 'amber',
  maxWidth = '2xl'
}: AnalysisGuideProps) {
  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Mapeo de colores de acento
  const colorClasses = {
    amber: {
      header: 'from-amber-600 to-amber-700',
      headerText: 'text-amber-100',
      iconBg: 'bg-white/20',
      section: {
        blue: 'from-blue-50 to-blue-100 border-blue-200',
        purple: 'from-purple-50 to-purple-100 border-purple-200',
        amber: 'from-amber-50 to-amber-100 border-amber-200',
        indigo: 'from-indigo-50 to-indigo-100 border-indigo-200',
        emerald: 'from-emerald-50 to-emerald-100 border-emerald-200',
        rose: 'from-rose-50 to-rose-100 border-rose-200'
      }
    },
    blue: {
      header: 'from-blue-600 to-blue-700',
      headerText: 'text-blue-100',
      iconBg: 'bg-white/20',
      section: {
        blue: 'from-blue-50 to-blue-100 border-blue-200',
        purple: 'from-purple-50 to-purple-100 border-purple-200',
        amber: 'from-amber-50 to-amber-100 border-amber-200',
        indigo: 'from-indigo-50 to-indigo-100 border-indigo-200',
        emerald: 'from-emerald-50 to-emerald-100 border-emerald-200',
        rose: 'from-rose-50 to-rose-100 border-rose-200'
      }
    },
    purple: {
      header: 'from-purple-600 to-purple-700',
      headerText: 'text-purple-100',
      iconBg: 'bg-white/20',
      section: {
        blue: 'from-blue-50 to-blue-100 border-blue-200',
        purple: 'from-purple-50 to-purple-100 border-purple-200',
        amber: 'from-amber-50 to-amber-100 border-amber-200',
        indigo: 'from-indigo-50 to-indigo-100 border-indigo-200',
        emerald: 'from-emerald-50 to-emerald-100 border-emerald-200',
        rose: 'from-rose-50 to-rose-100 border-rose-200'
      }
    },
    emerald: {
      header: 'from-emerald-600 to-emerald-700',
      headerText: 'text-emerald-100',
      iconBg: 'bg-white/20',
      section: {
        blue: 'from-blue-50 to-blue-100 border-blue-200',
        purple: 'from-purple-50 to-purple-100 border-purple-200',
        amber: 'from-amber-50 to-amber-100 border-amber-200',
        indigo: 'from-indigo-50 to-indigo-100 border-indigo-200',
        emerald: 'from-emerald-50 to-emerald-100 border-emerald-200',
        rose: 'from-rose-50 to-rose-100 border-rose-200'
      }
    },
    rose: {
      header: 'from-rose-600 to-rose-700',
      headerText: 'text-rose-100',
      iconBg: 'bg-white/20',
      section: {
        blue: 'from-blue-50 to-blue-100 border-blue-200',
        purple: 'from-purple-50 to-purple-100 border-purple-200',
        amber: 'from-amber-50 to-amber-100 border-amber-200',
        indigo: 'from-indigo-50 to-indigo-100 border-indigo-200',
        emerald: 'from-emerald-50 to-emerald-100 border-emerald-200',
        rose: 'from-rose-50 to-rose-100 border-rose-200'
      }
    }
  };

  const colors = colorClasses[accentColor];
  const maxWidthClass = `max-w-${maxWidth}`;

  // Función para renderizar secciones estructuradas
  const renderSections = (sections: GuideSection[]) => {
    return (
      <div className="space-y-8">
        {sections.map((section, index) => {
          const sectionColor = section.color || 'blue';
          const sectionClasses = colors.section[sectionColor];
          
          return (
            <div
              key={section.id || index}
              className={`bg-gradient-to-br ${sectionClasses} rounded-xl p-6 border-2 shadow-sm`}
            >
              {/* Encabezado de sección */}
              <div className="flex items-center gap-3 mb-4">
                {section.icon ? (
                  <div className="p-3 bg-white/60 rounded-lg">
                    {section.icon}
                  </div>
                ) : (
                  <div className="p-3 bg-white/60 rounded-lg">
                    <Info className="h-6 w-6 text-gray-700" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                  {section.subtitle && (
                    <p className="text-sm text-gray-600 mt-1">{section.subtitle}</p>
                  )}
                </div>
              </div>

              {/* Contenido de la sección */}
              <div className="space-y-3 text-gray-800">
                {typeof section.content === 'string' ? (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    {section.content}
                  </div>
                )}

                {/* Ejemplos prácticos */}
                {section.examples && section.examples.length > 0 && (
                  <div className="mt-4 bg-white/60 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-600" />
                      Ejemplos Prácticos:
                    </h4>
                    <div className="space-y-2">
                      {section.examples.map((example, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium text-gray-700">{example.label}:</span>{' '}
                          {typeof example.value === 'string' ? (
                            <span className="text-gray-900">{example.value}</span>
                          ) : (
                            <span className="text-gray-900">{example.value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Función para renderizar contenido simple (string HTML o ReactNode)
  const renderSimpleContent = () => {
    if (typeof content === 'string') {
      return (
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    return <div className="prose prose-lg max-w-none">{content}</div>;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sheet Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full ${maxWidthClass} bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
      >
        {/* Header */}
        <div
          className={`sticky top-0 bg-gradient-to-r ${colors.header} text-white p-6 border-b border-white/20 shadow-lg z-10`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${colors.iconBg} rounded-lg`}>
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h2 id="guide-title" className="text-2xl font-bold">
                  {title}
                </h2>
                {subtitle && (
                  <p className={`text-sm ${colors.headerText} mt-1`}>{subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Cerrar guía"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {Array.isArray(content) ? renderSections(content) : renderSimpleContent()}
        </div>
      </div>
    </>
  );
}

