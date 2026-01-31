'use client';

/**
 * Trabajo de Sombras - Módulo SWM para análisis de Qliphoth
 * 
 * Este módulo integra:
 * - Análisis de Qliphoth/Trabajo de Sombras existente
 * - Nuevos Ciclos de Sombra Personal 
 * - Timeline de eventos correlacionados con Qliphoth
 * - Consciencia preventiva ética
 */

import React, { useState, useEffect } from 'react';
import { Moon, Eye, Calendar, AlertTriangle, BookOpen, Shield, Save, Sparkles } from 'lucide-react';
import QliphothCyclesTimeline from '@/components/CabalAppliedWorkspace/QliphothCyclesTimeline';
import ShadowWorkPanel from '@/components/CabalAppliedWorkspace/ShadowWorkPanel';
import useActiveConsultante from '@/hooks/useActiveConsultante';
import { saveQliphothAnalysis } from '@/lib/cabala-qliphoth-cycles-api';
import { GenericAIAssistantPanel } from '@/components/ai';

const TrabajoSombrasPage: React.FC = () => {
  const activePatient = useActiveConsultante();
  const [patientLoading, setPatientLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'shadow-work' | 'cycles' | 'synthesis'>('shadow-work');
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Set loading state based on activePatient
  useEffect(() => {
    // Give hook time to resolve
    const timer = setTimeout(() => setPatientLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Handler para guardar análisis de ciclos
  const handleSaveAnalysis = async (analysisData: any) => {
    if (!activePatient) return;
    
    setSaving(true);
    try {
      const result = await saveQliphothAnalysis(activePatient.id, analysisData);
      
      // Actualizar lista de análisis guardados
      setSavedAnalyses(prev => [...prev, result]);
      
      // Mostrar confirmación
      alert('Análisis de Ciclos de Sombra guardado exitosamente');
    } catch (error) {
      console.error('Error saving shadow cycles analysis:', error);
      alert('Error al guardar el análisis: ' + error);
    } finally {
      setSaving(false);
    }
  };

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Cargando módulo de trabajo de sombras...</span>
      </div>
    );
  }

  if (!activePatient) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Paciente Requerido</h3>
        <p className="text-yellow-700">
          Selecciona un paciente activo para acceder al módulo de Trabajo de Sombras.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 p-6">
      {/* Header del Módulo */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white rounded-lg p-6 mb-6 shadow-xl border border-purple-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center mb-2">
              <Moon className="h-8 w-8 mr-3" />
              Trabajo de Sombras
            </h1>
            <p className="text-purple-200 text-lg">
              Análisis integral de aspectos sombríos para {activePatient.nombre_completo}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-purple-700 px-4 py-2 rounded-lg shadow-lg border border-purple-600">
              <span className="text-sm font-medium">Módulo SWM</span>
              <br />
              <span className="text-xs text-purple-200">Qliphoth & Sombra Personal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Ético Global */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg mb-6">
        <div className="flex items-start">
          <Shield className="h-6 w-6 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-amber-800 mb-1">Principio Ético del Módulo</h3>
            <p className="text-amber-700 text-sm leading-relaxed">
              Este módulo analiza patrones históricos del consultante para consciencia preventiva. 
              <strong> NO predice crisis ni determina eventos futuros.</strong> Los ciclos de sombra 
              son mapas de reflexión que invitan a la integración consciente, nunca al determinismo.
            </p>
          </div>
        </div>
      </div>

      {/* Navegación de Pestañas */}
      <div className="bg-white rounded-lg border shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('shadow-work')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'shadow-work'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Eye className="h-4 w-4 mr-2 inline" />
              Trabajo de Sombras Clásico
            </button>
            
            <button
              onClick={() => setActiveTab('cycles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cycles'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2 inline" />
              Ciclos de Sombra Personal
            </button>
            
            <button
              onClick={() => setActiveTab('synthesis')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'synthesis'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="h-4 w-4 mr-2 inline" />
              Síntesis Integral
            </button>
          </nav>
        </div>

        {/* Contenido de Pestañas */}
        <div className="p-6">
          {activeTab === 'shadow-work' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Análisis de Qliphoth Clásico</h2>
              <p className="text-gray-600 mb-6">
                Análisis simbólico de aspectos sombríos basado en correspondencias cabalísticas tradicionales.
              </p>
              
              {/* Panel de IA para Trabajo de Sombras */}
              <GenericAIAssistantPanel
                moduleType="trabajo-sombras"
                moduleTitle="Trabajo de Sombras"
                consultanteId={activePatient?.id}
                context={{
                  consultante_name: activePatient?.nombre_completo,
                  module: 'shadow-work',
                }}
              />
              
              {/* Aquí se integraría el componente ShadowWorkPanel existente */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <Moon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Trabajo de Sombras Tradicional</h3>
                <p className="text-gray-500 mb-4">
                  Componente ShadowWorkPanel se integrará aquí cuando esté disponible.
                </p>
                <p className="text-sm text-gray-400">
                  Este espacio mostrará análisis de Qliphoth basado en datos numerológicos 
                  y correspondencias del Árbol de la Vida.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'cycles' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Ciclos de Sombra Personal</h2>
              <p className="text-gray-600 mb-6">
                Timeline de eventos históricos correlacionados con ciclos Qliphoth. 
                <span className="font-medium text-amber-700">
                  Solo para consciencia preventiva, no predicción.
                </span>
              </p>
              
              <QliphothCyclesTimeline
                consultanteUuid={activePatient.id}
                onSaveAnalysis={handleSaveAnalysis}
                className="" 
              />
            </div>
          )}

          {activeTab === 'synthesis' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Síntesis Integral</h2>
              <p className="text-gray-600 mb-6">
                Integración entre el trabajo de sombras clásico y los ciclos personales 
                para una comprensión holística.
              </p>
              
              <div className="space-y-6">
                {/* Análisis Guardados */}
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Save className="h-5 w-5 mr-2" />
                    Análisis Guardados ({savedAnalyses.length})
                  </h3>
                  
                  {savedAnalyses.length === 0 ? (
                    <p className="text-gray-500 italic">
                      No hay análisis de sombra guardados aún. 
                      Guarda un análisis de ciclos para verlo aquí.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {savedAnalyses.map((analysis, index) => (
                        <div key={index} className="bg-purple-50 border border-purple-200 rounded p-3">
                          <div className="font-medium">{analysis.method_name}</div>
                          <div className="text-sm text-gray-600">
                            Guardado: {new Date(analysis.created_at || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Próximas Integraciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Próximas Integraciones</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Correlación entre trabajo de sombras clásico y ciclos personales</li>
                    <li>• Síntesis de patrones recurrentes en múltiples análisis</li>
                    <li>• Recomendaciones de integración personalizada</li>
                    <li>• Export holístico unificado</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estado de Guardado */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Guardando análisis...
          </div>
        </div>
      )}
    </div>
  );
};

export default TrabajoSombrasPage;
