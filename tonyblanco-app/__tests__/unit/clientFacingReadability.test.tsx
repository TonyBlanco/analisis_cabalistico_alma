import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  formatClientSuggestion,
  assertNoRawClientLeaks,
} from '@/lib/formatClientReading';
import { asText } from '@/lib/normalizeText';
import ReadableResult from '@/components/test-results/ReadableResult';

const STRUCTURED_SUGGESTION = {
  basado_en: 'Esencia 8 (Esplendor/Gloria)',
  categoria: 'Práctica Espiritual',
  sugerencia: 'Estudio intelectual, comunicación efectiva',
};

describe('formatClientSuggestion', () => {
  it('formats { sugerencia, categoria, basado_en } as a warm sentence', () => {
    const out = formatClientSuggestion(STRUCTURED_SUGGESTION);
    expect(out).toContain('Práctica espiritual');
    expect(out).toContain('Estudio intelectual, comunicación efectiva');
    expect(out).toContain('Inspirado en tu Esencia 8 — Esplendor/Gloria');
    expect(out).not.toContain('basado_en');
    expect(out).not.toContain('{');
  });

  it('formats texto + sefira for past-lives style items', () => {
    const out = formatClientSuggestion({ texto: 'Registrar sueños recurrentes', sefira: 'Yesod' });
    expect(out).toContain('Registrar sueños recurrentes');
    expect(out).toContain('Yesod');
    expect(out).not.toContain('[object Object]');
  });
});

describe('asText clientFacing', () => {
  it('never JSON-stringifies unknown objects for patients', () => {
    const out = asText({ foo: 'bar', nested: { x: 1 } }, { clientFacing: true });
    expect(out).not.toContain('{');
    expect(out).not.toContain('foo');
    expect(out.length).toBeGreaterThan(10);
  });
});

describe('ReadableResult — patient-readable suggestions', () => {
  function renderPatientResult(resultData: Record<string, unknown>, testCode = 'past-lives') {
    const view = render(
      <ReadableResult
        testName="Vidas Pasadas"
        testCode={testCode}
        clientFacing
        isTherapist={false}
        resultData={resultData}
      />
    );
    return view.container;
  }

  it('renders past-lives structured suggestions without JSON leaks', () => {
    const container = renderPatientResult({
      recomendaciones: [STRUCTURED_SUGGESTION],
      interpretacion: {
        fortalezas: [{ text: 'Memoria simbólica activa' }],
        areas_enfoque: [{ label: 'Integrar huellas del pasado' }],
      },
    });

    expect(screen.getByText(/Práctica espiritual/i)).toBeInTheDocument();
    expect(screen.getByText(/Estudio intelectual/i)).toBeInTheDocument();
    expect(screen.getByText('Memoria simbólica activa')).toBeInTheDocument();
    expect(screen.getByText('Integrar huellas del pasado')).toBeInTheDocument();
    assertNoRawClientLeaks(container.textContent ?? '');
  });

  it('guard: fails if patient render would leak raw JSON or keys', () => {
    const container = renderPatientResult(
      {
        recomendaciones: [
          STRUCTURED_SUGGESTION,
          {
            basado_en: 'Chesed',
            categoria: 'Cuidado emocional',
            sugerencia: 'Practicar gratitud diaria',
          },
        ],
      },
      'sha-harmony'
    );

    const text = container.textContent ?? '';
    expect(() => assertNoRawClientLeaks(text)).not.toThrow();
    expect(text).not.toContain('[object Object]');
    expect(text).not.toMatch(/\bbasado_en\b/);
  });
});