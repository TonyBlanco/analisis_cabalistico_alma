export const mcmi4SignalDefinition = {
  name: "SWM MCMI-4 SIGNAL",
  purpose: "Captura de señal mínima simbólica",
  target_population: "Consultantes",
  execution_mode: "patient_self",
  estimated_time_minutes: "3–5",
  scale: {
    min: 1,
    max: 5,
    labels: {
      "1": "Muy bajo",
      "2": "Bajo",
      "3": "Medio",
      "4": "Alto",
      "5": "Muy alto"
    }
  },
  questions: [
    { id: "s1", text: "Percibo patrones repetitivos en mi día a día." },
    { id: "s2", text: "Siento que mis elecciones tienen un eco simbólico." },
    { id: "s3", text: "Me resulta fácil reconocer mis ciclos personales." },
    { id: "s4", text: "Identifico señales sutiles que orientan mis decisiones." },
    { id: "s5", text: "Mi energía cambia de forma clara según el contexto." },
    { id: "s6", text: "Me tomo pausas para observar antes de actuar." },
    { id: "s7", text: "Puedo sostener una intención sin dispersarme." },
    { id: "s8", text: "Siento coherencia entre lo que pienso y lo que hago." },
    { id: "s9", text: "Tengo claridad sobre mis límites personales." },
    { id: "s10", text: "Percibo cambios internos antes de que ocurran externamente." },
    { id: "s11", text: "Sostengo mis decisiones aunque el entorno cambie." },
    { id: "s12", text: "Me adapto sin perder mi foco principal." },
    { id: "s13", text: "Identifico con facilidad lo que me desequilibra." },
    { id: "s14", text: "Puedo volver al centro después de una tensión." },
    { id: "s15", text: "Me es natural traducir experiencias en aprendizajes." },
    { id: "s16", text: "Reconozco cuándo necesito silencio o pausa." }
  ]
} as const;
