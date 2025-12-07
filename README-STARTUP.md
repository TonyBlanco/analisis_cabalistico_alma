# 🚀 Guía de Inicio Rápido

## El Problema que Estabas Experimentando

### ❌ **Error: "Hubo un error al generar la ficha"**

**Causa Principal:**
- El comando `python` usa el Python del **sistema** (C:\Python310\python.exe)
- Este Python **NO tiene Django instalado**
- La aplicación requiere Django, djangorestframework, y django-cors-headers
- Estas librerías **solo están instaladas en el entorno virtual** (.venv)

### ✅ **Solución:**

Debes usar el Python del **entorno virtual** que tiene todas las dependencias instaladas:
```powershell
D:/analisis_cabalistico_alma/.venv/Scripts/python.exe
```

## 📋 Formas de Iniciar la Aplicación

### **Opción 1: Script Automático (Recomendado)**
Inicia ambos servidores automáticamente:
```powershell
.\start-all.ps1
```

### **Opción 2: Scripts Individuales**
Inicia cada servidor por separado:

**Backend (Django):**
```powershell
.\start-backend.ps1
```

**Frontend (Next.js):**
```powershell
.\start-frontend.ps1
```

### **Opción 3: Manual (Para Debugging)**

**Backend:**
```powershell
cd backend
D:/analisis_cabalistico_alma/.venv/Scripts/python.exe manage.py runserver 8000
```

**Frontend:**
```powershell
cd tonyblanco-app
npm run dev
```

## 🔍 Verificar que Todo Funciona

### Verificar Entorno Virtual:
```powershell
D:/analisis_cabalistico_alma/.venv/Scripts/python.exe -c "import django; print('Django:', django.VERSION)"
```

### Verificar Backend:
```powershell
curl http://127.0.0.1:8000/api/
```

### Verificar Frontend:
Abre en el navegador: http://localhost:3000

## 📦 Instalación de Dependencias

### Backend (Python):
```powershell
# Activar entorno virtual
.\.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install django djangorestframework django-cors-headers

# O si tienes requirements.txt:
pip install -r backend/requirements.txt
```

### Frontend (Node.js):
```powershell
cd tonyblanco-app
npm install
```

## ⚠️ Problemas Comunes

### 1. "ModuleNotFoundError: No module named 'django'"
**Causa:** Estás usando el Python del sistema, no del entorno virtual.
**Solución:** Usa el script `start-backend.ps1` o el path completo del Python del .venv

### 2. "Port 3000 is already in use"
**Causa:** Ya hay un proceso de Next.js corriendo.
**Solución:**
```powershell
# Encontrar el proceso
Get-Process | Where-Object { $_.ProcessName -eq "node" }

# Matar el proceso (reemplaza XXXX con el ID)
Stop-Process -Id XXXX -Force
```

### 3. "Port 8000 is already in use"
**Causa:** Ya hay un servidor Django corriendo.
**Solución:**
```powershell
# Encontrar el proceso
Get-Process | Where-Object { $_.ProcessName -eq "python" }

# Matar el proceso (reemplaza XXXX con el ID)
Stop-Process -Id XXXX -Force
```

## 🎯 Resumen

| Servidor | Puerto | URL | Comando |
|----------|--------|-----|---------|
| Backend (Django) | 8000 | http://127.0.0.1:8000 | `.\start-backend.ps1` |
| Frontend (Next.js) | 3000 | http://localhost:3000 | `.\start-frontend.ps1` |
| Ambos | - | - | `.\start-all.ps1` |

---

**Nota:** Los scripts PowerShell automáticamente usan el entorno virtual correcto, evitando problemas de dependencias. 🎉
