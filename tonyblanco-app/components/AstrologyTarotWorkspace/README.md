# AstrologyTarotWorkspace

## Tarot plugin adapter
Tarot renders as a BodySoulVisualization plugin so the workspace stays a thin container. The adapter exists to mount TarotLayer without changing workspace logic; props flow in from the workspace and pass through to the plugin for visual-only rendering.

<!--
AstrologyTarotWorkspace -> AstrologyTarotVisualCore -> TarotPluginAdapter -> TarotLayer (plugin)
Props: patientId, patientBirthDate, callbacks (passthrough)
-->
