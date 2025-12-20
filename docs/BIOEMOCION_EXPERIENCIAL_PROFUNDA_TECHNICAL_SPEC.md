# BIOEMOCION_EXPERIENCIAL_PROFUNDA_TECHNICAL_SPEC

## 1. Workspace Identity
Bio-Emocion Experiencial Profunda es un **Specialized Workspace Module (SWM)**.
Se define como un entorno de trabajo completo, autonomo y de foco profundo.

Diferencias clave:
- **No es un panel**: un panel es auxiliar y no sustituye el espacio de trabajo central.
- **No es el Core Workspace**: el Core es el punto de partida persistente; el SWM es un entorno especializado con reglas propias.
- **Es un espacio dedicado**: conserva el contexto clinico, pero con un ciclo y estados propios.

## 2. Entry & Exit Rules
**Entrada desde Core Workspace**
- Se accede mediante una accion explicita del terapeuta.
- Hereda el contexto activo: paciente, sesion y permisos.
- No modifica ni reemplaza el Core Workspace; se abre como transicion controlada.

**Salida y retorno**
- El terapeuta puede salir en cualquier momento.
- Al salir, el sistema retorna al Core Workspace con el contexto intacto.
- No se permite perdida de datos manuales no guardados sin confirmacion humana.

## 3. Workspace States
**Estados permitidos**
- **idle**: preparado, sin foco activo
- **observation**: observacion consultiva guiada por el terapeuta
- **analysis**: organizacion estructurada de datos observados
- **synthesis**: integracion de observaciones en notas humanas
- **closure**: cierre consciente de la sesion de trabajo

**Estados prohibidos**
- diagnostico
- scoring
- prediccion
- alerta clinica automatica
- automatizacion de decisiones terapeuticas

**Transiciones**
- Solo se permite avanzar o retroceder de forma explicita.
- No se permite salto directo a "closure" sin pasar por observacion o sintesis.

## 4. Visual Core Contract
- El cuerpo es el **ancla cognitiva** del SWM.
- **2D es obligatorio en P1**. 3D solo si:
  - no reemplaza el 2D
  - no altera el flujo consultivo
  - se mantiene el mismo conjunto de regiones semanticas

**Seleccion anatomica por sexo biologico**
- La anatomia visual se basa en `biologicalSex`, nunca en identidad de genero.
- Si `biologicalSex` es `unknown` o `not_recorded`:
  - se usa vista neutral o generica
  - nunca se infiere ni se asume sexo

## 5. Data Inputs
El SWM puede **leer**:
- Paciente activo
- Historial de notas humanas
- Diccionario bio-emocional
- Hipotesis transgeneracionales existentes
- Arbol de vida consultivo
- Bio-emotional super-JSON (solo lectura)

El SWM **nunca debe mutar**:
- AnalysisRecord
- Resultados clinicos
- Scoring o metricas
- Datos de consentimiento

## 6. Data Outputs
**Outputs permitidos**
- Notas humanas consultivas
- Observaciones estructuradas no diagnosticas
- Marcadores de atencion simbolica

**Naturaleza consultiva**
- Todo output es editable por el terapeuta
- Ningun output puede considerarse diagnostico

**Almacenamiento**
- Las salidas se registran como notas o registros de observacion
- No se insertan en flujos clinicos automaticos

## 7. AI Participation (Future-Safe Definition)
**Roles permitidos**
- Reformulacion neutral de notas del terapeuta
- Organizacion de observaciones en lenguaje claro

**Roles prohibidos**
- Diagnostico
- Evaluacion clinica automatica
- Scoring
- Recomendaciones terapeuticas

**Lenguaje obligatorio**
- Neutral, consultivo, sin certeza clinica
- Prohibidas palabras como "diagnostico", "riesgo", "severidad"

## 8. Therapeutic Boundaries
- Este SWM es **no diagnostico**.
- No sustituye evaluaciones clinicas formales.
- Todo proceso requiere intervencion humana explicita.
- Ningun output puede activar acciones clinicas automaticas.

## 9. Extensibility Hooks
Futuros modulos (meditacion, sonido, aromas) pueden:
- Conectarse como herramientas auxiliares no intrusivas
- Usar el contexto activo sin modificarlo

Prohibicion explicita:
- No se permite acoplar estos modulos al flujo interno del SWM
- No se permite cambiar estados del SWM desde modulos externos

## 10. Non-Goals (Very Important)
Este SWM **nunca hara**:
- Diagnostico medico
- Scoring o metricas de riesgo
- Automatizacion terapeutica
- Sustitucion de juicio clinico
- Acciones no solicitadas por el terapeuta
- Toma de decisiones basada en IA
