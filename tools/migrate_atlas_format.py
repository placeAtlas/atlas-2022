import os
import json

# Migrates the old atlas format (single center/path) to the remastered atlas format (time-boxed centers/paths)

def per_line_entries(entries: list):
  out = '[\n'
  for entry in entries:
    out += json.dumps(entry, ensure_ascii=False) + ',\n'
  return out[:-2] + '\n]'

file_path = os.path.join('..', 'web', 'atlas.json')

end_image = 167
init_canvas_range = (1, end_image)
expansion_1_range = (56, end_image)
expansion_2_range = (109, end_image)

with open(file_path, 'r+', encoding='UTF-8') as file:
  entries = json.loads(file.read())
  
for entry in entries:
  center = entry['center']
  if isinstance(center, list):
    path = entry['path']
    
    # Use the center to figure out which canvas expansion the entry is in.
    if center[1] > 1000:
      time_range = expansion_2_range
    elif center[0] > 1000:
      time_range = expansion_1_range
    else:
      time_range = init_canvas_range
    
    time_key = '%d-%d, T:0-2' % time_range
    entry['center'] = {
      time_key: center
    }
    entry['path'] = {
      time_key: path
    }

with open(file_path, 'w', encoding='utf-8', newline='\n') as f2:
  f2.write(per_line_entries(entries))
