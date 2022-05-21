#!/usr/bin/python

import json
import traceback
import numpy
from PIL import Image, ImageDraw
import gc

"""
# 166 to 164 with reference of 165
shrink
166
164
20
web\_img\canvas\place30\159.png
web\_img\canvas\place30\163_159.png

# 166 to 165 with reference of 166
shrink
166
165
20
web\_img\canvas\place30\159.png
web\_img\canvas\place30\164_159.png

# 164 to 165 with reference of 165
shrink
164
165
20
web\_img\canvas\place30\159.png
web\_img\canvas\place30\163_159.png

# 166 to 167 with reference of 167
expand
166
167
20
web\_img\canvas\place30\159.png
web\_img\canvas\place30\165_159.png
"""

type = input("Type (shrink/expand): ")
source = input("Source: ")
destination = input("Destination: ")
threshold = int(input("Threshold (%): "))
image1 = input("Reference canvas layer 1: ")
image2 = input("Reference canvas layer 2: ")
canvas_ref = Image.new('RGBA', (2000,2000))

with Image.open(image1).convert('RGBA') as image1:
	if image2:
		with Image.open(image2).convert('RGBA') as image2:
			canvas_ref.paste(image1, (0, 0), image1)
			canvas_ref.paste(image2, (0, 0), image2)
			canvas_ref
	else:
		canvas_ref.paste(image1, (0, 0), image1)

# uncomment when you need to see the source canvas
# canvas_ref.show()

def remove_white(entry: dict):
	# print(entry['path'])

	for (period, polygonList) in entry['path'].items():

		if not f"-{source}" in period: continue

		# Get bounding rectangle and have a list of tuples for polygon

		polygon = []
		x_box = 2000
		y_box = 2000
		x_box2 = 0
		y_box2 = 0

		for point in polygonList:
			x_box = min(x_box, max(point[0] - 1.5, 0))
			y_box = min(y_box, max(point[1] - 1.5, 0))
			x_box2 = max(x_box2, min(point[0] + 1.5, 2000))
			y_box2 = max(y_box2, min(point[1] + 1.5, 2000))
			polygon.append(tuple(point))

		x_box = int(x_box)
		y_box = int(y_box)
		x_box2 = int(x_box2)
		y_box2 = int(y_box2)

		# Crop the image based on polygon
		# https://stackoverflow.com/questions/22588074/

		imArray = numpy.asarray(canvas_ref)

		with Image.new('L', (imArray.shape[1], imArray.shape[0]), 0) as maskIm:
			ImageDraw.Draw(maskIm).polygon(polygon, outline=1, fill=1)
			mask = numpy.array(maskIm)
		newImArray = numpy.empty(imArray.shape,dtype='uint8')

		
		newImArray[:,:,:3] = imArray[:,:,:3]
		newImArray[:,:,3] = mask*255

		imArray = newImArray[y_box:y_box2,x_box:x_box2,:]

		# points = numpy.array([polygon])
		# print(points)
		# print(cv2.boundingRect(points[0]))
		# print(1)
		# print(imArray)

		colored_pixel_count: int = 0
		all_pixel_count: int = 0

		# Read the area based on bounding box

		for x in imArray:
			for pixel in x:
				if pixel[3] == 0: continue
				all_pixel_count += 1
				if (pixel[1] == 255 and pixel[2] == 255): continue 
				colored_pixel_count += 1

		if all_pixel_count == 0: break
		
		colorness = (100 * colored_pixel_count)/all_pixel_count

		if (type == "shrink" and colorness < threshold) or (type == "expand" and colorness > threshold):
			print(f"[{entry['id']} {period}] {colored_pixel_count}/{all_pixel_count} ({colorness}%)")
			new_period = period.replace(f'-{source}', f'-{destination}')
			entry['path'][new_period] = entry['path'][period]
			del entry['path'][period]
			entry['center'][new_period] = entry['center'][period]
			del entry['center'][period]
			break
			# newIm = Image.fromarray(newImArray, "RGBA")
			# newIm.show()
		
		break

	return entry

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
	def print_(*args, **kwargs):
		if not silent:
			print(*args, **kwargs)
	
	entry = remove_white(entry)
	print_("Completed!")
	return entry

if __name__ == '__main__':

	def go(path):

		print(f"Formatting {path}...")

		with open(path, "r+", encoding='UTF-8') as f1:
			entries = json.loads(f1.read())

		for i in range(len(entries)):
			try:
				entry_formatted = format_all(entries[i], True)
				entries[i] = entry_formatted
			except Exception:
				print(f"Exception occured when formatting ID {entries[i]['id']}")
				print(traceback.format_exc())
			if not (i % 50):
				print(f"{i} checked.")
				gc.collect()

		print(f"{len(entries)} checked. Writing...")

		with open(path, "w", encoding='utf-8', newline='\n') as f2:
			f2.write(per_line_entries(entries))

		print("Writing completed. All done.")

	go("web/atlas.json")
