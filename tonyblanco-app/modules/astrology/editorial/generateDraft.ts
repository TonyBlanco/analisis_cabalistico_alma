import type { AstrologyMethod } from '@/lib/astrologyMethods';
import templates from '../../../editorial_templates/index';

export type EditorialInput = {
  analysis_result: any;
  planet_points: Array<{ name: string; degree: number; sign?: string }>;
  asteroid_points?: Array<{ key: string; degree: number; sign?: string }>;
  dominant_aspects?: any[];
  method?: AstrologyMethod | null;
  lang?: 'es' | 'en' | 'pt';
  therapist_id?: string;
};

export type EditorialOutput = {
  markdown: string;
  metadata: { usage: 'personal' | 'profesional' | 'educativo'; version: string; signed_by?: string | null; generated_at: string };
};

export function generateDraft(input: EditorialInput): EditorialOutput {
  const lang = input.lang || 'es';
  const t = templates[lang] || templates['es'];

  const header = `${t.title}\n\n`;
  const disclaimer = `> Lectura simbólica basada en astrología psicológica. No constituye diagnóstico ni evaluación clínica.`;

  const sections: string[] = [];
  sections.push(`## ${t.sections.archetypes}\n`);
  sections.push(input.planet_points.slice(0,5).map(p => `- **${p.name}**: ${p.sign || Math.round(p.degree)}°`).join('\n'));

  sections.push(`\n## ${t.sections.solar_lunar}\n`);
  sections.push('- Dinámica Sol–Luna: sintetizar...');

  if (input.asteroid_points && input.asteroid_points.length) {
    sections.push(`\n## ${t.sections.asteroids}\n`);
    sections.push(input.asteroid_points.map(a => `- **${a.key}**: ${a.sign || Math.round(a.degree)}°`).join('\n'));
  }

  sections.push(`\n## ${t.sections.method_notes}\n`);
  sections.push(`Método: ${input.method ? input.method.name : 'Carta Natal'}`);

  const md = [header, disclaimer, '\n', ...sections].join('\n\n');

  const metadata = { usage: 'personal' as const, version: 'v1.0', signed_by: input.therapist_id || null, generated_at: new Date().toISOString() };

  return { markdown: md, metadata };
}

export default { generateDraft };
