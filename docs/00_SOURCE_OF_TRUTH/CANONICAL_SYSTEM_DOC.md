# CANONICAL SYSTEM DOC

Sistema de Informes Holísticos Clínicos
(Tests → Resultados → Informes → Evolución)

Estado: Especificación final
Audiencia: Arquitecto · Agentes de código · Producto · QA
Alcance: Backend + Frontend + UX + Ética clínica
Nota: No contiene código. Es diseño funcional y semántico.

---

0. PRINCIPIO FUNDAMENTAL (NO NEGOCIABLE)

El sistema NO diagnostica.
El sistema NO sustituye al terapeuta.
El sistema estructura, acompaña y orienta procesos humanos.

Toda decisión técnica debe cumplir este principio.

1. CONCEPTOS CLAVE (VOCABULARIO CANÓNICO)
1.1 Test

Instrumento estructurado de exploración (ej. ASRS-Essence).

1.2 TestResult

Resultado bruto + datos estructurados + metadata técnica.

1.3 Informe Clínico Extendido (ICE)

Documento interpretativo solo para terapeuta, generado a partir de uno o más TestResult.

1.4 Vista Orientativa (Paciente)

Resumen humano, no técnico, no clínico.

1.5 Transición

Sugerencia de siguiente etapa de exploración (Atzilut → Beriá → Ietzirá → Asiá).

2. ARQUITECTURA DE VISTAS (SEPARACIÓN CRÍTICA)
Vista	Usuario	Acceso
Test	Paciente	✔️
Resultado orientativo	Paciente	✔️
Informe Clínico Extendido	Terapeuta	✔️
Datos crudos / hipótesis	Terapeuta	✔️
Hipótesis / riesgos	Paciente	❌
Transiciones explícitas	Paciente	❌

⚠️ Nunca reutilizar el mismo componente UI para terapeuta y paciente.

3. ESTRUCTURA DEL INFORME CLÍNICO EXTENDIDO (ICE)

Nombre canónico:
Informe de Exploración del Ritmo Esencial — ASRS-Essence

3.1 Bloques obligatorios (en este orden)
A. Síntesis Clínica Central

Solo terapeuta

Contenido:

Estado global del ritmo esencial

Nivel de coherencia / fragmentación

Estabilidad del eje interno

Ejemplo:

El ritmo esencial se presenta fragmentado, con baja continuidad interna y dispersión del eje vital.

B. Lectura por Mundos / Niveles del Alma
Mundo	Nivel del Alma	Lectura
Atzilut	Jaiá / Iejidá	Voluntad debilitada
Beriá	Neshamá	Cognición activa sin eje
Ietzirá	Ruaj	Regulación emocional inestable
Asiá	Néfesh	Acción funcional pero automática
C. Hipótesis Clínicas (NO diagnósticas)

Origen probable del desbalance

Factores mantenedores

Estrategias compensatorias detectadas

⚠️ Nunca usar lenguaje diagnóstico.

D. Riesgos Terapéuticos Suaves

Ejemplos:

Riesgo de cronificación

Riesgo de sobreintelectualización

Riesgo de bypass espiritual

E. Sugerencia de Transición

Formato fijo:

Mundo actual

Mundo sugerido

Objetivo terapéutico

Ejemplo:

Transición sugerida: Atzilut → Beriá
Objetivo: reconstruir eje cognitivo antes de trabajar emoción.

F. Exploraciones Recomendadas

Lista priorizada:

Screening Psicológico General

Wellness Assessment

SCL-90 (visión holística)

G. Líneas de Intervención

Tipo de trabajo sugerido

Ritmo recomendado

Advertencias metodológicas

H. Nota Ética Final (OBLIGATORIA)

Texto fijo:

Este informe es orientativo y no constituye un diagnóstico. Su interpretación corresponde exclusivamente al acompañamiento profesional.

4. VISTA PACIENTE (ORIENTATIVA)
4.1 Contenido permitido

Estado general (ej. “Fragmentado”)

Mensaje humano de acompañamiento

Recomendación suave (“explorar”, “acompañar”)

Ejemplo:

Tu ritmo interno se encuentra disperso. Trabajar con pequeños ejes sencillos puede ayudarte a recuperar estabilidad.

4.2 Contenido prohibido

❌ Hipótesis
❌ Riesgos
❌ Mundos / niveles
❌ Transiciones explícitas
❌ Scores técnicos

5. EVOLUCIÓN TEMPORAL (LONGITUDINAL)
5.1 Regla clave

Ningún resultado se interpreta aislado.

5.2 Historial de proceso
Fecha	Estado	Mundo	Observación
2026-01-13	Fragmentado	Atzilut	Inicio
2026-02-10	Inestable	Beriá	Reorganización
2026-03-15	Integrándose	Ietzirá	Regulación
5.3 Informe Longitudinal (Terapeuta)

El sistema puede generar textos como:

Se observa una recuperación progresiva del eje cognitivo respecto al primer registro.

6. FLUJO AUTOMÁTICO DE TESTS (DEFAULT)
6.1 Regla general
Atzilut → Beriá → Ietzirá → Asiá


Nunca saltar mundos salvo decisión explícita del terapeuta.

6.2 Lógica de sugerencia

El sistema sugiere

El terapeuta decide

El paciente no ve la decisión técnica

7. REGLAS DE UX CRÍTICAS

❌ No usar alerts del navegador

✔️ Usar modales propios de la app

✔️ Diferenciar visualmente “Resultado” vs “Informe clínico”

✔️ Siempre mostrar disclaimers

8. ESTADO ACTUAL DEL SISTEMA
✔️ Listo

Tests

Resultados estructurados

Transiciones semánticas

Vista paciente básica

🔜 Pendiente

Render del Informe Clínico Extendido

Histórico longitudinal UI

Control de visibilidad por rol

9. CRITERIO FINAL DE CALIDAD

Si el paciente se asusta → está mal diseñado.
Si el terapeuta no entiende → está incompleto.
Si el sistema decide solo → está mal.
