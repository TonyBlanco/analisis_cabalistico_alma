import type {
  CrossPattern,
  PatternEvidence,
  SymbolicCrossEvent,
  SymbolicSystemId,
  SystemDominance,
  TemporalAlignment,
} from './types';

const ORDERED_SYSTEMS: SymbolicSystemId[] = ['tarot', 'tree', 'astrology'];
const DEFAULT_WINDOW_DAYS = 7;

function buildEvidence(event: SymbolicCrossEvent): PatternEvidence {
  return {
    sourceEventId: event.sourceEventId,
    date: event.date,
    system: event.system,
    symbols: event.symbols,
  };
}

function isWithinWindow(dateA: string, dateB: string, windowDays: number) {
  const diffMs = Math.abs(new Date(dateA).getTime() - new Date(dateB).getTime());
  return diffMs <= windowDays * 24 * 60 * 60 * 1000;
}

export function deriveCrossPatterns(
  events: SymbolicCrossEvent[],
  windowDays: number = DEFAULT_WINDOW_DAYS
): CrossPattern[] {
  const patterns: CrossPattern[] = [];
  const grouped = events.reduce<Record<string, SymbolicCrossEvent[]>>((acc, event) => {
    event.symbols.forEach((symbol) => {
      acc[symbol] = acc[symbol] || [];
      acc[symbol].push(event);
    });
    return acc;
  }, {});

  Object.entries(grouped).forEach(([symbol, group], index) => {
    const systems = Array.from(new Set(group.map((item) => item.system)));
    if (systems.length < 2) return;
    const evidence = group.map(buildEvidence);
    patterns.push({
      id: `pattern-${index + 1}`,
      label: `Se observa coincidencia simbolica en "${symbol}"`,
      systems,
      window: `${windowDays} dias`,
      evidence,
    });
  });

  return patterns;
}

export function deriveTemporalAlignment(
  events: SymbolicCrossEvent[],
  windowDays: number = DEFAULT_WINDOW_DAYS
): TemporalAlignment[] {
  const alignments: TemporalAlignment[] = [];
  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date));
  const buckets: SymbolicCrossEvent[][] = [];

  sorted.forEach((event) => {
    const bucket = buckets.find((group) =>
      isWithinWindow(group[0].date, event.date, windowDays)
    );
    if (bucket) {
      bucket.push(event);
    } else {
      buckets.push([event]);
    }
  });

  buckets.forEach((bucket, index) => {
    const systems = Array.from(new Set(bucket.map((item) => item.system)));
    if (systems.length < 2) return;
    alignments.push({
      id: `temporal-${index + 1}`,
      window: `Ventana ${index + 1} (${windowDays} dias)`,
      systems,
      events: bucket.map(buildEvidence),
    });
  });

  return alignments;
}

export function deriveSystemDominance(events: SymbolicCrossEvent[]): SystemDominance[] {
  const total = events.length || 1;
  return ORDERED_SYSTEMS.map((system) => {
    const count = events.filter((event) => event.system === system).length;
    return {
      system,
      ratio: count / total,
      count,
      notes: `Presencia relativa: ${count}/${total}`,
    };
  });
}
