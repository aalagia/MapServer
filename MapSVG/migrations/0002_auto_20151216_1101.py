# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MapSVG', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='document',
            old_name='comment',
            new_name='Comment',
        ),
        migrations.RenameField(
            model_name='document',
            old_name='title',
            new_name='Title',
        ),
        migrations.RenameField(
            model_name='document',
            old_name='typeDocument',
            new_name='Type',
        ),
        migrations.RenameField(
            model_name='document',
            old_name='urlDocument',
            new_name='url',
        ),
    ]
