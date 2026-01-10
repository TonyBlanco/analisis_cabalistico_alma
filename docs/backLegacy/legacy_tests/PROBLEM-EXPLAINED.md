---
ESTADO: HISTÓRICO / NO VIGENTE
FECHA_MOVIMIENTO: 2026-01-10
MOTIVO: Contradicción con Fuente de Verdad actual
REFERENCIA: symbolic_contradictions_matrix.csv
---

## 🔍 The Problem Explained

### What's Happening:

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR COMPUTER                             │
│                                                              │
│  ┌────────────────────┐         ┌────────────────────┐     │
│  │  System Python     │         │  Virtual Env (.venv)│     │
│  │  C:\Python310\     │         │  D:\...\\.venv\     │     │
│  │                    │         │                     │     │
│  │  Packages:         │         │  Packages:          │     │
│  │  ❌ NO Django      │         │  ✅ Django          │     │
│  │  ❌ NO DRF         │         │  ✅ DRF             │     │
│  │  ❌ NO CORS        │         │  ✅ CORS Headers    │     │
│  └────────────────────┘         └────────────────────┘     │
│           ▲                              ▲                  │
│           │                              │                  │
│           │ ❌ WRONG                     │ ✅ CORRECT       │
│           │                              │                  │
│      When you run:                  When you run:           │
│      `python manage.py`         `.venv\Scripts\python.exe`  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### The Error Flow:

```
User fills form → Click "Generar Ficha"
         ↓
Frontend sends POST to http://127.0.0.1:8000/api/calcular/
         ↓
Backend (Django) tries to process...
         ↓
   ❌ ERROR! Django not found
         ↓
Frontend receives error → "Hubo un error al generar la ficha"
```

### The Solution:

**Always use the virtual environment Python:**

```powershell
# ❌ WRONG (uses system Python without Django)
python manage.py runserver

# ✅ CORRECT (uses virtual env Python with Django)
D:/analisis_cabalistico_alma/.venv/Scripts/python.exe manage.py runserver

# ✅ EVEN BETTER (use the startup script)
.\start-backend.ps1
```

### Why Virtual Environments?

```
┌──────────────────────────────────────────────────────┐
│  PROJECT A                                           │
│  Django 4.2 + Python 3.9                            │
│  Virtual Env: projectA\.venv                        │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  PROJECT B (your cabala project)                     │
│  Django 5.2 + Python 3.10                           │
│  Virtual Env: analisis_cabalistico_alma\.venv       │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  SYSTEM PYTHON                                       │
│  Python 3.10 - No packages                          │
│  Used by default with `python` command              │
└──────────────────────────────────────────────────────┘
```

Each project has its own isolated environment with its own packages!

---

## 🎯 Quick Fix Summary

**Problem:** Running `python` uses system Python (no Django installed)  
**Solution:** Use `.\start-backend.ps1` or specify full path to virtual env Python  
**Result:** Django backend starts successfully and frontend can connect! ✅
