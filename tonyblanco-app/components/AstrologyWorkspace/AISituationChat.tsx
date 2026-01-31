'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Loader2,
  AlertCircle,
  Trash2,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api-base';
import { getAuthToken } from '@/lib/auth';

/**
 * AISituationChat - Chat interactivo para consultas astrológicas
 * 
 * Permite al terapeuta hacer preguntas específicas sobre la carta natal
 * del consultante y recibir respuestas contextualizadas del AI.
 * 
 * Fase 2 del proyecto de AI para Astrología.
 */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
  error?: string;
}

interface SuggestedQuestion {
  label: string;
  question: string;
  icon: string;
}

const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    label: 'Relaciones',
    question: '¿Qué indica la carta natal sobre el área de relaciones y vínculos afectivos?',
    icon: '💕',
  },
  {
    label: 'Carrera',
    question: '¿Qué patrones muestra la carta respecto a la vocación y carrera profesional?',
    icon: '💼',
  },
  {
    label: 'Salud',
    question: '¿Qué áreas de bienestar o salud se destacan en la configuración natal?',
    icon: '🏥',
  },
  {
    label: 'Finanzas',
    question: '¿Qué indica la carta sobre recursos materiales y gestión financiera?',
    icon: '💰',
  },
  {
    label: 'Crecimiento',
    question: '¿Cuáles son las principales áreas de crecimiento personal según la carta?',
    icon: '🌱',
  },
  {
    label: 'Desafíos',
    question: '¿Qué desafíos o patrones recurrentes se observan en la carta natal?',
    icon: '⚡',
  },
];

interface Props {
  patientId: string | number | null;
  hasChart: boolean;
  patientName?: string;
}

export default function AISituationChat({ patientId, hasChart, patientName }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Check AI status on mount
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/astrology/ai-status/`, {
          headers: {
            Authorization: `Token ${getAuthToken()}`,
          },
        });
        const data = await response.json();
        setAiEnabled(data.enabled);
      } catch {
        setAiEnabled(false);
      }
    };
    checkAIStatus();
  }, []);

  // Generate unique message ID
  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Send message to API
  const sendMessage = useCallback(
    async (question: string) => {
      if (!patientId || !hasChart || !question.trim() || isLoading) return;

      const trimmedQuestion = question.trim();
      if (trimmedQuestion.length < 10) {
        setError('La pregunta debe tener al menos 10 caracteres');
        return;
      }

      setError(null);
      setInputValue('');

      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: trimmedQuestion,
        timestamp: new Date(),
      };

      // Add placeholder for assistant response
      const assistantMessageId = generateId();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        loading: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);

      try {
        const response = await fetch(`${getApiBaseUrl()}/api/astrology/interpret/situation/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${getAuthToken()}`,
          },
          body: JSON.stringify({
            patient_id: patientId,
            question: trimmedQuestion,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: data.interpretation, loading: false }
                : msg
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    loading: false,
                    error: data.error || 'Error al procesar la consulta',
                  }
                : msg
            )
          );
        }
      } catch (err) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  loading: false,
                  error: 'Error de conexión. Intenta de nuevo.',
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [patientId, hasChart, isLoading]
  );

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  // Copy message to clipboard
  const copyToClipboard = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  // Handle textarea auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Handle enter key (submit on Enter, new line on Shift+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Render: AI not available
  if (aiEnabled === false) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Chat AI no disponible</span>
        </div>
        <p className="mt-2 text-sm text-amber-700">
          El servicio de consultas AI no está configurado.
        </p>
      </div>
    );
  }

  // Render: No chart available
  if (!hasChart) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-2 text-gray-600">
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Consultas Situacionales</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Calcula la carta natal para habilitar las consultas AI.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-emerald-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-emerald-900">Consultas Situacionales</h3>
          <span className="ml-2 text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
            Chat AI
          </span>
          {messages.length > 0 && (
            <span className="ml-1 text-xs text-emerald-700 bg-emerald-200 px-1.5 py-0.5 rounded-full">
              {messages.filter((m) => m.role === 'user').length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-emerald-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-emerald-600" />
        )}
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="border-t border-emerald-200">
          {/* Info banner */}
          <div className="px-4 py-2 bg-emerald-100/50 text-xs text-emerald-700">
            <Sparkles className="inline h-3 w-3 mr-1" />
            Pregunta sobre cualquier aspecto de la carta de{' '}
            <strong>{patientName || 'el consultante'}</strong>
          </div>

          {/* Suggested questions - Show only if no messages */}
          {messages.length === 0 && (
            <div className="p-4 border-b border-emerald-100">
              <p className="text-xs text-emerald-700 mb-2">Preguntas sugeridas:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((sq) => (
                  <button
                    key={sq.label}
                    onClick={() => handleSuggestedQuestion(sq.question)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white border border-emerald-200 rounded-full hover:bg-emerald-100 hover:border-emerald-400 transition-colors disabled:opacity-50"
                  >
                    <span>{sq.icon}</span>
                    <span>{sq.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages area */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-sm text-emerald-600 py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Escribe una pregunta o selecciona una sugerida</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    {msg.loading ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Analizando carta...</span>
                      </div>
                    ) : msg.error ? (
                      <div className="text-red-600 text-sm">
                        <AlertCircle className="inline h-4 w-4 mr-1" />
                        {msg.error}
                      </div>
                    ) : (
                      <>
                        <div
                          className={`text-sm whitespace-pre-wrap ${
                            msg.role === 'user' ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {msg.content}
                        </div>
                        {msg.role === 'assistant' && (
                          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                            <span>{msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                            <button
                              onClick={() => copyToClipboard(msg.id, msg.content)}
                              className="flex items-center gap-1 hover:text-emerald-600"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  Copiado
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  Copiar
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error display */}
          {error && (
            <div className="mx-4 mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              {error}
            </div>
          )}

          {/* Input area */}
          <div className="p-4 border-t border-emerald-100 bg-white/50">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta sobre la carta..."
                disabled={isLoading}
                rows={1}
                className="flex-1 px-3 py-2 border border-emerald-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 text-sm"
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>

            {/* Actions */}
            {messages.length > 0 && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={clearChat}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Limpiar conversación
                </button>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="px-4 py-2 bg-emerald-50 text-xs text-emerald-600 italic">
            * Respuestas orientativas basadas en simbología astrológica. No constituyen diagnóstico.
          </div>
        </div>
      )}
    </div>
  );
}
