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

    display_name: "Pulso del Ánimo — 9 señales",

    domain: "Ánimo y energía",

    family: "psicologicos",

    implemented: true,

    patient_route: "/dashboard/patient/tests/phq9",

    therapist_route: "/dashboard/therapist/patients/[id]/tests/phq9",

    guidance: {

      what: "Exploración breve del ánimo y la energía (no diagnóstica).",

      when: "Útil en evaluación inicial y seguimiento de ánimo.",

      diff: "Más breve que Inventario de Reflexión Profunda; orientado a frecuencia en 2 semanas.",

      after: "Revisar respuestas de desesperanza, autocuidado y funcionalidad.",

      reminder: "Herramienta orientativa. No es diagnóstico.",

    },

  },

  {

    test_code: "gad-7",

    display_name: "Mapa de Preocupación — 7 señales",

    domain: "Tensión y regulación",

    family: "psicologicos",

    implemented: true,

    patient_route: "/dashboard/patient/tests/gad7",

    therapist_route: "/dashboard/therapist/patients/[id]/tests/gad7",

    guidance: {

      what: "Exploración de preocupación, tensión y capacidad de autorregulación (no diagnóstica).",

      when: "Útil cuando hay preocupación sostenida o tensión persistente.",

      diff: "Enfocado en preocupación y tensión; no cubre todos los matices emocionales.",

      after: "Observar severidad y funcionalidad.",

      reminder: "Herramienta orientativa. No es diagnóstico.",

    },

  },

  {

    test_code: "bai",

    display_name: "Señales del Cuerpo — Intensidad",

    domain: "Cuerpo y activación",

    family: "psicologicos",

    implemented: true,

    patient_route: "/dashboard/patient/tests/bai",

    therapist_route: "/dashboard/therapist/patients/[id]/tests/bai",

    guidance: {

      what: "Exploración de intensidad de activación corporal (no diagnóstica).",

      when: "Útil para observar activación corporal y su variación en el tiempo.",

      diff: "Más centrado en señales corporales que el Mapa de Preocupación.",

      after: "Contrastar con contexto personal, relacional y funcional.",

      reminder: "Herramienta orientativa. No es diagnóstico.",

    },

  },

  {

    test_code: "isi",

    display_name: "Sueño — Ritmo y descanso",

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

      reminder: "Herramienta orientativa. No es diagnóstico.",

    },

  },

  {

    test_code: "bdi-ii",

    display_name: "Inventario de Reflexión Profunda — 21 señales",

    domain: "Ánimo, sentido y vitalidad",

    family: "psicologicos",

    implemented: true,

    patient_route: "/dashboard/patient/tests/bdi2",

    therapist_route: "/dashboard/therapist/patients/[id]/tests/bdi2",

    guidance: {

      what: "Exploración estructurada del ánimo, el sentido y la vitalidad (no diagnóstica).",

      when: "Útil para observar cambios de ánimo a lo largo del tiempo.",

      diff: "Más detallado que Pulso del Ánimo; incluye varios dominios de experiencia interna.",

      after: "Revisar cambios en funcionalidad, autocuidado y narrativa interna.",

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

    display_name: "Equilibrio Interno — Estado y Rasgo",

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

    display_name: "Lente de Simetría del Alma (Revisada)",

    domain: "Simetría emocional (panorama)",

    family: "psicologicos",

    implemented: false,

  },

  {

    test_code: "mcmi-iv",

    display_name: "Matriz Multiaxial — Perfil",

    domain: "Perfil multiaxial (integrativo)",

    family: "psicologicos",

    implemented: false,

  },

  {

    test_code: "scid5",

    display_name: "Guía Estructurada (Exploración)",

    domain: "Exploración guiada",

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

    display_name: "Lente de Simetría del Alma",

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
    test_code: "dudit_spirit",
    display_name: "Introspección de Unidad — Patrones de desconexión (Rúaj)",
    domain: "Acción y cuerpo",
    family: "cabalisticos",
    implemented: true,
    patient_route: "/dashboard/patient/tests/dudit-spirit",
    guidance: {
      what: "Exploración holística sobre patrones de desconexión/escape y autorregulación (no diagnóstica).",
      when: "Útil cuando hay automatismos, desconexión corporal o dificultad para regular impulsos.",
      reminder: "Herramienta orientativa para acompañamiento terapéutico. No sustituye ayuda profesional.",
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

    display_name: "Ritmo del Alma — Esencia",

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

    display_name: "Gematría simbólica",

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
    display_name: "Matriz Cósmica Multiaxial (Místico)",
    domain: "Exploración multiaxial cabalística",
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
    display_name: "Señal de Coherencia — Registro mínimo",
    domain: "Señal mínima",
    family: "cabalisticos",
    implemented: true,
    patient_route: "/dashboard/patient/tests/mcmi4-signal",
  },
  {
    test_code: "sha_harmony",
    display_name: "Auditoría de Armonía Sefirótica (SHA)",
    domain: "Equilibrio sefirótico",
    family: "cabalisticos",
    implemented: true,
    patient_route: "/dashboard/patient/tests/sha-harmony",
    therapist_route: "/dashboard/therapist/sha",
    guidance: {
      what: "Evaluación holística del balance sefirótico mediante un cuestionario breve de 10 ítems.",
      when: "Mediante asignación del terapeuta para explorar patrones de hábito y correspondencia sefirótica.",
      diff: "Integra lectura cabalística de 4 zonas de armonía con un cuestionario estructurado.",
      after: "Resultados muestran zona de riesgo y Sefirá correspondiente para trabajo terapéutico.",
      reminder: "Cuestionario de 10 preguntas, tiempo estimado: 5 minutos.",
    },
  },



];

