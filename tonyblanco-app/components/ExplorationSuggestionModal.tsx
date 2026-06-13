'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXPLORATION SUGGESTION MODAL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 🎯 PIEZA CENTRAL DEL MOTOR DE TRANSICIÓN SIMBÓLICA
 * 
 * Este modal es el componente que traduce los datos estructurados de un
 * resultado de exploración en una explicación clínica pedagógica para el
 * terapeuta, basándose en el modelo cabalístico de los Cuatro Mundos.
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  ATZILUT → BERIÁ → IETZIRÁ → ASIÁ                                       │
 * │  Esencia → Intelecto → Emoción → Acción                                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * @purpose     Explicar el PORQUÉ de la sugerencia de transición
 * @audience    Solo terapeutas (nunca pacientes)
 * @trigger     Automático (primera vez) o manual (botón "Ver motivo")
 * @behavior    No bloquea el flujo — informativo y pedagógico
 * 
 * @see docs/SYMBOLIC_TRANSITION_ENGINE.md para documentación completa
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { Lightbulb, ArrowRight, BookOpen, Sparkles, ClipboardList } from 'lucide-react';

// Cabalistic world metadata for clinical explanations
const WORLD_METADATA: Record<string, {
  name: string;
  hebrewName: string;
  domain: string;
  color: string;
  bgColor: string;
  description: string;
  clinicalFocus: string;
  suggestedTests: { code: string; name: string }[];
}> = {
  atzilut: {
    name: 'Atzilut',
    hebrewName: 'אצילות',
    domain: 'Unidad y Esencia',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50 border-violet-200',
    description: 'El mundo de la emanación pura, la esencia del ser antes de la diferenciación.',
    clinicalFocus: 'Explorar la conexión con el propósito vital, la identidad esencial y los patrones arquetípicos profundos.',
    suggestedTests: [
      { code: 'past-lives', name: 'Exploración de Vidas Pasadas' },
      { code: 'asrs_essence', name: 'ASRS-Essence (Ritmo Esencial)' },
    ],
  },
  beria: {
    name: 'Beriá',
    hebrewName: 'בריאה',
    domain: 'Intelecto y Conciencia',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'El mundo de la creación mental, donde se forman los pensamientos y la comprensión.',
    clinicalFocus: 'Evaluar cómo la persona piensa, organiza y da sentido a su experiencia. Explorar patrones cognitivos y sistemas de creencias.',
    suggestedTests: [
      { code: 'wellness', name: 'Wellness Assessment' },
      { code: 'screening-general', name: 'Screening Psicológico General' },
      { code: 'aq_kabbalah', name: 'AQ-Kabbalah (Espectro de Conciencia)' },
      { code: 'scl90', name: 'SCL-90 (Visión Holística)' },
    ],
  },
  yetzirah: {
    name: 'Ietzirá',
    hebrewName: 'יצירה',
    domain: 'Emoción y Regulación',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    description: 'El mundo de la formación emocional, donde se gestan los afectos y las reacciones.',
    clinicalFocus: 'Observar el movimiento afectivo, la regulación emocional interna y los patrones de reacción ante el entorno.',
    suggestedTests: [
      { code: 'anxiety-state-trait', name: 'Ansiedad Estado-Rasgo' },
      { code: 'stress-regulation', name: 'Regulación del Estrés' },
      { code: 'bdi-ii', name: 'BDI-II (Inventario de Depresión)' },
    ],
  },
  assiah: {
    name: 'Asiá',
    hebrewName: 'עשיה',
    domain: 'Acción y Cuerpo',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'El mundo de la acción material, donde se manifiestan los hábitos y el cuerpo físico.',
    clinicalFocus: 'Explorar hábitos, rutinas, sueño, alimentación y la relación con el cuerpo físico.',
    suggestedTests: [
      { code: 'insomnia', name: 'Evaluación de Insomnio' },
      { code: 'nutrition', name: 'Hábitos Nutricionales' },
      { code: 'dudit_spirit', name: 'DUDIT (Uso de Sustancias)' },
    ],
  },
};

// Transition explanations between worlds
const TRANSITION_EXPLANATIONS: Record<string, Record<string, string>> = {
  atzilut: {
    beria: 'Cuando la esencia no sostiene el ritmo vital, el siguiente paso es recuperar la comprensión. Antes de sentir, necesitamos entender.',
    yetzirah: 'Desde la esencia fragmentada, a veces el camino directo es reconectar con las emociones que la persona ha desconectado.',
    assiah: 'La esencia necesita anclarse en lo concreto. El cuerpo puede ser el vehículo para reconectar con el propósito.',
  },
  beria: {
    atzilut: 'La comprensión plena invita a explorar niveles más profundos de identidad y propósito vital.',
    yetzirah: 'Cuando hay claridad mental, el siguiente paso es traducir esa comprensión en experiencia emocional concreta.',
    assiah: 'El entendimiento debe materializarse en acción. Es momento de explorar cómo se vive esto en el cuerpo y los hábitos.',
  },
  yetzirah: {
    atzilut: 'Las emociones intensas pueden ser señales de algo más profundo en la identidad esencial.',
    beria: 'Cuando hay mucho movimiento emocional, puede ser útil subir a la comprensión para dar sentido a lo sentido.',
    assiah: 'Las emociones piden encarnarse. Es momento de explorar cómo se manifiestan en el cuerpo y la conducta.',
  },
  assiah: {
    atzilut: 'Los patrones físicos a veces revelan bloqueos en la conexión con el propósito vital.',
    beria: 'Los síntomas corporales invitan a buscar comprensión: ¿qué significan estos patrones?',
    yetzirah: 'El cuerpo expresa lo que no se ha sentido. Es momento de explorar el trasfondo emocional.',
  },
};

interface ExplorationSuggestionModalProps {
  open: boolean;
  onClose: () => void;
  currentWorld?: string | null;
  nextWorld?: string | null;
  atzilutLevel?: string | null;
  rhythmState?: string | null;
  onAssignTest?: (testCode: string) => void;
}

export default function ExplorationSuggestionModal({
  open,
  onClose,
  currentWorld,
  nextWorld,
  atzilutLevel,
  rhythmState,
  onAssignTest,
}: ExplorationSuggestionModalProps) {
  if (!open) return null;

  // Normalize world names
  const normalizeWorld = (world: string | null | undefined): string | null => {
    if (!world) return null;
    const w = world.toLowerCase().trim();
    // Handle variations
    if (w.includes('atzil')) return 'atzilut';
    if (w.includes('beri') || w.includes('beriah')) return 'beria';
    if (w.includes('yetzir') || w.includes('ietzir') || w.includes('yetzirah')) return 'yetzirah';
    if (w.includes('assi') || w.includes('asia') || w.includes('assiah')) return 'assiah';
    return w;
  };

  const fromWorld = normalizeWorld(currentWorld) || 'atzilut';
  const toWorld = normalizeWorld(nextWorld) || 'beria';

  const fromMeta = WORLD_METADATA[fromWorld] || WORLD_METADATA.atzilut;
  const toMeta = WORLD_METADATA[toWorld] || WORLD_METADATA.beria;

  const transitionExplanation =
    TRANSITION_EXPLANATIONS[fromWorld]?.[toWorld] ||
    `La transición de ${fromMeta.name} a ${toMeta.name} permite continuar el proceso de exploración de manera integral.`;

  // Rhythm state labels
  const rhythmStateLabels: Record<string, string> = {
    anchored: 'anclado',
    fluctuating: 'fluctuante',
    fragmented: 'fragmentado',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-200 bg-gradient-to-r from-violet-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Lightbulb className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Sugerencia de Exploración
              </h3>
              <p className="text-sm text-gray-600">
                Guía clínica para la siguiente etapa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* 1. Symbolic Explanation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Lectura Simbólica
            </div>
            <div className={`p-4 rounded-lg border ${fromMeta.bgColor}`}>
              <p className="text-sm text-gray-700 leading-relaxed">
                {rhythmState && (
                  <span>
                    El resultado indica un ritmo esencial <strong>{rhythmStateLabels[rhythmState] || rhythmState}</strong>
                    {atzilutLevel && <> con nivel Atzilut <strong>{atzilutLevel}</strong></>}.{' '}
                  </span>
                )}
                {transitionExplanation}
              </p>
            </div>
          </div>

          {/* 2. Transition Arrow */}
          <div className="flex items-center justify-center gap-4 py-2">
            <div className={`px-4 py-2 rounded-lg border ${fromMeta.bgColor}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Desde</p>
              <p className={`font-semibold ${fromMeta.color}`}>{fromMeta.name}</p>
              <p className="text-xs text-gray-600">{fromMeta.domain}</p>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <div className={`px-4 py-2 rounded-lg border ${toMeta.bgColor}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Hacia</p>
              <p className={`font-semibold ${toMeta.color}`}>{toMeta.name}</p>
              <p className="text-xs text-gray-600">{toMeta.domain}</p>
            </div>
          </div>

          {/* 3. Clinical Translation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Traducción Clínica
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                {toMeta.clinicalFocus}
              </p>
            </div>
          </div>

          {/* 4. Suggested Tests */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <ClipboardList className="w-4 h-4 text-emerald-500" />
              Exploraciones Recomendadas
            </div>
            <div className="space-y-2">
              {toMeta.suggestedTests.map((test) => (
                <div
                  key={test.code}
                  className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:border-emerald-300 transition-colors"
                >
                  <span className="text-sm text-gray-700">{test.name}</span>
                  {onAssignTest && (
                    <button
                      onClick={() => onAssignTest(test.code)}
                      className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors"
                    >
                      Asignar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Ethical Note */}
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-800">
              <strong>Nota:</strong> Esta sugerencia es orientativa y basada en el modelo simbólico cabalístico.
              La decisión final corresponde al criterio profesional del terapeuta.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
