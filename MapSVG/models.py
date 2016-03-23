from django.db import models
from pygments.lexers import get_all_lexers
from pygments.styles import get_all_styles
from django.utils import timezone
from datetime import datetime

LEXERS = [item for item in get_all_lexers() if item[1]]
LANGUAGE_CHOICES = sorted([(item[1][0], item[0]) for item in LEXERS])
STYLE_CHOICES = sorted((item, item) for item in get_all_styles())


# Create your models here.
# Contiene la lista delle mappi disponibili
class Map(models.Model):
    idMappa = models.CharField(max_length=20)

# Contiene la lista dei documenti disponibili
class Document(models.Model):
    idMappa = models.CharField(max_length=20)
    Title = models.CharField(max_length=30)
    Type = models.CharField(max_length=10)
    url = models.CharField(max_length=256)
    Comment = models.CharField(max_length=256, default="No Comment")
    pos_X = models.FloatField(default=0)
    pos_Y = models.FloatField(default=0)
    pos_Z = models.FloatField(default=0)

# Contiene i parametri riguardanti i beacon
class ParameterBeacon(models.Model):
    idMappa = models.CharField(max_length=20)
    idSensor = models.IntegerField()
    RSSI0 = models.FloatField(default=0)
    pos_XM = models.FloatField(default=0)
    pos_YM = models.FloatField(default=0)
    pos_ZM = models.IntegerField(default=0)
    Xg = models.FloatField(default=0)
    n = models.FloatField(default=0)
    RSSI0Box = models.FloatField(default=0)
    coff = models.FloatField(default=0)

# Memorizza i JSON ricevuti dal tablet
class TrackingBeacon(models.Model):
    UUID = models.CharField(max_length=50)
    Maj = models.CharField(max_length=10)
    Min = models.CharField(max_length=10)
    TxPower = models.IntegerField(default=0)
    RSSI = models.IntegerField(default=0)
    CalculatedDistance = models.FloatField(default=0)
    CalculatedDistanceFormula = models.FloatField(default=0)
    created = models.DateTimeField(default=timezone.now, blank=True)

    def __unicode__(self):
        return self.UUID

