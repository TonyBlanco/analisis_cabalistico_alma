"""
Script para poblar la base de datos con los servicios de Tony Blanco
Ejecutar con: python manage.py shell < populate_services.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import ServiceCategory, Service

# Crear categorías
categories_data = [
    {
        'name': 'sesiones',
        'display_name': 'Sesiones Individuales',
        'description': 'Sesiones personalizadas de Psicoterapia Kabbalística',
        'icon': 'Users',
        'order': 1
    },
    {
        'name': 'lecturas',
        'display_name': 'Lecturas y Análisis',
        'description': 'Lectura profunda de tu Árbol de Vida personal',
        'icon': 'BookOpen',
        'order': 2
    },
    {
        'name': 'formacion',
        'display_name': 'Formación Profesional',
        'description': 'Supervisión y mentoría para terapeutas',
        'icon': 'GraduationCap',
        'order': 3
    },
    {
        'name': 'talleres',
        'display_name': 'Talleres y Retiros',
        'description': 'Experiencias grupales transformadoras',
        'icon': 'Calendar',
        'order': 4
    },
    {
        'name': 'contenido',
        'display_name': 'Contenido Digital',
        'description': 'Cursos y meditaciones grabadas',
        'icon': 'Video',
        'order': 5
    },
    {
        'name': 'acompanamiento',
        'display_name': 'Acompañamiento Continuo',
        'description': 'Programas de transformación a largo plazo',
        'icon': 'Heart',
        'order': 6
    },
    {
        'name': 'comunidad',
        'display_name': 'Comunidad y Membresía',
        'description': 'Acceso a la comunidad privada de práctica',
        'icon': 'MessageCircle',
        'order': 7
    }
]

print("🌟 Creando categorías de servicios...")
categories = {}
for cat_data in categories_data:
    category, created = ServiceCategory.objects.get_or_create(
        name=cat_data['name'],
        defaults=cat_data
    )
    categories[cat_data['name']] = category
    status = "✅ Creada" if created else "ℹ️  Ya existe"
    print(f"{status}: {category.display_name}")

# Crear servicios
services_data = [
    # SESIONES INDIVIDUALES
    {
        'category': 'sesiones',
        'name': 'Sesión Individual de Psicoterapia Kabbalística',
        'slug': 'sesion-individual-60min',
        'service_type': 'session',
        'short_description': 'Sesión personalizada de 60 minutos para trabajar tus procesos con el Árbol de Vida',
        'full_description': 'Sesión terapéutica individual donde exploramos tu mapa kabbalístico personal, identificamos bloqueos en las sefirot y trabajamos la integración de polaridades. Incluye ejercicios prácticos y plan de trabajo personalizado.',
        'benefits': [
            'Comprensión profunda de tus patrones emocionales',
            'Identificación de bloqueos en tu Árbol de Vida',
            'Herramientas prácticas de autoconocimiento',
            'Plan personalizado de trabajo interior'
        ],
        'includes': [
            '60 minutos de sesión en vivo (Zoom)',
            'Grabación de la sesión',
            'Notas terapéuticas por escrito',
            'Seguimiento por email 7 días'
        ],
        'price_usd': 130.00,
        'price_eur': 120.00,
        'has_discount': True,
        'discount_price_usd': 99.00,
        'discount_price_eur': 90.00,
        'discount_label': 'Primera sesión',
        'duration_value': 60,
        'duration_type': 'minutes',
        'requires_booking': True,
        'platform': 'Zoom',
        'is_featured': True,
        'order': 1
    },
    {
        'category': 'sesiones',
        'name': 'Consulta Express 30 minutos',
        'slug': 'consulta-express-30min',
        'service_type': 'session',
        'short_description': 'Consulta rápida para aclarar una situación o pregunta específica',
        'full_description': 'Sesión breve de 30 minutos enfocada en una pregunta o situación concreta. Identificamos la sefirá del momento y ofrecemos orientación kabbalística práctica.',
        'benefits': [
            'Respuesta rápida a tu consulta',
            'Sefirá del momento actual',
            'Orientación práctica inmediata'
        ],
        'includes': [
            '30 minutos en vivo (Zoom)',
            'Grabación de la sesión',
            'Resumen por escrito'
        ],
        'price_usd': 75.00,
        'price_eur': 70.00,
        'duration_value': 30,
        'duration_type': 'minutes',
        'requires_booking': True,
        'platform': 'Zoom',
        'order': 2
    },
    {
        'category': 'sesiones',
        'name': 'Terapia de Pareja Kabbalística',
        'slug': 'terapia-pareja-90min',
        'service_type': 'session',
        'short_description': 'Sesión de pareja de 90 minutos con mapa kabbalístico conjunto',
        'full_description': 'Sesión terapéutica para parejas donde analizamos el mapa kabbalístico de ambos, identificamos dinámicas relacionales y trabajamos la integración de polaridades en la relación.',
        'benefits': [
            'Mapa kabbalístico de la relación',
            'Comprensión de dinámicas de pareja',
            'Herramientas de comunicación',
            'Plan de trabajo conjunto'
        ],
        'includes': [
            '90 minutos de sesión conjunta',
            'Grabación completa',
            'Mapa de relación personalizado',
            'Ejercicios para la pareja'
        ],
        'price_usd': 220.00,
        'price_eur': 200.00,
        'duration_value': 90,
        'duration_type': 'minutes',
        'requires_booking': True,
        'platform': 'Zoom',
        'order': 3
    },
    
    # LECTURAS Y ANÁLISIS
    {
        'category': 'lecturas',
        'name': 'Lectura de Árbol de Vida Personal',
        'slug': 'lectura-arbol-vida-completa',
        'service_type': 'reading',
        'short_description': 'Análisis completo de tu Árbol de Vida natal y del año actual',
        'full_description': 'Lectura profunda que incluye tu mapa natal (basado en fecha de nacimiento) y el mapa del año actual. Identificamos todas las sefirot, sus mensajes, bloqueos y potenciales. Incluye informe escrito detallado.',
        'benefits': [
            'Mapa natal completo (10 sefirot)',
            'Análisis del año actual',
            'Identificación de bloqueos y talentos',
            'Caminos de evolución personal'
        ],
        'includes': [
            'Sesión de lectura 90 minutos',
            'Informe escrito detallado (PDF)',
            'Diagrama visual del Árbol',
            'Grabación de la sesión'
        ],
        'price_usd': 180.00,
        'price_eur': 165.00,
        'duration_value': 90,
        'duration_type': 'minutes',
        'requires_booking': True,
        'platform': 'Zoom',
        'is_featured': True,
        'order': 1
    },
    
    # FORMACIÓN PROFESIONAL
    {
        'category': 'formacion',
        'name': 'Supervisión para Terapeutas',
        'slug': 'supervision-terapeutas-60min',
        'service_type': 'session',
        'short_description': 'Supervisión de casos clínicos con enfoque kabbalístico',
        'full_description': 'Espacio profesional para terapeutas que deseen supervisar casos clínicos integrando el Árbol de Vida. Analizamos dinámicas desde las sefirot y ofrecemos herramientas kabbalísticas.',
        'benefits': [
            'Supervisión profesional especializada',
            'Integración de Kabbalah en práctica clínica',
            'Análisis de casos desde las sefirot',
            'Red profesional de colegas'
        ],
        'includes': [
            '60 minutos de supervisión',
            'Material de apoyo',
            'Certificado de supervisión'
        ],
        'price_usd': 150.00,
        'price_eur': 140.00,
        'duration_value': 60,
        'duration_type': 'minutes',
        'requires_booking': True,
        'platform': 'Zoom',
        'order': 1
    },
    {
        'category': 'formacion',
        'name': 'Mentoría en Kabbalah Aplicada (Pack 6 sesiones)',
        'slug': 'mentoria-kabbalah-pack6',
        'service_type': 'package',
        'short_description': 'Formación profesional en Kabbalah aplicada a la terapia',
        'full_description': 'Programa de mentoría de 6 sesiones para profesionales que deseen integrar la Kabbalah en su práctica. Incluye teoría, casos prácticos y supervisión personalizada.',
        'benefits': [
            'Formación completa en Kabbalah aplicada',
            '6 sesiones de mentoría personalizada',
            'Material didáctico exclusivo',
            'Certificado de formación'
        ],
        'includes': [
            '6 sesiones de 90 minutos',
            'Material didáctico completo',
            'Casos prácticos supervisados',
            'Certificado profesional',
            'Acceso a grupo de práctica'
        ],
        'price_usd': 720.00,
        'price_eur': 660.00,
        'duration_value': 6,
        'duration_type': 'months',
        'requires_booking': True,
        'platform': 'Zoom',
        'is_bestseller': True,
        'order': 2
    },
    
    # TALLERES Y RETIROS
    {
        'category': 'talleres',
        'name': 'Taller Mensual en Vivo',
        'slug': 'taller-mensual-3h',
        'service_type': 'workshop',
        'short_description': 'Taller grupal mensual de 3 horas sobre temas kabbalísticos',
        'full_description': 'Taller mensual en vivo donde profundizamos en diferentes aspectos del Árbol de Vida. Incluye teoría, meditaciones guiadas y ejercicios prácticos grupales.',
        'benefits': [
            'Aprendizaje grupal enriquecedor',
            'Meditaciones en vivo',
            'Comunidad de práctica',
            'Temas variables cada mes'
        ],
        'includes': [
            '3 horas en vivo (Zoom)',
            'Grabación del taller',
            'Material de apoyo PDF',
            'Acceso al chat del grupo'
        ],
        'price_usd': 65.00,
        'price_eur': 60.00,
        'duration_value': 3,
        'duration_type': 'hours',
        'requires_booking': True,
        'max_participants': 30,
        'platform': 'Zoom',
        'order': 1
    },
    {
        'category': 'talleres',
        'name': 'Retiro Virtual de Fin de Semana',
        'slug': 'retiro-virtual-fin-semana',
        'service_type': 'retreat',
        'short_description': 'Retiro intensivo virtual de 2 días completos',
        'full_description': 'Experiencia inmersiva de fin de semana completo dedicado a explorar las sefirot, meditar, compartir y transformar. Incluye sesiones en vivo, meditaciones, trabajos individuales y grupales.',
        'benefits': [
            'Inmersión profunda en Kabbalah',
            'Experiencia transformadora',
            'Comunidad de práctica',
            'Descanso y renovación espiritual'
        ],
        'includes': [
            '2 días completos (sábado y domingo)',
            '6-8 horas de contenido en vivo',
            'Meditaciones guiadas',
            'Trabajos individuales y grupales',
            'Grabaciones completas',
            'Material de apoyo'
        ],
        'price_usd': 250.00,
        'price_eur': 230.00,
        'duration_value': 2,
        'duration_type': 'days',
        'requires_booking': True,
        'max_participants': 25,
        'platform': 'Zoom',
        'is_featured': True,
        'order': 2
    },
    
    # CONTENIDO DIGITAL
    {
        'category': 'contenido',
        'name': 'Meditación Grabada por Sefirá',
        'slug': 'meditacion-grabada-sefira',
        'service_type': 'meditation',
        'short_description': 'Meditación guiada de una sefirá específica',
        'full_description': 'Meditación grabada de alta calidad para conectar profundamente con una sefirá específica. Audio profesional con música original.',
        'benefits': [
            'Conexión profunda con la sefirá',
            'Audio de alta calidad',
            'Práctica en tu propio tiempo',
            'Acceso de por vida'
        ],
        'includes': [
            'Audio MP3 de 20-30 minutos',
            'Guía PDF de la sefirá',
            'Música original'
        ],
        'price_usd': 15.00,
        'price_eur': 14.00,
        'duration_value': 25,
        'duration_type': 'minutes',
        'requires_booking': False,
        'platform': 'Descarga Digital',
        'order': 1
    },
    {
        'category': 'contenido',
        'name': 'Pack 10 Meditaciones (Árbol Completo)',
        'slug': 'pack-10-meditaciones-arbol',
        'service_type': 'meditation',
        'short_description': 'Colección completa de meditaciones para las 10 sefirot',
        'full_description': 'Paquete completo con las 10 meditaciones guiadas para recorrer todo el Árbol de Vida. Ahorro del 27% respecto a compra individual.',
        'benefits': [
            'Árbol completo de meditaciones',
            'Ahorro significativo',
            'Práctica integral',
            'Acceso de por vida'
        ],
        'includes': [
            '10 audios de meditación',
            'Guía completa del Árbol PDF',
            'Bonus: Meditación de integración'
        ],
        'price_usd': 110.00,
        'price_eur': 100.00,
        'duration_value': 1,
        'duration_type': 'lifetime',
        'requires_booking': False,
        'platform': 'Descarga Digital',
        'is_bestseller': True,
        'order': 2
    },
    {
        'category': 'contenido',
        'name': 'Curso Grabado: Los 22 Caminos y las Emociones',
        'slug': 'curso-22-caminos-emociones',
        'service_type': 'course',
        'short_description': 'Curso completo sobre los 22 senderos del Árbol de Vida',
        'full_description': 'Curso grabado profesional que explora los 22 caminos que conectan las sefirot y su relación con las emociones humanas. Incluye teoría, ejercicios prácticos y meditaciones.',
        'benefits': [
            'Comprensión profunda de los caminos',
            'Integración de emociones',
            'A tu propio ritmo',
            'Material completo y estructurado'
        ],
        'includes': [
            '12 módulos en video (8 horas)',
            'Guía PDF de 100+ páginas',
            '22 meditaciones de cada camino',
            'Ejercicios prácticos',
            'Certificado de finalización'
        ],
        'price_usd': 290.00,
        'price_eur': 265.00,
        'duration_value': 1,
        'duration_type': 'lifetime',
        'requires_booking': False,
        'platform': 'Plataforma de Cursos',
        'is_featured': True,
        'order': 3
    },
    
    # ACOMPAÑAMIENTO CONTINUO
    {
        'category': 'acompanamiento',
        'name': 'Acompañamiento Tikkun 3 Meses',
        'slug': 'acompanamiento-tikkun-3-meses',
        'service_type': 'package',
        'short_description': 'Programa de acompañamiento en tu proceso de Tikkun personal',
        'full_description': 'Programa intensivo de 3 meses para trabajar tu Tikkun (rectificación) personal. Incluye sesiones semanales, trabajo entre sesiones, acceso a materiales exclusivos y acompañamiento continuo.',
        'benefits': [
            '12 sesiones individuales',
            'Acompañamiento personalizado',
            'Transformación profunda',
            'Acceso a comunidad privada'
        ],
        'includes': [
            '12 sesiones de 60 minutos',
            'WhatsApp de apoyo',
            'Material personalizado',
            'Acceso a talleres mensuales',
            'Grabaciones de todas las sesiones'
        ],
        'price_usd': 1200.00,
        'price_eur': 1100.00,
        'duration_value': 3,
        'duration_type': 'months',
        'requires_booking': True,
        'platform': 'Zoom + WhatsApp',
        'is_featured': True,
        'is_bestseller': True,
        'order': 1
    },
    
    # COMUNIDAD
    {
        'category': 'comunidad',
        'name': 'Membresía Comunidad Anual',
        'slug': 'membresia-comunidad-anual',
        'service_type': 'membership',
        'short_description': 'Acceso anual a la comunidad privada con canal de sueños y sincronicidades',
        'full_description': 'Membresía anual a la comunidad privada en Telegram/Discord donde compartimos sueños, sincronicidades, reflexiones kabbalísticas y apoyamos mutuamente nuestro camino.',
        'benefits': [
            'Comunidad de práctica diaria',
            'Canal de sueños',
            'Interpretación kabbalística',
            'Encuentros grupales mensuales'
        ],
        'includes': [
            'Acceso a Telegram/Discord',
            'Encuentros grupales mensuales',
            'Biblioteca de recursos',
            'Descuentos en servicios'
        ],
        'price_usd': 120.00,
        'price_eur': 110.00,
        'duration_value': 1,
        'duration_type': 'years',
        'requires_booking': False,
        'platform': 'Telegram/Discord',
        'order': 1
    },
    {
        'category': 'comunidad',
        'name': 'Membresía Comunidad Mensual',
        'slug': 'membresia-comunidad-mensual',
        'service_type': 'membership',
        'short_description': 'Acceso mensual a la comunidad privada',
        'full_description': 'Membresía mensual flexible para explorar la comunidad antes de comprometerte anualmente.',
        'benefits': [
            'Comunidad de práctica',
            'Sin compromiso anual',
            'Cancela cuando quieras'
        ],
        'includes': [
            'Acceso a Telegram/Discord',
            'Encuentros grupales',
            'Biblioteca de recursos'
        ],
        'price_usd': 15.00,
        'price_eur': 14.00,
        'duration_value': 1,
        'duration_type': 'months',
        'requires_booking': False,
        'platform': 'Telegram/Discord',
        'order': 2
    }
]

print("\n🌟 Creando servicios...")
for service_data in services_data:
    category_name = service_data.pop('category')
    service_data['category'] = categories[category_name]
    
    service, created = Service.objects.update_or_create(
        slug=service_data['slug'],
        defaults=service_data
    )
    status = "✅ Creado" if created else "🔄 Actualizado"
    print(f"{status}: {service.name}")

print("\n🎉 ¡Servicios cargados exitosamente!")
print(f"📊 Total categorías: {ServiceCategory.objects.count()}")
print(f"📊 Total servicios: {Service.objects.count()}")
