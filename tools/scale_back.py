#!/usr/bin/python

from io import TextIOWrapper
import json
import traceback
import numpy
from PIL import Image, ImageDraw
import gc
import tqdm

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

class ScaleConfig:
	type = 'expand'
	source = ''
	destination = ''
	threshold = 20
	image1 = ''
	image2 = ''

def swap_source_dest(source, destination, image2):
	ScaleConfig.source = source
	ScaleConfig.destination = destination
	ScaleConfig.image2 = image2

def remove_white(entry: dict):

	canvas_ref = Image.new('RGBA', (2000,2000))

	with Image.open(ScaleConfig.image1).convert('RGBA') as image1:
		if ScaleConfig.image2:
			with Image.open(ScaleConfig.image2).convert('RGBA') as image2:
				canvas_ref.paste(image1, (0, 0), image1)
				canvas_ref.paste(image2, (0, 0), image2)
		else:
			canvas_ref.paste(image1, (0, 0), image1)

	# uncomment when you need to see the source canvas
	# canvas_ref.show()

	# print(entry['path'])

	for (period, polygonList) in entry['path'].items():
		# Check if the entry's period applies to the current scale config.
		period_split = period.split(', ')
		period_index = None
		for i, period_section in enumerate(period_split):
			if f'-{ScaleConfig.source}' in period_section or period_section == ScaleConfig.source:
				period_index = i
				break
		if period_index is None:
			continue

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
				if (pixel[0] == 255 and pixel[1] == 255 and pixel[2] == 255): continue
				colored_pixel_count += 1

		if all_pixel_count == 0: break

		colorness = (100 * colored_pixel_count)/all_pixel_count

		if (ScaleConfig.type == "shrink" and colorness < ScaleConfig.threshold) or (ScaleConfig.type == "expand" and colorness > ScaleConfig.threshold):
			print(f"[{entry['id']} {period}] {colored_pixel_count}/{all_pixel_count} ({colorness}%)")
			if f'-{ScaleConfig.source}' in period:
				period_section = period_section.replace(f'-{ScaleConfig.source}', f'-{ScaleConfig.destination}')
			else:
				period_section = f'{period_section}-{ScaleConfig.destination}'
			period_split[period_index] = period_section
			new_period = ', '.join(period_split)
			entry['path'][new_period] = entry['path'][period]
			del entry['path'][period]
			entry['center'][new_period] = entry['center'][period]
			del entry['center'][period]
			break
			# newIm = Image.fromarray(newImArray, "RGBA")
			# newIm.show()

		break

	return entry

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
	def print_(*args, **kwargs):
		if not silent:
			print(*args, **kwargs)

	entry = remove_white(entry)
	print_("Completed!")
	return entry

def scale_back_entries(entries):
	for i in tqdm.trange(len(entries)):
		try:
			entry_formatted = format_all(entries[i], True)
			entries[i] = entry_formatted
		except Exception:
			print(f"Exception occured when formatting ID {entries[i]['id']}")
			print(traceback.format_exc())
		if not (i % 50):
			print(f"{i} checked.")
			gc.collect()

def go(path):

	print(f"Scaling whiteout for {path}...")

	with open(path, "r+", encoding='UTF-8') as f1:
		entries = json.loads(f1.read())

	scale_back_entries(entries)

	print(f"{len(entries)} checked. Writing...")

	with open(path, "w", encoding='utf-8', newline='\n') as f2:
		per_line_entries(entries, f2)

	print("Writing completed. All done.")

if __name__ == '__main__':

	ScaleConfig.type = input("Type (shrink/expand): ")
	ScaleConfig.source = input("Source: ")
	ScaleConfig.destination = input("Destination: ")
	ScaleConfig.threshold = int(input("Threshold (%): "))
	ScaleConfig.image1 = input("Reference canvas layer 1: ")
	ScaleConfig.image2 = input("Reference canvas layer 2: ")

	go("web/atlas.json")
