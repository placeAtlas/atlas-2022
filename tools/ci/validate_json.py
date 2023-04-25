#!/usr/bin/python

import sys
import json 
from jsonschema import validate

atlasPath = "./../../web/atlas.json"

# path override as 1st param: validate_json.py path_to_file.json
if (len(sys.argv) > 1):
    atlasPath = sys.argv[1]

schemaPath = "./../atlas.schema.json"

# schema override as 2nd param: validate_json.py [...] path_to_schema.json
if (len(sys.argv) > 2):
    schemaPath = sys.argv[2]

atlas = json.load(open(atlasPath, "r", encoding='utf-8'))
schema = json.load(open(schemaPath, "r", encoding='utf-8'))

validate(atlas, schema)

print("JSON is valid")