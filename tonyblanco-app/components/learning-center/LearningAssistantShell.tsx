'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HelpCircle, Sparkles, X } from 'lucide-react';

import { apiUrl, getAuthHeaders } from '@/lib/api';
import { learningCenterCatalogDefinition } from './learning-center-catalog';

type HelpCitation = string | {
  label?: string;
  title?: string;
  path?: string;
  guide?: string;
  href?: string;
  url?: string;
  excerpt?: string;
};

type HelpFallbackGuide = string | {
  title?: string;
  path?: string;
} | null;

type HelpResponse = {
  answer?: string;
  citations?: HelpCitation[];
  fallback_guide?: HelpFallbackGuide;
  grounding?: 'full' | 'partial' | 'none' | string;
  provider?: string;
  usage?: Record<string, unknown> | null;
};

type HelpAssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
  response?: HelpResponse | null;
};

function normalizeCitation(citation: HelpCitation, index: number) {
  if (typeof citation === 'string') {
    return {
      key: `citation-${index}`,
      label: citation,
      href: citation.startsWith('http') ? citation : undefined,
      excerpt: '',
    };
  }

  const href = citation.href || citation.url || citation.guide || undefined;
  const guideHref =
    citation.path?.startsWith('docs/learning-center/guides/')
      ? `/learn#${citation.path.split('/').pop()?.replace(/\.md$/, '')}`
      : undefined;

  return {
    key: `citation-${index}`,
    label: citation.label || citation.title || citation.path || href || guideHref || `Cita ${index + 1}`,
    href: href || guideHref,
    excerpt: citation.excerpt || '',
  };
}

function getFallbackHref(value: HelpFallbackGuide | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value.startsWith('http') || value.startsWith('/') ? value : `/learn#${value}`;
  }

  if (!value.path) {
    return undefined;
  }

  if (value.path.startsWith('docs/learning-center/guides/')) {
    const slug = value.path.split('/').pop()?.replace(/\.md$/, '');
    return slug ? `/learn#${slug}` : undefined;
  }

  return undefined;
}

export default function LearningAssistantShell() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<HelpAssistantMessage[]>([]);

  const suggestedPrompts = learningCenterCatalogDefinition.assistant.quickQuestions;

  const latestAssistantResponse = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'assistant' && message.response),
    [messages],
  );

  const submitQuery = async (event: React.FormEvent) => {
    event.preventDefault();

    const query = input.trim();
    if (!query || loading) {
      return;
    }

    setLoading(true);
    setInput('');
    setMessages((current) => [...current, { role: 'user', content: query }]);

    try {
      const response = await fetch(apiUrl('/help/ask'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          query,
          route: pathname || undefined,
          screen: 'learning-assistant-widget',
          locale: 'es',
        }),
      });

      if (!response.ok) {
        throw new Error(`help-ask failed (${response.status})`);
      }

      const data = (await response.json()) as HelpResponse;
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: data.answer || learningCenterCatalogDefinition.assistant.fallback,
          response: data,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: learningCenterCatalogDefinition.assistant.fallback,
          response: {
            answer: learningCenterCatalogDefinition.assistant.fallback,
            citations: [],
            fallback_guide: {
              title: 'Primeros pasos',
              path: 'docs/learning-center/guides/primeros-pasos.md',
            },
            grounding: 'none',
            provider: 'frontend-fallback',
            usage: {},
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-2xl transition hover:scale-105 hover:bg-slate-800"
        aria-label="Abrir ayuda rápida"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-end bg-slate-950/35 p-4 backdrop-blur-sm sm:items-end sm:justify-end">
          <div className="flex h-[min(84vh,44rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 px-5 py-4 text-white">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sky-200">
                  <Sparkles className="h-4 w-4" />
                  Ayuda de uso
                </div>
                <h2 className="mt-1 text-lg font-semibold">Asistente para la app</h2>
                <p className="mt-1 text-sm text-slate-200">
                  Responde solo sobre navegación, guías y uso de la interfaz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
                aria-label="Cerrar ayuda rápida"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {messages.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  <p className="font-medium text-slate-900">¿Qué quieres hacer?</p>
                  <p className="mt-1">
                    Escribe una pregunta sobre el uso de la app o prueba una de estas sugerencias.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((question) => (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setInput(question.question)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    {question.question}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {messages.map((message, index) => {
                  const isUser = message.role === 'user';
                  const response = message.response;
                  const citations = response?.citations ?? [];
                  const grounding = response?.grounding ?? 'unknown';
                  const fallbackHref = getFallbackHref(response?.fallback_guide);
                  const isPartialOrNone = grounding === 'partial' || grounding === 'none';

                  return (
                    <div key={`${message.role}-${index}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          isUser
                            ? 'bg-slate-950 text-white'
                            : 'border border-slate-200 bg-slate-50 text-slate-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>

                        {!isUser && response && (
                          <div className="mt-3 space-y-3">
                            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                              <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">
                                grounding: {grounding}
                              </span>
                              {response.provider && (
                                <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">
                                  provider: {response.provider}
                                </span>
                              )}
                            </div>

                            {citations.length > 0 && (
                              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                  Citas
                                </p>
                                <ul className="space-y-2">
                                  {citations.map((citation, citationIndex) => {
                                    const normalized = normalizeCitation(citation, citationIndex);
                                    return (
                                      <li key={normalized.key} className="rounded-xl bg-slate-50 px-3 py-2">
                                        {normalized.href ? (
                                          <a
                                            href={normalized.href}
                                            className="text-sm font-medium text-sky-700 underline decoration-sky-200 underline-offset-4 hover:text-sky-900"
                                          >
                                            {normalized.label}
                                          </a>
                                        ) : (
                                          <p className="text-sm font-medium text-slate-900">{normalized.label}</p>
                                        )}
                                        {normalized.excerpt && (
                                          <p className="mt-1 text-xs leading-5 text-slate-600">{normalized.excerpt}</p>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}

                            {isPartialOrNone && (
                              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em]">Fallback</p>
                                <p className="mt-1 text-sm leading-6">
                                  El grounding es parcial o nulo. Usa la guía sugerida para continuar.
                                </p>
                                {fallbackHref && (
                                  <Link
                                    href={fallbackHref}
                                    className="mt-3 inline-flex rounded-full bg-amber-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800"
                                  >
                                    Abrir guía sugerida
                                  </Link>
                                )}
                              </div>
                            )}

                            {response.usage && (
                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-3">
                                {Object.entries(response.usage).map(([key, value]) => (
                                  <div key={key} className="rounded-xl bg-white px-3 py-2">
                                    <span className="block uppercase tracking-[0.18em]">{key}</span>
                                    <span className="block text-sm font-medium text-slate-700">
                                      {typeof value === 'string' || typeof value === 'number' ? value : '—'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Pensando...
                    </div>
                  </div>
                )}

                {latestAssistantResponse?.response?.fallback_guide && !latestAssistantResponse.response.citations?.length && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    No hubo grounding suficiente. Revisa la guía sugerida antes de continuar.
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={submitQuery} className="border-t border-slate-200 bg-white p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Pregunta cómo usar la app..."
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
