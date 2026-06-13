# Plan — Mapa de Resonancias Ancestrales (Transgeneracional Profundo + Resonancia Ancestral)

> Activar de verdad los dos módulos que hoy "no hacen nada": **Transgeneracional Profundo** y **Resonancia Ancestral**. Objetivo: convertir el árbol familiar en un **mapa de resonancias** entre miembros (hermano↔hermano, padre↔abuelo, sobrino↔tío…) al estilo de las clases del Dr. Almoni/Armoni, como herramienta **observacional** (no diagnóstica) para el terapeuta.

## 1. Estado real del código

| Pieza | Transgeneracional Profundo | Resonancia Ancestral |
|---|---|---|
| Ruta FE | `(swm)/transgeneracional-profundo` | `(swm)/resonancia-ancestral` |
| Estado UI | Shell mínimo, paneles placeholder | UI ~1590 líneas, scaffolding T1–T4 — **read-only, sin llamadas backend** |
| Backend | App `swm.transgenerational`, modelos `GenealogyPerson`, `GenealogyEvent`, `BioTransgenerationalHypothesis` | Modelo `ResonanciaObservation` + endpoints `/api/resonancia/observations/` y `/api/resonancia/relations/` |
| Cableado FE↔BE | ❌ | ⚠️ Parcial |

Dato clave: `GenealogyPerson` ya guarda estructura por generaciones (`generation`: 0=consultante, −1=padres…), `relation`, nombre, fechas y notas. `GenealogyEvent` vincula eventos a personas. **Falta la pieza de aristas de resonancia tipadas entre personas.**

## 2. Marco conceptual

### 2.a El concepto (clases Dr. Armoni)

No es solo dibujar el árbol: es mapear **con qué resuena cada miembro**:
- Hermano ↔ hermano
- Padre ↔ hermano, abuelo o tío
- Consultante ↔ antepasado
- Casos avanzados: **"complejo del tío"**

### 2.b Marco Rab Armoni — resonancia por número de orden

**Patrón nuclear:** a cada miembro se le asigna su número de orden de nacimiento entre hermanos (contando abortos y fallecidos). Esos números se proyectan sobre las tres columnas del Árbol de la Vida:

- Columna derecha: **1 Jojmá · 4 Jesed · 7 Netzaj**
- Columna izquierda: **2 Biná · 5 Guevurá · 8 Hod**
- Columna del medio: **3 Daat · 6 Tiferet · 9 Yesod**

**Resuenan entre sí los que comparten grupo: 1-4-7, 2-5-8, 3-6-9**. La influencia fluye de arriba hacia abajo (1→4→7, 2→5→8, 3→6→9).

**Huecos por aborto:** un aborto/fallecimiento ocupa un número; si falta el número que debía "rectificarte", aparece sensación de estancamiento.

**Taxonomía de resonancias (v1):**
- Resonancia por número (1-4-7 / 2-5-8 / 3-6-9)
- Complejo del tío/tía
- Dúplica generacional
- Repetición de nombre
- Síndrome de aniversario
- Hueco por aborto/fallecido
- Proyecto objetivo (5 ventanas perinatales)
- Mismo rol/lugar en el sistema

### 2.c Marco Constelaciones Familiares (Hellinger)

**Órdenes del Amor:**
- **Pertenencia**: todos pertenecen (incluidos abortos, parejas anteriores, víctimas, perpetradores). Los excluidos/olvidados generan **implicancia**: un descendiente los representa sin saberlo.
- **Jerarquía/orden temporal**: quien llegó antes tiene precedencia.
- **Equilibrio dar-recibir**: entre pareja y entre generaciones.

**Match con Armoni:** el descendiente que resuena por número suele ser quien carga la implicancia del excluido → *complejo del tío*.

**Tipos adicionales:** `exclusion`, `lealtad_invisible`, `asunto_de_orden`.

## 3. Funcionalidad propuesta

1. **Editor de árbol** (reemplaza placeholders): CRUD personas por generación, relación, fechas, notas.
2. **Editor de resonancias**: arista tipada entre dos personas con tipo, relevancia, nota, fuente.
3. **Vista de grafo de resonancias**: nodos agrupados por generación, aristas coloreadas por tipo, filtros.
4. **Catálogo educativo** de patrones (complejo del tío, etc.) — descriptivo, nunca diagnóstico.
5. **Motor de sugerencias** (Armoni): con P1+P2 completos, sugiere resonancias 1-4-7 / 2-5-8 / 3-6-9 automáticamente; el terapeuta confirma/edita.

## 4. Captura del cliente (opt-in del terapeuta)

Flowl solo si el terapeuta decide activarlo para un paciente concreto.

### Cuestionario modular Armoni (P1–P6)

| Parte | Qué pregunta | Qué popula | Para qué análisis |
|---|---|---|---|
| P1 · Estructura familiar | Padres, abuelos, hermanos, tíos de ambos lados | `GenealogyPerson` | Árbol base |
| P2 · Orden y fechas | Orden de nacimiento incl. abortos/fallecidos, fechas | `birth_order_number`, `is_abortion`, `is_deceased` | Motor resonancia 1-4-7 |
| P3 · Eventos del sistema | Muertes, enfermedades, migraciones, secretos | `GenealogyEvent` | Síndrome de aniversario |
| P4 · Repeticiones | Nombres, profesiones, enfermedades, patrones | candidatos `ResonanceLink` | Capa resonancias |
| P5 · Resonancias subjetivas | ¿Con quién te pareces? ¿Qué conflictos compartes? | `ResonanceLink` (source=cliente) | Grafo de resonancias |
| P6 · Constelaciones | Excluidos, lealtades invisibles, tu lugar | observaciones + relaciones tipadas | Constelaciones familiares |

### Cuestionario modular Hellinger (C1–C7)

| Parte | Qué explora | Qué popula |
|---|---|---|
| C1 · Pertenencia | Excluidos/olvidados, abortos, parejas anteriores | `GenealogyPerson` excluido + `ResonanceLink` `exclusion` |
| C2 · Orden/jerarquía | Roles inadecuados, hijo parentalizado | observación `asunto_de_orden` |
| C3 · Equilibrio dar-recibir | Deudas, sacrificios, desbalances | nota de equilibrio |
| C4 · Lealtades e identificaciones | ¿Con quién cargo algo? ¿Repito su destino? | `ResonanceLink` `lealtad_invisible` |
| C5 · Movimiento interrumpido | Separaciones tempranas, adopción | `GenealogyEvent` + nota |
| C6 · Secretos y tabúes | Muertes ocultas, paternidades, silenciados | `GenealogyEvent` (secreto) |
| C7 · Frases del sistema | Lo que "se dice" en la familia, sensación somática | nota/anchor |

## 5. Modelo de datos (aditivo)

- ✅ `GenealogyPerson` (ya existe) — nodos del árbol
- ✅ `GenealogyEvent` (ya existe) — eventos del sistema
- 🆕 **`ResonanceLink`** / extender `ResonanciaRelation`: `patient`, `person_a`, `person_b`, `resonance_type`, `relevance` (low/med/high), `note`, `source_ref`, `source` (terapeuta/cliente), timestamps
- 🆕 Catálogo de `resonance_type` como enum versionado

> Verificar el shape de `ResonanciaRelation` existente antes de crear nuevo modelo.

## 6. Estado de implementación

### Resonance Map F1 — Backbone de datos (PR #39) ✅ LISTO PARA MERGE

- [x] `GenealogyPerson` + 4 campos Armoni (`birth_order_number`, `is_deceased`, `is_abortion`, `side`)
- [x] `ResonanciaRelation` extendida: 11 tipos de taxonomía Armoni/Hellinger
- [x] `ResonanceClientCapture` nuevo modelo (`unique_together(therapist, patient)`)
- [x] 2 endpoints nuevos: `GET/PATCH/DELETE /api/resonancia/relations/<pk>/` y `GET/PATCH /api/resonancia/client-capture/`
- [x] Fix `0101_telegram_notifications.py` para SQLite — desbloquea tests locales
- [ ] Merge + `migrate api 0108` → cierra drift modelos de `0106`

### Resonance Map F2 — Vista Árbol cableada (PR #40) ✅ LISTO PARA MERGE (tras #39)

- [x] `lib/api/genealogy-api.ts` — cliente TS completo (tipos + CRUD 6 funciones)
- [x] `GenealogyPersonPanel.tsx` — CRUD personas con 4 campos Armoni
- [x] `GenealogyEventPanel.tsx` — CRUD eventos, vinculación personas por checkbox
- [x] `TransgenerationalDeepWorkspace/index.tsx` — reemplaza placeholders; reactivo a `activePatientChanged`
- [ ] Merge tras #39 + smoke: seleccionar consultante → árbol carga → añadir/editar persona

### Resonance Map F3 — Motor sugerencias + Vista grafo ⏳ En ejecución

- [ ] Motor sugerencias resonancias 1-4-7 / 2-5-8 / 3-6-9 (calculado automáticamente)
- [ ] Vista grafo de resonancias (nodos por generación, aristas coloreadas)

## 7. Fases de implementación

1. **F0 Gobernanza**: contrato NO-clínico, disclaimers, etiquetas cálidas
2. **F1 Backbone** ✅ (PR #39): confirmar/extender modelos + endpoints CRUD
3. **F2 Editor árbol** ✅ (PR #40): cablear Transgeneracional Profundo al backend
4. **F3 Grafo + aristas**: cablear Resonancia Ancestral + editor de resonancias
5. **F4 Catálogo** taxonomía Almoni + tooltips educativos
6. **F5 Motor sugerencias** 1-4-7 con captura cliente (P1+P2)
7. **F6 Tests + auditoría** y disclaimers

## 8. Gobernanza (no negociable)

- Observacional y descriptivo; **prohibido** lenguaje clínico/diagnóstico, inferencias automáticas o causalidad determinista
- Terapeuta como único autor de resonancias; cliente solo aporta datos crudos (curados por terapeuta)
- Visibilidad por defecto solo-terapeuta
- Respeta "Los Órdenes de la Ayuda" (Hellinger): sistémico, sin juicio, sin diagnóstico

## 9. Decisiones tomadas

- [x] **Un solo módulo unificado**: dos rutas que comparten backbone de datos
- [x] **Captura del cliente como test modular por partes** (P1–P6 Armoni + C1–C7 Hellinger)
- [x] **Taxonomía v1** cerrada sobre las 10 clases del Rab Armoni, incluido *complejo del tío*
- [x] **Dos cuestionarios complementarios**: Armoni (mapa estructural) + Hellinger (dinámicas)
- [x] Refresco del panel del terapeuta: `refetchOnWindowFocus` + polling suave (30–60s) + botón manual + badge de novedades
