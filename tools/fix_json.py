#!/usr/bin/python

import re
import json

patternParent = re.compile(r'"subreddit": ?"(?!")(.+?)"')
patternCommatization = re.compile(r',* +')
pattern1 = re.compile(r'\/?[rR]\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/$)?')
pattern2 = re.compile(r'^\/?[rR](?!\/)([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/$)?')
pattern3 = re.compile(r'(?:(?:https?:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com\/r\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/[^" ]*)*')
pattern4 = re.compile(r'\[[A-Za-z0-9][A-Za-z0-9_]{1,20}\]\((?:(?:https:\/\/)?(?:(?:www|old|new|np)\.)?)?reddit\.com\/r\/([A-Za-z0-9][A-Za-z0-9_]{1,20})(?:\/[^" ]*)*\)')
# pattern5 = re.compile(r'(?:https?:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*')
# pattern6 = re.compile(r'\[(?:https?:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*\]\((?:https:\/\/)?(?!^www\.)(.+)\.reddit\.com(?:\/[^"]*)*\)"')
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

EMPTY_STRINGS = set(['n/a', '-', 'none', 'null'])

def cleanString(contents):
    # Remove leading/trailing spaces.
    contents = re.sub(r'": "(\s+)', r'": "', contents)
    contents = re.sub(r'(\s+)"(, |,|\})', r'"\2', contents)

    # Remove double spaces.
    contents = re.sub(r' {2,}', r' ', contents)

    # Remove double commas.
    contents = re.sub(r',{2,}', r',', contents)

    # Convert pseudo-empty strings to empty strings.
    if (contents.lower() in EMPTY_STRINGS):
        contents = ''

    # Fix capitalization of "r/".
    contents = re.sub(r'R\/', 'r/', contents)

    return contents

def fixSubreddit(contents: str):
    contents = re.sub(patternCommatization, ', ', contents)

    # r/... to /r/.. (change if not needed)
    template = r"/r/\1"
    contents = re.sub(pattern4, template, contents)
    contents = re.sub(pattern3, template, contents)
    contents = re.sub(pattern1, template, contents)
    contents = re.sub(pattern2, template, contents)
    return contents

def fixJson(path):
    print(f'Fixing {path}...')

    atlasJson = json.load(open(path, 'r', encoding='utf-8'))

    for entry in atlasJson:
        # Convert invalid subreddit links to r/... format.
        if 'subreddit' in entry:
            entry['subreddit'] = fixSubreddit(entry['subreddit'])
            entry['subreddit'] = cleanString(entry['subreddit'])

        if 'website' in entry:
            # Collapse Markdown-formatted website links.
            website = entry['website']
            if website.startswith('['):
                linkBoundary = website.find('](')
                if linkBoundary >= 0:
                    website = website[linkBoundary + 2 : -1]

            if website and not website.startswith('http'):
                website = 'https://' + website

            entry['website'] = cleanString(website)

        entry['name'] = cleanString(entry['name'])
        entry['description'] = cleanString(entry['description'])

    newJson = json.dumps(atlasJson)
    # Print the JSON in the existing Atlas format.
    # Newline after start bracket and before end bracket.
    newJson = newJson[:1] + '\r\n' + newJson[1:-1] + '\r\n' + newJson[-1:]
    # Newline after each entry.
    newJson = newJson.replace(', {"id"', ',\r\n{"id"')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(newJson)
    print("Writing completed. All done.")
