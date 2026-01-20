# Motor de Transición Simbólica — Documentación Técnica

> **Componente Central**: `ExplorationSuggestionModal.tsx`  
> **Estado**: ✅ Implementado y Activo  
> **Última actualización**: Enero 2026

---

## 🎯 Propósito

El **Motor de Transición Simbólica** es el sistema que guía al terapeuta desde un resultado de exploración hacia la siguiente etapa del proceso terapéutico, basándose en el modelo cabalístico de los Cuatro Mundos.

El modal `ExplorationSuggestionModal` es la **pieza central** de este motor: traduce los datos estructurados del resultado (mundo actual, mundo sugerido, nivel Atzilut, ritmo esencial) en una **explicación clínica pedagógica** que el terapeuta puede entender y actuar.

---

## 🌳 Modelo de los Cuatro Mundos

```
┌─────────────────────────────────────────────────────────────┐
│  ATZILUT (אצילות) — Unidad y Esencia                        │
│  ↓ Cuando la esencia no sostiene...                         │
├─────────────────────────────────────────────────────────────┤
│  BERIÁ (בריאה) — Intelecto y Conciencia                     │
│  ↓ Cuando hay claridad mental...                            │
├─────────────────────────────────────────────────────────────┤
│  IETZIRÁ (יצירה) — Emoción y Regulación                     │
│  ↓ Cuando hay movimiento emocional...                       │
├─────────────────────────────────────────────────────────────┤
│  ASIÁ (עשיה) — Acción y Cuerpo                              │
│  El mundo de la manifestación física                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Arquitectura del Motor

### Flujo de Datos

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Test Execution  │────▶│  Backend Engine  │────▶│  Result Payload  │
│  (ASRS, SCL-90)  │     │  (Django API)    │     │  structured_data │
└──────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                           │
                    ┌──────────────────────────────────────┘
                    ▼
         ┌──────────────────────────────────────────────────┐
         │  structured_data: {                              │
         │    rhythm_state: "fragmented",                   │
         │    atzilut_level: "low",                         │
         │    transition_suggestion: "beria",               │
         │    score_total: 2.62                             │
         │  }                                               │
         └──────────────────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────────────────────────────────┐
         │  ReadableResult.tsx                              │
         │  - Extrae structuredData                         │
         │  - Muestra "Sugerencia de Transición"            │
         │  - Botón "Ver motivo" → abre modal               │
         └──────────────────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────────────────────────────────┐
         │  ExplorationSuggestionModal.tsx                  │
         │  ═══════════════════════════════════════════════ │
         │  PIEZA CENTRAL DEL MOTOR DE TRANSICIÓN           │
         │  ═══════════════════════════════════════════════ │
         │  - Lectura simbólica (explicación del porqué)    │
         │  - Transición visual (Desde → Hacia)             │
         │  - Traducción clínica (enfoque terapéutico)      │
         │  - Tests recomendados (acción concreta)          │
         │  - Nota ética (criterio profesional)             │
         └──────────────────────────────────────────────────┘
```

---

## 📁 Archivos Involucrados

| Archivo | Rol | Ubicación |
|---------|-----|-----------|
| `ExplorationSuggestionModal.tsx` | **Componente central** — Modal de explicación clínica | `components/` |
| `ReadableResult.tsx` | Renderiza resultados y dispara el modal | `components/test-results/` |
| `ResultSuggestionsCard.tsx` | Card alternativa de sugerencias | `components/test-results/` |
| `test-api.ts` | Fetch de resultados con `credentials: 'include'` | `lib/` |

---

## 🔧 Props del Modal

```typescript
interface ExplorationSuggestionModalProps {
  open: boolean;                    // Control de visibilidad
  onClose: () => void;              // Callback al cerrar
  currentWorld?: string | null;     // Mundo actual (atzilut, beria, etc.)
  nextWorld?: string | null;        // Mundo sugerido (transition_suggestion)
  atzilutLevel?: string | null;     // Nivel: "low", "medium", "high"
  rhythmState?: string | null;      // Estado: "anchored", "fluctuating", "fragmented"
  onAssignTest?: (code: string) => void;  // Callback para asignar test
}
```

---

## 🎨 Contenido del Modal

### 1. Lectura Simbólica
Explica el **porqué** de la transición basándose en el ritmo esencial y el nivel Atzilut.

> *"El resultado indica un ritmo esencial **fragmentado** con nivel Atzilut **bajo**. 
> Cuando la esencia no sostiene el ritmo vital, el siguiente paso es recuperar la comprensión."*

### 2. Transición Visual
Muestra los dos mundos con sus colores distintivos:

```
┌─────────────┐         ┌─────────────┐
│   DESDE     │   →     │   HACIA     │
│  Atzilut    │         │   Beriá     │
│  Esencia    │         │  Intelecto  │
└─────────────┘         └─────────────┘
   (violeta)              (azul)
```

### 3. Traducción Clínica
El enfoque terapéutico específico del mundo sugerido:

> *"Evaluar cómo la persona piensa, organiza y da sentido a su experiencia. 
> Explorar patrones cognitivos y sistemas de creencias."*

### 4. Tests Recomendados
Lista concreta de exploraciones para ese mundo:

- Wellness Assessment
- Screening Psicológico General
- SCL-90 (Visión Holística)

### 5. Nota Ética
Recordatorio de que la sugerencia es orientativa:

> *"Esta sugerencia es orientativa y basada en el modelo simbólico cabalístico. 
> La decisión final corresponde al criterio profesional del terapeuta."*

---

## 🔒 Comportamiento UX

| Aspecto | Comportamiento |
|---------|----------------|
| **Visibilidad** | Solo terapeutas (nunca pacientes) |
| **Apertura automática** | Una sola vez por resultado (primera visualización) |
| **Apertura manual** | Botón "Ver motivo" siempre disponible |
| **Persistencia** | Usa `sessionStorage` para recordar si ya se mostró |
| **Bloqueo** | No bloquea el flujo — se puede cerrar y continuar |

---

## 🗂️ Metadatos de Mundos

El modal contiene un diccionario interno `WORLD_METADATA` con información estructurada de cada mundo:

```typescript
const WORLD_METADATA = {
  atzilut: {
    name: 'Atzilut',
    hebrewName: 'אצילות',
    domain: 'Unidad y Esencia',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50 border-violet-200',
    description: 'El mundo de la emanación pura...',
    clinicalFocus: 'Explorar la conexión con el propósito vital...',
    suggestedTests: [
      { code: 'past-lives', name: 'Exploración de Vidas Pasadas' },
      { code: 'asrs_essence', name: 'ASRS-Essence (Ritmo Esencial)' },
    ],
  },
  // ... beria, yetzirah, assiah
};
```

---

## 🔄 Explicaciones de Transición

El modal usa un diccionario `TRANSITION_EXPLANATIONS` que mapea transiciones específicas:

```typescript
TRANSITION_EXPLANATIONS = {
  atzilut: {
    beria: 'Cuando la esencia no sostiene, el siguiente paso es recuperar la comprensión...',
    yetzirah: 'Desde la esencia fragmentada, a veces el camino directo es reconectar...',
    assiah: 'La esencia necesita anclarse en lo concreto...',
  },
  // ... otras transiciones
};
```

---

## 📌 Integración con Backend

El backend debe devolver `structured_data` con estos campos para activar el motor:

```json
{
  "structured_data": {
    "rhythm_state": "fragmented",
    "atzilut_level": "low",
    "transition_suggestion": "beria",
    "score_total": 2.62
  }
}
```

Alternativamente, puede usar `therapist_next_exploration_suggestion`:

```json
{
  "therapist_next_exploration_suggestion": {
    "current_world": "atzilut",
    "next_world": "beria",
    "suggested_test_code": "wellness",
    "suggested_test_name": "Wellness Assessment"
  }
}
```

---

## ✅ Checklist de Verificación

- [ ] El modal se abre automáticamente la primera vez (solo terapeuta)
- [ ] El botón "Ver motivo" funciona correctamente
- [ ] Se muestra el mundo correcto (desde/hacia)
- [ ] La explicación simbólica es coherente con el resultado
- [ ] Los tests recomendados corresponden al mundo sugerido
- [ ] El modal no aparece para pacientes
- [ ] El JSON técnico está oculto por defecto

---

## 🔮 Futuras Mejoras

1. **CTA de asignación directa**: Permitir asignar test desde el modal
2. **Historial de transiciones**: Mostrar el camino recorrido por el paciente
3. **Personalización por terapeuta**: Ajustar los textos según preferencias
4. **Integración con inteligencia del sistema**: Sugerencias basadas en patrones previos

---

> **Documento normativo**: Este documento describe la pieza central del motor de transición simbólica.  
> **Mantener actualizado** al modificar `ExplorationSuggestionModal.tsx` o la lógica de transiciones.
