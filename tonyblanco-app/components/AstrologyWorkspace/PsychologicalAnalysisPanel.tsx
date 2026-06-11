/**
 * @deprecated Componente huérfano — no tiene imports activos en el workspace.
 * La interpretación psicológica vive en `PsychologicalHoroscopeAdvanced` dentro de
 * `AstrologyProfessionalView`. Mantener solo como referencia hasta integración o eliminación.
 */
"use client";

import React, { useMemo, useState } from 'react';
import type { MultiTechAnalysisResult, NatalChartPayload } from '@/hooks/useNatalChart';
import dynamic from 'next/dynamic';
import type { ActiveConsultante } from '@/hooks/useActiveConsultante';

const AstrologyPsychologicalReport = dynamic(() => import('./AstrologyPsychologicalReport'));

interface Props {
  natal: NatalChartPayload;
  analysis_result?: MultiTechAnalysisResult | null;
  consultante: ActiveConsultante;
}

export default function PsychologicalAnalysisPanel({ natal, analysis_result, consultante }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showReport, setShowReport] = useState(false);

  // Tests and patient storage are out-of-scope for this module; the module is read-only and identity must come via `consultante`.
  const tests: any[] = [];

  // Simple archetype mapping (symbolic only)
  const archetypes = useMemo(() => {
    const map: Record<string, string> = {};
    (natal.planetas || []).forEach((p: any) => {
      const name = String(p.nombre).toLowerCase();
      if (name === 'saturn') map['Saturno'] = 'Límites, sombra, estructura del yo';
      if (name === 'mars') map['Marte'] = 'Impulso, afirmación, energía creadora';
      if (name === 'venus') map['Venus'] = 'Valores, vínculos, autoestima';
      if (name === 'jupiter') map['Júpiter'] = 'Expansión, búsqueda de sentido';
      if (name === 'moon') map['Luna'] = 'Vida emocional y procesos inconscientes';
      if (name === 'sun') map['Sol'] = 'Núcleo del yo y voluntad consciente';
    });
    return map;
  }, [natal.planetas]);

  // Build conflicts from major hard aspects
  const conflicts = useMemo(() => {
    const list: Array<{ t: string; a: any }> = [];
    (natal.aspectos || []).forEach((a: any) => {
      const tipo = String(a.tipo).toLowerCase();
      if (['square', 'opposition', 'conjunction'].includes(tipo)) {
        list.push({ t: tipo, a });
      }
    });
    return list;
  }, [natal.aspectos]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Análisis Psicológico del Horóscopo</h3>
          <p className="text-xs text-gray-600">Astrología Psicológica · Enfoque Junguiano — lectura simbólica (solo lectura)</p>
        </div>
        <div className="text-xs text-gray-500">{consultante.nombre_completo}</div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-100 rounded p-3 text-xs text-gray-700">
          Lectura simbólica basada en astrología psicológica. No constituye diagnóstico ni evaluación clínica.
        </div>

        {/* 1. Mapa Psicológico General */}
        <div>
          <button className="w-full text-left" onClick={() => setExpanded((s) => ({ ...s, map: !s.map }))}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Mapa Psicológico General</div>
              <div className="text-xs text-gray-500">Sol · Luna · Ascendente</div>
            </div>
          </button>
          {expanded.map && (
            <div className="mt-2 text-sm text-gray-700">
              <p><strong>Sol:</strong> {(() => {
                const s = (natal.planetas || []).find((p: any) => String(p.nombre).toLowerCase() === 'sun');
                return s ? `Núcleo del yo consciente — en ${s.signo} a ${s.grados?.toFixed?.(2) ?? s.longitud_ecliptica}°` : '-';
              })()}</p>

              <p className="mt-1"><strong>Luna:</strong> {(() => {
                const m = (natal.planetas || []).find((p: any) => String(p.nombre).toLowerCase() === 'moon');
                return m ? `Vida emocional e inconsciente — en ${m.signo} a ${m.grados?.toFixed?.(2) ?? m.longitud_ecliptica}°` : '-';
              })()}</p>

              <p className="mt-1"><strong>Ascendente:</strong> {(() => {
                const asc = (natal.casas || []).find((c: any) => Number(c.numero) === 1);
                return asc ? `${asc.signo || '-'} cúspide ${((asc.cuspide_grados ?? asc.cuspide_longitud) || '-') }°` : '-';
              })()}</p>

              <p className="mt-2 text-sm text-gray-600">Lenguaje descriptivo y orientado al proceso — sin juicios ni diagnósticos.</p>
            </div>
          )}
        </div>

        {/* 2. Arquetipos Dominantes */}
        <div>
          <button className="w-full text-left" onClick={() => setExpanded((s) => ({ ...s, arche: !s.arche }))}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Arquetipos Dominantes (Planetas)</div>
              <div className="text-xs text-gray-500">Mapeo simbólico</div>
            </div>
          </button>
          {expanded.arche && (
            <div className="mt-2 text-sm text-gray-700 space-y-2">
              {Object.keys(archetypes).length === 0 ? (
                <div className="text-xs text-gray-500">No se encontraron planetas principales en los datos.</div>
              ) : (
                Object.entries(archetypes).map(([k, v]) => (
                  <div key={k}>
                    <div className="font-medium">{k}</div>
                    <div className="text-xs text-gray-600">{v}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 3. Dinámica de Conflictos Internos */}
        <div>
          <button className="w-full text-left" onClick={() => setExpanded((s) => ({ ...s, conflicts: !s.conflicts }))}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Dinámica de Conflictos Internos</div>
              <div className="text-xs text-gray-500">Aspectos tensos (oposiciones, cuadraturas)</div>
            </div>
          </button>
          {expanded.conflicts && (
            <div className="mt-2 text-sm text-gray-700 space-y-2">
              {conflicts.length === 0 ? (
                <div className="text-xs text-gray-500">No se detectaron aspectos tensos relevantes en los datos.</div>
              ) : conflicts.map((c, i) => (
                <div key={i} className="border-l-2 pl-3">
                  <div className="font-medium">{String(c.a.planeta1)} — {String(c.a.planeta2)} ({String(c.t)})</div>
                  <div className="text-xs text-gray-600">Interpretación simbólica: esta configuración puede indicar polaridades internas que piden integración consciente.</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Individuación y Potencial Creativo */}
        <div>
          <button className="w-full text-left" onClick={() => setExpanded((s) => ({ ...s, individ: !s.individ }))}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Individuación y Potencial Creativo</div>
              <div className="text-xs text-gray-500">Integración consciente y recursos</div>
            </div>
          </button>
          {expanded.individ && (
            <div className="mt-2 text-sm text-gray-700">
              <p>Casas angulares y regentes: {(() => {
                const angular = (natal.casas || []).filter((c: any) => [1,4,7,10].includes(Number(c.numero))).map((c: any) => `${c.numero}:${c.signo}`).join(', ');
                return angular || '-';
              })()}</p>

              <p className="mt-1 text-xs text-gray-600">Orientado a procesos de integración y cultivo del potencial creativo.</p>
            </div>
          )}
        </div>

        {/* Cross with psychological tests if available */}
        <div>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Cruce Astrología–Psicología</div>
            <div className="text-xs text-gray-500">Correlaciones simbólicas (si hay tests)</div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-500">No hay resultados de tests disponibles.</div>
          </div>
        </div>
        
        {/* Report generator toggle */}
        <div className="mt-4">
          <button
            onClick={() => setShowReport((s) => !s)}
            className="px-3 py-2 bg-indigo-600 text-white rounded text-sm"
          >
            {showReport ? 'Ocultar Informe Psicológico' : 'Generar Informe Psicológico (vista)'}
          </button>
        </div>

        {showReport && (
          <div className="mt-4">
            <AstrologyPsychologicalReport
              chart={natal}
              analysis_result={analysis_result}
              consultante={{ id: consultante.id, nombre_completo: consultante.nombre_completo, fecha_nacimiento: consultante.fecha_nacimiento }}
              patientId={consultante.id}
            />
          </div>
        )}

        {/* Placeholders for advanced topics (locked) */}
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
          {['Los Siete Pecados', 'Relaciones', 'Niños', 'Carrera y Vocación'].map((label) => (
            <div key={label} className="p-2 border rounded bg-gray-50 text-xs text-gray-600">
              <div className="font-medium">{label}</div>
              <div className="text-xs">Disponible próximamente — Análisis psicológico avanzado</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
