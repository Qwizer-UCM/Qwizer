# Generated by Django 4.0.2 on 2022-02-13 17:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_cuestionarios_secuencial'),
    ]

    operations = [
        migrations.AddField(
            model_name='cuestionarios',
            name='duracion',
            field=models.IntegerField(default=30, verbose_name='duracion'),
        ),
    ]