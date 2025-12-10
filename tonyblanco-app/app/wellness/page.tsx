'use client';

import WellnessAnalysis from '@/components/WellnessAnalysis';
import { Activity, Heart, Info } from 'lucide-react';

export default function WellnessTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Activity className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Test de Bienestar Integral
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Evaluación completa de 38 indicadores clave para identificar el estado de tus sistemas corporales
          </p>
        </div>

        {/* Información del Test */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-bold mb-2">Sobre este análisis</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• <strong>38 preguntas</strong> diseñadas para evaluar 6 sistemas corporales principales</li>
                <li>• Responde con <strong>honestidad</strong> según tu experiencia reciente (últimas 4 semanas)</li>
                <li>• El test toma aproximadamente <strong>5-7 minutos</strong></li>
                <li>• Recibirás un <strong>análisis visual detallado</strong> con gráficos y recomendaciones</li>
                <li>• Los sistemas evaluados: Digestivo, Nervioso, Circulatorio, Respiratorio, Esquelético y Muscular</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sistema de Puntuación */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-purple-400" />
              <h3 className="text-white font-bold">Sistema de Puntuación</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-300"><strong>0-25%:</strong> Óptimo - Sistema funcionando perfectamente</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300"><strong>26-50%:</strong> Normal - Síntomas leves ocasionales</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-gray-300"><strong>51-75%:</strong> Regular - Requiere atención</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-gray-300"><strong>76-100%:</strong> Crítico - Atención prioritaria necesaria</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Beneficios del Test</h3>
            <ul className="text-gray-300 space-y-2">
              <li>✓ Identificación temprana de desequilibrios</li>
              <li>✓ Visualización clara de áreas problemáticas</li>
              <li>✓ Seguimiento de tu progreso en el tiempo</li>
              <li>✓ Recomendaciones personalizadas</li>
              <li>✓ Base para consultas con profesionales</li>
            </ul>
          </div>
        </div>

        {/* Componente de Test */}
        <WellnessAnalysis />

        {/* Disclaimer */}
        <div className="mt-8 bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <p className="text-gray-400 text-sm text-center">
            <strong>Nota importante:</strong> Este test es una herramienta de autoconocimiento y orientación general. 
            No sustituye el diagnóstico médico profesional. Si experimentas síntomas graves o persistentes, 
            consulta con un profesional de la salud.
          </p>
        </div>
      </div>
    </div>
  );
}
