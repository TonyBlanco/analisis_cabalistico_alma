import type {
  AISymbolicContext,
  SymbolicCrossAnalysis,
} from '../../../src/ai/contracts/symbolic-ai-contract';

export type { AISymbolicContext, SymbolicCrossAnalysis };

export interface AISymbolicDraftPayload {
  context: AISymbolicContext;
  crossAnalysis: SymbolicCrossAnalysis;
}
