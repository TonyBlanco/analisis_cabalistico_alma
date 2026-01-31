export const bdi2Definition = {
  name: "Inventario de Reflexión Profunda — 21 señales",
  purpose: "Exploración del ánimo, el sentido y la vitalidad (no diagnóstica)",
  target_population: "Adultos y adolescentes mayores",
  execution_mode: "patient_self",
  estimated_time_minutes: "5–10",
  questions: [
    {
      id: "q1",
      text: "Tristeza",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "No me siento triste.",
          "1": "Me siento triste gran parte del tiempo.",
          "2": "Estoy triste todo el tiempo.",
          "3": "Estoy tan triste o infeliz que no puedo soportarlo."
        }
      }
    },
    {
      id: "q2",
      text: "Pesimismo",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "No estoy desalentado respecto al futuro.",
          "1": "Me siento más desalentado sobre el futuro que antes.",
          "2": "No espero que las cosas funcionen para mí.",
          "3": "Siento que el futuro es desesperanzador y que las cosas no mejorarán."
        }
      }
    },
    {
      id: "q3",
      text: "Fracaso",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "No me siento como un fracasado.",
          "1": "He fracasado más de lo que debería.",
          "2": "Cuando miro hacia atrás, veo muchos fracasos.",
          "3": "Siento que he fracasado completamente como persona."
        }
      }
    },
    {
      id: "q4",
      text: "Pérdida de placer",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Obtengo tanto placer como antes de las cosas que disfruto.",
          "1": "No disfruto las cosas tanto como solía hacerlo.",
          "2": "Obtengo muy poco placer de las cosas que solía disfrutar.",
          "3": "No puedo sentir placer en absoluto."
        }
      }
    },
    {
      id: "q5",
      text: "Sentimientos de culpa",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "No me siento particularmente culpable.",
          "1": "Me siento culpable parte del tiempo.",
          "2": "Me siento culpable la mayor parte del tiempo.",
          "3": "Me siento culpable todo el tiempo."
        }
      }
    },
    {
      id: "q6",
      text: "Sentimientos de castigo",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "No siento que esté siendo castigado.",
          "1": "Siento que podría ser castigado.",
          "2": "Espero ser castigado.",
          "3": "Siento que estoy siendo castigado."
        }
      }
    },
    {
      id: "q7",
      text: "Insatisfacción con uno mismo",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Me siento igual que antes acerca de mí mismo.",
          "1": "He perdido la confianza en mí mismo.",
          "2": "Estoy decepcionado conmigo mismo.",
          "3": "No me gusto a mí mismo."
        }
      }
    },
    {
      id: "q8",
      text: "Autocrítica",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "No me critico ni me culpo más de lo habitual.",
          "1": "Me critico más de lo habitual.",
          "2": "Me culpo por muchos de mis errores.",
          "3": "Me culpo por todo lo malo que sucede."
        }
      }
    },
    {
      id: "q9",
      text: "Pensamientos o deseos suicidas",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "No tengo pensamientos de hacerme daño.",
          "1": "He tenido pensamientos de hacerme daño, pero no lo haría.",
          "2": "Querría hacerme daño.",
          "3": "Me haría daño si tuviera la oportunidad."
        }
      }
    },
    {
      id: "q10",
      text: "Llanto",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "No lloro más de lo habitual.",
          "1": "Lloro más que antes.",
          "2": "Lloro por cualquier cosa.",
          "3": "Quiero llorar pero no puedo."
        }
      }
    },
    {
      id: "q11",
      text: "Agitación",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "No estoy más inquieto o tenso que lo habitual.",
          "1": "Me siento más inquieto o tenso que antes.",
          "2": "Estoy tan inquieto o agitado que me cuesta quedarme quieto.",
          "3": "Estoy tan inquieto que tengo que estar en movimiento todo el tiempo."
        }
      }
    },
    {
      id: "q12",
      text: "Pérdida de interés",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "No he perdido interés en otras actividades o personas.",
          "1": "Me interesan menos otras actividades o personas que antes.",
          "2": "He perdido la mayor parte de mi interés en otras personas o cosas.",
          "3": "Es difícil interesarme por algo."
        }
      }
    },
    {
      id: "q13",
      text: "Indecisión",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Tomo decisiones tan bien como antes.",
          "1": "Me resulta más difícil tomar decisiones que antes.",
          "2": "Me cuesta mucho más tomar decisiones que antes.",
          "3": "Tengo dificultades para tomar cualquier decisión."
        }
      }
    },
    {
      id: "q14",
      text: "Desvalorización",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "No siento que no valgo nada.",
          "1": "No me considero tan valioso y útil como antes.",
          "2": "Me siento menos valioso comparado con otros.",
          "3": "Siento que no valgo nada."
        }
      }
    },
    {
      id: "q15",
      text: "Pérdida de energía",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Tengo tanta energía como siempre.",
          "1": "Tengo menos energía que antes.",
          "2": "No tengo suficiente energía para hacer mucho.",
          "3": "No tengo energía para nada."
        }
      }
    },
    {
      id: "q16",
      text: "Cambios en el sueño",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Duermo tan bien como de costumbre.",
          "1": "Duermo peor que antes.",
          "2": "Duermo mucho menos o me despierto varias horas antes de lo habitual.",
          "3": "Duermo mucho más de lo habitual o apenas puedo dormir."
        }
      }
    },
    {
      id: "q17",
      text: "Irritabilidad",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "No estoy más irritable que lo habitual.",
          "1": "Estoy más irritable que antes.",
          "2": "Estoy mucho más irritable que antes.",
          "3": "Estoy irritado todo el tiempo."
        }
      }
    },
    {
      id: "q18",
      text: "Cambios en el apetito",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Mi apetito no ha cambiado.",
          "1": "Mi apetito es un poco menor o mayor que antes.",
          "2": "Mi apetito es mucho menor o mucho mayor que antes.",
          "3": "No tengo apetito o quiero comer todo el tiempo."
        }
      }
    },
    {
      id: "q19",
      text: "Dificultad de concentración",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "Puedo concentrarme tan bien como de costumbre.",
          "1": "No puedo concentrarme tan bien como antes.",
          "2": "Me cuesta mantener la mente en algo por mucho tiempo.",
          "3": "Encuentro muy difícil concentrarme en algo."
        }
      }
    },
    {
      id: "q20",
      text: "Cansancio o fatiga",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "No estoy más cansado que de costumbre.",
          "1": "Me canso más fácilmente que antes.",
          "2": "Estoy demasiado cansado para hacer muchas cosas que solía hacer.",
          "3": "Estoy demasiado cansado para hacer casi nada."
        }
      }
    },
    {
      id: "q21",
      text: "Pérdida de interés en el sexo",
      scale: {
        min: 0,
        max: 3,
        labels: {
          "0": "No he notado ningún cambio reciente en mi interés por el sexo.",
          "1": "Estoy menos interesado en el sexo de lo que solía estar.",
          "2": "Estoy mucho menos interesado en el sexo ahora.",
          "3": "He perdido completamente el interés en el sexo."
        }
      }
    }
  ],
  clinical_notes: [
    "Instrumento de severidad, no diagnóstico.",
    "Útil para evaluación inicial y seguimiento.",
    "Interpretar junto con juicio clínico.",
    "Atención especial a ítems de ideación suicida (p. ej., ítem 9)."
  ]
} as const;
