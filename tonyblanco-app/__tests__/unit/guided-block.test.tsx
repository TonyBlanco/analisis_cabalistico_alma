import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuidedBlock } from '../../components/ui/guided-block';

// ─── Variant rendering ────────────────────────────────────────────────────────

describe('GuidedBlock — variantes', () => {
  it('missing: renderiza con clase amber', () => {
    const { container } = render(
      <GuidedBlock variant="missing" title="Datos incompletos" description="Faltan campos." />
    );
    expect(container.firstChild).toHaveClass('border-amber-200');
  });

  it('consent: renderiza con clase purple', () => {
    const { container } = render(
      <GuidedBlock variant="consent" title="Consentimiento requerido" description="Debes autorizar." />
    );
    expect(container.firstChild).toHaveClass('border-purple-200');
  });

  it('info: renderiza con clase blue', () => {
    const { container } = render(
      <GuidedBlock variant="info" title="Sin consultante" description="Elige un consultante." />
    );
    expect(container.firstChild).toHaveClass('border-blue-200');
  });

  it('locked: renderiza con clase gray', () => {
    const { container } = render(
      <GuidedBlock variant="locked" title="Acceso restringido" description="Sin acceso." />
    );
    expect(container.firstChild).toHaveClass('border-gray-200');
  });
});

// ─── Role badge ───────────────────────────────────────────────────────────────

describe('GuidedBlock — badge de rol', () => {
  it('muestra "Terapeuta" cuando role=therapist', () => {
    render(
      <GuidedBlock variant="info" role="therapist" title="Test" description="desc" />
    );
    expect(screen.getByText('Terapeuta')).toBeInTheDocument();
  });

  it('muestra "Consultante" cuando role=patient', () => {
    render(
      <GuidedBlock variant="info" role="patient" title="Test" description="desc" />
    );
    expect(screen.getByText('Consultante')).toBeInTheDocument();
  });

  it('muestra "Terapeuta · Consultante" cuando role=both', () => {
    render(
      <GuidedBlock variant="info" role="both" title="Test" description="desc" />
    );
    expect(screen.getByText('Terapeuta · Consultante')).toBeInTheDocument();
  });

  it('no muestra badge si role no se pasa', () => {
    render(
      <GuidedBlock variant="info" title="Test" description="desc" />
    );
    expect(screen.queryByText('Terapeuta')).not.toBeInTheDocument();
    expect(screen.queryByText('Consultante')).not.toBeInTheDocument();
  });
});

// ─── Numbered steps ───────────────────────────────────────────────────────────

describe('GuidedBlock — pasos numerados', () => {
  it('renderiza steps con números cuando compact=false', () => {
    render(
      <GuidedBlock
        variant="info"
        title="Test"
        description="desc"
        steps={[
          { label: 'Paso uno' },
          { label: 'Paso dos' },
          { label: 'Paso tres' },
        ]}
      />
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Paso uno')).toBeInTheDocument();
  });

  it('no renderiza steps cuando compact=true', () => {
    render(
      <GuidedBlock
        variant="info"
        title="Test"
        description="desc"
        compact
        steps={[{ label: 'Paso uno' }]}
      />
    );
    expect(screen.queryByText('Paso uno')).not.toBeInTheDocument();
  });

  it('renderiza descripción del paso si se proporciona', () => {
    render(
      <GuidedBlock
        variant="info"
        title="Test"
        description="desc"
        steps={[{ label: 'Paso', description: 'Detalle del paso' }]}
      />
    );
    expect(screen.getByText('Detalle del paso')).toBeInTheDocument();
  });
});

// ─── Actions ──────────────────────────────────────────────────────────────────

describe('GuidedBlock — acciones', () => {
  it('renderiza botón con texto de la acción', () => {
    const handleClick = vi.fn();
    render(
      <GuidedBlock
        variant="missing"
        title="Test"
        description="desc"
        actions={[{ label: 'Reintentar', onClick: handleClick }]}
      />
    );
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('dispara onClick al hacer clic', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <GuidedBlock
        variant="missing"
        title="Test"
        description="desc"
        actions={[{ label: 'Acción', onClick: handleClick }]}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Acción' }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renderiza enlace cuando action.href está definido', () => {
    render(
      <GuidedBlock
        variant="info"
        title="Test"
        description="desc"
        actions={[{ label: 'Ir a perfil', href: '/dashboard/patients' }]}
      />
    );
    const link = screen.getByRole('link', { name: 'Ir a perfil' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/dashboard/patients');
  });
});

// ─── ARIA / Accesibilidad ─────────────────────────────────────────────────────

describe('GuidedBlock — ARIA y accesibilidad', () => {
  it('tiene role="status" y aria-live="polite"', () => {
    const { container } = render(
      <GuidedBlock variant="info" title="Test" description="desc" />
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute('role', 'status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('el icono tiene aria-hidden="true"', () => {
    const { container } = render(
      <GuidedBlock variant="info" title="Test" description="desc" />
    );
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });

  it('el botón de acción es accesible por teclado (focusable)', () => {
    render(
      <GuidedBlock
        variant="missing"
        title="Test"
        description="desc"
        actions={[{ label: 'Confirmar' }]}
      />
    );
    const btn = screen.getByRole('button', { name: 'Confirmar' });
    expect(btn).toBeVisible();
    expect(btn).not.toHaveAttribute('tabindex', '-1');
  });

  it('título renderiza como h3 semántico', () => {
    render(
      <GuidedBlock variant="info" title="Título de prueba" description="desc" />
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Título de prueba' })).toBeInTheDocument();
  });
});

// ─── Idioma ES ────────────────────────────────────────────────────────────────

describe('GuidedBlock — textos en español', () => {
  it('textos de rol están en español', () => {
    const { rerender } = render(
      <GuidedBlock variant="info" role="therapist" title="T" description="d" />
    );
    expect(screen.getByText('Terapeuta')).toBeInTheDocument();

    rerender(
      <GuidedBlock variant="info" role="patient" title="T" description="d" />
    );
    expect(screen.getByText('Consultante')).toBeInTheDocument();
  });

  it('renderiza título y descripción en ES sin alteración', () => {
    render(
      <GuidedBlock
        variant="missing"
        title="Datos de nacimiento incompletos"
        description="El consultante no tiene fecha de nacimiento registrada."
      />
    );
    expect(screen.getByText('Datos de nacimiento incompletos')).toBeInTheDocument();
    expect(screen.getByText('El consultante no tiene fecha de nacimiento registrada.')).toBeInTheDocument();
  });
});
