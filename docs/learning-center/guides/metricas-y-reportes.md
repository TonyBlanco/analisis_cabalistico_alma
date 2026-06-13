# Métricas y reportes

## Objetivo

Esta guía explica cómo leer el dashboard de métricas del terapeuta y usar el panel de reportes sin entrar en interpretaciones del consultante.

## Panel de Reportes (`/dashboard/therapist/reports`)

El panel de reportes es el punto central para revisar el estado agregado de tu práctica.

### Qué muestra

- **Cartera de consultantes:** lista de tus consultantes con etapa actual de trabajo y última actividad.
- **Alertas de tests:** tests completados por el consultante que aún no has revisado. Se marcan visualmente para llamar la atención.
- **Métricas por consultante:** sesiones registradas, tests asignados vs. completados, y avance en el proceso.
- **Export CSV:** descarga los datos del período para registro externo.

### Cómo usarlo

1. Abre **Reportes** desde el menú lateral del terapeuta.
2. Revisa la columna de alertas primero — los tests completados sin revisar son la prioridad operativa.
3. Haz clic en el nombre de un consultante para ir a su ficha y revisar el resultado del test.
4. Usa el botón de export si necesitas llevar los datos a otro sistema.

### Endpoint de datos

`GET /api/therapist/reports/summary/` — devuelve el resumen de la cartera con alertas y métricas. Solo accesible con token de terapeuta.

---

## Dashboard principal (`/dashboard/therapist`)

### Qué mirar

- **Carga de trabajo operativa:** consultantes activos, tests enviados/pendientes/completados.
- **KPIs agregados B7:** volumen de sesiones, uso de IA y estado general de la cola.
- **Consumo IA:** límites y uso del período actual.

### Qué hacer

1. Abre el dashboard principal.
2. Revisa la sección de carga de trabajo arriba del todo (consultantes con tests pendientes o sin revisar).
3. Usa los KPIs para ver el volumen general.
4. Si necesitas más detalle, ve a **Reportes** para ver por consultante.

---

## Importante

Los paneles de métricas muestran **estado operativo**, no interpretación clínica. Para el detalle clínico de un consultante, ve a su ficha individual.
