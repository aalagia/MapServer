from rest_framework import serializers
from models import Document
from models import ParameterBeacon
from models import TrackingBeacon
from models import Map

class MapSerializers(serializers.ModelSerializer):

    class Meta:
        model = Map
        fields = '__all__'


class DocumentSerializers(serializers.ModelSerializer):
    Comment = serializers.CharField(allow_blank=True)

    class Meta:
        model = Document
        fields = ('idMappa', 'Title', 'Type', 'url', 'Comment', 'pos_X', 'pos_Y', 'pos_Z')

class ParameterBeaconSerializers(serializers.ModelSerializer):

    class Meta:
        model = ParameterBeacon
        fields = ('idMappa', 'idSensor', 'RSSI0', 'pos_XM', 'pos_YM', 'pos_ZM', 'Xg', 'n', 'RSSI0Box', 'coff')

class TrackingBeaconSerializers(serializers.ModelSerializer):

    class Meta:
        model = TrackingBeacon
        fields = ('UUID', 'Maj', 'Min', 'TxPower', 'RSSI', 'CalculatedDistance', 'CalculatedDistanceFormula')
