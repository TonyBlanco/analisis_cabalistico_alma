/**
 * Secciones estructuradas para la Guía del Tarot del Alma
 * Enfocada en el Diagnóstico Cruzado: Tarot + Estado Clínico
 */
import React from 'react';
import { GuideSection } from '@/components/shared/AnalysisGuide';
import { GitMerge, User, Activity, AlertTriangle, Anchor, BookOpen } from 'lucide-react';

export const TAROT_GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'diagnostico-cruzado',
    title: '🧬 ¿Qué es el Diagnóstico Cruzado?',
    subtitle: 'Cruce Clínico: Arquetipo vs Síntoma',
    icon: <GitMerge className="h-6 w-6 text-purple-600" />,
    color: 'purple',
    content: (
      <>
        <p className="mb-4 leading-relaxed">
          A diferencia de una lectura de tarot adivinatoria, esta herramienta realiza un <strong className="text-purple-900">Cruce Clínico</strong>. Compara la energía base del paciente (su Arcano de Nacimiento) con su sintomatología actual (Resultados de Tests).
        </p>
        <p className="mb-4 leading-relaxed">
          El objetivo <strong>no es predecir el futuro</strong>, sino <strong>detectar cómo su energía nativa está contribuyendo al desequilibrio actual</strong>.
        </p>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mt-4">
          <p className="text-sm font-semibold text-purple-900 mb-2">Metodología:</p>
          <p className="text-sm text-purple-800 leading-relaxed">
            <strong>Arquetipo (Hardware del Alma)</strong> + <strong>Síntoma Clínico (Software Actual)</strong> = <strong>Análisis de Fricción y Prescripción de Equilibrio</strong>
          </p>
        </div>
      </>
    ),
    examples: [
      {
        label: 'No es',
        value: 'Adivinación o predicción del futuro'
      },
      {
        label: 'Es',
        value: 'Diagnóstico del desequilibrio energético actual'
      },
      {
        label: 'Objetivo',
        value: 'Identificar cómo el arquetipo nativo agrava el síntoma'
      }
    ]
  },
  {
    id: 'arquetipo',
    title: '1. El Arquetipo (La Energía Base)',
    subtitle: 'El Hardware del Alma',
    icon: <User className="h-6 w-6 text-blue-600" />,
    color: 'blue',
    content: (
      <>
        <p className="mb-4 leading-relaxed">
          Calculado por la <strong className="text-blue-900">fecha de nacimiento</strong>. Representa el <strong>"Hardware" del alma</strong>, su configuración de fábrica.
        </p>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">Ejemplo:</p>
          <p className="text-sm text-blue-800 leading-relaxed">
            Un paciente con <strong>El Loco (Aleph)</strong> tiene una configuración nativa de:
          </p>
          <ul className="text-sm text-blue-800 list-disc list-inside mt-2 space-y-1">
            <li><strong>Aire:</strong> Movimiento constante, ligereza</li>
            <li><strong>Libertad:</strong> Necesidad de espacio y no restricción</li>
            <li><strong>Caos creativo:</strong> Innovación y espontaneidad</li>
            <li><strong>Inocencia:</strong> Confianza en el proceso</li>
          </ul>
        </div>
        <p className="text-sm leading-relaxed mt-4 text-gray-700">
          Esta es su <strong>energía base</strong>, su naturaleza fundamental. No es buena ni mala, simplemente <strong>es</strong>.
        </p>
      </>
    ),
    examples: [
      {
        label: 'Cálculo',
        value: 'Suma fecha de nacimiento → Reduce a 1-22'
      },
      {
        label: 'Representa',
        value: 'La configuración energética nativa del alma'
      },
      {
        label: 'Analogía',
        value: 'El hardware de una computadora (no cambia)'
      }
    ]
  },
  {
    id: 'realidad-clinica',
    title: '2. La Realidad Clínica (El Síntoma)',
    subtitle: 'El Software Actual',
    icon: <Activity className="h-6 w-6 text-red-600" />,
    color: 'rose',
    content: (
      <>
        <p className="mb-4 leading-relaxed">
          Extraído de los <strong className="text-red-900">últimos tests psicométricos</strong> (GAD-7, PHQ-9, BDI-II, etc.). Representa el <strong>"Software" actual</strong> o el estado de crisis.
        </p>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200 mt-4">
          <p className="text-sm font-semibold text-red-900 mb-2">Ejemplo:</p>
          <p className="text-sm text-red-800 leading-relaxed">
            Los tests indican <strong>"Ansiedad Severa"</strong>. Clínicamente, esto es:
          </p>
          <ul className="text-sm text-red-800 list-disc list-inside mt-2 space-y-1">
            <li>Exceso de actividad simpática (lucha/huida)</li>
            <li>Falta de regulación del sistema nervioso</li>
            <li>Hipervigilancia constante</li>
            <li>Dificultad para relajarse o descansar</li>
          </ul>
        </div>
        <p className="text-sm leading-relaxed mt-4 text-gray-700">
          Este es el <strong>estado actual</strong>, el síntoma que necesita ser tratado. Es dinámico y puede cambiar con el tratamiento.
        </p>
      </>
    ),
    examples: [
      {
        label: 'Fuente',
        value: 'Último test clínico realizado (GAD-7, PHQ-9, etc.)'
      },
      {
        label: 'Representa',
        value: 'El estado actual de desequilibrio'
      },
      {
        label: 'Analogía',
        value: 'El software que está corriendo (puede cambiar)'
      }
    ]
  },
  {
    id: 'friccion-sombra',
    title: '3. La Fricción y la Sombra',
    subtitle: 'Cómo el Arquetipo Agrava el Síntoma',
    icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
    color: 'amber',
    content: (
      <>
        <p className="mb-4 leading-relaxed">
          Aquí es donde la <strong className="text-amber-900">IA analiza el conflicto</strong>. Un arquetipo no es "malo", pero en el contexto incorrecto <strong>agrava el síntoma</strong>.
        </p>
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mt-4">
          <p className="text-sm font-semibold text-amber-900 mb-2">La Lógica del Conflicto:</p>
          <p className="text-sm text-amber-800 leading-relaxed mb-2">
            Si <strong>El Loco (Aire/Caos)</strong> sufre de <strong>Ansiedad Severa</strong>, su propia naturaleza está alimentando el fuego:
          </p>
          <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
            <li>El Loco necesita <strong>movimiento constante</strong> → La ansiedad ya causa <strong>hiperactividad</strong></li>
            <li>El Loco busca <strong>libertad sin límites</strong> → La ansiedad necesita <strong>estructura y anclaje</strong></li>
            <li>El Loco confía en el <strong>caos creativo</strong> → La ansiedad necesita <strong>orden y previsibilidad</strong></li>
          </ul>
          <p className="text-sm text-amber-800 mt-3 italic">
            <strong>Resultado:</strong> Seguir "fluyendo" o "confiando en el proceso" solo empeorará el cuadro. El arquetipo en su aspecto sombra está <strong>amplificando el síntoma</strong>.
          </p>
        </div>
        <p className="text-sm leading-relaxed mt-4 text-gray-700">
          La <strong>Sombra</strong> del arquetipo es cuando su energía se desbalancea y se vuelve destructiva en lugar de constructiva.
        </p>
      </>
    ),
    examples: [
      {
        label: 'Análisis',
        value: 'IA identifica cómo el arquetipo agrava el síntoma'
      },
      {
        label: 'Sombra',
        value: 'Aspecto desbalanceado del arquetipo'
      },
      {
        label: 'Fricción',
        value: 'Conflicto entre energía nativa y estado actual'
      }
    ]
  },
  {
    id: 'terapia-tikun',
    title: '4. Terapia de Sanidad Aplicada (Tikún)',
    subtitle: 'El Equilibrio Complementario',
    icon: <Anchor className="h-6 w-6 text-emerald-600" />,
    color: 'emerald',
    content: (
      <>
        <p className="mb-4 leading-relaxed">
          El sistema prescribe lo <strong className="text-emerald-900">opuesto complementario</strong> para equilibrar. Buscamos el <strong>elemento que falta</strong> (Tierra, Agua, Fuego) para crear balance.
        </p>
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 mt-4">
          <p className="text-sm font-semibold text-emerald-900 mb-2">Caso Práctico:</p>
          <p className="text-sm text-emerald-800 leading-relaxed mb-2">
            Para <strong>El Loco con Ansiedad</strong>, NO recetamos:
          </p>
          <ul className="text-sm text-emerald-800 list-disc list-inside space-y-1 mb-3">
            <li>❌ Visualizaciones aéreas (más Aire)</li>
            <li>❌ Meditaciones de "fluir" (más movimiento)</li>
            <li>❌ Ejercicios de "dejar ir" (más caos)</li>
          </ul>
          <p className="text-sm text-emerald-800 leading-relaxed mb-2">
            En su lugar, recetamos <strong>Anclaje (Tierra)</strong>:
          </p>
          <ul className="text-sm text-emerald-800 list-disc list-inside space-y-1">
            <li>✅ <strong>Caminar descalzo</strong> en la tierra (conexión física)</li>
            <li>✅ <strong>Aceites de raíces</strong> (Vetiver, Sándalo) - aromaterapia de anclaje</li>
            <li>✅ <strong>Pesas o ejercicios de resistencia</strong> (fuerza física)</li>
            <li>✅ <strong>Rutinas estructuradas</strong> (horarios fijos, rituales)</li>
            <li>✅ <strong>Alimentos de raíz</strong> (zanahorias, remolachas) - nutrición de Tierra</li>
          </ul>
          <p className="text-sm text-emerald-800 mt-3 italic font-medium">
            <strong>Principio:</strong> Sanamos aplicando la restricción necesaria para que la luz se asiente. El elemento opuesto complementario equilibra el desbalance.
          </p>
        </div>
        <p className="text-sm leading-relaxed mt-4 text-gray-700">
          El <strong>Tikún (Corrección)</strong> no es eliminar el arquetipo, sino <strong>equilibrarlo</strong> con su opuesto complementario para que pueda expresarse de forma saludable.
        </p>
      </>
    ),
    examples: [
      {
        label: 'Principio',
        value: 'Opuesto complementario para equilibrio'
      },
      {
        label: 'Método',
        value: 'Identificar elemento faltante (Tierra, Agua, Fuego)'
      },
      {
        label: 'Resultado',
        value: 'Arquetipo expresado de forma saludable'
      }
    ]
  },
  {
    id: 'protocolo-interpretacion',
    title: '5. Protocolo de Interpretación',
    subtitle: 'Guía práctica paso a paso',
    icon: <BookOpen className="h-6 w-6 text-indigo-600" />,
    color: 'indigo',
    content: (
      <>
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <h4 className="font-semibold text-indigo-900 mb-3">Pasos del Diagnóstico Cruzado:</h4>
          <ol className="space-y-3 text-sm list-decimal list-inside text-gray-700">
            <li>
              <strong>Calcula el Arcano de Vida:</strong> Suma fecha de nacimiento → Reduce a 1-22. Este es el arquetipo base (Hardware).
            </li>
            <li>
              <strong>Identifica el Síntoma Clínico:</strong> Revisa el último test (GAD-7, PHQ-9, etc.) y su severidad. Este es el estado actual (Software).
            </li>
            <li>
              <strong>Analiza la Fricción:</strong> La IA identifica cómo el arquetipo en sombra está agravando el síntoma. Lee el "Análisis de Sombra".
            </li>
            <li>
              <strong>Aplica el Tikún:</strong> Sigue las 3 acciones de sanación prescritas. Son específicas y opuestas complementarias al arquetipo.
            </li>
            <li>
              <strong>Monitorea el Progreso:</strong> Repite tests periódicamente para ver si el equilibrio se está restaurando.
            </li>
          </ol>
        </div>
        <div className="bg-indigo-100 rounded-lg p-4 border border-indigo-300 mt-4">
          <p className="text-sm font-semibold text-indigo-900 mb-2">⚠️ Recordatorio Importante:</p>
          <p className="text-sm text-indigo-800 leading-relaxed">
            <strong>No elimines el arquetipo</strong>, <strong>equilíbralo</strong>. El Loco no debe dejar de ser El Loco, pero necesita aprender a anclarse cuando la ansiedad lo desborda. El objetivo es que el arquetipo se exprese de forma <strong>saludable y constructiva</strong>, no destructiva.
          </p>
        </div>
      </>
    ),
    examples: [
      {
        label: 'Paso 1',
        value: 'Calcular Arcano de Vida'
      },
      {
        label: 'Paso 2',
        value: 'Identificar Síntoma Clínico'
      },
      {
        label: 'Paso 3',
        value: 'Analizar Fricción (IA)'
      },
      {
        label: 'Paso 4',
        value: 'Aplicar Tikún (Acciones)'
      }
    ]
  }
];

