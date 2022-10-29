# Generated by Django 4.1 on 2022-10-29 13:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0004_preguntas_opciones"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="respuestasenviadastest",
            options={},
        ),
        migrations.AlterModelOptions(
            name="respuestasenviadastext",
            options={},
        ),
        migrations.RemoveField(
            model_name="preguntas",
            name="opciones",
        ),
        migrations.AlterField(
            model_name="opcionestest",
            name="idPregunta",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="opciones_test",
                to="api.preguntas",
            ),
        ),
    ]
