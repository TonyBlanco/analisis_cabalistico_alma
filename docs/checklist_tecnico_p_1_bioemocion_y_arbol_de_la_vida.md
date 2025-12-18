# Checklist Técnico P1 – Bio‑Emoción & Árbol de la Vida (Backend + Frontend)

**Estado:** P1 – Implementación controlada
**Arquitectura:** CERRADA (sin refactor ni ruptura)
**Rol:** therapist
**Contexto:** therapist_clinical (conceptual)
**Referencia:** AUDITORIA CABALA APP 12182025

---

## 1. Objetivo del checklist

Este checklist define **qué hay que implementar ahora**, de forma segura y ordenada, para elevar el módulo **Bio‑Emoción & Árbol Transgeneracional** a módulo clínico de primer nivel, incorporando la **capa consultiva del Árbol de la Vida**, sin mezclar capas ni introducir deuda técnica.

---

## 2. Backend – Tareas P1

### 2.1 Normalización del “caso bio‑emocional”

- [ ] Crear modelo `BioEmocionCase`
  - FK `patient`
  - FK `therapist`
  - `is_active`
  - timestamps
- [ ] Crear migración independiente (sin tocar modelos existentes)

### 2.2 Estructura transgeneracional

- [ ] Confirmar/crear modelos:
  - `TransgenerationalNode`
  - `TransgenerationalEvent`
  - `BioEmocionNote`
- [ ] Verificar que **NO** se persistan conclusiones automáticas
- [ ] Mantener notas clínicas como texto libre

### 2.3 Serializers y vistas DRF

- [ ] Crear archivo aislado: `backend/api/bio_emotion_views.py`
- [ ] Serializers básicos (lectura/escritura controlada)
- [ ] Vistas protegidas con:
  - `IsAuthenticated`
  - `IsTherapist`
  - ownership del paciente

### 2.4 Endpoints (solo terapeuta)

- [ ] `GET /api/therapist/bio-emotion/cases/`
- [ ] `POST /api/therapist/bio-emotion/cases/`
- [ ] `GET /api/therapist/bio-emotion/cases/{id}/`
- [ ] `POST /api/therapist/bio-emotion/cases/{id}/nodes/`
- [ ] `POST /api/therapist/bio-emotion/cases/{id}/events/`
- [ ] `POST /api/therapist/bio-emotion/cases/{id}/notes/`

### 2.5 Capa Árbol de la Vida (consultiva)

- [ ] Crear servicio **no persistente**:
  - input: síntoma / evento / contexto
  - output: texto orientativo (sefirá / eje)
- [ ] Usar exclusivamente:
  - `arbol_vida.py`
  - `soul_analytics.py`
- [ ] Prohibido guardar output como dato clínico

---

## 3. Frontend – Tareas P1

### 3.1 Integración en dashboard terapeuta

- [ ] Confirmar ruta:
  - `/dashboard/therapist/bioemotional`
- [ ] Acceso solo con paciente activo

### 3.2 Componentes mínimos

- [ ] `BioEmotionCaseList`
  - listar casos del paciente
  - crear/abrir caso
- [ ] `BioEmotionCaseView`
  - resumen del caso
  - nodos transgeneracionales (tabla)
  - eventos
  - notas clínicas

### 3.3 Capa Árbol de la Vida (UI)

- [ ] Mostrar sugerencias como:
  - etiquetas
  - textos informativos
- [ ] Marcar claramente como:
  - “lectura orientativa”
- [ ] No permitir exportación ni visibilidad al paciente

---

## 4. Testing mínimo requerido

### Backend
- [ ] Test de acceso solo terapeuta
- [ ] Test de ownership del paciente
- [ ] Test de no exposición a paciente/personal

### Frontend
- [ ] Render correcto sin paciente activo
- [ ] Render correcto con paciente activo

---

## 5. Límites explícitos (no implementar)

- ❌ No scoring automático
- ❌ No uso de 72 Nombres
- ❌ No meditaciones
- ❌ No IA para pacientes
- ❌ No modificación de AnalysisRecord

---

## 6. Criterio de cierre P1

P1 se considera **completado** cuando:

- Existe un caso bio‑emocional estructurado
- El terapeuta puede trabajar bio‑emoción + transgeneracional
- La lectura del Árbol de la Vida está disponible solo como apoyo
- No hay cruce con capa personal

---

**Este checklist es vinculante y actúa como guía de ejecución técnica.**

