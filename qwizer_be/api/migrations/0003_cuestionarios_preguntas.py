# Generated by Django 4.1 on 2022-10-02 01:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_alter_perteneceacuestionario_idpregunta"),
    ]

    operations = [
        migrations.AddField(
            model_name="cuestionarios",
            name="preguntas",
            field=models.ManyToManyField(
                through="api.PerteneceACuestionario", to="api.preguntas"
            ),
        ),
    ]