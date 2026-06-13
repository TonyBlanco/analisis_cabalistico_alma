import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Gad7Page from '@/app/(dashboard)/dashboard/patient/tests/gad7/page';
import { gad7Definition } from '@/app/(dashboard)/dashboard/patient/tests/gad7/gad7.config';
import ShaHarmonyPage from '@/app/(dashboard)/dashboard/patient/tests/sha-harmony/page';
import { shaHarmonyDefinition } from '@/app/(dashboard)/dashboard/patient/tests/sha-harmony/sha-harmony.config';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/test-api', () => ({
  executeTest: vi.fn(),
}));

function expectIncompleteQuestionnaire(totalQuestions: number, firstQuestionId: string) {
  expect(screen.getByText(`0 de ${totalQuestions} respondidas`)).toBeInTheDocument();

  const submit = screen.getByRole('button', { name: 'Enviar' });
  expect(submit).toBeDisabled();
  fireEvent.pointerDown(submit);

  expect(screen.getByRole('alert')).toHaveTextContent(
    `Te faltan ${totalQuestions} respuestas para poder enviar.`
  );
  expect(screen.getByTestId(`question-card-${firstQuestionId}`)).toHaveClass('border-red-400');
}

describe('patient questionnaires completion wiring', () => {
  it('protege y explica el envío incompleto en GAD-7', () => {
    render(<Gad7Page />);

    expectIncompleteQuestionnaire(gad7Definition.questions.length, gad7Definition.questions[0].id);
  });

  it('protege y explica el envío incompleto en SHA Harmony', () => {
    render(<ShaHarmonyPage />);

    expectIncompleteQuestionnaire(
      shaHarmonyDefinition.questions.length,
      shaHarmonyDefinition.questions[0].id
    );
  });
});
