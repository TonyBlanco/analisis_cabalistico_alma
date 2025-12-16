'use client';

import { useState } from 'react';

interface PersonalResource {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'course';
  description: string;
  free: boolean;
}

const PERSONAL_RESOURCES: PersonalResource[] = [
  {
    id: 'video-intro-cabala',
    type: 'video',
    title: 'Introducción a la Cábala para el día a día',
    description: 'Un recorrido sencillo por los símbolos básicos de la Cábala y cómo aplicarlos a tu rutina.',
    free: true,
  },
  {
    id: 'audio-respiracion',
    type: 'audio',
    title: 'Audio guía: Respiración consciente y nombre propio',
    description: 'Ejercicio breve para conectar con tu nombre desde la calma y la presencia.',
    free: true,
  },
  {
    id: 'pdf-cuaderno-reflexion',
    type: 'pdf',
    title: 'Cuaderno de auto-reflexión cabalística',
    description: 'Plantillas para anotar intuiciones, símbolos y patrones personales.',
    free: true,
  },
  {
    id: 'mini-curso-arbol-vida',
    type: 'course',
    title: 'Mini-curso: Tu historia en el Árbol de la Vida',
    description: 'Serie breve de lecciones para explorar tu recorrido vital desde un mapa simbólico.',
    free: false,
  },
  {
    id: 'audio-meditacion-guiada',
    type: 'audio',
    title: 'Meditación guiada: Camino de autoconocimiento',
    description: 'Visualización suave para observar tus patrones desde una mirada compasiva.',
    free: false,
  },
];

function getTypeLabel(type: PersonalResource['type']): string {
  switch (type) {
    case 'video':
      return 'Video';
    case 'audio':
      return 'Audio';
    case 'pdf':
      return 'PDF';
    case 'course':
      return 'Mini-curso';
    default:
      return 'Recurso';
  }
}

function getTypeIcon(type: PersonalResource['type']): string {
  switch (type) {
    case 'video':
      return '🎥';
    case 'audio':
      return '🎧';
    case 'pdf':
      return '📄';
    case 'course':
      return '📚';
    default:
      return '✨';
  }
}

export default function PersonalResourcesSection() {
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);

  const handleLockedClick = () => {
    setLockedMessage('Disponible con acompañamiento profesional.');
    setTimeout(() => setLockedMessage(null), 3000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Recursos para tu exploración</h2>
          <p className="text-sm text-gray-600 mt-1">
            Audios, videos y materiales para acompañar tu proceso de autoconocimiento.
          </p>
        </div>
      </div>

      {lockedMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-xs text-yellow-800">{lockedMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PERSONAL_RESOURCES.map((resource) => (
          <div
            key={resource.id}
            className="border border-gray-200 rounded-md p-4 flex flex-col justify-between hover:border-gray-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl" aria-hidden="true">
                  {getTypeIcon(resource.type)}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    resource.free
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}
                >
                  {resource.free ? 'Libre' : 'Bloqueado'}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{resource.title}</h3>
              <p className="text-xs text-gray-600 mt-2 line-clamp-3">{resource.description}</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 uppercase tracking-wide">
                {getTypeLabel(resource.type)} · Exploración personal
              </span>
              {resource.free ? (
                <button
                  type="button"
                  className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Abrir
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLockedClick}
                  className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  Ver detalle
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

