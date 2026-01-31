'use client';

/**
 * THERAPIST DASHBOARD - CENTRO DE CONTROL DEL TERAPEUTA
 * =====================================================
 * 
 * CRITICAL: Esta página es el centro de control del terapeuta.
 * NO MODIFICAR sin autorización del propietario del proyecto.
 * 
 * Comportamiento:
 * - Si hay consultante activo → Muestra TherapistClinicalDashboard (workspace clínico)
 * - Si NO hay consultante → Muestra prompt para seleccionar consultante
 * 
 * El sidebar ya tiene "Pacientes" para la lista completa.
 * Este dashboard es para TRABAJAR con el consultante activo.
 * 
 * @author Tony Blanco - Holistica Aplicada
 * @protected NO BORRAR NI SIMPLIFICAR
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, UserPlus, ChevronRight, Loader2, AlertCircle
} from 'lucide-react';
import { getActivePatient, getActivePatientId, getActivePatientName } from '@/lib/active-patient';
import TherapistClinicalDashboard from '@/components/TherapistClinicalDashboard';

export default function TherapistDashboard() {
  const router = useRouter();
  const [activePatientId, setActivePatientIdState] = useState<number | null>(null);
  const [activePatientName, setActivePatientNameState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar paciente activo
  useEffect(() => {
    const loadActivePatient = () => {
      const id = getActivePatientId();
      const name = getActivePatientName();
      setActivePatientIdState(id);
      setActivePatientNameState(name);
      setLoading(false);
    };

    loadActivePatient();

    // Escuchar cambios en el paciente activo
    const handlePatientChange = () => {
      loadActivePatient();
    };

    window.addEventListener('activePatientChanged', handlePatientChange);
    window.addEventListener('storage', handlePatientChange);
    
    return () => {
      window.removeEventListener('activePatientChanged', handlePatientChange);
      window.removeEventListener('storage', handlePatientChange);
    };
  }, []);

  const handleChangePatient = useCallback(() => {
    router.push('/dashboard/therapist/patients');
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Si hay paciente activo → Mostrar workspace clínico
  if (activePatientId) {
    return (
      <TherapistClinicalDashboard
        patientId={activePatientId}
        patientName={activePatientName || undefined}
        onChangePatient={handleChangePatient}
      />
    );
  }

  // Si NO hay paciente activo → Prompt para seleccionar
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Centro de Control del Terapeuta</h1>
        <p className="text-indigo-100">
          Selecciona un consultante para comenzar a trabajar.
        </p>
      </div>

      {/* Mensaje principal */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No hay consultante seleccionado
          </h2>
          
          <p className="text-gray-600 mb-6">
            Para usar el espacio clínico, primero selecciona un consultante desde la lista de Pacientes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard/therapist/patients"
              className="inline-flex items-center justify-center px-5 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Users className="h-5 w-5 mr-2" />
              Ver Consultantes
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
            
            <Link
              href="/dashboard/therapist/patients/create"
              className="inline-flex items-center justify-center px-5 py-3 border-2 border-indigo-200 text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Crear Nuevo
            </Link>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800 font-medium">¿Cómo funciona?</p>
          <p className="text-sm text-amber-700 mt-1">
            Ve a <strong>Pacientes</strong> en el sidebar, haz clic en un consultante, 
            y su información aparecerá en el header. Luego regresa aquí para usar 
            las herramientas clínicas.
          </p>
        </div>
      </div>
    </div>
  );
}
