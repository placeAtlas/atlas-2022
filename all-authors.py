import requests

authors = []
queue = []
post_read = 0

def get_authors(ids: list[str]):
	global post_read, authors
	post_read += len(ids)
	print(f'Getting authors... ({post_read} read)')
	response = requests.get('https://api.pushshift.io/reddit/search/submission/?ids=' + ','.join(ids))
	for post in response.json()['data']:
		if post['author'] not in authors:
			authors.append(post['author'])
			print(post['author'], end=', ')
	print()

with open('data/read-ids.txt', 'r', encoding='utf-8') as f:
	ids = f.readlines()
	for id in ids:
		id = id.strip()
		queue.append(id)
		if (len(queue) == 50):
			get_authors(queue)
			queue.clear()
get_authors(queue)

with open('all-authors.txt', 'w', encoding='utf-8') as f:
	f.write('\n'.join(authors))