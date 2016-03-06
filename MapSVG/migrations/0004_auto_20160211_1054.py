# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0003_auto_20151216_1124'),
    ]

    operations = [
        migrations.CreateModel(
            name='ParameterBeacon',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('idMappa', models.CharField(max_length=20)),
                ('idSensor', models.IntegerField()),
                ('RSSI0', models.IntegerField()),
                ('pos_XM', models.FloatField(default=0)),
                ('pos_YM', models.FloatField(default=0)),
                ('pos_ZM', models.IntegerField(default=0)),
                ('Xg', models.FloatField(default=0)),
                ('n', models.FloatField(default=0)),
            ],
        ),
        migrations.AlterField(
            model_name='document',
            name='Comment',
            field=models.CharField(default=b'No Comment', max_length=256),
        ),
    ]
