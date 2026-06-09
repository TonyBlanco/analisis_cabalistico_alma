/**
 * Formative brief safety gate — shared prohibited-term validation.
 * Policy: degrade field to neutral fallback on violation; never emit prohibited terms.
 */

import { SYMBOLIC_INTERPRETER_META } from './symbolic-interpreter.types';
import type { FormativeBrief } from './formative-reading.types';

export interface SafetyValidationResult {
  passed: boolean;
  warnings: string[];
}

export interface FormativeSafetyViolation {
  field: string;
  warnings: string[];
}

/** Same rules as symbolic-interpreter validateSafetyContent (substring, case-insensitive). */
export function validateSafetyContent(content: string): SafetyValidationResult {
  const warnings: string[] = [];
  const lowercaseContent = content.toLowerCase();

  for (const term of SYMBOLIC_INTERPRETER_META.prohibitedTerms) {
    if (lowercaseContent.includes(term.toLowerCase())) {
      warnings.push(`Prohibited term detected: "${term}"`);
    }
  }

  return {
    passed: warnings.length === 0,
    warnings,
  };
}

export const FORMATIVE_SAFE_DISCLAIMER =
  'Lectura formativa y simbólica. No constituye evaluación clínica ni recomendación terapéutica automática. El terapeuta integra con su marco y el relato del consultante.';

const FIELD_FALLBACKS: Record<string, string> = {
  disclaimer: FORMATIVE_SAFE_DISCLAIMER,
  headline: 'Estructura simbólica activa; lectura exploratoria en marco formativo.',
  workingHypothesis:
    'Hipótesis exploratoria: podría explorarse la organización simbólica sin cerrar sentido prematuramente.',
  structuralFocus:
    'Foco estructural disponible; conviene integrar con el relato del consultante en supervisión.',
  processArc: 'Proceso simbólico en elaboración; revisar senderos activos en el árbol.',
  polarityReading: 'Distribución de polaridades mixta; leer cada sendero por separado.',
  coherenceNote: 'Coherencia estructural moderada; evitar forzar una sola narrativa.',
};

const GENERIC_FALLBACK =
  'Observación estructural-simbólica (podría explorarse en sesión con marco formativo).';

export function fallbackForFormativeField(fieldPath: string): string {
  const root = fieldPath.split('[')[0]?.split('.')[0] ?? fieldPath;
  return FIELD_FALLBACKS[root] ?? FIELD_FALLBACKS[fieldPath] ?? GENERIC_FALLBACK;
}

export function sanitizeFormativeField(
  fieldPath: string,
  text: string,
): { text: string; violation: FormativeSafetyViolation | null } {
  const validation = validateSafetyContent(text);
  if (validation.passed) {
    return { text, violation: null };
  }
  return {
    text: fallbackForFormativeField(fieldPath),
    violation: { field: fieldPath, warnings: validation.warnings },
  };
}

export class FormativeBriefSafetyGateError extends Error {
  readonly violations: FormativeSafetyViolation[];

  constructor(violations: FormativeSafetyViolation[]) {
    super(
      `Formative brief safety gate: ${violations.length} field(s) required sanitization: ${violations
        .map((v) => v.field)
        .join(', ')}`,
    );
    this.name = 'FormativeBriefSafetyGateError';
    this.violations = violations;
  }
}

export interface ApplyFormativeSafetyGateOptions {
  /** When true, throws after sanitization so callers/tests can detect degraded fields. Default false. */
  throwOnViolation?: boolean;
}

export function applyFormativeBriefSafetyGate(
  brief: FormativeBrief,
  options: ApplyFormativeSafetyGateOptions = {},
): FormativeBrief {
  const violations: FormativeSafetyViolation[] = [];
  const out = structuredClone(brief) as FormativeBrief;

  const gate = (fieldPath: string, value: string): string => {
    const { text, violation } = sanitizeFormativeField(fieldPath, value);
    if (violation) violations.push(violation);
    return text;
  };

  out.headline = gate('headline', out.headline);
  out.workingHypothesis = gate('workingHypothesis', out.workingHypothesis);
  out.structuralFocus = gate('structuralFocus', out.structuralFocus);
  out.processArc = gate('processArc', out.processArc);
  out.polarityReading = gate('polarityReading', out.polarityReading);
  out.coherenceNote = gate('coherenceNote', out.coherenceNote);
  out.disclaimer = gate('disclaimer', out.disclaimer);

  out.methodBridge = out.methodBridge.map((line, i) => gate(`methodBridge[${i}]`, line));
  out.interventionAngles = out.interventionAngles.map((line, i) =>
    gate(`interventionAngles[${i}]`, line),
  );
  out.transferentialCues = out.transferentialCues.map((line, i) =>
    gate(`transferentialCues[${i}]`, line),
  );
  out.clinicalBridge = out.clinicalBridge.map((line, i) => gate(`clinicalBridge[${i}]`, line));
  out.sessionQuestions = out.sessionQuestions.map((line, i) =>
    gate(`sessionQuestions[${i}]`, line),
  );
  out.supervisionPrompts = out.supervisionPrompts.map((line, i) =>
    gate(`supervisionPrompts[${i}]`, line),
  );

  out.latentGaps = out.latentGaps.map((gap, i) => ({
    ...gap,
    note: gate(`latentGaps[${i}].note`, gap.note),
    displayName: gate(`latentGaps[${i}].displayName`, gap.displayName),
  }));

  out.pillarAxes = out.pillarAxes.map((axis, i) => ({
    ...axis,
    label: gate(`pillarAxes[${i}].label`, axis.label),
    reading: gate(`pillarAxes[${i}].reading`, axis.reading),
    therapeuticAngle: gate(`pillarAxes[${i}].therapeuticAngle`, axis.therapeuticAngle),
  }));
  out.triadAxes = out.triadAxes.map((axis, i) => ({
    ...axis,
    label: gate(`triadAxes[${i}].label`, axis.label),
    reading: gate(`triadAxes[${i}].reading`, axis.reading),
    therapeuticAngle: gate(`triadAxes[${i}].therapeuticAngle`, axis.therapeuticAngle),
  }));
  out.olamAxes = out.olamAxes.map((axis, i) => ({
    ...axis,
    label: gate(`olamAxes[${i}].label`, axis.label),
    reading: gate(`olamAxes[${i}].reading`, axis.reading),
    therapeuticAngle: gate(`olamAxes[${i}].therapeuticAngle`, axis.therapeuticAngle),
  }));

  out.pathProcesses = out.pathProcesses.map((path, i) => ({
    ...path,
    fromLabel: gate(`pathProcesses[${i}].fromLabel`, path.fromLabel),
    toLabel: gate(`pathProcesses[${i}].toLabel`, path.toLabel),
    narrative: gate(`pathProcesses[${i}].narrative`, path.narrative),
    processPhase: gate(`pathProcesses[${i}].processPhase`, path.processPhase),
  }));

  out.dominantSefirot = out.dominantSefirot.map((s, i) => ({
    ...s,
    displayName: gate(`dominantSefirot[${i}].displayName`, s.displayName),
    light: gate(`dominantSefirot[${i}].light`, s.light),
    shadowWatch: gate(`dominantSefirot[${i}].shadowWatch`, s.shadowWatch),
    tikkun: gate(`dominantSefirot[${i}].tikkun`, s.tikkun),
    therapistNote: gate(`dominantSefirot[${i}].therapistNote`, s.therapistNote),
  }));

  if (violations.length > 0 && options.throwOnViolation) {
    throw new FormativeBriefSafetyGateError(violations);
  }

  return out;
}

/** Collect all user-visible text from a brief (for fuzz / lint tests). */
export function collectFormativeBriefTextChunks(brief: FormativeBrief): string[] {
  const chunks: string[] = [
    brief.headline,
    brief.workingHypothesis,
    brief.structuralFocus,
    brief.processArc,
    brief.polarityReading,
    brief.coherenceNote,
    brief.disclaimer,
    ...brief.methodBridge,
    ...brief.interventionAngles,
    ...brief.transferentialCues,
    ...brief.clinicalBridge,
    ...brief.sessionQuestions,
    ...brief.supervisionPrompts,
  ];

  for (const gap of brief.latentGaps) {
    chunks.push(gap.displayName, gap.note);
  }
  for (const axis of [...brief.pillarAxes, ...brief.triadAxes, ...brief.olamAxes]) {
    chunks.push(axis.label, axis.reading, axis.therapeuticAngle);
  }
  for (const path of brief.pathProcesses) {
    chunks.push(path.fromLabel, path.toLabel, path.narrative, path.processPhase);
  }
  for (const s of brief.dominantSefirot) {
    chunks.push(s.displayName, s.light, s.shadowWatch, s.tikkun, s.therapistNote);
  }

  return chunks;
}