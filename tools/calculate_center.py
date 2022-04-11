"""
From https://github.com/stefda/polylabel,
which is in turn implemented from https://github.com/mapbox/polylabel
"""
from queue import Queue
import math

SQRT2 = math.sqrt(2)


def polylabel(polygon, precision=0.5, debug=False):
	"""
	Computes the pole of inaccessibility coordinate in [x, y] format.
	"""

	# find the bounding box of the outer ring
	minX = maxX = polygon[0][0]
	minY = maxY = polygon[0][1]
	for p in polygon[1:]:
		if p[0] < minX: minX = p[0]
		if p[1] < minY: minY = p[1]
		if p[0] > maxX: maxX = p[0]
		if p[1] > maxY: maxY = p[1]

	width = maxX - minX
	height = maxY - minY
	cellSize = min(width, height)
	h = cellSize / 2.0

	# priority queue of cells in order of their "potential" (max distance to polygon)
	cellQueue = Queue(0)

	if cellSize == 0: return [minX, minY];

	# cover polygon with initial cells
	for x in range(math.floor(minX), math.ceil(maxX - 1), round(cellSize)):
		for y in range(math.floor(minY), math.ceil(maxY - 1), round(cellSize)):
			cellQueue.put(Cell(x + h, y + h, h, polygon))

	# take centroid as the first best guess
	bestCell = getCentroidCell(polygon)

	# special case for rectangular polygons
	bboxCell = Cell(minX + width / 2, minY + height / 2, 0, polygon)
	if bboxCell.d > bestCell.d: bestCell = bboxCell

	numProbes = cellQueue.qsize()

	while not cellQueue.empty():
		# pick the most promising cell from the queue
		cell = cellQueue.get()

		# update the best cell if we found a better one
		if cell.d > bestCell.d:
			bestCell = cell
			if debug: print('found best %d after %d probes' % (round(1e4 * cell.d) / 1e4, numProbes))

		# do not drill down further if there's no chance of a better solution
		if cell.max - bestCell.d <= precision: continue

		# split the cell into four cells
		h = cell.h / 2
		cellQueue.put(Cell(cell.x - h, cell.y - h, h, polygon))
		cellQueue.put(Cell(cell.x + h, cell.y - h, h, polygon))
		cellQueue.put(Cell(cell.x - h, cell.y + h, h, polygon))
		cellQueue.put(Cell(cell.x + h, cell.y + h, h, polygon))
		numProbes += 4

	if debug:
		print('num probes: %d' % numProbes)
		print('best distance: %d' % bestCell.d)

	return [bestCell.x, bestCell.y]


def compareMax(a, b):
	return b.max - a.max


class Cell:
	def __init__(self, x, y, h, polygon):
		self.x = x  # cell center x
		self.y = y  # cell center y
		self.h = h  # half the cell size
		self.d = pointToPolygonDist(x, y, polygon)  # distance from cell center to polygon
		self.max = self.d + self.h * SQRT2  # max distance to polygon within a cell


def pointToPolygonDist(x, y, polygon):
	"""
	Computes the signed distance from point to polygon outline (negative if point is outside).
	"""
	inside = False
	minDistSq = float('inf')

	for a, b in zip(polygon, rotate(polygon)):
		if ((a[1] > y) != (b[1] > y)) and (x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]):
			inside = not inside

		minDistSq = min(minDistSq, getSegDistSq(x, y, a, b))

	return math.sqrt(minDistSq) * (1 if inside else -1)


def getCentroidCell(polygon):
	"""
	Gets the polygon centroid.
	"""
	area = 0
	x = 0
	y = 0

	for a, b in zip(polygon, rotate(polygon)):
		f = a[0] * b[1] - b[0] * a[1]
		x += (a[0] + b[0]) * f
		y += (a[1] + b[1]) * f
		area += f * 3

	if area == 0:
		return Cell(polygon[0][0], polygon[0][1], 0, polygon)

	return Cell(x / area, y / area, 0, polygon)


def getSegDistSq(px, py, a, b):
	"""
	Gets the squared distance from a point to a segment.
	"""
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


def rotate(l):
	return l[-1:] + l[:-1]
