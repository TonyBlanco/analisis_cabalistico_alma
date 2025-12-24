# Project Context: Análisis Cabalístico del Alma

# INSTRUCCIONES DE CONTROL DE DAÑOS (SISTEMA SELLADO)

## Regla de Oro
- Objetivo: NO ROMPER lo que ya funciona.
- Antes de proponer código, verifica la "DIRECTIVA OBLIGATORIA" en `AUDITORIA CABALA APP 12182025.md`.

## Restricciones Técnicas
- ❌ PROHIBIDO: Crear endpoints, páginas nuevas o modificar rutas existentes.
- ❌ PROHIBIDO: Mezclar la capa Clínica (SCDF) con la capa Simbólica (Árbol de la Vida).
- ✅ PERMITIDO: Consultas de lectura, mantenimiento de lógica existente en los "Flujos Inmutables" (`patient_self`, `therapist_clinical`).

## Contexto de Desarrollo
- Backend: Django/DRF con hardening de tests activo.
- Frontend: Next.js App Router (tonyblanco-app).
- Fuente de Verdad: docs/AUDITORIA CABALA APP 12182025.md
## Overview
This project is a full-stack application integrating Django, Flask, and Next.js.

## Architecture

### 1. Frontend (Next.js)
- **Port:** 3000 (or 3001 if busy)
- **Startup Script:** `start-frontend.ps1`

### 2. Backend (Django)
- **Port:** 8000
- **Path:** `backend/`
- **Startup Script:** `start-backend.ps1`

### 3. Data API (Flask)
- **Port:** 5000
- **Startup Script:** `start-flask.ps1`
- **Dependencies:** Flask, pandas, flask-cors

## Development
- **Main Entry Point:** `start-all.ps1` (Orchestrates all services)
- **Virtual Environment:** `.venv` (Python)

# ⚠️ PROTOCOLO DE INTEGRIDAD Y CONSULTA OBLIGATORIA

## 1. Directorio Crítico de Referencia
- **Path:** `analisis_cabalistico_alma/docs`
- **Instrucción:** Antes de modificar cualquier archivo en `backend/` o `tonyblanco-app/`, el agente DEBE indexar y contrastar la propuesta con los documentos de este path para evitar regresiones.

## 2. Documentos de Consulta Obligatoria (Filtro Anti-Rotura)
Para no romper la arquitectura segura y las rutas selladas, consulta:
AUDITORIA CABALA APP 12182025.md: Fuente de verdad absoluta sobre lo que está permitido y lo que no.

### Arquitectura Simbólica (No Clínica)
- `ARCHITECTURE_SYMBOLIC_SYSTEM.md`: Estructura base del sistema simbólico.
- `TREE_STRUCTURAL_STATE_PHASE_2_STANDARDIZATION.md`: Contrato inmutable para los 10 métodos simbólicos.
- `SYMBOLIC_MODULE_DEPENDENCY_MATRIX.md`: Para no crear dependencias circulares prohibidas.

### Integridad y Seguridad de Datos
- `INTEGRIDAD_DATOS_CABALISTICOS.md`: Reglas de validación para el motor de cálculo.
- `SYMBOLIC_GOVERNANCE_INDEX.md`: Índice de gobernanza de datos simbólicos.
- `BIOEMOCION_EXPERIENCIAL_PROFUNDA_TECHNICAL_SPEC.md`: Frontera técnica entre lo clínico y lo experiencial.

## 3. Restricciones de Backend y Rutas
- **Rutas Prohibidas:** No reactivar rutas en `_legacy_app_backup` ni modificar el router de Next.js sin validar `MAPEO LEGACY -> CONTRATO.md`.
- **Seguridad Backend:** Mantener el hardening de `IsTherapist` y la protección de excepciones internas según `T2.1 harden therapist clinical endpoints`.
- **SCDF:** Respetar el estado de "Solo Lectura" definido en la Auditoría 12182025.

## 4. Flujo de Trabajo del Agente
1. Buscar en `/docs` el archivo `.md` relacionado con la tarea (ej. Astrología, Tarot).
2. Verificar si el cambio afecta la "Arquitectura Sellada" definida en `AUDITORIA CABALA APP 12182025.md`.
3. Si el cambio crea un nuevo endpoint no listado en la Auditoría: **ABORTAR Y PEDIR CONFIRMACIÓN**.