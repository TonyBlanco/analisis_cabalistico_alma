export type ClinicalTestKnowledgeEntry = {
  what_is_it: string;
  how_to_interpret: string[];
  what_to_do_next: string[];
  resources?: Array<{
    title: string;
    url?: string;
    type?: string;
    note?: string;
  }>;
};

export const clinicalTestKnowledgeRegistry: Record<string, ClinicalTestKnowledgeEntry> = {
  "phq-9": {
    what_is_it:
      "Cuestionario autoadministrado de 9 items para cribado de sintomas depresivos en las ultimas dos semanas.",
    how_to_interpret: [
      "Suma total 0-27: severidad de depresion en cinco rangos (minima a grave).",
      "Valorar la respuesta del item 9 (ideacion suicida) con atencion especial.",
      "Usar el puntaje como tendencia: cambios entre mediciones importan mas que una lectura aislada.",
    ],
    what_to_do_next: [
      "Si severidad moderada o mayor: considerar evaluacion clinica ampliada y plan de seguimiento.",
      "Si item 9 > 0: activar protocolo de seguridad segun la practica de la organizacion.",
      "Repetir en seguimiento para observar respuesta a intervencion o evolucion espontanea.",
    ],
    resources: [
      {
        title: "Guia clinica breve PHQ-9 (es)",
        url: "https://phqscreeners.com/images/sites/g/files/g10060481/f/201412/PHQ-9_English.pdf",
        type: "pdf",
        note: "Referencia original; interpretar siempre en contexto clinico.",
      },
    ],
  },
  // Otros tests pueden agregarse aqui como placeholders informativos
};
