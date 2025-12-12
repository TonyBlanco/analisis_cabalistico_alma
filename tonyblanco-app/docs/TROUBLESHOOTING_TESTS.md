# Troubleshooting - Tests Psicológicos

## Error: "Failed to fetch"

### Causas Comunes

1. **El servidor Flask no está corriendo**
   - El servidor Flask debe estar ejecutándose en `http://localhost:5000`
   - Para iniciarlo, ejecuta: `python app_cabalistica.py`

2. **Variable de entorno no configurada**
   - El componente usa `NEXT_PUBLIC_FLASK_API_URL` o fallback a `http://localhost:5000`
   - Crea un archivo `.env.local` en la raíz del proyecto:
     ```
     NEXT_PUBLIC_FLASK_API_URL=http://localhost:5000
     ```

3. **Problemas de CORS**
   - El servidor Flask tiene CORS habilitado, pero verifica que esté configurado correctamente
   - El servidor debe aceptar peticiones desde `http://localhost:3000` (puerto por defecto de Next.js)

4. **Endpoint no disponible**
   - Verifica que el endpoint `/api/tests/procesar-completo` esté implementado
   - Verifica que el servidor Flask esté escuchando en el puerto correcto

### Solución Rápida

1. **Iniciar el servidor Flask:**
   ```bash
   cd backend
   python app_cabalistica.py
   ```
   O si está en la raíz:
   ```bash
   python app_cabalistica.py
   ```

2. **Verificar que el servidor esté corriendo:**
   - Abre `http://localhost:5000/api/salud` en el navegador
   - Deberías ver: `{"status": "ok", "servicio": "API Numerología Cabalística", "version": "1.0"}`

3. **Verificar la configuración de Next.js:**
   - Asegúrate de que Next.js esté corriendo en `http://localhost:3000`
   - Si usas otro puerto, actualiza la variable de entorno

### Verificación del Endpoint

El endpoint espera:
```json
{
  "test_id": "gad-7",
  "answers": [0, 1, 2, 3, 0, 1, 2]
}
```

Y retorna:
```json
{
  "clinica": {
    "score_bruto": 9,
    "diagnostico_clinico": "Leve"
  },
  "alma": {
    "test": "GAD-7",
    "score": 9,
    "analisis_alma": { ... },
    "remedio_angelical": { ... }
  }
}
```

### Logs de Depuración

Si el error persiste, revisa:
1. La consola del navegador (F12) para ver errores de red
2. Los logs del servidor Flask para ver errores del backend
3. La pestaña Network en DevTools para ver la petición HTTP

### Tests Disponibles

- `phq-9` - PHQ-9 (Depresión)
- `gad-7` - GAD-7 (Ansiedad Generalizada)
- `bai` - BAI (Ansiedad de Beck)
- `bdi-ii` - BDI-II (Depresión de Beck)

