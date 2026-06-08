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

Guardar decisiones explícitas:

```bash
python3 memory_manager.py store "[DECISION] resumen — contexto"
python3 memory_manager.py store "[DEPLOY] qué se desplegó — commit SHA"
python3 memory_manager.py dump --out CODEX_CONTEXT.md
```

Actualizar `.ai-memory/active/session_context.md` (focus, next steps, HEAD).

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

## Grok (Cursor)

- Leer este archivo + `session_context.md` al inicio
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