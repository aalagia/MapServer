from __future__ import absolute_import

from celery import shared_task


@shared_task
def periodic_task():
    print "Ci sono"
