/**
 * Symbolic Interpreter — AI-Assisted Symbolic Reading Module
 *
 * SAFETY-FIRST ARCHITECTURE:
 * - Reads ONLY TreeStructuralState (immutable)
 * - NO access to personal data
 * - NO clinical conclusions
 * - Content filtering for prohibited terms
 * - Educational and formative language only
 */
import type { SymbolicInterpretation, SymbolicInterpretationRequest } from './symbolic-interpreter.types';
import type { TreeStructuralState } from './tree-structural-state.types';
/**
 * Main function: Generate AI-assisted symbolic interpretation
 *
 * @param request - Interpretation request with TreeStructuralState
 * @param aiCallback - Async function that calls AI API (injected)
 * @returns SymbolicInterpretation with observations
 */
export declare function generateSymbolicInterpretation(request: SymbolicInterpretationRequest, aiCallback: (prompt: string) => Promise<string>): Promise<SymbolicInterpretation>;
/**
 * Validates TreeStructuralState before interpretation
 * Ensures no personal data leakage
 */
export declare function validateTreeStateForInterpretation(treeState: TreeStructuralState): {
    valid: boolean;
    errors: string[];
};
/**
 * Creates a fallback interpretation when AI fails
 * Follows same 4-observation structure as AI-generated interpretations
 */
export declare function createFallbackInterpretation(treeState: TreeStructuralState): SymbolicInterpretation;
//# sourceMappingURL=symbolic-interpreter.d.ts.map