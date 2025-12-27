'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, BookOpen, Clipboard, ClipboardCheck, Loader2 } from 'lucide-react';
import { useNatalChart, type NatalChartPayload } from '@/hooks/useNatalChart';
import { getHebrewLetterForSign } from '@/lib/kabbalah-sign-letters';
import AstrologyHolisticDisclaimer from './AstrologyHolisticDisclaimer';

type Planet = NatalChartPayload['planetas'][number];
type House = NatalChartPayload['casas'][number];

const PLANET_LABEL_ES: Record<string, string> = {
  sun: 'Sol',
  moon: 'Luna',
  mercury: 'Mercurio',
  venus: 'Venus',
  mars: 'Marte',
  jupiter: 'Júpiter',
  saturn: 'Saturno',
  uranus: 'Urano',
  neptune: 'Neptuno',
  pluto: 'Plutón',
};

const PLANET_FUNCTION_HINT: Record<string, string> = {
  sun: 'Identidad / centro / propósito (observación del “yo” en contexto).',
  moon: 'Ritmo emocional / necesidades / receptividad.',
  mercury: 'Lenguaje / pensamiento / intercambio.',
  venus: 'Vínculo / valor / armonía / gusto.',
  mars: 'Acción / impulso / afirmación / energía.',
  jupiter: 'Sentido / expansión / aprendizaje / creencias.',
  saturn: 'Límites / estructura / responsabilidad / tiempo.',
  uranus: 'Cambio / originalidad / ruptura de patrón.',
  neptune: 'Imaginación / sensibilidad / símbolos / disolución.',
  pluto: 'Transformación / intensidad / reconfiguración.',
};

const HOUSE_DOMAIN: Record<number, string> = {
  1: 'Identidad / presencia / punto de partida',
  2: 'Recursos / valores / sostén',
  3: 'Aprendizaje / comunicación / entorno cercano',
  4: 'Raíces / hogar / base interna',
  5: 'Creatividad / expresión / juego',
  6: 'Rutina / cuidado / hábitos',
  7: 'Vínculos / espejos / acuerdos',
  8: 'Transformación / intimidad / lo compartido',
  9: 'Sentido / visión / exploración',
  10: 'Vocación / dirección / responsabilidad pública',
  11: 'Red / pertenencia / futuro',
  12: 'Retiro / inconsciente / cierre de ciclo',
};

function safeText(value: unknown): string {
  if (value == null) return '-';
  const s = String(value).trim();
  return s ? s : '-';
}

function formatDegrees(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return '-';
  return `${num.toFixed(1)}°`;
}

function getPlanetLabel(planetName: string): string {
  const normalized = planetName.trim().toLowerCase();
  return PLANET_LABEL_ES[normalized] || normalized || '—';
}

function buildTrainingSynthesisTemplate(params: {
  chart: NatalChartPayload;
  houseSystem?: string;
  zodiacType?: string;
}): string {
  const { chart, houseSystem, zodiacType } = params;
  const planets = chart.planetas || [];

  const getPlanet = (key: string) => planets.find((p) => String(p?.nombre || '').trim().toLowerCase() === key);
  const sun = getPlanet('sun');
  const moon = getPlanet('moon');
  const saturn = getPlanet('saturn');

  const lines: string[] = [];
  lines.push('Interpretación simbólica — Modo Training (No médico)');
  lines.push('Uso educativo y formativo. Sin evaluación médica. Sin decisiones automáticas.');
  lines.push('');
  lines.push('Aviso importante: análisis holístico y simbólico con fines de orientación personal.');
  lines.push('No es un sistema médico y no sustituye evaluación, tratamiento ni asesoramiento sanitario.');
  lines.push('');
  lines.push('Contexto técnico (observacional):');
  lines.push(`- Sistema de casas (selección UI): ${safeText(houseSystem)}`);
  lines.push(`- Zodiaco (selección UI): ${safeText(zodiacType)}`);
  lines.push(`- Fuente: ${safeText(chart.metadatos?.fuente)}`);
  lines.push(`- Calculado: ${safeText(chart.metadatos?.calculated_at)}`);
  lines.push('');
  lines.push('1) Lectura simbólica (condicional, pedagógica):');
  lines.push('- Puede sugerir…');
  lines.push('- A nivel interpretativo, podría invitar a explorar…');
  lines.push('');
  lines.push('2) Anclas (observación, no conclusión):');
  if (sun) lines.push(`- Sol: ${safeText(sun.signo)} · Casa ${safeText(sun.casa)} · ${formatDegrees(sun.grados)}`);
  if (moon) lines.push(`- Luna: ${safeText(moon.signo)} · Casa ${safeText(moon.casa)} · ${formatDegrees(moon.grados)}`);
  if (saturn) lines.push(`- Saturno: ${safeText(saturn.signo)} · Casa ${safeText(saturn.casa)} · ${formatDegrees(saturn.grados)}`);
  if (!sun && !moon && !saturn) lines.push('- (Sin planetas clave disponibles en este payload)');
  lines.push('');
  lines.push('3) Preguntas guía (no inductivas):');
  lines.push('- ¿Qué parte de esta imagen simbólica resuena con tu experiencia actual?');
  lines.push('- ¿Dónde notas tensión vs integración en este ciclo?');
  lines.push('- ¿Qué recursos aparecen cuando observas este patrón?');
  lines.push('');
  lines.push('4) Nota ética:');
  lines.push('- Interpretar no es evaluar médicamente. Comprender no es decidir. La síntesis es revisable y humana.');

  return lines.join('\n');
}

function buildHypothesisTemplate(): string {
  return [
    'Hipótesis simbólica de trabajo (no médica)',
    'Uso educativo / no médico. Hipótesis para análisis humano. Sin evaluación médica.',
    '',
    'Aviso importante: análisis holístico y simbólico con fines de orientación personal.',
    'No es un sistema médico y no sustituye evaluación, tratamiento ni asesoramiento sanitario.',
    '',
    'Hipótesis (condicional):',
    '- Podría haber una tensión simbólica entre … y …',
    '- Podría expresarse como … en contextos de …',
    '- Podría invitar a explorar … (sin concluir)',
    '',
    'Condiciones / límites:',
    '- Esto no describe a “la persona”. Describe un lente interpretativo posible.',
    '- Evitar determinismo: preferir “podría”, “a nivel interpretativo”, “invita a explorar”.',
  ].join('\n');
}

function DetailsSection(props: { title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="rounded-lg border border-gray-200 bg-white" open={props.defaultOpen}>
      <summary className="cursor-pointer select-none px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">{props.title}</p>
            {props.subtitle ? <p className="text-xs text-gray-600 mt-0.5">{props.subtitle}</p> : null}
          </div>
          <span className="text-xs text-gray-400">Abrir</span>
        </div>
      </summary>
      <div className="px-4 pb-4">{props.children}</div>
    </details>
  );
}

export default function AstrologyTrainingInterpretationPanel(props: {
  patientId: string;
  houseSystem?: string;
  zodiacType?: string;
}) {
  const { chart, loading, error } = useNatalChart(props.patientId);
  const [copiedSynthesis, setCopiedSynthesis] = useState(false);
  const [copiedHypothesis, setCopiedHypothesis] = useState(false);
  const [hypothesisDraft, setHypothesisDraft] = useState<string>(() => buildHypothesisTemplate());
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);

  const planets = Array.isArray(chart?.planetas) ? chart.planetas : [];
  const houses = Array.isArray(chart?.casas) ? chart.casas : [];

  const synthesisTemplate = useMemo(() => {
    if (!chart) return '';
    return buildTrainingSynthesisTemplate({ chart, houseSystem: props.houseSystem, zodiacType: props.zodiacType });
  }, [chart, props.houseSystem, props.zodiacType]);

  const planetOptions = planets.map((p) => String(p?.nombre || '').trim().toLowerCase()).filter(Boolean);
  const defaultCompareA = planetOptions.includes('sun') ? 'sun' : planetOptions[0] || '';
  const defaultCompareB = planetOptions.includes('moon') ? 'moon' : planetOptions[1] || planetOptions[0] || '';
  const effectiveCompareA = compareA && planetOptions.includes(compareA) ? compareA : defaultCompareA;
  const effectiveCompareB = compareB && planetOptions.includes(compareB) ? compareB : defaultCompareB;

  const findPlanet = (key: string): Planet | undefined =>
    planets.find((p) => String(p?.nombre || '').trim().toLowerCase() === key);

  const getHouse = (n: number | undefined): House | undefined => houses.find((h) => Number(h?.numero) === Number(n));

  const handleCopy = async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const selectedA = effectiveCompareA ? findPlanet(effectiveCompareA) : undefined;
  const selectedB = effectiveCompareB ? findPlanet(effectiveCompareB) : undefined;

  const rawSigns = planets.map((p) => String(p?.signo || '').trim()).filter(Boolean);
  const distinctSigns = Array.from(new Set(rawSigns)).sort((a, b) => a.localeCompare(b));

  const renderCompareCard = (p: Planet | undefined) => {
    if (!p) {
      return (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          Selecciona un factor para comparar.
        </div>
      );
    }

    const key = String(p.nombre || '').trim().toLowerCase();
    const letter = getHebrewLetterForSign(p.signo);
    const cabalistic = chart?.cabalistic_data?.planets?.[key];
    const sefira = cabalistic?.sefira?.sefira_name || cabalistic?.planet_info?.sefira || null;
    const house = getHouse(Number(p.casa));
    const houseDomain = HOUSE_DOMAIN[Number(p.casa)] || '—';

    return (
      <div className="rounded-md border border-gray-200 bg-white p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">{getPlanetLabel(key)}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              {safeText(p.signo)} · Casa {safeText(p.casa)} · {formatDegrees(p.grados)}
            </p>
          </div>
          <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">
            Training
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
          <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2">
            <p className="text-xs font-semibold text-gray-700">Función simbólica</p>
            <p className="text-sm text-gray-800 mt-0.5">{PLANET_FUNCTION_HINT[key] || '—'}</p>
          </div>
          <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2">
            <p className="text-xs font-semibold text-gray-700">Ámbito (Casa)</p>
            <p className="text-sm text-gray-800 mt-0.5">{house ? `${safeText(house.signo)} · ${houseDomain}` : houseDomain}</p>
          </div>
          <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2">
            <p className="text-xs font-semibold text-gray-700">Correspondencias (si existen)</p>
            <p className="text-sm text-gray-800 mt-0.5">
              {letter ? `Letra ${letter.hebrewLetter} · Sendero ${letter.pathNumber}` : 'Letra/Sendero: —'}
              <span className="text-gray-400"> · </span>
              {sefira ? `Sefirá ${sefira}` : 'Sefirá: —'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[360px] gap-4">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-gray-600">Cargando modo Training…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[360px] gap-3">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-red-700 font-medium">No se pudo cargar el modo Training</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </section>
    );
  }

  if (!chart) {
    return (
      <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[360px] gap-4 text-center">
          <BookOpen className="h-10 w-10 text-gray-400" />
          <div>
            <p className="text-gray-900 font-semibold">No hay carta natal disponible</p>
            <p className="text-sm text-gray-600 mt-1">
              Calcula la carta en “Visual” y vuelve para usar los métodos de interpretación en Training.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-amber-950">Interpretación simbólica – Modo Training (No médico)</h3>
            <p className="text-sm text-amber-900 mt-1">
              Uso educativo y formativo. Sin evaluación médica. Sin predicción determinista. Sin scoring. Sin decisiones automáticas.
            </p>
          </div>
          <span className="inline-flex items-center rounded-md border border-amber-200 bg-white px-2 py-1 text-[11px] font-semibold text-amber-800">
            Uso educativo / no médico
          </span>
        </div>
      </div>
      <AstrologyHolisticDisclaimer />

      <div className="space-y-3 mt-4">
        <DetailsSection
          defaultOpen
          title="MÉTODO 1 — Correspondencias Tradicionales"
          subtitle="Descriptivo y explicativo. Sin conclusiones. Sin lenguaje médico."
        >
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">Planeta ↔ función simbólica</div>
              <div className="divide-y divide-gray-100">
                {planets.map((p, idx) => {
                  const key = String(p?.nombre || '').trim().toLowerCase();
                  const label = getPlanetLabel(key);
                  return (
                    <div key={`${key}-${idx}`} className="px-3 py-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {label} <span className="text-gray-400">·</span> {safeText(p.signo)} <span className="text-gray-400">·</span> Casa{' '}
                            {safeText(p.casa)}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">{PLANET_FUNCTION_HINT[key] || '—'}</p>
                        </div>
                        <div className="text-xs text-gray-500">{formatDegrees(p.grados)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">Casa ↔ ámbito de experiencia</div>
              <div className="divide-y divide-gray-100">
                {houses.map((h, idx) => (
                  <div key={`${h.numero}-${idx}`} className="px-3 py-2">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Casa {safeText(h.numero)}:</span> {HOUSE_DOMAIN[Number(h.numero)] || '—'}{' '}
                      <span className="text-gray-400">·</span> signo cúspide: {safeText(h.signo)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">Signo ↔ estilo de expresión</div>
              <div className="divide-y divide-gray-100">
                {distinctSigns.map((sign) => {
                  const letter = getHebrewLetterForSign(sign);
                  return (
                    <div key={sign} className="px-3 py-2">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{sign}</span>
                        {letter ? (
                          <span className="text-gray-600">
                            {' '}
                            <span className="text-gray-400">·</span> Letra {letter.hebrewLetter} <span className="text-gray-400">·</span> Sendero{' '}
                            {letter.pathNumber}
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            {' '}
                            <span className="text-gray-400">·</span> Letra/Sendero: —
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Lectura sugerida: describir “cómo se expresa” sin inferir rasgos médicos.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DetailsSection>

        <DetailsSection
          title="MÉTODO 2 — Preguntas Guía (Training)"
          subtitle="Preguntas abiertas para observación y análisis humano (no inductivas)."
        >
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Preguntas</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
              <li title="Evita afirmar; describe posibilidades.">¿Cómo podría expresarse simbólicamente esta energía en la vida cotidiana?</li>
              <li title="Enfoque en experiencia, no en etiquetas.">¿Qué tensiones podrían explorarse a nivel interpretativo (sin concluir)?</li>
              <li title="Buscar recursos, no determinismo.">¿Qué recursos aparecen cuando se observa este patrón de forma compasiva?</li>
              <li title="No inducir respuestas; invitar a explorar.">¿Qué parte de esta imagen simbólica resuena y cuál no resuena?</li>
              <li title="Enfoque pedagógico: contraste de escenarios.">¿Qué cambia si se interpreta desde Casa vs desde Signo (dos lentes posibles)?</li>
            </ul>
            <p className="text-[11px] text-gray-500 mt-3">
              Recomendación de lenguaje: “puede sugerir”, “a nivel interpretativo”, “invita a explorar”.
            </p>
          </div>
        </DetailsSection>

        <DetailsSection
          title="MÉTODO 3 — Síntesis Narrativa Estructurada"
          subtitle="Plantilla pedagógica. IA (si aplica) solo como asistente de redacción; siempre revisable."
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-xs font-semibold text-gray-700">Plantilla</p>
            <button
              type="button"
              onClick={() => handleCopy(synthesisTemplate, setCopiedSynthesis)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {copiedSynthesis ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copiedSynthesis ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <textarea
            readOnly
            value={synthesisTemplate}
            className="w-full min-h-[240px] rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono text-gray-800"
          />
          <p className="mt-2 text-[11px] text-gray-500">
            Interpretación asistida con fines formativos. No médica. No automática. El analista humano decide el sentido final.
          </p>
        </DetailsSection>

        <DetailsSection
          title="MÉTODO 4 — Análisis Comparativo"
          subtitle="Compara dos lentes simbólicos (formación avanzada). No concluyente."
        >
          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Escenario A</label>
                <select
                  value={effectiveCompareA}
                  onChange={(e) => setCompareA(e.target.value ? e.target.value : null)}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {planetOptions.map((k) => (
                    <option key={`a-${k}`} value={k}>
                      {getPlanetLabel(k)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Escenario B</label>
                <select
                  value={effectiveCompareB}
                  onChange={(e) => setCompareB(e.target.value ? e.target.value : null)}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {planetOptions.map((k) => (
                    <option key={`b-${k}`} value={k}>
                      {getPlanetLabel(k)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {renderCompareCard(selectedA)}
              {renderCompareCard(selectedB)}
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
              <p className="text-xs font-semibold text-gray-700 mb-2">Preguntas comparativas</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>¿Qué cambia en el lenguaje si se describe A como “energía” y B como “contexto” (y luego al revés)?</li>
                <li>¿Qué hipótesis simbólicas condicionales aparecen al observar la diferencia de casas?</li>
                <li>¿Qué sería una formulación prudente (no determinista) para una supervisión formativa?</li>
              </ul>
            </div>
          </div>
        </DetailsSection>

        <DetailsSection
          title="MÉTODO 5 — Hipótesis Simbólica de Trabajo (NO médica)"
          subtitle="Hipótesis condicional, claramente etiquetada. Sin evaluación médica."
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-xs font-semibold text-gray-700">Borrador (editable local)</p>
            <button
              type="button"
              onClick={() => handleCopy(hypothesisDraft, setCopiedHypothesis)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {copiedHypothesis ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copiedHypothesis ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <textarea
            value={hypothesisDraft}
            onChange={(e) => setHypothesisDraft(e.target.value)}
            className="w-full min-h-[220px] rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-mono text-gray-800"
          />
          <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
            Hipótesis para análisis humano. Sin evaluación médica. Evitar “esto indica que la persona es…”. Preferir “podría sugerir…”.
          </div>
        </DetailsSection>
      </div>
    </section>
  );
}
