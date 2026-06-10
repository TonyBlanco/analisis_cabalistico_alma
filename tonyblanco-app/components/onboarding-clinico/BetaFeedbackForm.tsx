'use client';

import { type FormEvent, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ClinicalOnboardingApiError,
  type BetaFeedbackCategory,
  type BetaFeedbackSeverity,
  submitBetaFeedback,
} from '@/lib/clinical-onboarding-api';

const categoryOptions: Array<{ value: BetaFeedbackCategory; label: string }> = [
  { value: 'ux', label: 'UX / claridad' },
  { value: 'bug', label: 'Bug o error técnico' },
  { value: 'clinical-copy', label: 'Copy clínico / wording' },
  { value: 'false-positive', label: 'Rail o bloqueo incorrecto' },
  { value: 'missing-feature', label: 'Función que falta' },
  { value: 'other', label: 'Otro' },
];

const severityOptions: Array<{ value: BetaFeedbackSeverity; label: string }> = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
];

interface BetaFeedbackFormProps {
  defaultPageContext?: string;
}

export function BetaFeedbackForm({
  defaultPageContext = '/dashboard/therapist/onboarding-clinico',
}: BetaFeedbackFormProps) {
  const [category, setCategory] = useState<BetaFeedbackCategory>('ux');
  const [severity, setSeverity] = useState<BetaFeedbackSeverity>('medium');
  const [pageContext, setPageContext] = useState(defaultPageContext);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const remainingChars = useMemo(() => Math.max(0, 1000 - message.length), [message.length]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!message.trim()) {
      setError('Escribe un mensaje antes de enviar el feedback.');
      return;
    }

    if (!pageContext.trim()) {
      setError('Indica la página o contexto donde ocurrió.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await submitBetaFeedback({
        category,
        severity,
        message: message.trim(),
        page_context: pageContext.trim(),
      });

      setResult(response.message);

      if (response.status !== 'backend_pending') {
        setMessage('');
      }
    } catch (submitError) {
      setError(resolveFeedbackError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Beta feedback</p>
        <h2 className="text-xl font-semibold text-slate-900">Reporta fricción clínica o técnica</h2>
        <p className="text-sm leading-6 text-slate-600">
          Canal breve para la beta tester médica: bugs, copy clínico, falsos bloqueos y detalles de flujo.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={(event) => void handleSubmit(event)}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="beta-category">Categoría</Label>
            <select
              id="beta-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as BetaFeedbackCategory)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="beta-severity">Severidad</Label>
            <select
              id="beta-severity"
              value={severity}
              onChange={(event) => setSeverity(event.target.value as BetaFeedbackSeverity)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400"
            >
              {severityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="beta-page-context">Página / contexto</Label>
          <Input
            id="beta-page-context"
            value={pageContext}
            onChange={(event) => setPageContext(event.target.value)}
            placeholder="/dashboard/therapist/onboarding-clinico"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="beta-message">Feedback libre</Label>
            <span className="text-xs text-slate-500">{remainingChars} caracteres restantes</span>
          </div>
          <Textarea
            id="beta-message"
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, 1000))}
            rows={6}
            placeholder="Qué intentabas hacer, qué ocurrió, impacto clínico o de flujo, y si puedes reproducirlo."
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{result}</span>
          </div>
        )}

        <div className="flex items-center justify-end">
          <Button type="submit" disabled={submitting}>
            <Send className="h-4 w-4" />
            {submitting ? 'Enviando…' : 'Enviar feedback'}
          </Button>
        </div>
      </form>
    </section>
  );
}

function resolveFeedbackError(error: unknown): string {
  if (error instanceof ClinicalOnboardingApiError) {
    if (error.code === 'message_required') {
      return 'El backend requiere un mensaje no vacío para registrar el feedback.';
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'No se pudo enviar el feedback beta.';
}
