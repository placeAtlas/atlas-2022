#!/usr/bin/python

import re

patternParent = re.compile(r'"subreddit": ?"(?!")(.+?)"')
patternCommatization = re.compile(r',* +')
pattern1 = re.compile(r'\/?[rR]\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/$)?')
pattern2 = re.compile(r'^\/?[rR](?!\/)([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/$)?')
pattern3 = re.compile(r'(?:(?:https?:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com\/r\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/[^" ]*)*')
pattern4 = re.compile(r'\[[A-Za-z0-9][A-Za-z0-9_]{1,20}\]\((?:(?:https:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com\/r\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/[^" ]*)*\)')
# pattern5 = re.compile(r'(?:https?:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*')
# pattern6 = re.compile(r'\[(?:https?:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*\]\((?:https:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*\)"')
"""
Examples:
1. - /r/place
   - r/place
2. /rplace
3. - https://www.reddit.com/r/place
   - www.reddit.com/r/place
   - reddit.com/r/place
4. - [https://www.reddit.com/r/place](https://www.reddit.com/r/place)
   - [www.reddit.com/r/place](www.reddit.com/r/place)
   - [reddit.com/r/place](reddit.com/r/place)
UNUSED AND FAULTY
5. - https://place.reddit.com
   - place.reddit.com
6. - [https://place.reddit.com](https://place.reddit.com)
   - [place.reddit.com](https://place.reddit.com)
"""

def replaceStage1(contents: str):
	contents = re.sub(patternCommatization, ', ', contents)

	# r/... to /r/.. (change if not needed)
	template = r"/r/\1"
	contents = re.sub(pattern4, template, contents)
	contents = re.sub(pattern3, template, contents)
	contents = re.sub(pattern1, template, contents)
	contents = re.sub(pattern2, template, contents)
	return contents

def go(path):

	print(f"Fixing {path}...")

	with open(path, "r+", encoding='UTF-8') as f1:
		contents = f1.read()

	# Convert to r/... format first.
	for matchParent in patternParent.finditer(contents):
		subredditLink = matchParent.group(1)
		subredditLink = replaceStage1(subredditLink)
		if not subredditLink:
			continue
		if path == "../web/atlas-before-ids-migration.json":
			contents = contents.replace(matchParent.group(0), '"subreddit":"' + subredditLink + '"', 1)
		else:
			contents = contents.replace(matchParent.group(0), '"subreddit": "' + subredditLink + '"', 1)

	with open(path, "w", encoding='UTF-8') as f2:
		f2.write(contents)
	print("Writing completed. All done.")

go("../web/atlas.json")
go("../web/atlas-before-ids-migration.json")