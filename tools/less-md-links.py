#!/usr/bin/python

import re
pattern = re.compile(r'\[(.+?)\]\((.+?)\)')

def go(path):

  with open(path, "r+", encoding='UTF-8') as f1:
    contents = f1.read()

  for match in pattern.finditer(contents):
    if match.group(1) == match.group(2):
      contents = contents.replace(match.group(0), match.group(2), 1)

  for match in pattern.finditer(contents):
    if match.group(1) == match.group(2):
      contents = contents.replace(match.group(0), match.group(2), 1)

  with open(path, "w", encoding='UTF-8') as f2:
    f2.write(contents)

go("../web/atlas.json")
go("../web/atlas-before-ids-migration.json")