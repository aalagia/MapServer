# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0016_auto_20160225_1534'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='trackingbeacon',
            name='setup_date',
        ),
        migrations.AddField(
            model_name='trackingbeacon',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2016, 2, 25, 15, 35, 14, 34193, tzinfo=utc), blank=True),
        ),
    ]
