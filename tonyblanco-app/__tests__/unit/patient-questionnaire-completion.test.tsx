import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PatientQuestionnaireCompletionPanel,
  usePatientQuestionnaireCompletion,
} from '@/components/patient/PatientQuestionnaireCompletion';

const QUESTIONS = ['q1', 'q2', 'q3'];

function QuestionnaireFixture() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const completion = usePatientQuestionnaireCompletion(QUESTIONS, answers);

  return (
    <>
      {QUESTIONS.map((questionId) => (
        <div
          key={questionId}
          {...completion.getQuestionCardProps(questionId)}
          className={completion.getQuestionCardClassName(
            questionId,
            'question-card border border-gray-200'
          )}
        >
          <button type="button" onClick={() => setAnswers((prev) => ({ ...prev, [questionId]: '1' }))}>
            Responder {questionId}
          </button>
        </div>
      ))}
      <PatientQuestionnaireCompletionPanel
        completion={completion}
        submitting={false}
        onSubmit={vi.fn()}
      />
    </>
  );
}

describe('PatientQuestionnaireCompletion', () => {
  it('muestra progreso y mantiene Enviar deshabilitado hasta completar todo', async () => {
    const user = userEvent.setup();
    render(<QuestionnaireFixture />);

    expect(screen.getByText('0 de 3 respondidas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Responder q1' }));

    expect(screen.getByText('1 de 3 respondidas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
  });

  it('al intentar enviar incompleto avisa, resalta y lleva a la primera respuesta pendiente', async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(<QuestionnaireFixture />);

    const submit = screen.getByRole('button', { name: 'Enviar' });
    fireEvent.pointerDown(submit);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Te faltan 3 respuestas para poder enviar.'
    );
    expect(screen.getByTestId('question-card-q1')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('question-card-q1')).toHaveClass('border-red-400');
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledOnce());
  });
});
