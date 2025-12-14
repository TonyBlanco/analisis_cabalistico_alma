'use client';

import { GraduationCap, BookOpen, Users } from 'lucide-react';

/**
 * Sección de Integración LMS
 */
export default function AdminLMSIntegration() {
  const djangoAdminUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Sistema de Gestión de Aprendizaje (LMS)</h2>
      </div>

      {/* Información del LMS */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Gestión de Cursos</h3>
        <p className="text-sm text-gray-600 mb-6">
          El sistema LMS permite crear y gestionar cursos completos con módulos, lecciones, recursos
          y seguimiento de progreso. La gestión completa se realiza desde Django Admin.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href={`${djangoAdminUrl}/admin/courses/course/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <GraduationCap className="w-10 h-10 text-gray-600 mb-3" />
            <p className="font-medium text-gray-900">Ver Cursos</p>
            <p className="text-sm text-gray-600 text-center mt-2">Lista de todos los cursos</p>
          </a>

          <a
            href={`${djangoAdminUrl}/admin/courses/course/add/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="w-10 h-10 text-gray-600 mb-3" />
            <p className="font-medium text-gray-900">Crear Curso</p>
            <p className="text-sm text-gray-600 text-center mt-2">Nuevo curso en el LMS</p>
          </a>

          <a
            href={`${djangoAdminUrl}/admin/courses/courseenrollment/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-10 h-10 text-gray-600 mb-3" />
            <p className="font-medium text-gray-900">Inscripciones</p>
            <p className="text-sm text-gray-600 text-center mt-2">Ver inscripciones de estudiantes</p>
          </a>
        </div>
      </div>

      {/* Características del LMS */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Características del LMS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Cursos Completos</p>
              <p className="text-sm text-gray-600">
                Módulos, lecciones, videos, PDFs y recursos descargables
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Seguimiento de Progreso</p>
              <p className="text-sm text-gray-600">
                Tracking automático de progreso y tiempo dedicado por estudiante
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Certificados</p>
              <p className="text-sm text-gray-600">
                Emisión automática de certificados al completar cursos
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Sistema de Precios</p>
              <p className="text-sm text-gray-600">
                Cursos gratuitos o de pago en USD/EUR con descuentos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gestión de Categorías */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Gestión de Categorías</h3>
        <div className="flex gap-4">
          <a
            href={`${djangoAdminUrl}/admin/courses/coursecategory/`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors text-sm font-medium"
          >
            Ver Categorías
          </a>
          <a
            href={`${djangoAdminUrl}/admin/courses/coursecategory/add/`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Nueva Categoría
          </a>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> La gestión completa del LMS (crear cursos, módulos, lecciones,
          recursos, gestionar inscripciones) se realiza desde Django Admin. Este panel proporciona
          acceso rápido a las secciones principales.
        </p>
      </div>
    </div>
  );
}
