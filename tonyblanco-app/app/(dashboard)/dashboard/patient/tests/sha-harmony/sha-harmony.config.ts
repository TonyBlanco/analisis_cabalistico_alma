export interface SHAQuestion {
  id: string;
  text: string;
  dimension: string;
}

export interface SHADefinition {
  code: string;
  name: string;
  purpose: string;
  estimated_time_minutes: number;
  scale: {
    min: number;
    max: number;
    labels: Record<string, string>;
  };
  questions: SHAQuestion[];
}

export const shaHarmonyDefinition: SHADefinition = {
  code: 'sha_harmony',
  name: 'Auditoría de Armonía Sefirótica (SHA)',
  purpose: 'Evaluación holística de armonía interna y resonancia con las esferas sefir óticas',
  estimated_time_minutes: 5,
  scale: {
    min: 1,
    max: 5,
    labels: {
      '1': 'Totalmente en desacuerdo',
      '2': 'En desacuerdo',
      '3': 'Neutral',
      '4': 'De acuerdo',
      '5': 'Totalmente de acuerdo',
    },
  },
  questions: [
    {
      id: 'q1',
      text: 'Me siento conectado/a con mi propósito de vida',
      dimension: 'Keter - Propósito',
    },
    {
      id: 'q2',
      text: 'Tengo claridad sobre mis valores y principios',
      dimension: 'Chokmah - Sabiduría',
    },
    {
      id: 'q3',
      text: 'Comprendo y acepto mis emociones profundas',
      dimension: 'Binah - Entendimiento',
    },
    {
      id: 'q4',
      text: 'Soy generoso/a y compasivo/a conmigo mismo/a y los demás',
      dimension: 'Chesed - Bondad',
    },
    {
      id: 'q5',
      text: 'Tengo límites saludables y sé decir no cuando es necesario',
      dimension: 'Gevurah - Rigor',
    },
    {
      id: 'q6',
      text: 'Me siento equilibrado/a y en armonía conmigo mismo/a',
      dimension: 'Tiferet - Belleza',
    },
    {
      id: 'q7',
      text: 'Tengo energía y vitalidad para afrontar el día',
      dimension: 'Netzach - Victoria',
    },
    {
      id: 'q8',
      text: 'Me expreso con honestidad y autenticidad',
      dimension: 'Hod - Esplendor',
    },
    {
      id: 'q9',
      text: 'Siento que mi vida tiene un flujo natural y creativo',
      dimension: 'Yesod - Fundamento',
    },
    {
      id: 'q10',
      text: 'Me siento arraigado/a y presente en mi cuerpo y realidad',
      dimension: 'Malkuth - Reino',
    },
  ],
};
