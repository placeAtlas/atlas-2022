#!/usr/bin/python

import sys
import json 

path = "./../docs/atlas.json"

# path override as 1st param: validate_json.py path_to_file.json
if (len(sys.argv) > 1):
    path = sys.argv[1]

json.load(open(path, "r", encoding='utf-8'))

print("JSON is valid")