'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchSession } from '@/lib/session';
import { getUserRole } from '@/lib/getUserRole';
import { useRouter } from 'next/navigation';
import ActivePatientIndicator from '@/components/ActivePatientIndicator';
import PatientPicker from '@/components/PatientPicker';
import AssignedTestsSection from '@/components/AssignedTestsSection';
import ClinicalEvaluationsSection from '@/components/ClinicalEvaluationsSection';
import PatientResultsSection from '@/components/PatientResultsSection';
import { Patient } from '@/lib/patient-api';
import { getActivePatientId, getActivePatientName } from '@/lib/active-patient';
import { clinicalTestsRegistry } from '@/lib/clinicalTests.registry';
import ClinicalTestHelpModal from '@/components/ClinicalTestHelpModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://analisis-cabalistico-alma.onrender.com/api';

export default function TherapistDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [role, setRole] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [analysisRefreshKey, setAnalysisRefreshKey] = useState(0);
  const [scdfPrereqs, setScdfPrereqs] = useState([
    {
      id: 'screenings',
      label: 'Screenings psicologicos minimos',
      description: 'Requiere al menos 2 screenings completados.',
      status: 'pendiente' as 'pendiente' | 'asignado' | 'completado',
      requiredCount: 2,
      completedCount: 0,
    },
    {
      id: 'cabalistic-analysis',
      label: 'Analisis cabalistico previo',
      description: 'Requiere al menos 1 analisis cabalistico completado.',
      status: 'pendiente' as 'pendiente' | 'asignado' | 'completado',
      requiredCount: 1,
      completedCount: 0,
    },
  ]);

  useEffect(() => {
    fetchSession().then((session) => {
      if (session.user) {
        setUserName(session.user.username || '');
      }
    });
    getUserRole().then((userRole) => {
      setRole(userRole);
      // STRICT: Only therapist and admin (for simulation) can access
      // Admin can simulate, but should NOT see admin-specific options
      if (userRole && userRole !== 'therapist' && userRole !== 'admin') {
        router.replace('/dashboard');
      }
    });
  }, [router]);

  const isAdmin = role === 'admin';

  const handleSelectPatient = () => {
    setPickerOpen(true);
  };

  const handlePatientSelected = (patient: Patient) => {
    // Patient is already set in PatientPicker via setActivePatientId
    // Just close the picker - ActivePatientIndicator will update via event listener
    console.log('Patient selected:', patient);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Workspace Clínico
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Panel profesional del terapeuta</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <span
              className="px-3 py-1.5 rounded-md text-xs font-medium text-white"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              Rol activo: Terapeuta
            </span>
            {isAdmin && (
              <span className="text-xs text-gray-500 italic">
                Vista simulada (Admin)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Active Patient Indicator */}
      <ActivePatientIndicator onSelectPatient={handleSelectPatient} />

      {/* Patient Picker Modal */}
      <PatientPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePatientSelected}
      />

      {/* Main Workspace - Patient Context Only */}
      <div className="space-y-6">
        <ScdfTrackingPanel
          prerequisites={scdfPrereqs}
          onAssign={(id) => {
            setScdfPrereqs((prev) =>
              prev.map((item) =>
                item.id === id
                  ? { ...item, status: item.status === 'pendiente' ? 'asignado' : item.status }
                  : item
              )
            );
          }}
          onMarkCompleted={(id) => {
            setScdfPrereqs((prev) =>
              prev.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      status: 'completado',
                      completedCount: item.requiredCount,
                    }
                  : item
              )
            );
          }}
        />

        {/* Section 1: Assigned Tests (patient_self) */}
        {/* Shows tests assigned to active patient with status: pending / completed */}
        <AssignedTestsSection />

        {/* Section 1.5: Therapist Clinical Catalog (reference only) */}
        <ClinicalCatalogSection />

        {/* Section 2: Therapist Clinical Actions */}
        <TherapistClinicalActions
          onSuccess={() => setAnalysisRefreshKey((prev) => prev + 1)}
        />

        {/* Section 2: Clinical Evaluations (therapist_clinical) */}
        {/* Run SCDF, Run Integrative Interview, Results are READ-ONLY after save */}
        <ClinicalEvaluationsSection key={`clinical-evals-${analysisRefreshKey}`} />

        {/* Section 3: Results Panel */}
        {/* List results per patient, expandable detail view, clear separation between test types */}
        <PatientResultsSection />
      </div>

      {/* Footer - Removed for cleaner UI */}
    </div>
  );
}

const PRE_ANALYSIS_TESTS = [
  { name: 'PHQ-9', note: 'Disponible' },
  { name: 'GAD-7', note: 'Disponible' },
  { name: 'BAI', note: 'Disponible' },
  { name: 'SCL-90-R', note: 'Disponible' },
  { name: 'STAI', note: 'Disponible' },
  { name: 'SCID-5-RV', note: 'Requiere adaptacion clinica' },
  { name: 'Otros instrumentos de screening', note: 'Disponibles en el sistema' },
];

const CLINICAL_ANALYSES = [
  {
    name: 'Numerologia basica / completa',
    description: 'Mapa clinico cabalistico para patrones personales.',
    requiredTests: ['PHQ-9', 'GAD-7'],
    recommendedTests: ['BAI'],
    readinessNotes: 'Requiere al menos PHQ-9 y GAD-7 completados.',
  },
  {
    name: 'Tarot terapeutico',
    description: 'Analisis clinico simbolico guiado por terapeuta.',
    requiredTests: ['PHQ-9'],
    recommendedTests: ['STAI'],
    readinessNotes: 'Requiere perfil de nacimiento completo.',
  },
  {
    name: 'Astrologia cabalistica (Kerykeion)',
    description: 'Lectura clinica astrologica aplicada.',
    requiredTests: ['GAD-7'],
    recommendedTests: ['SCL-90-R'],
    readinessNotes: 'Requiere datos de nacimiento verificados.',
  },
  {
    name: 'Gematria clinica',
    description: 'Analisis numerologico cabalistico focalizado.',
    requiredTests: ['PHQ-9'],
    recommendedTests: [],
    readinessNotes: 'Requiere datos basicos del paciente.',
  },
  {
    name: 'Otros modulos cabalisticos legacy',
    description: 'Herramientas clinicas heredadas, sin cambios de logica.',
    requiredTests: [],
    recommendedTests: ['GAD-7', 'BAI'],
    readinessNotes: 'Depende del modulo seleccionado.',
  },
];

const GATE_STATUS = {
  pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800' },
  completed: { label: 'Completado', className: 'bg-green-100 text-green-800' },
  recommended: { label: 'Recomendado', className: 'bg-blue-100 text-blue-800' },
};

const TEST_STATUS_BADGES = {
  disponible: { label: 'Disponible', className: 'bg-green-100 text-green-800' },
  enDesarrollo: { label: 'En desarrollo', className: 'bg-gray-100 text-gray-600' },
};

const LEGACY_MODULES = [
  {
    id: 'phq-9',
    name: 'PHQ-9',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Screening clinico legacy para sintomas depresivos.',
    legacyStatus: 'existente',
  },
  {
    id: 'gad-7',
    name: 'GAD-7',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Screening clinico legacy para ansiedad generalizada.',
    legacyStatus: 'existente',
  },
  {
    id: 'bai',
    name: 'BAI',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Inventario de ansiedad clinica (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'bdi-ii',
    name: 'BDI-II',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Inventario depresivo clinico (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'scl-90',
    name: 'SCL-90',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Screening psicopatologico multidimensional (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'scl-90-r',
    name: 'SCL-90-R',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Version revisada de screening psicopatologico (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'stai',
    name: 'STAI',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Ansiedad estado-rasgo (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'pai',
    name: 'PAI',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Inventario de personalidad clinica (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'professional-pai',
    name: 'PAI Profesional',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Version profesional de PAI (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'mcmi-iv',
    name: 'MCMI-IV',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Inventario clinico multiaxial (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'scid-5-rv',
    name: 'SCID-5-RV',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Entrevista clinica estructurada (legacy).',
    legacyStatus: 'existente',
    notes: 'Requiere adaptacion clinica.',
  },
  {
    id: 'scid5',
    name: 'SCID-5',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Modulo estructurado de evaluacion (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'adhd',
    name: 'ADHD',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Screening clinico TDAH (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'ocd',
    name: 'OCD',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Screening clinico TOC (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'ptsd',
    name: 'PTSD',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Screening clinico TEPT (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'insomnia',
    name: 'Insomnia',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Screening clinico de insomnio (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'eating',
    name: 'Eating',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Screening clinico de alimentacion (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'substance',
    name: 'Substance',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Screening clinico de consumo de sustancias (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'psicologia',
    name: 'Psicologia',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Modulo psicologico legacy general.',
    legacyStatus: 'existente',
  },
  {
    id: 'wellness',
    name: 'Wellness',
    category: 'Pre-analisis (psicologico)',
    shortDescription: 'Test de bienestar integral (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'gematria',
    name: 'Gematria',
    category: 'Analisis cabalistico',
    shortDescription: 'Calculo cabalistico numerico (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'shekinah',
    name: 'Analisis Shekinah',
    category: 'Analisis cabalistico',
    shortDescription: 'Metodo cabalistico Atlantis (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'tarot',
    name: 'Tarot Terapeutico',
    category: 'Analisis cabalistico',
    shortDescription: 'Lectura terapeutica simbolica (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'complete-numerology',
    name: 'Numerologia Completa',
    category: 'Analisis cabalistico',
    shortDescription: 'Analisis numerologico profundo (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'cabalistic-astrology',
    name: 'Astrologia Cabalistica',
    category: 'Analisis cabalistico',
    shortDescription: 'Astrologia integrada con cabala (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'astrology-kerykeion',
    name: 'Astrologia Tecnica (Kerykeion)',
    category: 'Analisis cabalistico',
    shortDescription: 'Carta tecnica precisa (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'soul-map',
    name: 'Mapa del Alma',
    category: 'Analisis cabalistico',
    shortDescription: 'Analisis de sefirot y diseno energetico (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'tree-of-life',
    name: 'Arbol de la Vida',
    category: 'Analisis cabalistico',
    shortDescription: 'Metodo cabalistico del arbol sefirotico (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'soul-number',
    name: 'Numero del Alma',
    category: 'Analisis cabalistico',
    shortDescription: 'Calculo del numero del alma (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'tikun',
    name: 'Tikun',
    category: 'Analisis cabalistico',
    shortDescription: 'Correccion del alma y mision de vida (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'mazal',
    name: 'Mazal',
    category: 'Analisis cabalistico',
    shortDescription: 'Destino y suerte cabalistica (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: '72-names',
    name: '72 Nombres',
    category: 'Analisis cabalistico',
    shortDescription: 'Trabajo cabalistico con los 72 nombres (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'shemot',
    name: 'Shemot',
    category: 'Analisis cabalistico',
    shortDescription: 'Poder de los nombres en cabala (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'complete',
    name: 'Analisis Cabalistico Completo',
    category: 'Analisis cabalistico',
    shortDescription: 'Integracion de metodos cabalisticos (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'financial-abundance',
    name: 'Abundancia Financiera',
    category: 'Analisis cabalistico',
    shortDescription: 'Analisis numerologico financiero (legacy).',
    legacyStatus: 'existente',
  },
  {
    id: 'scdf',
    name: 'SCDF',
    category: 'Herramienta clinica',
    shortDescription: 'Structured Clinical Diagnostic Framework (legacy workspace).',
    legacyStatus: 'existente',
    notes: 'Herramienta clinica propietaria. No modificar.',
  },
];

const PSYCH_TEST_GENRES = [
  {
    genre: 'Estado de Animo y Depresion',
    description: 'Screening clinico de sintomas afectivos.',
    tests: [
      { name: 'PHQ-9', intent: 'Screening breve' },
      { name: 'BDI-II', intent: 'Evaluacion amplia' },
    ],
  },
  {
    genre: 'Ansiedad y Estres',
    description: 'Exploracion clinica de ansiedad y activacion.',
    tests: [
      { name: 'GAD-7', intent: 'Screening breve' },
      { name: 'BAI', intent: 'Evaluacion amplia' },
      { name: 'STAI', intent: 'Estado/rasgo' },
    ],
  },
  {
    genre: 'Personalidad y Psicopatologia',
    description: 'Perfil clinico de rasgos y psicopatologia.',
    tests: [
      { name: 'PAI', intent: 'Multidimensional' },
      { name: 'PAI Profesional', intent: 'Multidimensional' },
      { name: 'MCMI-IV', intent: 'Evaluacion amplia' },
    ],
  },
  {
    genre: 'Screening General / Multidimensional',
    description: 'Barrido clinico amplio de sintomas.',
    tests: [
      { name: 'SCL-90', intent: 'Multidimensional' },
      { name: 'SCL-90-R', intent: 'Multidimensional' },
      { name: 'Screening Psicologico General', intent: 'Screening breve' },
    ],
  },
  {
    genre: 'Entrevistas Estructuradas',
    description: 'Instrumentos estructurados para diagnostico clinico.',
    tests: [
      { name: 'SCID-5-RV', intent: 'Requiere adaptacion clinica' },
      { name: 'SCID-5', intent: 'Requiere adaptacion clinica' },
    ],
  },
  {
    genre: 'Trauma y Estres Postraumatico',
    description: 'Exploracion clinica de trauma.',
    tests: [
      { name: 'PTSD', intent: 'Screening breve' },
    ],
  },
  {
    genre: 'Neurodesarrollo y Atencion',
    description: 'Evaluacion clinica de atencion.',
    tests: [
      { name: 'ADHD', intent: 'Screening breve' },
    ],
  },
  {
    genre: 'TOC',
    description: 'Exploracion clinica de sintomas obsesivos.',
    tests: [
      { name: 'OCD', intent: 'Screening breve' },
    ],
  },
  {
    genre: 'Sueno y Ritmos',
    description: 'Sintomas de sueno y descanso.',
    tests: [
      { name: 'Insomnia Index', intent: 'Screening breve' },
    ],
  },
  {
    genre: 'Conducta Alimentaria',
    description: 'Indicadores clinicos de conducta alimentaria.',
    tests: [
      { name: 'Eating Disorder Screen', intent: 'Screening breve' },
    ],
  },
  {
    genre: 'Consumo de Sustancias',
    description: 'Exploracion clinica de consumo.',
    tests: [
      { name: 'Substance Use Screening', intent: 'Screening breve' },
    ],
  },
  {
    genre: 'Bienestar',
    description: 'Indicadores de bienestar general.',
    tests: [
      { name: 'Wellness Assessment', intent: 'Screening breve' },
    ],
  },
];

function ClinicalCatalogSection() {
  const [openKnowledgeCode, setOpenKnowledgeCode] = useState<string | null>(null);
  const grouped = clinicalTestsRegistry.reduce<Record<string, typeof clinicalTestsRegistry>>((acc, test) => {
    acc[test.domain] = acc[test.domain] || [];
    acc[test.domain].push(test);
    return acc;
  }, {});

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Catalogo Clinico del Terapeuta</h2>
        <p className="text-sm text-gray-500">
          Mapa de capacidades clinicas. No es marketplace ni ejecuta acciones.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([domain, tests]) => (
          <div key={domain} className="border border-gray-200 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{domain}</h3>
                <p className="text-xs text-gray-500">Tests patient_self (informativo, sin ejecucion).</p>
              </div>
            </div>
            <div className="space-y-2">
              {tests.map((test) => {
                const status = test.implemented ? TEST_STATUS_BADGES.disponible : TEST_STATUS_BADGES.enDesarrollo;
                return (
                  <div
                    key={test.test_code}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border border-gray-100 bg-white p-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">{test.display_name}</div>
                      <div className="text-xs text-gray-500">Codigo: {test.test_code}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase px-2 py-1 rounded-full ${status.className}`}>
                        {status.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpenKnowledgeCode(test.test_code)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Que es este test?
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ClinicalTestHelpModal
        testCode={openKnowledgeCode}
        onClose={() => setOpenKnowledgeCode(null)}
      />
    </div>
  );
}
function ScdfTrackingPanel({
  prerequisites,
  onAssign,
  onMarkCompleted,
}: {
  prerequisites: Array<{
    id: string;
    label: string;
    description: string;
    status: 'pendiente' | 'asignado' | 'completado';
    requiredCount: number;
    completedCount: number;
  }>;
  onAssign: (id: string) => void;
  onMarkCompleted: (id: string) => void;
}) {
  const completedItems = prerequisites.filter((item) => item.status === 'completado').length;
  const progress = prerequisites.length > 0 ? Math.round((completedItems / prerequisites.length) * 100) : 0;

  const statusStyles = {
    pendiente: 'bg-amber-100 text-amber-800',
    asignado: 'bg-blue-100 text-blue-800',
    completado: 'bg-green-100 text-green-800',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Seguimiento Clinico (SCDF)</h2>
          <p className="text-sm text-gray-500">
            Seguimiento clinico - no ejecuta acciones.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Acceso disponible aunque los prerrequisitos esten pendientes.
          </p>
        </div>
        <Link
          href="/dashboard/tools/scdf"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          Ver SCDF
        </Link>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Progreso</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full"
            style={{ width: `${progress}%`, backgroundColor: 'var(--accent-color)' }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {prerequisites.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-md p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-gray-900">{item.label}</div>
                <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {item.completedCount}/{item.requiredCount} completados
                </div>
              </div>
              <span
                className={`text-[10px] uppercase px-2 py-1 rounded-full ${statusStyles[item.status]}`}
              >
                {item.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onAssign(item.id)}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Asignar al paciente
              </button>
              <button
                type="button"
                onClick={() => onMarkCompleted(item.id)}
                className="px-3 py-1.5 text-xs font-medium text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                Marcar completado
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TherapistClinicalActions({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [activePatientName, setActivePatientName] = useState<string | null>(null);
  const [patientProfile, setPatientProfile] = useState<any | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const syncActivePatient = () => {
      const id = getActivePatientId();
      const name = getActivePatientName();
      setActivePatientId(id);
      setActivePatientName(name);
    };

    syncActivePatient();

    const handleChange = () => syncActivePatient();
    window.addEventListener('activePatientChanged', handleChange);
    window.addEventListener('storage', handleChange);
    return () => {
      window.removeEventListener('activePatientChanged', handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  useEffect(() => {
    if (!activePatientId) {
      setPatientProfile(null);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      setPatientProfile(null);
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/therapist/patients/${activePatientId}/profile/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
        });
        if (!response.ok) {
          setPatientProfile(null);
          return;
        }
        const data = await response.json();
        setPatientProfile(data);
      } catch {
        setPatientProfile(null);
      }
    };

    loadProfile();
  }, [activePatientId]);

  const actions = useMemo(
    () => [
      { key: 'tarot', label: 'Ejecutar Tarot Terapéutico', endpoint: 'tarot-analysis' },
      { key: 'astrology', label: 'Ejecutar Astrología Cabalística', endpoint: 'astrology-kerykeion' },
      { key: 'gematria', label: 'Ejecutar Gematría Clínica', endpoint: 'gematria-analysis' },
    ],
    []
  );

  const buildPayload = () => {
    if (!patientProfile) return {};
    return {
      profile_snapshot: {
        legal_full_name: patientProfile.legal_full_name,
        birth_date: patientProfile.birth_date,
        birth_time: patientProfile.birth_time,
        birth_city: patientProfile.birth_city,
        birth_country: patientProfile.birth_country,
      },
    };
  };

  const handleExecute = async (action: { key: string; endpoint: string }) => {
    if (!activePatientId) {
      setMessage({ type: 'error', text: 'Selecciona un paciente activo para ejecutar la acción.' });
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      setMessage({ type: 'error', text: 'Sesión no válida. Vuelve a iniciar sesión.' });
      return;
    }

    setLoadingAction(action.key);
    setMessage(null);

    try {
      const payload = buildPayload();
      const response = await fetch(
        `${API_URL}/therapist/patients/${activePatientId}/${action.endpoint}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('No se pudo ejecutar la acción clínica.');
      }

      setMessage({ type: 'success', text: 'Análisis generado y guardado.' });
      onSuccess();
    } catch {
      setMessage({ type: 'error', text: 'No se pudo ejecutar la acción clínica.' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Acciones Clínicas del Terapeuta</h2>
        <p className="text-sm text-gray-500">
          Acciones clínicas exclusivas del terapeuta (análisis sin cuestionarios).
        </p>
        {activePatientName && (
          <p className="text-sm text-gray-500 mt-1">
            Paciente activo: <span className="font-medium">{activePatientName}</span>
          </p>
        )}
      </div>

      {message && (
        <div
          className={`mb-4 rounded-md border p-3 text-sm ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        {actions.map((action) => {
          const disabled = !activePatientId || loadingAction !== null;
          const isLoading = loadingAction === action.key;

          return (
            <button
              key={action.key}
              onClick={() => handleExecute(action)}
              disabled={disabled}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              {isLoading ? 'Ejecutando...' : action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
