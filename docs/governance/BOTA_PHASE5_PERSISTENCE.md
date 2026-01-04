# FASE 5 — Persistencia simbólica auditada (B.O.T.A.)

Estado: documento de diseño y checklist para la fase de cierre formal. ESTE ARCHIVO ES AUDITIVO: no contiene código de producción ni cambios a repositorio más allá de la documentación.

Objetivo
- Implementar persistencia simbólica inmutable de lecturas B.O.T.A. y su visualización histórica en el workspace del terapeuta, respetando que NO se introduce IA ni se reinterpreta o recalcula contenido.

Contexto obligado
- NO IA diagnóstica ni interpretativa.
- NO recalcular cartas ni modificar datasets.
- Arquitectura clínica cerrada: no modificar contratos SWM existentes.

Alcance (sí)
- Registrar snapshot inmutable por lectura con metadatos: fecha/hora, therapist_id, patient_id|null, system, spread_id, cartas+posiciones, correspondencias B.O.T.A., texto simbólico observado, consent_mode.
- Snapshot almacenado como `snapshot_payload` JSON que permita renderizar lectura exactamente igual sin lógica adicional.
- UI: historial de lecturas en workspace del terapeuta; vista read-only que renderiza desde snapshot.

Fuera de alcance (no hacer)
- Ninguna forma de IA, regeneración, edición de snapshot, recalculo de cartas, mezcla con clínica o diagnóstico.

Modelo de datos propuesto (conceptual)

```ts
// Conceptual — ajustar a ORM del backend (Django/SQLAlchemy/etc.)
SymbolicReadingRecord {
  id: uuid
  patient_id: uuid | null
  therapist_id: uuid // required
  system: "BOTA_TAROT"
  spread_id: string
  snapshot_payload: JSON // inmutable
  consent_mode: "none" | "anonymous" | "linked"
  ai_allowed: boolean
  ai_used: false
  ai_role: "none"
  created_at: datetime
}

// snapshot_payload debe contener:
// - rendering data: cards [{id,index,rotation,orientation}], positions, spread metadata
// - correspondences: consciousness, sefirot, hebrewLetter, path, cabalisticIntelligence
// - textual blocks: structure, main_text, context_applied, position_meaning (observational)
// - visual asset references: image filenames or asset ids (no external fetch)
// - provenance: source_module/version
```

Validaciones backend (guard rails)
- Persistencia SOLO si `consent_mode !== "none"`.
- `system === "BOTA_TAROT"` obligatorio.
- `ai_used === false` forzado en insert.
- Backend construye el `snapshot_payload` — el frontend envía sólo la solicitud de guardado con consentimiento y contexto mínimo (spread id, session id).
- El registro es inmutable: no endpoints de actualización o borrado (solo soft-flag de acceso si es necesario por GDPR — ver Observaciones legales).

Flujo de guardado (resumen)
1. Usuario/terapeuta abre modal de consentimiento en la UI de lectura generada.
2. Si el consultante da consentimiento (`anonymous` o `linked`), frontend solicita al backend `POST /api/symbolic-readings` con: `therapist_id`, optional `patient_id`, `spread_id`, `consent_mode`, `session_id`.
3. Backend valida (consent_mode, system, ai_used=false) y construye `snapshot_payload` a partir del estado CANÓNICO del motor de rendering (lectura actual en memoria servidor o en servicio de render autorizado).
4. Backend persiste `SymbolicReadingRecord` y devuelve `201` con id.

API (sugerencia, audit-only)
- POST /api/symbolic-readings  -> create record (backend builds payload)
- GET /api/symbolic-readings?therapist_id={id} -> list (for therapist workspace)
- GET /api/symbolic-readings/{id} -> read-only payload (rendering only)

Frontend (historial)
- Nueva sección: **Historial de lecturas simbólicas** en el workspace del terapeuta.
- Listado por fecha, sistema, spread, consent_mode, botón `Ver lectura`.
- Al abrir, UI usa exclusivamente `snapshot_payload` y renderiza los bloques simbólicos actuales en modo read-only.
- Banner visible: “Lectura simbólica observacional. No diagnóstica.”

Requisitos de UI/UX
- No enlaces ni botones para editar, regenerar texto, ni invocar IA.
- Permitir exportar (PDF / ZIP) del `snapshot_payload` si el terapeuta lo solicita (audit trail), respetando consentimiento.

Aislamiento y compatibilidad
- No tocar contratos SWM v3. Confirmar que los endpoints/DBs nuevos quedan bajo un namespace propio (`symbolic_readings`) y no afectan módulos de Astrología ni tests clínicos.

Seguridad y legal
- Consentimiento: registrar `consent_mode` y timestamp.
- GDPR: permitir mecanismo de anonimización o acceso restringido; eliminación física solo mediante proceso legal (fuera de alcance de FASE 5), preferir soft-delete with audit trail.
- `ai_used` debe ser `false` y no delegar a servicios externos para el snapshot.

Pruebas y aceptación (Checklist)
- [ ] Guardado con consentimiento (`consent_mode != none`) produce registro con `ai_used === false`.
- [ ] `snapshot_payload` contiene todos los bloques requeridos para renderizado (estructura, main_text, context, position_meaning, cards, correspondences).
- [ ] Registro inmutable: no existe endpoint público que modifique `snapshot_payload`.
- [ ] Historial del terapeuta lista entradas y permite abrir lectura (ver-only).
- [ ] Vista histórica renderiza igual que la original usando solo `snapshot_payload`.
- [ ] Banner de advertencia presente en vista histórica.
- [ ] `npm run build` (frontend) y `python manage.py test` (backend tests targeting symbolic persistence) pasan sin errores críticos.
- [ ] No se introduce IA ni flags `ai_used=true`.

Observaciones / Riesgos
- Implementación de export/eliminación requiere coordinación legal (GDPR). No implementado en FASE 5 salvo soft-delete policy.
- Backend debe ser la fuente de verdad del snapshot; no confiar en payloads montados por el cliente.

Next steps (si se autoriza implementación)
1. Revisión de contratos SWM v3 para confirmar namespace seguro.
2. Crear migración de modelo (audit-only review antes de aplicar).
3. Implementar APIs y pruebas unitarias.
4. Implementar UI read-only components y e2e para render parity.

Firma conceptual de cierre
- Auditor / Product: ____________________
- Fecha: ____________________

Notas finales
- FASE 5 prepara el terreno para una eventual FASE 6 (IA) pero NO introduce ningún componente AI ahora. Todos los campos y flags están diseñados para garantizar que `ai_used` permanezca `false` y que la lectura sea reproducible desde el snapshot sin ejecutar lógica adicional.
