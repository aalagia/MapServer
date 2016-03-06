# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0002_auto_20151216_1101'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document',
            name='pos_X',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='document',
            name='pos_Y',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='document',
            name='pos_Z',
            field=models.IntegerField(default=0),
        ),
    ]
