'use client';

import Link from 'next/link';

/**
 * Upgrade CTA Section Component
 * 
 * Recommends therapist and explains benefits of guided process.
 * Educational and non-pushy.
 */
export default function UpgradeCTASection() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¿Buscas un proceso más guiado?
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            Trabajar con un terapeuta profesional puede ofrecerte:
          </p>
          <ul className="text-sm text-gray-700 space-y-1 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Interpretación personalizada de tus análisis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Seguimiento continuo de tu proceso</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Herramientas clínicas avanzadas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Plan terapéutico personalizado</span>
            </li>
          </ul>
        </div>
        <div className="flex-shrink-0">
          <Link
            href="/register/therapist"
            className="inline-block px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            Encuentra un terapeuta
          </Link>
        </div>
      </div>
    </div>
  );
}
