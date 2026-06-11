'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_BASE_URL, getAuthToken } from '@/lib/api';
import { generateMSHEPDF } from '@lib/pdfUtils';
import MSHETrainingModal from './MSHETrainingModal';
import FederationHubFeedBlock from '@/components/federation/FederationHubFeedBlock';
import { Download, HelpCircle, Activity, TrendingUp } from 'lucide-react';
import { GuidedBlock } from '@/components/ui/guided-block';
import {
  exportForSWM,
  importToMSHE,
  type BioEmotionalExportData,
  type MSHEImportResult,
  type RegionRanking,
  type EmotionalTrend,
} from '@/lib/api/bioemotional-clinical';

interface HolisticWeights {
  kabbalah_numerology: number;
  tarot_evolutivo: number;
  astrologia_terapeutica: number;
  transgeneracional: number;
  biodecodificacion: number;
  bioemotional_corporal: number; // NUEVO: Integración BioEmotional
}

interface SynthesisResult {
  scores: Record<string, number>;
  color_alerts: Record<string, string>;
  axis_contributions: Record<string, any[]>;
  ai_input_data: any;
  metadata: {
    total_records: number;
    weights_used: HolisticWeights;
    computed_at: string;
    patient_id: number;
    therapist_id: number;
  };
}

interface AIAnalysis {
  dominant_themes: string[];
  priority_axes: string[];
  recurrent_patterns: string[];
  areas_of_progress: string[];
  areas_of_stagnation: string[];
  evaluated_summary: string;
  confidence_level: 'low' | 'medium' | 'high';
  limits_notice: string;
}

interface AnalysisRecord {
  id: string;
  kind: string;
  computed_result: SynthesisResult;
  raw_input: {
    ai_analysis: AIAnalysis;
  };
  therapist_annotations?: {
    summary?: string;
    notes?: string;
    therapist_validation?: boolean;
  };
  created_at: string;
}

const AXIS_NAMES: Record<string, string> = {
  identity_purpose: 'Identidad y Propósito',
  emotion_regulation: 'Emoción y Regulación',
  relationships_bonds: 'Relaciones y Vínculos',
  vital_energy: 'Energía Vital y Cuerpo Simbólico',
  cycles_change: 'Ciclos y Procesos de Cambio',
  memory_lineage: 'Memoria y Linaje Transgeneracional'
};

const COLOR_CLASSES: Record<string, string> = {
  verde: 'bg-green-100 text-green-800 border-green-200',
  amarillo: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  naranja: 'bg-orange-100 text-orange-800 border-orange-200',
  rojo: 'bg-red-100 text-red-800 border-red-200'
};

export default function MSHEClinicalModule() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patient_id');

  const [weights, setWeights] = useState<HolisticWeights>({
    kabbalah_numerology: 0.17,
    tarot_evolutivo: 0.17,
    astrologia_terapeutica: 0.17,
    transgeneracional: 0.17,
    biodecodificacion: 0.17,
    bioemotional_corporal: 0.15, // NUEVO: peso BioEmotional
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<SynthesisResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisRecord, setAnalysisRecord] = useState<AnalysisRecord | null>(null);
  const [evolutionHistory, setEvolutionHistory] = useState<AnalysisRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'synthesis' | 'evolution'>('synthesis');
  const [therapistNotes, setTherapistNotes] = useState('');
  const [therapistSummary, setTherapistSummary] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // BioEmotional Integration State
  const [bioEmotionalData, setBioEmotionalData] = useState<BioEmotionalExportData | null>(null);
  const [bioEmotionalIntegration, setBioEmotionalIntegration] = useState<MSHEImportResult | null>(null);
  const [isBioEmotionalLoading, setIsBioEmotionalLoading] = useState(false);
  const [bioEmotionalError, setBioEmotionalError] = useState<string | null>(null);

  // Load therapist configuration
  useEffect(() => {
    loadTherapistConfig();
  }, []);

  // Load evolution history when patient changes
  useEffect(() => {
    if (patientId) {
      loadEvolutionHistory();
      loadBioEmotionalData();
    }
  }, [patientId]);

  // Load BioEmotional data for integration
  const loadBioEmotionalData = async () => {
    if (!patientId) return;

    setIsBioEmotionalLoading(true);
    setBioEmotionalError(null);

    try {
      const data = await exportForSWM(parseInt(patientId));
      setBioEmotionalData(data);
    } catch (error) {
      console.error('Error loading BioEmotional data:', error);
      setBioEmotionalError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsBioEmotionalLoading(false);
    }
  };

  // Import BioEmotional data to MSHE
  const handleBioEmotionalImport = async () => {
    if (!patientId) return;

    setIsBioEmotionalLoading(true);
    setBioEmotionalError(null);

    try {
      const result = await importToMSHE(parseInt(patientId));
      setBioEmotionalIntegration(result);

      // Auto-ajustar peso si se integró correctamente
      if (result.integrated && result.new_weight_contribution > 0) {
        setWeights(prev => ({
          ...prev,
          bioemotional_corporal: result.new_weight_contribution
        }));
      }
    } catch (error) {
      console.error('Error importing BioEmotional data:', error);
      setBioEmotionalError(error instanceof Error ? error.message : 'Error al importar');
    } finally {
      setIsBioEmotionalLoading(false);
    }
  };

  const loadTherapistConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/therapist/holistic-config/`, {
        headers: {
          'Authorization': `Token ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWeights(data.weights);
      }
    } catch (error) {
      console.error('Error loading therapist config:', error);
    }
  };

  const saveTherapistConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/therapist/holistic-config/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ weights })
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving therapist config:', error);
      alert('Error al guardar configuración');
    }
  };

  const loadEvolutionHistory = async () => {
    if (!patientId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/analysis-records/?patient_id=${patientId}`, {
        headers: {
          'Authorization': `Token ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Handle both paginated ({results: []}) and direct array responses
        const records = Array.isArray(data) ? data : (data.results || []);
        const msheRecords = records.filter((r: AnalysisRecord) =>
          r.kind === 'holistic_evaluative_synthesis'
        );
        setEvolutionHistory(msheRecords);
      }
    } catch (error) {
      console.error('Error loading evolution history:', error);
    }
  };

  const generateSynthesis = async () => {
    if (!patientId) {
      alert('Paciente no seleccionado');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/analysis-records/holistic-synthesis/?patient_id=${patientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error generating synthesis');
      }

      const record: AnalysisRecord = await response.json();
      setAnalysisRecord(record);
      setSynthesisResult(record.computed_result);
      setAiAnalysis(record.raw_input.ai_analysis);

      // Load updated history
      await loadEvolutionHistory();

    } catch (error) {
      console.error('Error generating synthesis:', error);
      alert('Error al generar síntesis: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveTherapistValidation = async () => {
    if (!analysisRecord) return;

    try {
      const annotations = {
        summary: therapistSummary,
        notes: therapistNotes,
        therapist_validation: isValidated
      };

      const response = await fetch(`${API_BASE_URL}/analysis-records/${analysisRecord.id}/annotations/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ therapist_annotations: annotations })
      });

      if (!response.ok) {
        throw new Error('Failed to save validation');
      }

      alert('Validación guardada exitosamente');
    } catch (error) {
      console.error('Error saving validation:', error);
      alert('Error al guardar validación');
    }
  };

  const exportToPDF = async () => {
    if (!analysisRecord || !isValidated) {
      alert('Debe validar la evaluación antes de exportar el PDF');
      return;
    }

    setIsExportingPDF(true);
    try {
      // Get patient name (this would need to be fetched from patient data)
      // For now, using a placeholder - in real implementation, fetch patient details
      const patientName = `Paciente ${patientId}`;
      const therapistName = 'Terapeuta'; // This should come from user context

      await generateMSHEPDF(analysisRecord, patientName, therapistName);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error al exportar PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const resetWeights = () => {
    setWeights({
      kabbalah_numerology: 0.17,
      tarot_evolutivo: 0.17,
      astrologia_terapeutica: 0.17,
      transgeneracional: 0.17,
      biodecodificacion: 0.17,
      bioemotional_corporal: 0.15
    });
  };

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const isWeightsValid = Math.abs(totalWeight - 1.0) < 0.001;

  if (!patientId) {
    return (
      <div className="py-4">
        <GuidedBlock
          variant="info"
          role="therapist"
          title="Selecciona un consultante"
          description="El Motor de Síntesis Holística requiere un consultante activo. Selecciona un paciente desde el panel clínico para comenzar."
          steps={[
            { label: 'Abre el panel de pacientes en la barra lateral' },
            { label: 'Selecciona o busca el consultante' },
            { label: 'Vuelve a esta pantalla — los datos cargarán automáticamente' },
          ]}
          actions={[{ label: 'Ir a Pacientes', href: '/dashboard/therapist/patients' }]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
            Motor de Síntesis Holística
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            Evaluativo · IA asistida
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
            Última actualización: {synthesisResult?.metadata.computed_at ?
              new Date(synthesisResult.metadata.computed_at).toLocaleString('es-ES') : 'Nunca'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTrainingModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            title="Uso Responsable - Formación y Gobernanza"
          >
            <HelpCircle className="w-4 h-4" />
            Uso Responsable
          </button>

          {synthesisResult && isValidated && (
            <button
              onClick={exportToPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExportingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Exportar PDF
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Weight Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Configuración de Pesos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(weights).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={value}
                onChange={(e) => setWeights(prev => ({
                  ...prev,
                  [key]: parseFloat(e.target.value) || 0
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm">
            Total: <span className={totalWeight === 1.0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {(totalWeight * 100).toFixed(1)}%
            </span>
            {totalWeight !== 1.0 && <span className="text-red-500 ml-2">(Debe ser 100%)</span>}
          </div>
          <div className="space-x-2">
            <button
              onClick={resetWeights}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Restaurar pesos recomendados
            </button>
            <button
              onClick={saveTherapistConfig}
              disabled={!isWeightsValid}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar configuración
            </button>
          </div>
        </div>
      </div>

      {/* BioEmotional Integration Panel */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Integración BioEmotional Corporal</h3>
          </div>
          <button
            onClick={loadBioEmotionalData}
            disabled={isBioEmotionalLoading}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {isBioEmotionalLoading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {bioEmotionalError && (
          <GuidedBlock
            variant="missing"
            role="therapist"
            title="Error al cargar datos BioEmotional"
            description={bioEmotionalError}
            actions={[{ label: 'Reintentar', onClick: loadBioEmotionalData, variant: 'primary' }]}
            className="mb-4"
          />
        )}

        {bioEmotionalData && bioEmotionalData.total_sessions > 0 ? (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-700">{bioEmotionalData.total_sessions}</div>
                <div className="text-xs text-purple-600">Sesiones registradas</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-700">{bioEmotionalData.top_regions?.length || 0}</div>
                <div className="text-xs text-blue-600">Regiones activas</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-700">
                  {bioEmotionalData.emotional_trends?.length || 0}
                </div>
                <div className="text-xs text-green-600">Emociones rastreadas</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-700">
                  {bioEmotionalData.heatmap_aggregate ? Object.keys(bioEmotionalData.heatmap_aggregate).length : 0}
                </div>
                <div className="text-xs text-amber-600">Puntos en mapa térmico</div>
              </div>
            </div>

            {/* Top Regions */}
            {bioEmotionalData.top_regions && bioEmotionalData.top_regions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Regiones Corporales Más Activas</h4>
                <div className="flex flex-wrap gap-2">
                  {bioEmotionalData.top_regions.slice(0, 5).map((region: RegionRanking, idx: number) => (
                    <span
                      key={region.region_id}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `rgba(147, 51, 234, ${0.2 + (0.6 * (1 - idx / 5))})`,
                        color: idx < 2 ? 'white' : '#6b21a8'
                      }}
                    >
                      {region.region_id} ({region.observation_count}x, {(region.avg_intensity * 100).toFixed(0)}%)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Emotional Trends */}
            {bioEmotionalData.emotional_trends && bioEmotionalData.emotional_trends.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-medium text-gray-700">Tendencias Emocionales</h4>
                </div>
                <div className="space-y-1">
                  {bioEmotionalData.emotional_trends.slice(0, 3).map((trend: EmotionalTrend, idx: number) => (
                    <div key={`${trend.date}-${idx}`} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-24">{trend.state}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 rounded-full h-2"
                          style={{ width: `${(trend.feeling_score ?? 50)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{new Date(trend.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Import Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {bioEmotionalIntegration ? (
                  <span className="text-green-600">
                    ✓ Integrado: contribución de peso {(bioEmotionalIntegration.new_weight_contribution * 100).toFixed(1)}%
                  </span>
                ) : (
                  'Integrar datos BioEmotional en la síntesis holística'
                )}
              </div>
              <button
                onClick={handleBioEmotionalImport}
                disabled={isBioEmotionalLoading || !!bioEmotionalIntegration}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bioEmotionalIntegration ? 'Ya integrado' : 'Importar a MSHE'}
              </button>
            </div>
          </div>
        ) : !isBioEmotionalLoading ? (
          <GuidedBlock
            variant="info"
            role="therapist"
            title="Sin datos BioEmotional"
            description="Este consultante no tiene sesiones corporales registradas aún. Completa sesiones en el módulo Bio-Emoción Experiencial para habilitar la integración holística."
            steps={[
              { label: 'Accede al módulo Bio-Emoción Experiencial Profunda' },
              { label: 'Completa al menos una sesión con este consultante' },
              { label: 'Regresa aquí — los datos se integrarán automáticamente' },
            ]}
            actions={[
              {
                label: 'Ir a Bio-Emoción Experiencial',
                href: '/dashboard/therapist/bioemotional-experiencial-profunda',
              },
            ]}
          />
        ) : null}
      </div>

      {/* Generate Button */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Generar Síntesis Holística</h3>
            <p className="text-sm text-gray-600 mt-1">
              Analizará automáticamente todos los registros no clínicos del paciente
            </p>
          </div>
          <button
            onClick={generateSynthesis}
            disabled={isGenerating || !isWeightsValid}
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generando...
              </>
            ) : (
              'Generar Síntesis'
            )}
          </button>
        </div>
      </div>

      {/* Federation Hub Feed (read-only) */}
      <FederationHubFeedBlock
        hub="MSHE"
        patientId={patientId ? Number(patientId) : null}
      />

      {/* Results */}
      {synthesisResult && (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('synthesis')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'synthesis'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Síntesis Actual
              </button>
              <button
                onClick={() => setActiveTab('evolution')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'evolution'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Evolución ({evolutionHistory.length})
              </button>
            </nav>
          </div>

          {activeTab === 'synthesis' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart / Scores */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Evaluación por Ejes Holísticos</h3>
                <div className="space-y-3">
                  {Object.entries(synthesisResult.scores).map(([axis, score]) => (
                    <div key={axis} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {AXIS_NAMES[axis] || axis}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${COLOR_CLASSES[synthesisResult.color_alerts[axis]]}`}>
                            {score.toFixed(1)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  Los colores indican nivel de atención simbólica, no gravedad clínica.
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Análisis IA</h3>
                {aiAnalysis ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Temas Dominantes</h4>
                      <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                        {aiAnalysis.dominant_themes.map((theme, idx) => (
                          <li key={idx}>{theme}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900">Ejes Prioritarios</h4>
                      <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                        {aiAnalysis.priority_axes.map((axis, idx) => (
                          <li key={idx}>{AXIS_NAMES[axis] || axis}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900">Conclusión Evaluativa</h4>
                      <p className="mt-1 text-sm text-gray-600">{aiAnalysis.evaluated_summary}</p>
                      <p className="mt-2 text-xs text-gray-500">{aiAnalysis.limits_notice}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Análisis IA no disponible</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'evolution' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Historial de Evolución</h3>
              {evolutionHistory.length > 0 ? (
                <div className="space-y-4">
                  {evolutionHistory.map((record, idx) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          Evaluación {evolutionHistory.length - idx}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(record.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {Object.entries(record.computed_result.scores).map(([axis, score]) => (
                          <div key={axis} className="flex justify-between">
                            <span className="text-gray-600">{AXIS_NAMES[axis]?.split(' ')[0]}:</span>
                            <span className="font-medium">{score.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay historial de evaluaciones previas</p>
              )}
            </div>
          )}

          {/* Therapist Validation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Validación del Terapeuta</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resumen del terapeuta
                </label>
                <textarea
                  value={therapistSummary}
                  onChange={(e) => setTherapistSummary(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Resumen profesional de la evaluación..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales
                </label>
                <textarea
                  value={therapistNotes}
                  onChange={(e) => setTherapistNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Notas privadas del terapeuta..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="therapist_validation"
                  checked={isValidated}
                  onChange={(e) => setIsValidated(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="therapist_validation" className="ml-2 text-sm text-gray-900">
                  Valido esta evaluación como completa y profesional
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveTherapistValidation}
                  disabled={!isValidated}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar Validación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ethical Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Aviso Ético Importante
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Esta evaluación es simbólica y holística. No sustituye evaluaciones médicas ni psicológicas.
                Las conclusiones son orientativas y requieren discernimiento humano.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Training Modal */}
      <MSHETrainingModal
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
      />
    </div>
  );
}