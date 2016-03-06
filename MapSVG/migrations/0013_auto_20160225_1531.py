# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0012_trackingbeacon_txpower'),
    ]

    operations = [
        migrations.AlterField(
            model_name='trackingbeacon',
            name='UUID',
            field=models.CharField(unique=True, max_length=50),
        ),
    ]
