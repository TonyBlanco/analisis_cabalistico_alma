'use client';

import { useMemo, useState } from 'react';
import AstrologyHolisticDisclaimer from '@/components/AstrologyWorkspace/AstrologyHolisticDisclaimer';

type SimplePlanet = { name: string; sign?: string; house?: number; degree?: number };
type SimpleAspect = { from: string; to: string; type: string; orb?: number };
type SimpleChart = {
  label: string;
  planets?: SimplePlanet[];
  houses?: Array<{ num: number; sign?: string }>;
  aspects?: SimpleAspect[];
  meta?: Record<string, string>;
};

const SAMPLE_CHART_A: SimpleChart = {
  label: 'Natal A (simulado)',
  planets: [
    { name: 'Sol', sign: 'Capricornio', house: 10, degree: 279.7 },
    { name: 'Luna', sign: 'Géminis', house: 3, degree: 83.1 },
    { name: 'Saturno', sign: 'Virgo', house: 6, degree: 176.9 },
  ],
  houses: Array.from({ length: 12 }, (_, i) => ({ num: i + 1, sign: ['Cap', 'Acu', 'Pis', 'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario'][i] })),
  aspects: [
    { from: 'Sol', to: 'Luna', type: 'trino', orb: 3.5 },
    { from: 'Sol', to: 'Saturno', type: 'trino', orb: 2.2 },
  ],
  meta: { house_system: 'P', zodiac: 'Tropical' },
};

const SAMPLE_CHART_B: SimpleChart = {
  label: 'Natal B (simulado)',
  planets: [
    { name: 'Sol', sign: 'Capricornio', house: 9, degree: 280.2 },
    { name: 'Luna', sign: 'Tauro', house: 2, degree: 50.4 },
    { name: 'Saturno', sign: 'Libra', house: 7, degree: 200.1 },
  ],
  houses: Array.from({ length: 12 }, (_, i) => ({ num: i + 1, sign: ['Sag', 'Cap', 'Acu', 'Pis', 'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio'][i] })),
  aspects: [
    { from: 'Sol', to: 'Luna', type: 'cuadratura', orb: 0.8 },
    { from: 'Saturno', to: 'Luna', type: 'trino', orb: 1.9 },
  ],
  meta: { house_system: 'P', zodiac: 'Tropical' },
};

function parseChart(json: string, fallback: SimpleChart): SimpleChart {
  try {
    const data = JSON.parse(json);
    return { ...fallback, ...data };
  } catch {
    return fallback;
  }
}

export default function Comparator() {
  const [chartAInput, setChartAInput] = useState(JSON.stringify(SAMPLE_CHART_A, null, 2));
  const [chartBInput, setChartBInput] = useState(JSON.stringify(SAMPLE_CHART_B, null, 2));
  const [highlightDiffs, setHighlightDiffs] = useState(true);

  const chartA = useMemo(() => parseChart(chartAInput, SAMPLE_CHART_A), [chartAInput]);
  const chartB = useMemo(() => parseChart(chartBInput, SAMPLE_CHART_B), [chartBInput]);

  const planetComparisons = useMemo(() => {
    const rows: Array<{ name: string; a?: string; b?: string; diff?: string }> = [];
    const names = new Set<string>();
    (chartA.planets || []).forEach((p) => names.add(p.name));
    (chartB.planets || []).forEach((p) => names.add(p.name));
    names.forEach((name) => {
      const pa = (chartA.planets || []).find((p) => p.name === name);
      const pb = (chartB.planets || []).find((p) => p.name === name);
      const aStr = pa ? `${pa.sign || '-'} · Casa ${pa.house ?? '-'}` : '—';
      const bStr = pb ? `${pb.sign || '-'} · Casa ${pb.house ?? '-'}` : '—';
      const diff =
        pa && pb
          ? pa.sign !== pb.sign || pa.house !== pb.house
            ? 'Cambio'
            : 'Igual'
          : 'Ausente';
      rows.push({ name, a: aStr, b: bStr, diff });
    });
    return rows;
  }, [chartA.planets, chartB.planets]);

  const houseComparisons = useMemo(() => {
    return Array.from({ length: 12 }, (_, idx) => {
      const num = idx + 1;
      const ha = (chartA.houses || []).find((h) => h.num === num);
      const hb = (chartB.houses || []).find((h) => h.num === num);
      const diff = ha?.sign !== hb?.sign ? 'Cambio' : 'Igual';
      return { num, a: ha?.sign || '—', b: hb?.sign || '—', diff };
    });
  }, [chartA.houses, chartB.houses]);

  const aspectComparisons = useMemo(() => {
    const key = (a: SimpleAspect) => `${a.from}-${a.to}-${a.type}`;
    const mapA = new Map((chartA.aspects || []).map((a) => [key(a), a]));
    const mapB = new Map((chartB.aspects || []).map((a) => [key(a), a]));
    const keys = new Set<string>([...mapA.keys(), ...mapB.keys()]);
    return Array.from(keys).map((k) => {
      const a = mapA.get(k);
      const b = mapB.get(k);
      const status = a && b ? 'Ambas' : a ? 'Solo A' : 'Solo B';
      return { aspect: k, a: a ? a.orb?.toFixed(2) ?? '-' : '—', b: b ? b.orb?.toFixed(2) ?? '-' : '—', status };
    });
  }, [chartA.aspects, chartB.aspects]);

  return (
    <section className="space-y-4">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Comparador profesional</p>
          <h2 className="text-xl font-semibold text-gray-900">Carta A vs Carta B (solo visual)</h2>
          <p className="text-xs text-gray-600 mt-1">Sin recálculo. Todo se basa en datos ya obtenidos o pegados como JSON.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={highlightDiffs} onChange={() => setHighlightDiffs((v) => !v)} />
          Resaltar diferencias
        </label>
      </header>
      <AstrologyHolisticDisclaimer />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[{ label: 'Carta A', value: chartAInput, setValue: setChartAInput }, { label: 'Carta B', value: chartBInput, setValue: setChartBInput }].map((c) => (
          <div key={c.label} className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">{c.label}</p>
              <button
                type="button"
                onClick={() => c.setValue(c.label === 'Carta A' ? JSON.stringify(SAMPLE_CHART_A, null, 2) : JSON.stringify(SAMPLE_CHART_B, null, 2))}
                className="text-xs text-blue-700 underline"
              >
                Cargar sample
              </button>
            </div>
            <textarea
              className="w-full min-h-[200px] rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono"
              value={c.value}
              onChange={(e) => c.setValue(e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="px-3 py-2 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Planetas</p>
          </div>
          <div className="divide-y divide-gray-100">
            {planetComparisons.map((row) => (
              <div key={row.name} className={`px-3 py-2 text-sm ${highlightDiffs && row.diff === 'Cambio' ? 'bg-amber-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{row.name}</span>
                  <span className="text-xs text-gray-500">{row.diff}</span>
                </div>
                <div className="text-xs text-gray-700 mt-1">A: {row.a}</div>
                <div className="text-xs text-gray-700">B: {row.b}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="px-3 py-2 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Casas</p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            {houseComparisons.map((row) => (
              <div key={row.num} className={`px-3 py-2 text-sm ${highlightDiffs && row.diff === 'Cambio' ? 'bg-amber-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Casa {row.num}</span>
                  <span className="text-xs text-gray-500">{row.diff}</span>
                </div>
                <div className="text-xs text-gray-700">A: {row.a}</div>
                <div className="text-xs text-gray-700">B: {row.b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="px-3 py-2 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-900">Aspectos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {aspectComparisons.map((row) => (
            <div key={row.aspect} className={`px-3 py-2 text-sm ${highlightDiffs && row.status !== 'Ambas' ? 'bg-amber-50' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{row.aspect}</span>
                <span className="text-xs text-gray-500">{row.status}</span>
              </div>
              <div className="text-xs text-gray-700">A: {row.a}</div>
              <div className="text-xs text-gray-700">B: {row.b}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
