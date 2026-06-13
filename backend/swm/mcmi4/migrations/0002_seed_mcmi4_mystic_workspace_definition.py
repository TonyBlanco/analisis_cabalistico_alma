from django.db import migrations


def seed_mcmi4_mystic_definition(apps, schema_editor):
    WorkspaceDefinition = apps.get_model('swm_mcmi4', 'WorkspaceDefinition')
    WorkspaceDefinition.objects.get_or_create(
        code='MCMI4_MYSTIC',
        defaults={
            'name': 'MCMI-4 Místico',
            'version': '1.0',
            'description': (
                'Specialized workspace for symbolic/hermeneutic interpretation '
                'of MCMI-4 clinical data.'
            ),
            'config_schema': {
                'include_symbolic_layers': {
                    'type': 'array',
                    'items': {'type': 'string'},
                    'default': ['archetypal', 'relational', 'transgenerational'],
                },
                'focus_areas': {
                    'type': 'array',
                    'items': {'type': 'string'},
                    'default': [],
                },
            },
            'is_active': True,
        },
    )


def unseed_mcmi4_mystic_definition(apps, schema_editor):
    WorkspaceDefinition = apps.get_model('swm_mcmi4', 'WorkspaceDefinition')
    WorkspaceDefinition.objects.filter(code='MCMI4_MYSTIC').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('swm_mcmi4', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            seed_mcmi4_mystic_definition,
            unseed_mcmi4_mystic_definition,
        ),
    ]