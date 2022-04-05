#!/usr/bin/python

import re
path = "../web/atlas.json"
pattern = re.compile(r'\[(.+?)\]\((.+?)\)')

with open(path, "r+") as f1:
  contents = f1.read()

for match in pattern.finditer(contents):
  if match.group(1) == match.group(2):
    contents = contents.replace(match.group(0), match.group(2), 1)

for match in pattern.finditer(contents):
  if match.group(1) == match.group(2):
    contents = contents.replace(match.group(0), match.group(2), 1)

with open(path, "w") as f2:
  f2.write(contents)
