from apscheduler.schedulers.background import BackgroundScheduler
from rest_framework.decorators import api_view, renderer_classes
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer, StaticHTMLRenderer, TemplateHTMLRenderer
from models import Document
from serializers import DocumentSerializers
from models import ParameterBeacon
from serializers import ParameterBeaconSerializers
import math
import numpy
from models import TrackingBeacon
from serializers import TrackingBeaconSerializers
from models import Map
from serializers import MapSerializers
from django.db.models import Avg
from django.utils.encoding import smart_str
import os
import re
from datetime import datetime

import pprint
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404

from rest_framework.parsers import JSONParser
import json


class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """

    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'

        super(JSONResponse, self).__init__(content, **kwargs)


def urlify(s):
    # Remove all non-word characters (everything except numbers and letters)
    s = re.sub(r"[^\w\s\.]", '', s)

    # Replace all runs of whitespace with a single dash
    s = re.sub(r"\s+", '-', s)

    return s


@api_view(['GET', 'POST'])
def map_list(request):
    if request.method == 'GET':
        map = Map.objects.all()
        serializer = MapSerializers(map, many=True)
        return JSONResponse(serializer.data, status=201)


@api_view(['GET', 'POST'])
def map_request(request, idMappa):
    if request.method == 'GET':
        print "ciao"
        document = Document.objects.filter(idMappa=idMappa)
        serializer = DocumentSerializers(document, many=True)
        return JSONResponse({"media": serializer.data}, status=201)

    elif request.method == 'POST':

        print request.data
        data = json.loads(request.POST.get('media'))
        up_file = request.FILES['file']
        filename = urlify(up_file.name)
        location = '/media/' + filename
        data['url'] = location

        serializer = DocumentSerializers(data=data)
        if serializer.is_valid():
            print "Sto salvando"
            serializer.save()


        destination = open(location, 'wb+')
        print "Sono qui"
        for chunk in up_file.chunks():
            destination.write(chunk)

        destination.close()


        return JSONResponse(location, status=201)



@api_view(['GET', 'POST'])
def beacon_data(request):
    if request.method == 'GET':
        print "HO FATTO UNA GET!!!!!!!!"

    if request.method == 'POST':
        print "E' arrivata una POST" + request.body
        response = calculate_position_min_max(request.body)
        # response = calculate_position_min_max_path_loss(request.body)

    return JSONResponse(response, status=201)


def calculate_position_min_max(beacon_json):
    data = json.loads(beacon_json)

    l = []
    r = []
    t = []
    b = []
    for beacon in data:
        index = str(beacon['Maj'])


        parameter = ParameterBeacon.objects.filter(idSensor=beacon['Maj'])
        serializer = ParameterBeaconSerializers(parameter, many=True)

        value = json.loads(json.dumps(serializer.data))

        print "Xg", value[0]["Xg"]

        x = value[0]['pos_XM']

        y = value[0]['pos_YM']
        print "RSSI0 " + str(value[0]["RSSI0"]) + " RSSI " + str(beacon['RSSI'])

        print "La distanza da " + beacon["Maj"] + " e' in metri " + str(beacon['CalculatedDistance'])


        l.append((x - beacon['CalculatedDistance']))
        r.append((x + beacon['CalculatedDistance']))
        t.append((y + beacon['CalculatedDistance']))
        b.append((y - beacon['CalculatedDistance']))

    x_s = (max(l) + min(r)) / 2
    y_s = (min(t) + max(b)) / 2

    position = {'CoordinateStimate': {'pos_X': x_s, 'pos_Y': y_s}}
    print "Coordinate stimate", x_s, y_s

    return position


def calculate_position_trilateration(beacon_json):
    data = json.loads(beacon_json)
    beacon = sorted(data, key=lambda k: int(k['CalculatedDistance']), reverse=False)
    parameter1 = ParameterBeacon.objects.filter(idSensor=beacon[0]['Maj'])
    serializer1 = ParameterBeaconSerializers(parameter1, many=True)
    value1 = json.loads(json.dumps(serializer1.data))
    parameter2 = ParameterBeacon.objects.filter(idSensor=beacon[1]['Maj'])
    serializer2 = ParameterBeaconSerializers(parameter2, many=True)
    value2 = json.loads(json.dumps(serializer2.data))
    parameter3 = ParameterBeacon.objects.filter(idSensor=beacon[2]['Maj'])
    serializer3 = ParameterBeaconSerializers(parameter3, many=True)
    value3 = json.loads(json.dumps(serializer3.data))
    x1 = value1[0]['pos_XM']
    y1 = value1[0]['pos_YM']
    x2 = value2[0]['pos_XM']
    y2 = value2[0]['pos_YM']
    x3 = value3[0]['pos_XM']
    y3 = value3[0]['pos_YM']

    P1 = numpy.array([x1, y1, beacon[0]['CalculatedDistance']])
    P2 = numpy.array([x2, y2, beacon[1]['CalculatedDistance']])
    P3 = numpy.array([x3, y3, beacon[2]['CalculatedDistance']])
    print "La distanza di beacon 0 ", P1, P2, P3
    ex = (P2 - P1) / (numpy.linalg.norm(P2 - P1))
    i = numpy.dot(ex, P3 - P1)
    ey = (P3 - P1 - i * ex) / (numpy.linalg.norm(P3 - P1 - i * ex))
    # ez = numpy.cross(ex,ey)
    d = numpy.linalg.norm(P2 - P1)
    j = numpy.dot(ey, P3 - P1)

    # from wikipedia
    # plug and chug using above values
    x = (pow(beacon[0]['CalculatedDistance'], 2) - pow(beacon[1]['CalculatedDistance'], 2) + pow(d, 2)) / (2 * d)
    y = ((pow(beacon[0]['CalculatedDistance'], 2) - pow(beacon[2]['CalculatedDistance'], 2) + pow(i, 2) + pow(j, 2)) / (
        2 * j)) - ((i / j) * x)

    # only one case shown here
    # z = numpy.sqrt(pow(beacon[0]['CalculatedDistance'],2) - pow(x,2) - pow(y,2))

    # triPt is an array with ECEF x,y,z of trilateration point
    triPt = P1 + x * ex + y * ey  # + z*ez
    print "Coordinate", triPt
    position = {'CoordinateStimate': {'pos_X': triPt[0], 'pos_Y': triPt[1]}}

    # print "Coordinate stimate", x_s, y_s

    return position
    """
    S = ((x3 ** 2.) - (x2 ** 2.) + (y3 ** 2.) - (y2 ** 2.) + (beacon[1]['CalculatedDistance'] ** 2.) -
         (beacon[2]['CalculatedDistance'] ** 2.)) / 2.0
    T = ((x1 ** 2.) - (x2 ** 2.) + (y1 ** 2.) - (y2 ** 2.) + (beacon[1]['CalculatedDistance'] ** 2.) -
         (beacon[0]['CalculatedDistance'] ** 2.)) / 2.0
    y_s = ((T * (x2 - x3)) - (S * (x2 - x1))) / (((y1 - y2) * (x2 - x3)) - ((y3 - y2) * (x2 - x1)))
    x_s = ((y_s * (y1 - y2)) - T) / (x2 - x1)
    ""

    """


def calculate_position_min_max_path_loss_box(beacon_json):
    data = json.loads(beacon_json)

    l = []
    r = []
    t = []
    b = []
    for beacon in data:
        serializer = TrackingBeaconSerializers(data=beacon)
        if serializer.is_valid():
            print "Sto salvando"
            serializer.save()



        parameter = ParameterBeacon.objects.filter(idSensor=beacon['Maj'])
        serializer = ParameterBeaconSerializers(parameter, many=True)
        valueRSSI = TrackingBeacon.objects.filter(Maj=beacon['Maj']).order_by('-created')[:40].aggregate(Avg('RSSI'))
        print "Cosa ritorna", valueRSSI['RSSI__avg']
        # serializerRSSI = TrackingBeaconSerializers(valueRSSI, many=True)
        # valueDBRSSI=json.loads(json.dumps(serializerRSSI.data))
        value = json.loads(json.dumps(serializer.data))
        #
        print "RSSI0", value[0]["Xg"]

        x = value[0]['pos_XM']
        # print "dict['Name']: ", dict[index]['pos_X']
        y = value[0]['pos_YM']
        print "RSSI0 " + str(value[0]["RSSI0Box"]) + " RSSI " + str(beacon['RSSI'])
        indice = ((value[0]["RSSI0Box"] - int(valueRSSI['RSSI__avg'])) / value[0]["coff"])
        d = 10 ** indice
        # del medie[0]
        # medie.append(d)
        print "La distanza da " + beacon["Maj"] + " e' in metri " + str(d)

        # print "anchor", beacon['CalculatedDistance']
        # l.append((x - beacon['CalculatedDistance']))
        # r.append((x + beacon['CalculatedDistance']))
        # t.append((y + beacon['CalculatedDistance']))
        # b.append((y - beacon['CalculatedDistance']))
        l.append((x - d))
        r.append((x + d))
        t.append((y + d))
        b.append((y - d))
        # print "Distanza calcolata", (x - beacon['CalculatedDistance'])
        # l.append((x - beacon['CalculatedDistance']))
        # r.append((x + beacon['CalculatedDistance']))
        # t.append((y + beacon['CalculatedDistance']))
        # b.append((y - beacon['CalculatedDistance']))
    """print "Maj ", data[1]['Maj']
    print "RSSI ", data[1]['RSSI']
    print "RSSI calculated distance", data[1]['CalculatedDistance']

    if (data[1]['Maj']) == '4669':
        f = open("beacon.txt", 'a')
        f.write("Maj " + data[1]['Maj'] + "\n")
        f.write("RSSI " + data[1]['RSSI'] + "\n")
        f.write("RSSI calculated distance " + str(data[1]['CalculatedDistance']) + "\n")
        f.write("---------------------" + "\n")
        f.close()
    """
    x_s = (max(l) + min(r)) / 2
    y_s = (min(t) + max(b)) / 2

    position = {'CoordinateStimate': {'pos_X': x_s, 'pos_Y': y_s}}
    print "Coordinate stimate", x_s, y_s
    # print "Vertice l", l
    return position


def calculate_position_min_max_path_loss(beacon_json):
    data = json.loads(beacon_json)

    l = []
    r = []
    t = []
    b = []
    for beacon in data:
        index = str(beacon['Maj'])

        serializer = TrackingBeaconSerializers(data=beacon)
        if serializer.is_valid():
            print "Sto salvando"
            serializer.save()



        parameter = ParameterBeacon.objects.filter(idSensor=beacon['Maj'])
        serializer = ParameterBeaconSerializers(parameter, many=True)
        valueRSSI = TrackingBeacon.objects.filter(Maj=beacon['Maj']).order_by('-created')[:20].aggregate(Avg('RSSI'))
        print "Cosa ritorna", valueRSSI['RSSI__avg']
        value = json.loads(json.dumps(serializer.data))

        print "RSSI0", value[0]["Xg"]

        x = value[0]['pos_XM']

        y = value[0]['pos_YM']
        print "RSSI0 " + str(value[0]["RSSI0"]) + " RSSI " + str(beacon['RSSI'])
        indice = (value[0]["RSSI0"] - valueRSSI['RSSI__avg'] - (value[0]["Xg"])) / (10 * (value[0]["n"]))
        d = 10 ** indice

        print "La distanza da " + beacon["Maj"] + " e' in metri " + str(d)


        l.append((x - d))
        r.append((x + d))
        t.append((y + d))
        b.append((y - d))

    x_s = (max(l) + min(r)) / 2
    y_s = (min(t) + max(b)) / 2
    #f = open("coordinate_stimate_min_max_path_loss.csv", 'a')
    #f.write(str(x_s) + "," + str(y_s) + "\n")
    #f.close()
    position = {'CoordinateStimate': {'pos_X': x_s, 'pos_Y': y_s}}
    print "Coordinate stimate", x_s, y_s

    return position


@api_view(['GET', 'POST'])
def download_file(request, filename):
    print "Percorso ", smart_str('/media/' + filename)
    if not os.path.isfile(smart_str('/media/' + filename)):
        return JSONResponse("File Not Found", status=404)

    if request.method == 'GET':
        fp = open(smart_str('/media/' + filename), 'rb')
        response = HttpResponse(fp.read(), content_type='application/force-download')
        fp.close()
        response['Content-Disposition'] = 'attachment; filename=%s' % smart_str(filename)

        response.write(smart_str('/media/' + filename))
        # It's usually a good idea to set the 'Content-Length' header too.
        # You can also set any other required headers: Cache-Control, etc.
        return response


@api_view(['GET', 'POST'])
def download_map(request, filename):
    print "Percorso ", smart_str('/media/map/' + filename)
    if not os.path.isfile(smart_str('/media/map/' + filename)):
        return JSONResponse("File Not Found", status=404)

    if request.method == 'GET':
        fp = open(smart_str('/media/map/' + filename), 'rb')
        response = HttpResponse(fp.read(), content_type='application/force-download')
        fp.close()
        response['Content-Disposition'] = 'attachment; filename=%s' % smart_str(filename)
        response.write(smart_str('/media/map/' + filename))

        return response
