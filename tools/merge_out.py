import praw
import json
import time
import re
import os
import traceback
from formatter import format_all, per_line_entries

out_ids = []
out_dupe_ids = []
out_edited_added_ids = []
atlas_ids = []

with open('temp_atlas.json', 'r', encoding='utf-8') as out_file:
	out_json = json.loads(out_file.read())

with open('../web/atlas.json', 'r', encoding='utf-8') as atlas_file:
	atlas_json = json.loads(atlas_file.read())

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
			out_edited_added_ids.append(entry['edit'])
			del entry['edit']
		if 'submitted_by' in atlas_json[index]:
			atlas_json[index].contributors = [ atlas_json[index]['submitted_by'] ]
		entry['contributors'] = atlas_json[index]['contributors'] + list(set(entry['contributors']) - set(atlas_json[index]['contributors']))
		atlas_json[index] = entry
	else:
		atlas_json.append(entry)

print('Writing...')
with open('../web/atlas.json', 'w', encoding='utf-8') as atlas_file:
	atlas_file.write(per_line_entries(atlas_json))

with open('../data/edit-ids.txt', 'a', encoding='utf-8') as edit_ids_file:
	edit_ids_file.write('\n'.join(out_edited_added_ids) + '\n')

print('All done.')