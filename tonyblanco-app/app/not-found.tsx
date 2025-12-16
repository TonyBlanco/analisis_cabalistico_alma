import Link from 'next/link';

/**
 * Custom 404 Page
 * 
 * Clinical, cabalistic, calm, and reassuring.
 * Independent of authentication and navigation.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 sm:p-12">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-light text-gray-900 mb-6">
            404 — Esta página no existe, pero tú sí
          </h1>

          {/* Body */}
          <div className="space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed mb-8">
            <p>
              No hemos encontrado la página que buscas.
            </p>
            <p>
              A veces el camino se desvía, no porque esté mal,
              sino porque es momento de reajustar la dirección.
            </p>
            <p className="text-sm sm:text-base text-gray-600 italic mt-6">
              En términos clínicos:
              no hay daño, no hay pérdida,
              solo una interrupción temporal del recorrido.
            </p>
            <p className="mt-6">
              Respira un momento.
              Todo está bien.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <Link
              href="/"
              className="inline-block px-6 py-3 text-base font-medium text-white rounded-md transition-colors"
              style={{ backgroundColor: 'var(--accent-color, #6366f1)' }}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
