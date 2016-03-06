import requests
import json

headers = {'content-type': 'application/json'}
url = 'http://127.0.0.1:8000/map/spin1'

data = {"idMappa": "spin1", "Title": "Doc1", "Type": "doc", "url": "/media/xxx.pdf", "Comment": "Bello pdf",
        "pos_X": 76, "pos_Y": 132, "pos_Z": 0}
params = {}
requests.post(url, params=params, data=json.dumps(data), headers=headers)
