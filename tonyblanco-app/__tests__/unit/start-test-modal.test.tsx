import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StartTestModal from '@/components/StartTestModal';

describe('StartTestModal', () => {
  it('explica con lenguaje claro cómo completar cualquier exploración asignada', () => {
    render(
      <StartTestModal
        open
        testName="Exploración de bienestar"
        description="Una mirada general a cómo te encuentras."
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Exploración de bienestar')).toBeInTheDocument();
    expect(screen.getByText('Una mirada general a cómo te encuentras.')).toBeInTheDocument();
    expect(
      screen.getByText(/Tu terapeuta te ha asignado esta evaluación general/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Hazla con calma, en un momento tranquilo/)).toBeInTheDocument();
    expect(screen.getByText(/Necesitas responder todas las preguntas/)).toBeInTheDocument();
    expect(screen.getByText(/Es posible que tu terapeuta te reenvíe algunos tests/)).toBeInTheDocument();
    expect(screen.getByText(/Tus respuestas se tratarán de forma confidencial/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar exploración' })).toBeInTheDocument();
  });

  it('permite adaptar el texto para una exploración concreta', () => {
    render(
      <StartTestModal
        open
        testName="Exploración breve"
        introCopy={{ estimatedTime: 'Tiempo estimado: unos 5 minutos.' }}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Tiempo estimado: unos 5 minutos.')).toBeInTheDocument();
  });
});
