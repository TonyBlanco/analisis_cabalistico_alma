import { describe, it, expect } from 'vitest';
import {
  buildReportSections,
  normalizeInclude,
} from '@/components/CabalAppliedWorkspace/cabalaAplicadaPdf';

describe('normalizeInclude', () => {
  it('activa secciones por defecto y deja IA en false', () => {
    expect(normalizeInclude(undefined)).toEqual({
      tree: true,
      estructurales: true,
      metodo: true,
      actividad: true,
      ia: false,
    });
  });

  it('respeta flags explícitos', () => {
    const inc = normalizeInclude({ estructurales: false, ia: true });
    expect(inc.estructurales).toBe(false);
    expect(inc.ia).toBe(true);
    expect(inc.metodo).toBe(true);
  });
});

describe('buildReportSections', () => {
  it('incluye la interpretación del método con síntesis y utilidad', () => {
    const sections = buildReportSections({
      patientName: 'Test',
      gematriaInterpretacion: {
        nombreMetodo: 'Notarikon',
        queEs: 'Qué es notarikon',
        sintesis: 'Síntesis de prueba',
        utilidadTerapeutica: 'Ayuda a explorar X',
      },
    });
    const metodo = sections.find((s) => s.title === 'Interpretación del método');
    expect(metodo).toBeTruthy();
    const text = metodo!.lines.join('\n');
    expect(text).toContain('Notarikon');
    expect(text).toContain('Síntesis de prueba');
    expect(text).toContain('Ayuda a explorar X');
  });

  it('lista la actividad pasada respetando el orden', () => {
    const sections = buildReportSections({
      patientName: 'Test',
      activity: [
        { label: 'Notarikon', tipo: 'método', fecha: '2026-06-12T10:00:00Z' },
        { label: 'Snapshot', tipo: 'snapshot', fecha: null },
      ],
    });
    const act = sections.find((s) => s.title === 'Actividad de la sesión');
    expect(act).toBeTruthy();
    expect(act!.lines.length).toBe(2);
    expect(act!.lines.join('\n')).toContain('Notarikon');
    expect(act!.lines.join('\n')).toContain('Snapshot');
  });

  it('omite secciones cuando los flags están en false', () => {
    const sections = buildReportSections({
      patientName: 'Test',
      include: { metodo: false, estructurales: false, actividad: false },
      gematriaInterpretacion: { sintesis: 'x' },
    });
    expect(sections.find((s) => s.title === 'Interpretación del método')).toBeFalsy();
    expect(sections.find((s) => s.title === 'Datos estructurales (export)')).toBeFalsy();
    expect(sections.find((s) => s.title === 'Actividad de la sesión')).toBeFalsy();
  });

  it('incluye la sección IA solo cuando ia=true', () => {
    const without = buildReportSections({ patientName: 'T', interpretationText: 'Texto IA' });
    expect(without.find((s) => s.title === 'Lectura simbólica asistida (IA)')).toBeFalsy();
    const withIa = buildReportSections({
      patientName: 'T',
      interpretationText: 'Texto IA',
      include: { ia: true },
    });
    const ia = withIa.find((s) => s.title === 'Lectura simbólica asistida (IA)');
    expect(ia).toBeTruthy();
    expect(ia!.lines.join('\n')).toContain('Texto IA');
  });

  it('muestra marcador de sin datos cuando no hay interpretación del método', () => {
    const sections = buildReportSections({ patientName: 'T' });
    const metodo = sections.find((s) => s.title === 'Interpretación del método');
    expect(metodo!.lines.join('\n')).toContain('(sin datos en esta sesión)');
  });
});
