'use client';

import { useEffect, useMemo, useState } from 'react';

type ChartType = 'natal' | 'transits' | 'solar_return' | 'progressions';
type HouseSystem = 'P' | 'K' | 'E' | 'W' | 'R';
type ZodiacType = 'tropical' | 'sidereal';

const CHART_TYPES: Array<{ id: ChartType; label: string; available: boolean }> = [
  { id: 'natal', label: 'Natal', available: true },
  { id: 'transits', label: 'Tránsitos', available: false },
  { id: 'solar_return', label: 'Retorno Solar', available: false },
  { id: 'progressions', label: 'Progresiones', available: false },
];

const HOUSE_OPTIONS: Array<{ code: HouseSystem; name: string }> = [
  { code: 'P', name: 'Placidus' },
  { code: 'K', name: 'Koch' },
  { code: 'E', name: 'Equal (Casas iguales)' },
  { code: 'W', name: 'Whole Sign' },
  { code: 'R', name: 'Regiomontanus' },
];

const ZODIAC_OPTIONS: Array<{ code: ZodiacType; name: string; available: boolean }> = [
  { code: 'tropical', name: 'Tropical', available: true },
  { code: 'sidereal', name: 'Sidéreo', available: false },
];

const OBJECTS: Array<{ id: string; label: string; available: boolean }> = [
  { id: 'sun', label: 'Sol', available: true },
  { id: 'moon', label: 'Luna', available: true },
  { id: 'mercury', label: 'Mercurio', available: true },
  { id: 'venus', label: 'Venus', available: true },
  { id: 'mars', label: 'Marte', available: true },
  { id: 'jupiter', label: 'Júpiter', available: true },
  { id: 'saturn', label: 'Saturno', available: true },
  { id: 'uranus', label: 'Urano', available: true },
  { id: 'neptune', label: 'Neptuno', available: true },
  { id: 'pluto', label: 'Plutón', available: true },
  { id: 'north_node', label: 'Nodo Norte', available: true },
  { id: 'south_node', label: 'Nodo Sur', available: true },
  { id: 'chiron', label: 'Quirón', available: false },
];

const ASPECT_TYPES: Array<{ id: string; label: string }> = [
  { id: 'conjunction', label: 'Conjunción' },
  { id: 'opposition', label: 'Oposición' },
  { id: 'trine', label: 'Trígono' },
  { id: 'square', label: 'Cuadratura' },
  { id: 'sextile', label: 'Sextil' },
  { id: 'quincunx', label: 'Quincuncio' },
];

type PresetId = 'tradicional' | 'moderna' | 'investigacion' | 'nivel1' | 'nivel2' | 'nivel3' | 'personal';

const PRESET_CONFIG: Record<PresetId, Partial<SelectionState>> = {
  tradicional: {
    chartType: 'natal',
    houseSystem: 'P',
    zodiac: 'tropical',
    selectedObjects: ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'],
    selectedAspects: ['conjunction', 'opposition', 'trine', 'square', 'sextile'],
  },
  moderna: {
    chartType: 'natal',
    houseSystem: 'K',
    zodiac: 'tropical',
    selectedObjects: ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'],
    selectedAspects: ['conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx'],
  },
  investigacion: {
    chartType: 'natal',
    houseSystem: 'W',
    zodiac: 'tropical',
    selectedObjects: OBJECTS.filter((o) => o.available).map((o) => o.id),
    selectedAspects: ASPECT_TYPES.map((a) => a.id),
  },
  nivel1: {},
  nivel2: {},
  nivel3: {},
  personal: {},
};

type SelectionState = {
  chartType: ChartType;
  houseSystem: HouseSystem;
  zodiac: ZodiacType;
  selectedObjects: string[];
  selectedAspects: string[];
};

const PERSONAL_PRESET_KEY = 'astrology_extended_selection_personal';

export default function ExtendedChartSelection() {
  const [selection, setSelection] = useState<SelectionState>({
    chartType: 'natal',
    houseSystem: 'P',
    zodiac: 'tropical',
    selectedObjects: OBJECTS.filter((o) => o.available).map((o) => o.id),
    selectedAspects: ASPECT_TYPES.map((a) => a.id),
  });
  const [activePreset, setActivePreset] = useState<PresetId | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PERSONAL_PRESET_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.selectedObjects && parsed.selectedAspects) {
          setSelection((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const fingerprint = useMemo(() => {
    const parts = [
      `type=${selection.chartType}`,
      `house=${selection.houseSystem}`,
      `zodiac=${selection.zodiac}`,
      `objects=${selection.selectedObjects.slice().sort().join(',')}`,
      `aspects=${selection.selectedAspects.slice().sort().join(',')}`,
    ];
    return parts.join(' | ');
  }, [selection]);

  const toggleObject = (id: string) => {
    setSelection((prev) => {
      const exists = prev.selectedObjects.includes(id);
      return {
        ...prev,
        selectedObjects: exists ? prev.selectedObjects.filter((o) => o !== id) : [...prev.selectedObjects, id],
      };
    });
  };

  const toggleAspect = (id: string) => {
    setSelection((prev) => {
      const exists = prev.selectedAspects.includes(id);
      return {
        ...prev,
        selectedAspects: exists ? prev.selectedAspects.filter((o) => o !== id) : [...prev.selectedAspects, id],
      };
    });
  };

  const applyPreset = (id: PresetId) => {
    const preset = PRESET_CONFIG[id];
    if (!preset) return;
    setSelection((prev) => ({
      ...prev,
      ...preset,
      selectedObjects: preset.selectedObjects || prev.selectedObjects,
      selectedAspects: preset.selectedAspects || prev.selectedAspects,
    }));
    setActivePreset(id);
  };

  const savePersonal = () => {
    try {
      window.localStorage.setItem(PERSONAL_PRESET_KEY, JSON.stringify(selection));
      setActivePreset('personal');
    } catch {
      // ignore
    }
  };

  return (
    <section className="max-w-6xl mx-auto space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Catálogo · Astrología</p>
          <h1 className="text-2xl font-semibold text-gray-900">Extended Chart Selection</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configura la carta técnica sin recalcular backend. Las opciones deshabilitadas están marcadas como “Próximamente”.
          </p>
        </div>
        <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
          <p>Sin endpoints nuevos</p>
          <p>Sin cambios de motor</p>
          <p>Solo UI (Catálogo)</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bloque tipo de carta */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
          <p className="text-sm font-semibold text-gray-900">Tipo de carta</p>
          {CHART_TYPES.map((t) => (
            <label
              key={t.id}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                t.available ? 'bg-gray-50' : 'bg-gray-100'
              }`}
            >
              <div>
                <p className="text-gray-900">{t.label}</p>
                {!t.available && <p className="text-[11px] text-gray-500">Próximamente</p>}
              </div>
              <input
                type="radio"
                name="chart-type"
                disabled={!t.available}
                checked={selection.chartType === t.id}
                onChange={() => setSelection((prev) => ({ ...prev, chartType: t.id }))}
              />
            </label>
          ))}
        </div>

        {/* Sistemas y zodiaco */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Sistema de casas</p>
            <select
              value={selection.houseSystem}
              onChange={(e) => setSelection((prev) => ({ ...prev, houseSystem: e.target.value as HouseSystem }))}
              className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              {HOUSE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>{`${opt.code} - ${opt.name}`}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Zodiaco</p>
            <div className="space-y-2 mt-2">
              {ZODIAC_OPTIONS.map((z) => (
                <label key={z.code} className={`flex items-center justify-between rounded-md px-3 py-2 ${z.available ? 'bg-gray-50' : 'bg-gray-100'}`}>
                  <span className="text-gray-900">{z.name}</span>
                  <div className="flex items-center gap-2">
                    {!z.available && <span className="text-[11px] text-gray-500">Próximamente</span>}
                    <input
                      type="radio"
                      name="zodiac"
                      disabled={!z.available}
                      checked={selection.zodiac === z.code}
                      onChange={() => setSelection((prev) => ({ ...prev, zodiac: z.code }))}
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-900">Presets</p>
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Escuelas</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('tradicional')}
                className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100"
              >
                Tradicional
              </button>
              <button
                type="button"
                onClick={() => applyPreset('moderna')}
                className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100"
              >
                Moderna
              </button>
              <button
                type="button"
                onClick={() => applyPreset('investigacion')}
                className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100"
              >
                Investigación
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500">Cursos</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => applyPreset('nivel1')} className="text-xs px-2 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50">Nivel 1</button>
              <button onClick={() => applyPreset('nivel2')} className="text-xs px-2 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50">Nivel 2</button>
              <button onClick={() => applyPreset('nivel3')} className="text-xs px-2 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50">Nivel 3</button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500 mb-2">Preset personal (localStorage)</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={savePersonal}
                className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-blue-50 text-blue-800 hover:bg-blue-100"
              >
                Guardar personal
              </button>
              <button
                type="button"
                onClick={() => applyPreset('personal')}
                className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
              >
                Cargar personal
              </button>
            </div>
            {activePreset && <p className="text-[11px] text-gray-500 mt-1">Preset activo: {activePreset}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Objetos */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Objetos / puntos</p>
            <span className="text-xs text-gray-500">{selection.selectedObjects.length} seleccionados</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
            {OBJECTS.map((obj) => {
              const checked = selection.selectedObjects.includes(obj.id);
              return (
                <label
                  key={obj.id}
                  className={`flex items-center gap-2 text-sm rounded-md px-2 py-2 ${
                    obj.available ? 'bg-gray-50' : 'bg-gray-100 text-gray-500'
                  }`}
                  title={!obj.available ? 'Próximamente' : ''}
                >
                  <input
                    type="checkbox"
                    disabled={!obj.available}
                    checked={checked}
                    onChange={() => toggleObject(obj.id)}
                    className="h-4 w-4"
                  />
                  {obj.label} {!obj.available && <span className="text-[11px] text-gray-500">(Próximamente)</span>}
                </label>
              );
            })}
          </div>
        </div>

        {/* Aspectos */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Aspectos (conjunto)</p>
            <span className="text-xs text-gray-500">{selection.selectedAspects.length} seleccionados</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
            {ASPECT_TYPES.map((asp) => {
              const checked = selection.selectedAspects.includes(asp.id);
              return (
                <label key={asp.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded-md px-2 py-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAspect(asp.id)}
                    className="h-4 w-4"
                  />
                  {asp.label}
                </label>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">El orbe se controla en Visual Pro (frontend). Aquí solo el conjunto de aspectos.</p>
        </div>
      </div>

      {/* Resumen / auditoría */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Resumen de configuración</p>
            <p className="text-xs text-gray-600 mt-1">
              Fingerprint solo lectura (no se persiste). Úsalo para auditar o comparar configuraciones.
            </p>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
            <p>Catálogo global · sin endpoints</p>
            <p>Payloads backend: sin cambios</p>
          </div>
        </div>
        <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
          {fingerprint}
        </div>
      </div>
    </section>
  );
}
