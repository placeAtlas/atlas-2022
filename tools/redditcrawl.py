import praw
import json
import time
import re
import os
import traceback
from formatter import format_all

outfile = open('temp_atlas.json', 'w', encoding='utf-8')
editidsfile = open('read-ids-temp.txt', 'w')
failfile = open('manual_atlas.json', 'w', encoding='utf-8')

with open('credentials', 'r') as file:
	credentials = file.readlines()
	client_id = credentials[0].strip()
	client_secret = credentials[1].strip()
	username = credentials[2].strip() if len(credentials) > 3 else ""
	password = credentials[3].strip() if len(credentials) > 3 else ""

reddit = praw.Reddit(
	client_id=client_id, 
	client_secret=client_secret,
	username=username,
	password=password,
	user_agent='atlas_bot'
)

has_write_access = not reddit.read_only
if not has_write_access:
	print("Warning: No write access. Post flairs will not be updated.")
	time.sleep(5)

existing_ids = []

with open('../data/edit-ids.txt', 'r') as edit_ids_file:
	for id in [x.strip() for x in edit_ids_file.readlines()]:
		existing_ids.append(id)

with open('../data/edit-ids.txt', 'r') as edit_ids_file:
	for id in [x.strip() for x in edit_ids_file.readlines()]:
		existing_ids.append(id)


def set_flair(submission, flair):
	if has_write_access and submission.link_flair_text != flair:
		flair_choices = submission.flair.choices()
		flair = next(x for x in flair_choices if x["flair_text_editable"] and flair == x["flair_text"])
		submission.flair.select(flair["flair_template_id"])

total_all_flairs = 0
duplicate_count = 0
failcount = 0
successcount = 0
totalcount = 0

outfile.write("[\n")
for submission in reddit.subreddit('placeAtlas2').new(limit=2000):
	"""
	Auth setup
	1. Head to https://www.reddit.com/prefs/apps
	2. Click "create another app"
	3. Give it a name and description
	4. Select "script"
	5. Redirect to http://localhost:8080
	6. Create file "credentials" with the format below.
	┌─────────────────────────────────────────────────────┐
	│ [ID]        <-  Under "personal use script"         │
	│ [Secret]                                            │
	│ [Username]  <-  Must be a mod, don't do this if you │
	│ [Password]  <-  don't know what you are doing.      │
	└─────────────────────────────────────────────────────┘
	7. Run Script

	Running Script
	1. Input the next ID to use
	2. Manually resolve errors in manual_atlas.json
	3. Copy temp_atlas.json entries into web/_js/atlas.js
	4. Pull Request

	"""
	total_all_flairs += 1

	if (submission.id in existing_ids):
		set_flair(submission, "Processed Entry")
		print("Found first duplicate!")
		duplicate_count += 1
		if (duplicate_count > 0):
			break
		else:
			continue

	if (submission.link_flair_text == "New Entry"):

		try:

			text = submission.selftext
			rawtext = text

			text = text.replace('\u200c', '')
			text = re.compile(r".*(\{.+\}).*", re.DOTALL).search(text).group(1)
			# Test if it needs to escape the escape character. Usually happens on fancy mode.
			try: json.loads(text)
			except json.JSONDecodeError: text = re.sub(r"\\(.)", r"\1", text)

			submission_json = json.loads(text)

			if submission_json:

				submission_json_dummy = {"id": submission.id, "edit": True, "contributors": []}

				if (submission_json.id != 0):
					submission_json_dummy["id"] = submission_json.id
				else:
					del submission_json_dummy["edit"]

				if "submitted_by" in submission_json:
					submission_json_dummy["contributors"].append(submission_json['submitted_by'])
					del submission_json['submitted_by']
				elif "contributors" in submission_json:
					submission_json_dummy["contributors"] = submission_json["contributors"]

				try:
					if not submission.author.name in submission_json_dummy:
						submission_json_dummy["contributors"].append(submission.author.name)
				except AttributeError:
					submission_json_dummy["contributors"].append("unknown")

				for key in submission_json:
					if not key in submission_json_dummy:
						submission_json_dummy[key] = submission_json[key];
				(submission_json, validation_status) = format_all(submission_json_dummy, True)
				
				assert validation_status < 3, \
					"Submission invalid after validation. This may be caused by not enough points on the path."
					
				outfile.write(json.dumps(submission_json, ensure_ascii=False) + ",\n")
				editidsfile.write(submission.id + '\n')
				successcount += 1
				set_flair(submission, "Processed Entry")

		except Exception as e:
			failfile.write(
				"\n\n" + "="*40 + "\n\n" +
				submission.id + "\n\n" +
				traceback.format_exc() + "\n\n" +
				"==== RAW ====" + "\n\n" +
				rawtext + "\n\n"
				"==== CLEAN ====" + "\n\n" +
				text + "\n\n"
			)
			failcount += 1
			set_flair(submission, "Rejected Entry")

		print("Wrote "+submission.id+", submitted "+str(round(time.time()-submission.created_utc))+" seconds ago")
		totalcount += 1

# Remove last trailing comma
outfile.seek(outfile.tell()-3, os.SEEK_SET)
outfile.truncate()

outfile.write("\n]")

print(f"\n\nTotal all flairs:{total_all_flairs}\nSuccess: {successcount}/{totalcount}\nFail: {failcount}/{totalcount}\nPlease check manual_atlas.txt for failed entries to manually resolve.")
