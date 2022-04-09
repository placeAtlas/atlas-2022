import praw
import json
import time
import re
import os
import traceback
from formatter import format_all, per_line_entries

out_ids = []
out_dupe_ids = []
atlas_ids = []

with open('temp_atlas.json', 'r', encoding='utf-8') as out_file:
	out_json = json.loads(out_file)

with open('../atlas.json', 'r', encoding='utf-8') as atlas_file:
	atlas_json = json.loads(atlas_file)

for entry in atlas_json:
	atlas_ids.append(entry['id'])

for entry in out_json:
	if (entry['id'] in out_ids):
		print(f"Entry {entry['id']} has duplicates! Please resolve this conflict. This will be excluded from the merge.")
		out_dupe_ids.append(entry['id'])
	out_ids.append(entry['id'])
	
for entry in out_json:
	if entry['id'] in out_dupe_ids:
		continue

	if ('edit' in entry and entry['edit']) or entry['id'] in out_ids:
		index = next((i for i, item in enumerate(atlas_json) if item["id"] == entry['id']), None)
		if 'edit' in entry: 
			del entry['edit']
		atlas_json[index] = entry
	else:
		atlas_json.append(entry)

with open('../atlas.json', 'w', encoding='utf-8') as atlas_file:
	atlas_file.write(per_line_entries(atlas_json))