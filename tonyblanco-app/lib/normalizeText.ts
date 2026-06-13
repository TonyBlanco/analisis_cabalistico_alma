export const CLIENT_GENERIC =
  'Una orientación personal para tu camino. Puedes conversarla con tu terapeuta si lo deseas.';

export type AsTextOptions = {
  /** When true, never emit JSON — use friendly fallback instead. */
  clientFacing?: boolean;
};

export const asText = (r: unknown, options?: AsTextOptions): string => {
  if (typeof r === 'string') return r;
  if (r == null) return '';
  if (typeof r === 'object') {
    const o = r as Record<string, unknown>;
    const candidate =
      o.texto ??
      o.text ??
      o.titulo ??
      o.label ??
      o.descripcion ??
      o.sugerencia ??
      o.name ??
      o.title;
    if (typeof candidate === 'string' && candidate.trim()) return candidate;
    if (options?.clientFacing) return CLIENT_GENERIC;
  }
  if (options?.clientFacing) return CLIENT_GENERIC;
  return JSON.stringify(r);
};

/** Preserves list items (objects or strings) for display via asText() / formatClientSuggestion(). */
export function listItems(value: unknown): unknown[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value];
}