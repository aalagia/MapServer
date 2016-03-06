# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0017_auto_20160225_1535'),
    ]

    operations = [
        migrations.AlterField(
            model_name='trackingbeacon',
            name='created',
            field=models.DateTimeField(default=django.utils.timezone.now, blank=True),
        ),
    ]
