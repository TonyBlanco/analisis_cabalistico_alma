from django.db import migrations, models


def set_technical_tests_non_assignable(apps, schema_editor):
    TestModule = apps.get_model("api", "TestModule")
    technical_codes = ["lock-test", "dbg-test", "smoke-test"]
    TestModule.objects.filter(code__in=technical_codes).update(is_assignable=False)


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0059_add_testresult_archived_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="testmodule",
            name="is_assignable",
            field=models.BooleanField(
                default=True,
                help_text="Marca si el módulo puede asignarse desde la UI/terapeuta"
            ),
        ),
        migrations.RunPython(set_technical_tests_non_assignable, migrations.RunPython.noop),
    ]
