"""
From https://github.com/Twista/python-polylabel/,
which is in turn implemented from https://github.com/mapbox/polylabel
"""
from math import sqrt
import time

# Python3
from queue import PriorityQueue
from math import inf


def _point_to_polygon_distance(x, y, polygon):
	inside = False
	min_dist_sq = inf

	b = polygon[-1]
	for a in polygon:
		if ((a[1] > y) != (b[1] > y) and
				(x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])):
			inside = not inside

		min_dist_sq = min(min_dist_sq, _get_seg_dist_sq(x, y, a, b))
		b = a

	result = sqrt(min_dist_sq)
	if not inside:
		return -result
	return result


def _get_seg_dist_sq(px, py, a, b):
	x = a[0]
	y = a[1]
	dx = b[0] - x
	dy = b[1] - y

	if dx != 0 or dy != 0:
		t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy)

		if t > 1:
			x = b[0]
			y = b[1]

		elif t > 0:
			x += dx * t
			y += dy * t

	dx = px - x
	dy = py - y

	return dx * dx + dy * dy


class Cell(object):
	def __init__(self, x, y, h, polygon):
		self.h = h
		self.y = y
		self.x = x
		self.d = _point_to_polygon_distance(x, y, polygon)
		self.max = self.d + self.h * sqrt(2)

	def __lt__(self, other):
		return self.max < other.max

	def __lte__(self, other):
		return self.max <= other.max

	def __gt__(self, other):
		return self.max > other.max

	def __gte__(self, other):
		return self.max >= other.max

	def __eq__(self, other):
		return self.max == other.max


def _get_centroid_cell(polygon):
	area = 0
	x = 0
	y = 0
	previous = polygon[-1]
	for current in polygon:
		f = current[0] * previous[1] - previous[0] * current[1]
		x += (current[0] + previous[0]) * f
		y += (current[1] + previous[1]) * f
		area += f * 3
		previous =current
	if area == 0:
		return Cell(polygon[0][0], polygon[0][1], 0, polygon)
	return Cell(x / area, y / area, 0, polygon)


def polylabel(polygon, precision=0.5, debug=False, with_distance=False):
	# find bounding box
	first_item = polygon[0]
	min_x = first_item[0]
	min_y = first_item[1]
	max_x = first_item[0]
	max_y = first_item[1]
	for p in polygon:
		if p[0] < min_x:
			min_x = p[0]
		if p[1] < min_y:
			min_y = p[1]
		if p[0] > max_x:
			max_x = p[0]
		if p[1] > max_y:
			max_y = p[1]

	width = max_x - min_x
	height = max_y - min_y
	cell_size = min(width, height)
	h = cell_size / 2.0

	cell_queue = PriorityQueue()

	if cell_size == 0:
		if with_distance:
			return [min_x, min_y], None
		else:
			return [min_x, min_y]

	# cover polygon with initial cells
	x = min_x
	while x < max_x:
		y = min_y
		while y < max_y:
			c = Cell(x + h, y + h, h, polygon)
			y += cell_size
			cell_queue.put((-c.max, time.time(), c))
		x += cell_size

	best_cell = _get_centroid_cell(polygon)

	bbox_cell = Cell(min_x + width / 2, min_y + height / 2, 0, polygon)
	if bbox_cell.d > best_cell.d:
		best_cell = bbox_cell

	num_of_probes = cell_queue.qsize()
	while not cell_queue.empty():
		_, __, cell = cell_queue.get()

		if cell.d > best_cell.d:
			best_cell = cell

			if debug:
				print('found best {} after {} probes'.format(
					round(1e4 * cell.d) / 1e4, num_of_probes))

		if cell.max - best_cell.d <= precision:
			continue

		h = cell.h / 2
		c = Cell(cell.x - h, cell.y - h, h, polygon)
		cell_queue.put((-c.max, time.time(), c))
		c = Cell(cell.x + h, cell.y - h, h, polygon)
		cell_queue.put((-c.max, time.time(), c))
		c = Cell(cell.x - h, cell.y + h, h, polygon)
		cell_queue.put((-c.max, time.time(), c))
		c = Cell(cell.x + h, cell.y + h, h, polygon)
		cell_queue.put((-c.max, time.time(), c))
		num_of_probes += 4

	if debug:
		print('num probes: {}'.format(num_of_probes))
		print('best distance: {}'.format(best_cell.d))
	if with_distance:
		return [best_cell.x, best_cell.y], best_cell.d
	else:
		return [best_cell.x, best_cell.y]
