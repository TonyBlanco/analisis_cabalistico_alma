export const scdf_es = {
  page: {
    title: 'SCDF — Formulación estructurada',
    subtitle: 'Marco estructurado para formulación y registro consultivo (no diagnóstico).',
  },
  helpModal: {
    button: {
      label: 'Ayuda',
    },
  },
  sections: {
    clientData: 'Datos del paciente',
    evaluationModules: 'Módulos de evaluación',
    clinicianNotes: 'Notas del clínico',
    summary: 'Resumen',
  },
  fields: {
    fullName: 'Nombre completo',
    age: 'Edad',
    evaluationDate: 'Fecha',
  },
  placeholders: {
    clientName: 'Nombre del paciente…',
    age: 'Edad…',
    criterionDescription: 'Describe el criterio…',
    clinicalEvidence: 'Evidencia clínica / observación…',
    clinicianNotes: 'Notas clínicas (opcionales)…',
  },
  buttons: {
    back: 'Volver',
    saving: 'Guardando…',
    saveEvaluation: 'Guardar evaluación',
    activateCoreGate: 'Activar core gate',
    deactivateCoreGate: 'Desactivar core gate',
    addCriterion: 'Agregar criterio',
    remove: 'Eliminar',
  },
  status: {
    active: 'Activo',
    inactive: 'Inactivo',
  },
  moduleLabels: {
    additionalCriteria: 'Criterios adicionales',
    description: 'Descripción',
    evidence: 'Evidencia',
  },
  clinicianNotesDescription:
    'Registra observaciones clínicas y contexto. Se guarda junto al resultado.',
  messages: {
    clientDataRequired: 'Completa nombre y fecha antes de guardar.',
    saveSuccess: 'Evaluación SCDF guardada correctamente.',
    noAdditionalCriteria: 'No hay criterios adicionales todavía.',
  },
  summary: {
    activeModules: 'Módulos activos',
    totalCriteria: 'Criterios totales',
    metCriteria: 'Criterios cumplidos',
    activeExclusions: 'Exclusiones activas',
  },
  // Optional translation maps (fallbacks are handled in the page)
  modules: {},
  coreCriteria: {},
  exclusionFlags: {},
} as const;
