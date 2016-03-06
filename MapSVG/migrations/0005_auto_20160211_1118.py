# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0004_auto_20160211_1054'),
    ]

    operations = [
        migrations.AlterField(
            model_name='parameterbeacon',
            name='RSSI0',
            field=models.FloatField(default=0),
        ),
    ]
