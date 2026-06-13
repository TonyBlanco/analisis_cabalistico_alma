import { forwardRef, useImperativeHandle } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PersonalRegistrationPage from '@/app/(public)/register/personal/page';
import type { TurnstileFieldHandle } from '@/components/TurnstileField';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock('@/lib/session', () => ({
  fetchSession: () => Promise.resolve({ isAuthenticated: false, user: null }),
}));

vi.mock('@/lib/auth-state', () => ({
  clearAuthState: vi.fn(),
}));

vi.mock('@/components/AuthGoogleSection', () => ({
  AuthGoogleSection: () => null,
}));

vi.mock('@/components/TurnstileField', () => ({
  TurnstileField: forwardRef<TurnstileFieldHandle>(function MockTurnstileField(_, ref) {
    useImperativeHandle(ref, () => ({
      getToken: () => null,
      reset: vi.fn(),
      isEnforced: () => true,
      isReady: () => false,
    }));
    return <div>Verificación de seguridad cargando</div>;
  }),
}));

describe('PersonalRegistrationPage', () => {
  it('permite intentar el envío y muestra campos obligatorios aunque Turnstile siga cargando', async () => {
    const user = userEvent.setup();
    render(<PersonalRegistrationPage />);

    const submit = screen.getByRole('button', { name: 'Crear cuenta personal' });
    expect(submit).toBeEnabled();

    await user.click(submit);

    expect(screen.getByText('El nombre completo es requerido')).toBeInTheDocument();
    expect(screen.getByText('La fecha de nacimiento es requerida')).toBeInTheDocument();
    expect(screen.getByText('El nombre de usuario es requerido')).toBeInTheDocument();
    expect(screen.getByText('El email es requerido')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
  });
});
