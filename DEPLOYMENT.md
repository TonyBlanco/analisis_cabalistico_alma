# Análisis Cabalístico del Alma

Plataforma de análisis cabalístico y numerología para profesionales del alma.

## 🚀 Deployment

### Backend (Django) - Render.com

1. **Crear cuenta en Render.com**
   - https://render.com

2. **Crear nuevo Web Service:**
   - Conectar repositorio GitHub
   - Branch: `main`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn core.wsgi --log-file -`

3. **Configurar variables de entorno en Render:**
   ```
   DEBUG=False
   SECRET_KEY=[Generar uno seguro - https://djecrety.ir/]
   ALLOWED_HOSTS=your-app.onrender.com,localhost
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
   DATABASE_URL=[Se crea automáticamente con PostgreSQL]
   ```

4. **Crear base de datos PostgreSQL:**
   - En Render, crear un nuevo "PostgreSQL"
   - Usar la URL proporcionada en DATABASE_URL

5. **Obtener URL del backend:** `https://your-app.onrender.com`

---

### Frontend (Next.js) - Vercel

1. **Crear cuenta en Vercel**
   - https://vercel.com

2. **Importar proyecto:**
   - Seleccionar repositorio GitHub
   - Root Directory: `tonyblanco-app`
   - Framework: Next.js (detección automática)

3. **Configurar variables de entorno:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```

4. **Deploy automático:**
   - Cada push a `main` despliega automáticamente

---

### Estructura del Proyecto

```
analisis_cabalistico_alma/
├── backend/               # Django REST API
│   ├── api/              # App principal
│   ├── core/             # Configuración Django
│   ├── requirements.txt   # Dependencias Python
│   ├── Procfile          # Configuración Render
│   └── manage.py
├── tonyblanco-app/       # Next.js Frontend
│   ├── app/              # Páginas y layouts
│   ├── lib/              # Utilidades
│   ├── src/              # Componentes
│   ├── package.json
│   └── vercel.json       # Configuración Vercel
└── .gitignore
```

---

## 📝 Desarrollo Local

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### Frontend
```bash
cd tonyblanco-app
npm install
npm run dev
```

Accede a: http://localhost:3001

---

## 🔐 Seguridad

- Nunca commitear `.env` files con credenciales reales
- Usar `.env.example` como template
- Generar SECRET_KEY en https://djecrety.ir/
- Mantener DEBUG=False en producción

---

## 📞 Soporte

Para más información sobre deployment:
- Django en Render: https://docs.render.com/deploy-django
- Next.js en Vercel: https://vercel.com/docs
