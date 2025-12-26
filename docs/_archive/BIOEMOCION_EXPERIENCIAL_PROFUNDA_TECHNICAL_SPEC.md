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

# Diseño Conceptual — Cuerpo 3D Experiencial  
## SWM Bio-Emoción Experiencial Profunda

---

## 1. Propósito del Cuerpo 3D Experiencial

El Cuerpo 3D Experiencial **no es un modelo médico**, **no es un simulador anatómico clínico**, ni una herramienta diagnóstica.

Es un **espacio de observación consciente** que permite al terapeuta y al paciente:

- Externalizar vivencias corporales internas
- Anclar emociones, memorias y símbolos al cuerpo vivido
- Facilitar procesos de conciencia, integración y re-significación
- Servir como puente entre:
  - Bio-Emoción
  - Árbol transgeneracional
  - Lenguaje simbólico
  - Procesos terapéuticos humanos

El cuerpo **no responde**, **no interpreta**, **no concluye**.  
El cuerpo **escucha, refleja y sostiene**.

---

## 2. Principio Rector: El cuerpo como territorio vivido

El modelo 3D representa el **cuerpo vivido**, no el cuerpo objetivado.

Esto implica:

- No se enfatizan órganos internos clínicos
- No se muestran patologías
- No hay indicadores de “normal / anormal”
- El cuerpo no “alerta”
- El cuerpo no “sugiere diagnóstico”

El cuerpo es un **mapa de experiencia**, no un mapa médico.

---

## 3. Relación sexo biológico / género (regla ética)

### 3.1 Sexo biológico (base anatómica)

El cuerpo 3D se selecciona **únicamente** según:

- `male`
- `female`
- `intersex`
- `unknown`

Esto responde a **realidades anatómicas necesarias** para:
- Parto
- Abortos
- Útero
- Testículos
- Herencia transgeneracional
- Simbolismo corporal profundo

Si el sexo biológico es `unknown`:
- Se utiliza un **modelo anatómico neutral**
- No se fuerza ninguna representación

### 3.2 Identidad de género (no modifica el cuerpo)

La identidad de género:

- **Nunca altera el cuerpo 3D**
- **Nunca modifica la anatomía**
- **Nunca cambia capas corporales**

La identidad de género:
- Se respeta
- Se muestra en perfil
- Se integra en lenguaje terapéutico
- **No reconfigura la herramienta corporal**

Esto mantiene:
- Coherencia terapéutica
- Seguridad simbólica
- Respeto ético profundo

---

## 4. Diseño visual del cuerpo 3D

### 4.1 Estética general

- Apariencia humana realista pero **no hiperreal**
- Sin rasgos sexuales explícitos
- Sin erotización
- Sin medicalización
- Tonos suaves, neutros, orgánicos

El cuerpo debe transmitir:
- Presencia
- Neutralidad
- Seguridad
- Contención

### 4.2 Nivel de detalle

- Volumen corporal claro
- Segmentación anatómica suave (no quirúrgica)
- Articulaciones sugeridas, no mecánicas
- Superficie continua, sin cortes clínicos

---

## 5. Capas conceptuales del cuerpo

El cuerpo 3D **no es una sola capa**, sino un sistema de capas activables conscientemente:

### 5.1 Capa corporal básica
- Forma humana
- Selección de regiones
- Vista frontal / posterior
- Punto de atención (highlight suave)

### 5.2 Capa bio-emocional
- Regiones asociadas a vivencias
- Colores suaves simbólicos (no semáforos)
- Sin scoring
- Sin intensidad automática

### 5.3 Capa transgeneracional
- Resonancias heredadas
- Eventos simbólicos del árbol
- Línea temporal no visible, solo referencial

### 5.4 Capa integrativa (futura)
- Cruce cuerpo + emoción + linaje
- Siempre en modo consultivo
- Nunca afirmativa

---

## 6. Interacción terapéutica con el cuerpo

### 6.1 Selección corporal

Al seleccionar una región:

- No se abre un diagnóstico
- No se abre una conclusión
- Se abre un **espacio de observación**

Ejemplo:
> “Zona pélvica seleccionada — observación abierta”

### 6.2 El cuerpo nunca “habla solo”

El cuerpo:
- No genera texto
- No muestra explicaciones automáticas
- No produce hipótesis

Todo contenido surge de:
- El terapeuta
- El diálogo humano
- La conciencia compartida

---

## 7. Estados del workspace y el cuerpo

El cuerpo responde al **estado del workspace**, no al revés:

### 7.1 Observación
- Cuerpo pasivo
- Registro de sensaciones
- Atención plena

### 7.2 Análisis
- Cruce con diccionario
- Árbol
- Historia
(Siempre como apoyo)

### 7.3 Síntesis
- Integración narrativa humana
- El cuerpo permanece visible, no protagonista

### 7.4 Cierre
- Cuerpo en estado neutro
- Ritual de cierre consciente
- Retorno al core workspace

---

## 8. Preparación para IA (sin activarla)

El cuerpo 3D **solo expone hooks**, nunca decisiones.

En el futuro, la IA podrá:
- Sugerir meditaciones
- Proponer cartas de perdón
- Crear frecuencias sonoras
- Diseñar visualizaciones guiadas

Pero:
- Nunca decide
- Nunca afirma
- Nunca reemplaza al terapeuta

---

## 9. Principio de soberanía terapéutica

Regla absoluta:

> El terapeuta observa.  
> El cuerpo acompaña.  
> La IA sugiere.  
> El humano decide.

---

## 10. Cierre conceptual

El Cuerpo 3D Experiencial no es una herramienta más.  
Es el **corazón simbólico** del SWM Bio-Emoción.

Si se hace bien:
- Eleva la terapia
- Profundiza la conciencia
- Diferencia radicalmente el sistema en el mercado
- Permite expansión futura sin romper la ética

Si se hace mal:
- Se convierte en simulador vacío
- Rompe la confianza
- Reduce la profundidad terapéutica

Este diseño prioriza:
- Humanidad
- Conciencia
- Profundidad
- Futuro

---
# Criterios UX Verificables — Cuerpo 3D Experiencial  
## SWM Bio-Emoción Experiencial Profunda

**Documento derivado de:** Diseño Conceptual — Cuerpo 3D Experiencial  
**Tipo:** Criterios UX / Heurísticas verificables  
**Estado:** Vinculante para diseño e implementación  
**Nivel:** Producto / Experiencia / Ética  

---

## 1. Principio UX Fundamental

> **El cuerpo 3D no dirige la terapia.  
> Acompaña la observación consciente.**

Todo criterio UX debe evaluarse contra esta frase.

---

## 2. Criterios de Presencia y Contención

### UX-01 — Presencia constante
**Criterio:**  
El cuerpo 3D debe permanecer visible durante todo el uso del SWM, salvo en flujos explícitos de salida o cierre.

**Verificación:**  
- El terapeuta nunca “pierde” el cuerpo por abrir herramientas.
- No existen overlays que oculten el cuerpo sin acción consciente.

---

### UX-02 — No intrusión
**Criterio:**  
El cuerpo no debe emitir animaciones, pulsos, alertas o cambios visuales automáticos.

**Verificación:**  
- Ningún cambio ocurre sin interacción humana.
- El cuerpo permanece visualmente estable en reposo.

---

## 3. Criterios de Neutralidad Visual

### UX-03 — Neutralidad cromática
**Criterio:**  
Los colores usados en el cuerpo no deben sugerir:
- patología,
- urgencia,
- daño,
- corrección.

**Verificación:**  
- No hay rojos/amarillos tipo semáforo.
- No hay escalas de “intensidad” implícitas.

---

### UX-04 — No medicalización
**Criterio:**  
El cuerpo no muestra:
- órganos internos clínicos,
- cortes anatómicos,
- nomenclatura médica,
- indicadores de normal/anormal.

**Verificación:**  
- El modelo es reconociblemente humano, pero no clínico.
- No parece una herramienta diagnóstica.

---

## 4. Criterios de Selección Corporal

### UX-05 — Selección explícita
**Criterio:**  
Toda selección de una región corporal debe ser una acción voluntaria del terapeuta o paciente.

**Verificación:**  
- No existen selecciones automáticas.
- No se resaltan zonas “por sistema”.

---

### UX-06 — Selección sin interpretación
**Criterio:**  
Seleccionar una región corporal no debe generar:
- conclusiones,
- explicaciones,
- hipótesis,
- recomendaciones.

**Verificación:**  
- Al seleccionar una zona, solo se abre un espacio de observación.
- El sistema no “dice” nada por sí mismo.

---

## 5. Criterios Sexo Biológico / Identidad

### UX-07 — Anatomía basada en sexo biológico
**Criterio:**  
El modelo corporal se selecciona únicamente por sexo biológico registrado.

**Verificación:**  
- Cambiar identidad de género no altera el cuerpo.
- Si el sexo biológico es desconocido → modelo neutral.

---

### UX-08 — Mensaje explícito de coherencia
**Criterio:**  
Debe existir un mensaje claro que indique que:
- la anatomía responde a sexo biológico,
- la identidad de género es respetada pero no inferente.

**Verificación:**  
- El terapeuta puede entender la regla sin ambigüedad.
- No hay confusión UX.

---

## 6. Criterios de Capas del Cuerpo

### UX-09 — Capas activables conscientemente
**Criterio:**  
Las capas (bio-emocional, transgeneracional, integrativa) solo se activan manualmente.

**Verificación:**  
- Ninguna capa se activa por defecto.
- El usuario decide qué ver y cuándo.

---

### UX-10 — Capas no dominantes
**Criterio:**  
Las capas no deben eclipsar la forma humana base.

**Verificación:**  
- El cuerpo sigue siendo reconocible.
- Las capas no “tapan” la presencia corporal.

---

## 7. Criterios según Estado del Workspace

### UX-11 — Estado Observación
**Criterio:**  
En estado Observación:
- el cuerpo es pasivo,
- no hay ayudas contextuales automáticas.

**Verificación:**  
- El terapeuta siente silencio visual.
- No hay sugerencias.

---

### UX-12 — Estado Análisis
**Criterio:**  
En estado Análisis:
- el cuerpo sigue visible,
- el foco está en herramientas, no en el modelo.

**Verificación:**  
- El cuerpo acompaña, no lidera.

---

### UX-13 — Estado Síntesis
**Criterio:**  
En estado Síntesis:
- el cuerpo pierde protagonismo visual,
- se integra al relato humano.

**Verificación:**  
- La narrativa escrita es el centro.

---

### UX-14 — Estado Cierre
**Criterio:**  
En estado Cierre:
- el cuerpo vuelve a neutralidad,
- se evita carga emocional visual.

**Verificación:**  
- No quedan zonas resaltadas.
- Se transmite cierre consciente.

---

## 8. Criterios de Preparación para IA (sin activación)

### UX-15 — IA invisible por defecto
**Criterio:**  
No debe existir ninguna señal visual de IA activa en el cuerpo.

**Verificación:**  
- El usuario no percibe IA si no se activa explícitamente.

---

### UX-16 — IA nunca protagonista visual
**Criterio:**  
Incluso cuando exista IA en el futuro:
- el cuerpo no “habla” por IA,
- la IA no colorea el cuerpo automáticamente.

**Verificación:**  
- Toda sugerencia IA aparece en paneles textuales, no en el cuerpo.

---

## 9. Criterios Éticos UX

### UX-17 — No determinismo
**Criterio:**  
El cuerpo nunca transmite:
- destino,
- causa,
- explicación cerrada.

**Verificación:**  
- No hay frases implícitas tipo “esto significa…”.

---

### UX-18 — Respeto al ritmo humano
**Criterio:**  
El sistema nunca fuerza:
- pasos,
- tiempos,
- recorridos.

**Verificación:**  
- El terapeuta puede pausar, observar, volver atrás.

---

## 10. Criterio de Aceptación Global

### UX-19 — Prueba de silencio

**Test final obligatorio:**

> Un terapeuta debe poder permanecer 2–3 minutos  
> observando el cuerpo sin que el sistema haga nada.

Si el sistema:
- interrumpe,
- sugiere,
- destaca,
- empuja,

❌ **falla el criterio UX**.

---

## 11. Regla final UX (inmutable)

> **Si el cuerpo parece más inteligente que el terapeuta,  
> el diseño ha fallado.**

---

## Estado del documento

✔ Derivado del diseño conceptual  
✔ Compatible con Contrato Técnico SWM  
✔ Verificable por QA / UX / Terapia  
✔ Escalable a 3D avanzado  
✔ Seguro ética y clínicamente  

