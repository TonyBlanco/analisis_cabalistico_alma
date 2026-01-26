# Antigravity Agent Guide

> **Objetivo**: Definir flujo de trabajo con agentes, selección de modelos, y uso de skills para máxima precisión.

---

## 🤖 Model Routing por Tipo de Tarea

| Prefijo | Modelo Recomendado | Uso | Fortaleza |
|---------|-------------------|-----|-----------|
| **AGENTE_ARQ >** | Claude Sonnet 4.5 / GPT-5.2 | Arquitectura, gobernanza, alcance | Razonamiento estructurado, no escribe código |
| **DEBUG >** | Claude Sonnet 4.5 | Diagnóstico root cause | Análisis profundo sin aplicar cambios |
| **CODE >** | Claude Sonnet 4.5 / Opus | Implementación precisa | Contexto largo, respeta restricciones |
| **DOCS >** | Claude Haiku / GPT-5.1 mini | Documentación, auditoría | Claridad, sin sobre-ingeniería |

---

## 📋 Protocolo de Selección de Skills

### Antes de CADA tarea, el agente DEBE:

1. **Identificar categoría de tarea** y buscar skill en `.agent/skills/`
2. **Leer el SKILL.md correspondiente** antes de ejecutar
3. **Seguir el proceso del skill** (ej: 4 fases de `systematic-debugging`)

### Skills Prioritarios
- **Backend**: `django-drf-patterns`, `python-development`
- **Frontend**: `react-best-practices`, `frontend-design`
- **Debugging**: `systematic-debugging` ⭐
- **AI/Agents**: `ai-agents-architect`, `mcp-builder`

---

## 📝 Template de Prompt

```markdown
<PREFIJO> >

**Skills aplicados**: [skill-1], [skill-2]

## Context
(1-3 líneas)

## Objetivo
(Una sola cosa clara)

## Restricciones
- ❌ NO tocar: [archivos]
- ✅ Scope: [límites]

## Entregables
1. Diff
2. Pasos de prueba
3. Verificación
```

---

## 🔄 Secuencia Obligatoria

```
AGENTE_ARQ → DEBUG → AGENTE_ARQ → CODE/DOCS → DEBUG (verificación)
```

---

## 🚨 Regla de Parada

- Sin prefijo válido → Asumir `AGENTE_ARQ` y PARAR
- Mezcla objetivos → Pedir reformulación
- Ambiguo → Pedir clarificación

**Silencio > Ejecución incorrecta**
