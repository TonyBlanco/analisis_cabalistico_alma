# Frontend Guards and Fetch Rules

**Documento de reglas críticas para prevenir loops infinitos y errores de render en el frontend.**

## 🚨 Reglas Críticas

### 1. useEffect con fetch → [] o useRef

**Problema:** `useEffect` con dependencias que cambian causa loops infinitos.

**Solución:**
- **SIEMPRE** usar `useRef` para guardar si ya se ejecutó el fetch
- **SIEMPRE** usar dependencias vacías `[]` para fetches que deben ejecutarse solo en mount
- **NUNCA** usar estados derivados como dependencias (loading, error, data)

**Ejemplo correcto:**
```tsx
const hasFetchedRef = useRef(false);

useEffect(() => {
  if (hasFetchedRef.current) {
    return; // Ya se ejecutó, no ejecutar de nuevo
  }
  hasFetchedRef.current = true;
  
  fetchData();
}, []); // CRITICAL: Empty deps
```

**Ejemplo incorrecto:**
```tsx
// ❌ MALO - causa loop infinito
useEffect(() => {
  fetchData();
}, [data, loading, error]); // Dependencias que cambian
```

### 2. Nunca usar estados derivados como dependencias

**Problema:** Estados que se actualizan dentro del `useEffect` causan re-ejecuciones infinitas.

**Regla:**
- **NUNCA** incluir `loading`, `error`, `data`, `results` en las dependencias
- **NUNCA** incluir estados que se modifican dentro del mismo `useEffect`
- **SIEMPRE** usar `useRef` para rastrear valores previos si necesitas comparar cambios

**Ejemplo correcto:**
```tsx
const prevValueRef = useRef<string | null>(null);

useEffect(() => {
  if (prevValueRef.current === someValue) {
    return; // No cambió, no hacer nada
  }
  prevValueRef.current = someValue;
  
  // Hacer algo con someValue
}, [someValue]);
```

### 3. Guards tolerantes a fallo de red

**Problema:** Si `fetchSession` falla, el guard rompe el render.

**Solución:**
- **SIEMPRE** hacer que `fetchSession` retorne `{ isAuthenticated: false, user: null }` en caso de error
- **NUNCA** lanzar errores desde `fetchSession` o `apiRequest` en guards
- **SIEMPRE** permitir render incluso si el rol no se pudo determinar (network error)

**Ejemplo correcto:**
```tsx
// En useRoleGuard
const session = await fetchSession(); // Nunca lanza, siempre retorna objeto seguro

if (!session.isAuthenticated || !session.user) {
  setRole(null);
  setAuthorized(false);
  // NO redirigir si hay token pero falló la red
  // Solo redirigir si definitivamente no hay token
}
```

### 4. UI siempre renderiza algo

**Problema:** Componentes que retornan `null` o lanzan errores rompen el render.

**Solución:**
- **NUNCA** retornar `null` en componentes principales
- **SIEMPRE** mostrar estados explícitos: loading, empty, error
- **SIEMPRE** mostrar contenido visible incluso en estados de error

**Ejemplo correcto:**
```tsx
// ✅ BIEN - siempre renderiza algo
if (loading) {
  return <LoadingState />;
}

if (error) {
  return <ErrorState message={error} />;
}

if (data.length === 0) {
  return <EmptyState />;
}

return <Content data={data} />;
```

**Ejemplo incorrecto:**
```tsx
// ❌ MALO - puede retornar null
if (!authorized) {
  return null; // Rompe el render
}
```

### 5. Ningún fetch automático de retry

**Problema:** Retries automáticos causan loops infinitos.

**Solución:**
- **NUNCA** implementar retry automático en `useEffect`
- **SIEMPRE** requerir acción explícita del usuario (botón "Reintentar")
- **SIEMPRE** usar `useRef` para prevenir múltiples ejecuciones

**Ejemplo correcto:**
```tsx
// ✅ BIEN - solo ejecuta una vez
const hasFetchedRef = useRef(false);

useEffect(() => {
  if (hasFetchedRef.current) return;
  hasFetchedRef.current = true;
  fetchData();
}, []);

// Retry solo con botón explícito
<button onClick={() => {
  hasFetchedRef.current = false; // Reset para permitir retry manual
  fetchData();
}}>Reintentar</button>
```

**Ejemplo incorrecto:**
```tsx
// ❌ MALO - retry automático causa loops
useEffect(() => {
  fetchData().catch(() => {
    setTimeout(() => fetchData(), 1000); // Loop infinito
  });
}, []);
```

## 📋 Checklist de Implementación

Antes de modificar cualquier componente con fetches:

- [ ] ¿El `useEffect` tiene dependencias vacías `[]`?
- [ ] ¿Hay un `useRef` que previene ejecuciones múltiples?
- [ ] ¿Las funciones de fetch nunca lanzan errores (retornan objetos de error)?
- [ ] ¿El componente siempre renderiza algo visible (nunca `null`)?
- [ ] ¿No hay retries automáticos?

## 🔍 Archivos Críticos

Estos archivos DEBEN seguir estas reglas:

- `lib/role-guards.ts` - Guard de roles
- `lib/api.ts` - Cliente API (apiRequest nunca lanza)
- `lib/session.ts` - fetchSession nunca lanza
- `components/PatientAssignedTestsSection.tsx` - Fetch de tests asignados
- `components/PatientResultsSection.tsx` - Fetch de resultados
- `app/(dashboard)/dashboard/patient/page.tsx` - Dashboard principal

## ⚠️ Bloqueo de Regresiones

**Si alguien modifica estos archivos, DEBE:**
1. Verificar que los `useEffect` tengan `useRef` guards
2. Verificar que las dependencias sean `[]` o estén correctamente controladas
3. Verificar que no haya retries automáticos
4. Verificar que el componente siempre renderice algo visible

**Si se detecta una regresión:**
- Revertir inmediatamente
- Aplicar estas reglas
- Verificar que no haya loops infinitos en la consola del navegador

## 📝 Notas Adicionales

- `apiRequest` retorna `ApiErrorResponse` en lugar de lanzar errores
- `fetchSession` siempre retorna `{ isAuthenticated: boolean, user: User | null }`
- Los componentes muestran estados vacíos en lugar de errores cuando falla la red
- El dashboard renderiza incluso si el backend no está disponible
