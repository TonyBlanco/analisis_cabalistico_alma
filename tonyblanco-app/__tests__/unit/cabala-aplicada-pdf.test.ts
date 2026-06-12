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
      formativa: true,
    });
  });

  it('respeta flags explícitos', () => {
    const inc = normalizeInclude({ estructurales: false, ia: true });
    expect(inc.estructurales).toBe(false);
    expect(inc.ia).toBe(true);
    expect(inc.metodo).toBe(true);
  });

  it('formativa es true por defecto y se puede desactivar', () => {
    expect(normalizeInclude(undefined).formativa).toBe(true);
    expect(normalizeInclude({ formativa: false }).formativa).toBe(false);
    expect(normalizeInclude({ formativa: true }).formativa).toBe(true);
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

  it('incluye Síntesis formativa con brief completo', () => {
    const brief = {
      headline: 'Titular de prueba',
      workingHypothesis: 'Hipótesis de trabajo',
      processArc: 'Arco del proceso',
      dominantSefirot: [
        {
          displayName: 'Keter',
          activation: 0.85,
          light: 'Conciencia pura',
          shadowWatch: 'Disociación',
          tikkun: 'Encarnación',
        },
        {
          displayName: 'Tiferet',
          activation: 0.6,
          light: 'Armonía',
          shadowWatch: 'Abandono',
          tikkun: 'Centro',
        },
      ],
      sessionQuestions: ['¿Qué necesitas integrar?', '¿Qué resistes?'],
    };

    const sections = buildReportSections({
      patientName: 'Prueba',
      formativeBrief: brief as Record<string, unknown>,
    });

    const formativa = sections.find((s) => s.title === 'Síntesis formativa');
    expect(formativa).toBeTruthy();
    const text = formativa!.lines.join('\n');

    expect(text).toContain('Titular de prueba');
    expect(text).toContain('Hipótesis de trabajo');
    expect(text).toContain('Arco del proceso');
    expect(text).toContain('Keter (85%)');
    expect(text).toContain('Luz: Conciencia pura');
    expect(text).toContain('Sombra: Disociación');
    expect(text).toContain('Tikkun: Encarnación');
    expect(text).toContain('Tiferet (60%)');
    expect(text).toContain('1. ¿Qué necesitas integrar?');
    expect(text).toContain('2. ¿Qué resistes?');
  });

  it('omite Síntesis formativa cuando include.formativa === false', () => {
    const sections = buildReportSections({
      patientName: 'T',
      include: { formativa: false },
      formativeBrief: { headline: 'X', workingHypothesis: 'Y', processArc: 'Z', dominantSefirot: [], sessionQuestions: [] },
    });
    expect(sections.find((s) => s.title === 'Síntesis formativa')).toBeFalsy();
  });

  it('muestra (sin datos) en Síntesis formativa cuando no hay brief', () => {
    const sections = buildReportSections({ patientName: 'T' });
    const formativa = sections.find((s) => s.title === 'Síntesis formativa');
    expect(formativa).toBeTruthy();
    expect(formativa!.lines.join('\n')).toContain('(sin datos en esta sesión)');
  });

  it('muestra (sin datos) en Síntesis formativa cuando el brief es null', () => {
    const sections = buildReportSections({ patientName: 'T', formativeBrief: null });
    const formativa = sections.find((s) => s.title === 'Síntesis formativa');
    expect(formativa!.lines.join('\n')).toContain('(sin datos en esta sesión)');
  });
});
