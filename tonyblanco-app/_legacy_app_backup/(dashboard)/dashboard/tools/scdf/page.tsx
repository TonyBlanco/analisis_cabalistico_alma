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
import { executeTest, type ExecuteTestRequest } from '@/lib/test-api';
import { useToast, ToastContainer } from '@/components/ui/toast';
import SCDFHelpModal from '@/components/SCDFHelpModal';
import { scdf_es as t } from '@/lib/i18n/es/scdf';

// Template JSON inicial (compatible con compute_scdf)
const INITIAL_TEMPLATE = {
  metadata: {
    framework_version: "1.0",
    framework_name: "Structured Clinical Diagnostic Framework (SCDF)",
    jurisdiction: "International - Clinical Practice",
    based_on: "DSM-5 diagnostic logic and ICD-11 compatibility principles",
    note: "This is NOT the SCID-5. This is a proprietary structured clinical framework inspired by DSM-5 logic, developed specifically for this platform.",
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
      module_name: "Mood Disorders Module",
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
      module_name: "Anxiety Disorders Module",
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
      module_name: "Psychotic Disorders Module",
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
      module_name: "Trauma and Stressor-Related Disorders Module",
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
      module_name: "Substance-Related Disorders Module",
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
      module_name: "Personality Disorders Module",
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
      module_name: "Eating Disorders Module",
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
      module_name: "Sleep-Wake Disorders Module",
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

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/patients/${patientId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPatient(data);
        // Pre-llenar datos del cliente
        setScdfData(prev => ({
          ...prev,
          client_data: {
            nombre: data.full_name || '',
            edad: data.age || 0,
            fecha: data.birth_date || new Date().toISOString().split('T')[0]
          }
        }));
      }
    } catch (err: any) {
      console.error('Error loading patient:', err);
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

    // VALIDACIÓN CRÍTICA: Evaluaciones clínicas DEBEN tener paciente seleccionado
    if (!patientId) {
      showToast({
        type: 'error',
        message: 'Debes seleccionar un paciente antes de guardar la evaluación clínica SCDF'
      });
      return;
    }

    try {
      setSubmitting(true);

      const payload: ExecuteTestRequest = {
        test_module_code: 'scdf',
        input_data: {
          ...scdfData,
          clinician_notes: clinicianNotes || undefined
        },
        client_name: scdfData.client_data.nombre,
        client_birth_date: scdfData.client_data.fecha,
        patient_id: patientId ? parseInt(patientId) : undefined,
        save_result: true
      };

      const result = await executeTest(payload);
      
      showToast({
        type: 'success',
        message: t.messages.saveSuccess
      });

      // Redirigir a resultados o página del paciente
      if (patientId) {
        router.push(`/patients/${patientId}`);
      } else {
        router.push('/dashboard/tests');
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
                className="border-slate-700"
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
                        <CardTitle className="text-lg">{getModuleName(module.module_id, module.module_name)}</CardTitle>
                        <Badge 
                          variant={hasActiveCoreGate ? "default" : "outline"}
                          className={hasActiveCoreGate ? "bg-amber-600" : "border-slate-600"}
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
                            <div key={idx} className="text-sm text-slate-400 flex items-center gap-2">
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
                              className="border-slate-700 text-xs"
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
                                      <Label className="text-sm font-medium">
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
