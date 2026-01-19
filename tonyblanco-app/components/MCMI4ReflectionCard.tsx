'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { X, Sparkles } from 'lucide-react';

const REFLECTION_QUESTIONS = [
  "¿Qué aspectos de tu experiencia vital actual te gustaría explorar con más profundidad?",
  "¿Cuáles son los patrones emocionales o relacionales que notas se repiten en tu vida?",
  "¿Qué valores o principios guían tus decisiones más importantes?",
  "¿Cómo describirías tu relación contigo mismo/a en este momento de tu vida?",
  "¿Qué recursos internos (fortalezas, habilidades, valores) reconoces en ti?",
  "¿Hay experiencias pasadas que sientes que aún influyen en tu presente? ¿Cuáles?",
  "¿Qué esperanzas o intenciones tienes respecto al proceso terapéutico?",
  "Si pudieras comunicarle algo importante a tu terapeuta desde ahora, ¿qué sería?"
];

interface MCMI4ReflectionCardProps {
  onComplete: () => void;
  onDismiss?: () => void;
}

export default function MCMI4ReflectionCard({ onComplete, onDismiss }: MCMI4ReflectionCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 4;
  const totalPages = Math.ceil(REFLECTION_QUESTIONS.length / questionsPerPage);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [`q${index + 1}`]: value
    }));
  };

  const getCurrentPageQuestions = () => {
    const start = currentPage * questionsPerPage;
    const end = start + questionsPerPage;
    return REFLECTION_QUESTIONS.slice(start, end).map((q, idx) => ({
      question: q,
      index: start + idx
    }));
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate all questions answered
      const unanswered = REFLECTION_QUESTIONS.filter((_, i) => !answers[`q${i + 1}`]?.trim());
      if (unanswered.length > 0) {
        setError(`Por favor responde todas las preguntas (${unanswered.length} pendientes)`);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/tests/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          test_module_code: 'mcmi4-reflection',
          input_data: {
            questions: REFLECTION_QUESTIONS,
            answers: answers,
            submitted_at: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${response.status}`);
      }

      // Success - trigger parent callback
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Error al enviar reflexión');
    } finally {
      setLoading(false);
    }
  };

  const answeredCount = Object.keys(answers).filter(k => answers[k]?.trim()).length;
  const progress = (answeredCount / REFLECTION_QUESTIONS.length) * 100;
  const isLastPage = currentPage === totalPages - 1;

  return (
    <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50/50 to-purple-50/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-violet-600" />
            <div>
              <CardTitle>Reflexión Personal MCMI-4</CardTitle>
              <CardDescription>
                Has completado el test. Ahora comparte tus reflexiones personales
              </CardDescription>
            </div>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{answeredCount} de {REFLECTION_QUESTIONS.length} respondidas</span>
            <span>Página {currentPage + 1} de {totalPages}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-violet-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {getCurrentPageQuestions().map(({ question, index }) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium leading-relaxed block">
                {index + 1}. {question}
              </label>
              <Textarea
                value={answers[`q${index + 1}`] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="min-h-[100px] bg-white"
                disabled={loading}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentPage === 0 || loading}
          >
            ← Anterior
          </Button>
          
          {!isLastPage ? (
            <Button
              onClick={handleNext}
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Siguiente →
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || answeredCount < REFLECTION_QUESTIONS.length}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {loading ? 'Enviando...' : 'Completar Reflexión'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
