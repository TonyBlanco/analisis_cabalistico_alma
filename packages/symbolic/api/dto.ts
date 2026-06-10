/**
 * Symbolic API v1 — frozen read-only DTO contract (BFF ↔ frontend).
 * No personal data. Structural-symbolic payloads only.
 */

import type { SystemId } from '../correspondences/system';
import type { TreeStructuralState } from '../tree/tree-structural-state.types';
import type { TreeStructuralAnalysis } from '../tree/tree-analysis.types';
import type {
  SymbolicInterpretation,
  SymbolicSafetyLevel,
} from '../tree/symbolic-interpreter.types';
import type { SafetyRole } from '../tree/clinical-lexicon';
import type { SefirahCorrespondence, PathCorrespondence } from '../correspondences/types';
import type { TraditionalSefirahData } from '../kabbalah-traditional/traditional-correspondences.types';
import type { SeferYetzirahLetter } from '../kabbalah-traditional/sefer-yetzirah';

export const SYMBOLIC_API_VERSION = 'v1' as const;

export type SymbolicApiVersion = typeof SYMBOLIC_API_VERSION;

export interface SymbolicApiEnvelope<T> {
  version: SymbolicApiVersion;
  timestamp: string;
  data: T;
}

export interface AnalyzeRequestV1 {
  treeState: TreeStructuralState;
}

export interface AnalyzeResponseV1 {
  treeState: TreeStructuralState;
  analysis: TreeStructuralAnalysis;
}

export type CorrespondenceSefirahDataV1 =
  | SefirahCorrespondence
  | TraditionalSefirahData;

export type CorrespondencePathDataV1 =
  | PathCorrespondence
  | SeferYetzirahLetter;

export interface CorrespondenceEntryV1<T> {
  id: string;
  data: T;
}

export interface CorrespondencesResponseV1 {
  systemId: SystemId;
  sefirot: CorrespondenceEntryV1<CorrespondenceSefirahDataV1>[];
  paths: CorrespondenceEntryV1<CorrespondencePathDataV1>[];
}

export interface InterpretRequestV1 {
  treeState: TreeStructuralState;
  safetyLevel: SymbolicSafetyLevel;
  correspondenceSystem?: SystemId;
  /** SWM v3: explicit consent required before AI interpretation. */
  swmV3Consent: boolean;
  focusAreas?: string[];
}

export interface InterpretResponseV1 {
  interpretation: SymbolicInterpretation;
  analysis: TreeStructuralAnalysis;
  correspondenceSystem: SystemId;
  /**
   * Safety role applied to this interpretation, resolved server-side from the
   * Django profile (UserProfile.clinical_mode_enabled). Display-only for the UI;
   * the authoritative gate is enforced on the server. Defaults to 'observational'.
   */
  role?: SafetyRole;
}
