import type { BotaArcana } from './ontology';
import { interpretBotaArcana } from './interpreter';

export type BotaEngine = {
  systemId: 'bota';
  interpretArcana: (arcana: BotaArcana) => ReturnType<typeof interpretBotaArcana>;
};

export function createBotaEngine(): BotaEngine {
  return {
    systemId: 'bota',
    interpretArcana: interpretBotaArcana,
  };
}

