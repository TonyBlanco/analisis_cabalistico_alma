'use client';

export type AnalysisRecordListItem = {
  id: string;
  created_at: string | null;
  kind: string;
  module_code: string;
  computed_result?: unknown;
};

export type CabalaActivityItem = {
  id: string;
  label: string;
  tipo: string;
  fecha: string | null;
};

export function safeDateLabel(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  try {
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export function extractMethodLabel(item: AnalysisRecordListItem): string {
  const cr = item.computed_result as any;
  const ca = cr?.cabala_aplicada;
  const methodName = ca?.method_name;
  const methodId = ca?.method_id || ca?.method;

  if (typeof methodName === 'string' && methodName.trim()) return methodName;
  if (typeof methodId === 'string' && methodId.trim()) return methodId;

  if (typeof item.module_code === 'string' && item.module_code.startsWith('CABALA_APLICADA_')) {
    return item.module_code.replace('CABALA_APLICADA_', '').toLowerCase();
  }

  return 'Método';
}

export function extractRecordTipo(item: AnalysisRecordListItem): string {
  const cr = item.computed_result as any;
  const ca = cr?.cabala_aplicada;
  const methodId = String(ca?.method_id || ca?.method || '').toLowerCase();

  switch (methodId) {
    case 'snapshot':
      return 'snapshot';
    case 'interpretation':
      return 'interpretación';
    case 'pdf':
      return 'pdf';
    default:
      return 'método';
  }
}

export function buildActivityItems(
  results: AnalysisRecordListItem[],
  limit = 20,
): CabalaActivityItem[] {
  return (Array.isArray(results) ? results : [])
    .filter(
      (r) =>
        r &&
        typeof r.module_code === 'string' &&
        r.module_code.startsWith('CABALA_APLICADA_'),
    )
    .slice(0, limit)
    .map((r) => ({
      id: r.id,
      label: extractMethodLabel(r),
      tipo: extractRecordTipo(r),
      fecha: r.created_at,
    }));
}

export function pickLatestMethodRecord(
  results: AnalysisRecordListItem[],
): AnalysisRecordListItem | null {
  const special = new Set(['snapshot', 'interpretation', 'pdf']);
  const list = Array.isArray(results) ? results : [];
  for (const r of list) {
    if (!r || typeof r.module_code !== 'string') continue;
    if (!r.module_code.startsWith('CABALA_APLICADA_')) continue;
    const ca = (r.computed_result as any)?.cabala_aplicada;
    const methodId = String(ca?.method_id || ca?.method || '').toLowerCase();
    if (ca?.method_output && !special.has(methodId)) {
      return r;
    }
  }
  return null;
}
