"""
From https://github.com/Twista/python-polylabel/,
which is in turn implemented from https://github.com/mapbox/polylabel
"""
from math import sqrt, log10
import time
from typing import Tuple, List

# Python3
from queue import PriorityQueue
from math import inf

Point = Tuple[float, float]
Polygon = List[Point]

SQRT2 = sqrt(2)


def _point_to_polygon_distance(x: float, y: float, polygon: Polygon) -> float:
	inside: bool = False
	min_distance_squared: float = inf

	previous: Point = polygon[-1]
	for current in polygon:
		if ((current[1] > y) != (previous[1] > y) and
				(x < (previous[0] - current[0]) * (y - current[1]) / (previous[1] - current[1]) + current[0])):
			inside = not inside

		min_distance_squared = min(min_distance_squared, _get_segment_distance_squared(x, y, current, previous))
		previous = current

	result: float = sqrt(min_distance_squared)
	if not inside:
		return -result
	return result


def _get_segment_distance_squared(px: float, py: float, point_a: Point, point_b: Point) -> float:
	x: float = point_a[0]
	y: float = point_a[1]
	dx: float = point_b[0] - x
	dy: float = point_b[1] - y

	if dx != 0 or dy != 0:
		t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy)

		if t > 1:
			x = point_b[0]
			y = point_b[1]

		elif t > 0:
			x += dx * t
			y += dy * t

	dx = px - x
	dy = py - y

	return dx * dx + dy * dy


class Cell(object):
	def __init__(self, x: float, y: float, h: float, polygon: Polygon, centroid: Point):
		self.h: float = h
		self.y: float = y
		self.x: float = x
		min_dist = _point_to_polygon_distance(x, y, polygon)
		self.min_dist: float = min_dist
		self.center_dist: float = (centroid[0] - x) ** 2 + (centroid[1] - y) ** 2
		self.max = self.min_dist + self.h * SQRT2
		self.weight = -self.center_dist - self.max

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


def _get_centroid(polygon: Polygon) -> Point:
	area: float = 0
	x: float = 0
	y: float = 0
	previous: Point = polygon[-1]
	for current in polygon:
		f: float = current[0] * previous[1] - previous[0] * current[1]
		x += (current[0] + previous[0]) * f
		y += (current[1] + previous[1]) * f
		area += f * 3
		previous =current
	if area == 0:
		return (polygon[0][0], polygon[0][1])
	return (x / area, y / area)


def _get_centroid_cell(polygon: Polygon, centroid: Point) -> Cell:
	return Cell(centroid[0], centroid[1], 0, polygon, centroid)


def polylabel(polygon: Polygon, precision: float=0.5, debug: bool=False):
	# find bounding box
	first_item: Point = polygon[0]
	min_x: float = first_item[0]
	min_y: float = first_item[1]
	max_x: float = first_item[0]
	max_y: float = first_item[1]
	for p in polygon:
		if p[0] < min_x:
			min_x = p[0]
		if p[1] < min_y:
			min_y = p[1]
		if p[0] > max_x:
			max_x = p[0]
		if p[1] > max_y:
			max_y = p[1]

	width: float = max_x - min_x
	height: float = max_y - min_y
	cell_size: float = min(width, height)
	h: float = cell_size / 2.0

	cell_queue: PriorityQueue[Tuple[float, int, Cell]] = PriorityQueue()

	if cell_size == 0:
		return [(max_x - min_x) / 2, (max_y - min_y) / 2]
	
	centroid: Point = _get_centroid(polygon)

	# cover polygon with initial cells
	x: float = min_x
	while x < max_x:
		y: float = min_y
		while y < max_y:
			c: Cell = Cell(x + h, y + h, h, polygon, centroid)
			y += cell_size
			cell_queue.put((c.weight, time.time(), c))
		x += cell_size

	best_cell: Cell = _get_centroid_cell(polygon, centroid)

	bbox_cell: Cell = Cell(min_x + width / 2, min_y + height / 2, 0, polygon, centroid)
	if bbox_cell.min_dist > best_cell.min_dist:
		best_cell = bbox_cell

	# how much closer is an point allowed to be to the border,
	# while having a shorter distance to the centroid
	threshold: float = log10(cell_size) / 3.0

	num_of_probes = cell_queue.qsize()
	while not cell_queue.empty():
		_, __, cell = cell_queue.get()

		# update if either the cell is further from the edge,
		# or if it is sufficiently similary far from the edge,
		# but closer to the centroid
		if (cell.min_dist > best_cell.min_dist
				or (
					cell.center_dist < best_cell.center_dist
					and cell.min_dist > best_cell.min_dist - threshold
				)
			):
			best_cell = cell

			if debug:
				print(f'found best {round(cell.min_dist, 4)};{round(sqrt(cell.center_dist), 4)} after {num_of_probes} probes')

		if cell.max - best_cell.min_dist <= precision:
			continue

		h = cell.h / 2
		c = Cell(cell.x - h, cell.y - h, h, polygon, centroid)
		cell_queue.put((c.weight, time.time(), c))
		c = Cell(cell.x + h, cell.y - h, h, polygon, centroid)
		cell_queue.put((c.weight, time.time(), c))
		c = Cell(cell.x - h, cell.y + h, h, polygon, centroid)
		cell_queue.put((c.weight, time.time(), c))
		c = Cell(cell.x + h, cell.y + h, h, polygon, centroid)
		cell_queue.put((c.weight, time.time(), c))
		num_of_probes += 4

	if debug:
		print(f'num probes: {num_of_probes}')
		print(f'best distance: {best_cell.min_dist}')
	return [best_cell.x, best_cell.y]
