import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist';

describe('OnboardingChecklist', () => {
  it('muestra pasos pendientes y permite descartar', () => {
    const onDismiss = vi.fn();

    render(
      <OnboardingChecklist
        steps={[
          { id: 'profile', done: false },
          { id: 'patient', done: true },
          { id: 'tree_analysis', done: false },
          { id: 'learning', done: false },
        ]}
        pendingCount={3}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByRole('heading', { name: /configura tu espacio/i })).toBeInTheDocument();
    expect(screen.getByText(/1 de 4 completados/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ir a mi cuenta/i })).toHaveAttribute(
      'href',
      '/dashboard/account',
    );
    expect(screen.queryByRole('link', { name: /crear consultante/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /descartar checklist/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});