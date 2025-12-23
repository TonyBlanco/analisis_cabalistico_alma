'use client';

import DictionaryPanel from './DictionaryPanel';
import ObservationPanel from './ObservationPanel';
import HypothesisPanel from './HypothesisPanel';
import type { WorkspaceState } from './types';
import type { AnatomicalRegion } from './data/anatomicalRegions';

interface ExperientialToolPanelsProps {
  state: WorkspaceState;
  hasPatient: boolean;
  selectedRegion: AnatomicalRegion | null;
}

export default function ExperientialToolPanels({ state, hasPatient, selectedRegion }: ExperientialToolPanelsProps) {
  return (
    <aside className="w-full flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900">Panel consultivo</h4>
        <p className="text-xs text-gray-600">
          Sin automatizacion ni diagnostico. Todo registro es humano y editable.
        </p>
      </div>

      {!hasPatient && (
        <div className="bg-white border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
          No hay paciente activo. Este workspace necesita contexto de paciente para operar.
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,65%)_minmax(0,35%)] gap-4 items-start">
        {state === 'observation' && (
          <>
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Observaciones inmediatas</h4>
                <p className="text-xs text-gray-600">
                  Captura notas humanas sobre sensaciones, lenguaje corporal y foco de atencion.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Referencias simbolicas</h4>
                <p className="text-xs text-gray-600">
                  Cruza cuerpo vivido, arbol y diccionario en modo consultivo.
                </p>
              </div>
            </div>
          </>
        )}

        {state === 'analysis' && (
          <>
            <div className="space-y-4">
              <ObservationPanel selectedRegion={selectedRegion} />
              <HypothesisPanel selectedRegion={selectedRegion} />
            </div>
            <div className="space-y-4">
              {/* Dictionary Panel - Phase 2 Integration */}
              <DictionaryPanel selectedRegion={selectedRegion} />
            </div>
          </>
        )}

        {state === 'synthesis' && (
          <>
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Sintesis terapeutica</h4>
                <p className="text-xs text-gray-600">
                  Integracion narrativa y simbolica en notas humanas.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Puertas de trabajo futuro</h4>
                <p className="text-xs text-gray-600">
                  Espacio reservado para modulos futuros (meditacion, sonido, aromas).
                </p>
              </div>
            </div>
          </>
        )}

        {state === 'closure' && (
          <>
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Cierre consciente</h4>
                <p className="text-xs text-gray-600">
                  Registro final de la sesion sin conclusiones automaticas.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">Checklist humano</h4>
                <p className="text-xs text-gray-600">
                  Confirmar que las notas son completas y auditables.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
