# Multi-Agent Coordination — Studios33

Memoria compartida para **Claude Code**, **Grok (Cursor)**, **Codex** y otros agentes.

## Al iniciar sesión (obligatorio)

1. Leer `.ai-memory/active/session_context.md`
2. Opcional: `CODEX_CONTEXT.md` (generado al cerrar sesiones Claude)
3. Listar memoria reciente:
   ```bash
   source .venv/bin/activate
   python3 memory_manager.py list --n 15
   ```
4. Si la tarea es técnica, leer el doc de dominio en `docs/01_PROJECT_STATE/`

## Al cerrar sesión productiva

Guardar decisiones y **sincronizar contexto** (automático en tareas grandes):

```bash
python3 memory_manager.py store "[DECISION] resumen — contexto"
python3 memory_manager.py store "[DEPLOY] qué se desplegó — commit SHA"
python3 memory_manager.py sync-session
python3 memory_manager.py dump --out CODEX_CONTEXT.md
```

`sync-session` actualiza `session_context.md` con HEAD, rama, entradas recientes de `agent_log.md` y preserva Focus/Tasks/Next Steps.

Opcional — override al cerrar tarea grande:

```bash
python3 memory_manager.py sync-session \
  --focus "qué quedó pendiente" \
  --completed "lo que se hizo en esta sesión" \
  --next "primer paso del próximo chat"
```

**Grok:** ejecutar `sync-session` antes del último mensaje si la sesión tocó código, deploy o docs.

## Prevención de agotamiento de contexto

Las sesiones largas pierden el contexto cuando se acumula demasiado output de herramientas en una sola conversación. Reglas obligatorias:

### Durante la sesión

1. **Commit frecuente** — hacer commit al terminar cada workstream, no al final de la sesión. Un diff acumulado grande consume tokens en cada tool call posterior.
2. **Una feature, una sesión** — si la tarea toca >3 áreas distintas (backend + frontend + tests + docs), abrir una conversación nueva por área o por fase. No mezclar todo en el mismo chat.
3. **Checkpoint tras workstream completado** — usar `/save-session` o ejecutar manualmente:
   ```bash
   python3 memory_manager.py sync-session --focus "qué queda" --completed "qué se hizo" --next "primer paso"
   python3 memory_manager.py dump --out CODEX_CONTEXT.md
   ```
   Luego abrir chat nuevo y pegar la frase clave de `docs/CHAT_CONTINUITY_PROTOCOL.md`.

### Señales de alerta (actuar antes de quedarse sin contexto)

- Llevas >10 herramientas ejecutadas en la sesión
- Has leído >5 archivos distintos
- El working tree tiene >10 archivos modificados sin commit
- La tarea saltó de dominio (ej: empezaste en backend y ahora estás en FE+tests)

### Resumen de causas documentadas (2026-06-11)

La sesión anterior agotó contexto por: lectura de 6+ archivos de help assistant + learning center + dashboard + tests + rebase en dos ramas, todo sin commits intermedios. Working tree llegó a 22 archivos sucios.

## Etiquetas de memoria

| Prefijo | Cuándo |
|---------|--------|
| `[DECISION]` | Arquitectura, wiring, política |
| `[BUG]` | Bug encontrado y fix |
| `[ENDPOINT]` | API nueva o cambiada |
| `[DEPLOY]` | Hetzner / prod |
| `[SECURITY]` | Auth, secrets, PHI |

## Claude Code

Hooks en `.claude/settings.json`:
- **PostToolUse:** captura automática de tags en código
- **Stop:** prune + regenera `CODEX_CONTEXT.md`

Clasificar tarea (opcional):

```bash
python3 .claude/hooks/context_loader.py --dry-run "tu tarea"
```

## Grok / Cursor Agent

- **Regla automática:** `.cursor/rules/agent-memory.mdc` (`alwaysApply: true`) — Cursor inyecta lectura de memoria al inicio
- Refuerzo manual si hace falta: `Lee AGENTS.md y .ai-memory/active/session_context.md`
- Al cerrar: `python3 memory_manager.py sync-session`
- No commitear `grok.md` (export de chat local)
- Prod: `studios33.app` — deploy con `deploy/studios33/scripts/deploy.sh`

## Estructura memoria

```
.ai-memory/
  INDEX.md              ← índice gobernanza
  active/session_context.md  ← estado actual (mantener <2KB)
  architecture.md       ← stack y dominios
  decisions.md          ← decisiones técnicas
  bugs.md               ← bugs conocidos
  agent_log.md          ← log append-only (auto)
```

## Docs relacionados

- `docs/CHAT_CONTINUITY_PROTOCOL.md` — ritual cierre/apertura chats
- `docs/01_PROJECT_STATE/AI_MEMORY_LAYER.md` — instalación en este repo