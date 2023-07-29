"""
Setting up authentication:
1. Head to https://www.reddit.com/prefs/apps
2. Click "are you a developer? create an app..." on the button
3. Enter the name and description
4. Select "script" for the type
5. Enter "redirect uri" as "http://localhost:8080"
6. Create file "credentials" with the format below
┌──────────────────────────────────────────────────────────────────────────────┐
│ [id]        <-  Under "personal use script"                                  │
│ [secret]                                                                     │
│ [username]  <-  For flair access, must be a mod, Don't do this...            │
│ [password]  <-  ...if you don't know what you are doing.                     │
└──────────────────────────────────────────────────────────────────────────────┘

Running:
1. Run the script
2. Input the next ID to use
3. Manually resolve errors in temp-atlas-manual.json
4. a. Use merge_out.py, or...
   b. a. Copy temp-atlas.json entries into web/_js/atlas.js (mind the edits!)
      b. Copy temp-read-ids.txt IDs into data/read-ids.txt
5. Create a pull request
"""

from praw import Reddit
from praw.models import Submission
import json
import re
import traceback
from aformatter import format_all, validate
from pathlib import Path
import humanize
from datetime import datetime
import os

while not os.path.exists('README.md'):
	os.chdir('..')

patches_dir = "data/patches/"
Path(patches_dir).mkdir(parents=True, exist_ok=True)

def set_flair(submission, flair):
	if has_write_access and submission.link_flair_text != flair:
		flair_choices = submission.flair.choices()
		flair = next(x for x in flair_choices if x["flair_text_editable"] and flair == x["flair_text"])
		submission.flair.select(flair["flair_template_id"])


with open('credentials', 'r') as file:
	credentials = file.readlines()
	client_id = credentials[0].strip()
	client_secret = credentials[1].strip()
	username = credentials[2].strip() if len(credentials) > 3 else ""
	password = credentials[3].strip() if len(credentials) > 3 else ""

reddit = Reddit(
	client_id=client_id,
	client_secret=client_secret,
	username=username,
	password=password,
	user_agent='atlas_bot'
)

has_write_access = not reddit.read_only
if not has_write_access:
	print("Warning: No write access. Post flairs will not be updated. Waiting 5 seconds...")
	# time.sleep(5)

print("Running...")

existing_ids = []

with open('data/read-ids.txt', 'r') as edit_ids_file:
	for id in [x.strip() for x in edit_ids_file.readlines()]:
		existing_ids.append(id)

total_all_flairs = 0
count_dupe = 0
count_fail = 0
count_success = 0
count_total = 0

with open('temp-atlas-manual.txt', 'w', encoding='utf-8') as FAIL_FILE:

	submission: Submission
	for submission in reddit.subreddit('placeAtlas2').new(limit=1000):
		total_all_flairs += 1

		print(f"{submission.id}: Submitted {humanize.naturaltime(datetime.utcnow() - datetime.utcfromtimestamp(submission.created_utc))}.")

		# print(patches_dir + 'reddit-' + submission.id + '.json')
		if submission.id in existing_ids or Path(patches_dir + 'reddit-' + submission.id + '.json').is_file():
			set_flair(submission, "Processed Entry")
			print(f"{submission.id}: Submission is a duplicate! Skipped.")
			if (count_dupe == 1):
				print(f"{submission.id}: Second duplicate. Stopped!")
				break
			print(f"{submission.id}: First duplicate. Continue running.")
			count_dupe += 1
			continue

		print(f"{submission.id}: Processing...")

		if submission.link_flair_text == "New Entry" or submission.link_flair_text == "Edit Entry":

			try:

				text = submission.selftext
				rawtext = text

				text = text.replace('\u200c', '')
				text = re.compile(r"(\{.+\})", re.DOTALL).search(text).group(0)
				# Test if it needs to escape the escape character. Usually happens on fancy mode.
				try: json.loads(text)
				except json.JSONDecodeError: text = re.sub(r"\\(.)", r"\1", text)

				submission_json = json.loads(text)

				if submission_json:

					if submission.link_flair_text == "Edit Entry":
						assert submission_json["id"] != -1, "Edit invalid because ID is tampered, it must not be -1!"
					else:
						assert submission_json["id"] == -1, "Addition invalid because ID is tampered, it must be -1!"
						
					submission_json_dummy = {"id": submission_json["id"], "_reddit_id": submission.id, "_author": submission.author.name}

					for key in submission_json:
						if not key in submission_json_dummy:
							submission_json_dummy[key] = submission_json[key]
					submission_json = format_all(submission_json_dummy, True)
					validation_status = validate(submission_json)

					assert validation_status < 3, \
						"Submission invalid after validation. This may be caused by not enough points on the path."
					
					with open(f'{patches_dir}reddit-{submission.id}-{"-".join(submission.name.split()).lower()}.json', 'w', encoding='utf-8') as out_file:
						out_file.write(json.dumps(submission_json, ensure_ascii=False))

					count_success += 1
					set_flair(submission, "Processed Entry")

			except Exception as e:
				FAIL_FILE.write(
					"\n\n" + "="*40 + "\n\nSubmission ID: " +
					submission.id + "\n\n" +
					traceback.format_exc() + "\n\n" +
					"==== RAW ====" + "\n\n" +
					rawtext + "\n\n"
					"==== CLEAN ====" + "\n\n" +
					text + "\n\n"
				)
				count_fail += 1
				set_flair(submission, "Rejected Entry")
				print(f"{submission.id}: Something went wrong! Rejected.")

			count_total += 1
			print(f"{submission.id}: Processed!")

print(f"\n\nTotal all flairs: {total_all_flairs}\nSuccess: {count_success}/{count_total}\nFail: {count_fail}/{count_total}\nPlease check temp-atlas-manual.txt for failed entries to manually resolve.")
