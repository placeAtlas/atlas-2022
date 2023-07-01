#!/usr/bin/python

from io import TextIOWrapper
from typing import List
import re
import json
import math
import traceback
import tqdm
import os

END_NORMAL_IMAGE = "164"
END_WHITEOUT_IMAGE = "166"

NORMAL_IMAGE_SUFFIX = "-" + END_NORMAL_IMAGE
WHITEOUT_IMAGE_SUFFIX = "-" + END_WHITEOUT_IMAGE

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
	"commatization": r'[,;& ]+(?:and)?[,;& ]*?',
	"pattern1": r'\/*[rR]\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/$)?',
	"pattern2": r'^\/*[rR](?!\/)([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/$)?',
	"pattern3": r'(?:(?:https?:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com\/r\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/[^" ]*)*',
	"pattern1user": r'\/*(?:u|user)\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/$)?',
	"pattern2user": r'^\/*(?:u|user)(?!\/)([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/$)?',
	"pattern3user": r'(?:(?:https?:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com\/(?:u|user)\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/[^" ]*)*',
	"pattern1new": r'(?:(?:(?:(?:https?:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com)?\/)?[rR]\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/[^" ]*)*'
	# "pattern4": r'(?:https?:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*',
	# "pattern5": r'\[(?:https?:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*\]\((?:https:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*\)"',
}

VALIDATE_REGEX = {
	"subreddit": r'^ *\/?r\/([A-Za-z0-9][A-Za-z0-9_]{2,20}) *(, *\/?r\/([A-Za-z0-9][A-Za-z0-9_]{1,20}) *)*$|^$',
	"website": r'^https?://[^\s/$.?#].[^\s]*$|^$'
}

CL_REGEX = r'\[(.+?)\]\((.+?)\)'
CWTS_REGEX = {
	"url": r'^(?:(?:https?:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com\/r\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/)?$',
	"subreddit": r'^\/*[rR]\/([A-Za-z0-9][A-Za-z0-9_]{1,20})\/?$'
}
CSTW_REGEX = {
	"website": r'^https?://[^\s/$.?#].[^\s]*$',
	"user": r'^\/*u\/([A-Za-z0-9][A-Za-z0-9_]{2,20})$'
}
CWTD_REGEX = r'^(?:(?:https?:\/\/)?(?:www\.)?(?:(?:discord)?\.?gg|discord(?:app)?\.com\/invite)\/)?([^\s/]+?)$'

# r/... to /r/...
SUBREDDIT_TEMPLATE = r"/r/\1"
USER_TEMPLATE = r"/u/\1"

def format_subreddit(entry: dict):
	"""
	Fix formatting of the value on "subreddit".
	"""

	if "links" in entry and "subreddit" in entry["links"]:

		for i in range(len(entry["links"]["subreddit"])):

			subredditLink = entry["links"]["subreddit"][i]

			subredditLink = re.sub(FS_REGEX["pattern3"], r"\1", subredditLink)
			subredditLink = re.sub(FS_REGEX["pattern1new"], r"\1", subredditLink)

			entry["links"]["subreddit"][i] = subredditLink

	return entry

def collapse_links(entry: dict):
	"""
	Collapses Markdown links.
	"""

	if "links" in entry and "website" in entry["links"]:

		for i in range(len(entry["links"]["website"])):

			website = entry["links"]["website"][i]

			if re.search(CL_REGEX, website):
				match = re.search(CL_REGEX, website)
				if match.group(1) == match.group(2):
					website = match.group(2)

			entry["links"]["website"][i] = website

	if "links" in entry and "subreddit" in entry["links"]:

		for i in range(len(entry["links"]["subreddit"])):

			subreddit = entry["links"]["subreddit"][i]

			if re.search(CL_REGEX, subreddit):
				match = re.search(CL_REGEX, subreddit)
				if match.group(1) == match.group(2):
					subreddit = match.group(2)

			entry["links"]["subreddit"][i] = subreddit


	return entry

def remove_extras(entry: dict):
	"""
	Removing unnecessary extra characters and converts select characters.
	"""

	if "subreddit" in entry and entry["subreddit"]:
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

	if not "path" in entry:
		return entry

	for key in entry['path']:
		path: list = entry['path'][key]
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

	if "links" in entry and "website" in entry['links']:
		for i in range(len(entry["links"]["website"])):
			if entry["links"]["website"][i] and not entry["links"]["website"][i].startswith("http"):
				entry["links"]["website"][i] = "https://" + entry["links"]["website"][i]

	return entry

def convert_website_to_subreddit(entry: dict):
	"""
	Converts the subreddit link on "website" to "subreddit" if possible.
	"""

	if "links" in entry and "website" in entry["links"]:
		for i in range(len(entry["links"]["website"])):
			if re.match(CWTS_REGEX["url"], entry["links"]["website"][i]):
				new_subreddit = re.sub(CWTS_REGEX["url"], r"\1", entry["links"]["website"][i])
				if not "subreddit" in entry["links"]:
					entry["links"]["subreddit"] = []
				if new_subreddit in entry["links"]["subreddit"]:
					entry["links"]["website"][i] = ""
				elif not "subreddit" in entry["links"] or len(entry["links"]["subreddit"]) == 0:
					entry["links"]["subreddit"].append(new_subreddit)
					entry["links"]["website"][i] = ""
			elif re.match(CWTS_REGEX["subreddit"], entry["links"]["website"][i]):
				new_subreddit = re.sub(CWTS_REGEX["subreddit"], r"\1", entry["links"]["website"][i])
				if not "subreddit" in entry["links"]:
					entry["links"]["subreddit"] = []
				if new_subreddit in entry["links"]["subreddit"]:
					entry["links"]["website"][i] = ""
				elif not "subreddit" in entry["links"] or len(entry["links"]["subreddit"]) == 0:
					entry["links"]["subreddit"].append(new_subreddit)
					entry["links"]["website"][i] = ""

	return entry

def convert_website_to_discord(entry: dict):
	"""
	Converts the Discord link on "website" to "discord" if possible.
	"""

	if "links" in entry and "website" in entry["links"]:
		for i in range(len(entry["links"]["website"])):
			if re.match(CWTD_REGEX, entry["links"]["website"][i]):
				new_discord = re.match(CWTD_REGEX, entry["links"]["website"][i])[1]
				if not "discord" in entry["links"]:
					entry["links"]["discord"] = []
				if new_discord in entry["links"]["discord"]:
					entry["links"]["website"][i] = ""
				elif not "discord" in entry["links"] or len(entry["links"]["discord"]) == 0:
					entry["links"]["discord"].append(new_discord)
					entry["links"]["website"][i] = ""

	return entry

def convert_subreddit_to_website(entry: dict):
	"""
	Converts the links on "subreddit" to a "website" if needed. This also supports Reddit users (/u/reddit).
	"""

	if "links" in entry and "subreddit" in entry["links"]:
		for i in range(len(entry["links"]["subreddit"])):
			if re.match(CSTW_REGEX["website"], entry["links"]["subreddit"][i]):
				if "website" in entry["links"] and entry["links"]["subreddit"][i] in entry["links"]["website"]:
					entry["links"]["subreddit"][i] = ""
				elif not "website" in entry["links"] or len(entry["website"]) == 0:
					if not "website" in entry["links"]:
						entry["links"]["website"] = []
					entry["links"]["website"].append(entry["links"]["subreddit"][i])
					entry["links"]["subreddit"][i] = ""
			elif re.match(CSTW_REGEX["user"], entry["links"]["subreddit"][i]):
				if not "website" in entry["links"] or len(entry["website"]) == 0:
					username = re.match(CSTW_REGEX["user"], entry["links"]["subreddit"][i]).group(1)
					if not "website" in entry["links"]:
						entry["links"]["website"] = []
					entry["links"]["website"].append("https://www.reddit.com/user/" + username)
					entry["links"]["subreddit"][i] = ""

	return entry

def remove_empty_and_similar(entry: dict):
	"""
	Removes empty items on lists, usually from the past formattings.
	"""

	if "links" in entry:

		keys = list(entry["links"])
		for key in keys:
			small = list(map(lambda x: x.lower(), entry["links"][key]))
			entry["links"][key] = [x for x in entry["links"][key] if x and x.lower() in small]
			if len(entry["links"][key]) == 0: del entry["links"][key]

	return entry

def sort_image_keys(entry: dict):
	"""
	Alphabetizes comma-separated path and center keys.
	"""
	for outer_key in ["path", "center"]:
		image_keys: List[str] = list(entry[outer_key].keys())
		for image_key in image_keys:
			key_split = image_key.split(", ")
			new_key = ", ".join(sorted(key_split))
			if new_key != image_key:
				entry[outer_key][new_key] = entry[outer_key][image_key]
				del(entry[outer_key][image_key])

	return entry

def floor_points(entry: dict):
	"""
	Floors points on path and center, removing the decimal count.
	"""

	for period in entry["path"]:
		for points in entry["path"][period]:
			points[0] = math.floor(points[0])
			points[1] = math.floor(points[1])

	for period in entry["center"]:
		points = entry["center"][period]
		points[0] = math.floor(points[0])
		points[1] = math.floor(points[1])

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

	if "path" in entry:
		for key in entry['path']:
			path = entry['path'][key]
			if len(path) == 0:
				print(f"Period {key} of entry {entry['id']} has no points!")
				return_status = 3
			elif len(path) < 3:
				print(f"Period {key} of entry {entry['id']} only has {len(entry['path'])} point(s)!")
				return_status = 3
	else:
		print(f"Entry {entry['id']} has no path at all!")
		return_status = 3

	for key in entry:
		if key in VALIDATE_REGEX and not re.match(VALIDATE_REGEX[key], entry[key]):
			if return_status < 2: return_status = 2
			print(f"{key} of entry {entry['id']} is still invalid! {entry[key]}")
	return return_status

def per_line_entries(entries: list, file: TextIOWrapper):
	"""
	Returns a string of all the entries, with every entry in one line.
	"""
	file.write("[\n")
	line_temp = ""
	for entry in tqdm.tqdm(entries):
		if line_temp:
			file.write(line_temp + ",\n")
		line_temp = json.dumps(entry, ensure_ascii=False)
	file.write(line_temp + "\n]")

def format_all(entry: dict, silent=False):
	"""
	Format using all the available formatters.
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
	print_("Converting website links to Discord...")
	entry = convert_website_to_discord(entry)
	print_("Converting subreddit links to website (if needed)...")
	entry = convert_subreddit_to_website(entry)
	print_("Fixing links without protocol...")
	entry = fix_no_protocol_urls(entry)
	print_("Removing extras...")
	entry = remove_extras(entry)
	print_("Removing duplicate points...")
	entry = remove_duplicate_points(entry)
	print_("Remove empty items...")
	entry = remove_empty_and_similar(entry)
	print_("Sorting image keys...")
	entry = sort_image_keys(entry)
	print_("Flooring points...")
	entry = floor_points(entry)

	print_("Completed!")
	return entry

def format_all_entries(entries):
	for i in tqdm.trange(len(entries)):
		try:
			entry_formatted = format_all(entries[i], True)
			validation_status = validate(entries[i])
			if validation_status > 2:
				print(f"Entry {entry_formatted['id']} will be removed! {json.dumps(entry_formatted)}")
				entries[i] = None
			else:
				entries[i] = entry_formatted
		except Exception:
			print(f"Exception occured when formatting ID {entries[i]['id']}")
			print(traceback.format_exc())

def go(path):

	print(f"Formatting {path}...")

	with open(path, "r+", encoding='UTF-8') as f1:
		entries = json.loads(f1.read())

	format_all_entries(entries)

	print(f"Writing...")

	with open(path, "w", encoding='utf-8', newline='\n') as f2:
		per_line_entries(entries, f2)

	print("Writing completed. All done.")

if __name__ == '__main__':

	while not os.path.exists('README.md'):
		os.chdir('..')

	go("web/atlas.json")
