'use client';

import { useMemo, useState } from 'react';
import AstrologyHolisticDisclaimer from '@/components/AstrologyWorkspace/AstrologyHolisticDisclaimer';

type ResearchChart = {
  id: string;
  label: string;
  tags: string[];
  planets: Array<{ name: string; house: number; sign: string }>;
  aspects: Array<{ from: string; to: string; type: string }>;
};

const DATASET: ResearchChart[] = [
  {
    id: 'sim-001',
    label: 'Caso simulado 001',
    tags: ['research', 'simulado'],
    planets: [
      { name: 'Sol', house: 10, sign: 'Capricornio' },
      { name: 'Luna', house: 3, sign: 'Géminis' },
      { name: 'Saturno', house: 6, sign: 'Virgo' },
    ],
    aspects: [
      { from: 'Sol', to: 'Luna', type: 'trino' },
      { from: 'Saturno', to: 'Sol', type: 'trino' },
    ],
  },
  {
    id: 'sim-002',
    label: 'Caso simulado 002',
    tags: ['research', 'simulado'],
    planets: [
      { name: 'Sol', house: 9, sign: 'Sagitario' },
      { name: 'Luna', house: 1, sign: 'Piscis' },
      { name: 'Saturno', house: 7, sign: 'Libra' },
    ],
    aspects: [
      { from: 'Sol', to: 'Saturno', type: 'cuadratura' },
      { from: 'Luna', to: 'Saturno', type: 'trino' },
    ],
  },
];

const PLANET_OPTIONS = ['Sol', 'Luna', 'Mercurio', 'Venus', 'Marte', 'Júpiter', 'Saturno'];
const ASPECT_OPTIONS = ['conjunción', 'oposición', 'trino', 'cuadratura', 'sextil', 'quincuncio'];

export default function ResearchLab() {
  const [planet, setPlanet] = useState<string>('Sol');
  const [house, setHouse] = useState<string>('any');
  const [aspectType, setAspectType] = useState<string>('any');

  const results = useMemo(() => {
    return DATASET.filter((chart) => {
      const hasPlanet = chart.planets.some((p) => p.name === planet && (house === 'any' || String(p.house) === house));
      const hasAspect = aspectType === 'any' ? true : chart.aspects.some((a) => a.type === aspectType);
      return hasPlanet && hasAspect;
    });
  }, [planet, house, aspectType]);

  const frequencyByHouse = useMemo(() => {
    const freq: Record<string, number> = {};
    results.forEach((chart) => {
      chart.planets.forEach((p) => {
        const key = String(p.house);
        freq[key] = (freq[key] || 0) + 1;
      });
    });
    return freq;
  }, [results]);

  return (
    <section className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-wide text-gray-500">Research Lab (básico, no médico)</p>
        <h2 className="text-xl font-semibold text-gray-900">Búsqueda de patrones en casos simulados</h2>
        <p className="text-xs text-gray-600 mt-1">
          Dataset simulado marcado como "research". No usa consultantes reales. No hay inferencia ni predicción.
        </p>
      </header>
      <AstrologyHolisticDisclaimer />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-sm font-semibold text-gray-900 mb-2">Planeta en casa</p>
          <select
            value={planet}
            onChange={(e) => setPlanet(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {PLANET_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={house}
            onChange={(e) => setHouse(e.target.value)}
            className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="any">Cualquier casa</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                Casa {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-sm font-semibold text-gray-900 mb-2">Aspecto presente</p>
          <select
            value={aspectType}
            onChange={(e) => setAspectType(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="any">Cualquiera</option>
            {ASPECT_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">Filtro opcional; no recalcula datos.</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-sm font-semibold text-gray-900">Resumen</p>
          <p className="text-xs text-gray-700 mt-1">Resultados: {results.length} / {DATASET.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Exploratorio; sin conclusiones.</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <p className="text-sm font-semibold text-gray-900 mb-2">Resultados</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.map((chart) => (
            <div key={chart.id} className="border border-gray-200 rounded-md p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">{chart.label}</p>
                <span className="text-[11px] text-gray-500">Tags: {chart.tags.join(', ')}</span>
              </div>
              <div className="mt-2 text-xs text-gray-700">
                <p className="font-semibold text-gray-900">Planetas</p>
                <ul className="list-disc pl-4 space-y-1">
                  {chart.planets.map((p) => (
                    <li key={`${chart.id}-${p.name}-${p.house}`}>
                      {p.name}: Casa {p.house} · {p.sign}
                    </li>
                  ))}
                </ul>
                <p className="font-semibold text-gray-900 mt-2">Aspectos</p>
                <ul className="list-disc pl-4 space-y-1">
                  {chart.aspects.map((a, idx) => (
                    <li key={`${chart.id}-asp-${idx}`}>
                      {a.from} – {a.to} ({a.type})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {results.length === 0 && <p className="text-sm text-gray-600">Sin coincidencias con los filtros actuales.</p>}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <p className="text-sm font-semibold text-gray-900 mb-2">Frecuencia por casa (dataset filtrado)</p>
        <div className="grid grid-cols-6 gap-2 text-xs text-gray-800">
          {Array.from({ length: 12 }, (_, i) => {
            const n = i + 1;
            const v = frequencyByHouse[String(n)] || 0;
            return (
              <div key={n} className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-center">
                <p className="font-semibold">Casa {n}</p>
                <p className="text-gray-700">{v}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
