'use client';

/**
 * QliphothCyclesTimeline.tsx - Ciclos de Sombra Personal (Qliphoth)
 * 
 * Visualiza los ciclos de sombra cabalísticos como espejo inverso de Sefirot.
 * Este componente es ÉTICO - muestra patrones históricos, NO predice crisis.
 * 
 * PRINCIPIOS ÉTICOS OBLIGATORIOS:
 * - Solo correlaciones históricas, nunca predicciones
 * - Consciencia preventiva, no determinismo
 * - Disclaimer ético visible en todo momento
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Moon, 
  AlertTriangle, 
  Download, 
  Save, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Eye,
  Shield,
  Info,
  RefreshCw,
  Brain,
  FileText,
  History,
  Zap
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api-base';
import { QliphothAI } from '@/lib/cabala-qliphoth-ai-api';
import type { AIAnalysisResponse, SaveAnalysisRequest } from '@/lib/cabala-qliphoth-ai-api';

// Paleta de colores específica para Qliphoth (tonos más nítidos y contrastados)
const QLIPHOTH_COLORS: Record<string, string> = {
  'lilith': '#5D1A5D',        // Púrpura oscuro más vibrante
  'gamaliel': '#A01010',      // Rojo oscuro más definido  
  'samael': '#1C4A4A',        // Gris azulado más profundo
  'arab_zaraq': '#9A2D9A',    // Púrpura medio más brillante
  'thagirion': '#D4A825',     // Oro más brillante
  'golachab': '#E8284C',      // Rojo carmesí más vibrante
  'gamchicoth': '#6B7A3E',    // Verde oliva más definido
  'satariel': '#5A4FCF',      // Azul pizarra más brillante
  'ghagiel': '#3C3C3C',       // Gris más contrastado
  'thaumiel': '#2A2A8B',      // Azul medianoche más intenso
};

// Información completa de Qliphoth para tooltips y detalles
const QLIPHOTH_INFO: Record<string, {
  hebrewName: string;
  spanishName: string;
  meaning: string;
  archetype: string;
  shadowExpression: string;
  integrationPath: string;
  correspondingSefira: string;
}> = {
  'lilith': {
    hebrewName: 'לילית',
    spanishName: 'Lilith',
    meaning: 'Reina de la Noche',
    archetype: 'El Mundo Material Corrupto',
    shadowExpression: 'Materialismo excesivo, desconexión de lo espiritual, inercia',
    integrationPath: 'Sacralizar la vida cotidiana. Encontrar lo divino en lo material.',
    correspondingSefira: 'Malkuth'
  },
  'gamaliel': {
    hebrewName: 'גמליאל',
    spanishName: 'Gamaliel',
    meaning: 'Los Obscenos',
    archetype: 'El Fundamento Corrompido',
    shadowExpression: 'Instintos desviados, sueños perturbadores, fundamentos falsos',
    integrationPath: 'Purificar los fundamentos del ser. Integrar la sexualidad de forma sagrada.',
    correspondingSefira: 'Yesod'
  },
  'samael': {
    hebrewName: 'סמאל',
    spanishName: 'Samael',
    meaning: 'Veneno de Dios',
    archetype: 'El Intelecto Venenoso',
    shadowExpression: 'Mentira, engaño intelectual, racionalización, pensamiento tóxico',
    integrationPath: 'Usar el intelecto al servicio de la verdad. Desarrollar discernimiento honesto.',
    correspondingSefira: 'Hod'
  },
  'arab_zaraq': {
    hebrewName: 'ערב זרק',
    spanishName: 'Arav Zaraq',
    meaning: 'Los Cuervos de Dispersión',
    archetype: 'El Deseo Insaciable',
    shadowExpression: 'Lujuria, adicción, deseos descontrolados, búsqueda compulsiva',
    integrationPath: 'Canalizar la pasión hacia el amor verdadero. Transmutar deseo en devoción.',
    correspondingSefira: 'Netzach'
  },
  'thagirion': {
    hebrewName: 'תגריון',
    spanishName: 'Thagirion',
    meaning: 'Los Disputadores',
    archetype: 'La Belleza Corrupta',
    shadowExpression: 'Vanidad, narcisismo, belleza superficial, ego inflado',
    integrationPath: 'Desarrollar belleza interior genuina. Encontrar el centro verdadero.',
    correspondingSefira: 'Tiferet'
  },
  'golachab': {
    hebrewName: 'גולכב',
    spanishName: 'Golachab',
    meaning: 'Los Incendiarios',
    archetype: 'La Ira Destructiva',
    shadowExpression: 'Crueldad, violencia, ira descontrolada, juicio despiadado',
    integrationPath: 'Transformar la ira en acción justa. Desarrollar fuerza con compasión.',
    correspondingSefira: 'Gevurah'
  },
  'gamchicoth': {
    hebrewName: 'גמכיכות',
    spanishName: 'Gamchicoth',
    meaning: 'Los Devoradores',
    archetype: 'La Generosidad Devoradora',
    shadowExpression: 'Dar para controlar, generosidad con expectativas, amor posesivo',
    integrationPath: 'Aprender a dar sin expectativas. Desarrollar amor incondicional.',
    correspondingSefira: 'Chesed'
  },
  'satariel': {
    hebrewName: 'סתריאל',
    spanishName: 'Satariel',
    meaning: 'Los Ocultadores',
    archetype: 'El Velo de Ignorancia',
    shadowExpression: 'Ocultamiento de la verdad, negación, incapacidad de ver claramente',
    integrationPath: 'Desarrollar el coraje para ver la verdad. Iluminar lo oculto.',
    correspondingSefira: 'Binah'
  },
  'ghagiel': {
    hebrewName: 'עוגיאל',
    spanishName: 'Ghagiel',
    meaning: 'Los Obstaculizadores',
    archetype: 'El Caos Destructivo',
    shadowExpression: 'Sabiduría usada para manipular, caos sin propósito, confusión mental',
    integrationPath: 'Canalizar la energía creativa hacia propósitos constructivos.',
    correspondingSefira: 'Chokmah'
  },
  'thaumiel': {
    hebrewName: 'תאומיאל',
    spanishName: 'Thaumiel',
    meaning: 'Los Gemelos de Dios',
    archetype: 'El Ego Dividido',
    shadowExpression: 'División interna, incapacidad de unificar, dualidad conflictiva',
    integrationPath: 'Reconocer que la dualidad aparente es parte de una unidad mayor.',
    correspondingSefira: 'Keter'
  }
};

interface QliphothEvent {
  year: number;
  date: string;
  age: number;
  qliphoth: string;
  corresponding_sefira: string;
  events: Array<{
    type: string;
    name: string;
    severity: string;
    score?: number;
    date: string;
    is_crisis: boolean;
  }>;
  detected_pattern: string;
}

interface ShadowPattern {
  qliphoth_crisis_correlation: Record<string, number>;
  cycle_repetition: Array<{
    qliphoth: string;
    years: number[];
    pattern: string;
  }>;
  total_events: number;
  crisis_events: number;
  most_challenging_qliphoth?: string;
}

interface ShadowAlert {
  type: string;
  qliphoth: string;
  next_entry_date: string;
  days_until: number;
  message: string;
  suggestion: string;
}

interface QliphothCyclesData {
  consultante_uuid: string;
  consultante_name: string;
  birth_date: string;
  current_qliphoth: string;
  cycle_year: number;
  corresponding_sefira: string;
  shadow_manifestation: string;
  biographical_shadow_map: QliphothEvent[];
  shadow_patterns: ShadowPattern;
  alerts: ShadowAlert[];
  qliphoth_info: any;
  integration_path: string;
  disclaimer: string;
  ethical_notice: string;
}

interface QliphothCyclesTimelineProps {
  consultanteUuid: string;
  onSaveAnalysis?: (analysisData: any) => void;
  className?: string;
}

const QliphothCyclesTimeline: React.FC<QliphothCyclesTimelineProps> = ({
  consultanteUuid,
  onSaveAnalysis,
  className = ''
}) => {
  const [data, setData] = useState<QliphothCyclesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<QliphothEvent | null>(null);
  const [showEthicalNotice, setShowEthicalNotice] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    timeline: true,
    patterns: false,
    alerts: false,
    current: true,
    ai: false,
    history: false
  });
  
  // Estados para AI y análisis
  const [aiInterpretation, setAiInterpretation] = useState<AIAnalysisResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [therapistNotes, setTherapistNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Cargar datos de ciclos Qliphoth
  const loadQliphothCycles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = getApiBaseUrl();
      
      const response = await fetch(`${baseUrl}/api/consultantes/${consultanteUuid}/qliphoth-cycles/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const cyclesData = await response.json();
      setData(cyclesData);
    } catch (err: any) {
      setError(err.message || 'Error cargando ciclos Qliphoth');
      console.error('[QliphothTimeline] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================================
  // FUNCIONES AI Y PERSISTENCIA
  // ==========================================================================

  // Generar interpretación AI
  const generateAIInterpretation = async (analysisType: 'cycle_analysis' | 'pattern_synthesis' | 'integration_guidance', targetQliphoth?: string) => {
    if (!data) return;
    
    setAiLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No hay token de autenticación');

      const result = await QliphothAI.generateAIInterpretation(
        consultanteUuid,
        {
          analysis_type: analysisType,
          target_qliphoth: targetQliphoth,
          therapeutic_context: therapistNotes
        },
        token
      );

      setAiInterpretation(result);
      setExpandedSections(prev => ({ ...prev, ai: true }));
    } catch (err: any) {
      setError(`Error generando interpretación AI: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Guardar análisis completo
  const saveAnalysis = async (sessionType: 'cycle_analysis' | 'pattern_synthesis' | 'integration_work') => {
    if (!data) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No hay token de autenticación');

      const saveRequest = QliphothAI.formatAnalysisForSaving(
        data,
        aiInterpretation,
        therapistNotes,
        sessionType
      );

      const result = await QliphothAI.saveQliphothAnalysis(consultanteUuid, saveRequest, token);
      
      if (result.success) {
        // Llamar callback padre si existe
        if (onSaveAnalysis) {
          onSaveAnalysis(result.record);
        }
        
        // Cargar historial actualizado
        await loadAnalysisHistory();
        
        alert(`Análisis guardado exitosamente: ${result.message}`);
      } else {
        throw new Error(result.error || 'Error guardando análisis');
      }
    } catch (err: any) {
      setError(`Error guardando análisis: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Cargar historial de análisis
  const loadAnalysisHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const result = await QliphothAI.fetchAnalysisHistory(consultanteUuid, token, 10);
      setAnalysisHistory(result.history || []);
    } catch (err: any) {
      console.error('[QliphothTimeline] Error loading history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Generar reporte completo
  const generateReport = async () => {
    if (!data) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No hay token de autenticación');

      const reportConfig = QliphothAI.generateReportConfig(['integration', 'prevention', 'growth']);
      
      const result = await QliphothAI.generateQliphothReport(
        consultanteUuid,
        {
          ...reportConfig,
          include_history: true,
          export_format: 'structured'
        },
        token
      );

      if (result.success) {
        // Crear descarga del reporte
        const blob = new Blob([JSON.stringify(result.report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qliphoth-report-${consultanteUuid}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        throw new Error(result.error || 'Error generando reporte');
      }
    } catch (err: any) {
      setError(`Error generando reporte: ${err.message}`);
    }
  };

  useEffect(() => {
    if (consultanteUuid) {
      loadQliphothCycles();
      loadAnalysisHistory();
    }
  }, [consultanteUuid]);

  // Generar timeline de años de vida con Qliphoth
  const generateTimeline = () => {
    if (!data) return [];
    
    const birthYear = new Date(data.birth_date).getFullYear();
    const currentYear = new Date().getFullYear();
    const timeline = [];
    
    for (let year = birthYear; year <= currentYear + 5; year++) { // +5 años para mostrar próximos
      const age = year - birthYear;
      const cyclePosition = age % 10;
      
      // Mapear posición a Qliphoth (usando la lógica del backend)
      const qliphothMap: Record<number, string> = {
        0: 'lilith',      // Año 1 (edad 0) 
        1: 'gamaliel',    // Año 2 (edad 1)
        2: 'samael',      // Año 3 (edad 2)
        3: 'arab_zaraq',  // Año 4 (edad 3)
        4: 'thagirion',   // Año 5 (edad 4)
        5: 'golachab',    // Año 6 (edad 5)
        6: 'gamchicoth',  // Año 7 (edad 6)
        7: 'satariel',    // Año 8 (edad 7)
        8: 'ghagiel',     // Año 9 (edad 8)
        9: 'thaumiel'     // Año 10 (edad 9)
      };
      
      const qliphoth = qliphothMap[cyclePosition];
      
      // Buscar eventos en ese año
      const eventsInYear = data.biographical_shadow_map.filter(event => event.year === year);
      
      timeline.push({
        year,
        age,
        qliphoth,
        events: eventsInYear,
        isCurrent: year === currentYear,
        isFuture: year > currentYear,
        color: QLIPHOTH_COLORS[qliphoth] || '#333333'
      });
    }
    
    return timeline;
  };

  // Guardar análisis completo
  const handleSaveAnalysis = async () => {
    if (!data || !onSaveAnalysis) return;
    
    try {
      const analysisData = {
        method_id: 'qliphoth_cycles',
        method_name: 'Ciclos de Sombra Personal',
        method_output: {
          current_qliphoth: data.current_qliphoth,
          cycle_year: data.cycle_year,
          shadow_patterns: data.shadow_patterns,
          alerts_count: data.alerts.length,
          biographical_events: data.biographical_shadow_map.length,
          integration_path: data.integration_path
        },
        tree_state: {
          current_qliphoth: data.current_qliphoth,
          cycle_year: data.cycle_year,
          corresponding_sefira: data.corresponding_sefira
        }
      };
      
      await onSaveAnalysis(analysisData);
    } catch (err) {
      console.error('[QliphothTimeline] Error saving analysis:', err);
    }
  };

  const timeline = generateTimeline();

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Cargando ciclos de sombra...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-300 rounded-lg p-4 shadow-lg ${className}`}>
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800 font-medium">Error: {error}</span>
        </div>
        <button
          onClick={loadQliphothCycles}
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors shadow-md border border-red-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`text-center p-8 text-gray-500 ${className}`}>
        No hay datos de ciclos Qliphoth disponibles
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Disclaimer Ético Prominente */}
      {showEthicalNotice && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg shadow-lg border border-amber-200">
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900">Aviso Ético Importante</h3>
              <p className="text-amber-800 mt-1 text-sm leading-relaxed font-medium">{data.disclaimer}</p>
              <p className="text-amber-800 mt-2 text-sm font-semibold">{data.ethical_notice}</p>
            </div>
            <button
              onClick={() => setShowEthicalNotice(false)}
              className="text-amber-600 hover:text-amber-800"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Qliphoth Actual */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white rounded-lg p-6 shadow-xl border border-purple-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Eye className="h-6 w-6 mr-2" />
            Qliphoth Actual: {QLIPHOTH_INFO[data.current_qliphoth]?.spanishName}
          </h2>
          <div className="flex items-center space-x-2 text-sm">
            <span>Año {data.cycle_year} del ciclo</span>
            <span className="px-2 py-1 bg-purple-700 rounded">
              ↔ {data.corresponding_sefira}
            </span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Expresión de Sombra:</h3>
            <p className="text-purple-100">{data.shadow_manifestation}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Camino de Integración:</h3>
            <p className="text-purple-100">{data.integration_path}</p>
          </div>
        </div>
      </div>

      {/* Timeline Horizontal */}
      <div className="bg-white rounded-lg border shadow-lg p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Timeline de Ciclos Qliphoth
          </h3>
          <button
            onClick={() => setExpandedSections({...expandedSections, timeline: !expandedSections.timeline})}
            className="text-gray-500 hover:text-gray-700"
          >
            {expandedSections.timeline ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {expandedSections.timeline && (
          <div className="overflow-x-auto">
            <div className="flex items-center space-x-1 pb-4 min-w-max">
              {timeline.map((yearData, index) => (
                <div
                  key={yearData.year}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedEvent(yearData.events[0] || null)}
                >
                  {/* Año */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 ${
                      yearData.isCurrent 
                        ? 'border-yellow-400 ring-2 ring-yellow-200' 
                        : yearData.isFuture 
                        ? 'border-gray-300 opacity-50' 
                        : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: yearData.color }}
                  >
                    {yearData.age}
                  </div>
                  
                  {/* Marcadores de eventos */}
                  {yearData.events.length > 0 && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      {yearData.events.some(e => e.events.some(ev => ev.is_crisis)) ? (
                        <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full border border-white"></div>
                      )}
                    </div>
                  )}

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl border border-gray-700">
                      <div className="font-semibold text-gray-100">{yearData.year} (edad {yearData.age})</div>
                      <div className="text-purple-200">{QLIPHOTH_INFO[yearData.qliphoth]?.spanishName}</div>
                      {yearData.events.length > 0 && (
                        <div className="text-amber-300 font-medium">{yearData.events.length} eventos</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Leyenda */}
            <div className="flex flex-wrap gap-2 mt-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Crisis/Evento Significativo</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Evento Menor</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-yellow-400 rounded-full"></div>
                <span>Año Actual</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patrones de Sombra */}
      <div className="bg-white rounded-lg border shadow-lg p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Patrones de Sombra Detectados</h3>
          <button
            onClick={() => setExpandedSections({...expandedSections, patterns: !expandedSections.patterns})}
            className="text-gray-500 hover:text-gray-700"
          >
            {expandedSections.patterns ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {expandedSections.patterns && (
          <div className="space-y-4">
            {data.shadow_patterns.total_events === 0 ? (
              <p className="text-gray-500 italic">No hay eventos suficientes para detectar patrones</p>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded p-4">
                    <h4 className="font-semibold mb-2">Estadísticas</h4>
                    <ul className="text-sm space-y-1">
                      <li>Total de eventos: {data.shadow_patterns.total_events}</li>
                      <li>Eventos de crisis: {data.shadow_patterns.crisis_events}</li>
                      {data.shadow_patterns.most_challenging_qliphoth && (
                        <li>Qliphoth más desafiante: {QLIPHOTH_INFO[data.shadow_patterns.most_challenging_qliphoth]?.spanishName}</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-4">
                    <h4 className="font-semibold mb-2">Correlaciones Crisis-Qliphoth</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(data.shadow_patterns.qliphoth_crisis_correlation).map(([qliphoth, count]) => (
                        <div key={qliphoth} className="flex justify-between">
                          <span>{QLIPHOTH_INFO[qliphoth]?.spanishName}</span>
                          <span className="font-mono">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {data.shadow_patterns.cycle_repetition.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Repeticiones de Ciclo</h4>
                    <div className="space-y-2">
                      {data.shadow_patterns.cycle_repetition.map((rep, index) => (
                        <div key={index} className="bg-amber-50 border border-amber-300 rounded-lg p-3 shadow-md">
                          <div className="font-medium text-amber-800">{QLIPHOTH_INFO[rep.qliphoth]?.spanishName}</div>
                          <div className="text-sm text-amber-700">
                            Años: {rep.years.join(', ')} - {rep.pattern}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Alertas de Consciencia Preventiva */}
      {data.alerts.length > 0 && (
        <div className="bg-white rounded-lg border shadow-lg p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Consciencia Preventiva ({data.alerts.length})
            </h3>
            <button
              onClick={() => setExpandedSections({...expandedSections, alerts: !expandedSections.alerts})}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedSections.alerts ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {expandedSections.alerts && (
            <div className="space-y-3">
              {data.alerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`border rounded p-4 ${
                    alert.type === 'current_awareness' 
                      ? 'bg-blue-50 border-blue-200' 
                      : alert.type === 'historical_pattern'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-purple-50 border-purple-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {QLIPHOTH_INFO[alert.qliphoth]?.spanishName}
                        {alert.days_until > 0 && (
                          <span className="ml-2 text-sm font-normal text-gray-600">
                            (en {alert.days_until} días)
                          </span>
                        )}
                      </h4>
                      <p className="text-gray-700 text-sm mb-2">{alert.message}</p>
                      <p className="text-gray-600 text-sm italic">{alert.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          Análisis generado: {data.consultante_name}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadQliphothCycles}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
          >
            <RefreshCw className="h-4 w-4 mr-2 inline" />
            Actualizar
          </button>
          
          {onSaveAnalysis && (
            <button
              onClick={handleSaveAnalysis}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2 inline" />
              Guardar Análisis
            </button>
          )}
        </div>
      </div>

      {/* Sección de Interpretación AI */}
      <div className="bg-white rounded-lg border shadow-lg p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            Interpretación AI Simbólica
          </h3>
          <button
            onClick={() => setExpandedSections({...expandedSections, ai: !expandedSections.ai})}
            className="text-gray-500 hover:text-gray-700"
          >
            {expandedSections.ai ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {expandedSections.ai && (
          <div className="space-y-4">
            {/* Botones de generación AI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => generateAIInterpretation('cycle_analysis')}
                disabled={aiLoading || !data}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                <Zap className="h-4 w-4 mr-2" />
                Analizar Ciclo Actual
              </button>
              
              <button
                onClick={() => generateAIInterpretation('pattern_synthesis')}
                disabled={aiLoading || !data}
                className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
              >
                <Brain className="h-4 w-4 mr-2" />
                Sintetizar Patrones
              </button>
              
              <button
                onClick={() => generateAIInterpretation('integration_guidance', data?.current_qliphoth)}
                disabled={aiLoading || !data}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Guía de Integración
              </button>
            </div>

            {/* Loading AI */}
            {aiLoading && (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span>Generando interpretación AI...</span>
              </div>
            )}

            {/* Resultado AI */}
            {aiInterpretation && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center mb-3">
                  <Brain className="h-5 w-5 text-purple-600 mr-2" />
                  <h4 className="font-semibold text-purple-800">
                    {aiInterpretation.analysis_type === 'cycle_analysis' && 'Análisis del Ciclo Actual'}
                    {aiInterpretation.analysis_type === 'pattern_synthesis' && 'Síntesis de Patrones'}
                    {aiInterpretation.analysis_type === 'integration_guidance' && 'Guía de Integración'}
                  </h4>
                </div>
                
                <div className="prose prose-sm max-w-none text-gray-800">
                  {aiInterpretation.interpretation && (
                    <div className="whitespace-pre-wrap">{aiInterpretation.interpretation}</div>
                  )}
                  {aiInterpretation.synthesis && (
                    <div className="whitespace-pre-wrap">{aiInterpretation.synthesis}</div>
                  )}
                  {aiInterpretation.guidance && (
                    <div className="whitespace-pre-wrap">{aiInterpretation.guidance}</div>
                  )}
                </div>
                
                <div className="mt-3 text-xs text-purple-600 italic">
                  {aiInterpretation.disclaimer}
                </div>
              </div>
            )}

            {/* Fallback AI no disponible */}
            {!aiInterpretation && !aiLoading && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-amber-800">
                    Selecciona un tipo de análisis para generar interpretación AI simbólica.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección de Notas del Terapeuta y Guardado */}
      <div className="bg-white rounded-lg border shadow-lg p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-600" />
            Notas Terapéuticas y Persistencia
          </h3>
        </div>

        <div className="space-y-4">
          {/* Área de notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones y Notas del Terapeuta
            </label>
            <textarea
              value={therapistNotes}
              onChange={(e) => setTherapistNotes(e.target.value)}
              placeholder="Registra observaciones, insights y plan terapéutico para esta sesión de trabajo de sombra..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Botones de guardado */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => saveAnalysis('cycle_analysis')}
              disabled={saving || !data}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Análisis de Ciclo
            </button>
            
            <button
              onClick={() => saveAnalysis('pattern_synthesis')}
              disabled={saving || !data}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Síntesis
            </button>
            
            <button
              onClick={() => saveAnalysis('integration_work')}
              disabled={saving || !data}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Trabajo Integración
            </button>
            
            <button
              onClick={generateReport}
              disabled={saving || !data}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
            >
              <Download className="h-4 w-4 mr-2" />
              Generar Reporte
            </button>
          </div>

          {/* Estado de guardado */}
          {saving && (
            <div className="flex items-center text-green-600">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              <span>Guardando análisis...</span>
            </div>
          )}
        </div>
      </div>

      {/* Historial de Análisis */}
      <div className="bg-white rounded-lg border shadow-lg p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <History className="h-5 w-5 mr-2 text-indigo-600" />
            Historial de Análisis ({analysisHistory.length})
          </h3>
          <button
            onClick={() => setExpandedSections({...expandedSections, history: !expandedSections.history})}
            className="text-gray-500 hover:text-gray-700"
          >
            {expandedSections.history ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {expandedSections.history && (
          <div className="space-y-3">
            {historyLoading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span>Cargando historial...</span>
              </div>
            ) : analysisHistory.length > 0 ? (
              analysisHistory.map((record, index) => {
                const summary = QliphothAI.extractAnalysisSummary(record);
                if (!summary) return null;
                
                return (
                  <div key={record.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {summary.sessionType.replace('_', ' ').toUpperCase()}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(summary.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-purple-600 font-medium">
                          {summary.qliphothFocus}
                        </span>
                        <div className="text-xs text-gray-500">
                          {summary.hasAIInterpretation ? '🤖 Con AI' : '📝 Manual'}
                        </div>
                      </div>
                    </div>
                    
                    {summary.therapistNotes && (
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                        {summary.therapistNotes.length > 100 
                          ? summary.therapistNotes.substring(0, 100) + '...'
                          : summary.therapistNotes
                        }
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                      <span>Por {summary.therapist}</span>
                      <span>{summary.patternsDetected} patrones detectados</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">
                <History className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No hay análisis previos registrados</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detalle del evento seleccionado */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">
              {selectedEvent.year} - {QLIPHOTH_INFO[selectedEvent.qliphoth]?.spanishName}
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Edad:</span> {selectedEvent.age} años
              </div>
              <div>
                <span className="font-medium">Qliphoth:</span> {selectedEvent.qliphoth}
              </div>
              <div>
                <span className="font-medium">Eventos:</span>
                <ul className="mt-1 space-y-1">
                  {selectedEvent.events.map((event, idx) => (
                    <li key={idx} className={`text-sm p-2 rounded ${event.is_crisis ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-gray-600">{event.severity}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-sm text-gray-600">
                {selectedEvent.detected_pattern}
              </div>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-4 w-full py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QliphothCyclesTimeline;
