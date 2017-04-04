
#6y7LtOjoNEfe72g62kZfwtFHMWkQ8XsZvcQ8xZDe

import praw

outfile = open('temp.js', 'w')

credentials = open('credentials', 'r')
client_id = credentials.readline().strip(' \t\n\r')
client_secret = credentials.readline().strip(' \t\n\r')

startId = 466

reddit = praw.Reddit(client_id=client_id, client_secret=client_secret, user_agent='atlas_bot')

for submission in reddit.subreddit('placeAtlas').new(limit=1000):
	#print(dir(submission))
	if(submission.link_flair_text == "New Entry"):
		text = submission.selftext
		text = text.replace("\"id\": 0,", "\"id\": 0,\n\t\t\"submitted_by\": \""+submission.author.name+"\",")
		
		text = text.replace("\"id\": 0", "\"id\": "+str(startId))
		startId = startId + 1
		outfile.write(text+",")
		print("written "+submission.title)
	else:
		print("skipped "+submission.title)
