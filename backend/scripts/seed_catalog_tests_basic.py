"""
Seed Catalog Tests (Basic)

Restores core test modules in the catalog after a DB reset.
Creates or updates TestModule entries for the therapist catalog used at
`/dashboard/therapist/tests`.

Usage:
  cd backend
  python scripts/seed_catalog_tests_basic.py
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.test_models import TestModule


CATALOG_CODES = {
    # Beria — Intelecto y Conciencia
    "wellness": {
        "name": "Wellness Assessment",
        "public_name": "Wellness Assessment",
        "description": "Holistic wellness screening.",
    },
    "screening-general": {
        "name": "Screening Psicológico General",
        "public_name": "Screening Psicológico General",
        "description": "Screening psicológico general (no diagnóstico).",
    },
    "scl90": {
        "name": "SCL-90 — Screening Holístico",
        "public_name": "Soul Symmetry Lens",
        "description": "Versión holística del SCL-90 para evaluar síntomas generales sin diagnóstico.",
    },
    # Ietzirá — Emoción y Regulación
    "anxiety-state-trait": {
        "name": "Ansiedad — Estado y rasgo",
        "public_name": "Ansiedad — Estado y rasgo",
        "description": "Wellness orientativo para mapear ansiedad presente y tendencias personales.",
    },
    "stress-regulation": {
        "name": "Estrés — Carga y regulación",
        "public_name": "Estrés — Carga y regulación",
        "description": "Explora carga de estrés, regulación y recursos (no diagnóstico).",
    },
    "bdi-ii": {
        "name": "BDI-II - Inventario de Depresión de Beck",
        "public_name": "Dawn Reflection Index",
        "description": "Instrumento legacy importado para reflexión emocional.",
    },
    "ybocs_soul": {
        "name": "Yetziratic Balance Sanctuary (Y-BOCS-Soul)",
        "public_name": "Yetziratic Balance Sanctuary (Y-BOCS-Soul)",
        "description": "Cuestionario simbólico de equilibrio y armonía emocional.",
    },
    # Asiá — Acción y Cuerpo
    "insomnia": {
        "name": "Insomnia — Descanso y hábitos",
        "public_name": "Insomnia — Descanso y hábitos",
        "description": "Evaluación orientativa de descanso y calidad del sueño (no médico).",
    },
    "nutrition": {
        "name": "Alimentación — Relación y hábitos",
        "public_name": "Alimentación — Relación y hábitos",
        "description": "Hábitos alimentarios y relación con la comida (no diagnóstico).",
    },
    "dudit_spirit": {
        "name": "Introspección de Unidad — Patrones de desconexión (Rúaj)",
        "public_name": "Introspección de Unidad — Patrones de desconexión (Rúaj)",
        "description": "Exploración holística orientativa sobre patrones de desconexión/escape y regulación (no diagnóstico).",
    },
    "eat26_spirit": {
        "name": "Eternal Abundance Threshold (EAT-26-Spirit)",
        "public_name": "Eternal Abundance Threshold (EAT-26-Spirit)",
        "description": "Exploración simbólica sobre relación con la alimentación (no clínico).",
    },
    # Atzilut — Unidad y Esencia
    "past-lives": {
        "name": "Vidas Pasadas – Exploración de Memorias del Alma",
        "public_name": "Vidas Pasadas – Exploración de Memorias del Alma",
        "description": (
            "Exploración personal y simbólica orientada a la reflexión sobre patrones y sentido vital. "
            "No constituye diagnóstico médico ni psicológico."
        ),
    },
    "asrs_essence": {
        "name": "Archetypal Soul Rhythm Scale (ASRS-Essence)",
        "public_name": "Escala Arquetipal de Ritmo del Alma (ASRS-Essence)",
        "description": "Evaluación del ritmo interno del alma para determinar el Mundo de inicio.",
    },
    # Transversal/terapeuta
    "sha_harmony": {
        "name": "Sephirotic Harmony Audit (SHA)",
        "public_name": "Auditoría de Armonía Sefirótica (SHA)",
        "description": "Auditoría de equilibrio y armonía energética (herramienta del terapeuta).",
    },
    # Cabalistic therapist tool (catalog presence only)
    "mcmi4_mystic": {
        "name": "Multiaxial Cosmic Matrix (MCMI-4-Mystic)",
        "public_name": "Multiaxial Cosmic Matrix (MCMI-4-Mystic)",
        "description": "Herramienta cabalística del terapeuta para workspace MCMI4 (no ejecutable desde /api/tests).",
    },
}


def ensure_module(code: str, data: dict, order_base: int = 100) -> TestModule:
    try:
        tm = TestModule.objects.get(code=code)
        created = False
    except TestModule.DoesNotExist:
        tm = TestModule(code=code)
        created = True

    tm.name = data.get("name", code)
    tm.public_name = data.get("public_name", tm.name)
    tm.description = data.get("description", tm.public_name)
    tm.test_type = data.get("test_type", "holistic_screening")
    tm.domain = data.get("domain", TestModule.Domain.HOLISTIC)
    tm.required_access_level = data.get("required_access_level", "personal")
    tm.is_active = True
    # Make visible to both therapist and personal by default; UI will normalize mode
    tm.available_for_therapists = True
    tm.available_for_personal = True
    # Therapist-only items can still appear but not be assignable
    tm.is_assignable = data.get("is_assignable", True)
    tm.is_internal = False
    tm.icon = data.get("icon", "")
    tm.estimated_duration = data.get("estimated_duration", 6)
    tm.order = data.get("order", order_base)
    tm.save()

    print(f"{'🆕 Created' if created else '✅ Updated'}: {tm.code} → {tm.public_name}")
    return tm


def main():
    print("=== Seeding core catalog tests ===\n")
    order = 100
    for code, data in CATALOG_CODES.items():
        ensure_module(code, data, order_base=order)
        order += 1

    print("\n✅ Seeding complete. Review with: python review_tests_state.py")


if __name__ == "__main__":
    main()
