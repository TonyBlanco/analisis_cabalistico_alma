'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, Save, ArrowLeft, FileText, CheckCircle2, XCircle, 
  AlertTriangle, ClipboardList, User, Calendar, Stethoscope, HelpCircle
} from 'lucide-react';
import TherapistRoute from '@/components/TherapistRoute';
import { getPatientPreviousTests } from '@/lib/test-api';
import { useToast, ToastContainer } from '@/components/ui/toast';
import SCDFHelpModal from '@/components/SCDFHelpModal';
import { scdf_es as t } from '@/lib/i18n/es/scdf';
import { createTherapistNote } from '@/lib/therapist-notes-api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

function computeAgeFromBirthDate(value: unknown): number {
  if (typeof value !== 'string') return 0;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(0, age);
}

// Template JSON inicial (compatible con compute_scdf)
const INITIAL_TEMPLATE = {
  metadata: {
    framework_version: "1.0",
    framework_name: "Structured Consultative Framework (SCDF)",
    jurisdiction: "Internal - Consultative Practice",
    based_on: "Estructura propia para formulación y registro consultivo (no diagnóstico).",
    note: "Herramienta orientativa de formulación y registro. No automatiza diagnóstico ni sustituye el juicio profesional.",
    created_at: new Date().toISOString().split('T')[0]
  },
  client_data: {
    nombre: "",
    edad: 0,
    fecha: new Date().toISOString().split('T')[0]
  },
  modules: [
    {
      module_id: "MOOD_001",
      module_name: "Estado de ánimo y energía",
      status: "evaluated",
      core_gate: {
        present: false,
        criteria: [
          "Persistent mood disturbance",
          "Duration criteria met",
          "Functional impairment present"
        ]
      },
      additional_criteria: [],
      exclusion_flags: {
        substance_related: false,
        medical_condition: false,
        better_explained_by_other_disorder: false
      },
      exclusions: {
        substance_use_disorder: false,
        medical_condition_related: false,
        bereavement: false,
        other_disorder_explanation: false
      }
    },
    {
      module_id: "ANXIETY_001",
      module_name: "Ansiedad y activación",
      status: "evaluated",
      core_gate: {
        present: false,
        criteria: [
          "Excessive anxiety or worry",
          "Difficulty controlling worry",
          "Duration criteria met"
        ]
      },
      additional_criteria: [],
      exclusion_flags: {
        substance_related: false,
        medical_condition: false,
        better_explained_by_other_disorder: false
      },
      exclusions: {
        substance_use_disorder: false,
        medical_condition_related: false,
        other_disorder_explanation: false
      }
    },
    {
      module_id: "PSYCHOSIS_001",
      module_name: "Percepción y realidad",
      status: "evaluated",
      core_gate: {
        present: false,
        criteria: [
          "Presence of delusions",
          "Presence of hallucinations",
          "Disorganized speech or behavior"
        ]
      },
      additional_criteria: [],
      exclusion_flags: {
        substance_related: false,
        medical_condition: false,
        better_explained_by_other_disorder: false
      },
      exclusions: {
        substance_use_disorder: false,
        medical_condition_related: false,
        other_disorder_explanation: false
      }
    },
    {
      module_id: "TRAUMA_001",
      module_name: "Estrés y experiencias difíciles",
      status: "evaluated",
      core_gate: {
        present: false,
        criteria: [
          "Exposure to traumatic event",
          "Duration criteria met"
        ]
      },
      additional_criteria: [],
      exclusion_flags: {
        substance_related: false,
        medical_condition: false,
        better_explained_by_other_disorder: false
      },
      exclusions: {
        substance_use_disorder: false,
        medical_condition_related: false,
        other_disorder_explanation: false
      }
    },
    {
      module_id: "SUBSTANCE_001",
      module_name: "Consumo y hábitos",
      status: "evaluated",
      core_gate: {
        present: false,
        criteria: [
          "Problematic pattern of substance use",
          "Clinically significant impairment"
        ]
      },
      additional_criteria: [],
      exclusion_flags: {
        substance_related: false,
        medical_condition: false,
        better_explained_by_other_disorder: false
      },
      exclusions: {
        substance_use_disorder: false,
        medical_condition_related: false,
        other_disorder_explanation: false
      }
    },
    {
      module_id: "PERSONALITY_001",
      module_name: "Patrones relacionales y de personalidad",
      status: "evaluated",
      core_gate: {
        present: false,
        criteria: [
          "Enduring pattern of inner experience and behavior",
          "Pattern is inflexible and pervasive",
          "Onset in adolescence or early adulthood"
        ]
      },
      additional_criteria: [],
      exclusion_flags: {
        substance_related: false,
        medical_condition: false,
        better_explained_by_other_disorder: false
      },
      exclusions: {
        substance_use_disorder: false,
        medical_condition_related: false,
        other_disorder_explanation: false
      }
    },
    {
      module_id: "EATING_001",
      module_name: "Alimentación y autocuidado",
      status: "evaluated",
      core_gate: {
        present: false,
        criteria: [
          "Disturbance in eating behavior",
          "Significant weight or shape concerns"
        ]
      },
      additional_criteria: [],
      exclusion_flags: {
        substance_related: false,
        medical_condition: false,
        better_explained_by_other_disorder: false
      },
      exclusions: {
        substance_use_disorder: false,
        medical_condition_related: false,
        other_disorder_explanation: false
      }
    },
    {
      module_id: "SLEEP_001",
      module_name: "Sueño y descanso",
      status: "evaluated",
      core_gate: {
        present: false,
        criteria: [
          "Disturbance in sleep quantity or quality",
          "Clinically significant distress or impairment"
        ]
      },
      additional_criteria: [],
      exclusion_flags: {
        substance_related: false,
        medical_condition: false,
        better_explained_by_other_disorder: false
      },
      exclusions: {
        substance_use_disorder: false,
        medical_condition_related: false,
        other_disorder_explanation: false
      }
    }
  ]
};

interface SCDFModule {
  module_id: string;
  module_name: string;
  status: string;
  core_gate: {
    present: boolean;
    criteria: string[];
  };
  additional_criteria: Array<{
    criterion_id: string;
    description: string;
    met: boolean;
    evidence: string;
  }>;
  exclusion_flags: {
    substance_related: boolean;
    medical_condition: boolean;
    better_explained_by_other_disorder: boolean;
  };
  exclusions: Record<string, any>;
}

interface SCDFData {
  metadata: Record<string, any>;
  client_data: {
    nombre: string;
    edad: number;
    fecha: string;
  };
  modules: SCDFModule[];
}

type ModuleEvidence = {
  count: number;
  summaries: string[];
};

const SCDF_MODULE_TEST_MAP: Record<string, string[]> = {
  MOOD_001: ['phq-9', 'bdi-ii'],
  ANXIETY_001: ['gad-7', 'bai'],
  TRAUMA_001: ['ptsd-check'],
  SUBSTANCE_001: ['substance-use'],
  PERSONALITY_001: ['professional-pai', 'mcmi-iv'],
  EATING_001: ['eating-disorder'],
  SLEEP_001: ['insomnia-index', 'isi'],
};

function formatShortDate(value: unknown): string {
  try {
    if (!value) return '';
    const d = new Date(String(value));
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-ES');
  } catch {
    return '';
  }
}

function summarizeTestResult(tr: any): string {
  const fallbackCode = tr?.test_module?.code || tr?.test_module_code || tr?.test_id;
  const name = tr?.test_module?.name || tr?.test_module_name || fallbackCode || 'Test';
  const date = formatShortDate(tr?.created_at || tr?.completed_at || tr?.updated_at);
  const computed = tr?.result_data?.result ?? tr?.result_data;
  const score = computed?.total_score ?? computed?.puntuaciones?.total ?? computed?.puntuaciones?.total_score;
  const severity = computed?.severity_label ?? computed?.interpretacion?.gravedad ?? computed?.interpretacion?.nivel;
  const extras = [
    typeof score === 'number' || typeof score === 'string' ? `puntaje ${score}` : null,
    typeof severity === 'string' && severity.trim() ? severity.trim() : null,
  ].filter(Boolean);
  const tail = extras.length ? ` — ${extras.join(' · ')}` : '';
  return `${name}${date ? ` (${date})` : ''}${tail}`;
}

export default function SCDFPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams?.get('patientId') || searchParams?.get('patient_id');
  
  const { toasts, showToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scdfData, setScdfData] = useState<SCDFData>(INITIAL_TEMPLATE);
  const [clinicianNotes, setClinicianNotes] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [patient, setPatient] = useState<any>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [moduleEvidence, setModuleEvidence] = useState<Record<string, ModuleEvidence>>({});

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  const loadLatestSCDFRecord = async (parsedPatientId: number, token: string) => {
    const response = await fetch(
      `${API_URL}/analysis-records/?patient_id=${encodeURIComponent(String(parsedPatientId))}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      }
    );

    if (!response.ok) return;

    const body = await response.json().catch(() => ({}));
    const items = Array.isArray(body) ? body : (body?.results || []);
    const latest = items.find((r: any) => String(r?.module_code || '').toLowerCase() === 'scdf');
    const raw = latest?.raw_input;
    if (!raw || typeof raw !== 'object') return;

    const { clinician_notes, ...rest } = raw as any;
    if (rest?.modules && rest?.client_data) {
      setScdfData(rest as SCDFData);
    }
    if (typeof clinician_notes === 'string') {
      setClinicianNotes(clinician_notes);
    }
  };

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/therapist/patients/${patientId}/profile/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = body?.error || body?.detail || body?.message || `Error cargando paciente (${response.status})`;
        showToast({ type: 'error', message });
        return;
      }

      const data = await response.json();
      setPatient(data);

      const fullName = (data?.full_name || data?.legal_full_name || '').toString();
      const birthDate = (data?.birth_date || '').toString();
      const age = typeof data?.age === 'number' ? data.age : computeAgeFromBirthDate(birthDate);

      // Pre-llenar datos del cliente (nombre + fecha de nacimiento)
      setScdfData((prev) => ({
        ...prev,
        client_data: {
          nombre: fullName,
          edad: age || 0,
          fecha: birthDate || new Date().toISOString().split('T')[0],
        },
      }));

      // Importar tests previos del paciente y marcarlos para revisión
      try {
        const parsedPatientId = patientId ? parseInt(patientId, 10) : NaN;
        if (!Number.isNaN(parsedPatientId)) {
          await loadLatestSCDFRecord(parsedPatientId, token);
          const prev = await getPatientPreviousTests({ patient_id: parsedPatientId });
          const results = Array.isArray(prev?.results) ? prev.results : [];

          const byModule: Record<string, ModuleEvidence> = {};
          for (const tr of results) {
            const code = tr?.test_module?.code || (tr as any)?.test_module_code || (tr as any)?.test_id;
            if (!code) continue;
            for (const [moduleId, codes] of Object.entries(SCDF_MODULE_TEST_MAP)) {
              if (!codes.includes(String(code))) continue;
              const entry = byModule[moduleId] || { count: 0, summaries: [] };
              entry.count += 1;
              entry.summaries.push(summarizeTestResult(tr));
              byModule[moduleId] = entry;
            }
          }
          setModuleEvidence(byModule);

          // Prefill an auto-criterion (review marker) per module with evidence
          setScdfData((prevState) => ({
            ...prevState,
            modules: prevState.modules.map((m) => {
              const evidence = byModule[m.module_id];
              if (!evidence || evidence.count <= 0) return m;

              const autoId = `AUTO_TESTS_${m.module_id}`;
              const already = m.additional_criteria?.some((c) => c?.criterion_id === autoId);
              if (already) return m;

              const evidenceText = evidence.summaries.join('\n');
              return {
                ...m,
                status: 'review',
                additional_criteria: [
                  ...(m.additional_criteria || []),
                  {
                    criterion_id: autoId,
                    description: 'Resultados previos detectados (marcar para revisión)',
                    met: false,
                    evidence: evidenceText,
                  },
                ],
              };
            }),
          }));
        }
      } catch (e) {
        console.warn('Error importing previous tests into SCDF:', e);
      }
    } catch (err: any) {
      console.error('Error loading patient:', err);
      showToast({ type: 'error', message: err?.message || 'Error cargando paciente' });
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const toggleCoreGate = (moduleId: string) => {
    setScdfData(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.module_id === moduleId 
          ? { ...m, core_gate: { ...m.core_gate, present: !m.core_gate.present } }
          : m
      )
    }));
  };

  const addCriterion = (moduleId: string) => {
    setScdfData(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.module_id === moduleId 
          ? {
              ...m,
              additional_criteria: [
                ...m.additional_criteria,
                {
                  criterion_id: `${moduleId}_CRIT_${m.additional_criteria.length + 1}`,
                  description: "",
                  met: false,
                  evidence: ""
                }
              ]
            }
          : m
      )
    }));
  };

  const updateCriterion = (moduleId: string, index: number, field: string, value: any) => {
    setScdfData(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.module_id === moduleId 
          ? {
              ...m,
              additional_criteria: m.additional_criteria.map((c, i) => 
                i === index ? { ...c, [field]: value } : c
              )
            }
          : m
      )
    }));
  };

  const removeCriterion = (moduleId: string, index: number) => {
    setScdfData(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.module_id === moduleId 
          ? {
              ...m,
              additional_criteria: m.additional_criteria.filter((_, i) => i !== index)
            }
          : m
      )
    }));
  };

  const updateExclusionFlag = (moduleId: string, flag: string, value: boolean) => {
    setScdfData(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.module_id === moduleId 
          ? {
              ...m,
              exclusion_flags: { ...m.exclusion_flags, [flag]: value }
            }
          : m
      )
    }));
  };

  // Helper para obtener nombre traducido del módulo
  const getModuleName = (moduleId: string, moduleName: string): string => {
    return t.modules[moduleId as keyof typeof t.modules] || moduleName;
  };

  // Helper para traducir criterios core gate
  const translateCriterion = (criterion: string): string => {
    return t.coreCriteria[criterion as keyof typeof t.coreCriteria] || criterion;
  };

  // Helper para traducir exclusion flags
  const translateExclusionFlag = (flag: string): string => {
    return t.exclusionFlags[flag as keyof typeof t.exclusionFlags] || flag.replace(/_/g, ' ');
  };

  const handleSubmit = async () => {
    if (!scdfData.client_data.nombre || !scdfData.client_data.fecha) {
      showToast({
        type: 'error',
        message: t.messages.clientDataRequired
      });
      return;
    }

    // VALIDACIÓN CRÍTICA: Evaluación SCDF requiere paciente seleccionado
    if (!patientId) {
      showToast({
        type: 'error',
        message: 'Debes seleccionar un paciente antes de guardar la evaluación SCDF'
      });
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const birthSnapshot = {
        legal_name: (patient?.full_name || patient?.legal_full_name || scdfData?.client_data?.nombre || '').toString(),
        birth_date: (patient?.birth_date || scdfData?.client_data?.fecha || '').toString(),
        birth_time: (patient?.birth_time || patient?.birth_hour || '').toString(),
        city: (patient?.birth_city || patient?.city || '').toString(),
        country: (patient?.birth_country || patient?.country || '').toString(),
        lat: patient?.birth_lat ?? patient?.lat ?? null,
        lng: patient?.birth_lng ?? patient?.lng ?? null,
        timezone: (patient?.birth_timezone || patient?.timezone || '').toString(),
        geocode_source: (patient?.geocode_source || '').toString(),
      };

      const payload = {
        kind: 'legacy',
        module_code: 'SCDF',
        role_context: 'therapist',
        execution_mode: 'therapist_clinical',
        visibility: 'therapist',
        patient: patientId ? parseInt(patientId, 10) : undefined,
        birth_data_snapshot: birthSnapshot,
        algorithm_snapshot: {
          engine: 'SCDF_WORKSPACE',
          version: '1.0',
          build_hash: null,
          params: { schema: 'scdf_v1' },
        },
        raw_input: {
          ...scdfData,
          clinician_notes: (clinicianNotes || '').trim() || undefined,
        },
        therapist_annotations: {
          notes: (clinicianNotes || '').trim() || '',
          visible_to_patient: false,
        },
      };

      const response = await fetch(`${API_URL}/analysis-records/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = body?.detail || body?.error || body?.message || 'Error al guardar la evaluación SCDF';
        throw new Error(message);
      }

      await response.json().catch(() => null);

      const noteText = (clinicianNotes || '').trim();
      if (noteText && patientId) {
        try {
          await createTherapistNote({
            patientId: parseInt(patientId, 10),
            title: 'SCDF - Notas del clínico',
            content: noteText,
            tags: 'scdf',
          });
        } catch (e: any) {
          console.warn('Error saving SCDF notes to patient history:', e);
          showToast({
            type: 'error',
            message: e?.message || 'La evaluación se guardó, pero falló guardar las notas en el historial.',
          });
        }
      }
      
      showToast({
        type: 'success',
        message: t.messages.saveSuccess
      });

      // Redirigir a la ficha del paciente
      if (patientId) {
        router.push(`/dashboard/therapist/patients/${encodeURIComponent(String(patientId))}`);
      } else {
        router.push('/dashboard/therapist/patients');
      }
    } catch (err: any) {
      console.error('Error submitting SCDF:', err);
      showToast({
        type: 'error',
        message: err.message || 'Error al guardar la evaluación SCDF'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <TherapistRoute>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      </TherapistRoute>
    );
  }

  return (
    <TherapistRoute>
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-amber-400 flex items-center gap-2">
                  <Stethoscope className="w-8 h-8" />
                  {t.page.title}
                </h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHelpModalOpen(true)}
                  className="text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                  title={t.helpModal.button.label}
                >
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                {t.page.subtitle}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-900 hover:text-slate-100 disabled:opacity-100 disabled:text-slate-400 disabled:bg-slate-950/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.buttons.back}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.buttons.saving}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t.buttons.saveEvaluation}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Client Data */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                {t.sections.clientData}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="client-name" className="text-slate-300">{t.fields.fullName}</Label>
                <Input
                  id="client-name"
                  value={scdfData.client_data.nombre}
                  onChange={(e) => setScdfData(prev => ({
                    ...prev,
                    client_data: { ...prev.client_data, nombre: e.target.value }
                  }))}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                  placeholder={t.placeholders.clientName}
                />
              </div>
              <div>
                <Label htmlFor="client-age" className="text-slate-300">{t.fields.age}</Label>
                <Input
                  id="client-age"
                  type="number"
                  value={scdfData.client_data.edad || ''}
                  onChange={(e) => setScdfData(prev => ({
                    ...prev,
                    client_data: { ...prev.client_data, edad: parseInt(e.target.value) || 0 }
                  }))}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                  placeholder={t.placeholders.age}
                />
              </div>
              <div>
                <Label htmlFor="client-date" className="text-slate-300">{t.fields.evaluationDate}</Label>
                <Input
                  id="client-date"
                  type="date"
                  value={scdfData.client_data.fecha}
                  onChange={(e) => setScdfData(prev => ({
                    ...prev,
                    client_data: { ...prev.client_data, fecha: e.target.value }
                  }))}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Modules */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              {t.sections.evaluationModules}
            </h2>
            
            {scdfData.modules.map((module) => {
              const isExpanded = expandedModules.has(module.module_id);
              const hasActiveCoreGate = module.core_gate.present;
              const hasPrevTests = Boolean(moduleEvidence?.[module.module_id]?.count);
              const prevTestsTitle = hasPrevTests
                ? `Tests previos detectados:\n${(moduleEvidence[module.module_id]?.summaries || []).join('\n')}`
                : '';
              
              return (
                <Card 
                  key={module.module_id}
                  className={`bg-slate-900 border-slate-800 ${
                    hasActiveCoreGate ? 'border-l-4 border-l-amber-500' : ''
                  }`}
                >
                  <CardHeader className="cursor-pointer" onClick={() => toggleModule(module.module_id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getModuleName(module.module_id, module.module_name)}
                          {hasPrevTests ? (
                            <span
                              className="inline-flex items-center gap-1 text-xs text-slate-200"
                              title={prevTestsTitle}
                            >
                              <CheckCircle2 className="w-4 h-4 text-amber-400" />
                              Revisar
                            </span>
                          ) : null}
                        </CardTitle>
                        <Badge 
                          variant={hasActiveCoreGate ? "default" : "outline"}
                          className={
                            hasActiveCoreGate
                              ? 'bg-amber-600 text-white'
                              : 'border-slate-500 text-slate-200 bg-slate-950/40'
                          }
                        >
                          {hasActiveCoreGate ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {t.status.active}
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              {t.status.inactive}
                            </>
                          )}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCoreGate(module.module_id);
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        {hasActiveCoreGate ? t.buttons.deactivateCoreGate : t.buttons.activateCoreGate}
                      </Button>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="space-y-4">
                      {/* Core Gate Criteria */}
                      <div>
                        <Label className="text-slate-300 mb-2 block">Criterios Core Gate</Label>
                        <div className="space-y-2 bg-slate-800 p-3 rounded">
                          {module.core_gate.criteria.map((criterion, idx) => (
                            <div key={idx} className="text-sm text-slate-200 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                                {idx + 1}
                              </span>
                              {criterion}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Additional Criteria */}
                      {hasActiveCoreGate && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-slate-300">{t.moduleLabels.additionalCriteria}</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addCriterion(module.module_id)}
                              className="border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:text-white text-xs"
                            >
                              + {t.buttons.addCriterion}
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {module.additional_criteria.map((criterion, idx) => (
                              <Card key={idx} className="bg-slate-800 border-slate-700">
                                <CardContent className="p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={criterion.met}
                                        onChange={(e) => updateCriterion(module.module_id, idx, 'met', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                                      />
                                      <Label className="text-sm font-medium text-slate-100">
                                        {criterion.criterion_id}
                                      </Label>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeCriterion(module.module_id, idx)}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      {t.buttons.remove}
                                    </Button>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-slate-400">{t.moduleLabels.description}</Label>
                                    <Input
                                      value={criterion.description}
                                      onChange={(e) => updateCriterion(module.module_id, idx, 'description', e.target.value)}
                                      className="bg-slate-900 border-slate-700 text-white text-sm mt-1"
                                      placeholder={t.placeholders.criterionDescription}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-slate-400">{t.moduleLabels.evidence}</Label>
                                    <Textarea
                                      value={criterion.evidence}
                                      onChange={(e) => updateCriterion(module.module_id, idx, 'evidence', e.target.value)}
                                      className="bg-slate-900 border-slate-700 text-white text-sm mt-1"
                                      placeholder={t.placeholders.clinicalEvidence}
                                      rows={2}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            {module.additional_criteria.length === 0 && (
                              <p className="text-sm text-slate-500 text-center py-4">
                                {t.messages.noAdditionalCriteria}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Exclusion Flags */}
                      <div>
                        <Label className="text-slate-300 mb-2 block">Banderas de Exclusión</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {Object.entries(module.exclusion_flags).map(([flag, value]) => (
                            <div key={flag} className="flex items-center gap-2 bg-slate-800 p-3 rounded">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => updateExclusionFlag(module.module_id, flag, e.target.checked)}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                              />
                              <Label className="text-sm text-slate-300 capitalize">
                                {flag.replace(/_/g, ' ')}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Clinician Notes */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t.sections.clinicianNotes}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {t.clinicianNotesDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={clinicianNotes}
                onChange={(e) => setClinicianNotes(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
                placeholder={t.placeholders.clinicianNotes}
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {t.sections.summary}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-slate-400">{t.summary.activeModules}</div>
                  <div className="text-xl font-bold text-amber-400">
                    {scdfData.modules.filter(m => m.core_gate.present).length}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">{t.summary.totalCriteria}</div>
                  <div className="text-xl font-bold text-white">
                    {scdfData.modules.reduce((sum, m) => sum + m.additional_criteria.length, 0)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">{t.summary.metCriteria}</div>
                  <div className="text-xl font-bold text-green-400">
                    {scdfData.modules.reduce((sum, m) => 
                      sum + m.additional_criteria.filter(c => c.met).length, 0
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">{t.summary.activeExclusions}</div>
                  <div className="text-xl font-bold text-red-400">
                    {scdfData.modules.reduce((sum, m) => 
                      sum + Object.values(m.exclusion_flags).filter(v => v).length, 0
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
      
      {/* Help Modal */}
      <SCDFHelpModal 
        open={helpModalOpen} 
        onOpenChange={setHelpModalOpen} 
      />
    </TherapistRoute>
  );
}
