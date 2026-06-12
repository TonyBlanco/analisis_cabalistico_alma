import { describe, expect, it } from 'vitest';
import { ejecutarMetodoGematriaStandard } from '@holistica/symbolic/methods/gematria-standard';
import { extractGematriaInterpretacion } from '@/components/CabalAppliedWorkspace/GematriaInterpretacionPanel';

describe('gematria interpretacion wiring', () => {
  it('extractGematriaInterpretacion lee rawData.interpretacion del estado simbólico', () => {
    const estado = ejecutarMetodoGematriaStandard({
      nombreCompleto: 'Test User',
      fechaNacimiento: { dia: 1, mes: 1, anio: 2000 },
    });

    const interpretacion = extractGematriaInterpretacion(estado as Record<string, unknown>);
    expect(interpretacion).not.toBeNull();
    expect(interpretacion?.metodo).toBe('gematria-standard');
    expect(interpretacion?.avisos.length).toBeGreaterThan(0);
    expect(interpretacion?.lecturaNumeros.esencia.valor).toBeGreaterThan(0);
  });

  it('degrada con null si no hay interpretacion', () => {
    expect(extractGematriaInterpretacion(null)).toBeNull();
    expect(extractGematriaInterpretacion({ methodId: 'x' })).toBeNull();
  });
});