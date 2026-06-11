import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TherapistSidebar from '@/app/(dashboard)/dashboard/therapist/components/TherapistSidebar';
import LearningAssistantShell from '@/components/learning-center/LearningAssistantShell';
import { LearningCenterView } from '@/components/learning-center/LearningCenterView';
import { getLearningCenterCatalog } from '@/components/learning-center/learning-center-content';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/learn',
}));

vi.mock('@/components/TherapistWorkspace/PanelManagerContext', () => ({
  usePanelManager: () => ({ panels: [], openPanel: vi.fn() }),
}));

vi.mock('@/components/TherapistWorkspace/panelRegistry', () => ({
  toolRegistry: [],
}));

vi.mock('@/lib/api', () => ({
  apiUrl: (path: string) => path,
  getAuthHeaders: () => ({}),
}));

describe('learning center catalog', () => {
  it('expone guías canonicas para el centro de aprendizaje', async () => {
    const catalog = await getLearningCenterCatalog();

    expect(catalog.hero.title).toContain('Aprendizaje');
    expect(catalog.guides.length).toBeGreaterThan(0);
    expect(catalog.guides.map((guide) => guide.slug)).toEqual(
      expect.arrayContaining([
        'primeros-pasos',
        'workspaces-del-terapeuta',
        'modo-hibrido',
        'faq-glosario-novedades',
      ]),
    );
    expect(catalog.faq.title).toBe('FAQ de uso');
    expect(catalog.glossary.title).toBe('Glosario');
    expect(catalog.news.title).toBe('Novedades');
  });
});

describe('learning center view', () => {
  it('renderiza el índice, el buscador y el contenido canónico', async () => {
    const catalog = await getLearningCenterCatalog();

    render(<LearningCenterView catalog={catalog} />);

    expect(
      screen.getByRole('heading', { name: 'Centro de Aprendizaje' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar en el centro de aprendizaje')).toBeInTheDocument();
    expect(screen.getByText('Tour guiado')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'FAQ de uso' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Glosario' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Novedades' })).toBeInTheDocument();
    expect(screen.getByText('Asistente de ayuda de uso')).toBeInTheDocument();
  });
});

describe('learning assistant shell', () => {
  it('muestra respuesta, citas y fallback cuando el grounding es parcial', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        answer: 'Abre la guía desde el índice del Centro de Aprendizaje.',
        citations: [
          {
            title: 'Primeros pasos',
            path: 'docs/learning-center/guides/primeros-pasos.md',
            excerpt: 'Empieza por el índice y el tour.',
          },
        ],
        fallback_guide: {
          title: 'Primeros pasos',
          path: 'docs/learning-center/guides/primeros-pasos.md',
        },
        grounding: 'partial',
        provider: 'groq',
        usage: {
          prompt_tokens: 12,
          completion_tokens: 32,
          total_tokens: 44,
        },
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<LearningAssistantShell />);

    await user.click(screen.getByRole('button', { name: 'Abrir ayuda rápida' }));
    await user.type(screen.getByPlaceholderText('Pregunta cómo usar la app...'), 'Cómo abro una guía?');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText(/Abre la guía desde el índice del Centro de Aprendizaje\./)).toBeInTheDocument();
    expect(screen.getByText('Citas')).toBeInTheDocument();
    expect(screen.getByText('Primeros pasos')).toBeInTheDocument();
    expect(screen.getByText('Fallback')).toBeInTheDocument();
    expect(screen.getByText('grounding: partial')).toBeInTheDocument();
    expect(screen.getByText('provider: groq')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});

describe('therapist sidebar', () => {
  it('muestra el acceso a aprender desde el menú del terapeuta', () => {
    render(<TherapistSidebar />);

    const learnLink = screen.getByRole('link', { name: 'Aprender' });
    expect(learnLink).toBeInTheDocument();
    expect(learnLink).toHaveAttribute('href', '/learn');
  });
});
