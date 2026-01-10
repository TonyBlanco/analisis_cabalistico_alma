from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0058_create_therapistnote"),
    ]

    operations = [
        migrations.AddField(
            model_name="testresult",
            name="archived_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
