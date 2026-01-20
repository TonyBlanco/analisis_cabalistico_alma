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

    test_code: "insomnia-index",

    display_name: "Insomnia Index",

    domain: "Sueño y ritmos",

    family: "psicologicos",

    implemented: false,

  },

  {

    test_code: "anxiety-state-trait",

    display_name: "STAI (Ansiedad Estado-Rasgo)",

    domain: "Ansiedad y estres",

    family: "psicologicos",

    implemented: true,

    patient_route: "/dashboard/patient/tests/anxiety-state-trait",

    guidance: {

      what: "Evalua ansiedad actual (estado) y tendencia estable (rasgo).",

      when: "Usar en seguimiento de ansiedad o para diferenciar estado vs. rasgo.",

      reminder: "Lectura wellness orientativa (no diagnostico).",

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

    test_code: "mcmi-iv",

    display_name: "MCMI-IV",

    domain: "Personalidad y psicopatologia",

    family: "psicologicos",

    implemented: false,

  },

  {

    test_code: "scid5",

    display_name: "SCID-5 (Entrevista estructurada)",

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

    test_code: "toc",

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

    test_code: "substances",

    display_name: "Consumo de Sustancias",

    domain: "Sustancias",

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

    test_code: "screening-general",

    display_name: "Screening Psicologico General",

    domain: "Psicologia",

    family: "psicologicos",

    implemented: true,

    patient_route: "/dashboard/patient/tests/screening-general",

  },

  {

    test_code: "stress-regulation",

    display_name: "Estrés — Carga y regulación",

    domain: "Bienestar",

    family: "psicologicos",

    implemented: true,

    patient_route: "/dashboard/patient/tests/stress-regulation",

    guidance: {

      what: "Screening orientativo para explorar carga de estrés y recursos de regulación.",

      when: "Útil cuando hay presión sostenida o sensación de agotamiento.",

      reminder: "No diagnóstico. Uso holístico y de acompañamiento.",

    },

  },

  {

    test_code: "scl90",

    display_name: "SCL-90 — Screening Holístico",

    domain: "Bienestar general",

    family: "psicologicos",

    implemented: true,

    patient_route: "/dashboard/patient/tests/scl90",

    guidance: {

      what: "Lectura orientativa para explorar síntomas amplios desde un enfoque wellness.",

      when: "Útil cuando se busca entender el bienestar global sin etiquetas diagnósticas.",

      reminder: "No diagnóstico. Herramienta de acompañamiento y reflexión.",

    },

  },

  {

    test_code: "wellness",

    display_name: "Wellness Assessment",

    domain: "Bienestar",

    family: "psicologicos",

    implemented: true,

    patient_route: "/dashboard/patient/tests/wellness",

  },

  {

    test_code: "nutrition",

    display_name: "Alimentación — Relación y hábitos",

    domain: "Bienestar y autocuidado",

    family: "psicologicos",

    implemented: true,

    patient_route: "/dashboard/patient/tests/nutrition",

    guidance: {

      what: "Lectura wellness (no diagnóstico) sobre hábitos y relación con la alimentación.",

      when: "Útil para observar señales corporales, emociones y regularidad sin enfoque de dieta o control.",

      reminder: "No sustituye valoración profesional de salud/nutrición.",

    },

  },

  {

    test_code: "past-lives",

    display_name: "Vidas Pasadas – Exploración de Memorias del Alma",

    domain: "Exploración simbólica",

    family: "cabalisticos",

    implemented: true,

    patient_route: "/dashboard/patient/tests/past-lives",

    guidance: {

      what: "Herramienta simbólica de reflexión personal (no diagnóstica).",

      when: "Útil para explorar patrones, emociones y sentido vital en conversación terapéutica.",

      reminder: "No constituye diagnóstico ni afirma hechos históricos literales.",

    },

  },

  {

    test_code: "asrs_essence",

    display_name: "ASRS-Essence (Ritmo del Alma)",

    domain: "Exploración arquetipal",

    family: "cabalisticos",

    implemented: true,

    patient_route: "/dashboard/patient/tests/asrs-essence",

    guidance: {

      what: "Exploración simbólica del ritmo esencial (no diagnóstico).",

      when: "Útil para observar estabilidad interna y coherencia del pulso vital.",

      reminder: "Lectura orientativa para acompañamiento terapéutico.",

    },

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
  {
    test_code: "mcmi4-mystic",
    display_name: "MCMI-4-Mystic (Matriz Cósmica Multiaxial)",
    domain: "Evaluación clínica especializada",
    family: "psicologicos",
    implemented: true,
    patient_route: "/dashboard/patient/tests/mcmi4-mystic",
    therapist_route: "/dashboard/therapist/swm/mcmi4",
    guidance: {
      what: "Evaluación multiaxial con enfoque cabalístico (4 mundos: Atzilut, Briah, Yetzirah, Assiah).",
      when: "Solo mediante asignación de terapeuta a consultante. No disponible para uso directo.",
      diff: "SWM (Special Workflow Module) - Requiere asignación explícita y flujo terapeuta → consultante → paciente.",
      after: "Resultados calculados por motores automáticos y visibles solo para terapeuta asignador.",
      reminder: "Assignment-only test. No se muestra en catálogos públicos.",
    },
  },
  {
    test_code: "mcmi4-signal",
    display_name: "SWM MCMI-4 SIGNAL",
    domain: "Señal mínima",
    family: "cabalisticos",
    implemented: true,
    patient_route: "/dashboard/patient/tests/mcmi4-signal",
  },



];

