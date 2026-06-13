import { asText } from '@/lib/normalizeText';



function sentenceCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function ensurePeriod(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function formatBasadoEn(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const plain = value.trim().replace(/\s*\(([^)]+)\)\s*/g, ' — $1');
  return `Inspirado en tu ${plain}`;
}

function categoryIcon(category: string): string {
  const key = category.toLowerCase();
  if (key.includes('espiritual') || key.includes('práctica') || key.includes('practica')) return '✨';
  if (key.includes('emocional') || key.includes('bienestar') || key.includes('cuidado')) return '🌿';
  if (key.includes('relación') || key.includes('relacion') || key.includes('vínculo')) return '💫';
  return '✨';
}

function looksLikeRawJson(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed.includes('[object Object]') ||
    (trimmed.startsWith('{') && trimmed.includes('"')) ||
    (trimmed.startsWith('[') && trimmed.includes('"'))
  );
}

/** Warm, explicit sentence for patient-facing suggestion list items. */
export function formatClientSuggestion(r: unknown): string | null {
  if (r == null) return null;

  if (typeof r === 'string') {
    const trimmed = r.trim();
    if (!trimmed || looksLikeRawJson(trimmed)) return null;
    return ensurePeriod(trimmed);
  }

  if (typeof r !== 'object') return null;

  const o = r as Record<string, unknown>;

  if (typeof o.sugerencia === 'string' && o.sugerencia.trim()) {
    const main = ensurePeriod(o.sugerencia.trim());
    const category =
      typeof o.categoria === 'string' && o.categoria.trim()
        ? sentenceCase(o.categoria)
        : null;
    const context = formatBasadoEn(o.basado_en);
    const icon = category ? categoryIcon(category) : '✨';

    let line = category ? `${icon} ${category}: ${main}` : `${icon} ${main}`;
    if (context) {
      line = `${line.replace(/\.$/, '')} (${context}.)`;
    }
    return line;
  }

  if (typeof o.texto === 'string' && o.texto.trim()) {
    const main = ensurePeriod(o.texto.trim());
    if (typeof o.sefira === 'string' && o.sefira.trim()) {
      const context = formatBasadoEn(`energía de ${o.sefira.trim()}`);
      return context ? `${main.replace(/\.$/, '')} (${context}.)` : main;
    }
    return main;
  }

  const fallback = asText(r, { clientFacing: true });
  return fallback || null;
}

export const RAW_CLIENT_LEAK_PATTERNS: RegExp[] = [
  /\[object Object\]/,
  /\{\s*"/,
  /"\s*basado_en\s*"/,
  /"\s*categoria\s*"/,
  /"\s*sugerencia\s*"/,
  /\bbasado_en\s*:/,
  /\bcategoria\s*:/,
  /\bsugerencia\s*:/,
  /\bgevurah_status\b/,
  /\brisk_zone\b/,
  /\bseverity\b/,
  /\bclinical_diagnosis\b/,
];

export function assertNoRawClientLeaks(text: string): void {
  for (const pattern of RAW_CLIENT_LEAK_PATTERNS) {
    if (pattern.test(text)) {
      throw new Error(`Client-facing leak detected: ${pattern}`);
    }
  }
  if (text.includes('{') && text.includes('"')) {
    throw new Error('Client-facing leak detected: JSON-like braces');
  }
}

