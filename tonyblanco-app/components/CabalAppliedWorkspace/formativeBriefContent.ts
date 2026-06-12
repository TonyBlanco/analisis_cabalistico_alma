import type { FormativeBrief } from '@holistica/symbolic/tree';

export type FormativeBriefContent = {
  headline: string | null;
  workingHypothesis: string | null;
  processArc: string | null;
  dominantSefirot: Array<{
    displayName: string;
    activation: number | null;
    light: string | null;
    shadowWatch: string | null;
    tikkun: string | null;
  }>;
  sessionQuestions: string[];
};

function asText(v: unknown): string | null {
  if (typeof v === 'string') {
    const t = v.trim();
    return t || null;
  }
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return null;
}

function asLines(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map((x) => asText(x)).filter((s): s is string => Boolean(s));
  }
  const t = asText(v);
  return t ? [t] : [];
}

function getField(obj: unknown, key: string): unknown {
  if (obj && typeof obj === 'object') {
    return (obj as Record<string, unknown>)[key];
  }
  return undefined;
}

/** Lectura defensiva de un brief persistido o tipado para reutilizar el mismo mapeo en UI y PDF. */
export function extractFormativeBriefContent(
  raw: FormativeBrief | Record<string, unknown> | null | undefined,
): FormativeBriefContent | null {
  if (!raw || typeof raw !== 'object') return null;

  const dominantSefirot: FormativeBriefContent['dominantSefirot'] = [];
  const sefirotRaw = getField(raw, 'dominantSefirot');
  if (Array.isArray(sefirotRaw)) {
    for (const s of sefirotRaw) {
      const name = asText(getField(s, 'displayName')) ?? '—';
      const act = getField(s, 'activation');
      const activation =
        typeof act === 'number' && Number.isFinite(act) ? act : null;
      dominantSefirot.push({
        displayName: name,
        activation,
        light: asText(getField(s, 'light')),
        shadowWatch: asText(getField(s, 'shadowWatch')),
        tikkun: asText(getField(s, 'tikkun')),
      });
    }
  }

  return {
    headline: asText(getField(raw, 'headline')),
    workingHypothesis: asText(getField(raw, 'workingHypothesis')),
    processArc: asText(getField(raw, 'processArc')),
    dominantSefirot,
    sessionQuestions: asLines(getField(raw, 'sessionQuestions')),
  };
}

function hasFormativeBriefContent(content: FormativeBriefContent): boolean {
  return Boolean(
    content.headline ||
      content.workingHypothesis ||
      content.processArc ||
      content.dominantSefirot.length ||
      content.sessionQuestions.length,
  );
}

/** Líneas planas para el informe PDF (sin disclaimer; el informe ya tiene aviso profesional). */
export function formatFormativeBriefPdfLines(
  raw: FormativeBrief | Record<string, unknown> | null | undefined,
  emptyFallback = '(sin datos en esta sesión)',
): string[] {
  const content = extractFormativeBriefContent(raw);
  if (!content || !hasFormativeBriefContent(content)) {
    return [emptyFallback];
  }

  const lines: string[] = [];

  if (content.headline) lines.push(content.headline, '');

  if (content.workingHypothesis) {
    lines.push('Hipótesis de trabajo:', content.workingHypothesis, '');
  }

  if (content.processArc) {
    lines.push('Arco de proceso:', content.processArc, '');
  }

  if (content.dominantSefirot.length) {
    lines.push('Focos sefiróticos:');
    for (const s of content.dominantSefirot) {
      const pct =
        s.activation !== null ? `${Math.round(s.activation * 100)}%` : '';
      lines.push(`- ${s.displayName}${pct ? ` (${pct})` : ''}`);
      if (s.light) lines.push(`  Luz: ${s.light}`);
      if (s.shadowWatch) lines.push(`  Sombra: ${s.shadowWatch}`);
      if (s.tikkun) lines.push(`  Tikkun: ${s.tikkun}`);
    }
    lines.push('');
  }

  if (content.sessionQuestions.length) {
    lines.push('Preguntas guía:');
    content.sessionQuestions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
  }

  return lines.length ? lines : [emptyFallback];
}

/** Bloques markdown del cuerpo (sin cabecera de método ni disclaimer). */
export function formatFormativeBriefMarkdownBody(brief: FormativeBrief): string[] {
  const content = extractFormativeBriefContent(brief);
  if (!content) return [];

  const lines: string[] = [];

  if (content.headline) {
    lines.push(content.headline, '');
  }

  if (content.workingHypothesis) {
    lines.push('## Hipótesis de trabajo', content.workingHypothesis, '');
  }

  if (content.processArc) {
    lines.push('## Arco de proceso', content.processArc, '');
  }

  if (content.dominantSefirot.length) {
    lines.push('## Focos sefiróticos');
    content.dominantSefirot.forEach((s, i) => {
      const pct =
        s.activation !== null ? `${Math.round(s.activation * 100)}%` : '—';
      lines.push(
        `${i + 1}. **${s.displayName}** (${pct})`,
        `   - Luz: ${s.light ?? '—'}`,
        `   - Sombra: ${s.shadowWatch ?? '—'}`,
        `   - Tikkun: ${s.tikkun ?? '—'}`,
      );
    });
    lines.push('');
  }

  if (content.sessionQuestions.length) {
    lines.push(
      '## Preguntas guía',
      ...content.sessionQuestions.map((q, i) => `${i + 1}. ${q}`),
    );
  }

  return lines;
}