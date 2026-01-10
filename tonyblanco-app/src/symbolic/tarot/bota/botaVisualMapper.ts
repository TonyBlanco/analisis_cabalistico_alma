export type BotaVisualStructure = {
  imagePath: string;
  sefirot: string[];
};

/**
 * This repo stores B.O.T.A. snapshots and metadata, but does not ship a canonical
 * B.O.T.A. visual atlas asset bundle. Until assets are introduced, return `null`
 * so UIs can gracefully fall back to text-only rendering.
 */
export function getBotaVisualStructure(_identityId: string): BotaVisualStructure | null {
  return null;
}

