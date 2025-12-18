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
    title: "PHQ-9 — Cuestionario de Salud del Paciente",
    purpose: "Cribado y seguimiento de s\u00edntomas depresivos.",
    whatIsIt:
      "Instrumento autoadministrado de 9 \u00edtems que mide frecuencia de s\u00edntomas depresivos en las \u00faltimas dos semanas.",
    howToInterpret: [
      "Suma total 0-27: severidad de depresi\u00f3n (m\u00ednima, leve, moderada, moderadamente grave, grave).",
      "Revisar siempre el \u00edtem 9 (ideaci\u00f3n suicida) de forma prioritaria.",
      "Seguir la evoluci\u00f3n en el tiempo: los cambios de puntaje entre mediciones son relevantes.",
    ],
    whatToDoNext: [
      "Si severidad moderada o mayor: planificar evaluaci\u00f3n cl\u00ednica ampliada y seguimiento.",
      "Si \u00edtem 9 > 0: activar el protocolo de seguridad y riesgo seg\u00fan normativa interna.",
      "Reaplicar peri\u00f3dicamente para evaluar respuesta a intervenci\u00f3n o progresi\u00f3n espont\u00e1nea.",
    ],
    clinicalNotes: [
      "Herramienta de cribado y monitorizaci\u00f3n; no sustituye evaluaci\u00f3n diagn\u00f3stica.",
      "Interpretar en contexto de funcionamiento, antecedentes y comorbilidades.",
    ],
    disclaimers: ["Este instrumento es de cribado, no diagn\u00f3stico cl\u00ednico."],
    resources: [
      {
        title: "Gu\u00eda breve PHQ-9 (en)",
        url: "https://phqscreeners.com/images/sites/g/files/g10060481/f/201412/PHQ-9_English.pdf",
        type: "pdf",
        note: "Referencia original; aplicar criterio cl\u00ednico y protocolos locales.",
      },
    ],
  },
  "gad-7": {
    testCode: "gad-7",
    title: "GAD-7 — Trastorno de Ansiedad Generalizada",
    purpose: "Cribado y seguimiento de ansiedad generalizada en adultos.",
    whatIsIt:
      "Cuestionario autoadministrado de 7 \u00edtems sobre la frecuencia de s\u00edntomas de ansiedad en las \u00faltimas dos semanas.",
    howToInterpret: [
      "Suma total 0-21: severidad (m\u00ednima, leve, moderada, grave).",
      "Valores altos sugieren mayor probabilidad de ansiedad generalizada, pero requieren confirmaci\u00f3n cl\u00ednica.",
      "Seguir cambios entre mediciones para evaluar respuesta a intervenciones.",
    ],
    whatToDoNext: [
      "Si severidad moderada o grave: considerar evaluaci\u00f3n cl\u00ednica ampliada y plan de manejo.",
      "Reforzar evaluaci\u00f3n de s\u00edntomas fisiol\u00f3gicos y funcionalidad diaria.",
      "Repetir peri\u00f3dicamente para monitorizar evoluci\u00f3n.",
    ],
    clinicalNotes: [
      "No captura p\u00e1nico ni fobias espec\u00edficas; complementar si hay sospecha.",
      "Interpretar junto con historial, comorbilidades y deterioro funcional.",
    ],
    disclaimers: ["Este instrumento es de cribado, no diagn\u00f3stico cl\u00ednico."],
  },
  bai: {
    testCode: "bai",
    title: "BAI — Inventario de Ansiedad de Beck",
    purpose: "Evaluar severidad de s\u00edntomas de ansiedad, con \u00e9nfasis fisiol\u00f3gico.",
    whatIsIt:
      "Inventario de 21 \u00edtems autoadministrado que cuantifica la intensidad de s\u00edntomas de ansiedad.",
    howToInterpret: [
      "Suma total 0-63: severidad (m\u00ednima, leve, moderada, grave).",
      "Mayor peso en s\u00edntomas som\u00e1ticos; contrastar con quejas cognitivas/afectivas.",
      "Cambios longitudinales ayudan a medir respuesta al tratamiento.",
    ],
    whatToDoNext: [
      "Si puntaje moderado o grave: ampliar evaluaci\u00f3n cl\u00ednica y planificar intervenci\u00f3n.",
      "Revisar impacto funcional y descartar causas m\u00e9dicas.",
      "Monitorizar peri\u00f3dicamente para valorar progresi\u00f3n o mejor\u00eda.",
    ],
    clinicalNotes: [
      "Instrumento de severidad; no establece diagn\u00f3stico por s\u00ed mismo.",
      "Contextualizar con otras medidas (p. ej., GAD-7) y con la entrevista cl\u00ednica.",
    ],
    disclaimers: ["Este instrumento es de cribado, no diagn\u00f3stico cl\u00ednico."],
  },
  isi: {
    testCode: "isi",
    title: "ISI — \u00cdndice de Severidad del Insomnio",
    purpose: "Valorar severidad de insomnio y su impacto funcional.",
    whatIsIt:
      "Escala de 7 \u00edtems autoadministrada que mide percepci\u00f3n de insomnio, satisfacci\u00f3n con el sue\u00f1o y repercusi\u00f3n diurna.",
    howToInterpret: [
      "Suma total 0-28: insomnio no significativo, subcl\u00ednico, cl\u00ednico moderado, cl\u00ednico grave.",
      "Revisar \u00edtems de impacto diurno y preocupaci\u00f3n por el sue\u00f1o.",
      "Comparar con higiene del sue\u00f1o, horarios y condiciones m\u00e9dicas concomitantes.",
    ],
    whatToDoNext: [
      "Si moderado o grave: valorar intervenci\u00f3n sobre conductas de sue\u00f1o y causas m\u00e9dicas.",
      "Acompa\u00f1ar con educaci\u00f3n en higiene del sue\u00f1o y seguimiento peri\u00f3dico.",
      "Registrar cambios tras intervenciones para objetivar mejor\u00eda o persistencia.",
    ],
    clinicalNotes: [
      "Instrumento de severidad; no diagnostica trastornos espec\u00edficos del sue\u00f1o.",
      "Interpretar junto con historia de sue\u00f1o, medicaci\u00f3n y comorbilidades.",
    ],
    disclaimers: ["Este instrumento es de cribado, no diagn\u00f3stico cl\u00ednico."],
  },
  "bdi-ii": {
    testCode: "bdi-ii",
    title: "BDI-II — Inventario de Depresi\u00f3n de Beck II",
    purpose: "Medir severidad de s\u00edntomas depresivos en adultos y adolescentes mayores.",
    whatIsIt:
      "Inventario autoadministrado de 21 \u00edtems con opciones de 0 a 3 que reflejan intensidad de s\u00edntomas depresivos.",
    howToInterpret: [
      "Suma total 0-63: depresi\u00f3n m\u00ednima, leve, moderada, grave.",
      "\u00cdtems cubren afecto, cognici\u00f3n y s\u00edntomas f\u00edsicos; ponderar perfiles mixtos.",
      "Cambios longitudinales son clave para evaluar respuesta terap\u00e9utica.",
    ],
    whatToDoNext: [
      "Si severidad moderada o grave: planificar evaluaci\u00f3n diagn\u00f3stica completa y manejo cl\u00ednico.",
      "Revisar \u00edtems de ideaci\u00f3n suicida y funcionalidad; activar protocolos seg\u00fan riesgo.",
      "Reaplicar en seguimiento para medir evoluci\u00f3n.",
    ],
    clinicalNotes: [
      "Instrumento de severidad; no establece diagn\u00f3stico por s\u00ed mismo.",
      "Atenci\u00f3n especial a \u00edtems de ideaci\u00f3n suicida y cambios en apetito/sue\u00f1o.",
    ],
    disclaimers: ["Este instrumento es de cribado, no diagn\u00f3stico cl\u00ednico."],
  },
};
