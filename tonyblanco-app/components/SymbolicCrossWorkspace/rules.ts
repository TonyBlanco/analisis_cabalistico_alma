import type { CrossPattern, SymbolicCrossEvent, SymbolicSystemId, SystemDominance, TemporalAlignment } from './types';

const ORDERED_SYSTEMS: SymbolicSystemId[] = ['tarot', 'tree', 'astrology'];

export function deriveCrossPatterns(events: SymbolicCrossEvent[]): CrossPattern[] {
  const patterns: CrossPattern[] = [];
  const grouped = events.reduce<Record<string, SymbolicCrossEvent[]>>((acc, event) => {
    const key = event.symbols.join('|');
    acc[key] = acc[key] || [];
    acc[key].push(event);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([key, group], index) => {
    const systems = Array.from(new Set(group.map((item) => item.system)));
    if (systems.length < 2) return;
    patterns.push({
      id: `pattern-${index + 1}`,
      label: `Coincidencia simbolica: ${key}`,
      systems,
      evidence: group.map((item) => `${item.system}: ${item.symbols.join(', ')}`),
    });
  });

  return patterns;
}

export function deriveTemporalAlignment(events: SymbolicCrossEvent[]): TemporalAlignment[] {
  const alignments: TemporalAlignment[] = [];
  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date));
  const buckets: SymbolicCrossEvent[][] = [];

  sorted.forEach((event) => {
    const bucket = buckets.find((group) => {
      const diff = Math.abs(new Date(group[0].date).getTime() - new Date(event.date).getTime());
      return diff <= 1000 * 60 * 60 * 24;
    });
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
      window: `Ventana ${index + 1} (24h)`,
      systems,
      observations: bucket.map((item) => `${item.system}: ${item.symbols.join(', ')}`),
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
      notes: `Presencia relativa: ${count}/${total}`,
    };
  });
}
