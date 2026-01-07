from django.db import migrations


def remove_scdf_testmodule(apps, schema_editor):
    TestModule = apps.get_model("api", "TestModule")
    TestModule.objects.filter(code="scdf").delete()


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0052_add_scdf_testmodule"),
    ]

    operations = [
        migrations.RunPython(remove_scdf_testmodule, reverse_code=noop_reverse),
    ]

