# Idempotent data migration: activate sha_harmony for therapist catalog + therapist guide.

from django.db import migrations

SHA_THERAPIST_GUIDE = (
    'Auditoría de equilibrio de pasiones y armonía energética (lectura simbólica de '
    'Netzach). Screening orientativo, no diagnóstico. Útil para abrir conversación '
    'sobre hábitos, consumo y regulación del deseo; el detalle técnico (puntaje/banda) '
    'es solo para el terapeuta.'
)

SHA_PUBLIC_NAME = 'Auditoría de Armonía Sefirótica (SHA)'

TARGET_FLAGS = {
    'is_active': True,
    'is_assignable': True,
    'is_internal': False,
    'domain': 'holistic',
    'available_for_therapists': True,
    'available_for_personal': True,
    'description': SHA_THERAPIST_GUIDE,
    'public_name': SHA_PUBLIC_NAME,
}


def _pending_updates(instance, targets):
    updates = {}
    for field, value in targets.items():
        if getattr(instance, field) != value:
            updates[field] = value
    return updates


def activate_sha_harmony(apps, schema_editor):
    TestModule = apps.get_model('api', 'TestModule')
    module = TestModule.objects.filter(code='sha_harmony').first()
    if not module:
        return

    updates = _pending_updates(module, TARGET_FLAGS)
    if updates:
        TestModule.objects.filter(pk=module.pk).update(**updates)

    HolisticExploration = apps.get_model('api', 'HolisticExploration')
    exploration = HolisticExploration.objects.filter(source_test_id=module.pk).first()
    if exploration:
        exp_updates = {}
        if exploration.description != SHA_THERAPIST_GUIDE:
            exp_updates['description'] = SHA_THERAPIST_GUIDE
        if not (exploration.category or '').strip():
            exp_updates['category'] = 'equilibrio'
        if exp_updates:
            HolisticExploration.objects.filter(pk=exploration.pk).update(**exp_updates)


def deactivate_sha_harmony(apps, schema_editor):
    TestModule = apps.get_model('api', 'TestModule')
    TestModule.objects.filter(code='sha_harmony').update(
        is_active=False,
        is_assignable=False,
        available_for_therapists=False,
        available_for_personal=False,
    )


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0107_rename_mcmi4_signal_public_name'),
    ]

    operations = [
        migrations.RunPython(activate_sha_harmony, deactivate_sha_harmony),
    ]