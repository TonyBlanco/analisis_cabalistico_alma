import type { BotaIdentity } from './botaIdentityResolver';
export type BotaPositionMeaningInput = {
    identity: BotaIdentity;
    positionId?: string | null;
    positionLabel?: string | null;
};
export declare function buildBotaPositionMeaning(input: BotaPositionMeaningInput): string | null;
//# sourceMappingURL=positionInterpreter.d.ts.map