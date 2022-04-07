
import praw
import json
import time
import os
from formatter import format_all
import traceback
import re

outfile = open('temp_atlas.json', 'w', encoding='utf-8')
failfile = open('manual_atlas.json', 'w', encoding='utf-8')

credentials = open('credentials', 'r')
client_id = credentials.readline().strip(' \t\n\r')
client_secret = credentials.readline().strip(' \t\n\r')

reddit = praw.Reddit(client_id=client_id, client_secret=client_secret, user_agent='atlas_bot')

failcount = 0
successcount = 0
totalcount = 0

jsonfile = open("../web/atlas.json", "r", encoding='utf-8')
existing = json.load(jsonfile)

existing_ids = []

for item in existing:
	existing_ids.append(item['id'])

total_all_flairs = 0
duplicate_count = 0
outfile.write("[\n")
for submission in reddit.subreddit('placeAtlas2').new(limit=2000):
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
	10. Run Script

	Running Script
	1. Input the next ID to use
	2. Manually resolve errors in manual_atlas.json
	3. Copy temp_atlas.json entries into web/_js/atlas.js
	4. Pull Request

	"""
	total_all_flairs += 1

	if (submission.id in existing_ids):
		print("Found first duplicate!")
		duplicate_count += 1
		if (duplicate_count > 10):
			break
		else:
			continue

	if(submission.link_flair_text == "New Entry"):

		try:

			text = submission.selftext
			rawtext = text

			text = text.replace("\\", "")
			text = re.compile(r".*(\{.+\}).*", re.DOTALL).search(text).group(1)

			submission_json = json.loads(text)

			if submission_json:

				# Assert if path does not empty
				assert len(submission_json["path"]) > 0

				submission_json_dummy = {"id": submission.id, "submitted_by": ""}
				try:
					submission_json_dummy["submitted_by"] = submission.author.name
				except AttributeError:
					submission_json_dummy["submitted_by"] = "unknown"
				for key in submission_json:
					if not key in submission_json_dummy:
						submission_json_dummy[key] = submission_json[key];
				submission_json = format_all(submission_json_dummy)

				outfile.write(json.dumps(submission_json) + ",\n")
				successcount += 1

		except Exception as e:
			failfile.write(
				"\n\n" + "="*40 + "\n\n" +
				submission.id + "\n\n" +
				traceback.format_exc() + "\n\n" +
				rawtext
			)
			failcount += 1

		print("written "+submission.id+", submitted "+str(round(time.time()-submission.created_utc))+" seconds ago")
		totalcount += 1

# Remove ,\n
outfile.seek(outfile.tell()-4, os.SEEK_SET)
outfile.truncate()

outfile.write("\n]")

print(f"\n\nTotal all flairs:{total_all_flairs}\nSuccess: {successcount}/{totalcount}\nFail: {failcount}/{totalcount}\nPlease check manual_atlas.txt for failed entries to manually resolve.")
