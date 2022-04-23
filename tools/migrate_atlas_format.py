import os
import json
import re

'''
Migrator script from old atlas format to remastered atlas format.
- center and path: single -> time-specific
- website and subreddit: single strings -> links object
- submitted_by -> contributors
'''
# 

# Migrates the old atlas format (single center/path) to the remastered atlas format (time-boxed centers/paths)

def per_line_entries(entries: list):
  out = '[\n'
  for entry in entries:
    out += json.dumps(entry, ensure_ascii=False) + ',\n'
  return out[:-2] + '\n]'

file_path = os.path.join('..', 'web', 'atlas.json')

END_IMAGE = 166
INIT_CANVAS_RANGE = (1, END_IMAGE)
EXPANSION_1_RANGE = (56, END_IMAGE)
EXPANSION_2_RANGE = (109, END_IMAGE)

COMMATIZATION =  re.compile(r'(?: *(?:,+ +|,+ |,+)| +)(?:and|&|;)(?: *(?:,+ +|,+ |,+)| +)|, *$| +')
FS_REGEX = re.compile(r'(?:(?:(?:(?:https?:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com)?\/)?[rR]\/([A-Za-z0-9][A-Za-z0-9_]{2,20})(?:\/[^" ]*)*')

with open(file_path, 'r+', encoding='UTF-8') as file:
  entries = json.loads(file.read())

index = 0

for entry in entries:
  new_entry = {
    "id": "",
    "name": "",
    "description": "",
    "links": {},
    "center": {},
    "path": {},
    "contributors": []
  }

  center = entry['center']
  path = entry['path']

  if isinstance(center, list):
    
    # Use the center to figure out which canvas expansion the entry is in.
    if center[1] > 1000:
      time_range = EXPANSION_2_RANGE
    elif center[0] > 1000:
      time_range = EXPANSION_1_RANGE
    else:
      time_range = INIT_CANVAS_RANGE

    time_key = '%d-%d, T:0' % time_range

    new_entry = {
      **new_entry,
      "center": {
        time_key: center
      },
      "path": {
        time_key: path
      }
    }

    del entry['center']
    del entry['path']

  if "website" in entry:
    if isinstance(entry["website"], str) and entry["website"]:
      new_entry['links']['website'] = [entry['website']]
    del entry['website']

  if "subreddit" in entry:
    if isinstance(entry["subreddit"], str) and entry["subreddit"]:
      new_entry['links']['subreddit'] = list(map(lambda x: FS_REGEX.sub(r"\1", x), COMMATIZATION.split(entry['subreddit'])))
    del entry['subreddit']

  if "submitted_by" in entry:
    new_entry['contributors'].append(entry['submitted_by'])
    del entry['submitted_by']
  
  entries[index] = {
    **new_entry,
    **entry
  }

  index += 1

  if not (index % 1000):
    print(f"{index} checked.")

print(f"{len(entries)} checked.")
print("Writing...")

with open(file_path, 'w', encoding='utf-8', newline='\n') as f2:
  f2.write(per_line_entries(entries))

print("All done!")