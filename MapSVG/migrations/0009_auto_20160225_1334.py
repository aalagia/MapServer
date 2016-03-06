# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0008_trackingbeacon_beaconname'),
    ]

    operations = [
        migrations.AlterField(
            model_name='trackingbeacon',
            name='BeaconName',
            field=models.CharField(max_length=50),
        ),
    ]
