'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAstrologyMode } from '@/components/AstrologyMode/AstrologyModeContext';
import { computeSandboxScores, SandboxScore } from './sandboxScoring';
import { exportCSV, exportTXT, buildConfigAuditLines, buildScoresRows } from './exportUtils';
import HelpButton from './HelpButton';
import { logEvent } from './eventLogger';
import AstrologyHolisticDisclaimer from '@/components/AstrologyWorkspace/AstrologyHolisticDisclaimer';

type SandboxChart = {
  id: string;
  label: string;
  dataset: 'simulated' | 'research';
  aspects: Array<{ from: string; to: string; type: string; orb?: number }>;
  planets: Array<{ name: string; house: number; element?: string; modality?: string }>;
  meta: {
    houseSystem: string;
    zodiac: string;
    engine: string;
    version: string;
    ephemeris?: string;
  };
};

const SAMPLE_CHARTS: SandboxChart[] = [
  {
    id: 'sim-sb-001',
    label: 'Sandbox simulado 001',
    dataset: 'simulated',
    aspects: [
      { from: 'Sol', to: 'Luna', type: 'trine', orb: 3.2 },
      { from: 'Sol', to: 'Saturno', type: 'square', orb: 2.0 },
      { from: 'Venus', to: 'Marte', type: 'sextile', orb: 1.1 },
    ],
    planets: [
      { name: 'Sol', house: 10, element: 'earth', modality: 'cardinal' },
      { name: 'Luna', house: 3, element: 'air', modality: 'mutable' },
      { name: 'Saturno', house: 6, element: 'earth', modality: 'mutable' },
      { name: 'Venus', house: 1, element: 'air', modality: 'cardinal' },
      { name: 'Marte', house: 7, element: 'fire', modality: 'cardinal' },
    ],
    meta: { houseSystem: 'P', zodiac: 'tropical', engine: 'kerykeion/swisseph', version: '1.x', ephemeris: 'local (dev)' },
  },
  {
    id: 'res-sb-002',
    label: 'Research snapshot 002',
    dataset: 'research',
    aspects: [
      { from: 'Sol', to: 'Saturno', type: 'opposition', orb: 0.9 },
      { from: 'Luna', to: 'Mercurio', type: 'sextile', orb: 1.7 },
    ],
    planets: [
      { name: 'Sol', house: 9, element: 'fire', modality: 'mutable' },
      { name: 'Luna', house: 1, element: 'water', modality: 'mutable' },
      { name: 'Mercurio', house: 1, element: 'water', modality: 'mutable' },
      { name: 'Saturno', house: 7, element: 'air', modality: 'cardinal' },
      { name: 'Júpiter', house: 11, element: 'air', modality: 'fixed' },
    ],
    meta: { houseSystem: 'W', zodiac: 'tropical', engine: 'kerykeion/swisseph', version: '1.x', ephemeris: 'local (research)' },
  },
];

function ScoresList({ scores }: { scores: SandboxScore[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {scores.map((s) => (
        <div key={s.id} className="rounded-md border border-gray-200 bg-white p-3 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">{s.name}</p>
            <span className="text-xs text-gray-500">{s.value}</span>
          </div>
          <p className="text-xs text-gray-700">Variables: {s.variablesUsed.join(', ')}</p>
          <p className="text-[11px] text-gray-600">Fórmula: {s.formulaText}</p>
          <p className="text-[11px] text-amber-700">Límite: {s.limitationsText}</p>
        </div>
      ))}
    </div>
  );
}

export default function SandboxPanel() {
  const { mode } = useAstrologyMode();
  const [selectedId, setSelectedId] = useState<string>(SAMPLE_CHARTS[0].id);
  const selectedChart = useMemo(() => SAMPLE_CHARTS.find((c) => c.id === selectedId) || SAMPLE_CHARTS[0], [selectedId]);
  const scores = useMemo(() => computeSandboxScores(selectedChart.aspects, selectedChart.planets), [selectedChart]);

  const sandboxUnavailable = mode === 'SANDBOX' && selectedChart.dataset !== 'simulated';

  useEffect(() => {
    if (mode === 'SANDBOX' && !sandboxUnavailable) {
      logEvent('SANDBOX_SCORE_VIEW', { chartId: selectedChart.id, dataset: selectedChart.dataset });
    }
  }, [mode, sandboxUnavailable, selectedChart.id, selectedChart.dataset]);

  const handleExportCSV = () => {
    exportCSV(`sandbox-${selectedChart.id}.csv`, buildScoresRows(scores));
  };

  const handleExportTXT = () => {
    const lines = [
      'Sandbox (simulado) - Scores didácticos',
      ...buildConfigAuditLines({
        chart: selectedChart.label,
        dataset: selectedChart.dataset,
        house_system: selectedChart.meta.houseSystem,
        zodiac: selectedChart.meta.zodiac,
        engine: selectedChart.meta.engine,
        version: selectedChart.meta.version,
        ephemeris: selectedChart.meta.ephemeris,
      }),
      '',
      'Scores:',
      ...scores.map((s) => `${s.name}: ${s.value} | ${s.formulaText}`),
      '',
      'Disclaimer: Simulación educativa. No predicción real. Sin datos médicos.',
    ];
    exportTXT(`sandbox-${selectedChart.id}.txt`, lines);
  };

  return (
    <section className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Sandbox predictivo (simulado)</p>
          <h2 className="text-xl font-semibold text-gray-900">Scores didácticos y export (frontend)</h2>
          <p className="text-xs text-gray-600 mt-1">
            Solo dataset simulado/research. Scoring explicable, sin persistencia, sin endpoints.
          </p>
        </div>
        <HelpButton contentId="sandbox" label="¿Qué es Sandbox?" />
      </header>
      <AstrologyHolisticDisclaimer />

      <div className="print-header hidden">
        Sandbox (simulado) — modo: {mode}. Dataset: {selectedChart.dataset}. Engine: {selectedChart.meta.engine} {selectedChart.meta.version}.
      </div>

      {mode !== 'SANDBOX' && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Cambia a modo Sandbox para ver scores didácticos. No se recalcula ningún dato.
        </div>
      )}

      {mode === 'SANDBOX' && sandboxUnavailable && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Sandbox no disponible para datos no simulados. Selecciona dataset simulado o cambia de modo.
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">Selecciona snapshot simulado</p>
            <p className="text-[11px] text-gray-500">No usa consultantes reales. No persiste resultados.</p>
          </div>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          >
            {SAMPLE_CHARTS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} ({c.dataset})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-800">
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <p className="font-semibold text-gray-900 mb-1">Config audit</p>
            <ul className="space-y-1 text-xs text-gray-700">
              <li>Dataset: {selectedChart.dataset}</li>
              <li>Sistema de casas: {selectedChart.meta.houseSystem}</li>
              <li>Zodiaco: {selectedChart.meta.zodiac}</li>
              <li>Engine: {selectedChart.meta.engine}</li>
              <li>Versión: {selectedChart.meta.version}</li>
              <li>Efemérides: {selectedChart.meta.ephemeris || 'no declarado'}</li>
            </ul>
          </div>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <p className="font-semibold text-gray-900 mb-1">Aspectos visibles</p>
            <ul className="text-xs text-gray-700 space-y-1">
              {selectedChart.aspects.map((a, idx) => (
                <li key={`${selectedChart.id}-asp-${idx}`}>
                  {a.from} - {a.to} ({a.type}) {typeof a.orb === 'number' ? `| orbe ${a.orb}°` : ''}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {mode === 'SANDBOX' && !sandboxUnavailable && (
        <div className="space-y-3">
          <ScoresList scores={scores} />
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => {
                handleExportCSV();
              }}
              className="px-3 py-2 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100"
            >
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={() => {
                handleExportTXT();
              }}
              className="px-3 py-2 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100"
            >
              Exportar TXT
            </button>
            <button
              type="button"
              onClick={() => {
                window.print();
                logEvent('PRINT_OPEN', { scope: 'sandbox' });
              }}
              className="px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
            >
              Imprimir (layout académico)
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
