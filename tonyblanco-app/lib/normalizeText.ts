export const asText = (r: unknown): string => {
  if (typeof r === 'string') return r;
  if (r == null) return '';
  if (typeof r === 'object') {
    const o = r as Record<string, unknown>;
    const candidate = o.texto ?? o.text ?? o.titulo ?? o.label ?? o.descripcion;
    if (typeof candidate === 'string') return candidate;
  }
  return JSON.stringify(r);
};

/** Preserves list items (objects or strings) for display via asText(). */
export function listItems(value: unknown): unknown[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value];
}