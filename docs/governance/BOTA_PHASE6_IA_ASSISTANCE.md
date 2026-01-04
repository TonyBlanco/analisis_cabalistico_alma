# FASE 6 — Asistencia diagnóstica con IA (controlada y auditada)

Estado: documento de diseño, guard rails y checklist para habilitar un motor de asistencia IA estrictamente supervisado por el terapeuta. ESTE ARCHIVO ES AUDITIVO: no implementa código.

Contexto obligatorio
- Sólo se activa cuando FASE 5 está cerrada, snapshots persistentes existen y hay consentimiento explícito.
- La IA NO decide, NO diagnostica sola, NO escribe en registros clínicos finales.

Principio arquitectónico clave
- La IA sólo consume snapshots inmutables (`snapshot_payload`) generados en FASE 5.
- La IA nunca trabaja sobre datos vivos ni recibe identificadores sensibles.
- Ninguna salida IA se persiste automáticamente.

Rol IA y restricciones
- `ai_role` obligatorio para interacciones: `"clinical_assistant_draft"`.
- Restricciones hard:
  - No emitir diagnóstico definitivo.
  - No generar recomendaciones clínicas.
  - No modificar snapshots.
  - No auto-persistir resultados.

Entrada permitida a la IA
- ÚNICA entrada válida (ejemplo):

```json
{
  "symbolic_snapshot": { /* snapshot_payload de FASE 5 */ },
  "context_flags": { "educational": false, "clinical": true },
  "therapist_notes": "texto opcional",
  "requested_focus": ["patterns","tensions","symbolic_resonance"]
}
```

- Prohibido: datos crudos del paciente, identificadores sensibles, acceso a tests clínicos.

Salida permitida de la IA
- Estructura esperada (siempre borrador):

```json
{
  "draft_type":"observational_assist",
  "symbolic_patterns": [],
  "hypothesis_suggestions": [],
  "questions_for_therapist": [],
  "confidence_level":"low | medium",
  "disclaimer":"Asistencia orientativa. Revisión profesional requerida."
}
```

- Todo output debe estar marcado explícitamente como BORRADOR y contener disclaimer.

UI / UX: Modo “Asistencia IA” (therapist workspace)
- Botón visible: `Solicitar asistencia IA` (solo en workspace del terapeuta y si snapshot existe).
- Modal de confirmación con: recordatorio legal, snapshot ID y confirmación manual.
- Resultado IA mostrado en panel separado, etiquetado `Borrador IA`, editable por el terapeuta.
- Nunca exponer directamente al paciente.

Persistencia controlada
- Solo si terapeuta pulsa `Guardar nota clínica derivada`:
  - Se persiste como `TherapistAnnotation` con campos mínimos:

```ts
TherapistAnnotation {
  id
  source: "ai_assisted"
  reviewed_by_therapist: true
  based_on_snapshot_id: uuid
  created_at
  content: text // nota final revisada
}
```

- La IA nunca marca `ai_used` en registros clínicos ya existentes; todo debe ser trazable.

Aislamiento clínico absoluto
- IA no escribe en `AnalysisRecord` ni en registros diagnósticos.
- IA no altera diagnósticos ni cruza con tests clínicos.
- IA puede desactivarse globalmente mediante feature flag.

Seguridad, legal y trazabilidad
- Registro completo de requests/responses IA (audit log) asociado a therapist_id y snapshot_id.
- Logs deben evitar persistir PII; solo snapshot IDs y provenance.
- Consentimiento explícito registrado antes de invocar IA.

APIs sugeridas (audit-only)
- POST /api/ia/assist  -> valida snapshot_id, confirma consentimiento, ejecuta asistencia (returns draft response, no persist)
- POST /api/ia/assist/save -> persiste `TherapistAnnotation` si terapeuta solicita (requires therapist review)
- GET /api/ia/assist/logs?snapshot_id= -> audit logs (access restricted)

Pruebas y aceptación (Checklist)
- [ ] IA sólo consume `snapshot_payload` (verificación de payload en request)
- [ ] Todo output marcado como borrador con disclaimer
- [ ] El terapeuta revisa y aprueba manualmente antes de persistir
- [ ] Trazabilidad completa: request, response, therapist action
- [ ] IA puede desactivarse sin romper la UX
- [ ] Pruebas legales/éticos completadas y aprobadas
- [ ] Build OK (`npm run build`; backend tests)

Resultado esperado
- Asistencia inteligente con control humano absoluto, auditabilidad total y posibilidad de desactivar.
- Si FASE 6 se desactiva, FASE 5 permanece intacta.

Observaciones
- Implementación requiere políticas legales concretas (consentimiento, retención, eliminación).
- Antes de implementar, preparar plan de mitigación y pruebas de seguridad.

Firma conceptual
- Product / Auditor: ____________________
- Fecha: ____________________
