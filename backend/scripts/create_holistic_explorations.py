"""
Script to create HolisticExploration records for specified TestModule codes.

Usage (from workspace root):
.venv\Scripts\python.exe backend\scripts\create_holistic_explorations.py scl90

This script:
- uses Django ORM (sets DJANGO_SETTINGS_MODULE)
- for each provided test code, creates a HolisticExploration if it does not exist
- preserves READ-ONLY semantic layer behavior

Constraints respected: does NOT modify TestModule, serializers, views, or migrations.
"""

import os
import sys
from django.utils.text import slugify

# Bootstrap Django when run standalone
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
from django.db import transaction

django.setup()

from api.test_models import TestModule, HolisticExploration

# Mapping derived from docs/RENOMBRADO_EXPLORACIONES_SIMBOLICAS_LEGACY.md
# and docs/MODELO_EXPLORACIONES_HOLISTICAS.md
EXPLORATIONS = {
    # key: test module code in DB
    'scl90': {
        'public_name': 'Mapa Global de Tensiones del Alma',
        'category': 'multidimensional',
        'primary_sefirah': 'Tiferet',
        'secondary_sefirot': ['Keter', 'Yesod'],
        'description': (
            "Panorama transversal de tensiones y densidades simbólicas que orienta "
            "la priorización de trabajo terapéutico desde una lectura holística. "
            "Esta descripción es LEGACY y NO DIAGNÓSTICA: aporta marco simbólico para "
            "la sesión, no criterios clínicos ni recomendaciones técnicas."
        ),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'phq-9': {
        'public_name': 'Exploración de Vitalidad Emocional',
        'category': 'emocional',
        'primary_sefirah': 'Tiferet',
        'secondary_sefirot': ['Netzach', 'Hod'],
        'description': (
            "Explora variaciones en la intensidad afectiva, la capacidad de reactividad "
            "emocional y patrones de regulación percibidos como variaciones del impulso vital. "
            "Esta lectura es LEGACY y NO DIAGNÓSTICA: aporta contexto simbólico para la sesión, "
            "no criterios clínicos ni recomendaciones.") ,
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'gad-7': {
        'public_name': 'Exploración de Activación y Contención',
        'category': 'mental',
        'primary_sefirah': 'Gevurah',
        'secondary_sefirot': ['Yesod', 'Hod'],
        'description': (
            "Lectura simbólica sobre grado de activación sostenida y la capacidad de contener "
            "respuestas, orientada a prácticas de regulación simbólica. NO DIAGNÓSTICA.") ,
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'bai': {
        'public_name': 'Exploración de Respuesta Energética al Entorno',
        'category': 'corporal',
        'primary_sefirah': 'Netzach',
        'secondary_sefirot': ['Yesod', 'Hod'],
        'description': (
            "Lectura simbólica de la reactividad corporal y patrones somáticos frente a estímulos "
            "contextuales. LEGACY — NO DIAGNÓSTICA."),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'bdi-ii': {
        'public_name': 'Exploración de Flujo de Voluntad y Sentido',
        'category': 'energia',
        'primary_sefirah': 'Tiferet',
        'secondary_sefirot': ['Netzach', 'Malchut'],
        'description': (
            "Lectura simbólica sobre impulso hacia objetivos, bloqueos en la voluntad y "
            "orientación vital. NO DIAGNÓSTICA."),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'past-lives': {
        'public_name': 'Exploración de Memorias del Alma',
        'category': 'memoria',
        'primary_sefirah': 'Yesod',
        'secondary_sefirot': ['Keter', 'Netzach'],
        'description': (
            "Lectura simbólica orientada a recuperar hilos narrativos y memorias simbólicas\n"
            "que aportan contexto a la experiencia presente. LEGACY — NO DIAGNÓSTICA."),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'wellness': {
        'public_name': 'Exploración de Bienestar Integral',
        'category': 'bienestar',
        'primary_sefirah': 'Tiferet',
        'secondary_sefirot': ['Netzach', 'Hod'],
        'description': (
            "Panorama simbólico de factores de bienestar físico, mental y relacional. \n"
            "Aporta enfoque holístico sin criterios clínicos ni diagnósticos."),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'screening-general': {
        'public_name': 'Exploración de Tamizaje General',
        'category': 'tamizaje',
        'primary_sefirah': 'Hod',
        'secondary_sefirot': ['Yesod', 'Netzach'],
        'description': (
            "Lectura simbólica de detección temprana para orientar conversaciones \n"
            "iniciales en la sesión. LEGACY — NO DIAGNÓSTICA."),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': False,
        'therapist_only_results': True,
    },
    'insomnia': {
        'public_name': 'Exploración de Sueño y Descanso',
        'category': 'sueño',
        'primary_sefirah': 'Yesod',
        'secondary_sefirot': ['Netzach', 'Hod'],
        'description': (
            "Lectura simbólica sobre patrones de sueño, higiene y recuperación nocturna. \n"
            "No provee criterios clínicos; es un apoyo para la intervención simbólica."),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'nutrition': {
        'public_name': 'Exploración de Alimentación y Hábitos',
        'category': 'somatico',
        'primary_sefirah': 'Netzach',
        'secondary_sefirot': ['Yesod', 'Malchut'],
        'description': (
            "Lectura simbólica sobre relaciones con la comida y patrones hábitos-energía. \n"
            "LEGACY — NO DIAGNÓSTICA."),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': False,
        'therapist_only_results': True,
    },
    'stress-regulation': {
        'public_name': 'Exploración de Estrés y Regulación',
        'category': 'regulacion',
        'primary_sefirah': 'Gevurah',
        'secondary_sefirot': ['Hod', 'Yesod'],
        'description': (
            "Lectura simbólica sobre cargas adaptativas y estrategias de regulación. \n"
            "Apoya la práctica clínica simbólica sin diagnóstico."),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'anxiety-state-trait': {
        'public_name': 'Exploración de Ansiedad - Estado/Rasgo',
        'category': 'emocional',
        'primary_sefirah': 'Gevurah',
        'secondary_sefirot': ['Hod', 'Yesod'],
        'description': (
            "Explora niveles de ansiedad situacional y rasgos persistentes desde una \n"
            "lectura simbólica. LEGACY — NO DIAGNÓSTICA."),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'asrs_essence': {
        'public_name': 'Archetypal Soul Rhythm Scale (ASRS-Essence)',
        'category': 'atencion',
        'primary_sefirah': 'Tiferet',
        'secondary_sefirot': ['Malchut'],
        'description': (
            "Reinterpretacion del ASRS. Foco en la gestion de la atencion "
            "(Tiferet/Malkhut)."
        ),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'sha_harmony': {
        'public_name': 'Auditoría de Armonía Sefirótica (SHA)',
        'category': 'equilibrio',
        'primary_sefirah': 'Netzach',
        'secondary_sefirot': [],
        'description': (
            "Auditoría de equilibrio de pasiones y armonía energética (lectura simbólica de "
            "Netzach). Screening orientativo, no diagnóstico. Útil para abrir conversación "
            "sobre hábitos, consumo y regulación del deseo; el detalle técnico (puntaje/banda) "
            "es solo para el terapeuta."
        ),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'dudit_spirit': {
        'public_name': 'Divine Unity Drug Introspection (DUDIT-Spirit)',
        'category': '',
        'primary_sefirah': 'Hod',
        'secondary_sefirot': ['Yesod'],
        'description': (
            "Reinterpretacion del DUDIT. Foco en interferencias auricas y Hod/Yesod."
        ),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'ybocs_soul': {
        'public_name': 'Yetziratic Balance Sanctuary (Y-BOCS-Soul)',
        'category': '',
        'primary_sefirah': 'Gevurah',
        'secondary_sefirot': [],
        'description': (
            "Reinterpretacion del Y-BOCS. Foco en rituales repetitivos y purificacion (Gevurah)."
        ),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'eat26_spirit': {
        'public_name': 'Eternal Abundance Threshold (EAT-26-Spirit)',
        'category': '',
        'primary_sefirah': 'Malchut',
        'secondary_sefirot': [],
        'description': (
            "Reinterpretacion del EAT-26. Foco en la relacion sagrada con el sustento (Malkhut)."
        ),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
    'mcmi4_mystic': {
        'public_name': 'Multiaxial Cosmic Matrix (MCMI-4-Mystic)',
        'category': '',
        'primary_sefirah': '',
        'secondary_sefirot': [],
        'description': (
            "Reinterpretacion del MCMI-IV. Mapa complejo de estilos de personalidad y sefirot."
        ),
        'client_visible_fields': [],
        'therapist_only_fields': [],
        'ai_interpretation_enabled': True,
        'therapist_only_results': True,
    },
}


def create_exploration_for_test(code):
    try:
        tm = TestModule.objects.get(code=code)
    except TestModule.DoesNotExist:
        print(f"SKIP: TestModule with code '{code}' not found in DB.")
        return

    # Check if exploration exists
    existing = HolisticExploration.objects.filter(source_test=tm).first()
    if existing:
        print(f"EXISTS: HolisticExploration already exists for TestModule '{code}' (id={existing.id}).")
        return

    data = EXPLORATIONS.get(code)
    if not data:
        print(f"NO MAPPING: No canonical mapping provided for '{code}'. Skipping.")
        return

    # Build slug code from public_name
    base_slug = slugify(data['public_name'] or f"exploracion-{code}")
    slug = base_slug
    # Ensure uniqueness
    i = 1
    while HolisticExploration.objects.filter(code=slug).exists():
        i += 1
        slug = f"{base_slug}-{i}"

    with transaction.atomic():
        he = HolisticExploration.objects.create(
            code=slug,
            public_name=data['public_name'],
            category=data.get('category', ''),
            primary_sefirah=data.get('primary_sefirah', ''),
            secondary_sefirot=data.get('secondary_sefirot', []),
            client_visible_fields=data.get('client_visible_fields', []),
            therapist_only_fields=data.get('therapist_only_fields', []),
            ai_interpretation_enabled=data.get('ai_interpretation_enabled', False),
            therapist_only_results=data.get('therapist_only_results', True),
            description=data.get('description', ''),
            source_test=tm,
        )
        print(f"CREATED: HolisticExploration id={he.id} code={he.code} for TestModule '{code}' (tm_id={tm.id})")


if __name__ == '__main__':
    if len(sys.argv) <= 1:
        print("Usage: python create_holistic_explorations.py <test_code> [<test_code> ...]")
        print("Example: python create_holistic_explorations.py scl90")
        sys.exit(1)

    codes = [c.strip().lower() for c in sys.argv[1:]]
    for c in codes:
        create_exploration_for_test(c)

    print("Done.")
