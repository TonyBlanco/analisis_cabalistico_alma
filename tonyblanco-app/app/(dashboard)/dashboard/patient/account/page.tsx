'use client';

import { useState, useEffect } from 'react';
import { User, MapPin, Calendar, Lock, LogOut, CheckCircle, AlertCircle } from 'lucide-react';

export default function PatientAccountPage() {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [formData, setFormData] = useState({
    legalFullName: '',
    birthDate: '',
    birthTime: '',
    birthCity: '',
    birthCountry: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    // TODO: Fetch user profile from backend
    // Placeholder data
    setFormData({
      legalFullName: 'Juan Pérez García',
      birthDate: '1985-06-15',
      birthTime: '14:30',
      birthCity: 'Madrid',
      birthCountry: 'España',
      email: 'juan.perez@example.com',
      phone: '+34 600 123 456',
    });
  }, []);

  async function handleSave() {
    setStatus('saving');
    // TODO: Save to backend (PATCH /api/profile/me/)
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2000);
  }

  function handleLogout() {
    // TODO: Implement logout
    console.log('Logout');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Mi cuenta</h1>
        <p className="text-gray-600">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Perfil personal */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Información personal</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre legal completo
            </label>
            <input
              type="text"
              value={formData.legalFullName}
              onChange={(e) => setFormData({ ...formData, legalFullName: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Este nombre se usa para cálculos cabalísticos. Los cambios afectarán solo a futuros análisis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Datos de nacimiento */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Datos de nacimiento</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de nacimiento
              </label>
              <input
                type="time"
                value={formData.birthTime}
                onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 font-medium">Ciudad y coordenadas bloqueadas</p>
              <p className="text-xs text-amber-700 mt-0.5">
                {formData.birthCity}, {formData.birthCountry} • Protegido por el terapeuta
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Los datos de nacimiento son esenciales para análisis cabalísticos precisos
          </p>
        </div>
      </div>

      {/* Consentimiento */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {consentAccepted ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
            <div>
              <h3 className="font-medium text-gray-900">Consentimiento terapéutico</h3>
              <p className="text-sm text-gray-600">
                {consentAccepted ? 'Aceptado y activo' : 'Pendiente de aceptación'}
              </p>
            </div>
          </div>
          {consentAccepted && (
            <span className="text-xs text-gray-500">
              Aceptado el 01/03/2024
            </span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            status === 'saving'
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : status === 'saved'
              ? 'bg-green-600 text-white'
              : 'bg-violet-600 text-white hover:bg-violet-700'
          }`}
        >
          {status === 'saving' ? 'Guardando...' : status === 'saved' ? 'Guardado ✓' : 'Guardar cambios'}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      {/* Aviso de versionado */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Nota:</strong> Los cambios en tus datos personales se versionan automáticamente. 
          Los análisis anteriores conservan los datos con los que fueron creados.
        </p>
      </div>
    </div>
  );
}
