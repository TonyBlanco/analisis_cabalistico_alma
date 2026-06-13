# Workspaces del terapeuta

## Objetivo

Aquí se resume qué hace cada workspace visible desde el menú del terapeuta y cuándo usar cada uno.

## Puntos de entrada

### Clínicos principales

- **Cabala Aplicada** (`/dashboard/therapist/cabala-aplicada`): vista simbólica principal con árbol, correspondencias e interpretación cabalística del consultante activo.
- **Correspondencias** (`/dashboard/therapist/correspondencias`): tablas de referencia para lectura comparada entre sistemas simbólicos.
- **Bio-Emoción** (`/dashboard/therapist/bioemotional-experiencial-profunda`): espacio estructurado para notas de sesión y contexto bioemocional.

### Workspaces transgeneracionales y relacionales

- **Transgeneracional Profundo** (`/dashboard/therapist/transgeneracional-profundo`): árbol genealógico observacional + registro de eventos transgeneracionales. Ahora cableado al backend con CRUD completo para personas (incluye campos Armoni: número de orden, fallecido, aborto, rama) y eventos con vinculación de personas.
- **Resonancia Ancestral** (`/dashboard/therapist/resonancia-ancestral`): módulo para mapear resonancias entre generaciones (resonancia por número, complejos, duplicas, síndrome de aniversario, etc.). Solo observacional — el terapeuta confirma manualmente cada resonancia.

### Tests holísticos y simbólicos

- **Holística Aplicada** (`/dashboard/therapist/holistica-aplicada`): workspace para aplicar y revisar la batería holística (SHA, EAT26, DUDIT, YBOCS, ASRS, AQ y otros). Los tests se asignan desde el catálogo y los resultados aparecen aquí con banda y guía de interpretación.
- **MCMI-4 Místico** (`/dashboard/therapist/mcmi4-mystic`): espacio para trabajar el perfil clínico-simbólico derivado del MCMI-4.

### Operativos

- **Reportes** (`/dashboard/therapist/reports`): cartera de consultantes, resultados recientes con alertas, métricas por consultante, sesiones y export CSV. Datos vía `GET /api/therapist/reports/summary/`. Úsalo para revisión de cola de trabajo y seguimiento agregado.
- **Tests** (`/dashboard/therapist/tests`): catálogo de tests asignables. Permite asignar tests al consultante activo. El estado de cada test (pendiente/completado/revisado) aparece en la ficha del consultante.

### Otros

- **SCDF** (`/dashboard/therapist/scdf`): herramienta de formulación de caso basada en evidencia.
- **Astrología** (`/dashboard/therapist/astrologia`): catálogo simbólico astrológico del consultante.
- **Aprender** (`/dashboard/therapist/learn`): este Centro de Aprendizaje.

## Regla de uso

Abre solo el workspace que corresponda a la tarea actual. No mezcles superficies si no necesitas mover datos entre ellas. Los workspaces transgeneracionales (Transgeneracional Profundo, Resonancia Ancestral) son solo observacionales: no generan inferencias automáticas.

## Cambio de consultante activo

El indicador de consultante activo (parte superior del dashboard) controla qué datos cargan todos los workspaces. Al cambiar de consultante, cada workspace recarga automáticamente los datos del nuevo consultante activo.
