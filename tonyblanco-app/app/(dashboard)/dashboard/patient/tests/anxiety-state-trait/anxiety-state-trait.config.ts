export type AnxietyStateTraitQuestion = {
  id: string;
  dimension: 'state' | 'trait';
  text: string;
};

/** Must match backend FRONTEND_SELECTED_ITEM_IDS / FRONTEND_FIXED_SEED (stai_bank.py). */
export const anxietyFixedSeed = 20260613;
export const anxietySelectedItemIds = [
  'E_TENS_001',
  'E_TENS_003',
  'E_INQU_001',
  'E_INQU_003',
  'E_SINT_001',
  'E_SINT_003',
  'E_PREO_001',
  'E_PREO_003',
  'E_TENS_005',
  'E_INQU_005',
  'R_PREO_001',
  'R_PREO_003',
  'R_TENS_001',
  'R_TENS_003',
  'R_SINT_001',
  'R_SINT_003',
  'R_INQU_001',
  'R_INQU_003',
  'R_PREO_005',
  'R_TENS_005',
] as const;

export const anxietyStateTraitDefinition = {
  code: 'anxiety-state-trait',
  fixedSeed: anxietyFixedSeed,
  selectedItemIds: anxietySelectedItemIds,
  name: 'Ansiedad — Estado y rasgo',
  purpose: 'Wellness orientativo para explorar cómo se siente la ansiedad hoy y en general.',
  estimated_time_minutes: '6-8',
  scale: {
    labels: {
      '0': 'Nunca',
      '1': 'Rara vez',
      '2': 'A veces',
      '3': 'A menudo',
      '4': 'Casi siempre',
    } as Record<string, string>,
  },
  questions: [
    {
      id: 'anst-state-1',
      dimension: 'state',
      text: 'Me siento tenso/a o en alerta sin razón evidente.',
    },
    {
      id: 'anst-state-2',
      dimension: 'state',
      text: 'Me cuesta relajarme aunque esté en un lugar tranquilo.',
    },
    {
      id: 'anst-state-3',
      dimension: 'state',
      text: 'Mi respiración se vuelve rápida cuando pienso en algo pendiente.',
    },
    {
      id: 'anst-state-4',
      dimension: 'state',
      text: 'Siento que mi corazón se acelera sin que haya peligro real.',
    },
    {
      id: 'anst-state-5',
      dimension: 'state',
      text: 'Mi mente va de un pensamiento inquieto a otro.',
    },
    {
      id: 'anst-state-6',
      dimension: 'state',
      text: 'Me cuesta concentrarme porque estoy pendiente de posibles problemas.',
    },
    {
      id: 'anst-state-7',
      dimension: 'state',
      text: 'Siento una energía nerviosa que me hace moverme sin parar.',
    },
    {
      id: 'anst-state-8',
      dimension: 'state',
      text: 'Cuando intento descansar, reaparecen pensamientos ansiosos.',
    },
    {
      id: 'anst-state-9',
      dimension: 'state',
      text: 'Percibo una urgencia por resolver algo, aunque no sea urgente.',
    },
    {
      id: 'anst-state-10',
      dimension: 'state',
      text: 'Siento inquietud incluso sin demandas externas claras.',
    },
    {
      id: 'anst-trait-1',
      dimension: 'trait',
      text: 'Suelo anticipar lo peor antes de que suceda algo.',
    },
    {
      id: 'anst-trait-2',
      dimension: 'trait',
      text: 'Mis amigos me ven como alguien que se preocupa con facilidad.',
    },
    {
      id: 'anst-trait-3',
      dimension: 'trait',
      text: 'En general, me cuesta relajarme aunque las cosas vayan bien.',
    },
    {
      id: 'anst-trait-4',
      dimension: 'trait',
      text: 'Me resulta difícil confiar en que todo se resolverá.',
    },
    {
      id: 'anst-trait-5',
      dimension: 'trait',
      text: 'Tengo una sensación constante de estar en guardia.',
    },
    {
      id: 'anst-trait-6',
      dimension: 'trait',
      text: 'Evito ciertas situaciones por miedo a perder el control.',
    },
    {
      id: 'anst-trait-7',
      dimension: 'trait',
      text: 'Tiende a preocuparme lo que otros piensen de mí.',
    },
    {
      id: 'anst-trait-8',
      dimension: 'trait',
      text: 'Me doy vueltas en la cabeza por errores pasados.',
    },
    {
      id: 'anst-trait-9',
      dimension: 'trait',
      text: 'Tengo la costumbre de prepararme para todos los escenarios posibles.',
    },
    {
      id: 'anst-trait-10',
      dimension: 'trait',
      text: 'Vivo con una inquietud de fondo aun cuando todo parezca estable.',
    },
  ] as AnxietyStateTraitQuestion[],
} as const;
