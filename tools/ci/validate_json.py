#!/usr/bin/python

import sys
import json 
from jsonschema import validate, RefResolver
from pathlib import Path, PurePosixPath
import os

if len(sys.argv) == 1:
	while not os.path.exists('README.md'):
		os.chdir('..')

instance_path = "web/atlas.json"

# path override as 1st param: validate_json.py path_to_file.json
if len(sys.argv) > 1:
	instance_path = sys.argv[1]

schema_path = "tools/schema/atlas.json"

# schema override as 2nd param: validate_json.py [...] path_to_schema.json
if len(sys.argv) > 2:
	schema_path = sys.argv[2]

relative_path = "file:" + str(PurePosixPath(Path(os.getcwd(), schema_path)))

schema = json.load(open(schema_path, "r", encoding='utf-8'))
# exit()

resolver = RefResolver(relative_path, schema)
if os.path.isdir(instance_path):
	for filename in os.listdir(instance_path):
		f = os.path.join(instance_path, filename)
		print(f)

		instance = json.load(open(f, "r", encoding='utf-8'))
		validate(instance, schema, resolver=resolver)
elif os.path.isfile(instance_path):
	print(instance_path)
	instance = json.load(open(instance_path, "r", encoding='utf-8'))
	validate(instance, schema, resolver=resolver)

print("JSON is valid")