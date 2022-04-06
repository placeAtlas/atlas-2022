#!/usr/bin/python

import re
pattern1 = re.compile(r'"subreddit": "\/r\/(.+?)/?"')
pattern2 = re.compile(r'"subreddit": "r\/(.+?)/?"')
pattern3 = re.compile(r'"subreddit": "\/?r(?!\/)(.+?)/?"')
pattern4 = re.compile(r'"subreddit": "(?:(?:https:\/\/)?www.)?reddit.com\/r\/(.+?)(/[^"]*)*"')
pattern5 = re.compile(r'"subreddit": "\[(?:(?:https:\/\/)?www.)?reddit.com\/r\/(.+?)(/[^"]*)*\]\((?:(?:https:\/\/)?www.)?reddit.com\/r\/(.+?)(/[^"]*)*\)"')

def go(path):

	with open(path, "r+", encoding='UTF-8') as f1:
		contents = f1.read()

	for match in pattern5.finditer(contents):
		contents = contents.replace(match.group(0), '"subreddit": "r/' + match.group(2) + '"', 1)

	for match in pattern4.finditer(contents):
		contents = contents.replace(match.group(0), '"subreddit": "r/' + match.group(1) + '"', 1)

	for match in pattern1.finditer(contents):
		contents = contents.replace(match.group(0), '"subreddit": "r/' + match.group(1) + '"', 1)

	for match in pattern2.finditer(contents):
		contents = contents.replace(match.group(0), '"subreddit": "r/' + match.group(1) + '"', 1)

	for match in pattern3.finditer(contents):
		contents = contents.replace(match.group(0), '"subreddit": "r/' + match.group(1) + '"', 1)

	# # r/... to /r/.. (comment if not needed)
	for match in pattern2.finditer(contents):
		contents = contents.replace(match.group(0), '"subreddit": "/r/' + match.group(1) + '"', 1)

	with open(path, "w", encoding='UTF-8') as f2:
		f2.write(contents)

go("../web/atlas.json")
go("../web/atlas-before-ids-migration.json")