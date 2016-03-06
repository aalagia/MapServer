# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0006_auto_20160224_0904'),
    ]

    operations = [
        migrations.CreateModel(
            name='TrackingBeacon',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('UUID', models.CharField(max_length=50)),
                ('Maj', models.IntegerField(default=0)),
                ('Min', models.IntegerField(default=0)),
                ('RSSI', models.IntegerField(default=0)),
                ('CalculatedDistance', models.FloatField(default=0)),
                ('CalculatedDistanceFormula', models.FloatField(default=0)),
            ],
        ),
    ]
