'use client';

import { AlertCircle, Cpu, RefreshCw } from 'lucide-react';
import type { TherapistAIUsageSummary } from '@/lib/types/ai-usage';

const TASK_LABELS: Record<string, string> = {
  'astrology.natal': 'Astrología — natal',
  'astrology.transits': 'Astrología — tránsitos',
  'astrology.progressions': 'Astrología — progresiones',
  'astrology.solar_return': 'Astrología — retorno solar',
  'astrology.situation': 'Astrología — situación',
  'astrology.psychological': 'Astrología — psicológico',
  'astrology.snippet': 'Astrología — snippets',
  'holistic.therapist_plan': 'Plan holístico',
  'holistic.synthesis': 'Síntesis MSHE',
  'tarot.holistic_card': 'Tarot — carta',
  'tarot.holistic_spread': 'Tarot — tirada',
  'swm_v3.symbolic_reading': 'SWM v3',
  'ai.holistic_query': 'Asistente IA',
  'ai.kabbalah_interpret': 'Cábala',
  'bioemotional.assist_draft': 'Bioemocional',
  'symbolic.tree_interpret': 'Árbol simbólico',
};

function formatEur(value: string): string {
  const n = Number.parseFloat(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
}

function formatPeriod(period: string): string {
  const [y, m] = period.split('-');
  const date = new Date(Number(y), Number(m) - 1);
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

function taskLabel(taskType: string): string {
  return TASK_LABELS[taskType] ?? taskType.replace(/\./g, ' · ');
}

interface TherapistAIUsagePanelProps {
  usage: TherapistAIUsageSummary;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function TherapistAIUsagePanel({
  usage,
  onRefresh,
  refreshing = false,
}: TherapistAIUsagePanelProps) {
  const included = Number.parseFloat(usage.included_credit_eur) || 0;
  const consumed = Number.parseFloat(usage.consumed_eur) || 0;
  const remaining = Number.parseFloat(usage.remaining_eur) || 0;
  const overage = Number.parseFloat(usage.overage_eur) || 0;
  const pct = included > 0 ? Math.min(100, (consumed / included) * 100) : 0;
  const isNearLimit = pct >= 80 && overage === 0;
  const isOver = overage > 0;

  const barColor = isOver
    ? 'bg-red-500'
    : isNearLimit
      ? 'bg-amber-500'
      : 'bg-indigo-500';

  const topTasks = Object.entries(usage.by_task_type)
    .sort((a, b) => Number.parseFloat(b[1].cost_eur) - Number.parseFloat(a[1].cost_eur))
    .slice(0, 5);

  return (
    <section
      className="rounded-xl border border-gray-200 bg-white shadow-sm"
      aria-label="Consumo de IA del mes"
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold text-gray-900">Consumo IA</h2>
            <p className="text-xs text-gray-500 capitalize">{formatPeriod(usage.billing_period)}</p>
          </div>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            aria-label="Actualizar consumo IA"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        )}
      </div>

      <div className="space-y-5 p-6">
        <div>
          <div className="mb-2 flex items-end justify-between text-sm">
            <span className="text-gray-600">
              {formatEur(usage.consumed_eur)} de {formatEur(usage.included_credit_eur)} incluidos
            </span>
            <span className="font-medium text-gray-900">{pct.toFixed(0)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Porcentaje de crédito IA consumido"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Restante" value={formatEur(usage.remaining_eur)} highlight={!isOver} />
          <Stat label="Overage" value={formatEur(usage.overage_eur)} highlight={isOver} warn={isOver} />
          <Stat label="Tokens" value={usage.total_tokens.toLocaleString('es-ES')} />
          <Stat label="Llamadas" value={String(usage.event_count)} />
        </div>

        {isOver && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Has superado el crédito incluido ({formatEur(String(overage))} de overage este mes).
              {usage.metering_enforced
                ? ' Algunas funciones IA pueden bloquearse hasta renovar créditos.'
                : ' Por ahora el uso sigue permitido; el overage se registrará para facturación.'}
            </span>
          </div>
        )}

        {isNearLimit && !isOver && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Quedan {formatEur(String(remaining))} de crédito IA este mes.</span>
          </div>
        )}

        {topTasks.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              Por módulo
            </h3>
            <ul className="space-y-1.5">
              {topTasks.map(([task, stats]) => (
                <li key={task} className="flex items-center justify-between text-sm">
                  <span className="truncate text-gray-700">{taskLabel(task)}</span>
                  <span className="ml-3 shrink-0 tabular-nums text-gray-500">
                    {formatEur(stats.cost_eur)} · {stats.count}×
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  highlight = false,
  warn = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  const valueClass = warn
    ? 'text-red-600'
    : highlight
      ? 'text-emerald-600'
      : 'text-gray-900';

  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-semibold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}