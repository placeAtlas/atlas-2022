from fix_json import *
import os

# Used to run the JSON fixer by itself.

atlasPath = os.path.join('..', 'web', 'atlas.json')

fixJson(atlasPath)