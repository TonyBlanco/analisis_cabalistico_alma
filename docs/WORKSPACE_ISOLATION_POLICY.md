# WORKSPACE_ISOLATION_POLICY.md

## Pol├¡tica de Aislamiento de Workspaces y Control de Exportaci├│n

**Estado:** ACTIVA
**Autoridad:** Arquitectura / Gobernanza
**Compatibilidad:** `PROJECT_LOCK.md`
**Fecha de entrada en vigor:01/04/2025*

## 1) OBJETIVO

Establecer una **pol├¡tica obligatoria de aislamiento total entre Workspaces** con el fin de:

* Reducir complejidad cognitiva
* Eliminar confusi├│n en el Workspace del terapista
* Evitar contaminaci├│n sem├íntica y cl├¡nica
* Garantizar trazabilidad, control humano y claridad operativa

Esta pol├¡tica redefine c├│mo se **genera, gestiona, comparte y exporta** la informaci├│n entre Workspaces.

---

## 2) PRINCIPIO FUNDAMENTAL (NO NEGOCIABLE)

> **Cada Workspace es soberano de su informaci├│n.**

Esto implica que **ning├║n Workspace**:

* lee informaci├│n viva de otro Workspace
* comparte informaci├│n autom├íticamente
* depende de estados globales impl├¡citos

---

## 3) DEFINICI├ôN DE WORKSPACE

Un Workspace es una **unidad cerrada** que contiene:

* Su propio modelo de datos
* Su propio historial
* Su propia l├│gica
* Su propia interfaz
* Su propio contexto sem├íntico

Un Workspace **no es**:

* una vista de datos globales
* un agregador autom├ítico
* un nodo de sincronizaci├│n

---

## 4) AISLAMIENTO ENTRE WORKSPACES

### 4.1 Regla general

* Γ¥î Prohibido compartir datos de forma autom├ítica
* Γ¥î Prohibido consumir estados vivos de otros Workspaces
* Γ¥î Prohibido sincronizar o replicar informaci├│n impl├¡citamente

Cada Workspace opera **como si los dem├ís no existieran**.

---

## 5) WORKSPACE DEL TERAPISTA ΓÇö ROL ESPECIAL

El Workspace del terapista es el **├║nico punto de convergencia**, pero **NO es un hub de datos vivos**.

### Contiene exclusivamente:

1. **Arco cl├¡nico**
2. **Notas cl├¡nicas**
3. **Anotaciones manuales**
4. **Referencias exportadas expl├¡citamente desde otros Workspaces**

No contiene:

* estados t├⌐cnicos
* datos intermedios
* contextos simb├│licos vivos
* sincronizaciones autom├íticas

---

## 6) MECANISMO ├ÜNICO DE COMPARTICI├ôN

### (EXPORTACI├ôN EXPL├ìCITA)

### 6.1 Principio

> **Nada sale de un Workspace sin una acci├│n consciente del terapista.**

---

### 6.2 Modalidad

Cada Workspace puede ofrecer una acci├│n expl├¡cita:

**ΓÇ£Exportar al Workspace del TerapistaΓÇ¥**

Esta acci├│n es:

* manual
* consciente
* trazable
* reversible solo a nivel documental (no t├⌐cnico)

---

### 6.3 Naturaleza de la exportaci├│n

Lo exportado se convierte en:

* texto estructurado
* snapshot
* resumen
* referencia

Y pasa a ser:

> **una nota est├ítica bajo control del terapista**

---

## 7) QU├ë SE PUEDE EXPORTAR

Γ£ö Permitido:

* Res├║menes finales
* Observaciones
* Snapshots cerrados
* Resultados concluidos
* Texto interpretativo validado

Γ¥î Prohibido:

* Estados internos
* Flags t├⌐cnicos
* Datos intermedios
* Contexto algor├¡tmico
* Dependencias del Workspace origen

---

## 8) EFECTO POST-EXPORTACI├ôN

Una vez exportado:

* Γ¥î No existe v├¡nculo vivo
* Γ¥î No hay sincronizaci├│n
* Γ¥î No hay actualizaci├│n autom├ítica
* Γ¥î No hay dependencia del Workspace origen

El contenido exportado **no arrastra l├│gica**, solo significado humano.

---

## 9) IMPLICACIONES PARA AGENTES / IA

* Ning├║n agente puede acceder a m├║ltiples Workspaces simult├íneamente
* Ning├║n agente puede inferir estados globales
* Los agentes solo reciben:

  * lo que el terapista export├│
  * en formato est├ítico

Esto reduce riesgos de:

* inferencia indebida
* errores cl├¡nicos
* contaminaci├│n sem├íntica

---

## 10) CUMPLIMIENTO Y CONTROL

* Todo Workspace nuevo debe cumplir esta pol├¡tica
* Todo refactor debe eliminar dependencias impl├¡citas
* Las violaciones se consideran **errores arquitect├│nicos**

---

## 11) RELACI├ôN CON DOCUMENTOS CAN├ôNICOS

Este documento es complementario y obligatorio junto a:

* `PROJECT_LOCK.md`
* `DOCUMENTATION_GOVERNANCE.md`
* `ARCHITECTURE_SYMBOLIC_SYSTEM.md`
* `SWM_V3_GOVERNANCE_ARTIFACTS.md`
* `WORKSPACE_EXPORT_CONTRACT.md`

En caso de conflicto, prevalece la gobernanza y el lock.

---

## 12) EXCEPCIONES

No existen excepciones t├⌐cnicas.

Cualquier excepci├│n requerir├í:

* Documento expl├¡cito
* Auditor├¡a SCE
* Aprobaci├│n formal
* Nuevo desbloqueo (`PROJECT_UNLOCK.md`)

---

## 13) FIRMA DE POL├ìTICA

**Responsable:** ___________________________
**Rol:** Arquitectura / SCE
**Fecha:** ___________________________

---

## NOTA FINAL

Esta pol├¡tica existe para **simplificar**, **proteger** y **hacer legible** el sistema.

A partir de ahora:

* los Workspaces piensan solos
* el terapista decide qu├⌐ une
* el sistema deja de adivinar

---



DECISI├ôN SCE CONFIRMADA
Γ¥ù Los Workspaces existentes NO se reescriben ni se migra su data

Motivo

Existen 3ΓÇô4 Workspaces altamente complejos

Reiniciar o redise├▒ar su modelo de datos ser├¡a:

costoso

arriesgado

innecesario

El riesgo de romper l├│gica validada es inaceptable

≡ƒôî Conclusi├│n SCE:
≡ƒæë La data existente es intocable.

ENFOQUE CORRECTO (SIN REHACER NADA)
≡ƒöÆ Principio

Aislar comportamiento Γëá rehacer datos

No tocamos:

esquemas

tablas

modelos

hist├│ricos

l├│gica interna validada

Solo actuamos en el per├¡metro.

1∩╕ÅΓâú QU├ë SE HACE (permitido)
Γ£à Encapsulaci├│n por capa

En cada Workspace existente:

Se mantiene toda la data tal cual

Se mantiene la l├│gica interna

Se mantiene su UI principal

Solo se a├▒ade (si no existe):

una capa de frontera (boundary layer)

Ejemplos de frontera:

Adapter

Exporter

Snapshot builder

Summary generator

Nada m├ís.

2∩╕ÅΓâú QU├ë SE PROH├ìBE (expl├¡cito)

Γ¥î Migrar data

Γ¥î Unificar modelos

Γ¥î Normalizar entre Workspaces

Γ¥î Compartir tablas

Γ¥î Introducir estados globales

Γ¥î Recalcular hist├│ricos

Esto romper├¡a el lock.

3∩╕ÅΓâú C├ôMO SE APLICA LA NUEVA POL├ìTICA A WORKSPACES VIEJOS
Regla SCE clave

Un Workspace antiguo puede seguir siendo complejo internamente,
pero hacia afuera se comporta como una caja negra.

Implicaciones

Internamente:

puede seguir usando datos compartidos antiguos

puede tener cruces hist├│ricos

Externamente:

no expone nada autom├íticamente

no lee nada autom├íticamente

4∩╕ÅΓâú MECANISMO DE TRANSICI├ôN (sin refactor)

Para cada Workspace existente:

A) Se deja todo igual internamente

(no tocar nada)

B) Se define UNA salida oficial

Ejemplo:

exportSummary()

exportSnapshot()

exportObservations()

Esa salida:

transforma data compleja en:

texto

resumen

snapshot

sin referencias vivas

sin dependencias

5∩╕ÅΓâú WORKSPACE DEL TERAPISTA (compatibilidad total)

El Workspace del terapista:

Γ¥î NO consume data viva

Γ¥î NO se conecta a modelos antiguos

Γ¥î NO entiende la complejidad interna

Solo recibe:

lo que el Workspace export├│

como nota est├ítica

con origen identificado

Esto protege al terapista y no rompe nada existente.

6∩╕ÅΓâú CLASIFICACI├ôN SCE DE WORKSPACES

A partir de ahora, internamente puedes pensar as├¡:

Tipo A ΓÇö Workspaces legacy complejos

No se tocan

Se encapsulan

Solo exportan res├║menes

Tipo B ΓÇö Workspaces nuevos

Nacen ya aislados

Cumplen la pol├¡tica desde el inicio

Ambos conviven sin conflicto.

7∩╕ÅΓâú RESULTADO FINAL (clave)

Γ£à No se pierde nada

Γ£à No se reescribe nada

Γ£à No se rompe l├│gica compleja

Γ£à Se elimina la confusi├│n en el terapista

Γ£à El sistema vuelve a ser legible

Esto es arquitectura madura, no reset.



MATRIZ DE WORKSPACES EXISTENTES (AUDITOR├ìA SCE)
PASO 1 ΓÇö IDENTIFICACI├ôN
Workspace del Terapista: Dominio funcional: Dashboard cl├¡nico, notas integrativas, visualizaci├│n Body/Soul. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
Astrolog├¡a Profesional: Dominio funcional: C├ílculo y visualizaci├│n de cartas astrales. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
Tarot / B.O.T.A. (SWM v3): Dominio funcional: Lecturas simb├│licas, interpretaci├│n gobernada. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
Resonancia Ancestral: Dominio funcional: Exploraci├│n de patrones ancestrales. Tipo: LEGACY SIMPLE. Nivel de riesgo si se modifica data: MEDIO.
MSHE: Dominio funcional: S├¡ntesis hol├¡stica evaluativa. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
SCID5: Dominio funcional: Exploraci├│n cl├¡nica hol├¡stica. Tipo: LEGACY SIMPLE. Nivel de riesgo si se modifica data: MEDIO.
Body/Soul Visualization: Dominio funcional: Visualizaci├│n simb├│lica integrada. Tipo: LEGACY COMPLEJO. Nivel de riesgo si se modifica data: ALTO.
PASO 2 ΓÇö MATRIZ
Workspace	Tipo	Data interna (intocable)	Complejidad	┬┐Comparte data hoy?	┬┐Debe dejar de compartir data autom├íticamente?	Tipo de salida permitida	Exportable al Workspace del Terapista	Notas SCE (riesgos, advertencias)
Workspace del Terapista	LEGACY COMPLEJO	Notas integrativas, registros cl├¡nicos	alta	no	s├¡	Resumen, Observaciones	N/A	Riesgo de contaminaci├│n cruzada si se integra con simb├│licos; encapsular estrictamente.
Astrolog├¡a Profesional	LEGACY COMPLEJO	Cartas astrales, efem├⌐rides, an├ílisis	alta	no	s├¡	Snapshot, Resumen	S├¡ (manual)	Riesgo alto de modificaci├│n accidental; aislamiento obligatorio para evitar cambios en c├ílculos.
Tarot / B.O.T.A. (SWM v3)	LEGACY COMPLEJO	Lecturas simb├│licas, contratos SWM	alta	no	s├¡	Snapshot, Observaciones	S├¡ (manual)	Riesgo arquitect├│nico si se sincroniza; no permitir v├¡nculos vivos.
Resonancia Ancestral	LEGACY SIMPLE	Patrones ancestrales, UI	media	no	s├¡	Observaciones	S├¡ (manual)	Riesgo medio de acoplamiento; encapsular para evitar exportaciones autom├íticas.
MSHE	LEGACY COMPLEJO	S├¡ntesis evaluativa, pesos, IA	alta	no	s├¡	Resumen	S├¡ (manual)	Riesgo de fuga de s├¡ntesis cl├¡nica; aislamiento estricto.
SCID5	LEGACY SIMPLE	Exploraciones hol├¡sticas, booleanos	media	no	s├¡	Observaciones	S├¡ (manual)	Riesgo de malinterpretaci├│n cl├¡nica; encapsular sin integraci├│n autom├ítica.
Body/Soul Visualization	LEGACY COMPLEJO	Estados estructurales, flujos simb├│licos	alta	no	s├¡	Snapshot	S├¡ (manual)	Riesgo de auto-inyecci├│n en notas; encapsulaci├│n previa implementada.
PASO 3 ΓÇö REGLAS DE TRANSICI├ôN
Para cada Workspace legacy:

Workspace del Terapista: Γ¥î No se toca la data. Γ¥î No se migra. Γ¥î No se normaliza. Salida oficial: Export manual de res├║menes a notas. Sin v├¡nculo vivo. Sin sincronizaci├│n.
Astrolog├¡a Profesional: Γ¥î No se toca la data. Γ¥î No se migra. Γ¥î No se normaliza. Salida oficial: Export manual de snapshot astral. Sin v├¡nculo vivo. Sin sincronizaci├│n.
Tarot / B.O.T.A. (SWM v3): Γ¥î No se toca la data. Γ¥î No se migra. Γ¥î No se normaliza. Salida oficial: Export manual de observaciones simb├│licas. Sin v├¡nculo vivo. Sin sincronizaci├│n.
Resonancia Ancestral: Γ¥î No se toca la data. Γ¥î No se migra. Γ¥î No se normaliza. Salida oficial: Export manual de observaciones. Sin v├¡nculo vivo. Sin sincronizaci├│n.
MSHE: Γ¥î No se toca la data. Γ¥î No se migra. Γ¥î No se normaliza. Salida oficial: Export manual de resumen sint├⌐tico. Sin v├¡nculo vivo. Sin sincronizaci├│n.
SCID5: Γ¥î No se toca la data. Γ¥î No se migra. Γ¥î No se normaliza. Salida oficial: Export manual de observaciones. Sin v├¡nculo vivo. Sin sincronizaci├│n.
Body/Soul Visualization: Γ¥î No se toca la data. Γ¥î No se migra. Γ¥î No se normaliza. Salida oficial: Export manual de snapshot visual. Sin v├¡nculo vivo. Sin sincronizaci├│n.
PASO 4 ΓÇö CONCLUSI├ôN SCE
Lista de Workspaces NO TOCAR: Workspace del Terapista, Astrolog├¡a Profesional, Tarot / B.O.T.A. (SWM v3), MSHE, Body/Soul Visualization.

Lista de Workspaces listos para aislamiento inmediato: Resonancia Ancestral, SCID5.

Riesgos residuales: Contaminaci├│n cruzada si exportaciones manuales no se controlan; riesgo de modificaci├│n accidental en data legacy compleja.

Recomendaciones solo de encapsulaci├│n: Implementar UI de export manual en cada Workspace; remover cualquier listener autom├ítico de integraci├│n; validar aislamiento en auditor├¡as futuras.

