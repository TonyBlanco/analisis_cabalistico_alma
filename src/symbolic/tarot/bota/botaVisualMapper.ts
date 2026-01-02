export interface BotaVisualStructure {
  imagePath: string;
  sefirot: string[];
}

export const BOTA_VISUAL_MAP: Record<string, BotaVisualStructure> = {
  'the-fool': {
    imagePath: '/tarot/0-el-loco.png',
    sefirot: ['Kether', 'Chokmah'],
  },
  'the-magician': {
    imagePath: '/tarot/1-el-mago.png',
    sefirot: ['Kether'],
  },
  'the-high-priestess': {
    imagePath: '/tarot/2-la-suma-sacerdotisa.png',
    sefirot: ['Tipheret'],
  },
  'the-empress': {
    imagePath: '/tarot/3-la-emperatriz-luminosa.png',
    sefirot: ['Binah', 'Chokmah'],
  },
  'the-emperor': {
    imagePath: '/tarot/4-el-emperador.png',
    sefirot: ['Tipheret'],
  },
  'the-hierophant': {
    imagePath: '/tarot/5-el-sumo-sacerdote.png',
    sefirot: ['Chesed'],
  },
  'the-lovers': {
    imagePath: '/tarot/6-los-enamorados.png',
    sefirot: ['Tipheret'],
  },
  'the-chariot': {
    imagePath: '/tarot/7-el-carro.png',
    sefirot: ['Geburah'],
  },
  justice: {
    imagePath: '/tarot/8-la-justicia.png',
    sefirot: ['Geburah', 'Chesed'],
  },
  'the-hermit': {
    imagePath: '/tarot/9-el-ermitano.png',
    sefirot: ['Chesed'],
  },
  'wheel-of-fortune': {
    imagePath: '/tarot/10-la-rueda-de-la-fortuna.png',
    sefirot: ['Chesed'],
  },
  strength: {
    imagePath: '/tarot/11-la-fuerza.png',
    sefirot: ['Geburah'],
  },
  'the-hanged-man': {
    imagePath: '/tarot/12-el-colgado.png',
    sefirot: ['Hod'],
  },
  death: {
    imagePath: '/tarot/13-la-muerte.png',
    sefirot: ['Tipheret'],
  },
  temperance: {
    imagePath: '/tarot/14-la-templanza.png',
    sefirot: ['Yesod'],
  },
  'the-devil': {
    imagePath: '/tarot/15-el-diablo.png',
    sefirot: ['Hod'],
  },
  'the-tower': {
    imagePath: '/tarot/16-la-torre.png',
    sefirot: ['Hod'],
  },
  'the-star': {
    imagePath: '/tarot/17-la-estrella.png',
    sefirot: ['Yesod'],
  },
  'the-moon': {
    imagePath: '/tarot/18-la-luna.png',
    sefirot: ['Yesod'],
  },
  'the-sun': {
    imagePath: '/tarot/19-el-sol.png',
    sefirot: ['Tipheret'],
  },
  judgement: {
    imagePath: '/tarot/20-el-juicio-final.png',
    sefirot: ['Malkuth'],
  },
  'the-world': {
    imagePath: '/tarot/21-el-mundo.png',
    sefirot: ['Malkuth'],
  },
};

function normalizeBotaId(value: string): string {
  return value.trim().toLowerCase().replace(/_/g, '-');
}

export function getBotaVisualStructure(cardId: string): BotaVisualStructure | null {
  if (!cardId) return null;
  const key = normalizeBotaId(cardId);
  return BOTA_VISUAL_MAP[key] ?? null;
}

