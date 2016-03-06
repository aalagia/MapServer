# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0014_trackingbeacon_setup_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='trackingbeacon',
            name='setup_date',
            field=models.DateTimeField(default=datetime.datetime(2016, 2, 25, 15, 34, 42, 58392, tzinfo=utc), blank=True),
        ),
    ]
