
import praw
import json
import time

outfile = open('temp_atlas.json', 'w', encoding='utf-8')
failfile = open('manual_atlas.json', 'w', encoding='utf-8')

credentials = open('credentials', 'r')
client_id = credentials.readline().strip(' \t\n\r')
client_secret = credentials.readline().strip(' \t\n\r')

reddit = praw.Reddit(client_id=client_id, client_secret=client_secret, user_agent='atlas_bot')

failcount = 0
successcount = 0

jsonfile = open("../web/atlas.json", "r")
existing = json.load(jsonfile)

existing_ids = []

for item in existing:
	existing_ids.append(item['id'])


for submission in reddit.subreddit('placeAtlas2').new(limit=1000):
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
	#print(dir(submission))
	if (submission.id in existing_ids):
		print("Found first duplicate!")
		break
	if(submission.link_flair_text == "New Entry"):
		text = submission.selftext
		text = text.replace("\\", "")
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
			outfile.write(json.dumps(json.loads(text))+",\n")
		except json.JSONDecodeError:
			failfile.write(text+",\n")
			failcount += 1
		print("written "+submission.id+" submitted "+str(round(time.time()-submission.created_utc))+" seconds ago")
		successcount += 1

print(f"\n\nSuccess: {successcount}\nFail: {failcount}\nPlease check manual_atlas.txt for failed entries to manually resolve.")
