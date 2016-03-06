# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0005_auto_20160211_1118'),
    ]

    operations = [
        migrations.AddField(
            model_name='parameterbeacon',
            name='RSSI0Box',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='parameterbeacon',
            name='coff',
            field=models.FloatField(default=0),
        ),
    ]
