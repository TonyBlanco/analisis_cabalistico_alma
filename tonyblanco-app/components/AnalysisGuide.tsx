'use client';

import { useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';

interface AnalysisGuideProps {
  title: string;
  content: string | React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  subtitle?: string;
}

/**
 * Componente universal para mostrar guías educativas
 * Puede recibir texto plano o contenido HTML/React
 */
export default function AnalysisGuide({
  title,
  content,
  isOpen,
  onClose,
  subtitle
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

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sheet Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6 border-b border-amber-800 shadow-lg z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-amber-100 mt-1">{subtitle}</p>
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
          {typeof content === 'string' ? (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="prose prose-lg max-w-none">
              {content}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

