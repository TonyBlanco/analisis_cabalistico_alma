'use client';

import type { WorkspaceState } from './types';

interface ExperientialToolPanelsProps {
  state: WorkspaceState;
  hasPatient: boolean;
}

export default function ExperientialToolPanels({ state, hasPatient }: ExperientialToolPanelsProps) {
  return (
    <aside className="w-80 flex flex-col gap-4">
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

      {state === 'observation' && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900">Observaciones inmediatas</h4>
            <p className="text-xs text-gray-600">
              Captura notas humanas sobre sensaciones, lenguaje corporal y foco de atencion.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900">Referencias simbolicas</h4>
            <p className="text-xs text-gray-600">
              Cruza cuerpo vivido, arbol y diccionario en modo consultivo.
            </p>
          </div>
        </>
      )}

      {state === 'analysis' && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900">Hipotesis abiertas</h4>
            <p className="text-xs text-gray-600">
              Hipotesis no diagnosticas. Se ajustan manualmente por el terapeuta.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900">Linea transgeneracional</h4>
            <p className="text-xs text-gray-600">
              Observaciones sobre linaje, patrones y referencias heredadas.
            </p>
          </div>
        </>
      )}

      {state === 'synthesis' && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900">Sintesis terapeutica</h4>
            <p className="text-xs text-gray-600">
              Integracion narrativa y simbolica en notas humanas.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900">Puertas de trabajo futuro</h4>
            <p className="text-xs text-gray-600">
              Espacio reservado para modulos futuros (meditacion, sonido, aromas).
            </p>
          </div>
        </>
      )}

      {state === 'closure' && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900">Cierre consciente</h4>
            <p className="text-xs text-gray-600">
              Registro final de la sesion sin conclusiones automaticas.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900">Checklist humano</h4>
            <p className="text-xs text-gray-600">
              Confirmar que las notas son completas y auditables.
            </p>
          </div>
        </>
      )}
    </aside>
  );
}
