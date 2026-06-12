'use client';

import { useMemo } from 'react';
import { GuidedBlock } from '@/components/ui/guided-block';

const AXIS_LABELS: Record<string, string> = {
  identity_purpose: 'Identidad y Propósito',
  emotion_regulation: 'Emoción y Regulación',
  relationships_bonds: 'Relaciones y Vínculos',
  vital_energy: 'Energía Vital y Cuerpo Simbólico',
  cycles_change: 'Ciclos y Procesos de Cambio',
  memory_lineage: 'Memoria y Linaje Transgeneracional',
};

const ALERT_STYLES: Record<string, string> = {
  verde: 'bg-emerald-100 text-emerald-800',
  amarillo: 'bg-yellow-100 text-yellow-800',
  naranja: 'bg-orange-100 text-orange-800',
  rojo: 'bg-red-100 text-red-800',
};

const SOURCE_LABELS: Record<string, string> = {
  kabbalah: 'Cábala',
  numerology: 'Numerología',
  tarot: 'Tarot',
  astrology: 'Astrología',
  transgenerational: 'Transgeneracional',
  biodecoding: 'BioEmocional',
  holistic_screening: 'Screening holístico',
};

interface SynthesisRecord {
  id?: string;
  kind?: string;
  created_at?: string;
  computed_result?: {
    scores?: Record<string, number>;
    color_alerts?: Record<string, string>;
    axis_contributions?: Record<string, Array<{ source?: string }>>;
    metadata?: { total_records?: number };
  } | null;
}

interface HolisticSynthesisCardProps {
  records: SynthesisRecord[];
}

/**
 * Muestra en la ficha del consultante la última Síntesis Holística (MSHE):
 * los 6 ejes con su score ponderado, color de alerta y fuentes que contribuyen.
 */
export default function HolisticSynthesisCard({ records }: HolisticSynthesisCardProps) {
  const latest = useMemo(() => {
    const syntheses = (records || []).filter(
      (r) => r.kind === 'holistic_evaluative_synthesis' && r.computed_result?.scores
    );
    return syntheses.sort((a, b) =>
      String(b.created_at || '').localeCompare(String(a.created_at || ''))
    )[0] || null;
  }, [records]);

  if (!latest) {
    return (
      <GuidedBlock
        variant="info"
        role="therapist"
        title="Sin síntesis holística generada"
        description="El Motor de Síntesis Holística Evaluativa (MSHE) cruza los análisis de Cábala, Tarot, Astrología, Transgeneracional y BioEmocional de este consultante."
        steps={[
          { label: 'Completa al menos un análisis de módulo (Cábala, Tarot, Astrología, Transgeneracional o BioEmocional)' },
          { label: 'Abre el MSHE y genera la síntesis para este consultante' },
        ]}
        actions={[{ label: 'Abrir MSHE', href: '/dashboard/therapist/mshe' }]}
      />
    );
  }

  const scores = latest.computed_result?.scores || {};
  const alerts = latest.computed_result?.color_alerts || {};
  const contributions = latest.computed_result?.axis_contributions || {};

  const sources = new Set<string>();
  Object.values(contributions).forEach((axisContribs) => {
    (axisContribs || []).forEach((c) => {
      if (c?.source) sources.add(c.source);
    });
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Generada: {latest.created_at ? new Date(latest.created_at).toLocaleString('es-ES') : 'N/A'}
          {' · '}
          {latest.computed_result?.metadata?.total_records ?? 0} registros fuente
        </p>
        <a
          href="/dashboard/therapist/mshe"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          Ver en MSHE →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(AXIS_LABELS).map(([axis, label]) => {
          const score = Number(scores[axis] ?? 0);
          const alert = alerts[axis] || 'verde';
          return (
            <div key={axis} className="border border-gray-200 rounded-md p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-900">{label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ALERT_STYLES[alert] || ALERT_STYLES.verde}`}>
                  {score.toFixed(0)}
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {sources.size > 0 && (
        <p className="text-xs text-gray-500">
          Fuentes integradas:{' '}
          {Array.from(sources)
            .map((s) => SOURCE_LABELS[s] || s)
            .join(', ')}
        </p>
      )}
    </div>
  );
}
