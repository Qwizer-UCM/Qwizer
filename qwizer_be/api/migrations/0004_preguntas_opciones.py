# Generated by Django 4.1 on 2022-10-02 12:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_cuestionarios_preguntas"),
    ]

    operations = [
        migrations.AddField(
            model_name="preguntas",
            name="opciones",
            field=models.ManyToManyField(to="api.opcionestest"),
        ),
    ]