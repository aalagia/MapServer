# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0011_remove_trackingbeacon_beaconname'),
    ]

    operations = [
        migrations.AddField(
            model_name='trackingbeacon',
            name='TxPower',
            field=models.IntegerField(default=0),
        ),
    ]
