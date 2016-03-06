# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0009_auto_20160225_1334'),
    ]

    operations = [
        migrations.AlterField(
            model_name='trackingbeacon',
            name='Maj',
            field=models.CharField(max_length=10),
        ),
        migrations.AlterField(
            model_name='trackingbeacon',
            name='Min',
            field=models.CharField(max_length=10),
        ),
    ]
