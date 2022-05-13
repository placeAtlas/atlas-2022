/*
	========================================================================
	The 2022 r/place Atlas

	An atlas of Reddit's 2022 r/place, with information to each
	artwork	of the canvas provided by the community.

	Copyright (c) 2017 Roland Rytz <roland@draemm.li>
	Copyright (c) 2022 Place Atlas contributors

	Licensed under the GNU Affero General Public License Version 3
	https://place-atlas.stefanocoding.me/license.txt
	========================================================================
*/

let areasSum = 0
const areas = []

for (let q = 0; q < atlas.length; q++) {

	const path = atlas[q].path

	let area = 0,
		i,
		j,
		point1,
		point2

	for (i = 0, j = path.length - 1; i < path.length; j = i, i++) {
		point1 = path[i]
		point2 = path[j]
		area += point1[0] * point2[1]
		area -= point1[1] * point2[0]
	}

	area = Math.abs(area / 2)

	areasSum += area
	areas.push(area)

	atlas[q].area = area

}

areas.sort(function (a, b) {
	if (a < b) {
		return -1
	}
	if (a > b) {
		return 1
	}
	// a must be equal to b
	return 0
})

atlas.sort(function (a, b) {
	if (a.area < b.area) {
		return -1
	}
	if (a.area > b.area) {
		return 1
	}
	// a must be equal to b
	return 0
})

const el = document.createElement("canvas")
el.style.position = "absolute"
el.style.top = "0px"
el.style.zIndex = "10000"
const ctx = el.getContext("2d")
el.width = 1600
el.height = 500
const steps = 150
const max = 1500

let largerThanMax = 0

for (const i in areas) {
	if (areas[i] > max) {
		largerThanMax++
	}
}

console.info("There are " + largerThanMax + " entries larger than " + max + ", accounting for " + (largerThanMax / areas.length * 100) + "% of all entries.")
console.info("The largest entry has an area of " + areas[areas.length - 1] + " pixels.")

const counts = [0]
const brackets = [max / steps]

let bracket = 0

let mostCounts = 0

for (const i in areas) {
	if (areas[i] > (bracket + 1) * (max / steps)) {
		mostCounts = Math.max(mostCounts, counts[bracket])
		bracket++
		if (bracket >= steps) {
			break
		}
		counts[bracket] = 0
		brackets[bracket] = (bracket + 1) * (max / steps)
	}
	counts[bracket]++
}
//console.log(counts)
//console.log(brackets)
//console.log(mostCounts)

ctx.fillStyle = "#FFFFFF"
ctx.fillRect(0, 0, el.width, el.height)
ctx.strokeStyle = "#F5F5F5"

ctx.fillStyle = "#333333"
ctx.font = "15px sans"
ctx.textAlign = "right"
ctx.textBaseline = "middle"

let linesDistance = 1

for (let i = 0; i <= Math.ceil((mostCounts / linesDistance) / 5) * 5; i++) {
	ctx.beginPath()
	ctx.moveTo(
		50
		, ~~(el.height - 50 - i * (linesDistance / mostCounts) * (el.height - 100)) + 0.5
	)
	ctx.lineTo(
		el.width - 25
		, ~~(el.height - 50 - i * (linesDistance / mostCounts) * (el.height - 100)) + 0.5
	)
	ctx.stroke()
}

ctx.strokeStyle = "#333333"
linesDistance = 5

for (let i = 0; i <= Math.ceil(mostCounts / linesDistance); i++) {
	ctx.beginPath()
	ctx.moveTo(
		50
		, ~~(el.height - 50 - i * (linesDistance / mostCounts) * (el.height - 100)) + 0.5
	)
	ctx.lineTo(
		el.width - 25
		, ~~(el.height - 50 - i * (linesDistance / mostCounts) * (el.height - 100)) + 0.5
	)
	ctx.stroke()

	ctx.fillText(
		i * linesDistance
		, 40
		, ~~(el.height - 50 - i * (linesDistance / mostCounts) * (el.height - 100)) + 0.5
	)
}

const skip = 2

ctx.textAlign = "center"
ctx.textBaseline = "hanging"
ctx.font = "10px sans"

let a = 0
for (let i = 0; i <= counts.length; i++) {
	if (i % skip == 0) {
		let y = 0
		if (a % 2 == 0) {
			y = ~~(el.height - 30) + 0.5
		} else {
			y = ~~(el.height - 45) + 0.5
		}
		a++
		ctx.beginPath()
		ctx.moveTo(
			~~(((i) / steps) * (el.width - 125) + 75) + 0.5
			, ~~(el.height - 50) + 0.5
		)
		ctx.lineTo(
			~~(((i) / steps) * (el.width - 125) + 75) + 0.5
			, y
		)
		ctx.stroke()

		ctx.fillText(
			(i) * (max / steps)
			, ~~(((i) / steps) * (el.width - 125) + 75) - 0.5
			, y + 5
		)
	}
}

ctx.fillStyle = "#FF0000"
ctx.strokeStyle = "#CC0000"

for (let i = 0; i < counts.length; i++) {
	if (i % 2 == 0) {
		ctx.fillStyle = "#FF0000"
	} else {
		ctx.fillStyle = "#DD0000"
	}

	ctx.fillRect(
		~~((i / steps) * (el.width - 125) + 75)
		, el.height - 50
		, Math.ceil(1 / steps * (el.width - 125))
		, ~~(-(counts[i] / mostCounts) * (el.height - 100))
	)

	/*ctx.beginPath()
	ctx.moveTo(
		 ~~((i/steps)*(el.width-125)+75)+0.5
		,~~(el.height - 50)
	)
	ctx.lineTo(
		 ~~((i/steps)*(el.width-125)+75)+0.5
		,~~(el.height-(counts[i]/mostCounts)*(el.height-100))-50+0.5
	)
	ctx.lineTo(
		 ~~(((i+1)/steps)*(el.width-125)+75)+0.5
		,~~(el.height-(counts[i]/mostCounts)*(el.height-100))-50+0.5
	)
	ctx.lineTo(
		 ~~(((i+1)/steps)*(el.width-125)+75)+0.5
		,~~(el.height - 50)
	)
	ctx.stroke();*/
}

document.getElementById("wrapper").appendChild(el)

//console.log(areas)

console.info("Median area: " + areas[~~(areas.length / 2)])

console.info("Average area: " + (areasSum / atlas.length))

const topCount = 50
console.info("The " + topCount + " largest entries:")

let outstring = ""

for (let i = 0; i < topCount; i++) {
	outstring += ((i + 1) + "|[" + atlas[atlas.length - i - 1].name + "](http://place-atlas.stefanocoding.me/?id=" + atlas[atlas.length - i - 1].id + ")|" + ~~atlas[atlas.length - i - 1].area + "|" + Math.round(atlas[atlas.length - i - 1].area / 100) / 100 + "%\n")
}

console.info(outstring)

atlas.sort(function (a, b) {
	if (a.center[0] < b.center[0]) {
		return -1
	}
	if (a.center[0] > b.center[0]) {
		return 1
	}
	// a must be equal to b
	return 0
})

console.info("Median x: " + atlas[~~(atlas.length / 2)].center[0])

atlas.sort(function (a, b) {
	if (a.center[1] < b.center[1]) {
		return -1
	}
	if (a.center[1] > b.center[1]) {
		return 1
	}
	// a must be equal to b
	return 0
})

console.info("Median y: " + atlas[~~(atlas.length / 2)].center[1])






















