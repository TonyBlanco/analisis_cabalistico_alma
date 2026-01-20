from django.db import migrations


def mark_technical_tests_non_assignable(apps, schema_editor):
    TestModule = apps.get_model("api", "TestModule")
    technical_prefixes = ("lock-test", "dbg-test", "smoke-test")
    for prefix in technical_prefixes:
        TestModule.objects.filter(code__startswith=prefix).update(is_assignable=False)


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0060_add_testmodule_is_assignable"),
    ]

    operations = [
        migrations.RunPython(mark_technical_tests_non_assignable, migrations.RunPython.noop),
    ]

