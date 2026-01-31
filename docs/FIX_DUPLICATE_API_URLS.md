# Fix: URLs Duplicadas en API Calls

## Problema Detectado
Los endpoints del frontend estaban generando URLs con `/api/api/` duplicado, causando errores 404.

**Ejemplo del error:**
```
POST /api/api/cabala/exportacion-narrativa/ HTTP/1.1" 404
```

## Causa Raíz
- `getApiBaseUrl()` en `lib/api-base.ts` ya retorna URLs con `/api` incluido (ej: `http://localhost:8000/api`)
- Los archivos de componentes estaban agregando `/api/` adicional en sus fetch calls

## Archivos Corregidos

### 1. `components/CabalAppliedWorkspace/ExportacionNarrativaPanel.tsx`
```diff
- const response = await fetch(`${API_BASE_URL}/api/cabala/exportacion-narrativa/`, {
+ const response = await fetch(`${API_BASE_URL}/cabala/exportacion-narrativa/`, {
```

### 2. `components/CabalAppliedWorkspace/SincroniasPanel.tsx`
```diff
- const response = await fetch(`${API_BASE_URL}/api/cabala/sincronias/`, {
+ const response = await fetch(`${API_BASE_URL}/cabala/sincronias/`, {
```

### 3. `components/CabalAppliedWorkspace/AlertasPreventivasPanel.tsx`
```diff
- const response = await fetch(`${API_BASE_URL}/api/cabala/alertas-preventivas/`, {
+ const response = await fetch(`${API_BASE_URL}/cabala/alertas-preventivas/`, {
```

### 4. `components/CabalAppliedWorkspace/CalendarioCosmicPanel.tsx`
```diff
- const response = await fetch(`${API_BASE_URL}/api/cabala/calendario-cosmico/?${params}`, {
+ const response = await fetch(`${API_BASE_URL}/cabala/calendario-cosmico/?${params}`, {
```

### 5. `src/lib/api.ts`
```diff
- const response = await fetch(`${API_BASE_URL}/api/calcular/`, {
+ const response = await fetch(`${API_BASE_URL}/calcular/`, {
```

### 6. `src/lib/api/inquiry.ts` (múltiples endpoints)
```diff
- const url = `${API_BASE_URL}/api/inquiry/gaps/?patient_id=${patientId}&module=${moduleCode}`;
+ const url = `${API_BASE_URL}/inquiry/gaps/?patient_id=${patientId}&module=${moduleCode}`;

- const response = await fetch(`${API_BASE_URL}/api/inquiry/responses/`, {
+ const response = await fetch(`${API_BASE_URL}/inquiry/responses/`, {

- const response = await fetch(`${API_BASE_URL}/api/inquiry/batches/`, {
+ const response = await fetch(`${API_BASE_URL}/inquiry/batches/`, {

- let url = `${API_BASE_URL}/api/inquiry/responses/${patientId}/`;
+ let url = `${API_BASE_URL}/inquiry/responses/${patientId}/`;
```

### 7. `src/lib/api/federation.ts`
```diff
- const response = await fetch(`${API_BASE_URL}/api/federation/hub-feed/?${params.toString()}`, {
+ const response = await fetch(`${API_BASE_URL}/federation/hub-feed/?${params.toString()}`, {
```

## Validación
- ✅ `npm run build` - Compilación exitosa
- ✅ `python manage.py check` - Django sin errores
- ✅ `curl http://localhost:8000/api/cabala/exportacion-narrativa/` - Endpoint responde correctamente

## Regla de Desarrollo
**NUNCA agregar `/api/` manualmente en fetch calls**

`API_BASE_URL` ya incluye el prefijo `/api`. Solo agregar la ruta específica del endpoint:
```typescript
// ✅ Correcto
fetch(`${API_BASE_URL}/cabala/exportacion-narrativa/`)

// ❌ Incorrecto (causa /api/api/)
fetch(`${API_BASE_URL}/api/cabala/exportacion-narrativa/`)
```

## Fecha de Fix
1 de Febrero de 2026 - 23:45  

**Estado**: ✅ COMPLETAMENTE RESUELTO  
**Commit**: `72d159e7` - feat: Add comprehensive tooltips to all Cabala Aplicada modules  
**Validación**: Compilación exitosa y APIs funcionando