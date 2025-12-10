# Script para poblar cursos - Versión PowerShell
Write-Host "🎓 Poblando base de datos con cursos de ejemplo..." -ForegroundColor Cyan

Set-Location backend

$pythonScript = @"
import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from courses.models import (
    CourseCategory, Course, CourseModule, Lesson, 
    Resource, CourseFAQ
)

print('🎓 Poblando sistema LMS con cursos de ejemplo...\n')

# Obtener instructor
try:
    instructor = User.objects.get(username='supertony')
    print(f'✅ Instructor encontrado: {instructor.username}')
except:
    instructor = User.objects.filter(is_superuser=True).first()
    print(f'✅ Usando instructor: {instructor.username}')

# Crear categorías
categories_data = [
    {'name': 'Kabbalah Fundamentos', 'description': 'Cursos introductorios', 'icon': 'BookOpen', 'color': '#D4AF37', 'order': 1},
    {'name': 'Psicoterapia Kabbalística', 'description': 'Formación profesional', 'icon': 'Heart', 'color': '#E63946', 'order': 2},
    {'name': 'Numerología Cabalística', 'description': 'Estudio de números', 'icon': 'Hash', 'color': '#457B9D', 'order': 3},
    {'name': 'Meditación y Práctica', 'description': 'Técnicas meditativas', 'icon': 'Sparkles', 'color': '#A8DADC', 'order': 4},
]

print('\n📚 Creando categorías...')
categories = {}
for cat_data in categories_data:
    category, created = CourseCategory.objects.get_or_create(
        name=cat_data['name'],
        defaults=cat_data
    )
    categories[cat_data['name']] = category
    print(f'{"✅ Creada" if created else "ℹ️  Ya existe"}: {category.name}')

# Crear curso de ejemplo
print('\n🎓 Creando curso de ejemplo...')
course, created = Course.objects.get_or_create(
    title='Introducción a la Kabbalah y el Árbol de la Vida',
    defaults={
        'subtitle': 'Fundamentos esenciales para tu viaje interior',
        'description': 'Curso completo de introducción a la Kabbalah',
        'category': categories['Kabbalah Fundamentos'],
        'instructor': instructor,
        'instructor_bio': 'Tony Blanco - 20+ años de experiencia',
        'difficulty': 'beginner',
        'duration_hours': 12.5,
        'what_you_will_learn': ['Las 10 Sefirot', 'Patrones emocionales', 'Aplicación práctica'],
        'requirements': ['Mente abierta', 'Curiosidad'],
        'target_audience': ['Buscadores', 'Terapeutas'],
        'is_free': False,
        'price_usd': 197,
        'price_eur': 179,
        'has_discount': True,
        'discount_price_usd': 97,
        'discount_price_eur': 89,
        'status': 'published',
        'is_featured': True,
        'is_bestseller': True,
    }
)
print(f'{"✅ Creado" if created else "ℹ️  Ya existe"}: {course.title}')

if created:
    print('  📝 Creando módulos y lecciones...')
    
    # Módulo 1
    module1 = CourseModule.objects.create(
        course=course,
        title='Bienvenida e Introducción',
        description='Conoce al instructor',
        order=1,
        duration_minutes=45,
        is_preview=True
    )
    
    Lesson.objects.create(
        module=module1,
        title='Bienvenida al curso',
        lesson_type='video',
        video_url='https://www.youtube.com/watch?v=example',
        video_duration=300,
        video_platform='youtube',
        order=1,
        is_preview=True,
        content='<p>Bienvenido...</p>'
    )
    
    # FAQ
    CourseFAQ.objects.create(
        course=course,
        question='¿Necesito conocimientos previos?',
        answer='No, comenzamos desde cero.',
        order=1
    )
    
    print('  ✅ Contenido creado')

print('\n🎉 ¡Completado!')
print(f'\n📊 Estadísticas:')
print(f'  - Categorías: {CourseCategory.objects.count()}')
print(f'  - Cursos: {Course.objects.count()}')
print(f'  - Módulos: {CourseModule.objects.count()}')
print(f'  - Lecciones: {Lesson.objects.count()}')
print('\n💡 Accede al admin: http://127.0.0.1:8000/admin/courses/')
"@

$pythonScript | python manage.py shell

Set-Location ..
Write-Host "`n✅ ¡Listo!" -ForegroundColor Green
