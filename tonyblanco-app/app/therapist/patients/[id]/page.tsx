'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Edit, Archive, User, Mail, Phone, Calendar, Clock, MapPin,
  FileText, Sparkles, ClipboardList, TestTube, Star, Wand2,
  Plus, CheckCircle, AlertCircle, X, Copy, Send, Calendar as CalendarIcon,
  Brain, Heart, Shield, Zap, Moon, Activity, TrendingUp, Pill, UtensilsCrossed, Leaf, Loader2,
  BookOpen, Scroll, Hexagon
} from 'lucide-react';
import { getAuthToken } from '@/lib/auth';
import TherapistRoute from '@/components/TherapistRoute';
import { TESTS_DB } from '@/data/tests-questions';
import TherapyLevelSelector, { TherapyLevel } from '@/components/TherapyLevelSelector';
import PatientAnalysesSidebar from '@/components/PatientAnalysesSidebar';
import AnalysisSelector from '@/components/AnalysisSelector';
import CommunicationTools from '@/components/CommunicationTools';

interface PatientData {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  birth_time?: string;
  birth_place?: string;
  main_complaint?: string;
  clinical_history?: string;
  treatment_plan?: {
    meditations?: string[];
    oils?: string[];
    magnetism?: string[];
    biodecoding?: string[];
  };
  therapy_level?: TherapyLevel;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

interface TestResult {
  id: number;
  test_id?: string;
  test_name?: string;
  score: number;
  clinical_diagnosis: string;
  angel_remedy?: string;
  created_at: string;
}

// Función para calcular el signo zodiacal
const getZodiacSign = (birthDate: string): string => {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '♈ Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '♉ Tauro';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return '♊ Géminis';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return '♋ Cáncer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '♌ Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '♍ Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return '♎ Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return '♏ Escorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return '♐ Sagitario';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '♑ Capricornio';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '♒ Acuario';
  return '♓ Piscis';
};

// Función para calcular la edad
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.id as string;

  const [activeTab, setActiveTab] = useState<'clinical' | 'soul' | 'tests' | 'treatment'>('clinical');
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [error, setError] = useState('');
  const [showAssignTestModal, setShowAssignTestModal] = useState(false);
  const [showAssignAnalysisModal, setShowAssignAnalysisModal] = useState(false);
  const [nextAppointment, setNextAppointment] = useState('');
  const [generatingTarotAnalysis, setGeneratingTarotAnalysis] = useState(false);
  const [tarotAnalysis, setTarotAnalysis] = useState<any>(null);
  const [cabalisticAnalyses, setCabalisticAnalyses] = useState<any[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const [showCabalisticTools, setShowCabalisticTools] = useState(false);

  // Form data for clinical notes
  const [clinicalData, setClinicalData] = useState({
    main_complaint: '',
    session_notes: ''
  });

  // Treatment plan data
  const [treatmentPlan, setTreatmentPlan] = useState({
    meditations: [] as string[],
    oils: [] as string[],
    magnetism: [] as string[],
    biodecoding: [] as string[]
  });

  const [saving, setSaving] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<string | null>(null);
  const [newTreatmentItem, setNewTreatmentItem] = useState('');
  const [therapyLevel, setTherapyLevel] = useState<TherapyLevel>(null);
  const [generatingAIReport, setGeneratingAIReport] = useState(false);
  const [aiPlan, setAiPlan] = useState<any>(null);

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const apiURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
      
      const patientResponse = await fetch(`${apiURL}/therapist/patients/${patientId}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });

      const contentType = patientResponse.headers.get('content-type');
      if (!patientResponse.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await patientResponse.json();
          throw new Error(errorData.error || errorData.detail || 'No se pudo cargar la información del paciente');
        } else {
          const text = await patientResponse.text();
          console.error('Respuesta no JSON recibida:', text.substring(0, 200));
          throw new Error(`Error del servidor: ${patientResponse.status} ${patientResponse.statusText}`);
        }
      }

      if (!contentType || !contentType.includes('application/json')) {
        const text = await patientResponse.text();
        console.error('Respuesta no JSON recibida:', text.substring(0, 200));
        throw new Error('El servidor devolvió una respuesta no válida');
      }

      const patientData = await patientResponse.json();
      setPatient(patientData);
      
      // Cargar nivel terapéutico
      if (patientData.therapy_level) {
        setTherapyLevel(patientData.therapy_level);
      }
      
      // Cargar datos clínicos
      if (patientData.main_complaint) {
        setClinicalData(prev => ({ ...prev, main_complaint: patientData.main_complaint }));
      }
      if (patientData.notes) {
        try {
          const notes = typeof patientData.notes === 'string' ? JSON.parse(patientData.notes) : patientData.notes;
          setClinicalData({
            main_complaint: notes.main_complaint || patientData.main_complaint || '',
            session_notes: notes.session_notes || notes.notes || ''
          });
        } catch {
          setClinicalData(prev => ({ ...prev, session_notes: patientData.notes }));
        }
      }

      // Cargar plan de tratamiento
      if (patientData.treatment_plan) {
        setTreatmentPlan({
          meditations: patientData.treatment_plan.meditations || [],
          oils: patientData.treatment_plan.oils || [],
          magnetism: patientData.treatment_plan.magnetism || [],
          biodecoding: patientData.treatment_plan.biodecoding || []
        });
        
        // Cargar plan de IA si existe
        if (patientData.treatment_plan.ai_generated_plan) {
          setAiPlan(patientData.treatment_plan.ai_generated_plan);
        }
      }
      
      // Load test results
      const testsResponse = await fetch(`${apiURL}/tests/results/?patient_id=${patientId}`, {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (testsResponse.ok) {
        const testsData = await testsResponse.json();
        setTestResults(testsData.results || testsData || []);
      }

    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos del paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClinicalData = async () => {
    const token = getAuthToken();
    if (!token || !patientId) return;

    setSaving(true);
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const apiURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
      const response = await fetch(`${apiURL}/therapist/patients/${patientId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          main_complaint: clinicalData.main_complaint,
          notes: JSON.stringify(clinicalData)
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar los datos');
      }

      alert('Datos guardados exitosamente');
    } catch (err: any) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTreatmentPlan = async () => {
    const token = getAuthToken();
    if (!token || !patientId) return;

    setSaving(true);
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const apiURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
      const response = await fetch(`${apiURL}/therapist/patients/${patientId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          treatment_plan: treatmentPlan
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar el plan de tratamiento');
      }

      alert('Plan de tratamiento guardado exitosamente');
    } catch (err: any) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addTreatmentItem = (category: keyof typeof treatmentPlan) => {
    if (newTreatmentItem.trim()) {
      setTreatmentPlan(prev => ({
        ...prev,
        [category]: [...prev[category], newTreatmentItem.trim()]
      }));
      setNewTreatmentItem('');
      setEditingTreatment(null);
    }
  };

  const removeTreatmentItem = (category: keyof typeof treatmentPlan, index: number) => {
    setTreatmentPlan(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getTestIcon = (testId: string | undefined) => {
    if (!testId) return TestTube;
    const icons: Record<string, any> = {
      'phq-9': Heart,
      'bdi-ii': Heart,
      'gad-7': AlertCircle,
      'bai': AlertCircle,
      'stai': Activity,
      'ptsd': Shield,
      'ptsd-pcl5': Shield,
      'ocd': Brain,
      'adhd': Zap,
      'insomnia': Moon,
      'pai': FileText,
      'scl-90-r': ClipboardList,
      'scid-5-rv': TestTube,
      'substance': Pill,
      'eating': UtensilsCrossed
    };
    return icons[testId] || TestTube;
  };

  const getTestName = (testId: string | undefined | null): string => {
    if (!testId) return 'Test Desconocido';
    return TESTS_DB[testId]?.title || testId.toUpperCase();
  };

  const loadCabalisticAnalyses = async () => {
    const token = getAuthToken();
    if (!token || !patientId) return;

    setLoadingAnalyses(true);
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const apiURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
      
      const response = await fetch(`${apiURL}/therapist/patients/${patientId}/cabalistic-analyses/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCabalisticAnalyses(data.results || []);
      }
    } catch (err: any) {
      console.error('Error al cargar análisis cabalísticos:', err);
    } finally {
      setLoadingAnalyses(false);
    }
  };

  const handleGenerateTarotAnalysis = async () => {
    const token = getAuthToken();
    if (!token || !patientId) return;

    setGeneratingTarotAnalysis(true);
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const apiURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
      
      // Usar el endpoint que genera y guarda automáticamente
      const response = await fetch(`${apiURL}/therapist/patients/${patientId}/tarot-analysis/generate-and-save/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al generar el análisis de Tarot');
      }

      const data = await response.json();
      setTarotAnalysis(data.analysis);
      
      // Recargar la lista de análisis
      await loadCabalisticAnalyses();
      
      alert('Análisis de Tarot generado y guardado exitosamente');
    } catch (err: any) {
      alert('Error al generar análisis de Tarot: ' + err.message);
    } finally {
      setGeneratingTarotAnalysis(false);
    }
  };

  const handleSaveCabalisticAnalysis = async (analysisType: string, inputData: any, resultData: any, summary: string) => {
    const token = getAuthToken();
    if (!token || !patientId) return;

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const apiURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
      
      const response = await fetch(`${apiURL}/therapist/patients/${patientId}/cabalistic-analysis/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          analysis_type: analysisType,
          input_data: inputData,
          result_data: resultData,
          summary: summary
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al guardar el análisis');
      }

      await loadCabalisticAnalyses();
      return true;
    } catch (err: any) {
      alert('Error al guardar análisis: ' + err.message);
      return false;
    }
  };

  const handleGenerateReport = async () => {
    const token = getAuthToken();
    if (!token || !patientId) return;

    setGeneratingAIReport(true);
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const apiURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
      
      const response = await fetch(`${apiURL}/therapist/patients/${patientId}/generate-ai-plan/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error al generar el reporte');
      }

      const data = await response.json();
      
      if (data.plan) {
        setAiPlan(data.plan);
        // Recargar datos del paciente para obtener el plan actualizado
        await loadPatientData();
        alert('Reporte holístico generado exitosamente');
      } else {
        throw new Error('No se recibió el plan en la respuesta');
      }
    } catch (err: any) {
      alert('Error al generar el reporte: ' + err.message);
      console.error('Error:', err);
    } finally {
      setGeneratingAIReport(false);
    }
  };

  const handleAssignTest = (testId: string) => {
    // Generar link para el paciente
    const testUrl = `${window.location.origin}/tests/${testId}`;
    const whatsappMessage = encodeURIComponent(
      `Hola ${patient?.first_name}, tu terapeuta te ha asignado el test: ${getTestName(testId)}. Puedes completarlo aquí: ${testUrl}`
    );
    const whatsappLink = `https://wa.me/${patient?.phone?.replace(/\D/g, '')}?text=${whatsappMessage}`;
    
    // Abrir WhatsApp o copiar link
    if (patient?.phone) {
      window.open(whatsappLink, '_blank');
    } else {
      navigator.clipboard.writeText(testUrl);
      alert('Link copiado al portapapeles');
    }
    
    setShowAssignTestModal(false);
  };

  if (loading) {
    return (
      <TherapistRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando información del paciente...</p>
          </div>
        </div>
      </TherapistRoute>
    );
  }

  if (error || !patient) {
    return (
      <TherapistRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 font-medium text-lg mb-2">Error</p>
            <p className="text-gray-600 mb-4">{error || 'Paciente no encontrado'}</p>
            <button
              onClick={() => router.push('/dashboard/therapist')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </TherapistRoute>
    );
  }

  const age = patient.birth_date ? calculateAge(patient.birth_date) : null;
  const zodiacSign = patient.birth_date ? getZodiacSign(patient.birth_date) : null;

  return (
    <TherapistRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                  {getInitials(patient.full_name || `${patient.first_name} ${patient.last_name}`)}
                </div>
                
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                  </h1>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    {age && <span>{age} años</span>}
                    {zodiacSign && <span>{zodiacSign}</span>}
                    {patient.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{patient.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push(`/therapist/patients/${patientId}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Editar Datos
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={generatingAIReport}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingAIReport ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generar Reporte IA
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Herramientas de Comunicación Rápida */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Herramientas de Comunicación Rápida
              </h3>
            </div>
            <CommunicationTools 
              patient={{
                id: patient.id.toString(),
                name: patient.full_name || `${patient.first_name} ${patient.last_name}`,
                email: patient.email,
                phone: patient.phone,
                birthDate: patient.birth_date
              }}
            />
          </div>
        </div>

        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar Izquierdo - Análisis */}
          <PatientAnalysesSidebar
            patientId={patientId}
            patientName={patient.full_name || `${patient.first_name} ${patient.last_name}`}
            analyses={cabalisticAnalyses}
            onAnalysisSelect={(analysisId) => {
              const analysis = cabalisticAnalyses.find(a => a.analysis_type === analysisId);
              if (analysis) {
                if (analysisId === 'tarot') {
                  setTarotAnalysis(analysis.result_data);
                  setActiveTab('soul');
                }
              }
            }}
          />

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {/* Selector de Nivel Terapéutico */}
              <TherapyLevelSelector
                selectedLevel={therapyLevel}
                onLevelChange={setTherapyLevel}
                patientId={patient ? parseInt(patientId) : undefined}
              />

              <div className="flex gap-6">
                {/* Main Content */}
                <div className="flex-1">
                  {/* Tabs */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('clinical')}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'clinical'
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Clínica & Historia
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('soul')}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'soul'
                          ? 'border-purple-600 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Mapa del Alma
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('tests')}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'tests'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Tests Realizados
                        {testResults.length > 0 && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                            {testResults.length}
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('treatment')}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'treatment'
                          ? 'border-amber-600 text-amber-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Pauta de Tratamiento
                      </div>
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'clinical' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Motivo de Consulta
                        </label>
                        <textarea
                          value={clinicalData.main_complaint}
                          onChange={(e) => setClinicalData({ ...clinicalData, main_complaint: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
                          placeholder="Describe el motivo principal de la consulta del paciente..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notas de Sesión
                        </label>
                        <textarea
                          value={clinicalData.session_notes}
                          onChange={(e) => setClinicalData({ ...clinicalData, session_notes: e.target.value })}
                          rows={8}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
                          placeholder="Anota observaciones, impresiones clínicas, progreso del tratamiento, etc..."
                        />
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button
                          onClick={handleSaveClinicalData}
                          disabled={saving}
                          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Guardar Cambios
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'soul' && (
                    <div className="space-y-6">
                      {/* Herramientas de Alta Cábala */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            Herramientas de Alta Cábala
                          </h3>
                          <button
                            onClick={() => setShowCabalisticTools(!showCabalisticTools)}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            {showCabalisticTools ? 'Ocultar' : 'Mostrar'} Herramientas
                          </button>
                        </div>
                        
                        {showCabalisticTools && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <button
                              onClick={handleGenerateTarotAnalysis}
                              disabled={generatingTarotAnalysis || !patient.birth_date}
                              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              title={!patient.birth_date ? 'El paciente necesita tener fecha de nacimiento' : ''}
                            >
                              {generatingTarotAnalysis ? (
                                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-2" />
                              ) : (
                                <BookOpen className="h-8 w-8 text-indigo-600 mb-2" />
                              )}
                              <span className="font-semibold text-gray-900 text-sm">Tarot Terapéutico</span>
                              <span className="text-xs text-gray-600 mt-1">Diagnóstico Cruzado</span>
                            </button>
                            
                            <button
                              onClick={() => router.push(`/dashboard/tools/gematria?patient_id=${patientId}`)}
                              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-all"
                            >
                              <Scroll className="h-8 w-8 text-blue-600 mb-2" />
                              <span className="font-semibold text-gray-900 text-sm">Gematria</span>
                              <span className="text-xs text-gray-600 mt-1">Cálculo de Valores</span>
                            </button>
                            
                            <button
                              onClick={() => router.push(`/dashboard/tools/soul-map?patient_id=${patientId}`)}
                              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition-all"
                            >
                              <Sparkles className="h-8 w-8 text-purple-600 mb-2" />
                              <span className="font-semibold text-gray-900 text-sm">Mapa del Alma</span>
                              <span className="text-xs text-gray-600 mt-1">Análisis Sefirot</span>
                            </button>
                            
                            <button
                              onClick={() => router.push(`/dashboard/tools/astrology?patient_id=${patientId}`)}
                              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg hover:border-amber-400 transition-all"
                            >
                              <Star className="h-8 w-8 text-amber-600 mb-2" />
                              <span className="font-semibold text-gray-900 text-sm">Carta Astral</span>
                              <span className="text-xs text-gray-600 mt-1">Cabalística</span>
                            </button>
                            
                            <button
                              onClick={() => router.push(`/dashboard/tools/astrology-kerykeion?patientId=${patientId}`)}
                              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 transition-all"
                            >
                              <Star className="h-8 w-8 text-indigo-600 mb-2" />
                              <span className="font-semibold text-gray-900 text-sm">Kerykeion</span>
                              <span className="text-xs text-gray-600 mt-1">Astrología Técnica</span>
                            </button>
                            
                            <button
                              onClick={() => router.push(`/dashboard/tools/tikun?patient_id=${patientId}`)}
                              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg hover:border-emerald-400 transition-all"
                            >
                              <Hexagon className="h-8 w-8 text-emerald-600 mb-2" />
                              <span className="font-semibold text-gray-900 text-sm">Tikún</span>
                              <span className="text-xs text-gray-600 mt-1">Análisis de Corrección</span>
                            </button>
                            
                            <button
                              onClick={() => router.push(`/tests/complete-numerology?patient_id=${patientId}`)}
                              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 rounded-lg hover:border-rose-400 transition-all"
                            >
                              <Hash className="h-8 w-8 text-rose-600 mb-2" />
                              <span className="font-semibold text-gray-900 text-sm">Numerología</span>
                              <span className="text-xs text-gray-600 mt-1">Análisis Completo</span>
                            </button>
                            
                            <button
                              onClick={() => router.push(`/dashboard/tools/shekinah?patientId=${patientId}`)}
                              className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg hover:border-amber-400 transition-all"
                            >
                              <Sparkles className="h-8 w-8 text-amber-600 mb-2" />
                              <span className="font-semibold text-gray-900 text-sm">Shejinah</span>
                              <span className="text-xs text-gray-600 mt-1">Método Atlantis</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Historial de Análisis */}
                      {cabalisticAnalyses.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-purple-600" />
                            Historial de Análisis ({cabalisticAnalyses.length})
                          </h3>
                          <div className="space-y-3">
                            {cabalisticAnalyses.map((analysis) => (
                              <div
                                key={analysis.id}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => {
                                  if (analysis.analysis_type === 'tarot') {
                                    setTarotAnalysis(analysis.result_data);
                                  }
                                  // Aquí puedes agregar lógica para otros tipos
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {analysis.analysis_type === 'tarot' && <BookOpen className="h-5 w-5 text-indigo-600" />}
                                    {analysis.analysis_type === 'gematria' && <Scroll className="h-5 w-5 text-blue-600" />}
                                    {analysis.analysis_type === 'soul-map' && <Sparkles className="h-5 w-5 text-purple-600" />}
                                    {analysis.analysis_type === 'astrology' && <Star className="h-5 w-5 text-amber-600" />}
                                    {analysis.analysis_type === 'astrology-kerykeion' && <Star className="h-5 w-5 text-indigo-600" />}
                                    {analysis.analysis_type === 'tikun' && <Hexagon className="h-5 w-5 text-emerald-600" />}
                                    {analysis.analysis_type === 'shekinah' && <Sparkles className="h-5 w-5 text-amber-600" />}
                                    <div>
                                      <p className="font-semibold text-gray-900">{analysis.analysis_type_display}</p>
                                      {analysis.summary && (
                                        <p className="text-sm text-gray-600">{analysis.summary}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                      {new Date(analysis.created_at).toLocaleDateString('es-ES')}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(analysis.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Análisis de Tarot Cruzado */}
                      {tarotAnalysis && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6 mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                              <Sparkles className="h-5 w-5" />
                              Diagnóstico Cruzado: Tarot & Clínica
                            </h3>
                            <button
                              onClick={() => setTarotAnalysis(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white rounded-lg p-4 border border-indigo-200">
                              <h4 className="font-semibold text-indigo-900 mb-2">Arcano de Vida</h4>
                              <p className="text-2xl font-bold text-indigo-600">{tarotAnalysis.arcana_number}</p>
                              <p className="text-lg text-gray-700">{tarotAnalysis.nombre_carta}</p>
                              <p className="text-sm text-gray-500 mt-1">Letra: {tarotAnalysis.hebrew_letter}</p>
                              <p className="text-sm text-gray-500">Sendero: {tarotAnalysis.sendero}</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-indigo-200">
                              <h4 className="font-semibold text-indigo-900 mb-2">Estado Clínico</h4>
                              <p className="text-lg font-semibold text-gray-700">{tarotAnalysis.test_name}</p>
                              <p className="text-sm text-gray-600 mt-1">{tarotAnalysis.clinical_severity}</p>
                              {tarotAnalysis.test_date && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Fecha: {new Date(tarotAnalysis.test_date).toLocaleDateString('es-ES')}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-indigo-200 mb-4">
                            <h4 className="font-semibold text-indigo-900 mb-3">Análisis de Sombra</h4>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                              {tarotAnalysis.analisis_sombra}
                            </p>
                          </div>

                          {tarotAnalysis.acciones_sanadoras && tarotAnalysis.acciones_sanadoras.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-indigo-900 mb-3">Acciones de Sanación</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {tarotAnalysis.acciones_sanadoras.map((accion: any, idx: number) => (
                                  <div key={idx} className="bg-white rounded-lg p-4 border border-indigo-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <CheckCircle className="h-4 w-4 text-indigo-600" />
                                      <h5 className="font-semibold text-gray-900 text-sm">{accion.titulo}</h5>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">{accion.descripcion}</p>
                                    <span className="inline-block px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded">
                                      {accion.tipo}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {tarotAnalysis.mensaje_integrador && (
                            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4 border border-indigo-200">
                              <h4 className="font-semibold text-indigo-900 mb-2">Mensaje Integrador</h4>
                              <p className="text-sm text-indigo-800 leading-relaxed italic">
                                {tarotAnalysis.mensaje_integrador}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                        <Sparkles className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Mapa del Alma</h3>
                        <p className="text-gray-600 mb-6">
                          {tarotAnalysis 
                            ? 'El análisis cabalístico completo estará disponible cuando se genere la carta astral del paciente.'
                            : 'Genera un diagnóstico cruzado de Tarot para ver cómo el arquetipo del paciente se relaciona con su estado clínico actual.'}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
                          <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <div className="text-2xl mb-2">⚡</div>
                            <p className="text-sm font-medium text-gray-900">Sefirá Predominante</p>
                            <p className="text-xs text-gray-500 mt-1">Por calcular</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <div className="text-2xl mb-2">🔮</div>
                            <p className="text-sm font-medium text-gray-900">Tikún del Alma</p>
                            <p className="text-xs text-gray-500 mt-1">Por calcular</p>
                          </div>
                        </div>
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => router.push(`/calcular?patient_id=${patientId}`)}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors font-medium"
                          >
                            Generar Carta Astral
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'tests' && (
                    <div>
                      {testResults.length === 0 ? (
                        <div className="text-center py-12">
                          <TestTube className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay tests completados</h3>
                          <p className="text-gray-600 mb-6">
                            Aún no se han completado tests para este paciente.
                          </p>
                          <button
                            onClick={() => setShowAssignTestModal(true)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Asignar Test
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnóstico</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ángel Asignado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {testResults.map((result) => {
                                const IconComponent = getTestIcon(result.test_id);
                                return (
                                  <tr key={result.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <IconComponent className="h-5 w-5 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-900">
                                          {result.test_name || getTestName(result.test_id)}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(result.created_at).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {result.score}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                      {result.clinical_diagnosis}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {result.angel_remedy ? (
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                          {result.angel_remedy}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-gray-400">-</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <button
                                        onClick={() => router.push(`/tests/results/${result.id}`)}
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        Ver Detalles
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'treatment' && (
                    <div className="space-y-6">
                      {/* Plan de IA Generado */}
                      {aiPlan ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                          {/* Tarjeta 1: Síntesis Diagnóstica (Ancho completo) */}
                          <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">Síntesis Diagnóstica</h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{aiPlan.sintesis_diagnostica}</p>
                          </div>

                          {/* Tarjeta 2: Receta Cabalística */}
                          <div className="bg-white rounded-lg border border-purple-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <Sparkles className="h-6 w-6 text-purple-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">Receta Cabalística</h3>
                            </div>
                            <div className="space-y-4">
                              {aiPlan.receta_cabalistica?.meditacion_nombre && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-1">Meditación</h4>
                                  <p className="text-sm text-gray-700 mb-2">{aiPlan.receta_cabalistica.meditacion_nombre}</p>
                                  <p className="text-xs text-gray-600 italic">{aiPlan.receta_cabalistica.meditacion_instruccion}</p>
                                </div>
                              )}
                              {aiPlan.receta_cabalistica?.salmo && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-1">Salmo</h4>
                                  <p className="text-sm text-gray-700">Salmo {aiPlan.receta_cabalistica.salmo}</p>
                                </div>
                              )}
                              {aiPlan.receta_cabalistica?.sefira_recomendada && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-1">Sefirá</h4>
                                  <p className="text-sm text-gray-700">{aiPlan.receta_cabalistica.sefira_recomendada}</p>
                                </div>
                              )}
                              {aiPlan.receta_cabalistica?.angel_asignado && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-1">Ángel</h4>
                                  <p className="text-sm text-gray-700">{aiPlan.receta_cabalistica.angel_asignado}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tarjeta 3: Receta Natural */}
                          <div className="bg-white rounded-lg border border-green-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Leaf className="h-6 w-6 text-green-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">Receta Natural</h3>
                            </div>
                            <div className="space-y-4">
                              {aiPlan.receta_natural?.aceites_esenciales && aiPlan.receta_natural.aceites_esenciales.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Aceites Esenciales</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {aiPlan.receta_natural.aceites_esenciales.map((aceite: string, idx: number) => (
                                      <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
                                        {aceite}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {aiPlan.receta_natural?.flores_bach && aiPlan.receta_natural.flores_bach.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Flores de Bach</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {aiPlan.receta_natural.flores_bach.map((flor: string, idx: number) => (
                                      <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm border border-amber-200">
                                        {flor}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {aiPlan.receta_natural?.uso && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-1">Uso</h4>
                                  <p className="text-xs text-gray-600">{aiPlan.receta_natural.uso}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tarjeta 4: Biodecodificación */}
                          <div className="lg:col-span-2 bg-white rounded-lg border border-orange-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <Activity className="h-6 w-6 text-orange-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">Biodecodificación</h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{aiPlan.biodecodificacion}</p>
                          </div>

                          {/* Estrategia Clínica */}
                          {aiPlan.estrategia_clinica && aiPlan.estrategia_clinica.length > 0 && (
                            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estrategia Clínica</h3>
                              <ol className="space-y-2">
                                {aiPlan.estrategia_clinica.map((paso: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                      {idx + 1}
                                    </span>
                                    <span className="text-gray-700">{paso}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Estado vacío - Invitación a generar reporte */
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-dashed border-purple-300 p-12 text-center mb-6">
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-4">
                            <Wand2 className="h-10 w-10 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Genera un Plan de Tratamiento Holístico</h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Usa la inteligencia artificial para crear un plan personalizado que integre Psicología, Cábala y Astrología
                          </p>
                          <button
                            onClick={handleGenerateReport}
                            disabled={generatingAIReport}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                          >
                            {generatingAIReport ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Generando Plan...
                              </>
                            ) : (
                              <>
                                <Wand2 className="h-5 w-5" />
                                Generar Plan con IA
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Plan de Tratamiento Manual (Siempre visible para edición) */}
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan de Tratamiento Manual</h3>
                        <div className="space-y-6">
                          {/* Meditación */}
                          <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                  <span className="text-2xl">🧘</span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">Meditación / 72 Nombres</h3>
                                  <p className="text-xs text-gray-500">Prácticas de meditación y nombres divinos</p>
                                </div>
                              </div>
                              {editingTreatment === 'meditations' ? (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newTreatmentItem}
                                    onChange={(e) => setNewTreatmentItem(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTreatmentItem('meditations')}
                                    placeholder="Agregar meditación..."
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => addTreatmentItem('meditations')}
                                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                  >
                                    Agregar
                                  </button>
                                  <button
                                    onClick={() => { setEditingTreatment(null); setNewTreatmentItem(''); }}
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingTreatment('meditations')}
                                  className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg border border-purple-200"
                                >
                                  <Plus className="h-4 w-4 inline mr-1" />
                                  Agregar
                                </button>
                              )}
                            </div>
                            <ul className="space-y-2">
                              {treatmentPlan.meditations.length === 0 ? (
                                <li className="text-sm text-gray-400 italic">No hay meditaciones asignadas</li>
                              ) : (
                                treatmentPlan.meditations.map((item, index) => (
                                  <li key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                                    <span className="text-sm text-gray-700">{item}</span>
                                    <button
                                      onClick={() => removeTreatmentItem('meditations', index)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </li>
                                ))
                              )}
                            </ul>
                          </div>

                      {/* Aceites Esenciales */}
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <span className="text-2xl">🌿</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Aceites Esenciales / Infusiones</h3>
                              <p className="text-xs text-gray-500">Terapias con plantas y aceites</p>
                            </div>
                          </div>
                          {editingTreatment === 'oils' ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newTreatmentItem}
                                onChange={(e) => setNewTreatmentItem(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTreatmentItem('oils')}
                                placeholder="Agregar aceite/infusión..."
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                                autoFocus
                              />
                              <button
                                onClick={() => addTreatmentItem('oils')}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                              >
                                Agregar
                              </button>
                              <button
                                onClick={() => { setEditingTreatment(null); setNewTreatmentItem(''); }}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingTreatment('oils')}
                              className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg border border-green-200"
                            >
                              <Plus className="h-4 w-4 inline mr-1" />
                              Agregar
                            </button>
                          )}
                        </div>
                        <ul className="space-y-2">
                          {treatmentPlan.oils.length === 0 ? (
                            <li className="text-sm text-gray-400 italic">No hay aceites asignados</li>
                          ) : (
                            treatmentPlan.oils.map((item, index) => (
                              <li key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                                <span className="text-sm text-gray-700">{item}</span>
                                <button
                                  onClick={() => removeTreatmentItem('oils', index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>

                      {/* Biomagnetismo */}
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <span className="text-2xl">🧲</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Biomagnetismo / Puntos</h3>
                              <p className="text-xs text-gray-500">Terapia magnética y puntos de acupresión</p>
                            </div>
                          </div>
                          {editingTreatment === 'magnetism' ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newTreatmentItem}
                                onChange={(e) => setNewTreatmentItem(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTreatmentItem('magnetism')}
                                placeholder="Agregar punto/terapia..."
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                                autoFocus
                              />
                              <button
                                onClick={() => addTreatmentItem('magnetism')}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                              >
                                Agregar
                              </button>
                              <button
                                onClick={() => { setEditingTreatment(null); setNewTreatmentItem(''); }}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingTreatment('magnetism')}
                              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                            >
                              <Plus className="h-4 w-4 inline mr-1" />
                              Agregar
                            </button>
                          )}
                        </div>
                        <ul className="space-y-2">
                          {treatmentPlan.magnetism.length === 0 ? (
                            <li className="text-sm text-gray-400 italic">No hay puntos asignados</li>
                          ) : (
                            treatmentPlan.magnetism.map((item, index) => (
                              <li key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                                <span className="text-sm text-gray-700">{item}</span>
                                <button
                                  onClick={() => removeTreatmentItem('magnetism', index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>

                      {/* Biodecodificación */}
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <span className="text-2xl">🧬</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Biodecodificación (Conflicto Raíz)</h3>
                              <p className="text-xs text-gray-500">Identificación de conflictos emocionales</p>
                            </div>
                          </div>
                          {editingTreatment === 'biodecoding' ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newTreatmentItem}
                                onChange={(e) => setNewTreatmentItem(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTreatmentItem('biodecoding')}
                                placeholder="Agregar conflicto..."
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                                autoFocus
                              />
                              <button
                                onClick={() => addTreatmentItem('biodecoding')}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                              >
                                Agregar
                              </button>
                              <button
                                onClick={() => { setEditingTreatment(null); setNewTreatmentItem(''); }}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingTreatment('biodecoding')}
                              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                            >
                              <Plus className="h-4 w-4 inline mr-1" />
                              Agregar
                            </button>
                          )}
                        </div>
                        <ul className="space-y-2">
                          {treatmentPlan.biodecoding.length === 0 ? (
                            <li className="text-sm text-gray-400 italic">No hay conflictos identificados</li>
                          ) : (
                            treatmentPlan.biodecoding.map((item, index) => (
                              <li key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                                <span className="text-sm text-gray-700">{item}</span>
                                <button
                                  onClick={() => removeTreatmentItem('biodecoding', index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button
                          onClick={handleSaveTreatmentPlan}
                          disabled={saving}
                          className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Guardar Plan de Tratamiento
                            </>
                          )}
                        </button>
                      </div>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Derecho */}
            <div className="w-80 space-y-6">
              {/* Acciones Rápidas */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAssignTestModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <TestTube className="h-5 w-5" />
                    Asignar Test
                  </button>
                  <button
                    onClick={() => setShowAssignAnalysisModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Sparkles className="h-5 w-5" />
                    Asignar Análisis
                  </button>
                </div>

                {/* Próxima Cita */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Próxima Cita
                  </label>
                  <input
                    type="datetime-local"
                    value={nextAppointment}
                    onChange={(e) => setNextAppointment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Información Adicional */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
                <div className="space-y-3 text-sm">
                  {patient.birth_date && (
                    <div>
                      <span className="text-gray-500">Fecha de Nacimiento:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(patient.birth_date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {patient.birth_time && (
                    <div>
                      <span className="text-gray-500">Hora de Nacimiento:</span>
                      <span className="ml-2 text-gray-900">{patient.birth_time}</span>
                    </div>
                  )}
                  {patient.birth_place && (
                    <div>
                      <span className="text-gray-500">Lugar de Nacimiento:</span>
                      <span className="ml-2 text-gray-900">{patient.birth_place}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Estado:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      patient.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.is_active ? 'Activo' : 'Archivado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tests Completados:</span>
                    <span className="ml-2 text-gray-900 font-semibold">{testResults.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Asignar Test */}
        {showAssignTestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Asignar Test al Paciente</h3>
                <button
                  onClick={() => setShowAssignTestModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona un test para asignar a {patient.first_name}. Se generará un link que puedes compartir.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.keys(TESTS_DB).map((testId) => {
                    const test = TESTS_DB[testId];
                    const IconComponent = getTestIcon(testId);
                    return (
                      <button
                        key={testId}
                        onClick={() => handleAssignTest(testId)}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                      >
                        <IconComponent className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{test.title}</p>
                          <p className="text-xs text-gray-500">{test.questions.length} preguntas</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Asignar Análisis */}
        {showAssignAnalysisModal && patient && (
          <AnalysisSelector
            patientId={patientId}
            patientName={patient.full_name || `${patient.first_name} ${patient.last_name}`}
            onClose={() => setShowAssignAnalysisModal(false)}
          />
        )}
      </div>
    </TherapistRoute>
  );
}
