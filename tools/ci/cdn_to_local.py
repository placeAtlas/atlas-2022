import glob
import string
import re
import hashlib
import os
import urllib.request

cdns = []

def join_rel_path(path1, path2):
    path = os.path.join(path1, path2)
    path = re.sub(r"\/[^\/]+?\/\.", "", path)
    return path

for name in glob.glob("web/**.html"):
    with open(name, 'r', encoding='utf-8') as file:
        file_string = file.read()
    urls = re.findall('"(https:\/\/cdn.jsdelivr.net\/(.+?))"', file_string)
    for url_groups in urls:
        url: string = url_groups[0]
        os.makedirs("dist-temp/cdn/" + hashlib.md5(url.encode()).hexdigest(), exist_ok=True)
        new_url = "cdn/" + hashlib.md5(url.encode()).hexdigest() + "/" + os.path.basename(url)
        print(url)
        urllib.request.urlretrieve(url, "dist-temp/" + new_url)
        file_string = file_string.replace(url, new_url)
        cdns.append((url, new_url, hashlib.md5(url.encode()).hexdigest()))
    file_string = file_string.replace("crossorigin=\"anonymous\"", "")
    # print(file_string).replace("\?.+$", "")
    name = name.replace('web/', 'dist-temp/')
    with open(name, 'w', encoding='utf-8') as file:
        file.write(file_string)

for cdn in cdns:
    parent_url, parent_new_url, hash = cdn
    name = "dist-temp/" + parent_new_url
    with open(name, 'r', encoding='utf-8') as file:
        file_string = file.read()
    urls = re.findall('\("(.\/(.+?))"\)', file_string)
    for url_groups in urls:
        url_orig = url_groups[0]
        url: string = join_rel_path(parent_url, url_groups[0])
        url = re.sub("\?.+$", "", url)
        os.makedirs("dist-temp/cdn/" + hashlib.md5(url.encode()).hexdigest(), exist_ok=True)
        new_url = "cdn/" + hashlib.md5(url.encode()).hexdigest() + "/" + os.path.basename(url)
        print(url)
        urllib.request.urlretrieve(url, "dist-temp/" + new_url)
        file_string = file_string.replace(url_orig, new_url.replace("cdn/", "../"))
    with open(name, 'w', encoding='utf-8') as file:
        file.write(file_string)