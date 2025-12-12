# Advertencias del Navegador

## Advertencia: "Unload event listeners are deprecated"

### Descripción
Chrome muestra una advertencia sobre event listeners `unload` que están deprecados:
```
Unload event listeners are deprecated and will be removed.
1 source
nuanria.Chrome.js:59
```

### Causa
Esta advertencia **NO** proviene de nuestro código, sino de:
- Una librería externa (`nuanria.Chrome.js`)
- Una extensión del navegador
- Código de terceros cargado en la página

### Verificación
Hemos verificado que nuestro código no usa event listeners `unload`. Los únicos event listeners que usamos son:
- `mousemove` (en `app/page.tsx`)
- `mousedown` (en `components/MainNav.tsx`)

### Solución
Como esta advertencia proviene de código externo, no podemos corregirla directamente. Sin embargo:

1. **Si es una extensión del navegador**: Puedes desactivarla temporalmente para verificar
2. **Si es una librería externa**: Contacta al mantenedor de la librería
3. **Nuestro código**: Ya usa las mejores prácticas y no necesita cambios

### Alternativas Modernas
Si necesitáramos usar eventos similares en el futuro, usaríamos:
- `beforeunload` - Para confirmar antes de salir de la página
- `pagehide` - Para detectar cuando la página se oculta (recomendado)
- `visibilitychange` - Para detectar cambios de visibilidad

### Referencias
- [MDN: beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)
- [MDN: pagehide](https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event)
- [Chrome Deprecation Notice](https://developer.chrome.com/blog/page-lifecycle-api/)

