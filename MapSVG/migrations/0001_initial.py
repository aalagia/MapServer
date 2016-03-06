# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('idMappa', models.CharField(max_length=20)),
                ('title', models.CharField(max_length=30)),
                ('typeDocument', models.CharField(max_length=10)),
                ('urlDocument', models.CharField(max_length=256)),
                ('comment', models.CharField(max_length=256)),
                ('pos_X', models.DecimalField(default=0, max_digits=5, decimal_places=2)),
                ('pos_Y', models.DecimalField(default=0, max_digits=5, decimal_places=2)),
                ('pos_Z', models.DecimalField(default=0, max_digits=5, decimal_places=2)),
            ],
        ),
    ]
