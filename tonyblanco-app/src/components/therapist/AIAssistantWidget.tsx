'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2, Copy, Trash2, HelpCircle } from 'lucide-react';
import { getAuthToken } from '@/lib/auth';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'therapist_ai_widget_history_v1';
const REMEMBER_KEY = 'therapist_ai_widget_remember_v1';

function trimToLastTurns(allMessages: Message[], turns: number): Message[] {
  if (turns <= 0) return [];
  let userCount = 0;
  let startIndex = 0;

  for (let i = allMessages.length - 1; i >= 0; i--) {
    if (allMessages[i]?.role === 'user') {
      userCount += 1;
      if (userCount === turns) {
        startIndex = i;
        break;
      }
    }
  }

  if (userCount < turns) return allMessages;
  return allMessages.slice(startIndex);
}

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [rememberHistory, setRememberHistory] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const closeDrawer = () => {
    setIsOpen(false);
    setIsInfoOpen(false);
  };

  useEffect(() => {
    try {
      const pref = localStorage.getItem(REMEMBER_KEY);
      if (pref === '0') {
        setRememberHistory(false);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  useEffect(() => {
    if (!rememberHistory) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const storedMessages = Array.isArray(parsed?.messages) ? parsed.messages : [];
      const normalized: Message[] = storedMessages
        .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m: any) => ({ role: m.role, content: m.content }));
      setMessages(trimToLastTurns(normalized, 10));
    } catch {
      // ignore corrupted storage
    }
  }, [rememberHistory]);

  useEffect(() => {
    try {
      if (!rememberHistory) {
        return;
      }
      const trimmed = trimToLastTurns(messages, 10);
      if (trimmed.length !== messages.length) {
        setMessages(trimmed);
        return;
      }
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ v: 1, messages: trimmed, updatedAt: Date.now() })
      );
    } catch {
      // ignore storage errors
    }
  }, [messages, rememberHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Tu sesión no tiene token activo. Vuelve a iniciar sesión y reintenta.',
          },
        ]);
        return;
      }
      // NEXT_PUBLIC_API_URL already includes /api, so don't duplicate it
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://127.0.0.1:8000';
      const response = await fetch(
        `${baseUrl}/api/ai/holistic-query/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
          body: JSON.stringify({ query: userMessage }),
        }
      );

      if (!response.ok) {
        let backendError = '';
        try {
          const errData = await response.json();
          backendError = errData?.error || errData?.detail || '';
        } catch {
          // ignore
        }
        const statusText = backendError ? `: ${backendError}` : '';
        throw new Error(`Error en la consulta (${response.status})${statusText}`);
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response || 'Sin respuesta' },
      ]);
    } catch (error) {
      console.error('Error querying AI:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error instanceof Error
              ? error.message
              : 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (loading) return;
    setMessages([]);
    setInput('');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const toggleRemember = () => {
    const next = !rememberHistory;
    setRememberHistory(next);
    try {
      localStorage.setItem(REMEMBER_KEY, next ? '1' : '0');
      if (!next) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    if (!next) {
      setMessages([]);
      setInput('');
    }
  };

  const handleCopy = async () => {
    if (messages.length === 0) return;
    const text = messages
      .map((m) => `${m.role === 'user' ? 'TÚ' : 'IA'}: ${m.content}`)
      .join('\n\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const copyMessage = async (content: string, index: number) => {
    if (!content?.trim()) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedMessageIndex(index);
      window.setTimeout(() => setCopiedMessageIndex(null), 1200);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        onClick={() => {
          setIsOpen(true);
          setIsInfoOpen(false);
        }}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all flex items-center justify-center"
        aria-label="Abrir asistente de IA"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </motion.button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 p-6 text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 animate-pulse" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Asistente IA</h2>
                      <p className="text-xs opacity-90">Consulta holística rápida</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsInfoOpen((v) => !v)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        aria-label="Información y privacidad"
                        title="Información"
                      >
                        <HelpCircle className="h-5 w-5" />
                      </button>

                      <AnimatePresence>
                        {isInfoOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-[340px] max-w-[80vw] rounded-xl bg-white text-gray-900 shadow-2xl border border-gray-200 p-4 z-50"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold">Alcance y privacidad</div>
                                <div className="mt-1 text-xs text-gray-600">
                                  Este chat es para consultas dentro del entorno holístico del terapeuta.
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsInfoOpen(false)}
                                className="p-1 rounded hover:bg-gray-100"
                                aria-label="Cerrar información"
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>

                            <div className="mt-3 space-y-2 text-xs text-gray-700">
                              <div>
                                - No está diseñado para diagnóstico; es orientación educativa y operativa.
                              </div>
                              <div>
                                - No se sincroniza ni se guarda en otro destino o workspace.
                              </div>
                              <div>
                                - Al cerrar la sesión o desactivar “Recordar”, se borra lo guardado localmente.
                              </div>
                              <div className="pt-2 border-t border-gray-200 text-xs text-gray-600">
                                Estado actual: {rememberHistory ? 'Recordar ACTIVADO (guarda hasta 10 consultas en este navegador)' : 'Recordar DESACTIVADO (no se guarda historial)'}.
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button
                      type="button"
                      onClick={toggleRemember}
                      className="mr-1 px-2 py-1 rounded-lg hover:bg-white/20 transition-colors"
                      aria-label="Alternar guardar historial"
                      title={rememberHistory ? 'Guardando historial (10)' : 'Sin historial'}
                    >
                      <span className="text-xs">Recordar</span>
                      <span
                        className={`ml-2 inline-flex h-4 w-8 items-center rounded-full border border-white/30 transition-colors ${rememberHistory ? 'bg-white/30' : 'bg-black/20'
                          }`}
                      >
                        <span
                          className={`h-3 w-3 rounded-full bg-white shadow transition-transform ${rememberHistory ? 'translate-x-4' : 'translate-x-1'
                            }`}
                        />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={messages.length === 0}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Copiar conversación"
                      title={copied ? 'Copiado' : 'Copiar'}
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      disabled={messages.length === 0 || loading}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Limpiar conversación"
                      title="Limpiar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={closeDrawer}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      aria-label="Cerrar"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {copied && (
                  <div className="relative mt-3 text-xs text-white/90">
                    Copiado al portapapeles
                  </div>
                )}
                {rememberHistory && (
                  <div className="relative mt-2 text-[11px] text-white/80">
                    Guarda las últimas 10 consultas en este navegador
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">
                      ¿En qué puedo ayudarte?
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Haz una consulta sobre tus pacientes o herramientas
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    <div
                      className={`group relative max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                    >
                      {message.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => copyMessage(message.content, index)}
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
                          aria-label="Copiar respuesta"
                          title={copiedMessageIndex === index ? 'Copiado' : 'Copiar'}
                        >
                          <Copy className="h-4 w-4 text-gray-500" />
                        </button>
                      )}
                      <p className="text-sm whitespace-pre-wrap pr-6">{message.content}</p>
                      {message.role === 'assistant' && copiedMessageIndex === index && (
                        <div className="mt-2 text-xs text-green-700">Copiado</div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="text-sm text-gray-600">Pensando...</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu consulta..."
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
