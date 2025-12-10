from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
import os


class CourseCategory(models.Model):
    """Categorías de cursos"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre")
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, verbose_name="Descripción")
    icon = models.CharField(max_length=50, default='BookOpen', verbose_name="Icono")
    color = models.CharField(max_length=20, default='#D4AF37', verbose_name="Color")
    order = models.IntegerField(default=0, verbose_name="Orden")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Categoría de Curso"
        verbose_name_plural = "Categorías de Cursos"
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Course(models.Model):
    """Curso principal"""
    DIFFICULTY_CHOICES = [
        ('beginner', 'Principiante'),
        ('intermediate', 'Intermedio'),
        ('advanced', 'Avanzado'),
        ('expert', 'Experto'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('published', 'Publicado'),
        ('archived', 'Archivado'),
    ]

    # Información básica
    title = models.CharField(max_length=255, verbose_name="Título")
    slug = models.SlugField(unique=True, blank=True)
    subtitle = models.CharField(max_length=255, blank=True, verbose_name="Subtítulo")
    description = models.TextField(verbose_name="Descripción")
    category = models.ForeignKey(CourseCategory, on_delete=models.SET_NULL, null=True, related_name='courses')
    
    # Instructor
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses_taught')
    instructor_bio = models.TextField(blank=True, verbose_name="Biografía del Instructor")
    
    # Multimedia
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', blank=True, null=True)
    trailer_video_url = models.URLField(blank=True, verbose_name="Video promocional")
    
    # Detalles del curso
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    language = models.CharField(max_length=50, default='Español')
    duration_hours = models.DecimalField(max_digits=5, decimal_places=1, default=0, verbose_name="Duración (horas)")
    
    # Contenido
    what_you_will_learn = models.JSONField(default=list, verbose_name="Qué aprenderás")
    requirements = models.JSONField(default=list, verbose_name="Requisitos")
    target_audience = models.JSONField(default=list, verbose_name="Audiencia objetivo")
    
    # Pricing
    is_free = models.BooleanField(default=False, verbose_name="Curso gratuito")
    price_usd = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_eur = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    has_discount = models.BooleanField(default=False)
    discount_price_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_price_eur = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_end_date = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False, verbose_name="Destacado")
    is_bestseller = models.BooleanField(default=False, verbose_name="Más vendido")
    certificate_available = models.BooleanField(default=True, verbose_name="Certificado disponible")
    
    # Restricciones
    max_students = models.IntegerField(null=True, blank=True, verbose_name="Máximo de estudiantes")
    enrollment_start_date = models.DateTimeField(null=True, blank=True)
    enrollment_end_date = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Curso"
        verbose_name_plural = "Cursos"
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def total_modules(self):
        return self.modules.count()

    @property
    def total_lessons(self):
        return sum(module.lessons.count() for module in self.modules.all())

    @property
    def total_students(self):
        return self.enrollments.filter(status='active').count()

    @property
    def average_rating(self):
        reviews = self.reviews.filter(is_approved=True)
        if reviews.exists():
            return reviews.aggregate(models.Avg('rating'))['rating__avg']
        return 0


class CourseModule(models.Model):
    """Módulos dentro de un curso"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255, verbose_name="Título del módulo")
    description = models.TextField(blank=True, verbose_name="Descripción")
    order = models.IntegerField(default=0, verbose_name="Orden")
    duration_minutes = models.IntegerField(default=0, verbose_name="Duración (minutos)")
    is_preview = models.BooleanField(default=False, verbose_name="Vista previa gratuita")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Módulo de Curso"
        verbose_name_plural = "Módulos de Cursos"
        ordering = ['order']
        unique_together = ['course', 'order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    @property
    def total_lessons(self):
        return self.lessons.count()


class Lesson(models.Model):
    """Lecciones dentro de un módulo"""
    LESSON_TYPE_CHOICES = [
        ('video', 'Video'),
        ('text', 'Texto/Artículo'),
        ('quiz', 'Quiz'),
        ('assignment', 'Tarea'),
        ('live', 'Sesión en Vivo'),
        ('resource', 'Recursos Descargables'),
    ]

    module = models.ForeignKey(CourseModule, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255, verbose_name="Título de la lección")
    description = models.TextField(blank=True, verbose_name="Descripción")
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPE_CHOICES, default='video')
    
    # Contenido
    content = models.TextField(blank=True, verbose_name="Contenido (HTML/Markdown)")
    video_url = models.URLField(blank=True, verbose_name="URL del video")
    video_duration = models.IntegerField(default=0, verbose_name="Duración del video (segundos)")
    video_platform = models.CharField(max_length=50, blank=True, choices=[
        ('youtube', 'YouTube'),
        ('vimeo', 'Vimeo'),
        ('wistia', 'Wistia'),
        ('custom', 'Personalizado'),
    ])
    
    # Metadata
    order = models.IntegerField(default=0, verbose_name="Orden")
    is_preview = models.BooleanField(default=False, verbose_name="Vista previa gratuita")
    is_mandatory = models.BooleanField(default=True, verbose_name="Obligatorio")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Lección"
        verbose_name_plural = "Lecciones"
        ordering = ['order']
        unique_together = ['module', 'order']

    def __str__(self):
        return f"{self.module.title} - {self.title}"


class Resource(models.Model):
    """Recursos descargables (PDFs, libros, materiales)"""
    RESOURCE_TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('ebook', 'eBook'),
        ('audio', 'Audio'),
        ('spreadsheet', 'Hoja de cálculo'),
        ('template', 'Plantilla'),
        ('code', 'Código fuente'),
        ('image', 'Imagen'),
        ('other', 'Otro'),
    ]

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='resources', null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='resources', null=True, blank=True)
    
    title = models.CharField(max_length=255, verbose_name="Título del recurso")
    description = models.TextField(blank=True, verbose_name="Descripción")
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES, default='pdf')
    
    # Archivo
    file = models.FileField(upload_to='courses/resources/', null=True, blank=True)
    external_url = models.URLField(blank=True, verbose_name="URL externa")
    file_size = models.BigIntegerField(default=0, verbose_name="Tamaño (bytes)")
    
    # Metadata
    is_downloadable = models.BooleanField(default=True, verbose_name="Descargable")
    requires_completion = models.BooleanField(default=False, verbose_name="Requiere completar lección")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Recurso"
        verbose_name_plural = "Recursos"
        ordering = ['title']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)

    @property
    def file_extension(self):
        if self.file:
            return os.path.splitext(self.file.name)[1].lower()
        return ''


class CourseEnrollment(models.Model):
    """Inscripciones de estudiantes a cursos"""
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('completed', 'Completado'),
        ('expired', 'Expirado'),
        ('suspended', 'Suspendido'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    
    # Pago
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='USD')
    payment_method = models.CharField(max_length=50, blank=True)
    
    # Estado
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Fechas
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    last_accessed_at = models.DateTimeField(null=True, blank=True)
    
    # Certificado
    certificate_issued = models.BooleanField(default=False)
    certificate_issued_at = models.DateTimeField(null=True, blank=True)
    certificate_number = models.CharField(max_length=100, blank=True, unique=True)

    class Meta:
        verbose_name = "Inscripción"
        verbose_name_plural = "Inscripciones"
        ordering = ['-enrolled_at']
        unique_together = ['student', 'course']

    def __str__(self):
        return f"{self.student.username} - {self.course.title}"

    def update_progress(self):
        """Calcula el progreso del estudiante"""
        total_lessons = self.course.total_lessons
        if total_lessons == 0:
            self.progress_percentage = 0
        else:
            completed = LessonProgress.objects.filter(
                enrollment=self,
                is_completed=True
            ).count()
            self.progress_percentage = (completed / total_lessons) * 100
        self.save()


class LessonProgress(models.Model):
    """Progreso de estudiantes en cada lección"""
    enrollment = models.ForeignKey(CourseEnrollment, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='student_progress')
    
    # Progreso
    is_completed = models.BooleanField(default=False)
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    time_spent_seconds = models.IntegerField(default=0, verbose_name="Tiempo dedicado (segundos)")
    
    # Video progress
    video_current_time = models.IntegerField(default=0, verbose_name="Posición actual del video (segundos)")
    
    # Notas del estudiante
    notes = models.TextField(blank=True, verbose_name="Notas personales")
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Progreso de Lección"
        verbose_name_plural = "Progreso de Lecciones"
        ordering = ['lesson__order']
        unique_together = ['enrollment', 'lesson']

    def __str__(self):
        return f"{self.enrollment.student.username} - {self.lesson.title}"

    def mark_completed(self):
        """Marca la lección como completada"""
        from django.utils import timezone
        self.is_completed = True
        self.progress_percentage = 100
        self.completed_at = timezone.now()
        self.save()
        
        # Actualizar progreso del curso
        self.enrollment.update_progress()


class CourseReview(models.Model):
    """Reseñas y calificaciones de cursos"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_reviews')
    enrollment = models.ForeignKey(CourseEnrollment, on_delete=models.CASCADE, related_name='review', null=True)
    
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Calificación (1-5)"
    )
    title = models.CharField(max_length=255, verbose_name="Título de la reseña")
    comment = models.TextField(verbose_name="Comentario")
    
    # Calificaciones específicas
    content_rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], default=5)
    instructor_rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], default=5)
    value_rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], default=5)
    
    # Moderación
    is_approved = models.BooleanField(default=False, verbose_name="Aprobado")
    is_featured = models.BooleanField(default=False, verbose_name="Destacado")
    
    # Utilidad
    helpful_count = models.IntegerField(default=0, verbose_name="Útil")
    not_helpful_count = models.IntegerField(default=0, verbose_name="No útil")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Reseña de Curso"
        verbose_name_plural = "Reseñas de Cursos"
        ordering = ['-created_at']
        unique_together = ['course', 'student']

    def __str__(self):
        return f"{self.student.username} - {self.course.title} ({self.rating}★)"


class CourseFAQ(models.Model):
    """Preguntas frecuentes del curso"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='faqs')
    question = models.CharField(max_length=500, verbose_name="Pregunta")
    answer = models.TextField(verbose_name="Respuesta")
    order = models.IntegerField(default=0, verbose_name="Orden")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "FAQ de Curso"
        verbose_name_plural = "FAQs de Cursos"
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.question[:50]}"
