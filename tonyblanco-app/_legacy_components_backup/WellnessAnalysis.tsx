'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, XCircle, Brain, Heart, Utensils, Wind, Droplets, Bone, Download, History, Sparkles, TrendingUp } from 'lucide-react';
import { getSystemImage } from '@/lib/body-system-images';
import { saveTestResult, getLastTest } from '@/lib/wellness-persistence';
import { downloadWellnessPDF } from '@/lib/wellness-pdf-generator';
import { generateRecommendations, type Recommendation } from '@/lib/wellness-recommendations';
import { analyzeWithAI, type AIAnalysisResult } from '@/lib/wellness-ai-analysis';
import type { WellnessTestResult } from '@/lib/wellness-persistence';

interface Question {
  id: number;
  text: string;
  system: BodySystem;
}

type BodySystem = 'Digestivo' | 'Nervioso' | 'Circulatorio' | 'Respiratorio' | 'Esquelético' | 'Muscular';

interface SystemResult {
  system: BodySystem;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'Óptimo' | 'Normal' | 'Regular' | 'Crítico';
  color: string;
  icon: any;
  image: string;
}

const QUESTIONS: Question[] = [
  // Sistema Digestivo (8 preguntas)
  { id: 1, text: '¿Experimentas hinchazón abdominal después de comer?', system: 'Digestivo' },
  { id: 2, text: '¿Sufres de estreñimiento o diarrea frecuente?', system: 'Digestivo' },
  { id: 3, text: '¿Tienes acidez estomacal o reflujo?', system: 'Digestivo' },
  { id: 4, text: '¿Sientes pesadez después de las comidas?', system: 'Digestivo' },
  { id: 5, text: '¿Tienes gases intestinales con frecuencia?', system: 'Digestivo' },
  { id: 6, text: '¿Experimentas náuseas o malestar digestivo?', system: 'Digestivo' },
  { id: 7, text: '¿Tienes falta de apetito o saciedad temprana?', system: 'Digestivo' },
  { id: 8, text: '¿Sufres de dolor abdominal recurrente?', system: 'Digestivo' },

  // Sistema Nervioso (8 preguntas)
  { id: 9, text: '¿Te sientes ansioso o nervioso con frecuencia?', system: 'Nervioso' },
  { id: 10, text: '¿Tienes dificultad para concentrarte?', system: 'Nervioso' },
  { id: 11, text: '¿Experimentas insomnio o dificultad para dormir?', system: 'Nervioso' },
  { id: 12, text: '¿Sufres de dolores de cabeza frecuentes?', system: 'Nervioso' },
  { id: 13, text: '¿Te sientes estresado constantemente?', system: 'Nervioso' },
  { id: 14, text: '¿Experimentas cambios de humor repentinos?', system: 'Nervioso' },
  { id: 15, text: '¿Tienes temblores o tics nerviosos?', system: 'Nervioso' },
  { id: 16, text: '¿Sientes fatiga mental o agotamiento?', system: 'Nervioso' },

  // Sistema Circulatorio (6 preguntas)
  { id: 17, text: '¿Experimentas palpitaciones o ritmo cardíaco irregular?', system: 'Circulatorio' },
  { id: 18, text: '¿Tienes las manos o pies fríos frecuentemente?', system: 'Circulatorio' },
  { id: 19, text: '¿Sufres de presión arterial alta o baja?', system: 'Circulatorio' },
  { id: 20, text: '¿Tienes varices o hinchazón en las piernas?', system: 'Circulatorio' },
  { id: 21, text: '¿Experimentas mareos al levantarte?', system: 'Circulatorio' },
  { id: 22, text: '¿Tienes dolor en el pecho ocasionalmente?', system: 'Circulatorio' },

  // Sistema Respiratorio (6 preguntas)
  { id: 23, text: '¿Tienes dificultad para respirar profundamente?', system: 'Respiratorio' },
  { id: 24, text: '¿Experimentas tos crónica o recurrente?', system: 'Respiratorio' },
  { id: 25, text: '¿Sufres de congestión nasal frecuente?', system: 'Respiratorio' },
  { id: 26, text: '¿Tienes alergias respiratorias o asma?', system: 'Respiratorio' },
  { id: 27, text: '¿Experimentas falta de aire al hacer ejercicio?', system: 'Respiratorio' },
  { id: 28, text: '¿Tienes opresión en el pecho al respirar?', system: 'Respiratorio' },

  // Sistema Esquelético (5 preguntas)
  { id: 29, text: '¿Experimentas dolor en las articulaciones?', system: 'Esquelético' },
  { id: 30, text: '¿Tienes rigidez al despertar por las mañanas?', system: 'Esquelético' },
  { id: 31, text: '¿Sufres de dolor de espalda frecuente?', system: 'Esquelético' },
  { id: 32, text: '¿Experimentas crujidos en las articulaciones?', system: 'Esquelético' },
  { id: 33, text: '¿Tienes problemas de postura o alineación?', system: 'Esquelético' },

  // Sistema Muscular (5 preguntas)
  { id: 34, text: '¿Experimentas calambres musculares frecuentes?', system: 'Muscular' },
  { id: 35, text: '¿Tienes tensión muscular o contracturas?', system: 'Muscular' },
  { id: 36, text: '¿Sufres de debilidad muscular?', system: 'Muscular' },
  { id: 37, text: '¿Experimentas dolor muscular después del ejercicio?', system: 'Muscular' },
  { id: 38, text: '¿Tienes fatiga muscular rápidamente?', system: 'Muscular' },
];

const SYSTEM_INFO: Record<BodySystem, { icon: any; image: string; description: string }> = {
  'Digestivo': {
    icon: Utensils,
    image: '/body-systems/digestive.svg',
    description: 'Sistema responsable de la digestión y absorción de nutrientes'
  },
  'Nervioso': {
    icon: Brain,
    image: '/body-systems/nervous.svg',
    description: 'Sistema que controla las funciones del cuerpo y procesa información'
  },
  'Circulatorio': {
    icon: Heart,
    image: '/body-systems/circulatory.svg',
    description: 'Sistema que transporta sangre, oxígeno y nutrientes por el cuerpo'
  },
  'Respiratorio': {
    icon: Wind,
    image: '/body-systems/respiratory.svg',
    description: 'Sistema que proporciona oxígeno y elimina dióxido de carbono'
  },
  'Esquelético': {
    icon: Bone,
    image: '/body-systems/skeletal.svg',
    description: 'Sistema que proporciona estructura, soporte y protección al cuerpo'
  },
  'Muscular': {
    icon: Activity,
    image: '/body-systems/muscular.svg',
    description: 'Sistema que permite el movimiento y mantiene la postura'
  },
};

interface WellnessAnalysisProps {
  onComplete?: (result: any) => void;
  patientMode?: boolean;
}

export default function WellnessAnalysis({ onComplete, patientMode = false }: WellnessAnalysisProps = {}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisResult | null>(null);
  const [testStartTime] = useState(Date.now());
  const [lastTestData, setLastTestData] = useState<WellnessTestResult | null>(null);

  useEffect(() => {
    // Cargar último test al montar
    const last = getLastTest();
    if (last) {
      setLastTestData(last);
    }
  }, []);

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [QUESTIONS[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Finalizar test y guardar resultados
      const completedIn = Math.round((Date.now() - testStartTime) / 1000 / 60); // minutos
      const results = calculateResults();
      
      const testResult = {
        answers: newAnswers,
        systemScores: results.map(r => ({
          system: r.system,
          score: r.score,
          maxScore: r.maxScore,
          percentage: r.percentage,
          status: r.status
        })),
        totalQuestions: QUESTIONS.length,
        completedIn
      };

      // En modo paciente, llamar al callback sin guardar localmente
      if (patientMode && onComplete) {
        // Generar recomendaciones
        const testResultWithMeta: WellnessTestResult = {
          ...testResult,
          id: '',
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
        };
        
        const recs = generateRecommendations(testResultWithMeta);
        setRecommendations(recs);
        
        onComplete(testResult);
        setShowResults(true);
      } else {
        // Modo normal: guardar en localStorage
        const testResultFull: WellnessTestResult = {
          ...testResult,
          id: '',
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
        };
        
        saveTestResult(testResultFull);
        
        // Generar recomendaciones
        const recs = generateRecommendations(testResultFull);
        setRecommendations(recs);

        // Análisis IA (opcional, en background)
        analyzeWithAI(testResultFull).then(analysis => {
          if (analysis) {
            setAIAnalysis(analysis);
          }
        }).catch(err => console.error('Error en análisis IA:', err));

        setShowResults(true);
      }
    }
  };

  const calculateResults = (): SystemResult[] => {
    const systemScores: Record<BodySystem, { score: number; count: number }> = {
      'Digestivo': { score: 0, count: 0 },
      'Nervioso': { score: 0, count: 0 },
      'Circulatorio': { score: 0, count: 0 },
      'Respiratorio': { score: 0, count: 0 },
      'Esquelético': { score: 0, count: 0 },
      'Muscular': { score: 0, count: 0 },
    };

    QUESTIONS.forEach(q => {
      const answer = answers[q.id] || 0;
      systemScores[q.system].score += answer;
      systemScores[q.system].count += 1;
    });

    return Object.entries(systemScores).map(([system, data]) => {
      const maxScore = data.count * 3; // Máximo 3 puntos por pregunta
      const percentage = (data.score / maxScore) * 100;
      
      let status: SystemResult['status'];
      let color: string;
      
      if (percentage <= 25) {
        status = 'Óptimo';
        color = 'bg-green-500';
      } else if (percentage <= 50) {
        status = 'Normal';
        color = 'bg-blue-500';
      } else if (percentage <= 75) {
        status = 'Regular';
        color = 'bg-orange-500';
      } else {
        status = 'Crítico';
        color = 'bg-red-500';
      }

      const systemInfo = SYSTEM_INFO[system as BodySystem];

      return {
        system: system as BodySystem,
        score: data.score,
        maxScore,
        percentage: Math.round(percentage),
        status,
        color,
        icon: systemInfo.icon,
        image: systemInfo.image,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setRecommendations([]);
    setAIAnalysis(null);
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const results = calculateResults();
      const completedIn = Math.round((Date.now() - testStartTime) / 1000 / 60);
      
      const testResult: WellnessTestResult = {
        id: 'current',
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        answers,
        systemScores: results.map(r => ({
          system: r.system,
          score: r.score,
          maxScore: r.maxScore,
          percentage: r.percentage,
          status: r.status
        })),
        totalQuestions: QUESTIONS.length,
        completedIn
      };

      await downloadWellnessPDF(testResult);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta de nuevo.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (showResults) {
    const results = calculateResults();
    const criticalSystems = results.filter(r => r.status === 'Crítico' || r.status === 'Regular');

    return (
      <div className="bg-gradient-to-br from-slate-900/50 to-purple-900/30 backdrop-blur-md rounded-2xl border border-purple-500/30 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Resultados del Análisis de Bienestar</h2>
          <p className="text-gray-300">Evaluación completa de tus sistemas corporales</p>
        </div>

        {/* Atención Prioritaria */}
        {criticalSystems.length > 0 && (
          <div className="mb-8 bg-red-900/20 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-red-300">Atención Prioritaria</h3>
            </div>
            <p className="text-gray-300 mb-4">Los siguientes sistemas requieren atención inmediata:</p>
            <div className="space-y-3">
              {criticalSystems.map((result, idx) => {
                const Icon = result.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3">
                    <Icon className="w-5 h-5 text-red-400" />
                    <span className="text-white font-semibold">{result.system}</span>
                    <span className={`ml-auto px-3 py-1 rounded-full text-sm font-bold ${
                      result.status === 'Crítico' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resultados por Sistema con Imágenes */}
        <div className="space-y-6 mb-8">
          {results.map((result, idx) => {
            const Icon = result.icon;
            const systemInfo = SYSTEM_INFO[result.system];
            
            return (
              <div key={idx} className="bg-slate-900/50 rounded-xl border border-purple-500/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-6 mb-4">
                    {/* Imagen del Sistema Corporal */}
                    <div className="flex-shrink-0 w-32 h-48 bg-slate-800/50 rounded-lg border border-purple-500/20 flex items-center justify-center overflow-hidden p-2">
                      <div 
                        className="relative w-full h-full"
                        dangerouslySetInnerHTML={{ __html: getSystemImage(result.system) }}
                      />
                    </div>

                    {/* Información del Sistema */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-6 h-6 text-purple-400" />
                        <h3 className="text-2xl font-bold text-white">{result.system}</h3>
                        <span className={`ml-auto px-4 py-1 rounded-full text-sm font-bold ${
                          result.status === 'Óptimo' ? 'bg-green-500 text-white' :
                          result.status === 'Normal' ? 'bg-blue-500 text-white' :
                          result.status === 'Regular' ? 'bg-orange-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4">{systemInfo.description}</p>

                      {/* Barra de Progreso */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                          <span>Puntuación: {result.score} / {result.maxScore}</span>
                          <span>{result.percentage}%</span>
                        </div>
                        <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${result.color} transition-all duration-500 rounded-full`}
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Indicadores de Estado */}
                      <div className="grid grid-cols-4 gap-2">
                        <div className={`text-center py-2 rounded ${result.percentage <= 25 ? 'bg-green-500/20 border border-green-500/50' : 'bg-slate-800/50'}`}>
                          <p className="text-xs text-gray-400">Óptimo</p>
                          <p className="text-sm font-bold text-white">0-25%</p>
                        </div>
                        <div className={`text-center py-2 rounded ${result.percentage > 25 && result.percentage <= 50 ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-slate-800/50'}`}>
                          <p className="text-xs text-gray-400">Normal</p>
                          <p className="text-sm font-bold text-white">26-50%</p>
                        </div>
                        <div className={`text-center py-2 rounded ${result.percentage > 50 && result.percentage <= 75 ? 'bg-orange-500/20 border border-orange-500/50' : 'bg-slate-800/50'}`}>
                          <p className="text-xs text-gray-400">Regular</p>
                          <p className="text-sm font-bold text-white">51-75%</p>
                        </div>
                        <div className={`text-center py-2 rounded ${result.percentage > 75 ? 'bg-red-500/20 border border-red-500/50' : 'bg-slate-800/50'}`}>
                          <p className="text-xs text-gray-400">Crítico</p>
                          <p className="text-sm font-bold text-white">76-100%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Análisis IA */}
        {aiAnalysis && (
          <div className="mb-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">Análisis Inteligente</h3>
            </div>
            
            <p className="text-gray-300 mb-6">{aiAnalysis.summary}</p>

            {aiAnalysis.patterns.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  Patrones Detectados
                </h4>
                <div className="space-y-3">
                  {aiAnalysis.patterns.map((pattern, idx) => (
                    <div key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          pattern.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                          pattern.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {pattern.severity === 'high' ? 'Alta' : pattern.severity === 'medium' ? 'Media' : 'Baja'}
                        </span>
                        <h5 className="font-bold text-white">{pattern.pattern}</h5>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{pattern.description}</p>
                      <p className="text-xs text-purple-300">
                        Afecta: {pattern.affectedSystems.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiAnalysis.encouragement && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-300 italic">"{aiAnalysis.encouragement}"</p>
              </div>
            )}
          </div>
        )}

        {/* Recomendaciones Prioritarias */}
        {recommendations.length > 0 && (
          <div className="mb-8 bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Recomendaciones Personalizadas</h3>
            <div className="space-y-4">
              {recommendations.slice(0, 5).map((rec, idx) => {
                const priorityColor = rec.priority === 'high' ? 'text-red-400' : 
                                     rec.priority === 'medium' ? 'text-orange-400' : 'text-blue-400';
                const bgColor = rec.priority === 'high' ? 'bg-red-900/20 border-red-500/30' :
                               rec.priority === 'medium' ? 'bg-orange-900/20 border-orange-500/30' :
                               'bg-blue-900/20 border-blue-500/30';
                
                return (
                  <div key={idx} className={`${bgColor} border rounded-lg p-4`}>
                    <div className="flex items-start gap-3">
                      <span className={`${priorityColor} font-bold text-sm mt-1`}>
                        {rec.priority === 'high' ? '●●●' : rec.priority === 'medium' ? '●●' : '●'}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">{rec.title}</h4>
                        <p className="text-gray-300 text-sm mb-2">{rec.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                            {rec.category}
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                            Impacto: {rec.estimatedImpact}
                          </span>
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">
                            {rec.timeframe}
                          </span>
                        </div>
                        {rec.actions && rec.actions.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {rec.actions.map((action, actionIdx) => (
                              <li key={actionIdx} className="text-xs text-gray-400 flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            {isGeneratingPDF ? 'Generando PDF...' : 'Descargar Reporte PDF'}
          </button>

          <button
            onClick={() => window.location.href = '/wellness/history'}
            className="py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <History className="w-5 h-5" />
            Ver Historial
          </button>

          <button
            onClick={resetTest}
            className="py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <Activity className="w-5 h-5" />
            Nuevo Test
          </button>
        </div>

        {/* Info de último test */}
        {lastTestData && (
          <div className="text-center text-sm text-gray-400">
            Último test realizado: {new Date(lastTestData.timestamp).toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentQuestion];
  const Icon = SYSTEM_INFO[question.system].icon;

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-purple-900/30 backdrop-blur-md rounded-2xl border border-purple-500/30 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-white">Análisis de Bienestar</h2>
          <span className="text-purple-300 font-semibold">
            Pregunta {currentQuestion + 1} de {QUESTIONS.length}
          </span>
        </div>
        
        {/* Barra de Progreso General */}
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Sistema Actual */}
      <div className="mb-6 flex items-center gap-3 bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
        <Icon className="w-6 h-6 text-purple-400" />
        <div>
          <p className="text-sm text-gray-400">Evaluando Sistema</p>
          <p className="text-lg font-bold text-white">{question.system}</p>
        </div>
      </div>

      {/* Pregunta */}
      <div className="mb-8">
        <p className="text-xl text-white font-semibold leading-relaxed">
          {question.text}
        </p>
      </div>

      {/* Opciones de Respuesta */}
      <div className="space-y-3">
        <button
          onClick={() => handleAnswer(0)}
          className="w-full p-4 bg-green-900/20 hover:bg-green-900/40 border border-green-500/30 hover:border-green-500 text-white rounded-xl transition-all duration-200 flex items-center gap-3 group"
        >
          <CheckCircle className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <p className="font-bold">Nunca o Casi Nunca</p>
            <p className="text-sm text-gray-400">No experimento este síntoma</p>
          </div>
        </button>

        <button
          onClick={() => handleAnswer(1)}
          className="w-full p-4 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-500/30 hover:border-blue-500 text-white rounded-xl transition-all duration-200 flex items-center gap-3 group"
        >
          <Activity className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <p className="font-bold">Ocasionalmente</p>
            <p className="text-sm text-gray-400">Sucede algunas veces al mes</p>
          </div>
        </button>

        <button
          onClick={() => handleAnswer(2)}
          className="w-full p-4 bg-orange-900/20 hover:bg-orange-900/40 border border-orange-500/30 hover:border-orange-500 text-white rounded-xl transition-all duration-200 flex items-center gap-3 group"
        >
          <AlertCircle className="w-6 h-6 text-orange-400 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <p className="font-bold">Frecuentemente</p>
            <p className="text-sm text-gray-400">Sucede varias veces por semana</p>
          </div>
        </button>

        <button
          onClick={() => handleAnswer(3)}
          className="w-full p-4 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500 text-white rounded-xl transition-all duration-200 flex items-center gap-3 group"
        >
          <XCircle className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <p className="font-bold">Constantemente</p>
            <p className="text-sm text-gray-400">Sucede todos los días</p>
          </div>
        </button>
      </div>

      {/* Navegación */}
      {currentQuestion > 0 && (
        <button
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
          className="mt-6 text-purple-300 hover:text-purple-200 transition-colors"
        >
          ← Pregunta Anterior
        </button>
      )}
    </div>
  );
}
