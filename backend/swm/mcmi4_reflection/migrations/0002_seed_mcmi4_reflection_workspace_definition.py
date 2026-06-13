from django.db import migrations


def seed_mcmi4_reflection_definition(apps, schema_editor):
    WorkspaceDefinition = apps.get_model('swm_mcmi4_reflection', 'WorkspaceDefinition')
    WorkspaceDefinition.objects.get_or_create(
        code='MCMI4_REFLECTION',
        defaults={
            'name': 'MCMI-4 Reflection',
            'version': '1.0',
            'description': (
                'Experiential reflection module for consultants based on mcmi4-signal'
            ),
            'config_schema': {
                'questions': [
                    {
                        'id': 'q1',
                        'text': '¿Cómo te sientes al revisar los resultados de tu evaluación?',
                    },
                    {
                        'id': 'q2',
                        'text': '¿Qué aspectos de los resultados resuenan más contigo?',
                    },
                    {
                        'id': 'q3',
                        'text': '¿Hay algún patrón que reconozcas en tu vida diaria?',
                    },
                    {
                        'id': 'q4',
                        'text': '¿Qué te gustaría explorar más profundamente con tu terapeuta?',
                    },
                    {
                        'id': 'q5',
                        'text': '¿Qué recursos o fortalezas internas reconoces en ti?',
                    },
                    {
                        'id': 'q6',
                        'text': '¿Qué cambios o pasos te gustaría considerar?',
                    },
                ]
            },
            'is_active': True,
        },
    )


def unseed_mcmi4_reflection_definition(apps, schema_editor):
    WorkspaceDefinition = apps.get_model('swm_mcmi4_reflection', 'WorkspaceDefinition')
    WorkspaceDefinition.objects.filter(code='MCMI4_REFLECTION').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('swm_mcmi4_reflection', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            seed_mcmi4_reflection_definition,
            unseed_mcmi4_reflection_definition,
        ),
    ]