# CHAT CONTINUITY PROTOCOL

**Propósito:** Documento operativo que define el ritual de cierre y apertura de chats con agentes, y la "frase clave" que permite reanudar conversaciones sin pérdida de contexto.

---

## 1) Ritual de cierre de chat (al terminar una sesión)
- Resumir en 2–3 frases el estado actual: qué se hizo, qué queda pendiente, y cuál es el próximo paso inmediato.
- Confirmar y listar los artefactos relevantes (nombres de archivos, tickets o issues) y su ubicación exacta en el repositorio.
- Anotar la fecha y el responsable del siguiente paso (si aplica) usando formato: YYYY-MM-DD — Owner: <TBD|nombre>.
- Guardar la transcripción esencial (si procede) en el issue/PR que sincroniza la tarea.
- Cerrar la sesión con la frase: "Cierre: contexto guardado — listo para retomar." y publicar la **Frase clave** (ver sección 3).

## 2) Ritual de apertura de nuevo chat (al retomar)
- Copiar/Pegar la **Frase clave** (exacta) en el primer mensaje del nuevo chat.
- Leer **memoria compartida de agentes:** `AGENTS.md` y `.ai-memory/active/session_context.md` (y `CODEX_CONTEXT.md` si existe).
- Añadir un enlace o referencia a los artefactos relevantes listados en el cierre (ej.: `docs/00_SOURCE_OF_TRUTH.md#...`, `Issue #123`).
- Resumir brevemente (1–2 líneas) lo que se espera del nuevo chat (objetivo y resultado esperado).
- Si se reanuda una acción técnica, incluir el estado del entorno: rama git, commit SHA, y si procede, el estado del entorno de ejecución (dev/staging).

## 3) Frase clave (usar exactamente, copy/paste)
"REANUDAR CONTEXTO: repo=analisis_cabalistico_alma; memory=AGENTS.md+.ai-memory/active/session_context.md; doc=01_PROJECT_STATE/PROJECT_STATE_CURRENT.md; prod=studios33.app; owner=TBD"

> Uso: pegar la frase clave completa como primer mensaje permite al equipo/agent recuperar rápidamente el estado y los artefactos vinculados; además facilita búsquedas y trazabilidad.

---

## 4) Notas operativas
- Este protocolo es **VINCULANTE** para el flujo de trabajo con agentes y debe usarse en cualquier interacción formalizada que requiera continuidad de contexto.
- No cambia políticas existentes de gobernanza; solo estandariza la forma de cerrar/reabrir sesiones con trazabilidad.
- Cualquier cambio al protocolo debe registrarse en un PR referenciado y aprobado por el comité de gobernanza.

---

*Documento operativo — enero 2026*