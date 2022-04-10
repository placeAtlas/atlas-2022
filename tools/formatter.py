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
UNUSED AND FAULTY
4. - https://place.reddit.com
   - place.reddit.com
5. - [https://place.reddit.com](https://place.reddit.com)
   - [place.reddit.com](https://place.reddit.com)
"""
FS_REGEX = {
	"commatization": r'( *(,+ +|,+ |,+)| +)(and|&|;)( *(,+ +|,+ |,+)| +)|, *$| +',
	"pattern1": r'\/*[rR]\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/$)?',
	"pattern2": r'^\/*[rR](?!\/)([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/$)?',
	"pattern3": r'(?:(?:https?:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com\/r\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/[^" ]*)*',
	"pattern1user": r'\/*(?:u|user)\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/$)?',
	"pattern2user": r'^\/*(?:u|user)(?!\/)([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/$)?',
	"pattern3user": r'(?:(?:https?:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com\/(?:u|user)\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/[^" ]*)*',
	# "pattern4": r'(?:https?:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*',
	# "pattern5": r'\[(?:https?:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*\]\((?:https:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*\)"',
}

VALIDATE_REGEX = {
	"subreddit": r'^ *\/?r\/([A-Za-z0-9][A-Za-z0-9_]{1,20}) *(, *\/?r\/([A-Za-z0-9][A-Za-z0-9_]{1,20}) *)*$|^$',
	"website": r'^https?://[^\s/$.?#].[^\s]*$|^$'
}

CL_REGEX = r'\[(.+?)\]\((.+?)\)'
CWTS_REGEX = {
	"url": r'^(?:(?:https?:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com\/r\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/)$',
	"subreddit": r'^\/*[rR]\/([A-Za-z0-9][A-Za-z0-9_]{1,20})\/?$'
}
CSTW_REGEX = {
	"website": r'^https?://[^\s/$.?#].[^\s]*$',
	"user": r'^\/*u\/([A-Za-z0-9][A-Za-z0-9_]{1,20})$'
}

# r/... to /r/...
SUBREDDIT_TEMPLATE = r"/r/\1"
USER_TEMPLATE = r"/u/\1"

def format_subreddit(entry: dict):
	"""
	Fix formatting of the value on "subreddit".
	"""
	if not "subreddit" in entry or not entry['subreddit']:
		return entry

	subredditLink = entry["subreddit"]
	subredditLink = re.sub(FS_REGEX["commatization"], ', ', subredditLink)
	subredditLink = re.sub(FS_REGEX["pattern3"], SUBREDDIT_TEMPLATE, subredditLink)
	subredditLink = re.sub(FS_REGEX["pattern1"], SUBREDDIT_TEMPLATE, subredditLink)
	subredditLink = re.sub(FS_REGEX["pattern2"], SUBREDDIT_TEMPLATE, subredditLink)
	subredditLink = re.sub(FS_REGEX["pattern3user"], USER_TEMPLATE, subredditLink)
	subredditLink = re.sub(FS_REGEX["pattern1user"], USER_TEMPLATE, subredditLink)
	subredditLink = re.sub(FS_REGEX["pattern2user"], USER_TEMPLATE, subredditLink)

	if not subredditLink:
		return entry
	
	entry["subreddit"] = subredditLink
	return entry

def collapse_links(entry: dict):
	if "website" in entry and entry['website']:
		website = entry["website"];
		if re.search(CL_REGEX, website):
			match = re.search(CL_REGEX, website)
			if match.group(1) == match.group(2):
				website = match.group(2)

		entry["website"] = website

	if "subreddit" in entry and entry['subreddit']:
		subreddit = entry["subreddit"];
		if re.search(CL_REGEX, subreddit):
			match = re.search(CL_REGEX, subreddit)
			if match.group(1) == match.group(2):
				subreddit = match.group(2)

		entry["subreddit"] = subreddit

	return entry

def remove_extras(entry: dict):
	"""
	Removing unnecessary extra characters and converts select characters.
	"""
	if "subreddit" in entry and entry["subreddit"]:
		# if not entry["subreddit"].startswith('/r/'):
		# 	entry["subreddit"] = re.sub(r'^(.*)(?=\/r\/)', r'', entry["subreddit"])
		entry["subreddit"] = re.sub(r'[.,]+$', r'', entry["subreddit"])

	for key in entry:
		if not entry[key] or not isinstance(entry[key], str): 
			continue
		# Leading and trailing spaces
		entry[key] = entry[key].strip()
		# Double characters
		entry[key] = re.sub(r' {2,}(?!\n)', r' ', entry[key])
		entry[key] = re.sub(r' {3,}\n', r'  ', entry[key])
		entry[key] = re.sub(r'\n{3,}', r'\n\n', entry[key])
		entry[key] = re.sub(r'r\/{2,}', r'r\/', entry[key])
		entry[key] = re.sub(r',{2,}', r',', entry[key])
		# Smart quotation marks
		entry[key] = re.sub(r'[\u201c\u201d]', '"', entry[key])
		entry[key] = re.sub(r'[\u2018\u2019]', "'", entry[key])
		# Psuedo-empty strings
		if entry[key] in ["n/a", "N/A", "na", "NA", "-", "null", "none", "None"]:
			entry[key] = ""

	return entry

def remove_duplicate_points(entry: dict):
	"""
	Removes points from paths that occur twice after each other
	"""
	path: list = entry['path']
	previous: list = path[0]
	for i in range(len(path)-1, -1, -1):
		current: list = path[i]
		if current == previous:
			path.pop(i)
			previous = current

	return entry

def fix_r_caps(entry: dict):
	"""
	Fixes capitalization of /r/. (/R/place -> /r/place)
	"""
	if not "description" in entry or not entry['description']:
		return entry
	
	entry["description"] = re.sub(r'([^\w]|^)\/R\/', '\1/r/', entry["description"])
	entry["description"] = re.sub(r'([^\w]|^)R\/', '\1r/', entry["description"])

	return entry

def fix_no_protocol_urls(entry: dict):
	"""
	Fixes URLs with no protocol by adding "https://" protocol.
	"""
	if not "website" in entry or not entry['website']:
		return entry
	
	if not entry["website"].startswith("http"):
		entry["website"] = "https://" + entry["website"]

	return entry

def convert_website_to_subreddit(entry: dict):
	"""
	Converts the subreddit link on "website" to "subreddit" if possible.
	"""
	if not "website" in entry or not entry['website']:
		return entry

	if re.match(CWTS_REGEX["url"], entry["website"]):
		new_subreddit = re.sub(CWTS_REGEX["url"], SUBREDDIT_TEMPLATE, entry["website"])
		if (new_subreddit.lower() == entry["subreddit"].lower()):
			entry["website"] = ""
		elif not "subreddit" in entry or entry['subreddit'] == "":
			entry["subreddit"] = new_subreddit
			entry["website"] = ""
	elif re.match(CWTS_REGEX["subreddit"], entry["website"]):
		new_subreddit = re.sub(CWTS_REGEX["subreddit"], SUBREDDIT_TEMPLATE, entry["website"])
		if (new_subreddit.lower() == entry["subreddit"].lower()):
			entry["website"] = ""
		elif not "subreddit" in entry or entry['subreddit'] == "":
			entry["subreddit"] = new_subreddit
			entry["website"] = ""

	return entry

def convert_subreddit_to_website(entry: dict):
	"""
	Converts the links on "subreddit" to a "website" if needed. This also supports Reddit users (/u/reddit). 
	"""
	if not "subreddit" in entry or not entry['subreddit']:
		return entry

	if re.match(CSTW_REGEX["website"], entry["subreddit"]):
		if (entry["website"].lower() == entry["subreddit"].lower()):
			entry["subreddit"] = ""
		elif not "website" in entry or entry['website'] == "":
			entry["website"] = entry["subreddit"]
			entry["subreddit"] = ""
	elif re.match(CSTW_REGEX["user"], entry["subreddit"]):
		if not "website" in entry or entry['website'] == "":
			username = re.match(CSTW_REGEX["user"], entry["subreddit"]).group(1)
			entry["website"] = "https://www.reddit.com/user/" + username
			entry["subreddit"] = ""

	return entry

def calculate_center(path: list):
	"""
	Caluclates the center of a polygon

	adapted from /web/_js/draw.js:calucalteCenter()
	"""
	area = 0
	x = 0
	y = 0

	for i in range(len(path)):
		point1 = path[i]
		point2 = path[i-1 if i != 0 else len(path)-1]
		f = point1[0] * point2[1] - point2[0] * point1[1]
		area += f
		x += (point1[0] + point2[0]) * f
		y += (point1[1] + point2[1]) * f

	area *= 3

	if area != 0:
		return [x // area + 0.5, y // area + 0.5]
	else:
		# get the center of a straight line
		max_x = max(i[0] for i in path)
		min_x = min(i[0] for i in path)
		max_y = max(i[1] for i in path)
		min_y = min(i[1] for i in path)
		return [(max_x + min_x) // 2 + 0.5, (max_y + min_y) // 2 + 0.5]

def update_center(entry: dict):
	"""
	checks if the center of a entry is up to date, and updates it if it's either missing or outdated
	"""
	if 'path' not in entry:
		return entry
	path = entry['path']
	if len(path) > 1:
		calculated_center = calculate_center(path)
		if 'center' not in entry or entry['center'] != calculated_center:
			entry['center'] = calculated_center
	return entry

def validate(entry: dict):
	"""
	Validates the entry. Catch errors and tell warnings related to the entry.

	Status code key:
	0: All valid, no problems
	1: Informational logs that may be ignored
	2: Warnings that may effect user experience when interacting with the entry
	3: Errors that make the entry inaccessible or broken.
	"""
	return_status = 0
	if (not "id" in entry or (not entry['id'] and not entry['id'] == 0)):
		print(f"Wait, no id here! How did this happened? {entry}")
		return_status = 3
		entry['id'] = '[MISSING_ID]'
	if not ("path" in entry and isinstance(entry["path"], list) and len(entry["path"]) > 0):
		print(f"Entry {entry['id']} has no points!")
		return_status = 3
	elif len(entry["path"]) < 3:
		print(f"Entry {entry['id']} only has {len(entry['path'])} point(s)!")
		return_status = 3
	for key in entry:
		if key in VALIDATE_REGEX and not re.match(VALIDATE_REGEX[key], entry[key]):
			if return_status < 2: return_status = 2
			print(f"{key} of entry {entry['id']} is still invalid! {entry[key]}")
	return return_status

def per_line_entries(entries: list):
	"""
	Returns a string of all the entries, with every entry in one line.
	"""
	out = "[\n"
	for entry in entries:
		if entry:
			out += json.dumps(entry, ensure_ascii=False) + ",\n"
	out = out[:-2] + "\n]"
	return out

def format_all(entry: dict, silent=False):
	"""
	Format using all the available formatters.
	Outputs a tuple containing the entry and the validation status code.

	Status code key:
	0: All valid, no problems
	1: Informational logs that may be ignored
	2: Warnings that may effect user experience when interacting with the entry
	3: Errors that make the entry inaccessible or broken.
	"""
	def print_(*args, **kwargs):
		if not silent:
			print(*args, **kwargs)
	print_("Fixing r/ capitalization...")
	entry = fix_r_caps(entry)
	print_("Fix formatting of subreddit...")
	entry = format_subreddit(entry)
	print_("Collapsing Markdown links...")
	entry = collapse_links(entry)
	print_("Converting website links to subreddit (if possible)...")
	entry = convert_website_to_subreddit(entry)
	print_("Converting subreddit links to website (if needed)...")
	entry = convert_subreddit_to_website(entry)
	print_("Fixing links without protocol...")
	entry = fix_no_protocol_urls(entry)
	print_("Removing extras...")
	entry = remove_extras(entry)
	print_("Removing duplicate points...")
	entry = remove_duplicate_points(entry)
	print_("Updating center...")
	entry = update_center(entry)
	print_("Validating...")
	status_code = validate(entry)
	print_("Completed!")
	return ( entry, status_code )

if __name__ == '__main__':

	def go(path):

		print(f"Formatting {path}...")

		with open(path, "r+", encoding='UTF-8') as f1:
			entries = json.loads(f1.read())

		for i in range(len(entries)):
			entry_formatted, validation_status = format_all(entries[i], True)
			if validation_status > 2:
				print(f"Entry {entry_formatted['id']} will be removed! {json.dumps(entry_formatted)}")
				entries[i] = None
			else:
				entries[i] = entry_formatted
			if not (i % 500):
				print(f"{i} checked.")

		print(f"{len(entries)} checked.")

		with open(path, "w", encoding='UTF-8') as f2:
			f2.write(per_line_entries(entries))

		print("Writing completed. All done.")

	go("../web/atlas.json")
