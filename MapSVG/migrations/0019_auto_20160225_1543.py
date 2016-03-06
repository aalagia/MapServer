# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0018_auto_20160225_1536'),
    ]

    operations = [
        migrations.AlterField(
            model_name='trackingbeacon',
            name='UUID',
            field=models.CharField(max_length=50),
        ),
    ]
