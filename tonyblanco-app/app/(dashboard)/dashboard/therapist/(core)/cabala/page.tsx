'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { getActivePatientId, getActivePatientName } from '@/lib/active-patient';
import { getPatientDetail } from '@/lib/assignment-api';
import { validateProfileForAnalysis } from '@/lib/profile-validation';
import ProfileCompletionModal from '@/components/ProfileCompletionModal';
import { executeTest } from '@/lib/test-api';
import { ExecuteTestRequest } from '@/lib/test-types';

interface CabalisticModule {
  code: string;
  name: string;
  description: string;
  requiredFields: string[];
}

/**
 * Cabalistic Test Catalog Page
 * 
 * Lists cabalistic analysis modules for therapist execution on active patient.
 * All cabalistic analyses are therapist_clinical execution mode.
 */
export default function CabalisticCatalogPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [activePatientName, setActivePatientName] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [executingModule, setExecutingModule] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileValidationResult, setProfileValidationResult] = useState<{ missingFields: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cabalisticModules: CabalisticModule[] = [
    {
      code: 'arbol-vida',
      name: 'Árbol de la Vida',
      description: 'Análisis cabalístico completo del Árbol de la Vida, mapeo de sefirot y senderos energéticos del consultante.',
      requiredFields: ['nombre completo', 'fecha de nacimiento', 'ciudad de nacimiento', 'país de nacimiento'],
    },
    {
      code: 'tikun-alma',
      name: 'Tikún del Alma',
      description: 'Identificación de correcciones espirituales y lecciones kármicas a trabajar en esta encarnación.',
      requiredFields: ['nombre completo', 'fecha de nacimiento', 'ciudad de nacimiento', 'país de nacimiento'],
    },
    {
      code: 'nombre-alma',
      name: 'Nombre del Alma',
      description: 'Análisis del nombre completo según la gematría hebrea y su significado cabalístico profundo.',
      requiredFields: ['nombre completo', 'fecha de nacimiento'],
    },
    {
      code: 'ciclos-vida',
      name: 'Ciclos de Vida',
      description: 'Análisis de ciclos numéricos y etapas evolutivas del consultante basado en fecha de nacimiento.',
      requiredFields: ['nombre completo', 'fecha de nacimiento', 'ciudad de nacimiento', 'país de nacimiento'],
    },
    {
      code: 'correcciones-espirituales',
      name: 'Correcciones Espirituales',
      description: 'Identificación de patrones kármicos y correcciones espirituales específicas del consultante.',
      requiredFields: ['nombre completo', 'fecha de nacimiento', 'ciudad de nacimiento', 'país de nacimiento'],
    },
    {
      code: 'sombras-bloqueos',
      name: 'Sombras y Bloqueos',
      description: 'Análisis de bloqueos energéticos, sombras y aspectos oscuros en el mapa cabalístico.',
      requiredFields: ['nombre completo', 'fecha de nacimiento', 'ciudad de nacimiento', 'país de nacimiento'],
    },
  ];

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      // Only therapist and admin (for simulation) can access
      if (userRole && userRole !== 'therapist' && userRole !== 'admin') {
        router.replace('/dashboard');
      }
    });

    // Get active patient
    const patientId = getActivePatientId();
    const patientName = getActivePatientName();
    setActivePatientId(patientId);
    setActivePatientName(patientName);

    if (patientId) {
      loadPatientData(patientId);
    }
  }, [router]);

  const loadPatientData = async (patientId: number) => {
    try {
      const patient = await getPatientDetail(patientId);
      setPatientData(patient);
    } catch (err) {
      console.error('Error loading patient data:', err);
      setPatientData(null);
    }
  };

  const validatePatientData = (module: CabalisticModule): { isValid: boolean; missingFields: string[] } => {
    if (!patientData) {
      return { isValid: false, missingFields: ['Datos del consultante no disponibles'] };
    }

    const missingFields: string[] = [];

    if (module.requiredFields.includes('nombre completo')) {
      const fullName = patientData.full_name || patientData.first_name;
      if (!fullName || fullName.trim().split(/\s+/).length < 2) {
        missingFields.push('nombre completo (mínimo nombre y apellido)');
      }
    }

    if (module.requiredFields.includes('fecha de nacimiento')) {
      if (!patientData.birth_date) {
        missingFields.push('fecha de nacimiento');
      }
    }

    if (module.requiredFields.includes('ciudad de nacimiento')) {
      if (!patientData.birth_city || !patientData.birth_city.trim()) {
        missingFields.push('ciudad de nacimiento');
      }
    }

    if (module.requiredFields.includes('país de nacimiento')) {
      if (!patientData.birth_country || !patientData.birth_country.trim()) {
        missingFields.push('país de nacimiento');
      }
    }

    return { isValid: missingFields.length === 0, missingFields };
  };

  const handleExecuteAnalysis = async (module: CabalisticModule) => {
    setError(null);

    // Check active patient
    if (!activePatientId) {
      setError('Por favor, selecciona un consultante activo antes de ejecutar un análisis cabalístico.');
      return;
    }

    // Validate therapist profile
    const profileValidation = await validateProfileForAnalysis();
    if (!profileValidation.isValid) {
      setProfileValidationResult({ missingFields: profileValidation.missingFields });
      setShowProfileModal(true);
      return;
    }

    // Validate patient data
    const patientValidation = validatePatientData(module);
    if (!patientValidation.isValid) {
      setError(
        `El consultante no tiene la información requerida: ${patientValidation.missingFields.join(', ')}. Por favor, completa los datos del consultante antes de ejecutar este análisis.`
      );
      return;
    }

    setExecutingModule(module.code);

    try {
      // Prepare input_data for cabalistic analysis
      const inputData: Record<string, any> = {
        nombre: patientData.full_name || patientData.first_name || '',
        fecha_nacimiento: patientData.birth_date || '',
        fecha: new Date().toISOString().split('T')[0],
      };

      if (patientData.birth_city) {
        inputData.ciudad_nacimiento = patientData.birth_city;
      }
      if (patientData.birth_country) {
        inputData.pais_nacimiento = patientData.birth_country;
      }
      if (patientData.birth_time) {
        inputData.hora_nacimiento = patientData.birth_time;
      }
      if (patientData.birth_latitude && patientData.birth_longitude) {
        inputData.latitud = patientData.birth_latitude;
        inputData.longitud = patientData.birth_longitude;
      }

      const request: ExecuteTestRequest = {
        test_module_code: module.code,
        input_data: inputData,
        patient_id: activePatientId,
        client_name: patientData.full_name || patientData.first_name || '',
        client_birth_date: patientData.birth_date || '',
        save_result: true,
      };

      const result = await executeTest(request);

      // Redirect to result detail view
      if (result.result_id) {
        router.push(`/dashboard/therapist/cabala/results/${result.result_id}`);
      } else {
        // If no result_id, try to find it from the results list
        // For now, redirect to therapist dashboard results section
        router.push('/dashboard/therapist');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al ejecutar análisis cabalístico';
      setError(errorMessage);
      console.error('Error executing cabalistic analysis:', err);
    } finally {
      setExecutingModule(null);
    }
  };

  if (!role) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Cábala Aplicada
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Análisis cabalísticos avanzados para consultantes
            </p>
          </div>
        </div>
      </div>

      {/* Active Patient Indicator */}
      {activePatientId && activePatientName ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Consultante activo:</strong> {activePatientName}
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Atención:</strong> Por favor, selecciona un consultante activo desde el workspace principal para ejecutar análisis cabalísticos.
          </p>
          <button
            onClick={() => router.push('/dashboard/therapist')}
            className="mt-2 px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            Ir al Workspace
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Cabalistic Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cabalisticModules.map((module) => {
          const isExecuting = executingModule === module.code;
          const canExecute = activePatientId && patientData;
          const patientValidation = patientData ? validatePatientData(module) : { isValid: false, missingFields: [] };

          return (
            <div
              key={module.code}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{module.description}</p>

              {/* Required Fields */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Datos requeridos:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {module.requiredFields.map((field, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{field}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Patient Data Status */}
              {patientData && !patientValidation.isValid && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-xs font-medium text-yellow-800 mb-1">Datos faltantes:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {patientValidation.missingFields.map((field, idx) => (
                      <li key={idx}>• {field}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Execute Button */}
              <button
                onClick={() => handleExecuteAnalysis(module)}
                disabled={!canExecute || isExecuting || !patientValidation.isValid}
                className="w-full px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                {isExecuting
                  ? 'Ejecutando...'
                  : !canExecute
                  ? 'Selecciona un consultante'
                  : !patientValidation.isValid
                  ? 'Completa datos del consultante'
                  : 'Ejecutar análisis'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        open={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setProfileValidationResult(null);
        }}
        missingFields={profileValidationResult?.missingFields}
      />
    </div>
  );
}
