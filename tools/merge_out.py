import json
import os
from aformatter import format_all_entries, per_line_entries
import traceback
import scale_back
from scale_back import ScaleConfig

out_ids = []
atlas_ids = {}
authors = []

with open('../web/all-authors.txt', 'r', encoding='utf-8') as authors_file:
	authors = authors_file.read().strip().split()

with open('../data/read-ids.txt', 'r', encoding='utf-8') as ids_file:
	out_ids = ids_file.read().strip().split()

with open('../web/atlas.json', 'r', encoding='utf-8') as atlas_file:
	atlas_data = json.loads(atlas_file.read())

last_id = 0

for i, entry in enumerate(atlas_data):
	atlas_ids[entry['id']] = i
	id = entry['id']
	if id.isnumeric() and int(id) > last_id and int(id) - last_id < 100:
		last_id = int(id)

patches_dir = "../data/patches/"
permanent_patch_file = "temp-atlas.json"
if not os.path.exists(patches_dir):
	print("Patches folder not found. Exiting.")
	exit()

base_image_path = os.path.join('..', 'web', '_img', 'canvas', 'place30')
ScaleConfig.image1 = os.path.join(base_image_path, '159.png')

filenames = os.listdir(patches_dir)
filenames.append(permanent_patch_file)

for filename in filenames:
	is_permanent_file = filename == permanent_patch_file
	if is_permanent_file:
		f = filename
	else:
		f = os.path.join(patches_dir, filename)

	print(f"{filename}: Processing...")
	
	if not os.path.isfile(f) or not f.endswith('json'):
		continue

	try:
		with open(f, 'r', encoding='utf-8') as entry_file:
			entries = json.loads(entry_file.read())
			if not isinstance(entries, list):
				entries = [entries]

			format_all_entries(entries)

			scale_back.swap_source_dest('164', '165', os.path.join(base_image_path, '163_159.png'))
			scale_back.scale_back_entries(entries)
			scale_back.swap_source_dest('165', '166', os.path.join(base_image_path, '164_159.png'))
			scale_back.scale_back_entries(entries)
			scale_back.swap_source_dest('166', '167', os.path.join(base_image_path, '165_159.png'))
			scale_back.scale_back_entries(entries)
			
			for entry in entries:
				if '_reddit_id' in entry:
					reddit_id = entry['_reddit_id']
					if reddit_id in out_ids:
						print(f"{filename}: Submission from {entry['id']} has been included! This will be ignored from the merge.")
						continue
					out_ids.append(reddit_id)
					del entry['_reddit_id']

				# This wouldn't work if it is an edit.
				# If needed, we can add a type to the patch to be more foolproof.
				# if entry['id'] in out_ids:
				# 	print(f"{filename}: Submission from {entry['id']} has been included! This will be ignored from the merge.")
				# 	continue

				if '_author' in entry:
					author = entry['_author']
					if author not in authors:
						authors.append(author)
					del entry['_author']

				if isinstance(entry['id'], int) and entry['id'] < 1 or entry['id'] == '0':
					last_id += 1
					print(f"{filename}: Entry is new, assigned ID {last_id}")
					entry['id'] = str(last_id)
				elif isinstance(entry['id'], int):
					entry['id'] = str(entry['id'])
				elif not is_permanent_file and entry['id'] not in out_ids:
					out_ids.append(entry['id'])

				if entry['id'] in atlas_ids:
					index = atlas_ids[entry['id']]
					print(f"{filename}: Edited {atlas_data[index]['id']}.")
					atlas_data[index] = entry
				else:
					print(f"{filename}: Added {entry['id']}.")
					atlas_data.append(entry)

			if not is_permanent_file:
				os.remove(f)

	except:
		print(f"{filename}: Something went wrong; patch couldn't be implemented. Skipping.")
		traceback.print_exc()

print('Writing...')
with open('../web/atlas.json', 'w', encoding='utf-8') as atlas_file:
	per_line_entries(atlas_data, atlas_file)

with open('../data/read-ids.txt', 'w', encoding='utf-8') as ids_file:
	ids_file.write("\n".join(out_ids) + "\n")

with open('../web/all-authors.txt', 'w', encoding='utf-8') as authors_file:
	authors_file.write("\n".join(authors) + "\n")

print('All done.')