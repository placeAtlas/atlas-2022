#!/usr/bin/python

import json
from formatter import collapse_links, per_line_entries

def go(path):

  print(f"Formatting {path}...")

  with open(path, "r+", encoding='UTF-8') as f1:
    entries = json.loads(f1.read())

  for i in range(len(entries)):
    entries[i] = collapse_links(entries[i])
    if not (i % 500):
      print(f"{i} checked.")

  print(f"{len(entries)} checked.")

  with open(path, "w", encoding='UTF-8') as f2:
    f2.write(per_line_entries(entries))

  print("Writing completed. All done.")

go("../web/atlas.json")
go("../web/atlas-before-ids-migration.json")