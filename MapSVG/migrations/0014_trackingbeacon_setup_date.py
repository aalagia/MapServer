# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0013_auto_20160225_1531'),
    ]

    operations = [
        migrations.AddField(
            model_name='trackingbeacon',
            name='setup_date',
            field=models.DateTimeField(default=datetime.datetime.now, blank=True),
        ),
    ]
