# Generated by Django 4.0.2 on 2022-02-13 16:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='respuestastest',
            unique_together={('idPregunta', 'idOpcion')},
        ),
    ]
