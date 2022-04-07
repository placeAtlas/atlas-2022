#!/usr/bin/python

import re
import json

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
FS_REGEX = {
	"commatization": r',*(?: +and)? +',
	"pattern1": r'\/?[rR]\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/$)?',
	"pattern2": r'^\/?[rR](?!\/)([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/$)?',
	"pattern3": r'(?:(?:https?:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com\/r\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/[^" ]*)*',
	"pattern4": r'\[[A-Za-z0-9][A-Za-z0-9_]{1,20}\]\((?:(?:https:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com\/r\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/[^" ]*)*\)',
	# "pattern5": r'(?:https?:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*',
	# "pattern6": r'\[(?:https?:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*\]\((?:https:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*\)"',
}

CL_REGEX = r'\[(.+?)\]\((.+?)\)'
CWTS_REGEX = r'^(?:(?:https?:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com\/r\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/)$'

# r/... to /r/...
SUBREDDIT_TEMPLATE = r"/r/\1"

def format_subreddit(entry: dict):
	if not "subreddit" in entry or not entry['subreddit']:
		return entry

	subredditLink = entry["subreddit"]
	subredditLink = re.sub(FS_REGEX["commatization"], ', ', subredditLink)
	subredditLink = re.sub(FS_REGEX["pattern4"], SUBREDDIT_TEMPLATE, subredditLink)
	subredditLink = re.sub(FS_REGEX["pattern3"], SUBREDDIT_TEMPLATE, subredditLink)
	subredditLink = re.sub(FS_REGEX["pattern1"], SUBREDDIT_TEMPLATE, subredditLink)
	subredditLink = re.sub(FS_REGEX["pattern2"], SUBREDDIT_TEMPLATE, subredditLink)

	if not subredditLink:
		return entry
	
	entry["subreddit"] = subredditLink
	return entry

def collapse_links(entry: dict):
	if not "website" in entry or not entry['website']:
		return entry
		
	website = entry["website"];
	if re.search(CL_REGEX, website):
		match = re.search(CL_REGEX, website)
		if match.group(1) == match.group(2):
			website = match.group(2)

	entry["website"] = website
	return entry

def remove_extras(entry: dict):
	for key in entry:
		if not entry[key] or not isinstance(entry[key], str): 
			continue
		# Leading and trailing spaces
		entry[key] = re.sub(r'^(\s+)', r'', entry[key])
		entry[key] = re.sub(r'(\s+)$', r'', entry[key])
		# Double spaces and commas
		entry[key] = re.sub(r' {2,}', r' ', entry[key])
		entry[key] = re.sub(r'\n{2,}', r'\n', entry[key])
		entry[key] = re.sub(r',{2,}', r',', entry[key])
		# Psuedo-empty strings
		if entry[key] in ["n/a", "N/A", "-", "null", "none", "None"]:
			entry[key] = ""

	return entry

def fix_r_caps(entry: dict):
	if not "description" in entry or not entry['description']:
		return entry
	
	entry["description"] = re.sub(r'R\/', 'r/', entry["description"])

	return entry

def fix_no_protocol_urls(entry: dict):
	if not "website" in entry or not entry['website']:
		return entry
	
	if not entry["website"].startswith("http"):
		entry["website"] = "https://" + entry["website"]

	return entry

def convert_website_to_subreddit(entry: dict):
	if (not "website" in entry or not entry['website']):
		return entry

	if re.match(CWTS_REGEX, entry["website"]):
		new_subreddit = re.sub(CWTS_REGEX, SUBREDDIT_TEMPLATE, entry["website"])
		if (new_subreddit.lower() == entry["subreddit"].lower()):
			entry["website"] = ""
		elif ("subreddit" in entry and entry["subreddit"] == ""):
			entry["subreddit"] = new_subreddit
			entry["website"] = ""

	return entry

def per_line_entries(entries: list):
	out = "[\n"
	for entry in entries:
		out += json.dumps(entry) + ",\n"
	out = out[:-2] + "\n]"
	return out

def format_all(entry: dict, silent=False):
	def print_(*args, **kwargs):
		if not silent:
			print(*args, **kwargs)
	print_("Removing extras...")
	entry = remove_extras(entry)
	print_("Fixing r/ capitalization...")
	entry = fix_r_caps(entry)
	print_("Fixing links without protocol...")
	entry = fix_no_protocol_urls(entry)
	print_("Converting website links to subreddit (if possible)...")
	entry = convert_website_to_subreddit(entry)
	print_("Collapsing Markdown links...")
	entry = collapse_links(entry)
	print_("Fix formatting of subreddit...")
	entry = format_subreddit(entry)
	print_("Completed!")
	return entry

if __name__ == '__main__':

	def go(path):

		print(f"Formatting {path}...")

		with open(path, "r+", encoding='UTF-8') as f1:
			entries = json.loads(f1.read())

		for i in range(len(entries)):
			entries[i] = format_all(entries[i], True)
			if not (i % 500):
				print(f"{i} checked.")

		print(f"{len(entries)} checked.")

		with open(path, "w", encoding='UTF-8') as f2:
			f2.write(per_line_entries(entries))

		print("Writing completed. All done.")

	go("../web/atlas.json")
	go("../web/atlas-before-ids-migration.json")