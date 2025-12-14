# Mapa propuesto de rutas y estructura de tests

Objetivo: unificar rutas bajo `/tests/` con subcarpetas por dominio y separar la experiencia de acceso según tipo de usuario (terapeuta/profesional, paciente/portal asignado, cliente casual/membresía o compra individual).

## Estructura de carpetas sugerida (frontend `app/tests`)
- `/tests/cabala/` (análisis cabalísticos y numerología)
  - `basic-analysis`
  - `complete-numerology`
  - `couple-compatibility`
  - `career-guidance`
  - `spiritual-path`
  - `health-wellness`
  - `financial-abundance`
  - `family-relations`
  - `life-purpose`
  - `past-lives`
  - `cabalistic-astrology`
- `/tests/psicologia/` (psicométricos/clinicos)
  - `bdi-ii`
  - `bai`
  - `phq-9`
  - `gad-7`
  - `ptsd-check` (alinear con code actual `ptsd`)
  - `ocd-screen`
  - `insomnia-index`
  - `adhd-adult`
  - `substance-use`
  - `eating-disorder`
  - `scl-90` / `scl-90-r`
  - `stai`
  - `mcmi-iv`
  - `scid5` / `scid-5-rv`
  - `pai` / `professional-pai`
- `/tests/astrologia/`
  - `cabalistic-astrology`
  - (futuros: cartas natales, sinastría, tránsitos)

## Rutas de acceso
- Públicos/casuales (landing/tests):
  - `/tests` (catálogo filtrado por disponibilidad pública y membresía elegida)
  - `/tests/:dominio/:code` (ejecución directa si es free o comprado)
- Paciente con portal asignado (creado por terapeuta):
  - `/dashboard/patient/tests` (solo tests asignados a ese paciente)
  - `/dashboard/patient/tests/:code` (ejecución limitada a asignados)
  - `/dashboard/patient/results` y `/dashboard/patient/results/:id` (historial propio + reportes y recomendaciones del terapeuta)
- Terapeuta/profesional:
  - `/dashboard/therapist/tests` (catálogo completo según plan pro)
  - `/dashboard/therapist/patients/:id/tests` (asignar/desasignar)
  - `/dashboard/therapist/patients/:id/results` (ver resultados, marcar favoritos, generar reporte y recomendaciones)

## Lógica de acceso (resumen)
- `required_access_level` + `available_for_therapists`/`available_for_personal` determinan visibilidad.
- Profesionales asignan tests a pacientes; pacientes solo ven/ejecutan los que les asignaron.
- Casuales acceden según plan/membresía o compra por test.

## Pendientes clave para implementación
1) Mover/aliasar páginas actuales de tests a las nuevas subcarpetas (cabala, psicologia, astrologia) manteniendo redirects 301 internos para no romper rutas previas.
2) Alinear codes backend/frontend (ej: `ptsd-check` vs `ptsd`).
3) Crear vistas de asignación de tests por paciente para terapeutas.
4) Filtrar catálogo según tipo de usuario y asignaciones.
5) Normalizar componente genérico de ejecución para reutilizar UI dentro de cada dominio.
