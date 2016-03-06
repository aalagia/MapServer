# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0010_auto_20160225_1352'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='trackingbeacon',
            name='BeaconName',
        ),
    ]
