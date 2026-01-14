# ARCHITECTURE — Sistema de Tests Holísticos

Resumen ejecutivo

- Propósito: Dejar un único documento de decisión técnica que cierre el comportamiento del flujo Tests → Resultados → Sugerencias terapéuticas en la app React + Django, describiendo qué funcionaba, qué fallaba, qué se arregló, qué queda pendiente y el contrato técnico definitivo.
- Audiencia: Arquitecto, equipo frontend, equipo backend, producto, QA.
- Resultado inmediato: Causa raíz de la pérdida de la sugerencia terapéutica detectada y confirmada; cambios propuestos y verificados parcialmente; se requiere un ajuste crítico en fetch/credenciales en frontend y validaciones en backend.

---

## 1. Arquitectura actual (alto nivel)

- Backend Django expone recursos REST en `/tests/` y `/tests/results/`.
- Frontend Next.js (app router) consume la API via `tonyblanco-app/lib/test-api.ts`.
- Roles:
  - Terapeuta: vista extendida, recibe `therapist_next_exploration_suggestion`.
  - Paciente: vista orientativa, no recibe transiciones/hipótesis.
- Componentes clave tocados:
  - Backend: `backend/api/test_serializers.py`, `backend/api/test_views.py`.
  - Frontend: `tonyblanco-app/components/test-results/ReadableResult.tsx`, `ResultSuggestionsCard.tsx`.
  - Pages: `app/(dashboard)/dashboard/therapist/.../page.tsx`, `app/(dashboard)/dashboard/patient/.../page.tsx`.
  - Verificación: `backend/scripts/check_therapist_serialization.py`.
- Fuente de verdad de producto/UX: `docs/00_SOURCE_OF_TRUTH/CANONICAL_SYSTEM_DOC.md`.

## 2. Qué funcionaba

- Lógica semántica en backend para generar transiciones (Atzilut → Beriá → Ietzirá → Asiá) implementada.
- Serializer puede devolver `therapist_next_exploration_suggestion` cuando la request es autenticada como terapeuta.
- Modal `ExplorationSuggestionModal` existe y muestra contenido correctamente cuando se le abre.

## 3. Qué no funcionaba (causa raíz)

- Síntoma: la sugerencia terapéutica no aparecía en la UI del terapeuta.
- Diagnóstico confirmado:
  - Las llamadas `fetch` del frontend no incluían `credentials: 'include'` (ni wrapper centralizado).
  - El backend trataba las peticiones como anónimas y omitía campos destinados solo a terapeutas.
- Otros hallazgos:
  - Existían `TestResult` marcados `processed === true` sin `raw_answers` ni `structured_data`.
  - Uso de `window.confirm` rompía coherencia UX.

## 4. Qué se arregló

- Backend:
  - Limpieza de accesos pendientes/huérfanos y normalización de `UserTestAccess`.
  - Serializer ya devuelve `therapist_next_exploration_suggestion` para usuarios autenticados.
- Frontend:
  - `ReadableResult.tsx` actualizado para aceptar `resultId` e `isTherapist`, autoabrir modal una vez por sesión (`sessionStorage.suggestion_seen_{id}`), y mostrar `ResultSuggestionsCard` con acciones.
  - Eliminación de botones dev/hacks y adición de logs de depuración temporales.
  - Páginas que renderizan resultados pasan `resultId` e `isTherapist` explícitamente.
- Verificación:
  - Se confirmó que, con una request autenticada, la respuesta contiene la sugerencia y la UI puede mostrarla.

## 5. Qué queda pendiente

- **Fetch / sesión (CRÍTICO):** añadir `credentials: 'include'` en `tonyblanco-app/lib/test-api.ts` o crear `apiFetch()` wrapper.
- **CORS:** si API es cross-origin, backend debe habilitar `Access-Control-Allow-Credentials: true` y origen explícito.
- **Enforcement TestResult:** validar en backend que `processed === true` requiere `raw_answers` o `structured_data`.
- **UX:** reemplazar `window.confirm` por modal del sistema donde aplique.
- **Limpieza:** eliminar logs `console.log` en producción.

## 6. Contrato técnico definitivo (obligatorio)

### A. Autenticación / Fetch contract
- Todas las llamadas a la API que dependan de rol o sesión deben usar:
```js
fetch(url, { headers: ..., credentials: 'include' })
```
- Preferencia: centralizar en `apiFetch()` para consistencia.
- Backend debe permitir credenciales si es cross-origin (`Access-Control-Allow-Credentials: true`).

### B. Regla de completitud de TestResult
- Un `TestResult` está COMPLETADO si:
  - `processed === true` AND (`raw_answers` o `structured_data` presente y no vacío).
- Si no se cumple, el resultado se considera PENDIENTE y debe permitir re-ejecución.

### C. Visibilidad por rol (UI contract)
- Terapeuta: recibe sugerencia, transición, ICE, datos extendidos.
- Paciente: solo Vista Orientativa (resumen humano). No ver transiciones, hipótesis ni riesgos.
- Implementación: backend serializers condicionados por contexto; frontend debe pasar `isTherapist` cuando sea aplicable.

### D. Modal UX contract
- Prohibido `window.confirm` en producción; usar modal interno.
- Modal behavior:
  - Auto-open suggestion modal once per session for therapists (frontend: `sessionStorage.suggestion_seen_{resultId}`).
  - Card visible at all times for therapist when suggestion exists; manual re-open allowed.

### E. Audit / Logging
- No exponer campos sensibles en logs en producción. Dev logs deben eliminarse o condicionar por env.

## 7. Reglas de datos / validaciones (server-side enforce)
- `TestResult.processed === true` requiere non-empty `raw_answers` o `structured_data`.
- `therapist_next_exploration_suggestion` solo en serializer cuando request corresponde a terapeuta.

## 8. Decisiones cerradas
- Uso de `sessionStorage` para marca "visto" por sesión (no persistir en backend por defecto).
- Card + modal UX definitivo para sugerencias (modal explicativo no decide; terapeuta decide).
- No exponer transiciones/hipótesis a pacientes.
- Centralizar `credentials: 'include'` como regla.

## 9. Roadmap técnico (priorizado)
1. (Alto) Implementar `apiFetch()` o añadir `credentials: 'include'` en `tonyblanco-app/lib/test-api.ts`. Coordinar CORS.
2. (Alto) Enforce TestResult completeness en backend.
3. (Medio) Reemplazar `window.confirm` con modal del sistema en UI relevante.
4. (Medio) Limpiar logs y preparar PR para revisión.
5. (Bajo) Render ICE full report y longitudinal UI.
6. (Opcional) Telemetría: tasa de aceptación de sugerencias por terapeuta.

## 10. QA checklist (copy-paste)
- Backend: ejecutar `backend/scripts/check_therapist_serialization.py` como terapeuta — confirmar `therapist_next_exploration_suggestion` presente.
- Frontend: asegurar `apiFetch` usa `credentials: 'include'`. Loguearse como terapeuta, abrir resultado — consola debe mostrar sugerencia y modal autoabrir una vez.
- Paciente: validar que no ve Card ni modal; respuesta del endpoint no debe contener `therapist_next_exploration_suggestion`.
- Data: intentar marcar resultado completado sin respuestas — endpoint debe rechazar o mantener pendiente.

## 11. Comunicación para PR al arquitecto
- Título sugerido: "Frontend: ensure credentials in API fetch + suggestion UX finalized"
- Descripción corta: "Se detectó que la pérdida de `therapist_next_exploration_suggestion` era por fetch sin credenciales. Este PR centraliza `credentials: 'include'` y completa la UX del card/modal. Requiere validar CORS si es cross-origin. También incluye QA steps."

---

**Contacto:** para dudas técnicas o si quieres que abra los PRs descritos, responde con la prioridad: 1) `credentials` PR, 2) backend validation PR, 3) logs & docs PR.
