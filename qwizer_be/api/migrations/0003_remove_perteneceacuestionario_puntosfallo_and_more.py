# Generated by Django 4.0.2 on 2022-02-13 16:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_respuestastest_unique_together'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='perteneceacuestionario',
            name='puntosFallo',
        ),
        migrations.AlterField(
            model_name='perteneceacuestionario',
            name='puntosAcierto',
            field=models.DecimalField(decimal_places=2, max_digits=30, verbose_name='puntosFallo'),
        ),
    ]
