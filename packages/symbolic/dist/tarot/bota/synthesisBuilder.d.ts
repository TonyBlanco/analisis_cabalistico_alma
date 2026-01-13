import type { BotaIdentity } from './botaIdentityResolver';
export type BotaSynthesisItem = {
    identity: BotaIdentity;
    positionLabel?: string | null;
};
export declare function buildBotaSynthesis(items: BotaSynthesisItem[]): string | null;
//# sourceMappingURL=synthesisBuilder.d.ts.map