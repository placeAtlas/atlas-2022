#!/usr/bin/python

import re

def go(path):

  print(f"Fixing {path}...")

  with open(path, "r+", encoding='UTF-8') as f1:
    contents = f1.read()

  contents = re.sub(r'": "(\s+)', r'": "', contents)
  contents = re.sub(r'(\s+)"(, |,|\})', r'"\2', contents)
  print("Leading and trailing spaces removed.")

  contents = re.sub(r' {2,}', r' ', contents)
  print("Double spaces removed.")

  contents = re.sub(r',{2,}', r',', contents)
  print("Double commas removed.")

  contents = re.sub(r'"n/a"', '""', contents)
  contents = re.sub(r'"N/A"', '""', contents)
  contents = re.sub(r'"-"', '""', contents)
  contents = re.sub(r'"none"', '""', contents)
  contents = re.sub(r'"null"', '""', contents)
  print("Psuedo-empty strings converted into empty strings.")

  contents = re.sub(r'R\/', 'r/', contents)
  print("Capitalization of r/ has been fixed.")

  with open(path, "w", encoding='UTF-8') as f2:
    f2.write(contents)
  print("Writing completed. All done.")

go("../web/atlas.json")
go("../web/atlas-before-ids-migration.json")