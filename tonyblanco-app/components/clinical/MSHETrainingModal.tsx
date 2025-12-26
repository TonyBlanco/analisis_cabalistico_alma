'use client';

import { useState } from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Info, Heart } from 'lucide-react';

interface MSHETrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MSHETrainingModal({ isOpen, onClose }: MSHETrainingModalProps) {
  const [hasRead, setHasRead] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setHasRead(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Uso Responsable del Motor de Síntesis Holística
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Section 1: What IS this module */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-3">
                  ✅ Qué SÍ es este módulo
                </h3>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>Un espejo simbólico que refleja patrones holísticos del proceso personal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>Una herramienta de integración que conecta diferentes perspectivas simbólicas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>Un apoyo a la lectura terapéutica, nunca un sustituto del juicio humano</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>Un instrumento de acompañamiento simbólico y orientativo</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: What is NOT this module */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-3">
                  ❌ Qué NO es este módulo
                </h3>
                <ul className="space-y-2 text-red-800">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Un diagnóstico médico, psicológico o clínico de ningún tipo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Una evaluación cuantitativa o estadística de salud mental</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Un veredicto, sentencia o conclusión definitiva sobre el paciente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Un sustituto del criterio profesional, la experiencia o la intuición terapéutica</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: What TO DO */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  🎯 Qué HACER (DO)
                </h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Usar como guía:</strong> Considerar la síntesis como una perspectiva adicional, no como verdad absoluta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Validar siempre:</strong> Corroborar con el criterio humano y el conocimiento del caso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Explicar los colores:</strong> Al paciente, como indicadores simbólicos de atención consciente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Usar lenguaje simbólico:</strong> Hablar de "lecturas", "reflejos", "perspectivas" en lugar de diagnósticos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Acompañar, no dirigir:</strong> Usar la información para enriquecer el diálogo terapéutico</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: What NOT TO DO */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-orange-900 mb-3">
                  ⚠️ Qué NO HACER (DON'T)
                </h3>
                <ul className="space-y-2 text-orange-800">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span><strong>No afirmar causalidad:</strong> "Esto causa aquello" o explicaciones lineales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span><strong>No usar términos clínicos:</strong> Evitar palabras como "trastorno", "patología", "síntoma"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span><strong>No presentar la IA como autoridad:</strong> Es una herramienta asistente, no experta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span><strong>No alarmar al paciente:</strong> Los colores indican atención, no gravedad</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span><strong>No interpretar sin contexto:</strong> Considerar siempre la historia completa del paciente</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 5: AI Usage */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900 mb-3">
                  🤖 Uso de Inteligencia Artificial
                </h3>
                <div className="bg-white bg-opacity-50 rounded-lg p-4">
                  <p className="text-purple-800 font-medium mb-2">
                    La IA es un asistente de correlación.
                  </p>
                  <p className="text-purple-800 text-sm">
                    Las conclusiones finales son siempre humanas. La IA proporciona perspectivas simbólicas
                    que el terapeuta integra con su experiencia profesional y conocimiento del caso.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Legal Warning */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ⚖️ Advertencia Legal
                </h3>
                <p className="text-gray-800 leading-relaxed">
                  El uso incorrecto de este módulo fuera de su marco simbólico y terapéutico puede generar
                  confusión o daño psicológico en el paciente. El terapeuta es el único responsable de la
                  aplicación ética, profesional y adecuada de esta herramienta en su práctica clínica.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="read-understanding"
                checked={hasRead}
                onChange={(e) => setHasRead(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="read-understanding" className="text-sm text-gray-700">
                He leído y comprendo el uso responsable del MSHE
              </label>
            </div>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}