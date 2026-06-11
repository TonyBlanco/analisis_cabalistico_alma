'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/getUserRole';
import { getActivePatientId, getActivePatientName } from '@/lib/active-patient';
import { getPatientDetail } from '@/lib/assignment-api';
import ProfileCompletionModal from '@/components/ProfileCompletionModal';
import { executeTest, getAvailableTests } from '@/lib/test-api';
import { ExecuteTestRequest } from '@/lib/test-types';

interface CabalisticModule {
  /** UI identifier */
  id: string;
  /** Registered TestModule.code in backend (initialize_tests.py) */
  testModuleCode: string;
  name: string;
  description: string;
  requiredFields: string[];
  /** Opens SWM workspace instead of /tests/execute/ */
  workspaceHref?: string;
}

/** Codes must exist in backend/initialize_tests.py */
const CABALISTIC_MODULES: CabalisticModule[] = [
  {
    id: 'arbol-vida',
    testModuleCode: 'basic-analysis',
    name: 'Árbol de la Vida',
    description:
      'Workspace interactivo del Árbol de la Vida con métodos simbólicos y registro clínico.',
    requiredFields: ['nombre completo', 'fecha de nacimiento'],
    workspaceHref: '/dashboard/therapist/cabala-aplicada',
  },
  {
    id: 'tikun-alma',
    testModuleCode: 'spiritual-path',
    name: 'Tikún del Alma',
    description:
      'Identificación de correcciones espirituales y lecciones kármicas a trabajar en esta encarnación.',
    requiredFields: ['nombre completo', 'fecha de nacimiento'],
  },
  {
    id: 'nombre-alma',
    testModuleCode: 'complete-numerology',
    name: 'Nombre del Alma',
    description:
      'Análisis del nombre completo según numerología cabalística y gematría aplicada.',
    requiredFields: ['nombre completo', 'fecha de nacimiento'],
  },
  {
    id: 'ciclos-vida',
    testModuleCode: 'life-purpose',
    name: 'Ciclos de Vida',
    description:
      'Análisis de ciclos numéricos y etapas evolutivas del consultante basado en fecha de nacimiento.',
    requiredFields: ['nombre completo', 'fecha de nacimiento'],
  },
  {
    id: 'correcciones-espirituales',
    testModuleCode: 'spiritual-path',
    name: 'Correcciones Espirituales',
    description:
      'Identificación de patrones kármicos y correcciones espirituales específicas del consultante.',
    requiredFields: ['nombre completo', 'fecha de nacimiento'],
  },
  {
    id: 'sombras-bloqueos',
    testModuleCode: 'past-lives',
    name: 'Sombras y Bloqueos',
    description:
      'Exploración de bloqueos energéticos, sombras y aspectos kármicos en el mapa cabalístico.',
    requiredFields: ['nombre completo', 'fecha de nacimiento'],
  },
];

export default function CabalisticCatalogPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [activePatientName, setActivePatientName] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [registeredTestCodes, setRegisteredTestCodes] = useState<Set<string>>(new Set());
  const [executingModule, setExecutingModule] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileValidationResult, setProfileValidationResult] = useState<{
    missingFields: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPatientData = useCallback(async (patientId: number) => {
    try {
      const patient = await getPatientDetail(patientId);
      setPatientData(patient);
    } catch (err) {
      console.error('Error loading patient data:', err);
      setPatientData(null);
    }
  }, []);

  useEffect(() => {
    getUserRole().then((userRole) => {
      setRole(userRole);
      if (userRole && userRole !== 'therapist' && userRole !== 'admin') {
        router.replace('/dashboard');
      }
    });

    const patientId = getActivePatientId();
    const patientName = getActivePatientName();
    setActivePatientId(patientId);
    setActivePatientName(patientName);

    if (patientId) {
      loadPatientData(patientId);
    }

    getAvailableTests(patientId ?? undefined)
      .then((res) => {
        setRegisteredTestCodes(new Set(res.tests.map((t) => t.code)));
      })
      .catch(() => {
        // Non-blocking: cards still show; execute will surface API errors
      });
  }, [router, loadPatientData]);

  const validatePatientData = (
    module: CabalisticModule,
  ): { isValid: boolean; missingFields: string[] } => {
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

    if (module.requiredFields.includes('fecha de nacimiento') && !patientData.birth_date) {
      missingFields.push('fecha de nacimiento');
    }

    return { isValid: missingFields.length === 0, missingFields };
  };

  const isTestRegistered = useCallback(
    (code: string) => registeredTestCodes.size === 0 || registeredTestCodes.has(code),
    [registeredTestCodes],
  );

  const handleModuleAction = async (module: CabalisticModule) => {
    setError(null);

    if (!activePatientId) {
      setError('Selecciona un consultante activo antes de ejecutar un análisis cabalístico.');
      return;
    }

    const patientValidation = validatePatientData(module);
    if (!patientValidation.isValid) {
      setProfileValidationResult({ missingFields: patientValidation.missingFields });
      setShowProfileModal(true);
      return;
    }

    if (module.workspaceHref) {
      router.push(module.workspaceHref);
      return;
    }

    if (!isTestRegistered(module.testModuleCode)) {
      setError(
        `El módulo "${module.testModuleCode}" no está registrado en el catálogo de tests. Contacta al administrador.`,
      );
      return;
    }

    setExecutingModule(module.id);

    try {
      const inputData: Record<string, unknown> = {
        nombre: patientData.full_name || patientData.first_name || '',
        fecha_nacimiento: patientData.birth_date || '',
        fecha: new Date().toISOString().split('T')[0],
      };

      if (patientData.birth_city) inputData.ciudad_nacimiento = patientData.birth_city;
      if (patientData.birth_country) inputData.pais_nacimiento = patientData.birth_country;
      if (patientData.birth_time) inputData.hora_nacimiento = patientData.birth_time;
      if (patientData.birth_latitude != null) inputData.latitud = patientData.birth_latitude;
      if (patientData.birth_longitude != null) inputData.longitud = patientData.birth_longitude;

      const request: ExecuteTestRequest = {
        test_module_code: module.testModuleCode,
        input_data: inputData,
        patient_id: activePatientId,
        client_name: patientData.full_name || patientData.first_name || '',
        client_birth_date: patientData.birth_date || '',
        save_result: true,
      };

      const result = await executeTest(request);

      if (result.result_id) {
        router.push(`/dashboard/therapist/cabala/results/${result.result_id}`);
      } else {
        router.push('/dashboard/therapist/tests');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al ejecutar análisis cabalístico';
      setError(errorMessage);
      console.error('Error executing cabalistic analysis:', err);
    } finally {
      setExecutingModule(null);
    }
  };

  const modulesWithStatus = useMemo(
    () =>
      CABALISTIC_MODULES.map((module) => ({
        module,
        patientValidation: patientData
          ? validatePatientData(module)
          : { isValid: false, missingFields: [] as string[] },
        testAvailable: module.workspaceHref ? true : isTestRegistered(module.testModuleCode),
      })),
    [patientData, isTestRegistered],
  );

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
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">Cábala Aplicada</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Catálogo clínico de análisis cabalísticos para el consultante activo
        </p>
      </div>

      {activePatientId && activePatientName ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Consultante activo:</strong> {activePatientName}
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Atención:</strong> Selecciona un consultante activo desde el header clínico o
            el workspace principal.
          </p>
          <button
            type="button"
            onClick={() => router.push('/dashboard/therapist/patients')}
            className="mt-2 px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            Elegir consultante
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <p className="text-sm text-red-800">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modulesWithStatus.map(({ module, patientValidation, testAvailable }) => {
          const isExecuting = executingModule === module.id;
          const canExecute = Boolean(activePatientId && patientData);
          const actionLabel = module.workspaceHref
            ? 'Abrir workspace'
            : 'Ejecutar análisis';

          return (
            <div
              key={module.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{module.description}</p>

              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Datos requeridos:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {module.requiredFields.map((field) => (
                    <li key={field} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{field}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {!testAvailable && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-xs text-red-800">
                    Módulo no disponible en el servidor ({module.testModuleCode}).
                  </p>
                </div>
              )}

              {patientData && !patientValidation.isValid && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-xs font-medium text-yellow-800 mb-1">Datos faltantes:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {patientValidation.missingFields.map((field) => (
                      <li key={field}>• {field}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleModuleAction(module)}
                disabled={
                  !canExecute ||
                  isExecuting ||
                  !patientValidation.isValid ||
                  !testAvailable
                }
                className="w-full px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                {isExecuting
                  ? 'Ejecutando...'
                  : !canExecute
                    ? 'Selecciona un consultante'
                    : !patientValidation.isValid
                      ? 'Completa datos del consultante'
                      : !testAvailable
                        ? 'No disponible'
                        : actionLabel}
              </button>
            </div>
          );
        })}
      </div>

      <ProfileCompletionModal
        open={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setProfileValidationResult(null);
        }}
        missingFields={profileValidationResult?.missingFields}
        subject="patient"
        patientId={activePatientId}
        patientName={activePatientName}
      />
    </div>
  );
}