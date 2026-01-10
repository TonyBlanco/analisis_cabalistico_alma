00_SOURCE_OF_TRUTH/DOCUMENTATION_GOVERNANCE.md
# Documentation Governance – Single Source of Truth

## Core Rule
Todo documento del proyecto DEBE vivir dentro de /docs.

No se permiten archivos .md en:
- root
- tonyblanco-app/
- backend/
- módulos sueltos

## Canonical Structure

00_SOURCE_OF_TRUTH
- Reglas, auditorías, contratos de verdad

01_PROJECT_STATE
- Estado actual, fases, changelog, decisiones cerradas

02_CORE_WORKSPACES
- Workspaces base (terapeuta, usuario, core)

**Regla de contenido:** Evitar lenguaje clínico en la documentación; priorizar terminología holística y de acompañamiento. El sistema NO proporciona diagnósticos médicos ni psicológicos. (Disclaimer obligatorio en secciones relevantes)

03_SWM_CONTRACTS
- Contratos de módulos simbólicos (SWM)

04_SYMBOLIC_SYSTEM
- Árbol, Sefirot, Tarot, símbolos, SVG semánticos

05_UX_PRINCIPLES
- Reglas UX, layout, interacción

## Mandatory Rule for Agents
Todo agente que cree un documento:
1. Debe elegir carpeta según contenido
2. Debe registrar su creación en PROJECT_STATE_CURRENT.md
3. Si no sabe dónde va → NO crea el archivo

## Status
Este documento es vinculante.
