'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Loader2, Mail, CheckCircle, Info } from 'lucide-react';
import { TEST_TYPES, type TestModule } from '@/lib/test-types';
import { clinicalTestsRegistry } from '@/lib/clinicalTests.registry';
import { getActivePatientId } from '@/lib/active-patient';
import { useToast } from '@/components/ui/toast';
import ClinicalTestHelpModal from '@/components/ClinicalTestHelpModal';
import { useRouter } from 'next/navigation';
import { getAvailableTests } from '@/lib/test-api';

interface TestCatalogSectionProps {
  onTestAssigned?: () => void;
}

type CatalogTest = TestModule & {
  implemented?: boolean;
  domainLabel?: string;
  family?: string;
  execution_mode?: string;
  available_for_personal?: boolean;
  mode?: string;
  domain?: string;
  requires_license?: boolean;
};

/**
 * Catálogo holístico global: muestra todos los tests sin ocultar por estado.
 * El patient_id solo afecta acciones (asignar) y estados calculados externamente.
 */
export default function TestCatalogSection({ onTestAssigned }: TestCatalogSectionProps = {}) {
  const [tests, setTests] = useState<CatalogTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigningTestCode, setAssigningTestCode] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [testToAssign, setTestToAssign] = useState<TestModule | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastAssignedTest, setLastAssignedTest] = useState<string | null>(null);
  const [helpTestCode, setHelpTestCode] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const toast = useToast();
  const router = useRouter();
  const activePatientId = getActivePatientId();

  useEffect(() => {
    setMounted(true);
    fetchTests();
  }, []);

  // Carga desde el registro declarativo (sin depender de backend).
  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build a stable catalog from the declarative registry, then overlay backend truth.
      // This ensures therapists still see placeholder tests even if the backend only returns active/implemented ones.
      const registryMapped = clinicalTestsRegistry.map<CatalogTest>((entry, idx) => ({
        id: idx + 1,
        code: entry.test_code,
        name: entry.display_name,
        description: entry.guidance?.what || entry.domain || 'Instrumento holístico',
        test_type: TEST_TYPES.BASIC,
        required_access_level: 'professional',
        is_active: true,
        available_for_therapists: true,
        available_for_personal: entry.family === 'psicologicos',
        uses_per_month: null,
        icon: '',
        order: idx,
        estimated_duration: 5,
        is_available: true,
        user_access: null,
        implemented: entry.implemented,
        domainLabel: entry.domain,
        family: entry.family,
        requires_license: false,
      }));

      const remote = await getAvailableTests().catch(() => null);
      const remoteTests: TestModule[] = Array.isArray(remote?.tests) ? remote!.tests : [];
      const remoteByCode = new Map(remoteTests.map((t) => [t.code, t]));

      const mergedFromRegistry = registryMapped.map<CatalogTest>((local) => {
        const remoteHit = remoteByCode.get(local.code);
        if (!remoteHit) return local;

        const meta = clinicalTestsRegistry.find((e) => e.test_code === remoteHit.code) || null;
        const family: CatalogTest['family'] =
          meta?.family ||
          (['basic', 'numerology', 'compatibility', 'career', 'spiritual', 'health', 'financial', 'family', 'purpose', 'past_life'].includes(String(remoteHit.test_type))
            ? 'cabalisticos'
            : 'psicologicos');

        return {
          ...local,
          ...remoteHit,
          implemented: meta?.implemented ?? local.implemented,
          domainLabel: meta?.domain ?? local.domainLabel,
          family,
          requires_license: (remoteHit as any).requires_license === true,
        };
      });

      const registryCodes = new Set(registryMapped.map((t) => t.code));
      const remoteOnly = remoteTests
        .filter((t) => !registryCodes.has(t.code))
        .map<CatalogTest>((t) => {
          const family: CatalogTest['family'] =
            ['basic', 'numerology', 'compatibility', 'career', 'spiritual', 'health', 'financial', 'family', 'purpose', 'past_life'].includes(String(t.test_type))
              ? 'cabalisticos'
              : 'psicologicos';
          return {
            ...t,
            implemented: true,
            domainLabel: (t as any).domainLabel || (t as any).domain || undefined,
            family,
            requires_license: (t as any).requires_license === true,
          };
        });

      setTests([...mergedFromRegistry, ...remoteOnly]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar catálogo de tests';
      setError(message);
      console.error('Error building catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  // Normaliza modo para decidir acciones
  const normalizedTests = tests.map((test) => {
    const isClinical =
      test.execution_mode === 'therapist_clinical' ||
      (test.available_for_therapists === true && test.available_for_personal === false);
    return {
      ...test,
      mode: isClinical ? 'therapist_clinical' : 'patient_self',
    };
  });

  const handleAssignTest = (test: TestModule) => {
    if (!activePatientId) {
      toast.warning(
        'Selecciona un consultante',
        'Debes seleccionar un consultante activo antes de asignar un test.'
      );
      return;
    }
    setTestToAssign(test);
    setShowConfirmModal(true);
  };

  const confirmAssignTest = async () => {
    if (!testToAssign || !activePatientId) return;
    setAssigningTestCode(testToAssign.code);
    setShowConfirmModal(false);
    try {
      const { assignTestToPatient } = await import('@/lib/assignment-api');
      await assignTestToPatient(activePatientId, testToAssign.code, 'patient_self');
      // Registrar asignación local para reflejar en el workspace mientras el backend responde.
      const key = 'assigned_tests_by_patient';
      const existing = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      const parsed = existing ? JSON.parse(existing) : {};
      const patientKey = String(activePatientId);
      const current: Array<{ code: string; name: string; description?: string; assigned_at: string }> =
        parsed[patientKey] || [];
      const now = new Date().toISOString();
      const deduped = current.filter((t) => t.code !== testToAssign.code);
      deduped.push({
        code: testToAssign.code,
        name: testToAssign.name,
        description: testToAssign.description,
        assigned_at: now,
      });
      parsed[patientKey] = deduped;
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(parsed));
        window.dispatchEvent(new Event('assignedTestsChanged'));
      }

      setLastAssignedTest(testToAssign.name);
      setShowSuccessModal(true);
      if (onTestAssigned) onTestAssigned();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al asignar test';
      toast.error('Error al asignar test', message);
      console.error('Error assigning test:', err);
    } finally {
      setAssigningTestCode(null);
      setTestToAssign(null);
    }
  };

  const cancelAssignTest = () => {
    setShowConfirmModal(false);
    setTestToAssign(null);
  };

  const AssignTestButton = ({
    onAssign,
    disabled,
    isAssigning,
    isImplemented,
    requiresLicense,
  }: {
    onAssign: () => void;
    disabled: boolean;
    isAssigning: boolean;
    isImplemented: boolean;
    requiresLicense: boolean;
  }) => {
    if (!activePatientId) {
      return (
        <button
          disabled
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-md cursor-not-allowed"
          title="Selecciona un consultante activo para asignar tests"
        >
          Asignar
        </button>
      );
    }
    return (
      <button
        onClick={onAssign}
        disabled={disabled}
        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        style={{ backgroundColor: '#1f6c8f' }}
        title={
          requiresLicense
            ? 'Este instrumento requiere licencia. Carga contenido licenciado y habilita el acceso correspondiente.'
            : !isImplemented
              ? 'Este test está marcado como “En desarrollo”.'
              : undefined
        }
      >
        {isAssigning ? 'Asignando...' : requiresLicense ? 'Requiere licencia' : !isImplemented ? 'En desarrollo' : 'Asignar'}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Catálogo de Tests</h2>
          </div>
        </div>
        <div className="text-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500 mx-auto" />
          <p className="text-sm text-gray-500 mt-2">Cargando catálogo de tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Catálogo de Tests</h2>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={fetchTests}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Agrupa por familia para mejorar legibilidad sin ocultar tests
  const groupedByFamily = normalizedTests.reduce<Record<string, CatalogTest[]>>((acc, test) => {
    const family = (test as any).family ?? clinicalTestsRegistry.find((e) => e.test_code === test.code)?.family ?? 'psicologicos';
    if (!acc[family]) acc[family] = [];
    acc[family].push(test);
    return acc;
  }, {});

  const familyOrder: Array<{ key: string; label: string; desc: string }> = [
    { key: 'psicologicos', label: 'Tests Psicológicos', desc: 'Cribados y escalas autoaplicadas.' },
    { key: 'cabalisticos', label: 'Análisis Cabalísticos', desc: 'Herramientas clínicas del terapeuta.' },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#1f6c8f]" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Catálogo de Tests</h2>
            <p className="text-sm text-gray-500">Inventario holístico global — acciones según consultante activo.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            {mounted ? `Consultante: ${activePatientId ? `ID ${activePatientId}` : 'Selecciona un consultante'}` : ''}
          </span>
          <button
            className="text-sm text-[#1f6c8f] hover:underline"
            onClick={() => router.push('/dashboard/therapist')}
          >
            Volver al workspace
          </button>
        </div>
      </div>

      <div className="min-h-[200px]">
        {normalizedTests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No hay tests disponibles.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {familyOrder.map((family) => {
              const items = groupedByFamily[family.key] || [];
              if (items.length === 0) return null;
              return (
                <section key={family.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">{family.label}</h3>
                      <p className="text-xs text-gray-500">{family.desc}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {items.map((test) => {
                      const isTherapistOnly = test.mode === 'therapist_clinical';
                      return (
                        <div
                          key={test.code}
                          className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${isTherapistOnly ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {isTherapistOnly ? 'Holístico (profesional)' : 'Asignable al consultante'}
                        </span>
                        <span className="text-xs text-gray-500">{(test as any).domainLabel || test.domain || 'Dominio holístico'}</span>
                        {(test as any).implemented === false && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            En desarrollo
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900">{test.name}</h3>
                      {test.description && (
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{test.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHelpTestCode(test.code)}
                        className="p-2 rounded-full border border-gray-200 text-[#1f6c8f] hover:bg-gray-50"
                        aria-label="Ver guía holística"
                        title="Ver guía clínica"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      {isTherapistOnly ? (
                        <span className="text-xs text-gray-500 px-2 py-1 rounded border border-gray-200">
                          Ejecutar desde flujos holísticos
                        </span>
                      ) : (
                        (() => {
                          const isAssigning = assigningTestCode === test.code;
                          const isImplemented = (test as any).implemented !== false;
                          const requiresLicense = (test as any).requires_license === true;
                          // Only allow assignment for patient_self tests that are implemented and not licensed-only.
                          const disabled = isAssigning || !isImplemented || requiresLicense;
                          return (
                        <AssignTestButton
                          onAssign={() => handleAssignTest(test)}
                              disabled={disabled}
                              isAssigning={isAssigning}
                              isImplemented={isImplemented}
                              requiresLicense={requiresLicense}
                        />
                          );
                        })()
                      )}
                    </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Assignment Confirmation Modal */}
      {showConfirmModal && testToAssign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={cancelAssignTest}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar asignación</h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Deseas asignar el test <strong>&quot;{testToAssign.name}&quot;</strong> al consultante activo?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={cancelAssignTest}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAssignTest}
                className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && lastAssignedTest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Test asignado correctamente!</h3>
            <p className="text-gray-600 mb-4">
              <strong>&quot;{lastAssignedTest}&quot;</strong> ha sido asignado al consultante.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-blue-700 mb-1">
                <Mail className="w-5 h-5" />
                <span className="font-medium">Notificación enviada</span>
              </div>
              <p className="text-sm text-blue-600">
                El consultante ha recibido un email con las instrucciones para completar el test.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-6 py-3 text-white font-medium rounded-xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {helpTestCode && (
        <ClinicalTestHelpModal
          testCode={helpTestCode}
          onClose={() => setHelpTestCode(null)}
        />
      )}
    </div>
  );
}
