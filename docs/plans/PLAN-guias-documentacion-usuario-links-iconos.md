# Plan — Guías y documentación orientada al usuario (links reales + iconos)

## 🎯 Problema detectado

Todas las guías y páginas de documentación interna de la app muestran información técnica (rutas de API, nombres de código, endpoints) en lugar de links directos, iconos y descripciones humanas. Esto hace la experiencia confusa para cualquier usuario que no sea desarrollador.

**Ejemplos concretos revisados:**
- Se muestra `GET /api/therapist/reports/summary/` en vez de un botón/link a [Reportes del terapeuta](https://studios33.app/dashboard/therapist/reports)
- Las tablas de tests muestran códigos como `sha_harmony` en vez del nombre real + link directo
- Rutas como `/dashboard/therapist/resonancia-ancestral` aparecen como texto plano
- No hay iconos que ayuden a identificar visualmente cada sección

---

## 🛠️ Sistema de iconos real de la app

La app usa **Lucide React** — NO emojis en componentes React. Sistema real (ver `TestCatalogSection.tsx`):

| Concepto | Icono Lucide | Clase de color |
|---|---|---|
| Néfesh (cuerpo, hábitos, sustancias) | `Sun` | `bg-amber-100 text-amber-800` |
| Rúaj (emoción, regulación, compulsiones) | `Feather` | `bg-green-100 text-green-800` |
| Neshamá (mente, consciencia, atención) | `Cloud` | `bg-blue-100 text-blue-800` |
| Jaiá (esencia, vitalidad) | `Star` | `bg-purple-100 text-purple-800` |
| Iejidá (unión, trascendencia) | `Zap` | `bg-yellow-100 text-yellow-800` |
| Catálogo / secciones | `ClipboardList` | `text-[#1f6c8f]` |
| Ayuda / guía | `Info` | `text-[#1f6c8f]` |
| Éxito / asignado | `CheckCircle` | `text-green-600` |
| Notificación | `Mail` | `text-blue-700` |

Mundos — color de borde de sección (reutilizar clases exactas de `TestCatalogSection.tsx`):
- **Atzilut** → `border-violet-500 bg-violet-50/60`
- **Beriá** → `border-blue-500 bg-blue-50/60`
- **Ietzirá** → `border-green-500 bg-green-50/60`
- **Asiá** → `border-amber-500 bg-amber-50/60`

---

## 📋 Alcance del trabajo

### 1. Guías y páginas de onboarding/ayuda
- Reemplazar toda mención de rutas API (`GET /api/...`) por frases orientadas al usuario
- Convertir rutas de app (`/dashboard/...`) en links directos con label descriptivo
- Añadir iconos Lucide a cada sección o herramienta (ver tabla arriba)

### 2. Tabla de tests — formato correcto

| Icono (Lucide) | Nombre público | Descripción breve | Link directo |
|---|---|---|---|
| Sun (Néfesh) | Auditoría de Armonía Sefirótica | Equilibrio de pasiones, hábitos, regulación del deseo | [Abrir →](https://studios33.app/dashboard/patient/tests/sha-harmony) |
| Feather (Rúaj) | Auditoría espiritual de alimentación | Vínculo con el cuerpo y la nutrición desde perspectiva del alma | [Abrir →](https://studios33.app/dashboard/patient/tests/eat26-spirit) |
| Sun (Néfesh) | Detección de uso de sustancias | Patrones de escape, dependencia simbólica | [Abrir →](https://studios33.app/dashboard/patient/tests/dudit-spirit) |
| Feather (Rúaj) | Exploración de compulsiones | Rituales, obsesiones y repetición desde perspectiva del alma | [Abrir →](https://studios33.app/dashboard/patient/tests/ybocs-soul) |
| Cloud (Neshamá) | Screening de atención y dispersión | Energía atencional, dispersión, foco — perspectiva esencial | [Abrir →](https://studios33.app/dashboard/patient/tests/asrs-essence) |
| Star (Jaiá) | Espectro de singularidad perceptual | Singularidad perceptual desde perspectiva cabalística | [Abrir →](https://studios33.app/dashboard/patient/tests/aq-kabbalah) |
| Star (Jaiá) | Señal de la Matriz Cósmica | Patrones de personalidad simbólica | [Abrir →](https://studios33.app/dashboard/patient/tests/mcmi4-signal) |

### 3. Secciones principales del dashboard

| Sección | Icono Lucide | Link |
|---|---|---|
| Reportes del terapeuta | `BarChart2` | [studios33.app/dashboard/therapist/reports](https://studios33.app/dashboard/therapist/reports) |
| Resonancia Ancestral | `GitBranch` | [studios33.app/dashboard/therapist/resonancia-ancestral](https://studios33.app/dashboard/therapist/resonancia-ancestral) |
| Catálogo de exploraciones | `ClipboardList` | [studios33.app/dashboard/therapist/tests](https://studios33.app/dashboard/therapist/tests) |
| Proceso del consultante | `User` | [studios33.app/dashboard/patient/process](https://studios33.app/dashboard/patient/process) |
| Centro de aprendizaje | `BookOpen` | [studios33.app/learn](https://studios33.app/learn) |

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
- Toda tabla de tests usa iconos Lucide del sistema existente + nombre público + link funcional
- Toda sección del dashboard referenciada tiene icono Lucide + link
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
- Los iconos son emojis aleatorios en vez de los iconos Lucide React que ya usa la app

SISTEMA DE ICONOS DE LA APP
La app usa EXCLUSIVAMENTE Lucide React (ya instalado). NUNCA uses emojis como reemplazo de iconos
en componentes React. El sistema existente está en TestCatalogSection.tsx:

  import { Sun, Feather, Cloud, Star, Zap, ClipboardList, Info, CheckCircle, Mail } from 'lucide-react';

  Nivel del alma → icono + clase:
  - Néfesh (cuerpo, hábitos, sustancias, alimentación): Sun | bg-amber-100 text-amber-800
  - Rúaj (emoción, regulación, compulsiones):           Feather | bg-green-100 text-green-800
  - Neshamá (mente, consciencia, atención):              Cloud | bg-blue-100 text-blue-800
  - Jaiá (esencia, vitalidad, espectro):                 Star | bg-purple-100 text-purple-800
  - Iejidá (unión, trascendencia):                      Zap | bg-yellow-100 text-yellow-800
  - Catálogo / secciones generales:                     ClipboardList | text-[#1f6c8f]
  - Ayuda / guía:                                       Info | text-[#1f6c8f]
  - Éxito / asignado:                                   CheckCircle | text-green-600
  - Notificación:                                       Mail | text-blue-700

  Mundos — reutilizar exactamente las clases de TestCatalogSection.tsx:
  - Atzilut: border-violet-500 bg-violet-50/60
  - Beriá:   border-blue-500  bg-blue-50/60
  - Ietzirá: border-green-500 bg-green-50/60
  - Asiá:    border-amber-500 bg-amber-50/60

  Render de icono con nivel del alma (patrón ya existente en la app):
    const Icon = soulLevelIcons[soulLevel];
    <span className={`text-xs px-2 py-1 rounded-full ${cls} flex items-center gap-1`}>
      {Icon && <Icon className="w-3 h-3" />} {soulLevel}
    </span>

TAREA PRINCIPAL
Recorre el codebase y aplica estas correcciones en TODOS los componentes que rendericen
contenido visible al usuario:

1. ELIMINAR info técnica del copy de usuario:
   - Quita o reemplaza cualquier mención de endpoints API (`GET /api/...`, `POST /api/...`)
   - Usa lenguaje humano: "La app calcula esto automáticamente a partir de tus sesiones"

2. CONVERTIR rutas en links clicables con icono Lucide:
   - `/dashboard/therapist/reports`           → <BarChart2> Ver mis Reportes → studios33.app/dashboard/therapist/reports
   - `/dashboard/therapist/resonancia-ancestral` → <GitBranch> Resonancia Ancestral → studios33.app/dashboard/therapist/resonancia-ancestral
   - `/dashboard/therapist/tests`             → <ClipboardList> Catálogo de exploraciones → studios33.app/dashboard/therapist/tests
   - `/dashboard/patient/process`             → <User> Mi proceso terapéutico → studios33.app/dashboard/patient/process
   - `/learn`                                 → <BookOpen> Centro de aprendizaje → studios33.app/learn

3. ACTUALIZAR referencias a tests con icono Lucide + nombre público + link:
   - sha_harmony   → <Sun>    Auditoría de Armonía Sefirótica        → /dashboard/patient/tests/sha-harmony
   - eat26_spirit  → <Feather> Auditoría espiritual de alimentación  → /dashboard/patient/tests/eat26-spirit
   - dudit_spirit  → <Sun>    Detección de uso de sustancias          → /dashboard/patient/tests/dudit-spirit
   - ybocs_soul    → <Feather> Exploración de compulsiones           → /dashboard/patient/tests/ybocs-soul
   - asrs_essence  → <Cloud>  Screening de atención y dispersión     → /dashboard/patient/tests/asrs-essence
   - aq_kabbalah   → <Star>   Espectro de singularidad perceptual     → /dashboard/patient/tests/aq-kabbalah
   - mcmi4-signal  → <Star>   Señal de la Matriz Cósmica             → /dashboard/patient/tests/mcmi4-signal

4. AÑADIR iconos Lucide (NO emojis) a cada sección, card o bloque de información
   siguiendo el mapa de nivel del alma de arriba. Reutilizar soulLevelIcons y
   soulLevelClasses de TestCatalogSection.tsx cuando sea posible.

ARCHIVOS A REVISAR (prioridad alta):
- Todos los componentes *Guide*, *Help*, *Info*, *Modal*, *Onboarding*
- GuidedBlock.tsx y variantes
- Páginas bajo /learn y sus sub-rutas
- clinicalTests.registry.ts (campos de descripción visible al usuario)

CRITERIO DE ÉXITO:
- Cero cadenas `GET /` o `POST /` en copy visible
- Cero rutas `/dashboard/...` como texto plano
- Todos los iconos son Lucide React del sistema existente, no emojis
- El output puede ser revisado por alguien no técnico y resulta claro y profesional
- Tests existentes siguen pasando (solo frontend/copy, sin tocar lógica)

ENTREGA:
- Rama: fix/user-facing-guides-and-links
- PR con descripción de archivos tocados + ejemplo antes/después para 2-3 casos
- Sin cambios en lógica de scoring, endpoints ni base de datos
```
