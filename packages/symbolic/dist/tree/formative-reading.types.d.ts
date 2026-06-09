import type { SefiraId, SefiraRole } from './tree-structural-state.types';
import type { PillarId, TriadId, OlamId } from './tree-topology';
export interface FormativeMethodNumber {
    label: string;
    value: number;
    weight: number;
    titulo?: string;
    cualidad?: string;
    descripcion?: string;
}
export interface FormativeMethodContext {
    methodId: string;
    methodName?: string;
    primaryNumbers?: FormativeMethodNumber[];
    inclusionDominants?: number[];
    inclusionAbsences?: number[];
}
export interface FormativeSefirahFocus {
    id: SefiraId;
    displayName: string;
    hebrewLabel: string;
    role: SefiraRole;
    activation: number;
    pillar: PillarId;
    triad: TriadId | 'receptacle';
    olam: OlamId;
    light: string;
    shadowWatch: string;
    tikkun: string;
    therapistNote: string;
}
export interface FormativePathProcess {
    pathId: string;
    from: SefiraId;
    to: SefiraId;
    fromLabel: string;
    toLabel: string;
    narrative: string;
    processPhase: string;
    intensity: number;
    polarity: string;
}
export interface FormativeAxisReading {
    id: string;
    label: string;
    weight: number;
    reading: string;
    therapeuticAngle: string;
}
export interface FormativeClinicalContext {
    ritmoState?: string | null;
    mundoPredominante?: string;
    harmonyIndex?: number;
    illuminatedSefirot?: string[];
}
export interface BuildFormativeBriefOptions {
    /**
     * ISO timestamp for UI/audit. Omit for fully deterministic output (empty string).
     * Does not affect symbolic synthesis — only metadata.
     */
    generatedAt?: string;
    /**
     * When true, throws FormativeBriefSafetyGateError if any field required sanitization.
     * Default false: degrade to neutral fallback and return safe brief.
     */
    throwOnSafetyViolation?: boolean;
}
export interface FormativeBrief {
    version: '1.0';
    generatedAt: string;
    methodId: string;
    headline: string;
    workingHypothesis: string;
    structuralFocus: string;
    processArc: string;
    dominantSefirot: FormativeSefirahFocus[];
    latentGaps: Array<{
        id: SefiraId;
        displayName: string;
        note: string;
    }>;
    pillarAxes: FormativeAxisReading[];
    triadAxes: FormativeAxisReading[];
    olamAxes: FormativeAxisReading[];
    polarityReading: string;
    pathProcesses: FormativePathProcess[];
    methodBridge: string[];
    interventionAngles: string[];
    transferentialCues: string[];
    clinicalBridge: string[];
    sessionQuestions: string[];
    supervisionPrompts: string[];
    coherenceNote: string;
    disclaimer: string;
}
//# sourceMappingURL=formative-reading.types.d.ts.map