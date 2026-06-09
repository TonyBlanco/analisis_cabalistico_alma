/**
 * Formative Reading — deterministic therapist-oriented synthesis from tree analysis.
 * READ-ONLY · no diagnosis · consultive language only.
 */

import type { TreeStructuralState } from './tree-structural-state.types';
import type { TreeStructuralAnalysis } from './tree-analysis.types';
import type { SefiraId } from './tree-structural-state.types';
import type { PillarId, TriadId, OlamId } from './tree-topology';
import { SEFIROT_TOPOLOGY, TREE_PATHS } from './tree-topology';
import type {
  FormativeBrief,
  FormativeClinicalContext,
  FormativeMethodContext,
  FormativePathProcess,
  FormativeSefirahFocus,
  FormativeAxisReading,
} from './formative-reading.types';

export type {
  FormativeBrief,
  FormativeClinicalContext,
  FormativeMethodContext,
  FormativeMethodNumber,
  FormativeSefirahFocus,
  FormativePathProcess,
  FormativeAxisReading,
} from './formative-reading.types';

const NUMBER_TO_SEFIRAH: Record<number, SefiraId> = {
  1: 'keter', 2: 'chokmah', 3: 'binah', 4: 'chesed', 5: 'gevurah',
  6: 'tiferet', 7: 'netzach', 8: 'hod', 9: 'yesod',
};

const SEFIRA_CATALOG: Record<
  SefiraId,
  { displayName: string; hebrew: string; light: string; shadow: string; tikkun: string; therapistNote: string }
> = {
  keter: {
    displayName: 'Corona (Keter)',
    hebrew: 'כתר',
    light: 'Sentido de origen, fe, unidad y dirección espiritual.',
    shadow: 'Desconexión de sentido, rigidez idealista, negación del misterio.',
    tikkun: 'Reconectar con un eje de sentido sin imponerlo.',
    therapistNote: 'Explorar qué da coherencia existencial sin convertirlo en mandato.',
  },
  chokmah: {
    displayName: 'Sabiduría (Jojmá)',
    hebrew: 'חכמה',
    light: 'Intuición, visión, impulso creativo inicial.',
    shadow: 'Impulsividad, dogma, exceso de certeza sin forma.',
    tikkun: 'Dar espacio a la chispa sin saltar la elaboración.',
    therapistNote: 'Observar ideas o impulsos que llegan antes de poder integrarlos.',
  },
  binah: {
    displayName: 'Comprensión (Biná)',
    hebrew: 'בינה',
    light: 'Forma, contención madre, capacidad de dar estructura.',
    shadow: 'Cierre mental, frialdad, dificultad para nutrir.',
    tikkun: 'Comprender sin asfixiar; dar forma con ternura.',
    therapistNote: 'Revisar cómo la persona organiza afecto y límites a la vez.',
  },
  chesed: {
    displayName: 'Misericordia (Jésed)',
    hebrew: 'חסד',
    light: 'Expansión, vocación de servicio, generosidad simbólica.',
    shadow: 'Complacencia, sobre-adaptación, dar sin límites.',
    tikkun: 'Amar y servir con discernimiento.',
    therapistNote: 'Preguntar dónde la bondad se vuelve auto-descuido.',
  },
  gevurah: {
    displayName: 'Rigor (Gevurá)',
    hebrew: 'גבורה',
    light: 'Límite claro, valentía, ética y poder consciente.',
    shadow: 'Dureza, crítica excesiva, control por miedo.',
    tikkun: 'Decir no con dignidad, no con castigo.',
    therapistNote: 'Explorar cómo se ejercen límites sin perder vínculo.',
  },
  tiferet: {
    displayName: 'Belleza (Tiferet)',
    hebrew: 'תפארת',
    light: 'Centro identitario, autoestima simbólica, corazón integrador.',
    shadow: 'Confusión de roles, vivir para la mirada del otro.',
    tikkun: 'Reconocerse sin necesidad de performance.',
    therapistNote: 'Trabajar identidad como eje, no como máscara.',
  },
  netzach: {
    displayName: 'Victoria (Netsaj)',
    hebrew: 'נצח',
    light: 'Persistencia emocional, deseo, impulso vital.',
    shadow: 'Repetición compulsiva, drama afectivo, dispersión.',
    tikkun: 'Sostener el deseo sin secuestrar la vida.',
    therapistNote: 'Observar qué emociones se repiten y qué sostienen.',
  },
  hod: {
    displayName: 'Esplendor (Hod)',
    hebrew: 'הוד',
    light: 'Mente al servicio, comunicación, ética intelectual.',
    shadow: 'Intelectualización, exhibición, poder por la palabra.',
    tikkun: 'Mostrarse con verdad, no solo con brillantez.',
    therapistNote: 'Foco alto: revisar si el discurso protege o revela.',
  },
  yesod: {
    displayName: 'Fundamento (Yesod)',
    hebrew: 'יסוד',
    light: 'Subconsciente, imaginación, puente entre idea y vida.',
    shadow: 'Máscaras, creencias ocultas, fantasías no elaboradas.',
    tikkun: 'Limpiar el fundamento sin negar la imaginación.',
    therapistNote: 'Explorar qué sostiene por debajo del relato consciente.',
  },
  malchut: {
    displayName: 'Reino (Malkut)',
    hebrew: 'מלכות',
    light: 'Encarnación, hábitos, cuerpo, hechos concretos.',
    shadow: 'Estancamiento, comodidad, negación de la acción.',
    tikkun: 'Bajar el insight a gesto real y sostenido.',
    therapistNote: 'Preguntar qué parte del insight ya toca la vida diaria.',
  },
};

const PILLAR_LABELS: Record<PillarId, { label: string; therapeutic: string }> = {
  mercy: {
    label: 'Misericordia (expansión)',
    therapeutic: 'Vínculo, generosidad, apertura afectiva y proyección hacia el otro.',
  },
  severity: {
    label: 'Severidad (límite)',
    therapeutic: 'Discernimiento, contención, criterio y capacidad de decir no.',
  },
  equilibrium: {
    label: 'Equilibrio (centro)',
    therapeutic: 'Integración identitaria, eje vertebral, coherencia entre partes.',
  },
};

const TRIAD_LABELS: Record<TriadId | 'receptacle', { label: string; therapeutic: string }> = {
  supernal: {
    label: 'Triada Superna',
    therapeutic: 'Sentido, visión y marco de comprensión (arriba del árbol).',
  },
  ethical: {
    label: 'Triada Ética',
    therapeutic: 'Valores, identidad y relación con el otro en el plano humano.',
  },
  astral: {
    label: 'Triada Astral',
    therapeutic: 'Emoción, mente cotidiana y fundamento psíquico.',
  },
  receptacle: {
    label: 'Receptáculo (Malkut)',
    therapeutic: 'Materialización, cuerpo y consecuencias en el mundo.',
  },
};

const OLAM_LABELS: Record<OlamId, { label: string; therapeutic: string }> = {
  atziluth: { label: 'Atzilut (emanación)', therapeutic: 'Dimensión de sentido y unidad.' },
  beriah: { label: 'Beriah (creación)', therapeutic: 'Imaginación estructurante y visión.' },
  yetzirah: { label: 'Yetzirah (formación)', therapeutic: 'Vida afectiva, mental y relacional.' },
  assiah: { label: 'Assiah (acción)', therapeutic: 'Hecho, hábito y encarnación.' },
};

const PATH_NARRATIVES: Record<string, { narrative: string; phase: string }> = {
  'keter-chokmah': { narrative: 'De la unidad a la chispa visionaria', phase: 'Inspiración' },
  'keter-binah': { narrative: 'De la unidad a la comprensión formadora', phase: 'Comprensión' },
  'keter-tiferet': { narrative: 'Del origen al centro identitario', phase: 'Centrado' },
  'chokmah-binah': { narrative: 'De la intuición a la forma', phase: 'Elaboración' },
  'chokmah-tiferet': { narrative: 'De la visión al corazón', phase: 'Integración' },
  'chokmah-chesed': { narrative: 'De la expansión visionaria al dar', phase: 'Generosidad' },
  'binah-tiferet': { narrative: 'De la comprensión al centro', phase: 'Síntesis' },
  'binah-gevurah': { narrative: 'De la forma al límite consciente', phase: 'Contención' },
  'chesed-gevurah': { narrative: 'Tensión entre dar y limitar', phase: 'Ética relacional' },
  'chesed-tiferet': { narrative: 'Del amor al centro identitario', phase: 'Coherencia' },
  'chesed-netzach': { narrative: 'De la misericordia al impulso vital', phase: 'Deseo' },
  'gevurah-tiferet': { narrative: 'Del rigor al centro', phase: 'Equilibrio' },
  'gevurah-hod': { narrative: 'Del límite a la mente analítica', phase: 'Discernimiento' },
  'tiferet-netzach': { narrative: 'Del centro al impulso emocional', phase: 'Movimiento' },
  'tiferet-yesod': { narrative: 'Del centro al fundamento psíquico', phase: 'Profundización' },
  'tiferet-hod': { narrative: 'Del centro a la expresión mental', phase: 'Articulación' },
  'netzach-hod': { narrative: 'Del deseo a la mente', phase: 'Traducción' },
  'netzach-yesod': { narrative: 'Del impulso al inconsciente', phase: 'Sedimentación' },
  'netzach-malchut': { narrative: 'Del deseo a la acción', phase: 'Materialización' },
  'hod-yesod': { narrative: 'De la mente visible al fundamento', phase: 'Profundización mental' },
  'hod-malchut': { narrative: 'De la idea a la acción concreta', phase: 'Encarnación' },
  'yesod-malchut': { narrative: 'Del fundamento al hecho', phase: 'Manifestación' },
};

const METHOD_LABELS: Record<string, string> = {
  pitagoras: 'Numerología Pitagórica',
  'gematria-standard': 'Gematría Estándar',
  'gematria-katan': 'Gematría Katan',
  'mispar-gadol': 'Mispar Gadol',
  'mispar-siduri': 'Mispar Siduri',
  milui: 'Milui',
  atbash: 'Atbash',
  albam: 'Albam',
  avgad: 'Avgad',
  temurah: 'Temurah',
  notarikon: 'Notarikon',
};

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function topEntries<T extends string>(
  record: Record<T, number>,
  labels: Record<T, { label: string; therapeutic: string }>,
  limit = 3,
): FormativeAxisReading[] {
  return (Object.entries(record) as [T, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, weight]) => {
      const meta = labels[id];
      const intensity =
        weight >= 0.45 ? 'predominante' : weight >= 0.3 ? 'presente' : 'secundario';
      return {
        id,
        label: meta.label,
        weight,
        reading: `Carga ${intensity} (${pct(weight)}).`,
        therapeuticAngle: meta.therapeutic,
      };
    });
}

function buildDominantFocus(treeState: TreeStructuralState): FormativeSefirahFocus[] {
  return treeState.sefirot
    .filter((s) => s.role !== 'latent')
    .sort((a, b) => b.activation - a.activation)
    .slice(0, 5)
    .map((s) => {
      const topo = SEFIROT_TOPOLOGY[s.id];
      const cat = SEFIRA_CATALOG[s.id];
      return {
        id: s.id,
        displayName: cat.displayName,
        hebrewLabel: cat.hebrew,
        role: s.role,
        activation: s.activation,
        pillar: topo.pillar,
        triad: topo.triad,
        olam: topo.olam,
        light: cat.light,
        shadowWatch: cat.shadow,
        tikkun: cat.tikkun,
        therapistNote: cat.therapistNote,
      };
    });
}

function buildLatentGaps(treeState: TreeStructuralState): FormativeBrief['latentGaps'] {
  return treeState.sefirot
    .filter((s) => s.role === 'latent' && s.activation <= 0.2)
    .sort((a, b) => a.activation - b.activation)
    .slice(0, 3)
    .map((s) => ({
      id: s.id,
      displayName: SEFIRA_CATALOG[s.id].displayName,
      note: `Poca carga simbólica aquí; podría explorarse como zona menos habitada (no ausencia clínica).`,
    }));
}

function buildPathProcesses(
  treeState: TreeStructuralState,
  analysis: TreeStructuralAnalysis,
): FormativePathProcess[] {
  const flowByPath = new Map<string, { intensity: number; polarity: string }>();
  for (const flow of treeState.flows) {
    if (!flow.pathId) continue;
    const existing = flowByPath.get(flow.pathId);
    if (!existing || flow.intensity > existing.intensity) {
      flowByPath.set(flow.pathId, { intensity: flow.intensity, polarity: flow.polarity });
    }
  }

  return analysis.graph.activePaths
    .map((pathId) => {
      const path = TREE_PATHS.find((p) => p.id === pathId);
      if (!path) return null;
      const meta = PATH_NARRATIVES[pathId] ?? {
        narrative: `Conexión ${path.from}–${path.to}`,
        phase: 'Proceso',
      };
      const flowMeta = flowByPath.get(pathId);
      return {
        pathId,
        from: path.from,
        to: path.to,
        fromLabel: SEFIRA_CATALOG[path.from].displayName,
        toLabel: SEFIRA_CATALOG[path.to].displayName,
        narrative: meta.narrative,
        processPhase: meta.phase,
        intensity: flowMeta?.intensity ?? 0.5,
        polarity: flowMeta?.polarity ?? 'harmonic',
      };
    })
    .filter((p): p is FormativePathProcess => p !== null)
    .sort((a, b) => b.intensity - a.intensity);
}

function detectProcessArc(paths: FormativePathProcess[], dominants: FormativeSefirahFocus[]): string {
  if (paths.length === 0) {
    return 'Sin senderos canónicos activos: el foco está en nodos aislados más que en un proceso relacional visible.';
  }

  const ids = dominants.map((d) => d.id);
  const hasHodYesodMalchut =
    ids.includes('hod') && ids.includes('yesod') && ids.includes('malchut');
  const pathIds = new Set(paths.map((p) => p.pathId));

  if (hasHodYesodMalchut && (pathIds.has('hod-yesod') || pathIds.has('hod-malchut') || pathIds.has('yesod-malchut'))) {
    return 'Arco de descenso mental: Esplendor (Hod) → Fundamento (Yesod) → Reino (Malchut). El patrón sugiere elaboración intelectual que busca anclarse en el inconsciente y materializarse en acción.';
  }

  if (pathIds.has('chesed-gevurah')) {
    return 'Tensión ética activa entre expansión (Jésed) y límite (Gevurá): eje de negociación entre dar y contener.';
  }

  if (paths.some((p) => p.from === 'keter' || p.to === 'keter')) {
    return 'Proceso con referencia al polo superior: hay movimiento entre sentido/origen y niveles inferiores del árbol.';
  }

  const chain = paths.map((p) => `${p.fromLabel} → ${p.toLabel}`).join('; ');
  return `Proceso relacional activo: ${chain}.`;
}

function buildPolarityReading(analysis: TreeStructuralAnalysis): string {
  const { harmonic, integrative, tensional } = analysis.polarityDistribution;
  const parts: string[] = [];

  if (harmonic >= 0.7) {
    parts.push('Predominio armónico: los vínculos simbólicos fluyen con poca fricción visible.');
  } else if (tensional >= 0.35) {
    parts.push('Presencia tensional: hay polaridades que piden elaboración, no colapso.');
  } else if (integrative >= 0.35) {
    parts.push('Polaridad integrativa: el sistema trabaja diferencias para construir sentido.');
  } else {
    parts.push('Distribución mixta de polaridades: conviene leer cada sendero por separado.');
  }

  parts.push(
    `Armónica ${pct(harmonic)}, integrativa ${pct(integrative)}, tensional ${pct(tensional)}.`,
  );
  return parts.join(' ');
}

function buildMethodBridge(
  context: FormativeMethodContext | undefined,
  dominants: FormativeSefirahFocus[],
): string[] {
  if (!context?.primaryNumbers?.length) return [];

  const lines: string[] = [];
  const methodLabel = context.methodName ?? METHOD_LABELS[context.methodId] ?? context.methodId;
  lines.push(`Método: ${methodLabel}.`);

  for (const num of context.primaryNumbers) {
    const sefira = NUMBER_TO_SEFIRAH[num.value];
    const sefiraLabel = sefira ? SEFIRA_CATALOG[sefira].displayName : 'sin mapeo directo';
    const titulo = num.titulo ? ` («${num.titulo}»)` : '';
    const cualidad = num.cualidad ? ` · ${num.cualidad}` : '';
    lines.push(
      `${num.label} = ${num.value}${titulo}${cualidad} → ${sefiraLabel} (peso ${num.weight.toFixed(2)}).`,
    );
  }

  if (context.inclusionDominants?.length) {
    lines.push(
      `Casas dominantes en inclusión: ${context.inclusionDominants.join(', ')} — números con mayor repetición en el perfil simbólico.`,
    );
  }
  if (context.inclusionAbsences?.length) {
    lines.push(
      `Casas ausentes: ${context.inclusionAbsences.join(', ')} — áreas de menor expresión numérica (exploración, no déficit).`,
    );
  }

  const top = dominants[0];
  if (top) {
    const linked = context.primaryNumbers.find((n) => NUMBER_TO_SEFIRAH[n.value] === top.id);
    if (linked) {
      lines.push(
        `Coherencia método–árbol: el número ${linked.value} (${linked.label}) alimenta el foco en ${top.displayName}.`,
      );
    }
  }

  return lines;
}

function buildSessionQuestions(
  dominants: FormativeSefirahFocus[],
  paths: FormativePathProcess[],
  pillarAxes: FormativeAxisReading[],
): string[] {
  const questions: string[] = [];
  const top = dominants[0];
  const second = dominants[1];

  if (top) {
    questions.push(
      `¿Dónde la persona vive hoy la cualidad de ${top.displayName} (${top.light.toLowerCase()}) sin convertirla en performance?`,
    );
    questions.push(
      `¿Qué versión sombría de ${top.displayName} podría estar activa (${top.shadowWatch.toLowerCase()})?`,
    );
  }

  if (second && top) {
    questions.push(
      `¿Cómo se relacionan en sesión ${top.displayName} y ${second.displayName}? ¿Hay continuidad o ruptura entre ambas?`,
    );
  }

  for (const path of paths.slice(0, 2)) {
    questions.push(
      `En el sendero ${path.fromLabel} → ${path.toLabel} (${path.narrative.toLowerCase()}): ¿qué está en tránsito y qué aún no baja de nivel?`,
    );
  }

  const mainPillar = pillarAxes[0];
  if (mainPillar && mainPillar.weight >= 0.4) {
    questions.push(
      `El eje ${mainPillar.label} está cargado: ¿cómo se nota eso en la narrativa del consultante (${mainPillar.therapeuticAngle.toLowerCase()})?`,
    );
  }

  if (questions.length < 5 && dominants.some((d) => d.id === 'malchut')) {
    questions.push(
      '¿Qué gesto concreto, por pequeño, podría anclar el insight de la sesión en la vida diaria (Malkut)?',
    );
  }

  return questions.slice(0, 6);
}

function buildSupervisionPrompts(dominants: FormativeSefirahFocus[], analysis: TreeStructuralAnalysis): string[] {
  return [
    `¿Estoy leyendo estructura simbólica o proyectando diagnóstico? Recuerda: ${analysis.graph.activeNodes.length} nodos y ${analysis.graph.activePaths.length} senderos activos.`,
    dominants[0]
      ? `¿Mi contra-transferencia con ${dominants[0].displayName} (tema de ${dominants[0].tikkun.toLowerCase()}) está coloreando la lectura?`
      : '¿Qué parte del árbol estoy ignorando por preferencia teórica?',
    `¿La formulación que haría en supervisión es observacional («podría explorarse») o conclusiva?`,
    analysis.graph.connectedComponents > 1
      ? 'Hay más de un componente conectado: ¿estoy forzando una narrativa única donde hay islas simbólicas?'
      : 'El grafo es coherente: ¿la hipótesis de proceso se sostiene en el relato del consultante?',
  ];
}

function buildHeadline(dominants: FormativeSefirahFocus[], pillarAxes: FormativeAxisReading[]): string {
  if (!dominants.length) {
    return 'Estructura latente: sin focos dominantes; lectura exploratoria de base.';
  }
  const names = dominants.slice(0, 3).map((d) => d.displayName.split(' (')[0]).join(' · ');
  const pillar = pillarAxes[0]?.label.split(' (')[0] ?? 'equilibrio';
  return `Foco en ${names}, con eje ${pillar.toLowerCase()}.`;
}

function buildStructuralFocus(
  dominants: FormativeSefirahFocus[],
  pillarAxes: FormativeAxisReading[],
  analysis: TreeStructuralAnalysis,
): string {
  if (!dominants.length) {
    return 'La estructura no marca centros fuertes; conviene una lectura abierta de campo antes de hipótesis.';
  }

  const lead = dominants[0];
  const pillar = pillarAxes[0];
  const worldTop = topEntries(analysis.olamActivation, OLAM_LABELS, 1)[0];

  return [
    `${lead.displayName} concentra la activación (${pct(lead.activation)}). ${lead.therapistNote}`,
    pillar
      ? `Eje ${pillar.label}: ${pillar.therapeuticAngle}`
      : null,
    worldTop
      ? `Mundo simbólico predominante: ${worldTop.label} — ${worldTop.therapeuticAngle}`
      : null,
    `Ranking: ${analysis.ranking
      .filter((r) => r.role !== 'latent')
      .slice(0, 4)
      .map((r) => SEFIRA_CATALOG[r.id].displayName.split(' (')[0])
      .join(', ')}.`,
  ]
    .filter(Boolean)
    .join(' ');
}

function buildWorkingHypothesis(
  dominants: FormativeSefirahFocus[],
  processArc: string,
  polarityReading: string,
  pillarAxes: FormativeAxisReading[],
): string {
  if (!dominants.length) {
    return 'Hipótesis exploratoria: la estructura no marca un centro fuerte; conviene mapear el campo antes de cerrar sentido.';
  }

  const lead = dominants[0];
  const support = dominants[1];
  const pillar = pillarAxes[0];

  const parts = [
    `Hipótesis de trabajo: el consultante podría estar organizando experiencia alrededor de ${lead.displayName} (${lead.light.toLowerCase()}).`,
    support
      ? `En segundo plano aparece ${support.displayName}, lo que sugiere una tensión o complemento entre ${lead.displayName.split(' (')[0]} y ${support.displayName.split(' (')[0]}.`
      : null,
    pillar && pillar.weight >= 0.35
      ? `El eje ${pillar.label.toLowerCase()} orienta cómo se vive esa activación en vínculo y límites.`
      : null,
    processArc,
    polarityReading,
  ];

  return parts.filter(Boolean).join(' ');
}

function buildInterventionAngles(
  dominants: FormativeSefirahFocus[],
  paths: FormativePathProcess[],
  latentGaps: FormativeBrief['latentGaps'],
): string[] {
  const angles: string[] = [];
  const top = dominants[0];

  if (top) {
    angles.push(
      `Trabajar la polaridad luz/sombra de ${top.displayName}: invitar ejemplos concretos donde ${top.tikkun.toLowerCase()}.`,
    );
  }

  for (const path of paths.slice(0, 2)) {
    angles.push(
      `Seguir el sendero ${path.fromLabel} → ${path.toLabel}: nombrar qué ya transitó y qué queda «en el aire» antes de ${path.toLabel.split(' (')[0]}.`,
    );
  }

  if (latentGaps[0]) {
    angles.push(
      `Explorar suavemente ${latentGaps[0].displayName} como zona poco habitada — sin interpretar ausencia como déficit.`,
    );
  }

  if (dominants.some((d) => d.id === 'hod' || d.id === 'yesod')) {
    angles.push(
      'Si hay mucha elaboración verbal, anclar con sensación corporal o imagen antes de más análisis (Hod/Yesod).',
    );
  }

  if (dominants.some((d) => d.id === 'malchut') || paths.some((p) => p.to === 'malchut')) {
    angles.push(
      'Cerrar con micro-compromiso observable (gesto, hábito, frontera) que materialice el insight (Malkut).',
    );
  }

  return angles.slice(0, 5);
}

function buildTransferentialCues(dominants: FormativeSefirahFocus[]): string[] {
  const cues: string[] = [];
  const top = dominants[0];

  if (!top) {
    return ['Sin foco dominante: vigilar impulso de «llenar vacío» con teoría o interpretación prematura.'];
  }

  const byId = new Map(dominants.map((d) => [d.id, d]));

  if (top.id === 'hod' || byId.has('hod')) {
    cues.push(
      'Riesgo de identificarse con la brillantez intelectual del consultante o competir en claridad conceptual.',
    );
  }
  if (top.id === 'chesed' || byId.has('chesed')) {
    cues.push('Puede activarse deseo de rescatar, suavizar o sobre-proteger frente a la expansión afectiva.');
  }
  if (top.id === 'gevurah' || byId.has('gevurah')) {
    cues.push('Vigilar rigidez propia o impulso de «corregir» cuando el consultante muestra límites duros.');
  }
  if (top.id === 'yesod' || byId.has('yesod')) {
    cues.push('El material imaginario o erótico simbólico puede resonar; mantener marco y no colusión.');
  }
  if (top.id === 'tiferet') {
    cues.push('Cuidado con idealizar al consultante o buscar coherencia narrativa demasiado pronto.');
  }

  cues.push(
    `Tema ${top.displayName}: preguntarse si la respuesta propia hoy favorece ${top.tikkun.toLowerCase()} o refuerza la sombra.`,
  );

  return cues.slice(0, 4);
}

function buildClinicalBridge(
  clinical: FormativeClinicalContext | undefined,
  dominants: FormativeSefirahFocus[],
  olamAxes: FormativeAxisReading[],
): string[] {
  if (!clinical) return [];

  const lines: string[] = [];

  if (clinical.ritmoState) {
    const ritmoNotes: Record<string, string> = {
      fluido: 'Ritmo álmico fluido: buen momento para seguir procesos ya en movimiento.',
      latente: 'Ritmo latente: conviene activar con preguntas concretas sin forzar insight.',
      forzado: 'Ritmo forzado: revisar presión por resultados o performance en sesión.',
      fragmentado: 'Ritmo fragmentado: trabajar por islas temáticas antes de síntesis global.',
    };
    lines.push(
      `Ritmo álmico (${clinical.ritmoState}): ${ritmoNotes[clinical.ritmoState] ?? 'integrar con el relato del consultante.'}`,
    );
  }

  if (clinical.mundoPredominante) {
    const treeOlam = olamAxes[0]?.label ?? '';
    lines.push(
      `Mundo clínico predominante: ${clinical.mundoPredominante}. Árbol marca ${treeOlam || 'distribución olamot'} — buscar convergencias, no forzar coincidencia.`,
    );
  }

  if (clinical.harmonyIndex != null) {
    const level =
      clinical.harmonyIndex >= 0.7
        ? 'alta coherencia interna reportada'
        : clinical.harmonyIndex >= 0.4
          ? 'coherencia moderada'
          : 'tensión interna reportada';
    lines.push(`Índice de armonía SHA (${Math.round(clinical.harmonyIndex * 100)}%): ${level}.`);
  }

  if (clinical.illuminatedSefirot?.length) {
    const treeTop = dominants.slice(0, 3).map((d) => d.displayName.split(' (')[0]);
    const overlap = clinical.illuminatedSefirot.filter((s) =>
      treeTop.some((t) => t.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(t.toLowerCase())),
    );
    if (overlap.length) {
      lines.push(`Convergencia clínica–árbol en: ${overlap.join(', ')}.`);
    } else {
      lines.push(
        `Sefirot iluminadas en contexto clínico (${clinical.illuminatedSefirot.join(', ')}) difieren del ranking del método; explorar ambas lecturas.`,
      );
    }
  }

  return lines;
}

function buildCoherenceNote(analysis: TreeStructuralAnalysis): string {
  const { connectedComponents, longestActivePath, activePaths } = analysis.graph;
  if (connectedComponents === 0) {
    return 'Sin grafo activo.';
  }
  if (connectedComponents === 1 && longestActivePath.length >= 3) {
    const pathLabels = longestActivePath
      .map((id) => SEFIRA_CATALOG[id].displayName.split(' (')[0])
      .join(' → ');
    return `Coherencia relacional alta: cadena ${pathLabels} (${activePaths.length} senderos canónicos).`;
  }
  if (connectedComponents > 1) {
    return `${connectedComponents} islas simbólicas: evitar forzar un solo arco narrativo; trabajar por clusters.`;
  }
  return `Estructura moderada: ${activePaths.length} senderos, ${analysis.graph.activeNodes.length} nodos activos.`;
}

export function buildFormativeBrief(
  treeState: TreeStructuralState,
  analysis: TreeStructuralAnalysis,
  methodContext?: FormativeMethodContext,
  clinicalContext?: FormativeClinicalContext,
): FormativeBrief {
  const dominantSefirot = buildDominantFocus(treeState);
  const pathProcesses = buildPathProcesses(treeState, analysis);
  const pillarAxes = topEntries(analysis.pillarBalance, PILLAR_LABELS);
  const triadAxes = topEntries(analysis.triadActivation, TRIAD_LABELS);
  const olamAxes = topEntries(analysis.olamActivation, OLAM_LABELS);
  const latentGaps = buildLatentGaps(treeState);
  const polarityReading = buildPolarityReading(analysis);
  const processArc = detectProcessArc(pathProcesses, dominantSefirot);

  const methodId = methodContext?.methodId ?? treeState.source.method;

  return {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    methodId,
    headline: buildHeadline(dominantSefirot, pillarAxes),
    workingHypothesis: buildWorkingHypothesis(
      dominantSefirot,
      processArc,
      polarityReading,
      pillarAxes,
    ),
    structuralFocus: buildStructuralFocus(dominantSefirot, pillarAxes, analysis),
    processArc,
    dominantSefirot,
    latentGaps,
    pillarAxes,
    triadAxes,
    olamAxes,
    polarityReading,
    pathProcesses,
    methodBridge: buildMethodBridge(methodContext, dominantSefirot),
    interventionAngles: buildInterventionAngles(dominantSefirot, pathProcesses, latentGaps),
    transferentialCues: buildTransferentialCues(dominantSefirot),
    clinicalBridge: buildClinicalBridge(clinicalContext, dominantSefirot, olamAxes),
    sessionQuestions: buildSessionQuestions(dominantSefirot, pathProcesses, pillarAxes),
    supervisionPrompts: buildSupervisionPrompts(dominantSefirot, analysis),
    coherenceNote: buildCoherenceNote(analysis),
    disclaimer:
      'Lectura formativa y simbólica. No constituye diagnóstico, evaluación clínica ni recomendación terapéutica automática. El terapeuta integra con su marco y el relato del consultante.',
  };
}

export function methodContextFromSymbolicState(state: {
  methodId: string;
  methodName?: string;
  primaryNumbers?: Array<{
    key?: string;
    label: string;
    value: number;
    weight: number;
    meaning?: { titulo?: string; cualidad?: string; descripcion?: string };
  }>;
  inclusionMap?: Record<number, { frequency: number; isAbsent: boolean; isDominant: boolean }>;
}): FormativeMethodContext {
  const inclusionDominants: number[] = [];
  const inclusionAbsences: number[] = [];
  if (state.inclusionMap) {
    for (const [k, v] of Object.entries(state.inclusionMap)) {
      const n = parseInt(k, 10);
      if (v.isDominant) inclusionDominants.push(n);
      if (v.isAbsent) inclusionAbsences.push(n);
    }
  }

  return {
    methodId: state.methodId,
    methodName: state.methodName,
    primaryNumbers: state.primaryNumbers?.map((n) => ({
      label: n.label,
      value: n.value,
      weight: n.weight,
      titulo: n.meaning?.titulo,
      cualidad: n.meaning?.cualidad,
      descripcion: n.meaning?.descripcion,
    })),
    inclusionDominants: inclusionDominants.sort((a, b) => a - b),
    inclusionAbsences: inclusionAbsences.sort((a, b) => a - b),
  };
}