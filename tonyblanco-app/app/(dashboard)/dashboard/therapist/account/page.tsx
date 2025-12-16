'use client';

/**
 * Cuenta - Panel Terapeuta
 * 
 * Vista simple: Perfil del terapeuta, preferencias, cerrar sesión
 * ❌ Nada clínico aquí
 */
export default function TherapistAccountPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Cuenta
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Gestiona tu perfil y preferencias
        </p>
      </div>

      {/* Account Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">
            Configuración de cuenta (en desarrollo)
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Perfil, preferencias y cerrar sesión
          </p>
        </div>
      </div>
    </div>
  );
}
