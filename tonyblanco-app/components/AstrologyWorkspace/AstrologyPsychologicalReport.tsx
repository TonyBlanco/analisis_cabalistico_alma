"use client";

import React, { useMemo } from 'react';
import type { NatalChartPayload, MultiTechAnalysisResult } from '@/hooks/useNatalChart';
import type { ActiveConsultante } from '@/hooks/useActiveConsultante';

interface Props {
  chart: NatalChartPayload;
  analysis_result?: MultiTechAnalysisResult | null;
  consultante: Pick<ActiveConsultante, 'id' | 'nombre_completo' | 'fecha_nacimiento'>;
  patientId?: string;
}

const SIGN_ELEMENT: Record<string, string> = {
  aries: 'Fuego', leo: 'Fuego', sagittarius: 'Fuego',
  taurus: 'Tierra', virgo: 'Tierra', capricorn: 'Tierra',
  gemini: 'Aire', libra: 'Aire', aquarius: 'Aire',
  cancer: 'Agua', scorpio: 'Agua', pisces: 'Agua',
};

function normalizeSign(s?: string) {
  if (!s) return '';
  return String(s).toLowerCase().slice(0,3) === 'cap' ? 'capricorn' : String(s).toLowerCase().replace(/[^a-z]/g, '').slice(0,3) === 'sag' ? 'sagittarius' : String(s).toLowerCase();
}

function summarizeElements(planets: any[]) {
  const counts: Record<string, number> = { Fuego:0, Tierra:0, Aire:0, Agua:0 };
  planets.forEach((p) => {
    const sign = String(p.signo || p.sign || '').toLowerCase();
    const key = Object.keys(SIGN_ELEMENT).find(k => sign.includes(k)) || Object.keys(SIGN_ELEMENT).find(k => sign.startsWith(k.slice(0,3)));
    const el = key ? SIGN_ELEMENT[key] : null;
    if (el) counts[el]++;
  });
  return counts;
}

function dominantPlanets(planets: any[], aspectos: any[]) {
  const score: Record<string, number> = {};
  planets.forEach((p) => { score[String(p.nombre).toLowerCase()] = (score[String(p.nombre).toLowerCase()] || 0) + 1; });
  aspectos.forEach((a) => {
    const t = String(a.tipo || '').toLowerCase();
    const w = t === 'conjunction' ? 3 : t === 'trine' ? 2 : t === 'sextile' ? 1 : t === 'square' ? 2 : t === 'opposition' ? 2 : 1;
    score[String(a.planeta1).toLowerCase()] = (score[String(a.planeta1).toLowerCase()] || 0) + w;
    score[String(a.planeta2).toLowerCase()] = (score[String(a.planeta2).toLowerCase()] || 0) + w;
  });
  return Object.entries(score).sort((a,b) => b[1]-a[1]).slice(0,4).map(([k]) => k);
}

export default function AstrologyPsychologicalReport({ chart, analysis_result, consultante, patientId }: Props) {
  const planets = chart.planetas || [];
  const aspectos = chart.aspectos || [];

  const elements = useMemo(() => summarizeElements(planets), [planets]);
  const dominant = useMemo(() => dominantPlanets(planets, aspectos), [planets, aspectos]);
  const housesCount = useMemo(() => {
    const c: Record<number, number> = {};
    (chart.casas || []).forEach((h: any) => { c[Number(h.numero)] = 0; });
    planets.forEach((p:any) => { c[Number(p.casa)] = (c[Number(p.casa)]||0)+1; });
    return c;
  }, [chart, planets]);

  const angularHouses = useMemo(() => {
    try {
      return Object.entries(housesCount).filter(([k, v]) => Number(v) > 0).map(([k]) => k).join(', ') || '-';
    } catch {
      return '-';
    }
  }, [housesCount]);

  const tests: any[] = [];

  // simple conflict extraction
  const conflicts = (aspectos || []).filter((a:any) => ['square','opposition','conjunction'].includes(String(a.tipo).toLowerCase()));
  const harmonies = (aspectos || []).filter((a:any) => ['trine','sextile'].includes(String(a.tipo).toLowerCase()));

  // Narrative builders (concise, symbolic, non-clinical)
  const generalNarrative = () => {
    const parts: string[] = [];
    let birthLabel = '';
    try {
      const d = consultante && consultante.fecha_nacimiento ? new Date(consultante.fecha_nacimiento) : null;
      birthLabel = d && !isNaN(d.getTime()) ? ` (nacido/a ${d.toLocaleDateString('es-ES')})` : '';
    } catch { birthLabel = ''; }
    parts.push(`Informe para ${consultante.nombre_completo}${birthLabel}.`);
    parts.push(`Dominantes planetarios: ${dominant.map(d => d.charAt(0).toUpperCase()+d.slice(1)).join(', ')}.`);
    parts.push(`Énfasis por elementos: Fuego ${elements.Fuego}, Tierra ${elements.Tierra}, Aire ${elements.Aire}, Agua ${elements.Agua}.`);
    return parts.join(' ');
  };

  const solarLunarAsc = () => {
    const sol = planets.find((p:any)=>String(p.nombre).toLowerCase()==='sun');
    const moon = planets.find((p:any)=>String(p.nombre).toLowerCase()==='moon');
    const ascHouse = (chart.casas || []).find((c:any)=>Number(c.numero)===1);
    return {
      sol, moon, asc: ascHouse,
    };
  };

  return (
    <article className="prose max-w-none p-6 bg-white border border-gray-200 rounded-lg">
      <div className="mb-4">
        <div className="text-xs text-gray-600">*Este informe es una lectura simbólica basada en astrología psicológica y psicología profunda de inspiración junguiana. No constituye diagnóstico médico ni evaluación clínica. Su finalidad es orientativa y reflexiva.*</div>
      </div>

      <h2 className="text-lg font-semibold">Visión Psicológica General</h2>
      <p>{generalNarrative()}</p>
      <p>La carta describe un campo de energías simbólicas: algunos planetas actúan como imágenes arquetípicas que señalan temas recurrentes en la vida de la persona y oportunidades para la conciencia y el trabajo interior.</p>

      <h3 className="mt-4">Eje Solar — Lunar — Ascendente</h3>
      <div>
        {(() => {
          const { sol, moon, asc } = solarLunarAsc();
          return (
            <div>
              <h4 className="font-medium">Sol — Identidad consciente</h4>
              <p>{sol ? `El Sol en ${sol.signo} a ${ (typeof sol.grados === 'number' ? sol.grados.toFixed(2) : sol.longitud_ecliptica) }° habla de la energía vital que busca expresión consciente.` : 'Sol no disponible.'}</p>

              <h4 className="font-medium mt-2">Luna — Mundo emocional</h4>
              <p>{moon ? `La Luna en ${moon.signo} describe modos de sensibilidad y necesidades emocionales profundas.` : 'Luna no disponible.'}</p>

              <h4 className="font-medium mt-2">Ascendente — Máscara / adaptación</h4>
              <p>{asc ? `${asc.signo || '-'} cúspide ${asc.cuspide_grados ?? asc.cuspide_longitud}° indica la forma en que la persona se presenta y reconoce energías de ajuste en la vida cotidiana.` : 'Ascendente no disponible.'}</p>
            </div>
          );
        })()}
      </div>

      <h3 className="mt-4">Arquetipos Dominantes</h3>
      <p>Los siguientes planetas aparecen con peso simbólico destacado: {dominant.map(d => d.charAt(0).toUpperCase()+d.slice(1)).join(', ')}. Cada uno funciona como imagen arquetípica con una tonalidad psicológica particular (límites, impulso, valores, expansión).</p>

      <h3 className="mt-4">Conflictos Psicológicos Internos</h3>
      {conflicts.length === 0 ? (
        <p>No se detectan configuraciones tensas prominentes; el material puede estar disponible para integración en procesos conscientes.</p>
      ) : (
        conflicts.map((c:any, i:number) => (
          <div key={i} className="mb-2">
            <p className="font-medium">{String(c.planeta1)} — {String(c.planeta2)} ({String(c.tipo)})</p>
            <p className="text-sm text-gray-700">Interpretación simbólica: esta polaridad sugiere una tensión que, si se trae a la atención consciente, puede ofrecer una vía de crecimiento y diferenciación del yo.</p>
          </div>
        ))
      )}

      <h3 className="mt-4">Individuación y Potencial Creativo</h3>
      <p>Se identifican {harmonies.length} aspectos armónicos que funcionan como recursos internos potenciales. Casas angulares con presencia planetaria: {angularHouses}.</p>

      <h3 className="mt-4">Cruce Astrología–Psicología</h3>
      {tests.length === 0 ? (
        <p>Este apartado se ampliará cuando existan instrumentos psicológicos compatibles.</p>
      ) : (
        <div className="space-y-2">
          {tests.map((t:any) => (
            <div key={t.id} className="p-2 border rounded bg-gray-50">
              <div className="font-medium">{t.name || t.id} — {new Date(t.timestamp || t.date || Date.now()).toLocaleDateString('es-ES')}</div>
              <div className="text-sm text-gray-700">Correlación simbólica sugerida: {String(t.id).toLowerCase().includes('bai')||String(t.id).toLowerCase().includes('gad') ? 'temas ligados a la Luna / Casa IV (seguridad emocional).' : 'No hay correlación simbólica automática.'}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">Informe generado por el sistema — lectura simbólica profesional (no clínica).</div>
    </article>
  );
}
