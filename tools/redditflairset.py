# Script to retroactively fix flairs
# Only touches things flaired "New entry" that either fail JSON parsing or are already in the atlas
# Otherwise, it leaves them untouched

import praw
import json
import time
import re
import os

credentials = open('credentials', 'r')
client_id = credentials.readline().strip(' \t\n\r')
client_secret = credentials.readline().strip(' \t\n\r')
user = credentials.readline().strip(' \t\n\r')
pw = credentials.readline().strip(' \t\n\r')

reddit = praw.Reddit(client_id=client_id, client_secret=client_secret, user_agent='atlas_bot',username=user,password=pw)
has_write_access = not reddit.read_only
if not has_write_access:
	print("No write access, exiting without doing anything")
	quit()

jsonfile = open("../web/atlas.json", "r", encoding='utf-8')
existing = json.load(jsonfile)

existing_ids = []

for item in existing:
	existing_ids.append(item['id'])

def set_flair(submission, flair):
	if has_write_access and submission.link_flair_text != flair:
		print(submission.link_flair_text)
		print(submission.id)
		print(flair)
		flair_choices = submission.flair.choices()
		flair = next(x for x in flair_choices if x["flair_text_editable"] and flair == x["flair_text"])
		submission.flair.select(flair["flair_template_id"])
		return 1
	return 0

total_all_flairs = 0
rejected_count = 0
processed_count = 0
#for submission in reddit.subreddit('placeAtlas2').new(limit=1000):
#for submission in reddit.subreddit('placeAtlas2').search('flair:"New Entry"',limit=1000,syntax='lucene', sort="top"):
#for submission in reddit.subreddit('placeAtlas2').search('flair:"New Entry"',limit=1000,syntax='lucene', sort="comments"):
#for submission in reddit.subreddit('placeAtlas2').search('flair:"New Entry"',limit=1000,syntax='lucene', sort="hot"):
#for submission in reddit.subreddit('placeAtlas2').search('flair:"New Entry"',limit=1000,syntax='lucene', sort="new"):
#for submission in reddit.subreddit('placeAtlas2').search('flair:"New Entry"',limit=1000,syntax='lucene', sort="relevance"):
	"""
	Auth setup
	1. Head to https://www.reddit.com/prefs/apps
	2. Click "create another app"
	3. Give it a name and description
	4. Select "script"
	5. Redirect to http://localhost:8080
	6. Copy ID (under Personal Use Script)
	7. Append to file called "credentials"
	8. Copy Secret 
	9. Append on newline to "credentials" file
	10-. Append 2 newlines with username and password if you want flair write access
	11. Run Script

	Running Script
	1. Input the next ID to use
	2. Manually resolve errors in manual_atlas.json
	3. Copy temp_atlas.json entries into web/_js/atlas.js
	4. Pull Request

	"""
	total_all_flairs += 1
	if (submission.id in existing_ids):
		processed_count += set_flair(submission, "Processed Entry")
		continue
	if(submission.link_flair_text == "New Entry"):
		text = submission.selftext
		#Old backslash filter:
		#text = text.replace("\\", "")
		#New one: One \\ escapes a backslash in python's parser
		# Two escape it again in the regex parser, so \\\\ is \
		# Then anything but " or n is replaced with the first capture group (anything but " or n)
		# Test in repl: re.sub("\\\\([^\"n])", "\\1", "\\t < removed slash, t stays and > stays \\n \\\"")
		text = re.sub("\\\\([^\"n])", "\\1", text)
		try:
			text = text.replace("\"id\": 0,", "\"id\": 0,\n\t\t\"submitted_by\": \""+submission.author.name+"\",")
		except AttributeError:
			text = text.replace("\"id\": 0,", "\"id\": 0,\n\t\t\"submitted_by\": \""+"unknown"+"\",")

		lines = text.split("\n")

		for i, line in enumerate(lines):
			if("\"id\": 0" in line):
				lines[i] = line.replace("\"id\": 0", "\"id\": "+"\""+str(submission.id)+"\"")
		text = "\n".join(lines)
		try:
			json.dumps(json.loads(text))
			# Do not set processed, we're only updating old entries in atlas or invalid submission flairs and not processing
		except json.JSONDecodeError:
			rejected_count += set_flair(submission, "Rejected Entry")

print(f"\n\nTotal all flairs:{total_all_flairs}\nUpdated as rejected: {rejected_count}/{total_all_flairs}\nUpdated as processed: {processed_count}/{total_all_flairs}\n")
