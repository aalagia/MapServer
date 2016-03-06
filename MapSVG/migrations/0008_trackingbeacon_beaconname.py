# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0007_trackingbeacon'),
    ]

    operations = [
        migrations.AddField(
            model_name='trackingbeacon',
            name='BeaconName',
            field=models.CharField(default=b'', max_length=50),
        ),
    ]
