# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0019_auto_20160225_1543'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document',
            name='pos_X',
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name='document',
            name='pos_Y',
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name='document',
            name='pos_Z',
            field=models.FloatField(default=0),
        ),
    ]
