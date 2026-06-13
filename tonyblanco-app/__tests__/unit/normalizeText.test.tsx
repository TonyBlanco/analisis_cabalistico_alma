import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { asText } from '@/lib/normalizeText';
import ReadableResult from '@/components/test-results/ReadableResult';

describe('asText', () => {
  it('returns strings unchanged', () => {
    expect(asText('Meditar en Binah')).toBe('Meditar en Binah');
  });

  it('extracts texto from symbolic suggestion objects', () => {
    expect(asText({ texto: 'Explorar la memoria ancestral', sefira: 'Binah' })).toBe(
      'Explorar la memoria ancestral'
    );
  });

  it('falls back to text, titulo, label, descripcion, sugerencia', () => {
    expect(asText({ text: 'Fortaleza A' })).toBe('Fortaleza A');
    expect(asText({ label: 'Enfoque B' })).toBe('Enfoque B');
    expect(asText({ sugerencia: 'Respirar con intención' })).toBe('Respirar con intención');
  });

  it('does not return [object Object] for plain objects', () => {
    const out = asText({ texto: 'Legible', sefira: 'Chesed' });
    expect(out).not.toBe('[object Object]');
    expect(out).toBe('Legible');
  });
});

describe('ReadableResult — object list items (clientFacing)', () => {
  it('renders symbolic suggestions as readable text, not [object Object]', () => {
    render(
      <ReadableResult
        testName="Vidas Pasadas"
        testCode="past-lives"
        clientFacing
        isTherapist={false}
        resultData={{
          recomendaciones: [
            { texto: 'Registrar sueños recurrentes', sefira: 'Yesod' },
            { texto: 'Ritual de cierre con intención', sefira: 'Malkuth' },
          ],
          interpretacion: {
            fortalezas: [{ text: 'Memoria simbólica activa' }],
            areas_enfoque: [{ label: 'Integrar huellas del pasado' }],
          },
        }}
      />
    );

    expect(screen.getByText(/Registrar sueños recurrentes/)).toBeInTheDocument();
    expect(screen.getByText(/Ritual de cierre con intención/)).toBeInTheDocument();
    expect(screen.getByText('Memoria simbólica activa')).toBeInTheDocument();
    expect(screen.getByText('Integrar huellas del pasado')).toBeInTheDocument();
    expect(screen.queryByText('[object Object]')).not.toBeInTheDocument();
  });
});