---

### 1. Propósito del Módulo

* Astrología profesional holística
* Lectura simbólica
* Uso terapéutico no clínico
* Integración futura con análisis psicológicos (Jung / Liz Greene)

---

### 2. Motor Astronómico

* Swiss Ephemeris
* Tropical
* Sistema de casas: Placidus
* Precisión astronómica real
* Cálculo bajo demanda (no automático)

---

### 3. Identidad Canónica del Consultante

Requisitos mínimos para renderizar carta:

* fecha_nacimiento
* coordenadas
* identidad válida activa

Si no existe → **bloqueo visual explícito**

---

### 4. Modos Implementados (A1–A14)

#### Activos

* Carta Natal
* Natal + Asteroides
* Doble Rueda (base sinastría)

#### En integración (bloqueados)

* Compuesta
* Davison
* Tránsitos
* Progresiones
* Arco Solar
* Retornos
* Armónicos
* Persona Charts
* Relocación

---

### 5. Visualización

* SVG avanzado
* Rotación por ASC
* Anillos clásicos
* Casas numeradas
* Glifos planetarios
* Jerarquía de aspectos por orbe
* Modo single / doble rueda

---

### 6. Filosofía de Arquitectura

* Modular
* Progresiva
* Sin refactors destructivos
* Sin “marketplace”
* Métodos como **capacidades del sistema**

---

### 7. Terminología Canónica

| Prohibido   | Correcto              |
| ----------- | --------------------- |
| paciente    | consultante           |
| diagnóstico | lectura simbólica     |
| clínico     | holístico             |
| tratamiento | proceso de conciencia |

---

> Ningún método nuevo (A16+) podrá implementarse sin respetar:
>
> * Identidad canónica
> * Contratos de AstroMethod
> * Render SVG central
> * Filosofía holística
