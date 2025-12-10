"""
Script para poblar la base de datos con cursos de ejemplo
Ejecutar con: python manage.py shell < populate_courses.py
"""
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

print("🎓 Poblando sistema LMS con cursos de ejemplo...\n")

# Obtener o crear instructor (Tony Blanco)
try:
    instructor = User.objects.get(username='supertony')
    print(f"✅ Instructor encontrado: {instructor.username}")
except User.DoesNotExist:
    instructor = User.objects.create_user(
        username='instructor',
        email='instructor@example.com',
        password='instructor123',
        first_name='Tony',
        last_name='Blanco'
    )
    print(f"✅ Instructor creado: {instructor.username}")

# Crear categorías de cursos
categories_data = [
    {
        'name': 'Kabbalah Fundamentos',
        'description': 'Cursos introductorios a la Kabbalah y el Árbol de la Vida',
        'icon': 'BookOpen',
        'color': '#D4AF37',
        'order': 1
    },
    {
        'name': 'Psicoterapia Kabbalística',
        'description': 'Formación profesional en terapia con el Árbol de la Vida',
        'icon': 'Heart',
        'color': '#E63946',
        'order': 2
    },
    {
        'name': 'Numerología Cabalística',
        'description': 'Estudio profundo de los números y su significado',
        'icon': 'Hash',
        'color': '#457B9D',
        'order': 3
    },
    {
        'name': 'Meditación y Práctica',
        'description': 'Técnicas meditativas y ejercicios prácticos',
        'icon': 'Sparkles',
        'color': '#A8DADC',
        'order': 4
    },
    {
        'name': 'Desarrollo Profesional',
        'description': 'Para terapeutas que desean especializarse',
        'icon': 'GraduationCap',
        'color': '#F1FAEE',
        'order': 5
    },
]

print("\n📚 Creando categorías...")
categories = {}
for cat_data in categories_data:
    category, created = CourseCategory.objects.get_or_create(
        name=cat_data['name'],
        defaults=cat_data
    )
    categories[cat_data['name']] = category
    status = "✅ Creada" if created else "ℹ️  Ya existe"
    print(f"{status}: {category.name}")

# Crear cursos de ejemplo
courses_data = [
    {
        'category': 'Kabbalah Fundamentos',
        'title': 'Introducción a la Kabbalah y el Árbol de la Vida',
        'subtitle': 'Fundamentos esenciales para comenzar tu viaje interior',
        'description': '''
        <p>Este curso completo te introduce al fascinante mundo de la Kabbalah y el Árbol de la Vida. 
        Aprenderás los conceptos fundamentales, las 10 Sefirot, y cómo aplicar esta sabiduría ancestral 
        en tu vida diaria.</p>
        
        <p>Con más de 20 años de experiencia, Tony Blanco te guiará paso a paso en este viaje 
        transformador de autoconocimiento y desarrollo espiritual.</p>
        ''',
        'difficulty': 'beginner',
        'duration_hours': 12.5,
        'what_you_will_learn': [
            'Comprender las 10 Sefirot del Árbol de la Vida',
            'Identificar patrones emocionales y bloqueos personales',
            'Aplicar la Kabbalah en la vida cotidiana',
            'Meditar con las energías de las Sefirot',
            'Crear tu propio mapa personal cabalístico'
        ],
        'requirements': [
            'Mente abierta y curiosidad por el autoconocimiento',
            'No se requiere experiencia previa en Kabbalah',
            'Compromiso de al menos 2 horas semanales de estudio'
        ],
        'target_audience': [
            'Personas interesadas en desarrollo personal',
            'Buscadores espirituales',
            'Terapeutas y coaches que desean nuevas herramientas',
            'Estudiantes de filosofía y misticismo'
        ],
        'is_free': False,
        'price_usd': 197.00,
        'price_eur': 179.00,
        'has_discount': True,
        'discount_price_usd': 97.00,
        'discount_price_eur': 89.00,
        'discount_end_date': datetime.now() + timedelta(days=30),
        'status': 'published',
        'is_featured': True,
        'is_bestseller': True,
        'certificate_available': True,
        'trailer_video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
        'category': 'Psicoterapia Kabbalística',
        'title': 'Formación Profesional en Psicoterapia Kabbalística',
        'subtitle': 'Certificación para terapeutas nivel avanzado',
        'description': '''
        <p>Programa intensivo de formación profesional para terapeutas, psicólogos y profesionales 
        de la salud mental que desean integrar la Kabbalah en su práctica terapéutica.</p>
        
        <p>Este curso incluye supervisión directa, práctica con casos reales, y certificación 
        oficial al finalizar.</p>
        ''',
        'difficulty': 'advanced',
        'duration_hours': 50.0,
        'what_you_will_learn': [
            'Diagnóstico cabalístico profundo',
            'Técnicas de intervención terapéutica con las Sefirot',
            'Manejo de transferencia y contratransferencia',
            'Integración con otras modalidades terapéuticas',
            'Supervisión de casos clínicos'
        ],
        'requirements': [
            'Título en Psicología, Terapia o campo relacionado',
            'Experiencia mínima de 2 años en práctica clínica',
            'Haber completado el curso de Introducción a la Kabbalah',
            'Entrevista de admisión (gratuita)'
        ],
        'target_audience': [
            'Psicoterapeutas profesionales',
            'Psicólogos clínicos',
            'Coaches certificados',
            'Trabajadores sociales'
        ],
        'is_free': False,
        'price_usd': 1497.00,
        'price_eur': 1349.00,
        'has_discount': False,
        'status': 'published',
        'is_featured': True,
        'certificate_available': True,
        'max_students': 20,
    },
    {
        'category': 'Numerología Cabalística',
        'title': 'Numerología Cabalística: El Poder de los Números',
        'subtitle': 'Decodifica tu camino de vida a través de los números sagrados',
        'description': '''
        <p>Aprende a interpretar los números de nacimiento, nombre, y eventos importantes 
        desde la perspectiva de la Kabbalah. Descubre cómo los números revelan patrones 
        profundos en tu vida.</p>
        ''',
        'difficulty': 'intermediate',
        'duration_hours': 18.0,
        'what_you_will_learn': [
            'Calcular tu número de camino de vida',
            'Interpretar números de nacimiento y nombre',
            'Aplicar numerología a decisiones importantes',
            'Crear análisis numerológicos completos',
            'Integrar números con las Sefirot'
        ],
        'requirements': [
            'Conocimientos básicos de Kabbalah (recomendado)',
            'Calculadora o Excel para ejercicios prácticos'
        ],
        'target_audience': [
            'Estudiantes de Kabbalah nivel intermedio',
            'Astrólogos y tarotistas',
            'Personas interesadas en autoconocimiento profundo'
        ],
        'is_free': False,
        'price_usd': 147.00,
        'price_eur': 134.00,
        'has_discount': True,
        'discount_price_usd': 77.00,
        'discount_price_eur': 69.00,
        'status': 'published',
        'certificate_available': True,
    },
    {
        'category': 'Meditación y Práctica',
        'title': 'Meditaciones Guiadas con las Sefirot',
        'subtitle': 'Experiencias meditativas profundas con cada Sefirá',
        'description': '''
        <p>Serie de meditaciones guiadas por Tony Blanco para conectar profundamente 
        con cada una de las 10 Sefirot del Árbol de la Vida.</p>
        
        <p>Incluye música especialmente compuesta, visualizaciones y prácticas 
        para tu transformación interior.</p>
        ''',
        'difficulty': 'beginner',
        'duration_hours': 5.0,
        'what_you_will_learn': [
            'Técnicas de meditación kabbalística',
            'Conexión con cada Sefirá',
            'Sanación emocional a través de la meditación',
            'Creación de tu ritual personal'
        ],
        'requirements': [
            'Espacio tranquilo para meditar',
            'Auriculares o altavoces de buena calidad',
            'Compromiso de práctica diaria'
        ],
        'target_audience': [
            'Principiantes en meditación',
            'Practicantes de mindfulness',
            'Estudiantes de Kabbalah'
        ],
        'is_free': True,
        'price_usd': 0.00,
        'price_eur': 0.00,
        'status': 'published',
        'is_featured': True,
        'certificate_available': False,
    },
]

print("\n🎓 Creando cursos...")
for course_data in courses_data:
    category_name = course_data.pop('category')
    course_data['category'] = categories[category_name]
    course_data['instructor'] = instructor
    course_data['instructor_bio'] = "Tony Blanco es terapeuta kabbalístico con más de 20 años de experiencia. Ha formado a cientos de profesionales en el uso terapéutico del Árbol de la Vida."
    
    course, created = Course.objects.get_or_create(
        title=course_data['title'],
        defaults=course_data
    )
    
    status = "✅ Creado" if created else "ℹ️  Ya existe"
    print(f"{status}: {course.title}")
    
    if created:
        # Crear módulos y lecciones de ejemplo
        print(f"  📝 Creando contenido para: {course.title}")
        
        # Módulo 1
        module1 = CourseModule.objects.create(
            course=course,
            title="Bienvenida e Introducción",
            description="Conoce al instructor y los objetivos del curso",
            order=1,
            duration_minutes=45,
            is_preview=True
        )
        
        Lesson.objects.create(
            module=module1,
            title="Bienvenida al curso",
            lesson_type='video',
            video_url='https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            video_duration=300,
            video_platform='youtube',
            order=1,
            is_preview=True,
            content="<p>Bienvenido a este viaje transformador...</p>"
        )
        
        Lesson.objects.create(
            module=module1,
            title="Qué aprenderás en este curso",
            lesson_type='text',
            order=2,
            is_preview=True,
            content="<h2>Objetivos del curso</h2><p>En este curso aprenderás...</p>"
        )
        
        # Módulo 2
        module2 = CourseModule.objects.create(
            course=course,
            title="Fundamentos del Árbol de la Vida",
            description="Conceptos básicos y estructura del Árbol",
            order=2,
            duration_minutes=90
        )
        
        Lesson.objects.create(
            module=module2,
            title="Las 10 Sefirot - Parte 1",
            lesson_type='video',
            video_url='https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            video_duration=1200,
            video_platform='youtube',
            order=1,
            content="<p>Exploramos las primeras Sefirot...</p>"
        )
        
        # Agregar recursos descargables
        Resource.objects.create(
            course=course,
            title="Manual del curso en PDF",
            description="Descarga el manual completo con todos los ejercicios",
            resource_type='pdf',
            external_url='https://example.com/manual.pdf',
            is_downloadable=True
        )
        
        # Agregar FAQs
        CourseFAQ.objects.create(
            course=course,
            question="¿Necesito conocimientos previos de Kabbalah?",
            answer="No, este curso está diseñado para principiantes. Comenzamos desde cero.",
            order=1
        )
        
        CourseFAQ.objects.create(
            course=course,
            question="¿Cuánto tiempo tengo acceso al curso?",
            answer="Tienes acceso ilimitado de por vida a todo el material del curso.",
            order=2
        )

print("\n🎉 ¡Poblado completado con éxito!")
print(f"\n📊 Estadísticas:")
print(f"  - Categorías: {CourseCategory.objects.count()}")
print(f"  - Cursos: {Course.objects.count()}")
print(f"  - Módulos: {CourseModule.objects.count()}")
print(f"  - Lecciones: {Lesson.objects.count()}")
print(f"  - Recursos: {Resource.objects.count()}")
print("\n💡 Accede al admin para ver y gestionar los cursos:")
print("   http://127.0.0.1:8000/admin/courses/")
