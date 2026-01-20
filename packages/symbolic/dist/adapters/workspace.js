export function buildSymbolicContext(input) {
    return {
        patientId: input.patientId ?? null,
        workspaceId: input.workspaceId ?? null,
        sessionId: input.sessionId ?? null,
        source: input.source ?? null,
    };
}
