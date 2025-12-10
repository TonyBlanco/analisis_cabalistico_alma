# Configuración Final - Vercel + Render

## ✅ Backend está funcionando
- ✅ Render: https://analisis-cabalistico-alma.onrender.com/api/
- ✅ Usuarios creados: `supportadmin` y `supertony`

## ✅ Frontend está funcionando  
- ✅ Vercel: https://analisis-cabalistico-alma.vercel.app/
- ✅ Código apunta al backend correcto

## ⚠️ PROBLEMA: CORS bloqueando el login

El backend de Render necesita estas variables de entorno para aceptar peticiones de Vercel:

### 📋 Variables requeridas en Render Dashboard:

1. **Ve a:** https://dashboard.render.com → Tu servicio backend → Environment

2. **Añade estas variables:**

```
CORS_ALLOWED_ORIGINS=https://analisis-cabalistico-alma.vercel.app,https://analisis-cabalistico-alma-tonyblancos-projects.vercel.app,https://analisis-cabalistico-alma-tonyblanco-tonyblancos-projects.vercel.app

CSRF_TRUSTED_ORIGINS=https://analisis-cabalistico-alma.vercel.app,https://analisis-cabalistico-alma-tonyblancos-projects.vercel.app,https://analisis-cabalistico-alma-tonyblanco-tonyblancos-projects.vercel.app
```

3. **Opcional - Define password segura:**
```
ADMIN_DEFAULT_PASSWORD=TuPasswordSegura123!
```

4. **Click "Save Changes"** - Render redeployará automáticamente.

---

## 🧪 Después del redeploy:

1. **Limpia cache del navegador:**
   - Chrome: F12 → Application → Clear storage
   - O abre ventana de incógnito

2. **Prueba login en:**
   - https://analisis-cabalistico-alma.vercel.app/login
   - Usuario: `supportadmin` (o `supertony`)
   - Password: La que definiste (o `TempAdmin123!` si no la definiste)

3. **Si funciona:**
   - ✅ Entra al admin de Django: https://analisis-cabalistico-alma.onrender.com/admin/
   - ✅ Cambia la password por una segura
   - ✅ Todo listo

---

## 🔍 Si sigue sin funcionar:

Ejecuta esto en tu navegador (F12 → Console):
```javascript
fetch('https://analisis-cabalistico-alma.onrender.com/api/', {
  method: 'OPTIONS',
  headers: { 'Origin': window.location.origin }
}).then(r => console.log(r.headers.get('Access-Control-Allow-Origin')))
```

Si responde `null`, el CORS aún no está configurado. Verifica las variables en Render.

---

## 📝 Resumen de lo que hicimos:

1. ✅ Creamos usuarios admin (`supportadmin`, `supertony`) con migraciones
2. ✅ Configuramos el frontend para apuntar al backend de Render
3. ✅ Eliminamos el endpoint temporal de seguridad
4. ⏳ **FALTA:** Añadir CORS en Render (hazlo manualmente arriba)

**Después de esto, todo funcionará correctamente sin más cambios.**
