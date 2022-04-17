'use strict';

/**
 * Minified by jsDelivr using Terser v5.10.0.
 * Original file: /npm/tinyqueue@2.0.3/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
class TinyQueue{constructor(t=[],h=defaultCompare){if(this.data=t,this.length=this.data.length,this.compare=h,this.length>0)for(let t=(this.length>>1)-1;t>=0;t--)this._down(t)}push(t){this.data.push(t),this.length++,this._up(this.length-1)}pop(){if(0===this.length)return;const t=this.data[0],h=this.data.pop();return this.length--,this.length>0&&(this.data[0]=h,this._down(0)),t}peek(){return this.data[0]}_up(t){const{data:h,compare:s}=this,e=h[t];for(;t>0;){const a=t-1>>1,i=h[a];if(s(e,i)>=0)break;h[t]=i,t=a}h[t]=e}_down(t){const{data:h,compare:s}=this,e=this.length>>1,a=h[t];for(;t<e;){let e=1+(t<<1),i=h[e];const n=e+1;if(n<this.length&&s(h[n],i)<0&&(e=n,i=h[n]),s(i,a)>=0)break;h[t]=i,t=e}h[t]=a}}function defaultCompare(t,h){return t<h?-1:t>h?1:0}

function polylabel(polygon, precision, debug) {
	precision = precision || 0.5;

	// find the bounding box of the outer ring
	var minX, minY, maxX, maxY;
	for (var i = 0; i < polygon.length; i++) {
		var p = polygon[i];
		if (!i || p[0] < minX) minX = p[0];
		if (!i || p[1] < minY) minY = p[1];
		if (!i || p[0] > maxX) maxX = p[0];
		if (!i || p[1] > maxY) maxY = p[1];
	}

	var width = maxX - minX;
	var height = maxY - minY;
	var cellSize = Math.min(width, height);
	var h = cellSize / 2;

	if (cellSize === 0) {
		var degeneratePoleOfInaccessibility = [minX, minY];
		degeneratePoleOfInaccessibility.distance = 0;
		return degeneratePoleOfInaccessibility;
	}

	// a priority queue of cells in order of their "potential" (max distance to polygon)
	var cellQueue = new TinyQueue(undefined, compareMax);

	let centroid = getCentroid(polygon);

	// cover polygon with initial cells
	for (var x = minX; x < maxX; x += cellSize) {
		for (var y = minY; y < maxY; y += cellSize) {
			cellQueue.push(new Cell(x + h, y + h, h, polygon, centroid));
		}
	}

	// take centroid as the first best guess
	var bestCell = getCentroidCell(centroid, polygon);

	// second guess: bounding box centroid
	var bboxCell = new Cell(minX + width / 2, minY + height / 2, 0, polygon, centroid);
	if (bboxCell.d > bestCell.d) bestCell = bboxCell;

	var numProbes = cellQueue.length;
	let threshold = Math.log10(cellSize) / 3.0

	while (cellQueue.length) {
		// pick the most promising cell from the queue
		var cell = cellQueue.pop();

		// update the best cell if we found a better one
		if (cell.d > bestCell.d || (
			cell.centerDist < bestCell.centerDist &&
			cell.d > bestCell.d - threshold
		)) {
			bestCell = cell;
			if (debug) console.log('found best %f after %d probes', Math.round(1e4 * cell.d) / 1e4, numProbes);
		}

		// do not drill down further if there's no chance of a better solution
		if (cell.max - bestCell.d <= precision) continue;

		// split the cell into four cells
		h = cell.h / 2;
		cellQueue.push(new Cell(cell.x - h, cell.y - h, h, polygon, centroid));
		cellQueue.push(new Cell(cell.x + h, cell.y - h, h, polygon, centroid));
		cellQueue.push(new Cell(cell.x - h, cell.y + h, h, polygon, centroid));
		cellQueue.push(new Cell(cell.x + h, cell.y + h, h, polygon, centroid));
		numProbes += 4;
	}

	if (debug) {
		console.log('num probes: ' + numProbes);
		console.log('best distance: ' + bestCell.d);
	}

	var poleOfInaccessibility = [bestCell.x, bestCell.y];
	poleOfInaccessibility.distance = bestCell.d;
	return poleOfInaccessibility;
}

function compareMax(a, b) {
	return b.weight - a.weight;
}

function Cell(x, y, h, polygon, centroid) {
	this.x = x; // cell center x
	this.y = y; // cell center y
	this.h = h; // half the cell size
	this.d = pointToPolygonDist(x, y, polygon); // distance from cell center to polygon
	this.centerDist = (centroid[0] - x) ** 2 + (centroid[1] - y) ** 2
	this.max = this.d + this.h * Math.SQRT2; // max distance to polygon within a cell
	this.weight = -this.centerDist - this.max
}

// signed distance from point to polygon outline (negative if point is outside)
function pointToPolygonDist(x, y, polygon) {
	var inside = false;
	var minDistSq = Infinity;

	for (var i = 0, len = polygon.length, j = len - 1; i < len; j = i++) {
		var a = polygon[i];
		var b = polygon[j];

		if ((a[1] > y !== b[1] > y) &&
			(x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) inside = !inside;

		minDistSq = Math.min(minDistSq, getSegDistSq(x, y, a, b));
	}

	return minDistSq === 0 ? 0 : (inside ? 1 : -1) * Math.sqrt(minDistSq);
}

// get polygon centroid
function getCentroid(polygon) {
	var area = 0;
	var x = 0;
	var y = 0;

	for (var i = 0, len = polygon.length, j = len - 1; i < len; j = i++) {
		var a = polygon[i];
		var b = polygon[j];
		var f = a[0] * b[1] - b[0] * a[1];
		x += (a[0] + b[0]) * f;
		y += (a[1] + b[1]) * f;
		area += f * 3;
	}
	if (area === 0) return [polygon[0][0], polygon[0][1]];
	return [x / area, y / area];
}

function getCentroidCell(centroid, polygon) {
	return new Cell(centroid[0], centroid[1], 0, polygon, centroid);
}

// get squared distance from a point to a segment
function getSegDistSq(px, py, a, b) {

	var x = a[0];
	var y = a[1];
	var dx = b[0] - x;
	var dy = b[1] - y;

	if (dx !== 0 || dy !== 0) {

		var t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);

		if (t > 1) {
			x = b[0];
			y = b[1];

		} else if (t > 0) {
			x += dx * t;
			y += dy * t;
		}
	}

	dx = px - x;
	dy = py - y;

	return dx * dx + dy * dy;
}
