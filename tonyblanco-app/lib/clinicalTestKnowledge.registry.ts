export type ClinicalTestKnowledgeEntry = {
  testCode: string;
  title: string;
  purpose: string;
  whatIsIt: string;
  howToInterpret: string[];
  whatToDoNext: string[];
  clinicalNotes: string[];
  disclaimers: string[];
  resources?: Array<{
    title: string;
    url?: string;
    type?: string;
    note?: string;
  }>;
};

export const clinicalTestKnowledgeRegistry: Record<string, ClinicalTestKnowledgeEntry> = {
  "phq-9": {
    testCode: "phq-9",
    title: "Pulso del Ánimo — 9 señales",
    purpose: "Explorar señales de ánimo, energía y enfoque en las últimas dos semanas.",
    whatIsIt:
      "Lectura autoguiada de 9 ítems para observar la frecuencia de señales internas recientes y apoyar una conversación de bienestar.",
    howToInterpret: [
      "Suma total 0–27: intensidad global de señales reportadas (a mayor puntaje, mayor carga percibida).",
      "Revisar el ítem 9 con prioridad: si hay señal de malestar intenso, activar acompañamiento humano y protocolo de seguridad.",
      "Observar la evolución en el tiempo: los cambios de puntaje entre mediciones aportan contexto.",
    ],
    whatToDoNext: [
      "Si el puntaje es alto: abrir conversación guiada (sueño, hábitos, apoyo, eventos recientes, sentido).",
      "Si el ítem 9 > 0: priorizar seguridad, contención y derivación según protocolo interno.",
      "Repetir periódicamente para observar cambios y ajustar el acompañamiento.",
    ],
    clinicalNotes: [
      "Herramienta orientativa para seguimiento; no sustituye acompañamiento profesional.",
      "Interpretar en contexto (funcionamiento diario, entorno, hábitos, apoyo y eventos recientes).",
    ],
    disclaimers: ["Lectura orientativa. No es diagnóstico."],
  },
  "gad-7": {
    testCode: "gad-7",
    title: "Mapa de Preocupación — 7 señales",
    purpose: "Explorar patrones de preocupación, tensión y activación en las últimas dos semanas.",
    whatIsIt:
      "Lectura autoguiada de 7 ítems sobre la frecuencia de señales de preocupación y tensión recientes.",
    howToInterpret: [
      "Suma total 0–21: intensidad global (a mayor puntaje, mayor carga percibida).",
      "Valores altos indican mayor activación y persistencia de la preocupación; leer en contexto.",
      "Observar cambios entre mediciones para ajustar prácticas y acompañamiento.",
    ],
    whatToDoNext: [
      "Si el puntaje es alto: explorar detonantes, hábitos de sueño, respiración, carga diaria y límites.",
      "Revisar impacto funcional (concentración, descanso, relaciones) y diseñar acciones pequeñas y sostenibles.",
      "Repetir periódicamente para ver evolución.",
    ],
    clinicalNotes: [
      "No es un mapa completo de todas las experiencias; complementar con conversación y otras lecturas si aplica.",
      "Interpretar junto con historia personal, contexto y funcionamiento diario.",
    ],
    disclaimers: ["Lectura orientativa. No es diagnóstico."],
  },
  bai: {
    testCode: "bai",
    title: "Señales del Cuerpo — Intensidad",
    purpose: "Explorar la intensidad de señales corporales asociadas a tensión/activación.",
    whatIsIt:
      "Lectura autoguiada de 21 ítems que cuantifica la intensidad de señales corporales recientes.",
    howToInterpret: [
      "Suma total 0–63: intensidad global (a mayor puntaje, mayor carga percibida).",
      "Pone foco en señales corporales; complementar con lo emocional y lo contextual.",
      "Observar cambios longitudinales ayuda a ver respuesta a hábitos, prácticas y acompañamiento.",
    ],
    whatToDoNext: [
      "Si el puntaje es alto: revisar sueño, respiración, consumo de estimulantes, carga diaria y regulación.",
      "Si hay señales físicas persistentes o preocupantes: valorar acompañamiento profesional y chequeo médico si corresponde.",
      "Repetir periódicamente para ver progresión o mejora.",
    ],
    clinicalNotes: [
      "Herramienta de intensidad; no establece diagnósticos por sí misma.",
      "Contextualizar con otras lecturas y con conversación guiada.",
    ],
    disclaimers: ["Lectura orientativa. No es diagnóstico."],
  },
  isi: {
    testCode: "isi",
    title: "Ritmo del Descanso — 7 señales",
    purpose: "Explorar el descanso, la satisfacción con el sueño y su impacto diurno.",
    whatIsIt:
      "Lectura autoguiada de 7 ítems sobre la percepción de descanso, satisfacción con el sueño y repercusión diurna.",
    howToInterpret: [
      "Suma total 0–28: mayor puntaje suele reflejar mayor interferencia del descanso en la vida diaria.",
      "Revisar ítems de impacto diurno y preocupación por el sueño.",
      "Comparar con hábitos, horarios, entorno y condiciones físicas concomitantes.",
    ],
    whatToDoNext: [
      "Si el puntaje es alto: diseñar 1–3 ajustes de hábitos de sueño y contención del estrés.",
      "Sostener seguimiento periódico y registrar cambios tras prácticas.",
      "Si hay señales persistentes: valorar acompañamiento profesional.",
    ],
    clinicalNotes: [
      "Herramienta orientativa; no diagnostica por sí misma.",
      "Interpretar junto con historia de descanso, hábitos y condiciones concomitantes.",
    ],
    disclaimers: ["Lectura orientativa. No es diagnóstico."],
  },
};
