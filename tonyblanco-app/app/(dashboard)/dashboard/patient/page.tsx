'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';

export default function PatientHome() {
  const [profileComplete, setProfileComplete] = useState(true);
  const [pendingTests, setPendingTests] = useState(2);
  const [newResults, setNewResults] = useState(1);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Bienvenida */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Bienvenido a tu espacio</h1>
        <p className="text-gray-600">
          Este es tu panel personal de acompañamiento. Aquí puedes ver tus tests, resultados y recursos asignados.
        </p>
      </div>

      {/* Estado del proceso */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="w-6 h-6 text-violet-600" />
          <h2 className="text-lg font-semibold text-gray-900">Estado del proceso</h2>
        </div>
        <p className="text-gray-700">En acompañamiento terapéutico</p>
      </div>

      {/* Avisos importantes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Perfil */}
        {!profileComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="font-medium text-amber-900">Perfil incompleto</h3>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              Completa tu información para análisis más precisos
            </p>
            <a
              href="/dashboard/patient/account"
              className="text-sm text-amber-600 font-medium hover:text-amber-700"
            >
              Completar ahora →
            </a>
          </div>
        )}

        {/* Tests pendientes */}
        {pendingTests > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Tests pendientes</h3>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Tienes {pendingTests} test{pendingTests > 1 ? 's' : ''} asignado{pendingTests > 1 ? 's' : ''} por completar
            </p>
            <a
              href="/dashboard/patient/tests"
              className="text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              Ver tests →
            </a>
          </div>
        )}

        {/* Nuevos resultados */}
        {newResults > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-900">Nuevos resultados</h3>
            </div>
            <p className="text-sm text-green-700 mb-3">
              {newResults} resultado{newResults > 1 ? 's' : ''} disponible{newResults > 1 ? 's' : ''}
            </p>
            <a
              href="/dashboard/patient/results"
              className="text-sm text-green-600 font-medium hover:text-green-700"
            >
              Ver resultados →
            </a>
          </div>
        )}
      </div>

      {/* Mensaje del terapeuta (placeholder) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <MessageSquare className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Mensaje de tu terapeuta</h2>
        </div>
        <p className="text-gray-600 text-sm">
          No hay mensajes nuevos en este momento.
        </p>
      </div>
    </div>
  );
}
