# Idempotent data migration: fix past-lives TestModule description (remove misleading numerology copy).

from django.db import migrations

PAST_LIVES_DESCRIPTION = (
    'Exploración simbólica y no diagnóstica de patrones, afinidades y memorias del alma '
    'que pueden iluminar tu presente.'
)

PAST_LIVES_NAME = 'Vidas Pasadas – Exploración de Memorias del Alma'

LEGACY_NUMEROLOGY_SNIPPET = 'numerología'


def update_past_lives_metadata(apps, schema_editor):
    TestModule = apps.get_model('api', 'TestModule')
    module = TestModule.objects.filter(code='past-lives').first()
    if not module:
        return
    desc = (module.description or '').lower()
    if LEGACY_NUMEROLOGY_SNIPPET in desc or module.estimated_duration != 20:
        module.description = PAST_LIVES_DESCRIPTION
        module.name = PAST_LIVES_NAME
        module.estimated_duration = 20
        module.save(update_fields=['description', 'name', 'estimated_duration'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0104_activate_asrs_essence'),
    ]

    operations = [
        migrations.RunPython(update_past_lives_metadata, noop_reverse),
    ]