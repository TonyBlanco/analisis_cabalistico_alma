# Flujo de Eventos Simbolicos

Documento interno para clarificar el flujo de eventos del Sistema Simbolico.
No es un documento clinico ni operativo de runtime.

## Proposito
Los eventos simbolicos son informativos, pasivos y de solo lectura.
No disparan logica clinica, no generan inferencias, no producen decisiones
y no modifican estado clinico.

## Alcance
- Eventos simbolicos de observacion y navegacion.
- Sin interpretacion automatica.
- Sin scoring ni prediccion.
- Sin escritura clinica.

## Inventario de eventos simbolicos
Los nombres listados describen eventos posibles o existentes. Si un evento
no existe aun, se documenta como referencia, no como implementacion.

### symbol.card.selected
- Origen: plugin o visual motor (tarot).
- Momento: seleccion manual de una carta por el usuario.
- Payload permitido: identificadores simbolicos y metadatos de sesion.
- Consumidores potenciales: UI observacional, logging interno (solo lectura).

### symbol.path.focused
- Origen: visual motor (arbol).
- Momento: enfoque manual de un path del arbol.
- Payload permitido: ids del path y sefirot relacionadas.
- Consumidores potenciales: UI observacional, logging interno (solo lectura).

### symbol.sefira.hovered
- Origen: visual motor (arbol).
- Momento: hover manual sobre sefira.
- Payload permitido: id de sefira, contexto simbolico minimo.
- Consumidores potenciales: UI observacional.

### symbol.layout.changed
- Origen: workspace simbolico o visual motor.
- Momento: cambio de layout visual (modo, escala, zoom).
- Payload permitido: identificador de layout y contexto simbolico minimo.
- Consumidores potenciales: UI observacional.

### symbol.session.started
- Origen: workspace simbolico.
- Momento: inicio de una sesion simbolica.
- Payload permitido: sessionId, workspaceId, patientId si existe.
- Consumidores potenciales: logging interno (solo lectura).

### symbol.session.closed
- Origen: workspace simbolico.
- Momento: cierre de sesion simbolica.
- Payload permitido: sessionId, workspaceId, patientId si existe.
- Consumidores potenciales: logging interno (solo lectura).

## Definicion de payload (obligatorio)
Reglas:
- Datos planos.
- Identificadores simbolicos.
- Sin calculos.
- Sin scoring.
- Sin inferencias.
- Sin referencias clinicas.

Ejemplo valido:
```
{
  "event": "symbol.card.selected",
  "cardId": "XV",
  "system": "tarot",
  "sessionId": "abc123",
  "timestamp": "2025-12-22T14:00:00Z"
}
```

Ejemplo prohibido:
```
{
  "anxietyLevel": 7,
  "diagnosisHint": "fear",
  "recommendation": "..."
}
```

## Que NO hacen los eventos (critico)
- No interpretan simbolos.
- No generan narrativa.
- No llaman a IA.
- No disparan logica clinica.
- No alteran estado del paciente.
- No cruzan workspaces.

## Relacion con fase futura (documental)
La Fase 0 de IA simbolica consume eventos solo offline, es opt-in,
es revisada por humanos y vive fuera del UI. Esta seccion es descriptiva
y no implica implementacion ni ejecucion.

## Fuente de verdad
- AUDITORIA CABALA APP 12182025.md (normativo clinico).
- SOURCE_OF_TRUTH.md (jerarquia).
