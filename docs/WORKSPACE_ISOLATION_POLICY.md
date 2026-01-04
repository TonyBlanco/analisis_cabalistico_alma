# WORKSPACE_ISOLATION_POLICY.md

## Política de Aislamiento de Workspaces y Control de Exportación

**Estado:** ACTIVA
**Autoridad:** Arquitectura / Gobernanza
**Compatibilidad:** `PROJECT_LOCK.md`
**Fecha de entrada en vigor:01/04/2025*

## 1) OBJETIVO

Establecer una **política obligatoria de aislamiento total entre Workspaces** con el fin de:

* Reducir complejidad cognitiva
* Eliminar confusión en el Workspace del terapista
* Evitar contaminación semántica y clínica
* Garantizar trazabilidad, control humano y claridad operativa

Esta política redefine cómo se **genera, gestiona, comparte y exporta** la información entre Workspaces.

---

## 2) PRINCIPIO FUNDAMENTAL (NO NEGOCIABLE)

> **Cada Workspace es soberano de su información.**

Esto implica que **ningún Workspace**:

* lee información viva de otro Workspace
* comparte información automáticamente
* depende de estados globales implícitos

---

## 3) DEFINICIÓN DE WORKSPACE

Un Workspace es una **unidad cerrada** que contiene:

* Su propio modelo de datos
* Su propio historial
* Su propia lógica
* Su propia interfaz
* Su propio contexto semántico

Un Workspace **no es**:

* una vista de datos globales
* un agregador automático
* un nodo de sincronización

---

## 4) AISLAMIENTO ENTRE WORKSPACES

### 4.1 Regla general

* ❌ Prohibido compartir datos de forma automática
* ❌ Prohibido consumir estados vivos de otros Workspaces
* ❌ Prohibido sincronizar o replicar información implícitamente

Cada Workspace opera **como si los demás no existieran**.

---

## 5) WORKSPACE DEL TERAPISTA — ROL ESPECIAL

El Workspace del terapista es el **único punto de convergencia**, pero **NO es un hub de datos vivos**.

### Contiene exclusivamente:

1. **Arco clínico**
2. **Notas clínicas**
3. **Anotaciones manuales**
4. **Referencias exportadas explícitamente desde otros Workspaces**

No contiene:

* estados técnicos
* datos intermedios
* contextos simbólicos vivos
* sincronizaciones automáticas

---

## 6) MECANISMO ÚNICO DE COMPARTICIÓN

### (EXPORTACIÓN EXPLÍCITA)

### 6.1 Principio

> **Nada sale de un Workspace sin una acción consciente del terapista.**

---

### 6.2 Modalidad

Cada Workspace puede ofrecer una acción explícita:

**“Exportar al Workspace del Terapista”**

Esta acción es:

* manual
* consciente
* trazable
* reversible solo a nivel documental (no técnico)

---

### 6.3 Naturaleza de la exportación

Lo exportado se convierte en:

* texto estructurado
* snapshot
* resumen
* referencia

Y pasa a ser:

> **una nota estática bajo control del terapista**

---

## 7) QUÉ SE PUEDE EXPORTAR

✔ Permitido:

* Resúmenes finales
* Observaciones
* Snapshots cerrados
* Resultados concluidos
* Texto interpretativo validado

❌ Prohibido:

* Estados internos
* Flags técnicos
* Datos intermedios
* Contexto algorítmico
* Dependencias del Workspace origen

---

## 8) EFECTO POST-EXPORTACIÓN

Una vez exportado:

* ❌ No existe vínculo vivo
* ❌ No hay sincronización
* ❌ No hay actualización automática
* ❌ No hay dependencia del Workspace origen

El contenido exportado **no arrastra lógica**, solo significado humano.

---

## 9) IMPLICACIONES PARA AGENTES / IA

* Ningún agente puede acceder a múltiples Workspaces simultáneamente
* Ningún agente puede inferir estados globales
* Los agentes solo reciben:

  * lo que el terapista exportó
  * en formato estático

Esto reduce riesgos de:

* inferencia indebida
* errores clínicos
* contaminación semántica

---

## 10) CUMPLIMIENTO Y CONTROL

* Todo Workspace nuevo debe cumplir esta política
* Todo refactor debe eliminar dependencias implícitas
* Las violaciones se consideran **errores arquitectónicos**

---

## 11) RELACIÓN CON DOCUMENTOS CANÓNICOS

Este documento es complementario y obligatorio junto a:

* `PROJECT_LOCK.md`
* `DOCUMENTATION_GOVERNANCE.md`
* `ARCHITECTURE_SYMBOLIC_SYSTEM.md`
* `SWM_V3_GOVERNANCE_ARTIFACTS.md`
* `WORKSPACE_EXPORT_CONTRACT.md`

En caso de conflicto, prevalece la gobernanza y el lock.

---

## 12) EXCEPCIONES

No existen excepciones técnicas.

Cualquier excepción requerirá:

* Documento explícito
* Auditoría SCE
* Aprobación formal
* Nuevo desbloqueo (`PROJECT_UNLOCK.md`)

---

## 13) FIRMA DE POLÍTICA

**Responsable:** ___________________________
**Rol:** Arquitectura / SCE
**Fecha:** ___________________________

---

## NOTA FINAL

Esta política existe para **simplificar**, **proteger** y **hacer legible** el sistema.

A partir de ahora:

* los Workspaces piensan solos
* el terapista decide qué une
* el sistema deja de adivinar

---



DECISIÓN SCE CONFIRMADA
❗ Los Workspaces existentes NO se reescriben ni se migra su data

Motivo

Existen 3–4 Workspaces altamente complejos

Reiniciar o rediseñar su modelo de datos sería:

costoso

arriesgado

innecesario

El riesgo de romper lógica validada es inaceptable

📌 Conclusión SCE:
👉 La data existente es intocable.

ENFOQUE CORRECTO (SIN REHACER NADA)
🔒 Principio

Aislar comportamiento ≠ rehacer datos

No tocamos:

esquemas

tablas

modelos

históricos

lógica interna validada

Solo actuamos en el perímetro.

1️⃣ QUÉ SE HACE (permitido)
✅ Encapsulación por capa

En cada Workspace existente:

Se mantiene toda la data tal cual

Se mantiene la lógica interna

Se mantiene su UI principal

Solo se añade (si no existe):

una capa de frontera (boundary layer)

Ejemplos de frontera:

Adapter

Exporter

Snapshot builder

Summary generator

Nada más.

2️⃣ QUÉ SE PROHÍBE (explícito)

❌ Migrar data

❌ Unificar modelos

❌ Normalizar entre Workspaces

❌ Compartir tablas

❌ Introducir estados globales

❌ Recalcular históricos

Esto rompería el lock.

3️⃣ CÓMO SE APLICA LA NUEVA POLÍTICA A WORKSPACES VIEJOS
Regla SCE clave

Un Workspace antiguo puede seguir siendo complejo internamente,
pero hacia afuera se comporta como una caja negra.

Implicaciones

Internamente:

puede seguir usando datos compartidos antiguos

puede tener cruces históricos

Externamente:

no expone nada automáticamente

no lee nada automáticamente

4️⃣ MECANISMO DE TRANSICIÓN (sin refactor)

Para cada Workspace existente:

A) Se deja todo igual internamente

(no tocar nada)

B) Se define UNA salida oficial

Ejemplo:

exportSummary()

exportSnapshot()

exportObservations()

Esa salida:

transforma data compleja en:

texto

resumen

snapshot

sin referencias vivas

sin dependencias

5️⃣ WORKSPACE DEL TERAPISTA (compatibilidad total)

El Workspace del terapista:

❌ NO consume data viva

❌ NO se conecta a modelos antiguos

❌ NO entiende la complejidad interna

Solo recibe:

lo que el Workspace exportó

como nota estática

con origen identificado

Esto protege al terapista y no rompe nada existente.

6️⃣ CLASIFICACIÓN SCE DE WORKSPACES

A partir de ahora, internamente puedes pensar así:

Tipo A — Workspaces legacy complejos

No se tocan

Se encapsulan

Solo exportan resúmenes

Tipo B — Workspaces nuevos

Nacen ya aislados

Cumplen la política desde el inicio

Ambos conviven sin conflicto.

7️⃣ RESULTADO FINAL (clave)

✅ No se pierde nada

✅ No se reescribe nada

✅ No se rompe lógica compleja

✅ Se elimina la confusión en el terapista

✅ El sistema vuelve a ser legible

Esto es arquitectura madura, no reset.



MATRIZ DE WORKSPACES EXISTENTES (AUDITORÍA SCE)
PASO 1 — IDENTIFICACIÓN
Workspace del Terapista: Dominio funcional: Dashboard clínico, notas integrativas, visualización Body/Soul. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
Astrología Profesional: Dominio funcional: Cálculo y visualización de cartas astrales. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
Tarot / B.O.T.A. (SWM v3): Dominio funcional: Lecturas simbólicas, interpretación gobernada. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
Resonancia Ancestral: Dominio funcional: Exploración de patrones ancestrales. Tipo: LEGACY SIMPLE. Nivel de riesgo si se modifica data: MEDIO.
MSHE: Dominio funcional: Síntesis holística evaluativa. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
SCID5: Dominio funcional: Exploración clínica holística. Tipo: LEGACY SIMPLE. Nivel de riesgo si se modifica data: MEDIO.
Body/Soul Visualization: Dominio funcional: Visualización simbólica integrada. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
PASO 2 — MATRIZ
Workspace	Tipo	Data interna (intocable)	Complejidad	¿Comparte data hoy?	¿Debe dejar de compartir data automáticamente?	Tipo de salida permitida	Exportable al Workspace del Terapista	Notas SCE (riesgos, advertencias)
Workspace del Terapista	LEGACY COMPLEJO	Notas integrativas, registros clínicos	alta	no	sí	Resumen, Observaciones	N/A	Riesgo de contaminación cruzada si se integra con simbólicos; encapsular estrictamente.
Astrología Profesional	LEGACY COMPLEJO	Cartas astrales, efemérides, análisis	alta	no	sí	Snapshot, Resumen	Sí (manual)	Riesgo alto de modificación accidental; aislamiento obligatorio para evitar cambios en cálculos.
Tarot / B.O.T.A. (SWM v3)	LEGACY COMPLEJO	Lecturas simbólicas, contratos SWM	alta	no	sí	Snapshot, Observaciones	Sí (manual)	Riesgo arquitectónico si se sincroniza; no permitir vínculos vivos.
Resonancia Ancestral	LEGACY SIMPLE	Patrones ancestrales, UI	media	no	sí	Observaciones	Sí (manual)	Riesgo medio de acoplamiento; encapsular para evitar exportaciones automáticas.
MSHE	LEGACY COMPLEJO	Síntesis evaluativa, pesos, IA	alta	no	sí	Resumen	Sí (manual)	Riesgo de fuga de síntesis clínica; aislamiento estricto.
SCID5	LEGACY SIMPLE	Exploraciones holísticas, booleanos	media	no	sí	Observaciones	Sí (manual)	Riesgo de malinterpretación clínica; encapsular sin integración automática.
Body/Soul Visualization	LEGACY COMPLEJO	Estados estructurales, flujos simbólicos	alta	no	sí	Snapshot	Sí (manual)	Riesgo de auto-inyección en notas; encapsulación previa implementada.
PASO 3 — REGLAS DE TRANSICIÓN
Para cada Workspace legacy:

Workspace del Terapista: ❌ No se toca la data. ❌ No se migra. ❌ No se normaliza. Salida oficial: Export manual de resúmenes a notas. Sin vínculo vivo. Sin sincronización.
Astrología Profesional: ❌ No se toca la data. ❌ No se migra. ❌ No se normaliza. Salida oficial: Export manual de snapshot astral. Sin vínculo vivo. Sin sincronización.
Tarot / B.O.T.A. (SWM v3): ❌ No se toca la data. ❌ No se migra. ❌ No se normaliza. Salida oficial: Export manual de observaciones simbólicas. Sin vínculo vivo. Sin sincronización.
Resonancia Ancestral: ❌ No se toca la data. ❌ No se migra. ❌ No se normaliza. Salida oficial: Export manual de observaciones. Sin vínculo vivo. Sin sincronización.
MSHE: ❌ No se toca la data. ❌ No se migra. ❌ No se normaliza. Salida oficial: Export manual de resumen sintético. Sin vínculo vivo. Sin sincronización.
SCID5: ❌ No se toca la data. ❌ No se migra. ❌ No se normaliza. Salida oficial: Export manual de observaciones. Sin vínculo vivo. Sin sincronización.
Body/Soul Visualization: ❌ No se toca la data. ❌ No se migra. ❌ No se normaliza. Salida oficial: Export manual de snapshot visual. Sin vínculo vivo. Sin sincronización.
PASO 4 — CONCLUSIÓN SCE
Lista de Workspaces NO TOCAR: Workspace del Terapista, Astrología Profesional, Tarot / B.O.T.A. (SWM v3), MSHE, Body/Soul Visualization.

Lista de Workspaces listos para aislamiento inmediato: Resonancia Ancestral, SCID5.

Riesgos residuales: Contaminación cruzada si exportaciones manuales no se controlan; riesgo de modificación accidental en data legacy compleja.

Recomendaciones solo de encapsulación: Implementar UI de export manual en cada Workspace; remover cualquier listener automático de integración; validar aislamiento en auditorías futuras.

