# Fase Training / Interpretativa (No clínica)

## Propósito
Declarar una fase funcional **no clínica** para workspaces simbólicos que habilita interpretación simbólica estructurada con fines:
- educativos
- formativos
- investigativos

Esta fase es transversal y reutilizable (Astrología, Tarot, Árbol de la Vida, Bio‑Emoción, Transgeneracional, etc.).

---

## Principios rectores (vinculantes)

Prohibido:
- diagnóstico
- predicción clínica
- scoring
- decisiones automáticas
- persistencia clínica de resultados

Permitido:
- interpretación simbólica estructurada
- análisis humano obligatorio
- uso pedagógico y formativo
- IA solo como asistente explicativo/redacción (si aplica)

Regla ética:
> Interpretar no es diagnosticar.  
> Comprender no es decidir.

---

## Activación

Un workspace que soporte esta fase debe exponer un estado explícito:
- `mode: "observational"` (default)
- `mode: "training"` (opt‑in, visible)

Efecto mínimo:
- En `observational`: visualización/consulta sin paneles interpretativos.
- En `training`: habilitar métodos interpretativos (no clínicos) y copy/etiquetas visibles.

---

## Estructura UI mínima obligatoria (patrón reutilizable)

Contenedor principal (card/panel):
- Título: **“Interpretación simbólica – Modo Training (No clínico)”**
- Aviso visible: **“Uso educativo y formativo. No diagnóstico.”**

Todos los métodos deben poder convivir como acordeones independientes (multi‑open), sin interferir entre sí.

---

## 5 Métodos de Interpretación (marco reusable)

### MÉTODO 1 — Correspondencias Tradicionales
UI:
- Acordeón
- Tablas o listas explicativas

Contenido:
- Planeta ↔ función simbólica
- Casa ↔ ámbito de experiencia
- Signo ↔ estilo de expresión

Restricción:
- descriptivo (no conclusivo, no clínico)

---

### MÉTODO 2 — Preguntas Guía (Training)
UI:
- Panel de preguntas reflexivas
- Tooltips aclaratorios

Contenido:
- preguntas abiertas
- orientadas a observación y análisis humano

Ejemplos:
- “¿Cómo podría expresarse simbólicamente esta energía?”
- “¿Qué tensiones podrían explorarse a nivel interpretativo?”

---

### MÉTODO 3 — Síntesis Narrativa Estructurada
UI:
- Panel de texto estructurado
- Secciones claras (contexto, lectura simbólica, notas)

Contenido:
- narrativa pedagógica
- lenguaje condicional y explicativo

IA (si aplica):
- rol: asistente de redacción
- nunca decisor
- nunca clínico

---

### MÉTODO 4 — Análisis Comparativo
UI:
- panel comparativo (dos o más escenarios/lentes)

Contenido:
- diferencias de expresión simbólica
- enfoque educativo (formación avanzada)

---

### MÉTODO 5 — Hipótesis Simbólica de Trabajo (NO clínica)
UI:
- panel claramente etiquetado: **“Hipótesis simbólica (no clínica)”**

Contenido:
- posibles tensiones/dinámicas simbólicas
- siempre condicionales
- nunca afirmaciones cerradas

Nota visible obligatoria:
- “Hipótesis para análisis humano. No diagnóstica.”

---

## Copy y lenguaje (obligatorio)

Permitido:
- “lectura simbólica”
- “puede sugerir”
- “a nivel interpretativo”
- “hipótesis de trabajo”

Prohibido:
- “diagnostica”
- “indica que la persona es”
- “trastorno”
- “debe tratarse”

