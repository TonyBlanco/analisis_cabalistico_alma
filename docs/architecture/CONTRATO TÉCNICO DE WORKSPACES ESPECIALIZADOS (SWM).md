# CONTRATO TÉCNICO DE WORKSPACES ESPECIALIZADOS (SWM)
## Specialized Workspace Modules – Opción 2

**Versión:** 1.0  
**Estado:** Documento fundacional – Vinculante  
**Congelado:** Base SWM v1 (no modificar sin revision arquitectonica)
**Ámbito:** Arquitectura del ecosistema clínico–holístico  
**Aplicación:** Presente y futura  
**Prioridad:** Alta  

---

## 1. Definición de SWM

Un **Specialized Workspace Module (SWM)** es un espacio de trabajo independiente, profundo y especializado, diseñado para abordar **un dominio terapéutico específico** dentro del ecosistema, sin alterar ni interferir con el **Workspace Clínico Central**.

Un SWM **no es**:
- un panel lateral,
- un modal,
- una vista secundaria,
- una extensión del dashboard principal.

Un SWM **es**:
- un entorno propio,
- con layout propio,
- navegación interna propia,
- y lógica funcional contenida.

---

## 2. Principio de coexistencia (regla de oro)

> **El Workspace Clínico Central nunca se cierra, reemplaza ni degrada.**

Los SWM:
- se **abren desde** el contexto clínico,
- **heredan contexto**,  
- y permiten **retorno explícito** al workspace principal.

Nunca rompen la continuidad terapéutica.

---

## 3. Contexto heredado obligatorio

Todo SWM **DEBE** heredar en modo **solo lectura**:

- Identidad del paciente activo
- Sesión clínica activa
- Rol del usuario (terapeuta)
- Permisos vigentes
- Idioma / localización

### Restricciones:
- ❌ No puede modificar el paciente activo
- ❌ No puede cambiar sesión
- ❌ No puede alterar consentimiento
- ❌ No puede crear registros clínicos oficiales

---

## 4. Aislamiento funcional estricto

Un SWM opera bajo **aislamiento funcional**.

Está **prohibido**:

- modificar rutas del core clínico
- registrar resultados clínicos
- ejecutar scoring médico
- escribir en historiales clínicos oficiales
- disparar automatismos clínicos

Toda información generada es:
- consultiva,
- humana,
- editable,
- no vinculante clínicamente.

---

## 5. Estructura mínima obligatoria de un SWM

Todo SWM debe contener, como mínimo:

### 5.1 Layout propio
- Header contextual
- Área central de trabajo
- Sidebar interno (si aplica)
- Paneles internos no modales

### 5.2 Núcleo de trabajo (Visual / Cognitivo)
Un “core” persistente que:
- nunca se oculta automáticamente
- no se reemplaza por paneles
- representa el foco principal del módulo

### 5.3 Navegación interna
- Secciones internas del SWM
- Sin usar routing del core clínico
- Sin afectar el sidebar global

### 5.4 Mecanismo de salida explícito
Botón o acción clara:
> “Volver al espacio clínico”

---

## 6. Relación con Panel Manager

### Regla clave:
> **Un SWM NO es un panel.**

- Los paneles sirven al workspace clínico.
- Los SWM son entornos completos.

Un SWM:
- puede tener paneles internos propios
- no usa el Panel Manager global
- no registra paneles en el core

---

## 7. Clasificación de los SWM

Ejemplos válidos de SWM:

- Bio-Emoción Experiencial Profunda
- Árbol Transgeneracional Profundo
- Cábala Aplicada Terapéutica
- Reprogramación de Conciencia
- Evaluación Integrativa No Clínica

Cada uno:
- con roadmap propio,
- con nivel de acceso configurable,
- con licencia independiente (futuro).

---

## 8. Relación con IA (marco obligatorio)

La IA en los SWM:
- es **asistente**, nunca autoridad
- opera solo en plano consultivo
- no emite diagnósticos
- no genera conclusiones cerradas
- no ejecuta decisiones

Lenguaje obligatorio de la IA:
- “hipótesis simbólicas”
- “posibles áreas de atención”
- “patrones observados”
- “sugerencias reflexivas”

Prohibido:
- diagnóstico
- predicción
- causalidad clínica
- certeza

---

## 9. Separación cuerpo / identidad (norma transversal)

En cualquier visualización corporal dentro de un SWM:

- **Sexo biológico** → define anatomía base
- **Identidad de género** → dato respetado, no inferente

Reglas:
- Identidad de género no altera anatomía
- No se deduce sexo desde identidad
- No se hacen inferencias automáticas
- Todo uso es explícito y documentado

---

## 10. Escalabilidad y monetización futura

Este contrato habilita:

- activación por rol terapéutico
- activación por licencia
- venta modular
- bundles por especialidad
- evolución independiente de cada SWM

Sin romper:
- arquitectura
- experiencia del terapeuta
- integridad clínica

---

## 11. Auditoría y versionado

Todo SWM debe:
- declarar versión P1 / P2 / P3
- documentar cambios relevantes
- respetar este contrato en cada iteración

Cambios que violen este documento:
- deben ser explícitos,
- justificados,
- y aprobados arquitectónicamente.

---

## 12. Principio ético fundamental

> **La tecnología crea espacio.  
> El terapeuta crea sentido.**

Ningún SWM sustituye:
- presencia humana,
- juicio profesional,
- responsabilidad ética.

---

## 13. Carácter vinculante

Este documento constituye el **contrato técnico y conceptual obligatorio** para todo Specialized Workspace Module presente y futuro.

Cualquier desarrollo que lo contradiga se considerará una desviación arquitectónica del ecosistema.

---

## Cierre

Los SWM existen para permitir profundidad sin caos, especialización sin fragmentación y evolución sin ruptura.

Este contrato protege:
- la coherencia del sistema,
- la libertad del terapeuta,
- y la escalabilidad del proyecto.


