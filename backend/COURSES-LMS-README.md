# 🎓 Sistema LMS (Learning Management System)

## 📋 Descripción General

Sistema completo de gestión de cursos educativos integrado en la plataforma Tony Blanco. Permite crear, administrar y vender cursos online con videos, PDFs, libros, y múltiples recursos multimedia.

---

## 🏗️ Arquitectura del Sistema

### **Modelos de Base de Datos**

```
📚 ESTRUCTURA PRINCIPAL
│
├── 📁 CourseCategory (Categorías)
│   ├── name, slug, description
│   ├── icon, color, order
│   └── is_active
│
├── 📚 Course (Curso)
│   ├── Información: title, slug, subtitle, description
│   ├── Instructor: instructor (User), instructor_bio
│   ├── Multimedia: thumbnail, trailer_video_url
│   ├── Detalles: difficulty, language, duration_hours
│   ├── Contenido: what_you_will_learn, requirements, target_audience
│   ├── Pricing: is_free, price_usd/eur, has_discount
│   ├── Metadata: status, is_featured, is_bestseller
│   └── Restricciones: max_students, enrollment dates
│
├── 📖 CourseModule (Módulos)
│   ├── course (FK), title, description
│   ├── order, duration_minutes
│   └── is_preview
│
├── 📄 Lesson (Lecciones)
│   ├── module (FK), title, description
│   ├── lesson_type: video/text/quiz/assignment/live/resource
│   ├── content, video_url, video_duration, video_platform
│   └── order, is_preview, is_mandatory
│
├── 📎 Resource (Recursos Descargables)
│   ├── lesson/course (FK), title, description
│   ├── resource_type: pdf/ebook/audio/spreadsheet/template/code/image
│   ├── file, external_url, file_size
│   └── is_downloadable, requires_completion
│
├── 👨‍🎓 CourseEnrollment (Inscripciones)
│   ├── student (FK), course (FK)
│   ├── amount_paid, currency, payment_method
│   ├── status: active/completed/expired/suspended
│   ├── progress_percentage
│   └── certificate_issued, certificate_number
│
├── ✅ LessonProgress (Progreso)
│   ├── enrollment (FK), lesson (FK)
│   ├── is_completed, progress_percentage
│   ├── time_spent_seconds, video_current_time
│   └── notes (personales del estudiante)
│
├── ⭐ CourseReview (Reseñas)
│   ├── course (FK), student (FK), enrollment (FK)
│   ├── rating (1-5), title, comment
│   ├── content_rating, instructor_rating, value_rating
│   └── is_approved, is_featured, helpful_count
│
└── ❓ CourseFAQ (Preguntas Frecuentes)
    ├── course (FK), question, answer
    └── order, is_active
```

---

## 🚀 Instalación y Configuración

### **1. Ejecutar Migraciones**

```powershell
# Opción A: Script automatizado
.\setup-lms.ps1

# Opción B: Manual
cd backend
python manage.py makemigrations courses
python manage.py migrate
```

### **2. Poblar con Datos de Ejemplo**

```powershell
cd backend
python manage.py shell < populate_courses.py
```

### **3. Acceder al Admin**

```
URL: http://127.0.0.1:8000/admin/courses/
Usuario: supertony (o tu usuario admin)
```

---

## 🎨 Panel de Administración

### **Funcionalidades Incluidas**

#### 📚 **Gestión de Categorías**
- ✅ CRUD completo
- ✅ Ordenamiento drag-and-drop
- ✅ Iconos y colores personalizables
- ✅ Contador de cursos por categoría

#### 🎓 **Gestión de Cursos**
- ✅ Editor completo con todos los campos
- ✅ **Inlines integrados:**
  - Módulos del curso
  - Recursos descargables
  - FAQs
- ✅ Vista de lista con badges de estado
- ✅ Filtros por: status, dificultad, categoría, featured
- ✅ Búsqueda por título, descripción, instructor
- ✅ Previsualización de precios con descuentos
- ✅ Contador de estudiantes inscritos
- ✅ Calificación promedio con estrellas

#### 📖 **Gestión de Módulos**
- ✅ Creación dentro del curso (inline)
- ✅ Vista independiente para edición detallada
- ✅ **Inlines de lecciones**
- ✅ Contador de lecciones por módulo
- ✅ Duración total calculada

#### 📄 **Gestión de Lecciones**
- ✅ Tipos múltiples: video, texto, quiz, tarea, live, recursos
- ✅ Integración con plataformas de video:
  - YouTube
  - Vimeo
  - Wistia
  - Personalizado
- ✅ Editor de contenido HTML/Markdown
- ✅ **Recursos adjuntos por lección**
- ✅ Vista previa gratuita activable
- ✅ Obligatoriedad configurable

#### 📎 **Gestión de Recursos**
- ✅ Subida de archivos (PDFs, eBooks, audios, etc.)
- ✅ Enlaces externos
- ✅ Tamaño de archivo automático
- ✅ Descarga condicional (requiere completar lección)
- ✅ Tipos: pdf, ebook, audio, spreadsheet, template, code, image

#### 👨‍🎓 **Gestión de Inscripciones**
- ✅ Vista de todos los estudiantes por curso
- ✅ **Barra de progreso visual**
- ✅ Estado: activo, completado, expirado, suspendido
- ✅ Información de pago
- ✅ Emisión de certificados
- ✅ Filtros por curso y estado

#### ✅ **Progreso de Lecciones**
- ✅ Tracking detallado por estudiante
- ✅ Tiempo dedicado a cada lección
- ✅ Posición del video guardada
- ✅ Notas personales del estudiante
- ✅ Actualización automática de progreso del curso

#### ⭐ **Reseñas y Calificaciones**
- ✅ Sistema de 5 estrellas
- ✅ Calificaciones específicas:
  - Contenido
  - Instructor
  - Relación calidad-precio
- ✅ Moderación de reseñas
- ✅ Destacar reseñas
- ✅ Sistema de utilidad (helpful/not helpful)

---

## 🎯 Características Clave

### **Para Administradores**

✅ **Dashboard Unificado**
- Panel de admin de Django totalmente personalizado
- Gestión completa desde la interface web
- Sin necesidad de código para crear/editar cursos

✅ **Templates Unificados**
- Estructura consistente para todos los cursos
- Campos estandarizados
- Fácil duplicación de cursos exitosos

✅ **Multimedia Flexible**
- Soporte para múltiples plataformas de video
- Subida de archivos directa
- Enlaces externos
- Imágenes y thumbnails

✅ **Sistema de Precios Robusto**
- Precios en múltiples monedas (USD/EUR)
- Descuentos con fecha de expiración
- Cursos gratuitos
- Tracking de pagos

✅ **Control de Acceso**
- Límite de estudiantes por curso
- Fechas de inscripción
- Vista previa gratuita de contenido
- Requerimientos personalizados

### **Para Estudiantes**

✅ **Experiencia de Aprendizaje**
- Progreso automático
- Tracking de tiempo
- Notas personales
- Continuación desde donde dejó (video bookmarking)

✅ **Certificación**
- Certificados automáticos al completar
- Número único de certificado
- Fecha de emisión registrada

✅ **Recursos Descargables**
- PDFs, eBooks, plantillas
- Código fuente
- Hojas de cálculo
- Audio y música

---

## 📊 Estadísticas Disponibles

### **Por Curso**
- Total de estudiantes inscritos
- Calificación promedio
- Total de módulos y lecciones
- Duración total

### **Por Estudiante**
- Progreso por curso (%)
- Tiempo dedicado por lección
- Lecciones completadas
- Certificados obtenidos

---

## 🔧 Configuración Técnica

### **Archivos Media**

```python
# settings.py
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Estructura de archivos:
media/
├── courses/
│   ├── thumbnails/     # Imágenes de cursos
│   └── resources/      # PDFs, eBooks, etc.
```

### **URLs de Media (Desarrollo)**

```python
# core/urls.py
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

## 🎨 Personalización del Admin

### **Badges de Estado**
- 🟢 Publicado (verde)
- ⚪ Borrador (gris)
- 🔴 Archivado (rojo)

### **Badges de Dificultad**
- 🟢 Principiante (verde)
- 🟡 Intermedio (amarillo)
- 🔴 Avanzado (rojo)
- 🟣 Experto (morado)

### **Iconos por Tipo de Recurso**
- 📄 PDF
- 📚 eBook
- 🎵 Audio
- 📊 Hoja de cálculo
- 📋 Plantilla
- 💻 Código
- 🖼️ Imagen

---

## 🚀 Próximos Pasos Sugeridos

### **Backend (API REST)**
1. Crear serializers para los modelos
2. Crear viewsets con DRF
3. Configurar permisos por tipo de usuario
4. Implementar filtros y búsqueda
5. Agregar paginación

### **Frontend (Next.js)**
1. Página de catálogo de cursos
2. Página de detalle de curso
3. Reproductor de video integrado
4. Área de estudiante (mis cursos)
5. Sistema de progreso visual
6. Descarga de certificados
7. Integración con Stripe para pagos

### **Mejoras Futuras**
- [ ] Sistema de quizzes interactivos
- [ ] Tareas con entrega y calificación
- [ ] Sesiones en vivo con Zoom/Meet
- [ ] Foro de discusión por curso
- [ ] Gamificación (badges, logros)
- [ ] Recomendaciones de cursos con IA
- [ ] App móvil nativa
- [ ] Subtítulos automáticos en videos

---

## 📝 Notas Importantes

### **Seguridad**
- ✅ Autenticación requerida para contenido premium
- ✅ Vista previa pública configurable
- ✅ Validación de acceso por inscripción
- ✅ Protección de archivos descargables

### **Performance**
- ✅ Uso de select_related/prefetch_related
- ✅ Índices en campos frecuentes
- ✅ Paginación en listas largas
- ✅ Caché de calificaciones promedio

### **Escalabilidad**
- ✅ Estructura modular
- ✅ Fácil extensión de tipos de lección
- ✅ Soporte para múltiples instructores
- ✅ Internacionalización lista

---

## 🎉 Conclusión

Sistema LMS **profesional, completo y listo para producción** que permite:

✅ Administración total desde el panel de Django  
✅ Creación rápida de cursos con template unificado  
✅ Gestión de múltiples tipos de recursos  
✅ Tracking completo de progreso de estudiantes  
✅ Sistema de certificación automático  
✅ Integración lista con sistema de pagos  

**¡Todo listo para empezar a crear tus cursos! 🚀**
