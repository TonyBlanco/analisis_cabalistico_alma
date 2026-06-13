# Plan — Guías y documentación orientada al usuario (links reales + iconos)

## 🎯 Problema detectado

Todas las guías y páginas de documentación interna de la app muestran información técnica (rutas de API, nombres de código, endpoints) en lugar de links directos, iconos y descripciones humanas. Esto hace la experiencia confusa para cualquier usuario que no sea desarrollador.

**Ejemplos concretos revisados:**
- Se muestra `GET /api/therapist/reports/summary/` en vez de un botón/link a [Reportes del terapeuta](https://studios33.app/dashboard/therapist/reports)
- Las tablas de tests muestran códigos como `sha_harmony` en vez del nombre real + link directo
- Rutas como `/dashboard/therapist/resonancia-ancestral` aparecen como texto plano
- No hay iconos que ayuden a identificar visualmente cada sección

---

## 📋 Alcance del trabajo

### 1. Guías y páginas de onboarding/ayuda
- Reemplazar toda mención de rutas API (`GET /api/...`) por frases orientadas al usuario
- Convertir rutas de app (`/dashboard/...`) en links directos con label descriptivo
- Añadir icono representativo a cada sección o herramienta mencionada

### 2. Tabla de tests — formato correcto

| Icono | Nombre público | Descripción breve | Link directo |
|---|---|---|---|
| 🌊 | Auditoría de Armonía Sefirótica | Equilibrio de pasiones, hábitos, regulación del deseo | [Abrir →](https://studios33.app/dashboard/patient/tests/sha-harmony) |
| 🌿 | Auditoría espiritual de alimentación | Vínculo con el cuerpo y la nutrición desde perspectiva del alma | [Abrir →](https://studios33.app/dashboard/patient/tests/eat26-spirit) |
| 🔥 | Detección de uso de sustancias | Patrones de escape, dependencia simbólica | [Abrir →](https://studios33.app/dashboard/patient/tests/dudit-spirit) |
| 🔄 | Exploración de compulsiones | Rituales, obsesiones y repetición desde perspectiva del alma | [Abrir →](https://studios33.app/dashboard/patient/tests/ybocs-soul) |
| ⚡ | Screening de atención y dispersión | Energía atencional, dispersión, foco — perspectiva esencial | [Abrir →](https://studios33.app/dashboard/patient/tests/asrs-essence) |
| 🔮 | Espectro de singularidad perceptual | Singularidad perceptual desde perspectiva cabalística | [Abrir →](https://studios33.app/dashboard/patient/tests/aq-kabbalah) |
| 🧬 | Señal de la Matriz Cósmica | Patrones de personalidad simbólica | [Abrir →](https://studios33.app/dashboard/patient/tests/mcmi4-signal) |

### 3. Secciones principales del dashboard

| Sección | Link |
|---|---|
| 📊 Reportes del terapeuta | [studios33.app/dashboard/therapist/reports](https://studios33.app/dashboard/therapist/reports) |
| 🌳 Resonancia Ancestral | [studios33.app/dashboard/therapist/resonancia-ancestral](https://studios33.app/dashboard/therapist/resonancia-ancestral) |
| 🗂️ Catálogo de exploraciones | [studios33.app/dashboard/therapist/tests](https://studios33.app/dashboard/therapist/tests) |
| 👤 Proceso del consultante | [studios33.app/dashboard/patient/process](https://studios33.app/dashboard/patient/process) |
| 📚 Centro de aprendizaje | [studios33.app/learn](https://studios33.app/learn) |

---

## 🔍 Inventario de archivos a revisar

- Cualquier componente que renderice texto de ayuda, tooltips, modales o guías
- `README.md` si tiene secciones de usuario final
- Páginas `/learn` y sus sub-rutas
- Modales de onboarding del terapeuta
- Cualquier `GuideBlock`, `HelpModal`, `InfoCard`, `GuidedBlock` en el codebase
- `clinicalTests.registry.ts` (campos `description`, `guideText` o similar)

---

## ✅ Criterio de "hecho"

- Cero apariciones de `GET /api/` en copy visible al usuario
- Cero rutas en texto plano (`/dashboard/...`) sin ser link clicable
- Toda tabla de tests tiene icono + nombre público + link funcional
- Toda sección del dashboard referenciada tiene icono + link
- Revisión manual en al menos 3 páginas de la app

---

## 📝 Prompt para el agente Claude

```
ROL
Eres un desarrollador frontend senior trabajando en Studios33, una plataforma de terapia holística cabalística. Tu tarea es hacer todas las guías, modales de ayuda y páginas de documentación de la app PROFESIONALES y orientadas al usuario final (terapeutas y consultantes), NO a desarrolladores.

CONTEXTO
Al revisar la app se encontró que en todas las guías y páginas de ayuda:
- Aparecen rutas de API como `GET /api/therapist/reports/summary/` que el usuario no entiende
- Las rutas de la app (`/dashboard/therapist/reports`) aparecen como texto plano sin ser links
- Los tests se muestran con códigos técnicos (`sha_harmony`, `eat26_spirit`) en vez de sus nombres públicos
- No hay iconos que ayuden a identificar visualmente las secciones

TAREA PRINCIPAL
Recorre el codebase y aplica estas correcciones en TODOS los componentes que rendericen contenido visible al usuario:

1. ELIMINAR info técnica del copy de usuario:
   - Quita o reemplaza cualquier mención de endpoints API (`GET /api/...`, `POST /api/...`)
   - Usa lenguaje humano: "La app calcula esto automáticamente a partir de tus sesiones"
     en vez de mostrar la URL del endpoint

2. CONVERTIR rutas en links clicables con icono:
   - `/dashboard/therapist/reports` → 📊 [Ver mis Reportes](https://studios33.app/dashboard/therapist/reports)
   - `/dashboard/therapist/resonancia-ancestral` → 🌳 [Abrir Resonancia Ancestral](https://studios33.app/dashboard/therapist/resonancia-ancestral)
   - `/dashboard/therapist/tests` → 🗂️ [Catálogo de exploraciones](https://studios33.app/dashboard/therapist/tests)
   - `/dashboard/patient/process` → 👤 [Mi proceso terapéutico](https://studios33.app/dashboard/patient/process)
   - `/learn` → 📚 [Centro de aprendizaje](https://studios33.app/learn)

3. ACTUALIZAR tablas de tests con icono + nombre público + link:
   - 🌊 Auditoría de Armonía Sefirótica — Equilibrio de pasiones y regulación del deseo → [Iniciar](https://studios33.app/dashboard/patient/tests/sha-harmony)
   - 🌿 Auditoría espiritual de alimentación — Vínculo con el cuerpo desde el alma → [Iniciar](https://studios33.app/dashboard/patient/tests/eat26-spirit)
   - 🔥 Detección de uso de sustancias — Patrones de escape y dependencia simbólica → [Iniciar](https://studios33.app/dashboard/patient/tests/dudit-spirit)
   - 🔄 Exploración de compulsiones — Rituales y obsesiones desde el alma → [Iniciar](https://studios33.app/dashboard/patient/tests/ybocs-soul)
   - ⚡ Screening de atención y dispersión — Energía atencional y foco esencial → [Iniciar](https://studios33.app/dashboard/patient/tests/asrs-essence)
   - 🔮 Espectro de singularidad perceptual — Singularidad perceptual cabalística → [Iniciar](https://studios33.app/dashboard/patient/tests/aq-kabbalah)
   - 🧬 Señal de la Matriz Cósmica — Patrones de personalidad simbólica → [Iniciar](https://studios33.app/dashboard/patient/tests/mcmi4-signal)

4. AÑADIR iconos como identificadores visuales en cada sección, card o bloque de información.

ARCHIVOS A REVISAR (prioridad alta):
- Todos los componentes `*Guide*`, `*Help*`, `*Info*`, `*Modal*`, `*Onboarding*`
- `GuidedBlock.tsx` y variantes
- Páginas bajo `/learn` y sus sub-rutas
- `clinicalTests.registry.ts` (campos de descripción visible al usuario)

CRITERIO DE ÉXITO:
- Cero cadenas `GET /` o `POST /` en copy visible
- Cero rutas `/dashboard/...` como texto plano
- Toda tabla de tests tiene icono + nombre público + link
- El output puede ser revisado por alguien no técnico y resulta claro y profesional
- Tests existentes siguen pasando (solo frontend/copy, sin tocar lógica)

ENTREGA:
- Rama: `fix/user-facing-guides-and-links`
- PR con descripción de archivos tocados + ejemplo antes/después para 2-3 casos
- Sin cambios en lógica de scoring, endpoints ni base de datos
```
