#!/usr/bin/python

import sys
import json 

path = "./../web/atlas.json"

# path override as 1st param: validate_json.py path_to_file.json
if (len(sys.argv) > 1):
    path = sys.argv[1]

json.load(open(path))

print("JSON is valid")