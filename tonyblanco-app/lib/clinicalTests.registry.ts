export type ClinicalTestRegistryEntry = {
  test_code: string;
  display_name: string;
  domain: string;
  family: "psicologicos" | "cabalisticos";
  implemented: boolean;
  patient_route?: string;
  therapist_route?: string;
  guidance?: {
    what: string;
    when: string;
    diff?: string;
    after?: string;
    reminder?: string;
  };
};

export const clinicalTestsRegistry: ClinicalTestRegistryEntry[] = [
  {
    test_code: "phq-9",
    display_name: "PHQ-9 (Depresion)",
    domain: "Estado de animo y depresion",
    family: "psicologicos",
    implemented: true,
    patient_route: "/dashboard/patient/tests/phq9",
    therapist_route: "/dashboard/therapist/patients/[id]/tests/phq9",
    guidance: {
      what: "Cribado breve de sintomas depresivos en adultos.",
      when: "Usar en evaluacion inicial y seguimiento.",
      diff: "Mas breve que BDI-II; orientado a frecuencia en 2 semanas.",
      after: "Revisar severidad y respuestas al item de ideacion suicida.",
      reminder: "Instrumento de cribado, no diagnostico.",
    },
  },
  {
    test_code: "gad-7",
    display_name: "GAD-7 (Ansiedad)",
    domain: "Ansiedad y estres",
    family: "psicologicos",
    implemented: true,
    patient_route: "/dashboard/patient/tests/gad7",
    therapist_route: "/dashboard/therapist/patients/[id]/tests/gad7",
    guidance: {
      what: "Cribado de ansiedad generalizada.",
      when: "Util en sintomas ansiosos persistentes.",
      diff: "Enfocado en GAD; no cubre panico ni fobias.",
      after: "Observar severidad y funcionalidad.",
      reminder: "Instrumento de cribado, no diagnostico.",
    },
  },
  {
    test_code: "bai",
    display_name: "BAI (Ansiedad de Beck)",
    domain: "Ansiedad y estres",
    family: "psicologicos",
    implemented: true,
    patient_route: "/dashboard/patient/tests/bai",
    therapist_route: "/dashboard/therapist/patients/[id]/tests/bai",
    guidance: {
      what: "Severidad de sintomas de ansiedad.",
      when: "Evaluacion inicial y seguimiento de tratamiento ansioso.",
      diff: "Mas centrado en sintomas fisiologicos que GAD-7.",
      after: "Contrastar con contexto clinico y funcional.",
      reminder: "Instrumento de severidad, no diagnostico.",
    },
  },
  {
    test_code: "isi",
    display_name: "ISI (Insomnio)",
    domain: "Sueno y ritmos",
    family: "psicologicos",
    implemented: true,
    patient_route: "/dashboard/patient/tests/isi",
    therapist_route: "/dashboard/therapist/patients/[id]/tests/isi",
    guidance: {
      what: "Severidad de insomnio y su impacto.",
      when: "Sintomas de sueno persistentes.",
      diff: "Especifico de insomnio; no evalua otros trastornos de sueno.",
      after: "Observar severidad y repercusion diurna.",
      reminder: "Instrumento de severidad, no diagnostico.",
    },
  },
  {
    test_code: "bdi-ii",
    display_name: "BDI-II (Depresion de Beck)",
    domain: "Estado de animo y depresion",
    family: "psicologicos",
    implemented: true,
    patient_route: "/dashboard/patient/tests/bdi2",
    therapist_route: "/dashboard/therapist/patients/[id]/tests/bdi2",
    guidance: {
      what: "Severidad de sintomas depresivos.",
      when: "Evaluacion inicial y seguimiento de depresion.",
      diff: "Mas detallado que PHQ-9; incluye varios dominios sintomaticos.",
      after: "Revisar item de ideacion suicida y cambios en funcionalidad.",
      reminder: "Instrumento de severidad, no diagnostico.",
    },
  },
  // Psicologicos no implementados
  {
    test_code: "stai",
    display_name: "STAI (Ansiedad Estado-Rasgo)",
    domain: "Ansiedad y estres",
    family: "psicologicos",
    implemented: true,
    guidance: {
      what: "Evaluacion de ansiedad estado y rasgo.",
      when: "Util para evaluar cambios de ansiedad en contexto clinico.",
      diff: "Distingue ansiedad estado de ansiedad rasgo.",
      after: "Interpretar niveles en conjunto con contexto clinico.",
      reminder: "Instrumento de severidad, no diagnostico.",
    },
  },
  {
    test_code: "scl-90-r",
    display_name: "SCL-90-R (Psicopatologia)",
    domain: "Psicopatologia general",
    family: "psicologicos",
    implemented: false,
  },
  {
    test_code: "pai",
    display_name: "PAI (Personalidad)",
    domain: "Personalidad y psicopatologia",
    family: "psicologicos",
    implemented: false,
  },
  {
    test_code: "mcmi-iv",
    display_name: "MCMI-IV",
    domain: "Personalidad y psicopatologia",
    family: "psicologicos",
    implemented: false,
  },
  {
    test_code: "scid-5-rv",
    display_name: "SCID-5-RV",
    domain: "Entrevistas estructuradas",
    family: "psicologicos",
    implemented: false,
  },
  {
    test_code: "adhd",
    display_name: "ADHD Adultos",
    domain: "Neurodesarrollo",
    family: "psicologicos",
    implemented: false,
  },
  {
    test_code: "ocd",
    display_name: "TOC",
    domain: "TOC",
    family: "psicologicos",
    implemented: false,
  },
  {
    test_code: "ptsd",
    display_name: "PTSD",
    domain: "Trauma",
    family: "psicologicos",
    implemented: false,
  },
  {
    test_code: "eating",
    display_name: "Conducta Alimentaria",
    domain: "Conducta alimentaria",
    family: "psicologicos",
    implemented: false,
  },
  {
    test_code: "substance",
    display_name: "Consumo de Sustancias",
    domain: "Sustancias",
    family: "psicologicos",
    implemented: false,
  },
  {
    test_code: "screening-general",
    display_name: "Screening Psicologico General",
    domain: "Psicologia",
    family: "psicologicos",
    implemented: false,
  },
  {
    test_code: "wellness",
    display_name: "Wellness Assessment",
    domain: "Bienestar",
    family: "psicologicos",
    implemented: false,
  },
  // Cabalistico (placeholder)
  {
    test_code: "tarot-terapeutico",
    display_name: "Tarot terapeutico",
    domain: "Analisis cabalistico",
    family: "cabalisticos",
    implemented: false,
  },
  {
    test_code: "astrologia-cabalistica",
    display_name: "Astrologia cabalistica",
    domain: "Analisis cabalistico",
    family: "cabalisticos",
    implemented: false,
  },
  {
    test_code: "gematria",
    display_name: "Gematria clinica",
    domain: "Analisis cabalistico",
    family: "cabalisticos",
    implemented: false,
  },
  {
    test_code: "numerologia-completa",
    display_name: "Numerologia completa",
    domain: "Analisis cabalistico",
    family: "cabalisticos",
    implemented: false,
  },
  {
    test_code: "arbol-vida",
    display_name: "Arbol de la Vida",
    domain: "Analisis cabalistico",
    family: "cabalisticos",
    implemented: false,
  },
];
