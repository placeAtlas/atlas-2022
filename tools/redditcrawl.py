
import praw
import json

outfile = open('temp_atlas.json', 'w')
failfile = open('manual_atlas.json', 'w')

credentials = open('credentials', 'r')
client_id = credentials.readline().strip(' \t\n\r')
client_secret = credentials.readline().strip(' \t\n\r')

reddit = praw.Reddit(client_id=client_id, client_secret=client_secret, user_agent='atlas_bot')

failcount = 0
successcount = 0

latestID = int(input("Latest ID: "))

for submission in reddit.subreddit('placeAtlas2').new(limit=220):
	#print(dir(submission))
	if(submission.link_flair_text == "New Entry"):
		text = submission.selftext
		text = text.replace("\\", "")
		text = text.replace("\"id\": 0,", "\"id\": 0,\n\t\t\"submitted_by\": \""+submission.author.name+"\",")

		lines = text.split("\n")

		text = "\n".join(lines)

		for i, line in enumerate(lines):
			if("\"id\": 0" in line):
				lines[i] = line.replace("\"id\": 0", "\"id\": "+str(latestID))
				latestID = latestID + 1
		
		try:
			outfile.write(json.dumps(json.loads(text))+",\n")
		except json.JSONDecodeError:
			print("Errored "+submission.title)
			failfile.write(text+",\n")
			failcount += 1
		print("written "+submission.title)
		successcount += 1
	else:
		print("skipped "+submission.title)

print(f"\n\nSuccess: {successcount}\nFail: {failcount}\nPlease check manual_atlas.txt for failed entries to manually resolve.")