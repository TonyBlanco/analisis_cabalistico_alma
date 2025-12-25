export type WellnessQuestion = {
  id: string;
  text: string;
};

export const wellnessDefinition = {
  code: 'wellness',
  name: 'Wellness Assessment',
  purpose: 'Cuestionario interno orientativo de bienestar integral (no médico)',
  target_population: 'personas adultas',
  estimated_time_minutes: 8,
  scale: {
    min: 0,
    max: 4,
    labels: {
      '0': 'Nunca',
      '1': 'Rara vez',
      '2': 'A veces',
      '3': 'A menudo',
      '4': 'Casi siempre',
    } as Record<string, string>,
  },
  questions: [
    { id: 'w1', text: 'Me dormí con relativa facilidad.' },
    { id: 'w2', text: 'Mi sueño fue reparador.' },
    { id: 'w3', text: 'Mi horario de sueño fue estable.' },

    { id: 'w4', text: 'Tuve energía suficiente para mis actividades cotidianas.' },
    { id: 'w5', text: 'Mi nivel de cansancio fue manejable.' },

    // Reverse-coded in backend: w6, w7, w10
    { id: 'w6', text: 'Me sentí desbordado/a por el estrés.' },
    { id: 'w7', text: 'Me costó calmarme después de una situación difícil.' },
    { id: 'w8', text: 'Pude regular mis emociones cuando lo necesité.' },

    { id: 'w9', text: 'Mi estado de ánimo fue estable la mayor parte del tiempo.' },
    { id: 'w10', text: 'Tuve cambios bruscos de ánimo que me dificultaron el día.' },

    { id: 'w11', text: 'Realicé movimiento físico (caminar, estirar, ejercicio) de forma suficiente para mí.' },
    { id: 'w12', text: 'Mi cuerpo se sintió flexible o menos tenso tras moverme.' },

    { id: 'w13', text: 'Me hidraté de forma adecuada durante el día.' },
    { id: 'w14', text: 'Mis comidas fueron relativamente regulares y nutritivas.' },

    { id: 'w15', text: 'Me sentí conectado/a con otras personas (al menos un momento significativo).' },
    { id: 'w16', text: 'Pude pedir o recibir apoyo cuando lo necesité.' },

    { id: 'w17', text: 'Sentí claridad sobre lo que era importante para mí.' },
    { id: 'w18', text: 'Realicé acciones alineadas con mis valores (aunque sean pequeñas).' },

    { id: 'w19', text: 'Pude estar presente (sin tanta prisa mental) en momentos del día.' },
    { id: 'w20', text: 'Noté señales de mi cuerpo (tensión, respiración, ritmo) con atención.' },

    { id: 'w21', text: 'Me traté con amabilidad cuando algo no salió como esperaba.' },
    { id: 'w22', text: 'Pude reconocer mis logros o esfuerzos, aunque fueran pequeños.' },
  ] as WellnessQuestion[],
};
