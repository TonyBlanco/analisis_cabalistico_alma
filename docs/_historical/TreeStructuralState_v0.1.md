# TreeStructuralState - v0.1

FASE 2 · Motor simbolico estructural del Arbol de la Vida

1) Objetivo de v0.1

Proveer un estado simbolico estructural minimo y estable del Arbol de la Vida que:

- sea determinista
- no incluya narrativa, clinica ni IA
- pueda ser producido desde el legacy existente
- pueda ser consumido por UI y Tarot sin inferencias implicitas

v0.1 habilita implementacion sin completar ejes/polaridades/fuentes.

2) Principios (bloqueantes)

- Observacional (describe estado, no concluye)
- Estructural (IDs, pesos, relaciones)
- Sin interpretacion
- Sin automatizacion decisoria
- Sin relleno de vacios

3) Entradas (conceptuales)

Datos simbolicos deterministas ya disponibles:

- Activadores numericos (numerologia / inclusion)
- Activadores simbolicos (tarot -> senderos)
- Sistema activo (p. ej., Thoth)
- Contexto simbolico (session/workspace), sin clinica

4) Salida canonica - TreeStructuralState v0.1

4.1 Campos OBLIGATORIOS (implementables ahora)

sefirot_activas

Tipo: lista de objetos estructurales

Contenido minimo por sefira:

- id_canonico (string)
- indice (int)
- peso (number)

Semantica: sefirot activadas por cualquier fuente estructural

senderos_activos

Tipo: lista de objetos estructurales

Contenido minimo por sendero:

- id_canonico (string)
- numero (int)
- endpoints (from_sefira, to_sefira)
- peso (number)

Semantica: senderos activados (11-22) por mapeos existentes

repeticiones

Tipo: lista

Contenido minimo:

- simbolo_id (sefira o sendero)
- conteo (int)

Semantica: recurrencias estructurales (no interpretacion)

pesos

Tipo: mapa

Contenido minimo:

- simbolo_id -> peso (number)

Semantica: intensidad/frecuencia estructural

4.2 Campos DECLARADOS COMO VACIOS (explicito)

ejes

Valor en v0.1: null

Nota: no existe productor legacy explicito

polaridades

Valor en v0.1: null

Nota: yin/yang no definido estructuralmente

fuentes

Valor en v0.1: null

Nota: no hay trazabilidad por campo en legacy estructural

Importante: estos campos existen en el contrato pero no se rellenan en v0.1.
La UI y Tarot no deben inferirlos.

5) Relacion con el legacy (cerrado)

Produce directamente:

- arbol_vida.py -> sefirot/senderos
- numerology.py, inclusion.py -> activaciones, repeticiones, pesos
- mapper_cabala.py -> mapeos estructurales

Excluye:

- cualquier funcion con texto, juicio o recomendacion
- modulos clinicos o de sintesis

6) Relacion con otros modulos

UI

- Consume y muestra estado
- No calcula
- No interpreta
- Respeta null como "no disponible"

Tarot

- Asiste lectura simbolica a partir del estado
- No jerarquiza ni concluye
- No inventa ejes/polaridades

IA (futuro)

- Consumidor pasivo
- Traduccion humana posterior
- Nunca decisor

7) Limites explicitos de v0.1

- No diagnostico
- No narrativa
- No inferencia implicita
- No completado automatico de vacios

8) Criterio de aceptacion v0.1

v0.1 esta correcto si:

- se puede construir solo con legacy A/B
- la UI deja de "repetir" sin contenido
- Tarot puede apoyarse en el Arbol sin interpretar
- los campos null permanecen null

Estado

TreeStructuralState v0.1 - APROBADO PARA IMPLEMENTACION

Siguiente paso (cuando quieras)
