# PAQUETE RECTOR — SWM UI · LICENCIAS · QA
## Ecosistema de Specialized Workspace Modules

**Estado:** Documento estratégico–operativo  
**Versión:** 1.0  
**Carácter:** Vinculante  
**Dependencias:**  
- CONTRATO_TECNICO_SWM.md  
- MAPA_DE_WORKSPACES_DEL_ECOSISTEMA.md  
- Índice Maestro SWM  

---

# SECCIÓN I  
## UI KIT CONCEPTUAL — IDENTIDAD VISUAL DE LOS SWM

---

## 1. Principio de Identidad Común

Todos los SWM pertenecen a una **misma familia visual**, aunque cada uno tenga identidad propia.

Objetivo:
- evitar sensación de apps inconexas
- reducir carga cognitiva
- facilitar adopción por terapeutas

Regla base:
> **Mismo esqueleto, alma distinta.**

---

## 2. Elementos UI Comunes a Todos los SWM

Todos los SWM comparten:

- Header superior con:
  - icono del SWM
  - título corto
  - subtítulo opcional
- Área central (núcleo visual persistente)
- Sidebar interno izquierdo o derecho
- Botón explícito “Volver al espacio clínico”
- Tipografía base común
- Jerarquía visual consistente

---

## 3. Convención de Iconos (Conceptual)

Los iconos de los SWM deben cumplir:

- Ser **simbólicos**, no ilustrativos
- Trazos simples
- Lectura clara a 24–32px
- Sin detalle decorativo excesivo
- Reconocibles en monocromo

### Iconos oficiales

- **Bio-Emoción** → Silueta humana con foco central
- **Transgeneracional** → Árbol con raíces visibles
- **Cábala Aplicada** → Árbol de la Vida estilizado
- **Astrología** → Rueda circular segmentada
- **Tarot** → Carta vertical con símbolo central
- **Biodecodificación** → Forma orgánica + trazo simbólico

---

## 4. Convención de Colores (Guía)

Cada SWM tiene un **color guía suave**, nunca diagnóstico.

- Bio-Emoción → Tonos tierra / piel
- Transgeneracional → Verdes apagados
- Cábala → Azul profundo / índigo
- Astrología → Violeta suave / noche
- Tarot → Dorado neutro / sepia
- Biodecodificación → Gris cálido / orgánico

Regla:
- El color **acompaña**, no manda.
- Nunca semáforos.
- Nunca alarmas.

---

# SECCIÓN II  
## MODELO DE LICENCIAS Y ROLES POR SWM

---

## 5. Principio de Activación Modular

Cada SWM puede:

- activarse o no
- tener niveles internos
- venderse de forma independiente
- agruparse en bundles

El Core Workspace **siempre está activo**.

---

## 6. Roles de Usuario (Conceptuales)

Roles posibles:

- Terapeuta general
- Terapeuta especializado
- Facilitador simbólico
- Investigador / formador
- Usuario avanzado (no clínico)

Cada rol:
- accede a ciertos SWM
- accede a cierto nivel de profundidad

---

## 7. Niveles de Licencia por SWM

Ejemplo genérico (aplicable a todos):

### Nivel Básico
- P1 Observacional
- Visualización
- Navegación simbólica

### Nivel Profesional
- P2 Profundización humana
- Escritura, síntesis, procesos
- Herramientas avanzadas

### Nivel Avanzado
- P3 IA asistida ética
- Recursos creativos
- Integración profunda

---

## 8. Bundles posibles (futuro)

- **Bundle Cuerpo**  
  Bio-Emoción + Biodecodificación

- **Bundle Linaje**  
  Transgeneracional + Cábala

- **Bundle Tiempo**  
  Astrología + Tarot

- **Bundle Integral**  
  Todos los SWM

---

## 9. Regla de Transparencia

El sistema debe mostrar siempre:
- qué SWM están activos
- qué nivel está habilitado
- qué está bloqueado (sin frustración)

Nada oculto.
Nada engañoso.

---

# SECCIÓN III  
## CHECKLIST GLOBAL DE QA PARA SWM

---

## 10. Checklist Arquitectura

✔ El SWM es independiente  
✔ Tiene layout propio  
✔ No usa Panel Manager global  
✔ No modifica Core Workspace  
✔ Hereda contexto solo lectura  

---

## 11. Checklist UX

✔ Núcleo visual siempre visible  
✔ No hay automatismos  
✔ No hay overlays intrusivos  
✔ Ritmo humano respetado  
✔ Silencio visual posible  

---

## 12. Checklist Ético

✔ No diagnóstico  
✔ No predicción  
✔ No causalidad  
✔ Lenguaje no determinista  
✔ Terapeuta conserva soberanía  

---

## 13. Checklist IA (si aplica)

✔ IA asistente, no autoridad  
✔ Lenguaje abierto  
✔ Todo editable  
✔ Nada automático  
✔ IA no actúa sobre núcleo visual  

---

## 14. Test Final Obligatorio (Regla de Oro)

Pregunta de validación:

> “¿Este SWM ayuda a comprender  
> sin decirle a nadie qué debe pensar?”

Si la respuesta no es **sí**,  
❌ el SWM no se libera.

---

## Estado del paquete

✔ Unifica identidad visual  
✔ Permite escalado comercial  
✔ Protege ética terapéutica  
✔ Facilita QA futuro  
✔ Reduce deuda técnica  

