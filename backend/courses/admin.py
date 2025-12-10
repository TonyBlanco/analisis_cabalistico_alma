from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    CourseCategory, Course, CourseModule, Lesson, Resource,
    CourseEnrollment, LessonProgress, CourseReview, CourseFAQ
)


@admin.register(CourseCategory)
class CourseCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon_display', 'color_display', 'courses_count', 'order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['order', 'is_active']
    
    def icon_display(self, obj):
        return format_html(f'<span style="font-size: 20px;">📚</span> {obj.icon}')
    icon_display.short_description = 'Icono'
    
    def color_display(self, obj):
        return format_html(
            '<div style="width: 30px; height: 30px; background-color: {}; border-radius: 5px;"></div>',
            obj.color
        )
    color_display.short_description = 'Color'
    
    def courses_count(self, obj):
        count = obj.courses.count()
        return format_html('<strong>{}</strong> cursos', count)
    courses_count.short_description = 'Cursos'


class CourseModuleInline(admin.TabularInline):
    model = CourseModule
    extra = 0
    fields = ['title', 'description', 'order', 'duration_minutes', 'is_preview']
    ordering = ['order']


class ResourceInline(admin.TabularInline):
    model = Resource
    extra = 0
    fields = ['title', 'resource_type', 'file', 'external_url', 'is_downloadable']
    fk_name = 'course'


class CourseFAQInline(admin.TabularInline):
    model = CourseFAQ
    extra = 0
    fields = ['question', 'answer', 'order', 'is_active']
    ordering = ['order']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'category', 'instructor', 'difficulty_badge', 'price_display',
        'students_count', 'rating_display', 'status_badge', 'is_featured', 'created_at'
    ]
    list_filter = ['status', 'difficulty', 'category', 'is_free', 'is_featured', 'is_bestseller', 'created_at']
    search_fields = ['title', 'subtitle', 'description', 'instructor__username']
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ['is_featured']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('title', 'slug', 'subtitle', 'description', 'category', 'status')
        }),
        ('Instructor', {
            'fields': ('instructor', 'instructor_bio')
        }),
        ('Multimedia', {
            'fields': ('thumbnail', 'trailer_video_url')
        }),
        ('Detalles del Curso', {
            'fields': ('difficulty', 'language', 'duration_hours', 'certificate_available')
        }),
        ('Contenido Estructurado', {
            'fields': ('what_you_will_learn', 'requirements', 'target_audience'),
            'classes': ['collapse']
        }),
        ('Precios', {
            'fields': (
                'is_free', 'price_usd', 'price_eur',
                'has_discount', 'discount_price_usd', 'discount_price_eur', 'discount_end_date'
            )
        }),
        ('Marketing', {
            'fields': ('is_featured', 'is_bestseller')
        }),
        ('Restricciones', {
            'fields': ('max_students', 'enrollment_start_date', 'enrollment_end_date'),
            'classes': ['collapse']
        }),
    )
    
    inlines = [CourseModuleInline, ResourceInline, CourseFAQInline]
    
    def difficulty_badge(self, obj):
        colors = {
            'beginner': '#10B981',
            'intermediate': '#F59E0B',
            'advanced': '#EF4444',
            'expert': '#8B5CF6'
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 5px; font-size: 11px; font-weight: bold;">{}</span>',
            colors.get(obj.difficulty, '#gray'),
            obj.get_difficulty_display()
        )
    difficulty_badge.short_description = 'Dificultad'
    
    def price_display(self, obj):
        if obj.is_free:
            return format_html('<span style="color: #10B981; font-weight: bold;">GRATIS</span>')
        if obj.has_discount:
            return format_html(
                '<span style="text-decoration: line-through; color: #gray;">${}</span> <span style="color: #EF4444; font-weight: bold;">${}</span>',
                obj.price_usd, obj.discount_price_usd
            )
        return format_html('<span style="font-weight: bold;">${}</span>', obj.price_usd)
    price_display.short_description = 'Precio'
    
    def students_count(self, obj):
        count = obj.total_students
        return format_html('<strong>{}</strong> 👨‍🎓', count)
    students_count.short_description = 'Estudiantes'
    
    def rating_display(self, obj):
        rating = obj.average_rating
        stars = '⭐' * int(rating) if rating else '—'
        return format_html('{} <small>({:.1f})</small>', stars, rating or 0)
    rating_display.short_description = 'Calificación'
    
    def status_badge(self, obj):
        colors = {
            'draft': '#6B7280',
            'published': '#10B981',
            'archived': '#EF4444'
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 5px; font-size: 11px;">{}</span>',
            colors.get(obj.status, '#gray'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Estado'


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ['title', 'lesson_type', 'video_url', 'order', 'is_preview', 'is_mandatory']
    ordering = ['order']


class LessonResourceInline(admin.TabularInline):
    model = Resource
    extra = 0
    fields = ['title', 'resource_type', 'file', 'external_url', 'is_downloadable']
    fk_name = 'lesson'


@admin.register(CourseModule)
class CourseModuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'lessons_count', 'duration_display', 'order', 'is_preview']
    list_filter = ['course', 'is_preview']
    search_fields = ['title', 'description', 'course__title']
    list_editable = ['order']
    
    inlines = [LessonInline]
    
    def lessons_count(self, obj):
        return format_html('<strong>{}</strong> lecciones', obj.total_lessons)
    lessons_count.short_description = 'Lecciones'
    
    def duration_display(self, obj):
        return format_html('⏱️ {} min', obj.duration_minutes)
    duration_display.short_description = 'Duración'


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'module', 'lesson_type_badge', 'duration_display', 'order', 'is_preview', 'is_mandatory']
    list_filter = ['lesson_type', 'module__course', 'is_preview', 'is_mandatory', 'video_platform']
    search_fields = ['title', 'description', 'module__title']
    list_editable = ['order', 'is_preview']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('module', 'title', 'description', 'lesson_type', 'order')
        }),
        ('Contenido', {
            'fields': ('content',)
        }),
        ('Video', {
            'fields': ('video_url', 'video_platform', 'video_duration'),
            'classes': ['collapse']
        }),
        ('Configuración', {
            'fields': ('is_preview', 'is_mandatory')
        }),
    )
    
    inlines = [LessonResourceInline]
    
    def lesson_type_badge(self, obj):
        icons = {
            'video': '🎥',
            'text': '📝',
            'quiz': '📋',
            'assignment': '✍️',
            'live': '🔴',
            'resource': '📎'
        }
        return format_html('{} {}', icons.get(obj.lesson_type, '📄'), obj.get_lesson_type_display())
    lesson_type_badge.short_description = 'Tipo'
    
    def duration_display(self, obj):
        if obj.video_duration > 0:
            minutes = obj.video_duration // 60
            return format_html('⏱️ {} min', minutes)
        return '—'
    duration_display.short_description = 'Duración'


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'resource_type_badge', 'lesson', 'course', 'file_size_display', 'is_downloadable']
    list_filter = ['resource_type', 'is_downloadable', 'requires_completion']
    search_fields = ['title', 'description']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('title', 'description', 'resource_type')
        }),
        ('Asignación', {
            'fields': ('course', 'lesson')
        }),
        ('Archivo', {
            'fields': ('file', 'external_url')
        }),
        ('Configuración', {
            'fields': ('is_downloadable', 'requires_completion')
        }),
    )
    
    def resource_type_badge(self, obj):
        icons = {
            'pdf': '📄',
            'ebook': '📚',
            'audio': '🎵',
            'spreadsheet': '📊',
            'template': '📋',
            'code': '💻',
            'image': '🖼️',
            'other': '📎'
        }
        return format_html('{} {}', icons.get(obj.resource_type, '📎'), obj.get_resource_type_display())
    resource_type_badge.short_description = 'Tipo'
    
    def file_size_display(self, obj):
        if obj.file_size > 0:
            size_mb = obj.file_size / (1024 * 1024)
            return format_html('{:.2f} MB', size_mb)
        return '—'
    file_size_display.short_description = 'Tamaño'


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'course', 'status_badge', 'progress_bar',
        'amount_paid', 'enrolled_at', 'certificate_issued'
    ]
    list_filter = ['status', 'certificate_issued', 'enrolled_at', 'course']
    search_fields = ['student__username', 'student__email', 'course__title']
    date_hierarchy = 'enrolled_at'
    readonly_fields = ['enrolled_at', 'progress_percentage', 'certificate_number']
    
    fieldsets = (
        ('Estudiante y Curso', {
            'fields': ('student', 'course')
        }),
        ('Estado', {
            'fields': ('status', 'progress_percentage')
        }),
        ('Pago', {
            'fields': ('amount_paid', 'currency', 'payment_method')
        }),
        ('Fechas', {
            'fields': ('enrolled_at', 'completed_at', 'expires_at', 'last_accessed_at')
        }),
        ('Certificado', {
            'fields': ('certificate_issued', 'certificate_issued_at', 'certificate_number')
        }),
    )
    
    def status_badge(self, obj):
        colors = {
            'active': '#10B981',
            'completed': '#3B82F6',
            'expired': '#EF4444',
            'suspended': '#6B7280'
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 5px; font-size: 11px;">{}</span>',
            colors.get(obj.status, '#gray'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Estado'
    
    def progress_bar(self, obj):
        percentage = float(obj.progress_percentage)
        color = '#10B981' if percentage == 100 else '#F59E0B' if percentage > 50 else '#EF4444'
        return format_html(
            '''
            <div style="width: 100px; background: #E5E7EB; border-radius: 5px; overflow: hidden;">
                <div style="width: {}%; background: {}; height: 20px; text-align: center; color: white; font-size: 11px; line-height: 20px;">
                    {}%
                </div>
            </div>
            ''',
            percentage, color, int(percentage)
        )
    progress_bar.short_description = 'Progreso'


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ['enrollment_student', 'lesson', 'progress_display', 'time_spent_display', 'is_completed', 'last_accessed_at']
    list_filter = ['is_completed', 'lesson__module__course']
    search_fields = ['enrollment__student__username', 'lesson__title']
    readonly_fields = ['started_at', 'completed_at', 'last_accessed_at']
    
    def enrollment_student(self, obj):
        return obj.enrollment.student.username
    enrollment_student.short_description = 'Estudiante'
    
    def progress_display(self, obj):
        percentage = float(obj.progress_percentage)
        return format_html('{}%', int(percentage))
    progress_display.short_description = 'Progreso'
    
    def time_spent_display(self, obj):
        minutes = obj.time_spent_seconds // 60
        return format_html('⏱️ {} min', minutes)
    time_spent_display.short_description = 'Tiempo'


@admin.register(CourseReview)
class CourseReviewAdmin(admin.ModelAdmin):
    list_display = ['course', 'student', 'rating_stars', 'is_approved', 'is_featured', 'helpful_count', 'created_at']
    list_filter = ['rating', 'is_approved', 'is_featured', 'created_at', 'course']
    search_fields = ['title', 'comment', 'student__username', 'course__title']
    list_editable = ['is_approved', 'is_featured']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('course', 'student', 'enrollment')
        }),
        ('Calificación', {
            'fields': ('rating', 'content_rating', 'instructor_rating', 'value_rating')
        }),
        ('Reseña', {
            'fields': ('title', 'comment')
        }),
        ('Moderación', {
            'fields': ('is_approved', 'is_featured')
        }),
        ('Estadísticas', {
            'fields': ('helpful_count', 'not_helpful_count'),
            'classes': ['collapse']
        }),
    )
    
    def rating_stars(self, obj):
        stars = '⭐' * obj.rating
        return format_html('{} <small>({}/5)</small>', stars, obj.rating)
    rating_stars.short_description = 'Calificación'


@admin.register(CourseFAQ)
class CourseFAQAdmin(admin.ModelAdmin):
    list_display = ['question_short', 'course', 'order', 'is_active']
    list_filter = ['course', 'is_active']
    search_fields = ['question', 'answer']
    list_editable = ['order', 'is_active']
    
    def question_short(self, obj):
        return obj.question[:80] + '...' if len(obj.question) > 80 else obj.question
    question_short.short_description = 'Pregunta'
